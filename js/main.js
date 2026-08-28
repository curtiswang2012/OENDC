/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Master Game Controller, Game Loop, State Machine, and UI Manager
 */

import { LightingEngine } from './lighting.js';
import { ParticleEngine } from './particles.js';
import { Player, FORMS } from './player.js';
import { Companion, COMPANION_CLASSES } from './companions.js';
import { Enemy, ENEMY_TYPES } from './enemies.js';
import { BossGaruka, BOSS_CONFIGS } from './boss.js';
import { DungeonMap, LootDrop, MAP_ZONES, PILLAR_TYPES, DUNGEON_AFFIXES, ROOM_TYPES } from './dungeon.js';
import { CitadelSystem, FACILITIES_CATALOG } from './citadel.js';
import { AncestralForge } from './gacha.js';
import { ArsenalSanctum } from './arsenal.js';
import { TALENT_TREE_DATA } from './weapons.js';
import { SaveSystem } from './storage.js';
import { audio } from './audio.js';
import { minimap } from './minimap.js';
import { accountSystem, AVATAR_PRESETS } from './account.js';
import { networkEngine } from './network.js';
import { chatSystem } from './chat.js';
import { diagnostics } from './diagnostics.js';
import { relicSystem, RELIC_RARITY, RELICS_DATABASE } from './relics.js';

export const GAME_STATES = {
  HUB: 'hub',
  EXPEDITION: 'expedition',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
};

class EvernightGame {
  constructor() {
    this.state = GAME_STATES.HUB;
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.selectedZoneId = 'barren_wastes';
    this.dungeonTier = 1;
    this.dungeonSeed = 778899;
    this.dungeonAffixes = ['blood_boil', 'void_strike'];
    this.runStartTime = 0;
    this.affixVoidTimer = 0;

    // Systems
    this.lighting = new LightingEngine();
    this.particles = new ParticleEngine();
    this.player = new Player(400, 300);
    this.companion = new Companion(COMPANION_CLASSES[0]);
    this.boss = new BossGaruka(1600, 1100);
    this.dungeon = new DungeonMap();
    this.citadel = new CitadelSystem();
    this.arsenal = new ArsenalSanctum();
    this.forge = new AncestralForge();
    this.relicSystem = relicSystem;
    this.activeShrine = null;
    this.activeCursedChest = null;
    this.expeditionMode = 'standard'; // 'standard' | 'tower' | 'siege'
    this.currentTowerFloor = 1;
    this.towerSeed = 12345;
    this.mannedTurret = null;
    this.currentSiegeWave = 1;
    this.maxSiegeWaves = 5;
    this.siegeWaveTransitionTimer = 0;
    this.timeDilationTimer = 0;
    this.timeDilationFactor = 1.0;
    this.hitstopTimer = 0;

    // World Entities
    this.enemies = [];
    this.enemyProjectiles = [];

    // Camera
    this.cameraX = 0;
    this.cameraY = 0;

    // Input
    this.inputState = {
      keys: {},
      mouse: { x: 0, y: 0, isDown: false, rightDown: false, worldX: 0, worldY: 0 }
    };

    // Expedition Run Stats
    this.runKills = 0;
    this.runExp = 0;
    this.runLoot = { blackIron: 0, rations: 0, lumenOil: 0, starlightShards: 0 };

    this.lastTime = performance.now();
  }

  init() {
    window.gameInstance = this;
    
    // 1. Initialize Global Diagnostics & Self-Healing Guard
    diagnostics.setupGlobalErrorGuards(this);
    const integrityReport = diagnostics.runFullIntegrityCheck(this);
    console.log(`🛡️ [全系統自動自檢] 完成 ${integrityReport.checksCount} 項指標檢測，自動修復異常數: ${integrityReport.fixedIssues.length}`);

    chatSystem.init();

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // Check Account Login
    if (!accountSystem.isLoggedIn()) {
      const allAccounts = accountSystem.getAccounts();
      const firstAcc = Object.values(allAccounts)[0];
      if (firstAcc) {
        accountSystem.loginDirect(firstAcc.username);
      } else {
        accountSystem.loginAsGuest();
      }
    }

    // Load Saved Game
    SaveSystem.load(this.player, this.companion, this.citadel, this.arsenal);

    this.setupEventListeners();
    this.setupUIHandlers();
    this.setupNetworkCallbacks();
    minimap.init('minimap-canvas');
    this.updateHUD();
    this.updateCitadelModal();
    this.updateAccountModal();

    // Start in Citadel Hub screen
    this.openModal('modal-citadel');

    // Game Animation Loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.lighting.resize(window.innerWidth, window.innerHeight);
  }

  startExpedition(zoneId = null, tier = null, seed = null, affixes = null) {
    if (zoneId) this.selectedZoneId = zoneId;
    if (tier !== null) this.dungeonTier = tier;
    if (seed !== null) this.dungeonSeed = seed;
    if (affixes !== null) this.dungeonAffixes = affixes;

    this.state = GAME_STATES.EXPEDITION;
    this.closeAllModals();
    this.expeditionMode = 'standard';
    this.runKills = 0;
    this.runExp = 0;
    this.runStartTime = Date.now();
    this.affixVoidTimer = 0;
    this.runLoot = { blackIron: 0, rations: 0, lumenOil: 0, starlightShards: 0 };

    // 1. Generate Procedural Dungeon
    this.dungeon.generateProceduralDungeon(
      this.selectedZoneId,
      this.dungeonTier,
      this.dungeonSeed,
      this.dungeonAffixes
    );

    // 2. Position Player & Companion in Entrance Room
    this.player.reset(this.dungeon.entrancePos.x, this.dungeon.entrancePos.y);
    this.companion.x = this.dungeon.entrancePos.x - 50;
    this.companion.y = this.dungeon.entrancePos.y;

    // 3. Position and scale Boss in Boss Sanctum
    const bossId = this.dungeon.currentZone.bossId || 'garuka';
    this.boss.reset(this.dungeon.bossPos.x, this.dungeon.bossPos.y, bossId);
    this.boss.isActive = false;

    const tierMultiplier = 1 + (this.dungeonTier - 1) * 0.35;
    this.boss.maxHp = Math.round(this.boss.config.maxHp * tierMultiplier);
    if (this.dungeonAffixes.includes('eclipse_frenzy')) {
      this.boss.maxHp = Math.round(this.boss.maxHp * 1.4);
    }
    this.boss.hp = this.boss.maxHp;

    // 4. Spawn Monsters in Rooms from spawn points
    this.enemies = [];
    this.enemyProjectiles = [];

    const hpMultiplier = 1 + (this.dungeonTier - 1) * 0.4;
    const atkMultiplier = 1 + (this.dungeonTier - 1) * 0.25;

    for (const sp of this.dungeon.spawnPoints) {
      let eType = ENEMY_TYPES.CRAWLER;
      if (sp.type === 'stalker') eType = ENEMY_TYPES.STALKER;
      else if (sp.type === 'knight') eType = ENEMY_TYPES.KNIGHT;
      else if (sp.type === 'caster') eType = ENEMY_TYPES.CASTER;

      const en = new Enemy(sp.x, sp.y, eType);
      en.maxHp = Math.round(en.maxHp * hpMultiplier);
      en.hp = en.maxHp;
      en.damage = Math.round(en.damage * atkMultiplier);
      if (sp.isElite) {
        en.maxHp = Math.round(en.maxHp * 2.0);
        en.hp = en.maxHp;
        en.radius = Math.round(en.radius * 1.25);
        en.isFrenzied = true;
      }
      this.enemies.push(en);
    }

    // 5. Initialize AI Mercenaries if in multiplayer room
    this.aiTeammates = new Map();
    if (networkEngine.currentRoom && networkEngine.currentRoom.players) {
      const aiSlots = networkEngine.currentRoom.players.filter(p => p.isAi);
      aiSlots.forEach((p, idx) => {
        const offsetAngle = (idx + 1) * (Math.PI * 2 / (aiSlots.length + 1));
        const spawnX = this.dungeon.entrancePos.x + Math.cos(offsetAngle) * 55;
        const spawnY = this.dungeon.entrancePos.y + Math.sin(offsetAngle) * 55;
        const aiData = p.aiData || AI_MERCENARIES[idx % AI_MERCENARIES.length];
        this.aiTeammates.set(p.peerId, {
          peerId: p.peerId,
          user: p.user,
          data: aiData,
          x: spawnX,
          y: spawnY,
          vx: 0,
          vy: 0,
          hp: aiData.hp || 1000,
          maxHp: aiData.maxHp || 1000,
          form: aiData.form || FORMS.RADIANT,
          weaponId: aiData.weaponId || 'ssr_dawnbreaker',
          facingAngle: 0,
          attackCooldown: 0.5 + Math.random() * 0.5,
          skillCooldown: 3 + Math.random() * 2,
          attackTimer: 0,
          isAttacking: false,
          isDodging: false
        });
      });
    }

    // 6. Reset and update Relics System for new expedition
    this.relicSystem.reset();
    this.updateRelicsHUD();

    audio.setMusicTrack('expedition');
    this.showToast(`進入秘境副本：${this.dungeon.currentZone.name} (階級 ${this.dungeonTier} · 種子 #${this.dungeonSeed})`, 'toast-gold');
  }

  // --- TOWER EXPEDITION SYSTEM (永夜無盡天梯) ---
  startTowerExpedition(startFloor = 1) {
    this.closeAllModals();
    this.state = GAME_STATES.EXPEDITION;
    this.expeditionMode = 'tower';
    this.currentTowerFloor = startFloor;
    this.runStartTime = Date.now();
    this.runKills = 0;
    this.runExp = 0;
    this.affixVoidTimer = 0;
    this.runLoot = { blackIron: 0, rations: 0, lumenOil: 0, starlightShards: 0 };

    this.setupTowerFloor(this.currentTowerFloor);

    // Reset and update Relics System for new tower run
    this.relicSystem.reset();
    this.updateRelicsHUD();

    audio.setMusicTrack('expedition');
    this.showToast(`🗼 踏入永夜天梯：第 ${this.currentTowerFloor} 層深淵！`, 'toast-gold');
  }

  setupTowerFloor(floor) {
    this.dungeon.generateTowerFloor(floor, this.towerSeed + floor * 999);

    // Position Player & Companion
    this.player.reset(this.dungeon.entrancePos.x, this.dungeon.entrancePos.y);
    this.companion.x = this.dungeon.entrancePos.x - 50;
    this.companion.y = this.dungeon.entrancePos.y;

    // Reset Projectiles & Entities
    this.enemyProjectiles = [];
    this.enemies = [];

    // Boss vs Wave floor setup
    if (floor % 10 === 0) {
      // Pick World Boss
      let bossId = 'garuka';
      if (floor === 10) bossId = 'garuka';
      else if (floor === 20) bossId = 'varn';
      else if (floor === 30) bossId = 'silva';
      else if (floor === 40) bossId = 'othello';
      else if (floor === 50) bossId = 'solaris';
      else if (floor === 60) bossId = 'nyxara';
      else if (floor === 70) bossId = 'varn';
      else if (floor === 80) bossId = 'silva';
      else if (floor === 90) bossId = 'solaris';
      else if (floor === 100) bossId = 'primordial';

      this.boss.reset(this.dungeon.bossPos.x, this.dungeon.bossPos.y, bossId);
      const floorMultiplier = 1 + (floor / 10) * 0.45;
      this.boss.maxHp = Math.round(this.boss.config.maxHp * floorMultiplier);
      this.boss.hp = this.boss.maxHp;
      this.boss.config.attackPower = Math.round(this.boss.config.attackPower * (1 + (floor / 20) * 0.3));
      this.boss.isActive = true;
      audio.setMusicTrack('boss');
      audio.playBossRoar();
      this.showToast(`💀 世界首領滅世降臨：${this.boss.config.name}！`, 'toast-crimson');
    } else {
      this.boss.isActive = false;
      this.boss.isDead = true;

      // Spawn Floor Monsters
      const hpMultiplier = 1 + (floor - 1) * 0.08;
      const atkMultiplier = 1 + (floor - 1) * 0.05;

      for (const sp of this.dungeon.spawnPoints) {
        let eType = ENEMY_TYPES.CRAWLER;
        if (sp.type === 'stalker') eType = ENEMY_TYPES.STALKER;
        else if (sp.type === 'knight') eType = ENEMY_TYPES.KNIGHT;
        else if (sp.type === 'caster') eType = ENEMY_TYPES.CASTER;

        const en = new Enemy(sp.x, sp.y, eType);
        en.maxHp = Math.round(en.maxHp * hpMultiplier);
        en.hp = en.maxHp;
        en.damage = Math.round(en.damage * atkMultiplier);
        if (sp.isElite) {
          en.maxHp = Math.round(en.maxHp * 2.2);
          en.hp = en.maxHp;
          en.isFrenzied = true;
        }
        this.enemies.push(en);
      }
    }
  }

  advanceToNextTowerFloor() {
    this.currentTowerFloor++;
    const isMilestone = this.citadel.unlockTowerFloor(this.currentTowerFloor);
    SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);

    // Heals player and replenishes fuel
    this.player.heal(Math.round(this.player.maxHp * 0.35), this.particles);
    this.player.lanternFuel = Math.min(this.player.maxLanternFuel, this.player.lanternFuel + 30);
    this.particles.emitShockwaveRing(this.player.x, this.player.y, 250, '#38bdf8', 0.8);
    this.particles.addFloatingText(this.player.x, this.player.y - 25, `✨ 登上第 ${this.currentTowerFloor} 層！生命與燃油已恢復！`, 'heal');

    audio.playLevelUp();
    this.setupTowerFloor(this.currentTowerFloor);

    if (isMilestone && this.currentTowerFloor % 10 === 0) {
      this.showToast(`🏆 突破天梯第 ${this.currentTowerFloor} 層滅世之階！已永久解鎖新檢查點！`, 'toast-gold');
    } else {
      this.showToast(`🌀 成功登上天梯第 ${this.currentTowerFloor} 層！`, 'toast-gold');
    }
  }

  // --- CITADEL SIEGE DEFENSE BATTLE (血月守城戰系統) ---
  startSiegeExpedition() {
    this.closeAllModals();
    this.state = GAME_STATES.EXPEDITION;
    this.expeditionMode = 'siege';
    this.currentSiegeWave = 1;
    this.mannedTurret = null;
    this.runStartTime = Date.now();
    this.runKills = 0;
    this.runExp = 0;
    this.affixVoidTimer = 0;
    this.siegeWaveTransitionTimer = 0;
    this.runLoot = { blackIron: 0, rations: 0, lumenOil: 0, starlightShards: 0 };

    this.dungeon.generateCitadelSiegeMap(1, this.citadel.facilities);

    // Position Player & Companion on Ramparts
    this.player.reset(this.dungeon.entrancePos.x, this.dungeon.entrancePos.y);
    this.companion.x = this.dungeon.entrancePos.x - 60;
    this.companion.y = this.dungeon.entrancePos.y;

    // Reset Relics
    this.relicSystem.reset();
    this.updateRelicsHUD();

    // Spawn Wave 1
    this.setupSiegeWave(1);

    audio.setMusicTrack('boss');
    audio.playBossRoar();
    this.showToast('🩸 血月凌空！深淵魔潮已向堡壘要塞發起第一波衝擊！', 'toast-crimson');
  }

  setupSiegeWave(wave) {
    this.enemyProjectiles = [];
    this.enemies = [];

    const rng = new PRNG(Date.now() + wave * 333);
    const hpMult = 1 + (wave - 1) * 0.35;
    const atkMult = 1 + (wave - 1) * 0.2;

    const spawnBreaches = [
      { x: 450, y: 250 },   // West Breach
      { x: 1000, y: 200 },  // North Main Breach
      { x: 1550, y: 250 }   // East Breach
    ];

    if (wave === 5) {
      // Final Boss Wave: Spawn Primordial / Blood Commander Boss + Escorts
      this.boss.reset(1000, 350, 'primordial');
      this.boss.maxHp = Math.round(this.boss.config.maxHp * 1.5);
      this.boss.hp = this.boss.maxHp;
      this.boss.isActive = true;
      this.showToast('👑 血月終極統帥：永夜原初至尊·創世裁決者 降臨戰場！', 'toast-crimson');

      // 6 Elite Guards
      for (let i = 0; i < 6; i++) {
        const bp = spawnBreaches[i % spawnBreaches.length];
        const en = new Enemy(bp.x + rng.rangeInt(-80, 80), bp.y + rng.rangeInt(-50, 50), ENEMY_TYPES.KNIGHT);
        en.maxHp = Math.round(en.maxHp * 2.5);
        en.hp = en.maxHp;
        en.isFrenzied = true;
        this.enemies.push(en);
      }
    } else {
      this.boss.isActive = false;
      this.boss.isDead = true;

      const monsterCount = 8 + wave * 4;
      for (let i = 0; i < monsterCount; i++) {
        const bp = spawnBreaches[i % spawnBreaches.length];
        let mType = ENEMY_TYPES.CRAWLER;
        if (wave >= 2 && i % 3 === 0) mType = ENEMY_TYPES.STALKER;
        if (wave >= 3 && i % 4 === 0) mType = ENEMY_TYPES.CASTER;
        if (wave >= 4 && i % 4 === 1) mType = ENEMY_TYPES.KNIGHT;

        const en = new Enemy(bp.x + rng.rangeInt(-120, 120), bp.y + rng.rangeInt(-60, 60), mType);
        en.maxHp = Math.round(en.maxHp * hpMult);
        en.hp = en.maxHp;
        en.damage = Math.round(en.damage * atkMult);
        if (rng.next() < 0.2 + wave * 0.1) {
          en.isElite = true;
          en.maxHp = Math.round(en.maxHp * 1.8);
          en.hp = en.maxHp;
        }
        this.enemies.push(en);
      }
    }
  }

  advanceToNextSiegeWave() {
    this.currentSiegeWave++;
    this.citadel.recordSiegeWave(this.currentSiegeWave);
    SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);

    // Repair Core + Restore Player
    if (this.dungeon.citadelCore) {
      this.dungeon.citadelCore.repair(Math.round(this.dungeon.citadelCore.maxHp * 0.25), this.particles);
    }
    this.player.heal(Math.round(this.player.maxHp * 0.4), this.particles);
    this.player.lanternFuel = Math.min(this.player.maxLanternFuel, this.player.lanternFuel + 40);

    audio.playLevelUp();
    this.particles.emitShockwaveRing(1000, 1550, 350, '#38bdf8', 1.0);
    this.showToast(`🛡️ 成功擊退第 ${this.currentSiegeWave - 1} 波魔潮！聖核已修復，第 ${this.currentSiegeWave} 波進攻開始！`, 'toast-gold');

    this.setupSiegeWave(this.currentSiegeWave);
  }

  triggerFormShift() {
    const shiftRes = this.player.toggleForm(this.particles);
    if (shiftRes && shiftRes.isCataclysm) {
      for (const en of this.enemies) {
        if (en.isDead) continue;
        if (Math.hypot(en.x - shiftRes.x, en.y - shiftRes.y) < shiftRes.radius) {
          en.takeDamage(shiftRes.damage, true, 1.5, this.particles, this.player.form === FORMS.RADIANT ? 'radiant' : 'shadow');
          en.stun(2.0, this.particles);
        }
      }
      if (this.boss.isActive && !this.boss.isDead && Math.hypot(this.boss.x - shiftRes.x, this.boss.y - shiftRes.y) < shiftRes.radius) {
        this.boss.takeDamage(shiftRes.damage, true, 1.5, this.particles, this.player.form === FORMS.RADIANT ? 'radiant' : 'shadow');
      }
    }

    // Check if any nearby marked enemies should be detonated by form shift resonance
    for (const en of this.enemies) {
      if (en.isDead) continue;
      if (Math.hypot(en.x - this.player.x, en.y - this.player.y) < 220) {
        if (en.solarStacks > 0 || en.lunarStacks > 0) {
          const burstDmg = Math.round(280 + (en.solarStacks + en.lunarStacks) * 160);
          en.solarStacks = 0;
          en.lunarStacks = 0;
          this.triggerEclipseNovaDetonation(en.x, en.y, burstDmg);
        }
      }
    }

    // Trigger Relic Hook on Form Shift (e.g. Astral Resonance)
    this.relicSystem.onFormShift(this.player, this.enemies, this.boss, this.particles);
  }

  triggerEclipseNovaDetonation(x, y, burstDmg) {
    this.particles.emitElementalBurst(x, y, 180);
    this.particles.addFloatingText(x, y - 30, burstDmg, 'elemental_burst');
    audio.playElementalBurst();

    // Pull nearby enemies into epicenter & chain damage
    for (const en of this.enemies) {
      if (en.isDead) continue;
      const d = Math.hypot(en.x - x, en.y - y);
      if (d < 230) {
        if (d > 10) {
          en.x += ((x - en.x) / d) * 75;
          en.y += ((y - en.y) / d) * 75;
        }
        en.takeDamage(Math.round(burstDmg * 0.45), true, 1.3, this.particles, null);
      }
    }

    if (this.boss.isActive && !this.boss.isDead && Math.hypot(this.boss.x - x, this.boss.y - y) < 230) {
      this.boss.takeDamage(Math.round(burstDmg * 0.65), true, 1.3, this.particles, null);
    }
  }

  setupEventListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.inputState.keys[e.code] = true;
      audio.init();

      if (this.state === GAME_STATES.EXPEDITION) {
        // Shift or Space (when moving) / V: Dodge Roll & Perfect Dodge
        const isMoving = this.inputState.keys['KeyW'] || this.inputState.keys['KeyA'] || this.inputState.keys['KeyS'] || this.inputState.keys['KeyD'] || this.inputState.keys['ArrowUp'] || this.inputState.keys['ArrowDown'] || this.inputState.keys['ArrowLeft'] || this.inputState.keys['ArrowRight'];

        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyV' || (e.code === 'Space' && isMoving)) {
          e.preventDefault();
          const angle = Math.atan2(
            this.inputState.mouse.worldY - this.player.y,
            this.inputState.mouse.worldX - this.player.x
          );
          const dodgeRes = this.player.dodge(angle, this.particles, this.enemies, this.enemyProjectiles);
          if (dodgeRes && dodgeRes.dodged) {
            if (dodgeRes.isPerfect) {
              this.timeDilationTimer = 1.8;
              this.timeDilationFactor = 0.2;
            }
            this.relicSystem.onPlayerDodge(this.player, this.particles);
          }
        } else if (e.code === 'Space' || e.code === 'Tab' || e.code === 'KeyC') {
          // Space (standing) / Tab / C: Form Switch
          e.preventDefault();
          this.triggerFormShift();
        }

        // Q: Skill 1
        if (e.code === 'KeyQ') {
          const res = this.player.triggerSkillQ(this.inputState.mouse.worldX, this.inputState.mouse.worldY, this.particles);
          if (res) {
            if (res.skill === 'solar_flare') {
              this.hitLineEnemies(res.x, res.y, res.angle, res.length, res.width, res.damage, res.critRate, res.critMult);
            } else if (res.skill === 'shadow_blink') {
              this.hitLineEnemies(res.startX, res.startY, Math.atan2(res.endY - res.startY, res.endX - res.startX), 180, 50, res.damage, res.critRate, res.critMult);
            }
          }
        }

        // E: Skill 2
        if (e.code === 'KeyE') {
          const res = this.player.triggerSkillE(this.inputState.mouse.worldX, this.inputState.mouse.worldY, this.particles);
          if (res && res.skill === 'umbral_vortex') {
            let totalDmg = 0;
            for (const en of this.enemies) {
              if (en.isDead) continue;
              if (Math.hypot(en.x - res.x, en.y - res.y) < res.radius) {
                en.takeDamage(res.damage, Math.random() < res.critRate, res.critMult, this.particles);
                totalDmg += res.damage;
              }
            }
            if (this.boss.isActive && !this.boss.isDead && Math.hypot(this.boss.x - res.x, this.boss.y - res.y) < res.radius) {
              this.boss.takeDamage(res.damage, Math.random() < res.critRate, res.critMult, this.particles);
              totalDmg += res.damage;
            }
            if (totalDmg > 0) {
              const heal = Math.round(totalDmg * res.lifestealRate);
              this.player.heal(heal, this.particles);
            }
          }
        }

        // R: Ultimate
        if (e.code === 'KeyR') {
          const res = this.player.triggerSkillR(this.inputState.mouse.worldX, this.inputState.mouse.worldY, this.particles);
          if (res) {
            if (res.skill === 'dawnbreaker_judgment') {
              this.hitLineEnemies(res.x, res.y, res.angle, res.length, res.width, res.damage, res.critRate, res.critMult);
            } else if (res.skill === 'eclipse_execution') {
              // Hits all nearby
              for (const en of this.enemies) {
                if (en.isDead) continue;
                if (Math.hypot(en.x - res.x, en.y - res.y) < res.radius) {
                  en.takeDamage(res.damage * 4, true, res.critMult, this.particles);
                }
              }
              if (this.boss.isActive && !this.boss.isDead && Math.hypot(this.boss.x - res.x, this.boss.y - res.y) < res.radius) {
                this.boss.takeDamage(res.damage * 4, true, res.critMult, this.particles);
              }
            }
          }
        }

        // F: Interact (Turret, Ascent Portal, Shrine, Cursed Chest, Brazier, Chest) / Companion Skill
        if (e.code === 'KeyF') {
          const interactRes = this.dungeon.interactClosest(
            this.player,
            this.particles,
            (shrine) => this.openShrineModal(shrine),
            (cc) => this.startCursedChallenge(cc)
          );
          if (interactRes && interactRes.type === 'turret') {
            if (this.mannedTurret === interactRes.entity) {
              this.mannedTurret = null;
              this.showToast('🚶 已離開城防砲台控制位。', 'toast-cyan');
            } else {
              this.mannedTurret = interactRes.entity;
              this.showToast(`💥 已接管【${this.mannedTurret.name}】！滑鼠左鍵瞄準開砲！按 [F] 離開`, 'toast-gold');
            }
          } else if (interactRes && interactRes.type === 'ascent_portal') {
            this.advanceToNextTowerFloor();
          } else if (!interactRes) {
            // Trigger Companion Active Skill
            this.companion.triggerActiveSkill(this.player, this.dungeon, this.particles);
          }
        }

        // 1: Quick Item (Lumen Oil Flask)
        if (e.code === 'Digit1') {
          if (this.citadel.lumenOil >= 10) {
            this.citadel.lumenOil -= 10;
            this.player.lanternFuel = Math.min(this.player.maxLanternFuel, this.player.lanternFuel + 30);
            this.particles.addFloatingText(this.player.x, this.player.y, '+30 提燈燃油', 'heal');
            audio.playLootPickup();
          }
        }

        // 2: Quick Item (Ration Meal)
        if (e.code === 'Digit2') {
          if (this.citadel.rations >= 10) {
            this.citadel.rations -= 10;
            this.player.heal(300, this.particles);
            audio.playLootPickup();
          }
        }

        // M: Toggle Minimap Expand
        if (e.code === 'KeyM') {
          minimap.toggleExpand();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.inputState.keys[e.code] = false;
    });

    // Mouse
    window.addEventListener('mousemove', (e) => {
      this.inputState.mouse.x = e.clientX;
      this.inputState.mouse.y = e.clientY;
      this.inputState.mouse.worldX = e.clientX + this.cameraX;
      this.inputState.mouse.worldY = e.clientY + this.cameraY;
    });

    window.addEventListener('mousedown', (e) => {
      audio.init();
      if (e.button === 0) {
        this.inputState.mouse.isDown = true;
      } else if (e.button === 2) {
        e.preventDefault();
        this.inputState.mouse.rightDown = true;
        // Right click: Dodge roll & Perfect Dodge
        if (this.state === GAME_STATES.EXPEDITION) {
          const angle = Math.atan2(
            this.inputState.mouse.worldY - this.player.y,
            this.inputState.mouse.worldX - this.player.x
          );
          const dodgeRes = this.player.dodge(angle, this.particles, this.enemies, this.enemyProjectiles);
          if (dodgeRes && dodgeRes.dodged) {
            if (dodgeRes.isPerfect) {
              this.timeDilationTimer = 1.8;
              this.timeDilationFactor = 0.2;
            }
            this.relicSystem.onPlayerDodge(this.player, this.particles);
          }
        }
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.inputState.mouse.isDown = false;
      } else if (e.button === 2) {
        this.inputState.mouse.rightDown = false;
      }
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  setupUIHandlers() {
    // Form Switch on Click
    document.getElementById('hud-form-ring')?.addEventListener('click', () => {
      if (this.state === GAME_STATES.EXPEDITION) {
        this.triggerFormShift();
      }
    });

    document.querySelector('.form-switch-btn')?.addEventListener('click', () => {
      if (this.state === GAME_STATES.EXPEDITION) {
        this.triggerFormShift();
      }
    });

    // Skill Slots on Click
    document.getElementById('slot-q')?.addEventListener('click', () => {
      if (this.state === GAME_STATES.EXPEDITION) {
        const res = this.player.triggerSkillQ(this.inputState.mouse.worldX, this.inputState.mouse.worldY, this.particles);
        if (res) {
          if (res.skill === 'solar_flare') {
            this.hitLineEnemies(res.x, res.y, res.angle, res.length, res.width, res.damage, res.critRate, res.critMult);
          } else if (res.skill === 'shadow_blink') {
            this.hitLineEnemies(res.startX, res.startY, Math.atan2(res.endY - res.startY, res.endX - res.startX), 180, 50, res.damage, res.critRate, res.critMult);
          }
        }
      }
    });

    document.getElementById('slot-e')?.addEventListener('click', () => {
      if (this.state === GAME_STATES.EXPEDITION) {
        const res = this.player.triggerSkillE(this.inputState.mouse.worldX, this.inputState.mouse.worldY, this.particles);
        if (res && res.skill === 'umbral_vortex') {
          let totalDmg = 0;
          for (const en of this.enemies) {
            if (en.isDead) continue;
            if (Math.hypot(en.x - res.x, en.y - res.y) < res.radius) {
              en.takeDamage(res.damage, Math.random() < res.critRate, res.critMult, this.particles);
              totalDmg += res.damage;
            }
          }
          if (this.boss.isActive && !this.boss.isDead && Math.hypot(this.boss.x - res.x, this.boss.y - res.y) < res.radius) {
            this.boss.takeDamage(res.damage, Math.random() < res.critRate, res.critMult, this.particles);
            totalDmg += res.damage;
          }
          if (totalDmg > 0) {
            const heal = Math.round(totalDmg * res.lifestealRate);
            this.player.heal(heal, this.particles);
          }
        }
      }
    });

    document.getElementById('slot-r')?.addEventListener('click', () => {
      if (this.state === GAME_STATES.EXPEDITION) {
        const res = this.player.triggerSkillR(this.inputState.mouse.worldX, this.inputState.mouse.worldY, this.particles);
        if (res) {
          if (res.skill === 'dawnbreaker_judgment') {
            this.hitLineEnemies(res.x, res.y, res.angle, res.length, res.width, res.damage, res.critRate, res.critMult);
          } else if (res.skill === 'eclipse_execution') {
            for (const en of this.enemies) {
              if (en.isDead) continue;
              if (Math.hypot(en.x - res.x, en.y - res.y) < res.radius) {
                en.takeDamage(res.damage * 4, true, res.critMult, this.particles);
              }
            }
            if (this.boss.isActive && !this.boss.isDead && Math.hypot(this.boss.x - res.x, this.boss.y - res.y) < res.radius) {
              this.boss.takeDamage(res.damage * 4, true, res.critMult, this.particles);
            }
          }
        }
      }
    });

    // Quick Item Clicks
    document.getElementById('item-lumen-flask')?.addEventListener('click', () => {
      if (this.citadel.lumenOil >= 10) {
        this.citadel.lumenOil -= 10;
        this.player.lanternFuel = Math.min(this.player.maxLanternFuel, this.player.lanternFuel + 30);
        this.particles.addFloatingText(this.player.x, this.player.y, '+30 提燈燃油', 'heal');
        audio.playLootPickup();
      } else {
        this.showToast('堡壘流明聖油不足！', 'toast-crimson');
      }
    });

    document.getElementById('item-ration-meal')?.addEventListener('click', () => {
      if (this.citadel.rations >= 10) {
        this.citadel.rations -= 10;
        this.player.heal(300, this.particles);
        audio.playLootPickup();
      } else {
        this.showToast('堡壘口糧不足！', 'toast-crimson');
      }
    });

    // Utility Bar Modals
    document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      const icon = document.getElementById('btn-sound-toggle');
      if (icon) icon.innerText = isMuted ? '🔇' : '🔊';
    });

    document.getElementById('btn-account-modal')?.addEventListener('click', () => {
      this.openModal('modal-account');
      if (accountSystem.isLoggedIn()) {
        this.switchAccountTab('profile');
      } else {
        this.switchAccountTab('login');
      }
      this.updateAccountModal();
    });

    document.getElementById('btn-multiplayer-modal')?.addEventListener('click', () => {
      this.openModal('modal-multiplayer');
      this.updateMultiplayerModal();
    });

    document.getElementById('btn-citadel-modal')?.addEventListener('click', () => {
      this.openModal('modal-citadel');
      this.updateCitadelModal();
    });

    document.getElementById('btn-forge-modal')?.addEventListener('click', () => {
      this.openModal('modal-forge');
      this.updateForgeModal();
    });

    document.getElementById('btn-arsenal-modal')?.addEventListener('click', () => {
      this.openModal('modal-arsenal');
      this.updateArsenalModal();
    });

    document.getElementById('btn-companion-modal')?.addEventListener('click', () => {
      this.openModal('modal-companion');
      this.updateCompanionModal();
    });

    // Close buttons for modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
        SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
      });
    });

    // Citadel Tabs & Siege Defense Buttons
    document.getElementById('tab-citadel-overview')?.addEventListener('click', () => {
      this.switchCitadelTab('overview');
    });
    document.getElementById('tab-citadel-facilities')?.addEventListener('click', () => {
      this.switchCitadelTab('facilities');
    });
    document.getElementById('tab-citadel-siege')?.addEventListener('click', () => {
      this.switchCitadelTab('siege');
    });

    document.getElementById('btn-start-siege-defense')?.addEventListener('click', () => {
      this.startSiegeExpedition();
    });

    // Start Expedition Button in Citadel
    document.getElementById('btn-start-expedition')?.addEventListener('click', () => {
      this.startExpedition();
    });

    // Tower (Abyssal Spire) Buttons
    document.getElementById('btn-tower-modal')?.addEventListener('click', () => {
      this.openTowerModal();
    });

    document.getElementById('btn-start-tower-expedition')?.addEventListener('click', () => {
      const select = document.getElementById('select-tower-start-floor');
      const startFloor = select ? parseInt(select.value, 10) : 1;
      this.startTowerExpedition(startFloor);
    });

    document.getElementById('select-tower-start-floor')?.addEventListener('change', (e) => {
      this.updateTowerPreview(parseInt(e.target.value, 10));
    });

    // Forge Pull 1x & 10x
    document.getElementById('btn-forge-pull-1')?.addEventListener('click', () => {
      const res = this.forge.pullOnce(this.citadel, this.player);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showGachaResults([res.item]);
        this.updateForgeModal();
      }
    });

    document.getElementById('btn-forge-pull-10')?.addEventListener('click', () => {
      const res = this.forge.pullTen(this.citadel, this.player);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showGachaResults(res.results);
        this.updateForgeModal();
      }
    });

    document.getElementById('btn-close-gacha-stage')?.addEventListener('click', () => {
      document.getElementById('gacha-result-stage').classList.remove('active');
    });

    // Arsenal Equip, Upgrade & Refine Buttons
    document.getElementById('btn-equip-weapon')?.addEventListener('click', () => {
      this.player.equippedWeapon = this.arsenal.selectedWeapon;
      this.showToast(`已裝備武裝：${this.arsenal.selectedWeapon.name.split('·')[0]}`, 'toast-gold');
      this.updateArsenalModal();
      SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
    });

    document.getElementById('btn-upgrade-weapon')?.addEventListener('click', () => {
      const res = this.arsenal.upgradeWeapon(this.player, this.citadel, this.arsenal.selectedWeapon);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`【${res.weapon.name.split('·')[0]}】升級至 Lv.${res.newLevel}！攻擊力提升至 ${res.newDamage}`, 'toast-cyan');
        this.updateArsenalModal();
        this.updateCitadelModal();
        SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
      }
    });

    document.getElementById('btn-refine-weapon')?.addEventListener('click', () => {
      const res = this.arsenal.refineWeapon(this.player, this.citadel, this.arsenal.selectedWeapon);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`【${res.weapon.name.split('·')[0]}】精煉至 階級 ${res.newRefinement}！攻擊力與被動大幅提升！`, 'toast-gold');
        this.updateArsenalModal();
        this.updateCitadelModal();
        SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
      }
    });

    // Minimap Expand/Collapse
    document.getElementById('btn-toggle-minimap')?.addEventListener('click', () => {
      minimap.toggleExpand();
    });
    document.getElementById('minimap-canvas')?.addEventListener('click', () => {
      minimap.toggleExpand();
    });

    // Account Tabs & Actions
    document.getElementById('tab-account-profile')?.addEventListener('click', () => {
      this.switchAccountTab('profile');
    });
    document.getElementById('tab-account-login')?.addEventListener('click', () => {
      this.switchAccountTab('login');
    });
    document.getElementById('tab-account-register')?.addEventListener('click', () => {
      this.switchAccountTab('register');
    });
    document.getElementById('tab-account-transfer')?.addEventListener('click', () => {
      this.switchAccountTab('transfer');
      // Auto populate export box if logged in
      const res = SaveSystem.exportTransferPackage(accountSystem.getCurrentUser(), this.player, this.companion, this.citadel, this.arsenal);
      const codeBox = document.getElementById('export-transfer-code-text');
      if (res.success && codeBox) {
        codeBox.value = res.transferCode;
      }
    });

    // Transfer Export Code Generation & Copy
    document.getElementById('btn-generate-transfer-code')?.addEventListener('click', async () => {
      const res = SaveSystem.exportTransferPackage(accountSystem.getCurrentUser(), this.player, this.companion, this.citadel, this.arsenal);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
        return;
      }
      const codeBox = document.getElementById('export-transfer-code-text');
      if (codeBox) codeBox.value = res.transferCode;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(res.transferCode);
          this.showToast('📋 聖誓引繼密鑰已成功複製到剪貼簿！請在其他裝置貼上匯入！', 'toast-gold');
        } else {
          codeBox?.select();
          document.execCommand('copy');
          this.showToast('📋 已選取並複製引繼密鑰！', 'toast-gold');
        }
      } catch (err) {
        codeBox?.select();
        this.showToast('📋 已產生引繼密鑰，請手動複製上方代碼！', 'toast-cyan');
      }
    });

    // Auto select on click
    document.getElementById('export-transfer-code-text')?.addEventListener('click', (e) => {
      e.target.select();
    });

    // Transfer Download Backup JSON File
    document.getElementById('btn-download-backup-json')?.addEventListener('click', () => {
      const res = SaveSystem.exportTransferPackage(accountSystem.getCurrentUser(), this.player, this.companion, this.citadel, this.arsenal);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
        return;
      }
      const blob = new Blob([res.jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EvernightOath_Save_${res.username}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast(`💾 聖誓存檔備份已下載：EvernightOath_Save_${res.username}.json`, 'toast-cyan');
    });

    // Transfer Import Submit
    const handleTransferImport = (rawInput) => {
      const res = SaveSystem.importTransferPackage(rawInput, this.player, this.companion, this.citadel, this.arsenal);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`🎉 引繼成功！歡迎聖誓者【${res.username}】！角色與堡壘進度已全數同步！`, 'toast-gold');
        this.updateHUD();
        this.updateCitadelModal();
        this.updateArsenalModal();
        this.updateCompanionModal();
        this.updateAccountModal();
        this.switchAccountTab('profile');
      }
    };

    document.getElementById('btn-submit-transfer-import')?.addEventListener('click', () => {
      const input = document.getElementById('import-transfer-code-input')?.value;
      handleTransferImport(input);
    });

    // File upload import
    document.getElementById('input-backup-file-upload')?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        handleTransferImport(text);
      };
      reader.readAsText(file);
    });

    const handleLoginSubmit = async () => {
      const u = document.getElementById('login-input-username')?.value;
      const p = document.getElementById('login-input-password')?.value;
      if (!u || !u.trim()) {
        this.showToast('請輸入聖誓者代號！', 'toast-crimson');
        return;
      }
      if (!p || !p.trim()) {
        this.showToast('請輸入誓約密碼！', 'toast-crimson');
        return;
      }
      const res = await accountSystem.login(u, p);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`歡迎回歸聖殿，${res.user.username}！`, 'toast-gold');
        SaveSystem.load(this.player, this.companion, this.citadel, this.arsenal);
        this.updateHUD();
        this.updateCitadelModal();
        this.updateArsenalModal();
        this.updateAccountModal();
        this.switchAccountTab('profile');
      }
    };

    document.getElementById('btn-submit-login')?.addEventListener('click', handleLoginSubmit);
    document.getElementById('login-input-password')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLoginSubmit();
    });
    document.getElementById('login-input-username')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLoginSubmit();
    });

    const handleRegisterSubmit = async () => {
      const u = document.getElementById('reg-input-username')?.value;
      const p = document.getElementById('reg-input-password')?.value;
      const activeAvatar = document.querySelector('.avatar-select-item.active')?.getAttribute('data-avatar-id') || 'sun_knight';
      if (!u || !u.trim()) {
        this.showToast('請填寫聖誓者代號！', 'toast-crimson');
        return;
      }
      if (!p || !p.trim()) {
        this.showToast('請設定密碼 (至少 4 位數)！', 'toast-crimson');
        return;
      }
      const res = await accountSystem.register(u, p, activeAvatar);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`聖誓締結成功！歡迎加入破曉誓約，${res.user.username}！`, 'toast-gold');
        SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
        this.updateAccountModal();
        this.switchAccountTab('profile');
      }
    };

    document.getElementById('btn-submit-register')?.addEventListener('click', handleRegisterSubmit);
    document.getElementById('reg-input-password')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRegisterSubmit();
    });
    document.getElementById('reg-input-username')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleRegisterSubmit();
    });

    document.getElementById('btn-login-guest')?.addEventListener('click', () => {
      const res = accountSystem.loginAsGuest();
      this.showToast(`以訪客身分【${res.user.username}】進入聖殿！`, 'toast-cyan');
      this.updateAccountModal();
      this.switchAccountTab('profile');
    });

    document.getElementById('btn-account-logout')?.addEventListener('click', () => {
      accountSystem.logout();
      this.showToast('已安全登出帳號！', 'toast-purple');
      this.updateAccountModal();
      this.switchAccountTab('login');
    });

    // Procedural Dungeon Generator Listeners
    document.getElementById('btn-reroll-seed')?.addEventListener('click', () => {
      this.dungeonSeed = Math.floor(100000 + Math.random() * 900000);
      const seedInput = document.getElementById('input-dungeon-seed');
      if (seedInput) seedInput.value = this.dungeonSeed;

      // Randomize affixes according to tier
      const allAffixes = Object.keys(DUNGEON_AFFIXES);
      const numAffixes = this.dungeonTier >= 4 ? 2 : (this.dungeonTier >= 2 ? 1 : 0);
      const shuffled = [...allAffixes].sort(() => 0.5 - Math.random());
      this.dungeonAffixes = shuffled.slice(0, numAffixes);

      this.updateCitadelModal();
      this.showToast(`已生成新副本種子 #${this.dungeonSeed}！`, 'toast-cyan');
    });

    document.getElementById('select-dungeon-tier')?.addEventListener('change', (e) => {
      this.dungeonTier = parseInt(e.target.value, 10);
      const allAffixes = Object.keys(DUNGEON_AFFIXES);
      const numAffixes = this.dungeonTier >= 4 ? 2 : (this.dungeonTier >= 2 ? 1 : 0);
      const shuffled = [...allAffixes].sort(() => 0.5 - Math.random());
      this.dungeonAffixes = shuffled.slice(0, numAffixes);
      this.updateCitadelModal();
    });

    document.getElementById('input-dungeon-seed')?.addEventListener('input', (e) => {
      this.dungeonSeed = parseInt(e.target.value, 10) || 12345;
    });

    // Multiplayer Lobby Actions
    // Quick Match Banner
    document.getElementById('btn-quick-match')?.addEventListener('click', () => {
      const res = networkEngine.quickMatch(this.selectedZoneId);
      this.showToast('✨ 智能組隊成功！已集結聖誓傭兵隊伍，準備出征！', 'toast-gold');
      this.updateMultiplayerModal();
    });

    document.getElementById('btn-fill-ai-party')?.addEventListener('click', () => {
      const added = networkEngine.fillPartyWithAi();
      if (added) {
        this.showToast('🤖 已召集 AI 聖誓盟友加入小隊！', 'toast-gold');
        this.updateMultiplayerModal();
      } else {
        this.showToast('隊伍已滿或無法招募更多盟友！', 'toast-crimson');
      }
    });

    document.getElementById('btn-create-room-submit')?.addEventListener('click', () => {
      const name = document.getElementById('input-create-room-name')?.value || '破曉討伐小隊';
      const zone = document.getElementById('select-create-room-zone')?.value || 'barren_wastes';
      const max = parseInt(document.getElementById('select-create-room-max')?.value || '4', 10);
      networkEngine.createRoom(name, max, '', zone);
      this.selectedZoneId = zone;
      const zoneObj = MAP_ZONES[zone] || MAP_ZONES.barren_wastes;
      this.showToast(`成功創建遠征房間【${name}】！目標：【${zoneObj.name}】`, 'toast-gold');
      this.updateMultiplayerModal();
    });

    document.getElementById('btn-join-room-submit')?.addEventListener('click', () => {
      const code = document.getElementById('input-join-room-code')?.value;
      if (!code) {
        this.showToast('請輸入 4 位數房間代碼！', 'toast-crimson');
        return;
      }
      const prevRoomId = networkEngine.currentRoom?.id;
      networkEngine.joinRoomByCode(code);
      this.showToast(`正在嘗試加入房間【${code}】...`, 'toast-cyan');

      setTimeout(() => {
        if (!networkEngine.currentRoom || networkEngine.currentRoom.id === prevRoomId) {
          this.showToast(`⚠️ 查無代碼【${code}】的小隊。請確認房號，或點擊「⚡ 立即智能組隊」直接組隊！`, 'toast-crimson');
        }
      }, 2200);
    });

    document.getElementById('btn-refresh-rooms')?.addEventListener('click', () => {
      networkEngine.requestRoomList();
      this.showToast('已向頻道請求最新房間列表！', 'toast-cyan');
      this.updateMultiplayerModal();
    });

    document.getElementById('btn-toggle-ready')?.addEventListener('click', () => {
      networkEngine.toggleReady();
    });

    document.getElementById('btn-host-launch-expedition')?.addEventListener('click', () => {
      networkEngine.startExpedition();
    });

    // Citadel Greenhouse & Food Acquisition Handlers
    document.getElementById('btn-harvest-greenhouse')?.addEventListener('click', () => {
      const res = this.citadel.harvestGreenhouse();
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`🌾 成功收割溫室成熟存糧 +${res.harvested} 糧草！`, 'toast-gold');
        this.updateCitadelModal();
        SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
      }
    });

    document.getElementById('btn-dispatch-farming')?.addEventListener('click', () => {
      const res = this.citadel.dispatchFarming(20);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`🚜 倖存者農墾隊大豐收！獲得 +${res.harvested} 糧草！(-20 聖油)`, 'toast-gold');
        this.updateCitadelModal();
        SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
      }
    });

    document.getElementById('btn-exchange-iron-rations')?.addEventListener('click', () => {
      const res = this.citadel.exchangeIronForRations(25);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`⚖️ 成功以 25 黑鐵換取 +60 糧草物資！`, 'toast-cyan');
        this.updateCitadelModal();
        SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
      }
    });

    document.getElementById('btn-exchange-shards-rations')?.addEventListener('click', () => {
      const res = this.citadel.exchangeShardsForRations(10);
      if (!res.success) {
        this.showToast(res.reason, 'toast-crimson');
      } else {
        this.showToast(`✨ 成功以 10 星光碎屑換取 +100 糧草物資！`, 'toast-gold');
        this.updateCitadelModal();
        SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
      }
    });

    // Victory / Defeat Return Buttons
    document.getElementById('btn-return-citadel')?.addEventListener('click', () => {
      document.getElementById('expedition-outcome-modal').classList.remove('active');
      this.state = GAME_STATES.HUB;
      audio.setMusicTrack('citadel');
      this.openModal('modal-citadel');
      this.updateCitadelModal();
      SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
    });
  }

  openModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  showToast(message, typeClass = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${typeClass}`;
    toast.innerText = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  // --- Modal Update Handlers ---

  switchCitadelTab(tabName) {
    document.querySelectorAll('.account-tab-btn').forEach(btn => {
      if (btn.id.startsWith('tab-citadel-')) {
        btn.classList.toggle('active', btn.id === `tab-citadel-${tabName}`);
      }
    });

    const panels = ['overview', 'facilities', 'siege'];
    panels.forEach(p => {
      const el = document.getElementById(`panel-citadel-${p}`);
      if (el) el.style.display = p === tabName ? 'block' : 'none';
    });

    if (tabName === 'facilities') {
      this.renderCitadelFacilities();
    } else if (tabName === 'siege') {
      this.updateSiegePreview();
    }
  }

  renderCitadelFacilities() {
    const container = document.getElementById('citadel-facilities-container');
    const curIronEl = document.getElementById('fac-cur-iron');
    const curShardsEl = document.getElementById('fac-cur-shards');
    if (curIronEl) curIronEl.innerText = this.citadel.blackIron;
    if (curShardsEl) curShardsEl.innerText = this.citadel.starlightShards;
    if (!container) return;

    const facilities = this.citadel.facilities || {};
    container.innerHTML = Object.keys(FACILITIES_CATALOG).map(key => {
      const info = FACILITIES_CATALOG[key];
      const curLvl = facilities[key] || 1;
      const cost = this.citadel.getFacilityUpgradeCost(key);
      const isMax = curLvl >= info.maxLevel;
      const canAfford = cost && this.citadel.blackIron >= cost.costIron && this.citadel.starlightShards >= cost.costShards;

      return `
        <div class="facility-card">
          <div class="facility-header">
            <div class="facility-title-row">
              <span class="facility-icon">${info.icon}</span>
              <span class="facility-name">${info.name}</span>
            </div>
            <span class="facility-level-tag">Lv.${curLvl} / ${info.maxLevel}</span>
          </div>
          <div class="facility-desc">${info.desc}</div>
          <div class="facility-bonus-box">
            <strong>目前加成：</strong> ${info.getBonusText(curLvl)}
          </div>
          <div class="facility-cost-row">
            <div>
              ${isMax ? '<span style="color:#ffd700; font-weight:700;">★ 已達滿級</span>' : `
                <div style="font-size:0.75rem;">升級花費:</div>
                <div style="font-weight:700; color:${this.citadel.blackIron >= cost.costIron ? '#ffd700' : '#ef4444'};">
                  ${cost.costIron} ⛓️ <span style="color:${this.citadel.starlightShards >= cost.costShards ? '#38bdf8' : '#ef4444'};">${cost.costShards} ✨</span>
                </div>
              `}
            </div>
            ${isMax ? '' : `
              <button class="gothic-btn ${canAfford ? 'btn-primary-radiant' : ''} facility-upgrade-btn" data-facility-id="${key}" ${canAfford ? '' : 'disabled'}>
                🔨 擴建升級
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Wire Facility Upgrade Buttons
    container.querySelectorAll('.facility-upgrade-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const facId = e.currentTarget.dataset.facilityId;
        const res = this.citadel.upgradeFacility(facId);
        if (!res.success) {
          this.showToast(res.reason, 'toast-crimson');
        } else {
          audio.playLevelUp();
          this.particles.emitSparks(this.player.x, this.player.y, '#ffd700', 30, 200);
          this.showToast(`✨ 【${res.facilityName}】成功擴建升級至 Lv.${res.newLevel}！${res.bonusText}`, 'toast-gold');
          this.renderCitadelFacilities();
          this.updateCitadelModal();
          SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
        }
      });
    });
  }

  updateSiegePreview() {
    const wallLvl = this.citadel.facilities?.bastion_wall || 1;
    const workshopLvl = this.citadel.facilities?.workshop || 1;
    const barracksLvl = this.citadel.facilities?.barracks || 1;

    const coreHpEl = document.getElementById('siege-preview-core-hp');
    const turretsEl = document.getElementById('siege-preview-turrets');
    const guardsEl = document.getElementById('siege-preview-guards');
    const bestWaveEl = document.getElementById('siege-best-wave-text');

    if (coreHpEl) coreHpEl.innerText = `${3000 + wallLvl * 500} HP (+${wallLvl * 10}% 荊棘反傷)`;
    if (turretsEl) turretsEl.innerText = `4 門砲台 (Lv.${workshopLvl} 魔導工坊加成，支援手動接管)`;
    if (guardsEl) guardsEl.innerText = `${2 + barracksLvl * 2} 名聖誓守衛 (近衛步兵 & 破曉弩手)`;
    if (bestWaveEl) {
      bestWaveEl.innerText = this.citadel.siegeMaxWave > 0 ? `第 ${this.citadel.siegeMaxWave} 波 (【不滅要塞】)` : `尚未開戰`;
    }
  }

  updateCitadelModal() {
    this.citadel.updateGreenhouse();

    const rationsEl = document.getElementById('res-rations');
    if (rationsEl) rationsEl.innerText = this.citadel.rations;
    document.getElementById('res-iron').innerText = this.citadel.blackIron;
    document.getElementById('res-oil').innerText = this.citadel.lumenOil;
    document.getElementById('res-morale').innerText = `${this.citadel.morale}%`;
    document.getElementById('res-survivors').innerText = this.citadel.survivors;
    document.getElementById('res-shards').innerText = this.citadel.starlightShards;
    document.getElementById('res-tickets').innerText = this.citadel.forgeTickets;

    const maxCap = this.citadel.getMaxGreenhouseCapacity();
    const greenhouseCapEl = document.getElementById('greenhouse-cap-display');
    if (greenhouseCapEl) greenhouseCapEl.innerText = maxCap;

    const greenhouseValEl = document.getElementById('greenhouse-stored-val');
    if (greenhouseValEl) {
      greenhouseValEl.innerText = `${Math.floor(this.citadel.greenhouseRations || 0)} / ${maxCap} 🍞`;
    }
    const rateBadgeEl = document.getElementById('greenhouse-rate-badge');
    if (rateBadgeEl) {
      rateBadgeEl.innerText = `產量: +${this.citadel.getProductionRatePerMin()}/分`;
    }

    this.renderCitadelFacilities();
    this.updateSiegePreview();

    // Render Map Selector Cards
    const mapSelector = document.getElementById('citadel-map-selector');
    if (mapSelector) {
      mapSelector.innerHTML = Object.values(MAP_ZONES).map(z => `
        <div class="map-zone-card ${z.id === this.selectedZoneId ? 'selected' : ''}" data-zone-id="${z.id}">
          <div class="map-zone-header">
            <div class="map-zone-title">${z.icon} ${z.name}</div>
            <div class="map-zone-power">⚔️ 戰力 ${z.recPower}+</div>
          </div>
          <div class="map-zone-hazard">${z.hazard}</div>
          <div class="map-zone-loot">🎁 產出：${z.lootHint}</div>
        </div>
      `).join('');

      mapSelector.querySelectorAll('.map-zone-card').forEach(card => {
        card.addEventListener('click', () => {
          this.selectedZoneId = card.getAttribute('data-zone-id');
          this.updateCitadelModal();
        });
      });
    }

    // Render Affixes in Generator Panel
    const affixesContainer = document.getElementById('dungeon-active-affixes');
    if (affixesContainer) {
      if (this.dungeonAffixes.length === 0) {
        affixesContainer.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">無附加深淵詞綴 (標準難度)</span>`;
      } else {
        affixesContainer.innerHTML = this.dungeonAffixes.map(affId => {
          const aff = DUNGEON_AFFIXES[affId];
          if (!aff) return '';
          return `<span class="affix-badge" style="border-color:${aff.color}; color:${aff.color};" title="${aff.desc}">${aff.icon} ${aff.name}</span>`;
        }).join('');
      }
    }

    const startExpBtn = document.getElementById('btn-start-expedition');
    if (startExpBtn) {
      const activeZ = MAP_ZONES[this.selectedZoneId] || MAP_ZONES.barren_wastes;
      startExpBtn.innerText = `⚔️ 發起遠征：進入【${activeZ.name}】(階級 ${this.dungeonTier})`;
    }

    // Render Moral Dilemma
    const dilemma = this.citadel.getCurrentDilemma();
    const dilemmaContainer = document.getElementById('dilemma-display-container');

    if (!dilemma) {
      dilemmaContainer.innerHTML = `
        <div class="dilemma-card" style="border-color: var(--gold-dim);">
          <div class="dilemma-title" style="color: var(--gold-radiant);">✨ 堡壘當前政務安寧</div>
          <div class="dilemma-desc">目前防線內無突發緊急事件，請勇者繼續帶隊深入禁區探索物資與淨化魔物！</div>
        </div>
      `;
    } else {
      dilemmaContainer.innerHTML = `
        <div class="dilemma-card">
          <div class="dilemma-badge">${dilemma.badge}</div>
          <div class="dilemma-title">${dilemma.title}</div>
          <div class="dilemma-desc">${dilemma.desc}</div>
          <div class="dilemma-options">
            ${dilemma.options.map((opt, idx) => `
              <div class="dilemma-option-btn" data-opt-index="${idx}">
                <div>
                  <div style="font-weight: 600;">${opt.text}</div>
                  <div class="dilemma-outcome-hint">${opt.hint}</div>
                </div>
                <div style="font-size: 1.2rem;">⚖️</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      dilemmaContainer.querySelectorAll('.dilemma-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.getAttribute('data-opt-index'), 10);
          const outcome = this.citadel.chooseDilemmaOption(idx);
          if (outcome) {
            this.showToast(outcome.resultText, 'toast-purple');
            this.updateCitadelModal();
          }
        });
      });
    }
  }

  updateForgeModal() {
    document.getElementById('forge-pity-display').innerText = `距離 SSR 保底還有 ${this.forge.hardPity - this.forge.pityCount} 抽`;
    document.getElementById('forge-ticket-display').innerText = `剩餘鍛造券: ${this.citadel.forgeTickets} | 星光碎屑: ${this.citadel.starlightShards}`;
  }

  showGachaResults(items) {
    const stage = document.getElementById('gacha-result-stage');
    const grid = document.getElementById('gacha-cards-container');
    grid.innerHTML = '';

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = `gacha-card ${item.rarity.toLowerCase()}`;
      card.style.animationDelay = `${idx * 0.08}s`;

      card.innerHTML = `
        <div class="gacha-card-rarity">${item.rarity}</div>
        <div class="gacha-card-icon">${item.icon}</div>
        <div class="gacha-card-name">${item.name}</div>
      `;

      grid.appendChild(card);
    });

    stage.classList.add('active');
  }

  updateArsenalModal() {
    const sidebar = document.getElementById('arsenal-weapon-list');
    sidebar.innerHTML = '';

    this.arsenal.weapons.forEach(w => {
      const isEquipped = this.player.equippedWeapon.id === w.id;
      const isSelected = this.arsenal.selectedWeapon.id === w.id;
      const wData = this.player.getWeaponData(w.id);
      const wDmg = this.player.getAttackDamage(w);

      const card = document.createElement('div');
      card.className = `weapon-select-card ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <div class="weapon-icon-box">${w.icon}</div>
        <div class="weapon-details" style="flex: 1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="weapon-name-title">${w.name.split('·')[0]}</div>
            ${isEquipped ? '<span class="weapon-equipped-tag">裝備中</span>' : ''}
          </div>
          <div class="weapon-type-text">${w.rarity} · 基礎 ${w.baseDamage}</div>
          <div class="weapon-card-stats-row">
            <span class="weapon-stat-tag">Lv.${wData.level}</span>
            <span class="weapon-refine-tag">${wData.refinement > 0 ? `精煉 ${wData.refinement}階` : '未精煉'}</span>
            <span style="color:#4ade80; margin-left:auto; font-weight:700;">⚔️ ${wDmg}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.arsenal.selectedWeapon = w;
        this.updateArsenalModal();
      });

      sidebar.appendChild(card);
    });

    // Detail Panel
    const curW = this.arsenal.selectedWeapon;
    const curData = this.player.getWeaponData(curW.id);
    const curDmg = this.player.getAttackDamage(curW);
    const isEquipped = this.player.equippedWeapon.id === curW.id;
    const upgradeCost = this.arsenal.getUpgradeCost(curW, curData.level);
    const { costIron: refineIron, costShards: refineShards } = this.arsenal.getRefineCost(curW, curData.refinement);
    const lvlGain = curW.rarity === 'SSR' ? 10 : (curW.rarity === 'SR' ? 8 : 6);

    document.getElementById('arsenal-weapon-title').innerText = `${curW.name} (Lv.${curData.level} · 精煉 ${curData.refinement}階)`;
    document.getElementById('arsenal-weapon-desc').innerText = curW.description;
    document.getElementById('arsenal-weapon-passive').innerText = curW.passive || '無特殊被動';
    document.getElementById('arsenal-weapon-atk').innerHTML = `
      <span>攻擊力: ${curDmg}</span>
      <span style="font-size:0.85rem; color:var(--text-muted); font-weight:normal; margin-left:8px;">(基礎 ${curW.baseDamage} + 強化 +${(curData.level - 1) * lvlGain} + 精煉 +${Math.round(curData.refinement * 12)}%)</span>
    `;

    const equipBtn = document.getElementById('btn-equip-weapon');
    if (equipBtn) {
      equipBtn.innerText = isEquipped ? '✅ 當前已裝備' : '⚔️ 裝備此武器';
      equipBtn.className = isEquipped ? 'gothic-btn' : 'gothic-btn btn-primary-radiant';
      equipBtn.disabled = isEquipped;
    }

    const upgradeBtn = document.getElementById('btn-upgrade-weapon');
    if (upgradeBtn) {
      upgradeBtn.innerText = `強化升級 Lv.${curData.level + 1} (⛓️ ${upgradeCost})`;
    }

    const refineBtn = document.getElementById('btn-refine-weapon');
    if (refineBtn) {
      if (curData.refinement >= 5) {
        refineBtn.innerText = '⭐ 已達最高精煉 (5階)';
        refineBtn.disabled = true;
      } else {
        refineBtn.innerText = `精煉 階級 ${curData.refinement + 1} (⛓️ ${refineIron} / ✨ ${refineShards})`;
        refineBtn.disabled = false;
      }
    }

    // Talent Resonance Tree
    const treeContainer = document.getElementById('talent-tree-container');
    treeContainer.innerHTML = '';

    TALENT_TREE_DATA.forEach(t => {
      const isUnlocked = this.player.unlockedTalents.has(t.id);
      const node = document.createElement('div');
      node.className = `talent-node ${isUnlocked ? 'unlocked' : ''}`;

      node.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div class="talent-node-title">${t.icon} ${t.name}</div>
          <div style="font-size:0.75rem; color:var(--gold-radiant);">${isUnlocked ? '✅ 已解鎖' : `✨ ${t.cost} 碎屑`}</div>
        </div>
        <div class="talent-node-desc">${t.desc}</div>
      `;

      if (!isUnlocked) {
        node.addEventListener('click', () => {
          const res = this.arsenal.unlockTalent(t.id, this.player, this.citadel);
          if (!res.success) {
            this.showToast(res.reason, 'toast-crimson');
          } else {
            this.showToast(`成功解鎖天賦：${t.name}！`, 'toast-gold');
            this.updateArsenalModal();
          }
        });
      }

      treeContainer.appendChild(node);
    });
  }

  updateCompanionModal() {
    const list = document.getElementById('companion-select-list');
    list.innerHTML = '';

    COMPANION_CLASSES.forEach(c => {
      const isSelected = this.companion.data.id === c.id;
      const card = document.createElement('div');
      card.className = `weapon-select-card ${isSelected ? 'active' : ''}`;

      card.innerHTML = `
        <div class="weapon-icon-box">${c.icon}</div>
        <div class="weapon-details">
          <div class="weapon-name-title" style="color: ${c.color};">${c.name} ${isSelected ? '【出戰中】' : ''}</div>
          <div class="weapon-type-text">${c.role} · 生命 ${c.baseHp}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.companion.setCompanionClass(c);
        this.updateCompanionModal();
        this.updateHUD();
      });

      list.appendChild(card);
    });

    const activeC = this.companion.data;
    document.getElementById('companion-detail-title').innerText = activeC.name;
    document.getElementById('companion-detail-desc').innerText = activeC.description;
    document.getElementById('companion-active-skill').innerText = `主動技能 [F]: ${activeC.activeSkillName}`;
    document.getElementById('companion-dialogue').innerText = activeC.dialogues[Math.floor(Math.random() * activeC.dialogues.length)];
  }

  // --- Account & Multiplayer Handlers ---

  setupNetworkCallbacks() {
    networkEngine.onRoomStateChanged = (room) => {
      this.updateMultiplayerModal();
      this.updatePartyHUD();
    };

    networkEngine.onRoomAnnounceReceived = () => {
      this.updateMultiplayerModal();
    };

    networkEngine.onExpeditionStarted = (room) => {
      this.startExpedition();
      this.showToast(`小隊出征：【${room.name}】全員進入深淵禁區！`, 'toast-gold');
    };

    networkEngine.onRemoteSkillCast = (senderId, skillData) => {
      if (skillData.skill === 'solar_flare') {
        this.particles.emitShockwaveRing(skillData.x, skillData.y, skillData.length || 180, '#ffd700', 0.5);
      } else if (skillData.skill === 'shadow_blink') {
        this.particles.emitShadowWisps(skillData.startX || 0, skillData.startY || 0, 20);
        this.particles.emitShadowWisps(skillData.endX || 0, skillData.endY || 0, 20);
      } else if (skillData.skill === 'umbral_vortex') {
        this.particles.emitShockwaveRing(skillData.x || 0, skillData.y || 0, skillData.radius || 140, '#9333ea', 0.7);
      } else if (skillData.skill === 'dawnbreaker_judgment') {
        this.particles.emitSparks(skillData.x || 0, skillData.y || 0, '#ffd700', 40, 300);
      }
    };
  }

  switchAccountTab(tabName) {
    document.querySelectorAll('.account-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.account-section-panel').forEach(p => p.classList.remove('active'));

    const tabBtn = document.getElementById(`tab-account-${tabName}`);
    const panel = document.getElementById(`panel-account-${tabName}`);
    if (tabBtn) tabBtn.classList.add('active');
    if (panel) panel.classList.add('active');
    this.updateAccountModal();
  }

  updateAccountModal() {
    const user = accountSystem.getCurrentUser();

    // Profile Card
    const avatarEl = document.getElementById('prof-avatar-icon');
    if (avatarEl) avatarEl.innerText = user?.avatar?.icon || '☀️';
    const titleEl = document.getElementById('prof-title');
    if (titleEl) titleEl.innerText = user?.title || '【初光聖誓者】';
    const userEl = document.getElementById('prof-username');
    if (userEl) userEl.innerText = user?.username || '聖誓勇者';
    const roleEl = document.getElementById('prof-role');
    if (roleEl) roleEl.innerText = user?.avatar?.role || '聖誓近衛';

    const powerEl = document.getElementById('prof-combat-power');
    if (powerEl) powerEl.innerText = accountSystem.calculateCombatPower(this.player).toLocaleString();
    const levelTagEl = document.getElementById('prof-level-tag');
    if (levelTagEl) levelTagEl.innerText = `Lv.${this.player.level || 1} (${this.player.exp || 0} / ${this.player.getMaxExp()} EXP)`;
    const statLevelEl = document.getElementById('prof-stat-level');
    if (statLevelEl) statLevelEl.innerText = `Lv.${this.player.level || 1}`;
    const statBonusEl = document.getElementById('prof-stat-bonus');
    if (statBonusEl) statBonusEl.innerText = `HP +${this.player.getLevelBonusHp()} / ATK +${Math.round((this.player.getLevelBonusDamage() - 1) * 100)}%`;
    const killsEl = document.getElementById('prof-boss-kills');
    if (killsEl) killsEl.innerText = `${user?.stats?.bossKills || 0} 隻`;

    // Render Quick Account Switcher in Login Tab
    const quickList = document.getElementById('quick-account-list');
    if (quickList) {
      const allAccounts = accountSystem.getAccounts();
      const accountEntries = Object.values(allAccounts);
      if (accountEntries.length === 0) {
        quickList.innerHTML = `<span style="color:var(--text-muted); font-size:0.8rem;">尚無已儲存之帳號，請先切換至「註冊新誓約」建立！</span>`;
      } else {
        quickList.innerHTML = accountEntries.map(acc => `
          <div class="room-card-item" data-switch-user="${acc.username}" style="padding:8px 12px; cursor:pointer;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.4rem;">${acc.avatar?.icon || '☀️'}</span>
              <div>
                <div style="font-weight:700; color:#fff; font-size:0.9rem;">${acc.username}</div>
                <div style="font-size:0.75rem; color:#fde047;">${acc.title || '【初光聖誓者】'}</div>
              </div>
            </div>
            <button class="gothic-btn btn-primary-radiant" style="padding:4px 12px; font-size:0.78rem;">一鍵登入</button>
          </div>
        `).join('');

        quickList.querySelectorAll('[data-switch-user]').forEach(item => {
          item.addEventListener('click', () => {
            const username = item.getAttribute('data-switch-user');
            const res = accountSystem.loginDirect(username);
            if (res.success) {
              this.showToast(`已成功登入切換至帳號【${username}】！`, 'toast-gold');
              SaveSystem.load(this.player, this.companion, this.citadel, this.arsenal);
              this.updateHUD();
              this.updateCitadelModal();
              this.updateArsenalModal();
              this.updateAccountModal();
              this.switchAccountTab('profile');
            } else {
              this.showToast(res.reason, 'toast-crimson');
            }
          });
        });
      }
    }

    // Render Avatar Presets in Register Tab
    const avatarContainer = document.getElementById('reg-avatar-selector');
    if (avatarContainer && avatarContainer.children.length === 0) {
      avatarContainer.innerHTML = AVATAR_PRESETS.map((a, idx) => `
        <div class="avatar-select-item ${idx === 0 ? 'active' : ''}" data-avatar-id="${a.id}">
          <span style="font-size: 1.8rem;">${a.icon}</span>
          <span style="font-size: 0.75rem; color: ${a.color}; font-weight: 700;">${a.role}</span>
        </div>
      `).join('');

      avatarContainer.querySelectorAll('.avatar-select-item').forEach(item => {
        item.addEventListener('click', () => {
          avatarContainer.querySelectorAll('.avatar-select-item').forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        });
      });
    }

    // Update Transfer Tab User Preview & Pre-generate Code if logged in
    const transferAvatar = document.getElementById('transfer-avatar');
    if (transferAvatar) transferAvatar.innerText = user?.avatar?.icon || '☀️';
    const transferUsername = document.getElementById('transfer-username');
    if (transferUsername) transferUsername.innerText = user?.username || '未登入';
    const transferStats = document.getElementById('transfer-stats-summary');
    if (transferStats) {
      if (user) {
        transferStats.innerText = `等級 Lv.${this.player.level || 1} ｜ 戰力 ${accountSystem.calculateCombatPower(this.player).toLocaleString()} ｜ 誓約完整保護`;
      } else {
        transferStats.innerText = '請先登入帳號後產生引繼碼';
      }
    }
  }

  updateMultiplayerModal() {
    const room = networkEngine.currentRoom;
    const lobbyView = document.getElementById('multiplayer-lobby-view');
    const roomView = document.getElementById('multiplayer-room-view');

    if (!room) {
      if (lobbyView) lobbyView.style.display = 'block';
      if (roomView) roomView.style.display = 'none';

      // Render Public Rooms List (Includes Guild NPC Expeditions if no human rooms)
      const list = document.getElementById('public-rooms-list');
      if (list) {
        if (networkEngine.publicRooms.size === 0) {
          list.innerHTML = `
            <div style="margin-bottom:8px; font-size:0.78rem; color:#fde047; font-weight:700;">🏰 聖誓公會即時遠征派遣隊（點擊一鍵加入出發）：</div>
            <div class="room-card-item" data-guild-room="radiant" style="cursor:pointer; margin-bottom:8px;">
              <div>
                <div style="font-weight: 700; color: #ffd700;">🛡️ 【聖堂先鋒遠征隊】(公會派遣)</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">隊長: 聖堂守衛·羅蘭 · 地圖: <span style="color:#fde047;">🏰 荒蕪禁區</span></div>
              </div>
              <div style="display:flex; align-items:center; gap: 8px;">
                <span class="room-code-badge" style="background:rgba(56,189,248,0.2); border-color:#38bdf8; color:#7dd3fc;">2 / 4 人</span>
                <button class="gothic-btn btn-primary-radiant" style="padding: 3px 10px; font-size:0.75rem;">一鍵加入</button>
              </div>
            </div>
            <div class="room-card-item" data-guild-room="shadow" style="cursor:pointer;">
              <div>
                <div style="font-weight: 700; color: #c084fc;">🌑 【暗夜深淵暗殺組】(公會派遣)</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">隊長: 逐夜刺客·希爾薇 · 地圖: <span style="color:#f87171;">🩸 幽影血沼</span></div>
              </div>
              <div style="display:flex; align-items:center; gap: 8px;">
                <span class="room-code-badge" style="background:rgba(192,132,252,0.2); border-color:#c084fc; color:#e9d5ff;">2 / 4 人</span>
                <button class="gothic-btn btn-primary-radiant" style="padding: 3px 10px; font-size:0.75rem;">一鍵加入</button>
              </div>
            </div>
          `;

          list.querySelectorAll('[data-guild-room]').forEach(card => {
            card.addEventListener('click', () => {
              const gType = card.getAttribute('data-guild-room');
              networkEngine.createGuildNpcRoom(gType);
              this.showToast('✨ 已加入聖誓公會派遣隊！點擊「⚔️ 全員出征」立即開戰！', 'toast-gold');
              this.updateMultiplayerModal();
            });
          });
        } else {
          list.innerHTML = Array.from(networkEngine.publicRooms.values()).map(r => {
            const z = MAP_ZONES[r.zoneId] || MAP_ZONES.barren_wastes;
            return `
              <div class="room-card-item" data-room-code="${r.code}">
                <div>
                  <div style="font-weight: 700; color: var(--gold-radiant);">${r.name}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">房主: ${r.hostName} · 地圖: <span style="color:#fde047;">${z.icon} ${z.name}</span></div>
                </div>
                <div style="display:flex; align-items:center; gap: 8px;">
                  <span class="room-code-badge">${r.playerCount} / ${r.maxPlayers}人</span>
                  <button class="gothic-btn btn-primary-radiant" style="padding: 3px 10px; font-size:0.75rem;">加入</button>
                </div>
              </div>
            `;
          }).join('');

          list.querySelectorAll('.room-card-item').forEach(card => {
            card.addEventListener('click', () => {
              const code = card.getAttribute('data-room-code');
              networkEngine.joinRoomByCode(code);
            });
          });
        }
      }
    } else {
      if (lobbyView) lobbyView.style.display = 'none';
      if (roomView) roomView.style.display = 'block';

      document.getElementById('active-room-name').innerText = room.name;
      document.getElementById('active-room-code').innerText = `房間代碼: ${room.code}`;
      document.getElementById('active-room-players-count').innerText = `${room.players.length} / ${room.maxPlayers} 人`;

      const zoneBadge = document.getElementById('active-room-zone');
      if (zoneBadge) {
        const z = MAP_ZONES[room.zoneId] || MAP_ZONES.barren_wastes;
        zoneBadge.innerText = `${z.icon} ${z.name}`;
      }

      // Launch button visibility for host
      const launchBtn = document.getElementById('btn-host-launch-expedition');
      const readyBtn = document.getElementById('btn-toggle-ready');
      const fillAiBtn = document.getElementById('btn-fill-ai-party');

      if (networkEngine.isHost) {
        if (launchBtn) launchBtn.style.display = 'block';
        if (readyBtn) readyBtn.style.display = 'none';
        if (fillAiBtn) fillAiBtn.style.display = room.players.length < room.maxPlayers ? 'block' : 'none';
      } else {
        if (launchBtn) launchBtn.style.display = 'none';
        if (readyBtn) readyBtn.style.display = 'block';
        if (fillAiBtn) fillAiBtn.style.display = 'none';
        const mySlot = room.players.find(p => p.peerId === networkEngine.peerId);
        readyBtn.innerText = mySlot?.isReady ? '取消準備' : '準備完成';
      }

      // Render 4 Seat Cards
      const seatsContainer = document.getElementById('room-seats-container');
      if (seatsContainer) {
        let html = '';
        for (let i = 0; i < room.maxPlayers; i++) {
          const p = room.players[i];
          if (p) {
            html += `
              <div class="player-seat-card ${p.isReady ? 'ready' : ''}">
                ${p.isHost ? '<span class="seat-host-badge">👑 房主</span>' : ''}
                ${p.isAi ? '<span style="background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#7dd3fc; font-size:0.68rem; padding:1px 6px; border-radius:10px; margin-bottom:2px;">🤖 AI 盟友</span>' : ''}
                <div class="seat-avatar">${p.user?.avatar?.icon || '☀️'}</div>
                <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${p.user?.username || '隊友'}</div>
                <div style="font-size: 0.75rem; color: #fde047;">${p.user?.title || '【聖誓者】'}</div>
                <div class="seat-ready-status ${p.isReady ? 'ready' : 'waiting'}">
                  ${p.isReady ? '✅ 已準備' : '⏳ 等待中'}
                </div>
                ${networkEngine.isHost && !p.isHost ? `<button class="gothic-btn" data-remove-peer="${p.peerId}" style="padding:2px 8px; font-size:0.7rem; margin-top:6px; border-color:#ef4444; color:#fca5a5;">❌ 移除</button>` : ''}
              </div>
            `;
          } else {
            html += `
              <div class="player-seat-card empty" ${networkEngine.isHost ? 'data-add-ai-slot="true" style="cursor:pointer;" title="點擊召募 AI 聖誓盟友"' : ''}>
                <span style="font-size: 1.8rem;">➕</span>
                <span style="font-size: 0.8rem; color: ${networkEngine.isHost ? '#fde047' : 'var(--text-muted)'}; font-weight:700;">
                  ${networkEngine.isHost ? '點擊招募 AI 盟友' : '等待玩家加入...'}
                </span>
                ${networkEngine.isHost ? '<span style="font-size:0.68rem; color:var(--text-muted);">或等待在線玩家加入</span>' : ''}
              </div>
            `;
          }
        }
        seatsContainer.innerHTML = html;

        // Wire click for adding AI
        seatsContainer.querySelectorAll('[data-add-ai-slot]').forEach(el => {
          el.addEventListener('click', () => {
            networkEngine.addAiMercenary();
            this.showToast('🤖 已招募一名 AI 聖誓盟友加入座席！', 'toast-gold');
            this.updateMultiplayerModal();
          });
        });

        // Wire click for removing AI or player
        seatsContainer.querySelectorAll('[data-remove-peer]').forEach(btn => {
          btn.addEventListener('click', () => {
            const peerId = btn.getAttribute('data-remove-peer');
            networkEngine.removePlayerSlot(peerId);
            this.showToast('已自房間中移除該座席成員。', 'toast-purple');
            this.updateMultiplayerModal();
          });
        });
      }
    }
  }

  updatePartyHUD() {
    const container = document.getElementById('party-frames-container');
    if (!container) return;

    if (!networkEngine.currentRoom || networkEngine.remotePlayers.size === 0) {
      container.innerHTML = '';
      return;
    }

    let html = '';
    for (const rp of networkEngine.remotePlayers.values()) {
      const isRadiant = rp.form === FORMS.RADIANT;
      const hpPct = Math.max(0, Math.min(100, (rp.hp / (rp.maxHp || 1000)) * 100));
      html += `
        <div class="party-member-frame">
          <div class="party-avatar-icon">${rp.user?.avatar?.icon || '☀️'}</div>
          <div class="party-member-info">
            <div class="party-name-row">
              <span>${rp.user?.username || '隊友'}</span>
              <span class="party-form-tag ${isRadiant ? 'radiant' : 'shadow'}">${isRadiant ? '☀️ 光輝' : '🌑 黯影'}</span>
            </div>
            <div class="party-hp-bar">
              <div class="party-hp-fill" style="width: ${hpPct}%;"></div>
            </div>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  openShrineModal(shrine) {
    if (shrine.isActivated) return;
    this.activeShrine = shrine;
    const choices = this.relicSystem.getRandomChoices(3);
    const container = document.getElementById('shrine-relics-cards-container');
    if (!container) return;

    if (choices.length === 0) {
      this.showToast('✨ 你已獲得所有古代神契遺物！神龕轉化為大量物資！', 'toast-gold');
      shrine.activate(this.particles);
      this.runLoot.starlightShards += 100;
      this.runLoot.blackIron += 150;
      return;
    }

    container.innerHTML = choices.map(relic => {
      const rarity = RELIC_RARITY[relic.rarity] || RELIC_RARITY.R;
      return `
        <div class="shrine-relic-card rarity-${relic.rarity}" data-relic-id="${relic.id}">
          <span class="shrine-relic-rarity-badge" style="background:${rarity.bg}; border:1px solid ${rarity.border}; color:${rarity.color};">
            ${rarity.name}
          </span>
          <div class="shrine-relic-icon-wrapper">${relic.icon}</div>
          <div class="shrine-relic-name">${relic.name}</div>
          <div class="shrine-relic-tag">${relic.tag}</div>
          <div class="shrine-relic-desc">${relic.desc}</div>
          <button class="gothic-btn btn-primary-radiant shrine-relic-btn">✨ 汲取神聖契約</button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.shrine-relic-card').forEach(card => {
      card.addEventListener('click', () => {
        const relicId = card.getAttribute('data-relic-id');
        this.chooseShrineRelic(relicId);
      });
    });

    this.openModal('modal-shrine-selection');
  }

  chooseShrineRelic(relicId) {
    const relic = this.relicSystem.addRelic(relicId);
    if (relic) {
      if (this.activeShrine) {
        this.activeShrine.activate(this.particles);
        this.activeShrine = null;
      }
      this.closeAllModals();
      audio.playLevelUp();
      this.showToast(`✨ 成功汲取遠古神遺物【${relic.name}】！(${relic.tag})`, 'toast-gold');
      this.updateRelicsHUD();
    }
  }

  startCursedChallenge(cc) {
    if (cc.state !== 'idle') return;
    this.activeCursedChest = cc;
    cc.startChallenge(this.particles);
    // Spawn 5 elite/stalker enemies in room
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const ex = cc.x + Math.cos(angle) * 160;
      const ey = cc.y + Math.sin(angle) * 160;
      const mType = i % 2 === 0 ? ENEMY_TYPES.STALKER : ENEMY_TYPES.KNIGHT;
      const en = new Enemy(ex, ey, mType);
      en.maxHp = Math.round(en.maxHp * 1.5);
      en.hp = en.maxHp;
      en.isFrenzied = true;
      this.enemies.push(en);
      this.particles.emitSparks(ex, ey, '#ef4444', 16, 120);
    }
  }

  updateRelicsHUD() {
    const listEl = document.getElementById('hud-relics-list');
    if (!listEl) return;

    const activeList = this.relicSystem.getActiveList();
    if (activeList.length === 0) {
      listEl.innerHTML = `<span style="font-size:0.72rem; color:var(--text-muted);">尚未汲取</span>`;
      return;
    }

    listEl.innerHTML = activeList.map(r => {
      const rarity = RELIC_RARITY[r.rarity] || RELIC_RARITY.R;
      return `
        <div class="hud-relic-badge" style="border-color:${rarity.border};" title="【${r.name}】(${rarity.name})&#10;${r.desc}">
          ${r.icon}
        </div>
      `;
    }).join('');
  }

  openTowerModal() {
    const highest = this.citadel.towerMaxFloor || 1;
    const recordEl = document.getElementById('tower-highest-record-text');
    if (recordEl) {
      let title = '【深淵初誓者】';
      if (highest >= 100) title = '【永夜破曉·原初神話】👑';
      else if (highest >= 80) title = '【深淵征服者】';
      else if (highest >= 50) title = '【日蝕誅滅者】';
      else if (highest >= 30) title = '【霜血行者】';
      else if (highest >= 10) title = '【深淵新星】';
      recordEl.innerText = `第 ${highest} 層 (${title})`;
    }

    const selectEl = document.getElementById('select-tower-start-floor');
    if (selectEl) {
      const checkpoints = [1];
      for (let f = 10; f <= 90; f += 10) {
        if (highest >= f) {
          checkpoints.push(f + 1);
        }
      }
      selectEl.innerHTML = checkpoints.map(cp => {
        let desc = '荒蕪入口';
        if (cp >= 81) desc = '極夜深淵·破曉王座';
        else if (cp >= 61) desc = '虛空裂隙·母皇巢穴';
        else if (cp >= 41) desc = '日蝕聖殿·暴君領域';
        else if (cp >= 21) desc = '猩紅血沼·巨魘之窟';
        else if (cp >= 11) desc = '荒蕪禁區深處';
        return `<option value="${cp}">🚩 第 ${cp} 層 · ${desc}</option>`;
      }).join('');
      selectEl.value = checkpoints[checkpoints.length - 1];
      this.updateTowerPreview(parseInt(selectEl.value, 10));
    }

    this.openModal('modal-tower');
  }

  updateTowerPreview(floor) {
    const nameEl = document.getElementById('tower-preview-name');
    const bossEl = document.getElementById('tower-preview-boss');
    if (!nameEl || !bossEl) return;

    if (floor % 10 === 0) {
      nameEl.innerText = `第 ${floor} 層 · 世界 Boss 滅世之階`;
      let bName = '💀 噬骨魔靈·迦魯卡';
      if (floor === 20) bName = '🩸 猩紅血魘·凡爾納';
      else if (floor === 30) bName = '❄️ 永凍骸龍·席瓦';
      else if (floor === 40) bName = '🌑 終焉蝕日之主·歐瑟羅';
      else if (floor === 50) bName = '☀️ 日蝕暴君·索拉里斯';
      else if (floor === 60) bName = '🕷️ 虛空母皇·奈薩拉';
      else if (floor === 100) bName = '👑 永夜原初至尊·創世裁決者';
      bossEl.innerText = bName;
    } else if (floor % 5 === 0) {
      nameEl.innerText = `第 ${floor} 層 · 神契神龕與自選遺物休息層`;
      bossEl.innerText = '⛩️ 古代深淵神龕 (免費自選神契遺物) + 菁英守衛';
    } else {
      nameEl.innerText = `第 ${floor} 層 · 秘境魔潮清剿`;
      bossEl.innerText = `魔物魔潮 (${4 + Math.floor(floor / 8)} 隻魔物)`;
    }
  }

  updateAiTeammates(dt) {
    if (!this.aiTeammates || this.aiTeammates.size === 0) return;

    for (const ai of this.aiTeammates.values()) {
      if (ai.hp <= 0) continue;

      // 1. Find target (Boss or nearest active enemy within 420px)
      let target = null;
      if (this.boss.isActive && !this.boss.isDead) {
        target = this.boss;
      } else {
        let minDist = 420;
        for (const en of this.enemies) {
          if (en.isDead) continue;
          const d = Math.hypot(en.x - ai.x, en.y - ai.y);
          if (d < minDist) {
            minDist = d;
            target = en;
          }
        }
      }

      // 2. Movement & Combat AI
      if (target) {
        const dx = target.x - ai.x;
        const dy = target.y - ai.y;
        const dist = Math.hypot(dx, dy);
        ai.facingAngle = Math.atan2(dy, dx);

        if (dist > 75) {
          const speed = 195;
          ai.vx = (dx / dist) * speed;
          ai.vy = (dy / dist) * speed;
          ai.x += ai.vx * dt;
          ai.y += ai.vy * dt;
        } else {
          ai.vx = 0;
          ai.vy = 0;
        }

        // Basic Attack
        ai.attackCooldown -= dt;
        if (ai.attackCooldown <= 0 && dist < 130) {
          ai.isAttacking = true;
          ai.attackTimer = 0.25;
          ai.attackCooldown = 0.7 + Math.random() * 0.4;
          const dmg = Math.round((ai.data.level || 3) * 65 + Math.random() * 35);
          target.takeDamage(dmg, Math.random() < 0.3, 1.8, this.particles);
          this.particles.emitSparks(target.x, target.y, ai.data.color || '#ffd700', 8, 140);
        }

        // Skill Cast
        ai.skillCooldown -= dt;
        if (ai.skillCooldown <= 0 && dist < 160) {
          ai.skillCooldown = 5.5 + Math.random() * 3.0;
          this.particles.emitShockwaveRing(ai.x, ai.y, 110, ai.data.color || '#ffd700', 0.6);
          const skillDmg = Math.round((ai.data.level || 3) * 150);
          target.takeDamage(skillDmg, true, 2.0, this.particles);
        }
      } else {
        // Follow Player
        const dx = this.player.x - ai.x;
        const dy = this.player.y - ai.y;
        const dist = Math.hypot(dx, dy);
        ai.facingAngle = Math.atan2(dy, dx);

        if (dist > 85) {
          const speed = 210;
          ai.vx = (dx / dist) * speed;
          ai.vy = (dy / dist) * speed;
          ai.x += ai.vx * dt;
          ai.y += ai.vy * dt;
        } else {
          ai.vx = 0;
          ai.vy = 0;
        }
      }

      if (ai.attackTimer > 0) {
        ai.attackTimer -= dt;
        if (ai.attackTimer <= 0) ai.isAttacking = false;
      }

      this.dungeon.clampEntityToBounds(ai, 30);

      // Add light for AI
      this.lighting.addLight(ai.x, ai.y, 170, ai.data.color || '#ffd700', 0.6, false);

      // Synchronize into networkEngine remotePlayers map
      networkEngine.remotePlayers.set(ai.peerId, {
        peerId: ai.peerId,
        user: ai.user,
        x: ai.x,
        y: ai.y,
        targetX: ai.x,
        targetY: ai.y,
        vx: ai.vx,
        vy: ai.vy,
        facingAngle: ai.facingAngle,
        form: ai.form,
        hp: ai.hp,
        maxHp: ai.maxHp,
        isDodging: ai.isDodging,
        isAttacking: ai.isAttacking,
        weaponId: ai.weaponId,
        lastUpdate: Date.now()
      });
    }
  }

  // --- Hitbox Check for Linear AoE (Beams / Slashes) ---
  hitLineEnemies(startX, startY, angle, length, width, damage, critRate, critMult) {
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;

    for (const en of this.enemies) {
      if (en.isDead) continue;
      const dist = this.distToSegment(en.x, en.y, startX, startY, endX, endY);
      if (dist <= width / 2 + en.radius) {
        const isCrit = Math.random() < critRate;
        let finalDmg = damage;
        if (this.relicSystem.hasRelic('relic_colossus_smasher') && (en.isElite || en.isFrenzied)) {
          finalDmg = Math.round(finalDmg * 1.5);
        }
        if (this.relicSystem.hasRelic('relic_lumen_filament') && this.player.isInLightZone) {
          finalDmg = Math.round(finalDmg * 1.4);
        }
        en.takeDamage(finalDmg, isCrit, critMult, this.particles);
        this.relicSystem.onPlayerHitEnemy(this.player, en, finalDmg, isCrit, this.player.form === FORMS.RADIANT, this.enemies, this.particles);
      }
    }

    if (this.boss.isActive && !this.boss.isDead) {
      const dist = this.distToSegment(this.boss.x, this.boss.y, startX, startY, endX, endY);
      if (dist <= width / 2 + this.boss.radius) {
        const isCrit = Math.random() < critRate;
        let finalDmg = damage;
        if (this.relicSystem.hasRelic('relic_colossus_smasher')) {
          finalDmg = Math.round(finalDmg * 1.5);
        }
        if (this.relicSystem.hasRelic('relic_lumen_filament') && this.player.isInLightZone) {
          finalDmg = Math.round(finalDmg * 1.4);
        }
        this.boss.takeDamage(finalDmg, isCrit, critMult, this.particles);
        this.relicSystem.onPlayerHitEnemy(this.player, this.boss, finalDmg, isCrit, this.player.form === FORMS.RADIANT, this.enemies, this.particles);
      }
    }

    for (const pil of this.dungeon.pillars) {
      if (pil.isDestroyed) continue;
      const dist = this.distToSegment(pil.x, pil.y, startX, startY, endX, endY);
      if (dist <= width / 2 + pil.radius) {
        pil.takeDamage(damage, this.particles, this.player);
      }
    }
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // --- Update Loop ---
  update(dt) {
    if (this.state !== GAME_STATES.EXPEDITION) return;

    // 0. Hitstop (Impact Freeze)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Time Dilation calculation (Bullet Time during Perfect Dodge)
    let enemyDt = dt;
    if (this.timeDilationTimer > 0) {
      this.timeDilationTimer -= dt;
      enemyDt = dt * this.timeDilationFactor;
    }

    // 1. Update Lighting Light Sources
    this.lighting.clearLights();

    // Player Lantern Light
    this.lighting.addLight(
      this.player.x,
      this.player.y,
      this.player.getLightRadius(),
      this.player.form === FORMS.RADIANT ? '#ffd700' : '#c084fc',
      1.0,
      true
    );

    // Braziers Light
    for (const b of this.dungeon.braziers) {
      if (b.isLit) {
        this.lighting.addLight(b.x, b.y, b.lightRadius, '#ff9900', 0.9, true);
      }
    }

    this.lighting.update(dt);

    // 2. Player Update & Attacks
    this.player.facingAngle = Math.atan2(
      this.inputState.mouse.worldY - this.player.y,
      this.inputState.mouse.worldX - this.player.x
    );

    // Continuous attack on mouse hold or Turret Firing
    if (this.inputState.mouse.isDown) {
      if (this.mannedTurret) {
        this.mannedTurret.fire(
          this.inputState.mouse.worldX,
          this.inputState.mouse.worldY,
          this.enemyProjectiles,
          this.particles
        );
      } else {
        const atkRes = this.player.triggerBasicAttack(
          this.inputState.mouse.worldX,
          this.inputState.mouse.worldY,
          this.particles
        );

        if (atkRes && atkRes.type === 'melee') {
          this.performMeleeAttack(atkRes);
        }
      }
    }

    if (this.mannedTurret) {
      this.player.x = this.mannedTurret.x;
      this.player.y = this.mannedTurret.y + 15;
    }

    this.player.update(dt, this.inputState, this.lighting, this.particles);
    this.dungeon.clampEntityToBounds(this.player, 32, this.particles);

    // Check Player Death -> Defeat
    if (this.player.isDead) {
      this.triggerExpeditionOutcome(false);
      return;
    }

    // 3. Companion Update
    this.companion.update(dt, this.player, this.enemies, this.boss, this.dungeon, this.particles);
    this.dungeon.clampEntityToBounds(this.companion, 32);

    // 3.5 AI Teammates Update (Multiplayer AI Companions)
    this.updateAiTeammates(dt);

    // 4. Boss Trigger & Update
    if (!this.boss.isActive && this.player.x > 1300 && this.player.y > 800) {
      this.boss.isActive = true;
      audio.setMusicTrack('boss');
      audio.playBossRoar();
      this.showToast('首領降臨：噬骨魔靈·迦魯卡！', 'toast-crimson');
    }

    if (this.boss.isActive) {
      // Phase 2: Extinguish braziers
      if (this.boss.phase === 2 && this.boss.isShielded) {
        if (this.dungeon.areAllBossBraziersLit()) {
          // Break Shield & Stun Boss!
          this.boss.breakShieldAndStun(6.0, this.particles);
        }
      }

      this.boss.update(enemyDt, this.player, this.dungeon, this.particles, this.enemyProjectiles);
      this.dungeon.clampEntityToBounds(this.boss, 50);

      // Check Boss Death -> Victory
      if (this.boss.isDead) {
        const bossExp = Math.round(1500 * (1 + (this.dungeonTier - 1) * 0.5));
        this.runExp += bossExp;
        const expRes = this.player.gainExp(bossExp, this.particles);
        this.companion.gainExp(bossExp * 0.8, this.particles);
        this.particles.addFloatingText(this.boss.x, this.boss.y - 30, `+${bossExp} EXP (討伐首領)`, 'heal');

        // Boss mega loot drop! (High food and materials drop)
        this.dungeon.lootDrops.push(new LootDrop(this.boss.x, this.boss.y, 'ration', Math.floor(Math.random() * 40 + 80)));
        this.dungeon.lootDrops.push(new LootDrop(this.boss.x + 20, this.boss.y, 'iron', Math.floor(Math.random() * 50 + 60)));
        this.dungeon.lootDrops.push(new LootDrop(this.boss.x - 20, this.boss.y, 'shards', Math.floor(Math.random() * 30 + 30)));

        if (expRes && expRes.leveledUp) {
          const lvlDiff = expRes.newLevel - expRes.oldLevel;
          this.citadel.starlightShards += 15 * lvlDiff;
          this.citadel.forgeTickets += 1 * lvlDiff;
          this.showToast(`✨ 聖誓晉升！達到 Lv.${expRes.newLevel}！獲得 ${15 * lvlDiff} 碎屑與 ${lvlDiff} 鍛造券獎勵！`, 'toast-gold');
          SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
        }

        if (this.expeditionMode === 'tower') {
          if (this.currentTowerFloor >= 100) {
            this.showToast('👑 恭喜登頂天梯第 100 層！弒滅永夜原初至尊！達成終極神話大捷！', 'toast-gold');
            this.triggerExpeditionOutcome(true);
            return;
          } else {
            // Spawn Ascent Portal in tower floor
            if (this.dungeon.ascentPortals.length === 0) {
              this.dungeon.ascentPortals.push(new AscentPortal(900, 700, this.currentTowerFloor + 1));
              this.particles.emitShockwaveRing(900, 700, 250, '#ffd700', 1.2);
              this.particles.emitSparks(900, 700, '#38bdf8', 35, 250);
              this.showToast(`👑 滅世首領已被誅滅！天梯第 ${this.currentTowerFloor + 1} 層傳送陣已開啟！按 [F] 登梯！`, 'toast-gold');
            }
          }
        } else {
          this.triggerExpeditionOutcome(true);
          return;
        }
      }
    }

    // 4.5 Demonic Pillars Update (四大魔柱)
    this.dungeon.updatePillars(dt, this.particles, this);
    this.dungeon.updatePlayerRoomExploration(this.player);

    // 4.55 Tower Mode Floor Clearance & Ascent Portal Spawn
    if (this.expeditionMode === 'tower') {
      for (const ap of this.dungeon.ascentPortals) {
        ap.update(dt);
      }

      if (this.enemies.length === 0 && (!this.boss.isActive || this.boss.isDead)) {
        if (this.dungeon.ascentPortals.length === 0) {
          this.dungeon.ascentPortals.push(new AscentPortal(900, 700, this.currentTowerFloor + 1));
          this.particles.emitShockwaveRing(900, 700, 200, '#38bdf8', 1.0);
          this.particles.emitSparks(900, 700, '#ffd700', 30, 200);
          audio.playLevelUp();
          this.showToast(`🌀 第 ${this.currentTowerFloor} 層肅清！天梯登頂傳送陣已在中央降臨！按 [F] 登梯！`, 'toast-gold');
        }
      }
    }

    // 4.58 Citadel Siege Defense Mode Logic
    if (this.expeditionMode === 'siege') {
      // 1. Update Citadel Core
      if (this.dungeon.citadelCore) {
        this.dungeon.citadelCore.update(dt);
        if (this.dungeon.citadelCore.hp <= 0) {
          this.showToast('💀 堡壘聖核遭到深淵魔物摧毀！城防淪陷...', 'toast-crimson');
          this.triggerExpeditionOutcome(false);
          return;
        }
      }

      // 2. Update Defense Turrets
      for (const t of this.dungeon.turrets) {
        t.update(dt, this.enemies, this.boss, this.enemyProjectiles, this.particles, this.mannedTurret === t, this.inputState.mouse);
      }

      // 3. Update Garrison Guards
      for (const g of this.dungeon.garrisonGuards) {
        g.update(dt, this.enemies, this.boss, this.enemyProjectiles, this.particles);
      }

      // 4. Check Wave Clearance
      if (this.enemies.length === 0 && (!this.boss.isActive || this.boss.isDead)) {
        if (this.currentSiegeWave >= 5) {
          this.showToast('👑 恭喜成功守住 5 波血月魔潮！血月退散，要塞大捷！', 'toast-gold');
          this.triggerExpeditionOutcome(true);
          return;
        } else {
          this.siegeWaveTransitionTimer += dt;
          if (this.siegeWaveTransitionTimer >= 3.5) {
            this.siegeWaveTransitionTimer = 0;
            this.advanceToNextSiegeWave();
          }
        }
      }
    }

    // 4.6 Relic System Updates (Shields, Clones, Poison Ticks)
    this.relicSystem.update(dt, this.player, this.enemies, this.boss, this.particles);

    // 4.7 Cursed Chests Challenge Progress
    for (const cc of this.dungeon.cursedChests) {
      cc.update(dt);
      if (cc.state === 'challenging') {
        const nearbyEnemies = this.enemies.filter(en => !en.isDead && Math.hypot(en.x - cc.x, en.y - cc.y) < 550);
        if (nearbyEnemies.length === 0) {
          const reward = cc.clearChallenge(this.particles);
          if (reward) {
            this.runLoot.blackIron += reward.blackIron;
            this.runLoot.rations += reward.rations;
            this.runLoot.starlightShards += reward.starlightShards;
            const choices = this.relicSystem.getRandomChoices(1);
            if (choices.length > 0) {
              this.relicSystem.addRelic(choices[0].id);
              this.showToast(`👑 詛咒試煉大捷！獲得傳奇神遺物【${choices[0].name}】！`, 'toast-gold');
              this.updateRelicsHUD();
            }
          }
        }
      }
    }

    // 4.8 Dungeon Affixes Effects
    if (this.dungeonAffixes.includes('void_strike')) {
      this.affixVoidTimer += dt;
      if (this.affixVoidTimer >= 8.0) {
        this.affixVoidTimer = 0;
        const targetX = this.player.x + (Math.random() - 0.5) * 350;
        const targetY = this.player.y + (Math.random() - 0.5) * 350;
        this.particles.emitShockwaveRing(targetX, targetY, 80, '#c084fc', 0.5);
        this.particles.emitSparks(targetX, targetY, '#c084fc', 12, 100);
      }
    }

    // 5. Enemies Update
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      en.update(enemyDt, this.player, this.lighting, this.particles, this.enemyProjectiles);
      this.dungeon.clampEntityToBounds(en, 28);

      // In siege mode, attack Citadel Core if nearby
      if (this.expeditionMode === 'siege' && this.dungeon.citadelCore && !this.dungeon.citadelCore.isDestroyed) {
        const dCore = Math.hypot(this.dungeon.citadelCore.x - en.x, this.dungeon.citadelCore.y - en.y);
        if (dCore < this.dungeon.citadelCore.radius + en.radius + 15) {
          this.dungeon.citadelCore.takeDamage(en.damage * enemyDt * 0.5, this.particles, en);
        }
      }

      if (en.isDead) {
        this.runKills++;

        // Calculate and grant EXP
        let baseExp = 35;
        if (en.type === ENEMY_TYPES.STALKER) baseExp = 55;
        else if (en.type === ENEMY_TYPES.KNIGHT) baseExp = 110;
        else if (en.type === ENEMY_TYPES.CASTER) baseExp = 80;
        if (en.isElite) baseExp = Math.round(baseExp * 2.5);

        const expGain = Math.round(baseExp * (1 + (this.dungeonTier - 1) * 0.35));
        this.runExp += expGain;
        const expRes = this.player.gainExp(expGain, this.particles);
        this.companion.gainExp(expGain * 0.8, this.particles);
        this.particles.addFloatingText(en.x, en.y - 15, `+${expGain} EXP`, 'heal');

        if (expRes && expRes.leveledUp) {
          const lvlDiff = expRes.newLevel - expRes.oldLevel;
          this.citadel.starlightShards += 15 * lvlDiff;
          this.citadel.forgeTickets += 1 * lvlDiff;
          this.showToast(`✨ 聖誓晉升！達到 Lv.${expRes.newLevel}！獲得 ${15 * lvlDiff} 碎屑與 ${lvlDiff} 鍛造券獎勵！`, 'toast-gold');
          SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
        }

        // Spawn loot drops
        this.dungeon.lootDrops.push(new LootDrop(en.x, en.y, 'iron', Math.floor(Math.random() * 8 + 4)));
        if (Math.random() < 0.55 || en.isElite || en.isFrenzied) {
          const rationAmt = en.isElite ? Math.floor(Math.random() * 15 + 20) : Math.floor(Math.random() * 6 + 6);
          this.dungeon.lootDrops.push(new LootDrop(en.x + 8, en.y - 8, 'ration', rationAmt));
        }
        if (Math.random() < 0.6) {
          this.dungeon.lootDrops.push(new LootDrop(en.x, en.y, 'oil', 1));
        }
        if (Math.random() < 0.4) {
          this.dungeon.lootDrops.push(new LootDrop(en.x, en.y, 'shards', Math.floor(Math.random() * 6 + 3)));
        }
        this.enemies.splice(i, 1);
      }
    }

    // 6. Projectiles (Enemy & Friendly Turrets/Guards)
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      const pDt = p.isPlayerSide ? dt : enemyDt;
      p.x += p.vx * pDt;
      p.y += p.vy * pDt;
      p.traveled = (p.traveled || 0) + Math.hypot(p.vx * dt, p.vy * dt);

      // Despawn if out of map bounds
      if (p.x < 0 || p.x > this.dungeon.width || p.y < 0 || p.y > this.dungeon.height || p.traveled >= 900) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (p.isPlayerSide) {
        let hit = false;
        for (const en of this.enemies) {
          if (en.isDead) continue;
          if (Math.hypot(en.x - p.x, en.y - p.y) < en.radius + p.radius) {
            hit = true;
            if (p.aoeRadius && p.aoeRadius > 0) {
              this.particles.emitShockwaveRing(p.x, p.y, p.aoeRadius, p.color || '#fbbf24', 0.5);
              this.particles.emitSparks(p.x, p.y, p.color || '#fbbf24', 20, 180);
              for (const aoeEn of this.enemies) {
                if (!aoeEn.isDead && Math.hypot(aoeEn.x - p.x, aoeEn.y - p.y) <= p.aoeRadius) {
                  aoeEn.takeDamage(p.damage, true, 1.3, this.particles);
                }
              }
              if (this.boss.isActive && !this.boss.isDead && Math.hypot(this.boss.x - p.x, this.boss.y - p.y) <= p.aoeRadius) {
                this.boss.takeDamage(p.damage, true, 1.3, this.particles);
              }
            } else {
              en.takeDamage(p.damage, true, 1.2, this.particles);
            }
            break;
          }
        }
        if (!hit && this.boss.isActive && !this.boss.isDead) {
          if (Math.hypot(this.boss.x - p.x, this.boss.y - p.y) < 50 + p.radius) {
            hit = true;
            this.boss.takeDamage(p.damage, true, 1.2, this.particles);
            this.particles.emitSparks(p.x, p.y, p.color || '#ffd700', 12, 120);
          }
        }
        if (hit) {
          this.enemyProjectiles.splice(i, 1);
          continue;
        }
      } else {
        // Monster projectiles hitting player or Citadel Core
        if (this.expeditionMode === 'siege' && this.dungeon.citadelCore && !this.dungeon.citadelCore.isDestroyed) {
          if (Math.hypot(this.dungeon.citadelCore.x - p.x, this.dungeon.citadelCore.y - p.y) < this.dungeon.citadelCore.radius + p.radius) {
            this.dungeon.citadelCore.takeDamage(p.damage, this.particles);
            this.enemyProjectiles.splice(i, 1);
            continue;
          }
        }
        if (Math.hypot(this.player.x - p.x, this.player.y - p.y) < this.player.radius + p.radius) {
          this.player.takeDamage(p.damage, this.particles);
          this.relicSystem.onPlayerDamaged(this.player, p.damage, this.particles, this.enemies);
          this.enemyProjectiles.splice(i, 1);
          continue;
        }
      }

      if (p.traveled >= p.range) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 7. Player Projectiles Collision
    for (let i = this.player.activeProjectiles.length - 1; i >= 0; i--) {
      const p = this.player.activeProjectiles[i];
      let hit = false;

      for (const en of this.enemies) {
        if (en.isDead) continue;
        if (Math.hypot(en.x - p.x, en.y - p.y) < en.radius + 10) {
          const isCrit = Math.random() < p.critRate;
          let finalDmg = p.damage;
          if (this.relicSystem.hasRelic('relic_colossus_smasher') && (en.isElite || en.isFrenzied)) {
            finalDmg = Math.round(finalDmg * 1.5);
          }
          if (this.relicSystem.hasRelic('relic_lumen_filament') && this.player.isInLightZone) {
            finalDmg = Math.round(finalDmg * 1.4);
          }

          en.takeDamage(finalDmg, isCrit, p.critMult, this.particles);
          this.relicSystem.onPlayerHitEnemy(this.player, en, finalDmg, isCrit, this.player.form === FORMS.RADIANT, this.enemies, this.particles);
          hit = true;
          break;
        }
      }

      if (!hit && this.boss.isActive && !this.boss.isDead) {
        if (Math.hypot(this.boss.x - p.x, this.boss.y - p.y) < this.boss.radius + 10) {
          const isCrit = Math.random() < p.critRate;
          let finalDmg = p.damage;
          if (this.relicSystem.hasRelic('relic_colossus_smasher')) {
            finalDmg = Math.round(finalDmg * 1.5);
          }
          if (this.relicSystem.hasRelic('relic_lumen_filament') && this.player.isInLightZone) {
            finalDmg = Math.round(finalDmg * 1.4);
          }

          this.boss.takeDamage(finalDmg, isCrit, p.critMult, this.particles);
          this.relicSystem.onPlayerHitEnemy(this.player, this.boss, finalDmg, isCrit, this.player.form === FORMS.RADIANT, this.enemies, this.particles);
          hit = true;
        }
      }

      if (!hit) {
        for (const pil of this.dungeon.pillars) {
          if (pil.isDestroyed) continue;
          if (Math.hypot(pil.x - p.x, pil.y - p.y) < pil.radius + 12) {
            pil.takeDamage(p.damage, this.particles, this.player);
            hit = true;
            break;
          }
        }
      }

      if (hit) {
        this.player.activeProjectiles.splice(i, 1);
      }
    }

    // 8. Loot Collection
    const collected = this.dungeon.updateLootCollection(this.player, this.companion, this.particles);
    const greedMult = this.relicSystem.hasRelic('relic_greed_chalice') ? 2 : 1;
    if (collected.iron > 0) this.runLoot.blackIron += collected.iron * greedMult;
    if (collected.rations > 0) this.runLoot.rations += collected.rations * greedMult;
    else if (collected.ration > 0) this.runLoot.rations += collected.ration * greedMult;
    if (collected.shards > 0) this.runLoot.starlightShards += collected.shards * greedMult;

    // 9. Particles & Screen Shake
    this.particles.update(dt);

    // 10. Smooth Camera Follow
    const targetCamX = this.player.x - this.canvas.width / 2;
    const targetCamY = this.player.y - this.canvas.height / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraY += (targetCamY - this.cameraY) * 0.1;

    // 11. Multiplayer State & Tactical Sync
    networkEngine.broadcastPlayerState(this.player);
    networkEngine.update(dt);
    chatSystem.update(dt);
    this.updatePartyHUD();

    // Update HUD
    this.updateHUD();
  }

  performMeleeAttack(atkData) {
    const isBackstabBonus = this.player.equippedWeapon.id === 'ssr_eclipse_fangs' && this.player.form === FORMS.SHADOW;

    // 1. PARRY & DEFLECT HOSTILE PROJECTILES (彈刀反彈彈幕)
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      if (p.isPlayerSide) continue;
      const d = Math.hypot(p.x - atkData.x, p.y - atkData.y);
      if (d <= atkData.range + 45) {
        p.isPlayerSide = true;
        p.vx = -p.vx * 2.5;
        p.vy = -p.vy * 2.5;
        p.damage = Math.round(p.damage * 3.0);
        p.color = '#ffd700';
        p.traveled = 0;
        this.particles.emitParrySparks(p.x, p.y);
        this.particles.addFloatingText(this.player.x, this.player.y - 20, 'PARRY DEFLECT', 'parry');
        audio.playParry();
        this.hitstopTimer = 0.08;
      }
    }

    // 2. MELEE STRIKE & PARRY COUNTER ON ATTACKING ENEMIES
    for (const en of this.enemies) {
      if (en.isDead) continue;
      const dx = en.x - atkData.x;
      const dy = en.y - atkData.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= atkData.range + en.radius + 15) {
        const angleToTarget = Math.atan2(dy, dx);
        let angleDiff = Math.abs(angleToTarget - atkData.angle);
        while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        if (angleDiff <= atkData.arc / 2) {
          // Check Blade Clash Parry Counter
          if (en.isWindup || en.attackTelegraphTimer > 0) {
            en.stagger(2.2, this.particles);
            this.particles.emitParrySparks(en.x, en.y);
            this.particles.addFloatingText(this.player.x, this.player.y - 25, 'PARRY COUNTER', 'parry');
            audio.playParry();
            this.hitstopTimer = 0.08;
          }

          const isCrit = Math.random() < atkData.critRate;
          let finalDmg = atkData.damage;
          if (this.relicSystem.hasRelic('relic_colossus_smasher') && (en.isElite || en.isFrenzied)) {
            finalDmg = Math.round(finalDmg * 1.5);
          }
          if (this.relicSystem.hasRelic('relic_lumen_filament') && this.player.isInLightZone) {
            finalDmg = Math.round(finalDmg * 1.4);
          }

          const detRes = en.takeDamage(
            finalDmg,
            isCrit,
            atkData.critMult,
            this.particles,
            this.player.form === FORMS.RADIANT ? 'radiant' : 'shadow'
          );

          if (detRes && detRes.isDetonation) {
            this.triggerEclipseNovaDetonation(detRes.x, detRes.y, detRes.damage);
          }

          this.relicSystem.onPlayerHitEnemy(this.player, en, finalDmg, isCrit, this.player.form === FORMS.RADIANT, this.enemies, this.particles);

          if (isBackstabBonus) {
            this.player.shadowEnergy = Math.min(this.player.maxEnergy, this.player.shadowEnergy + 10);
          }
        }
      }
    }

    if (this.boss.isActive && !this.boss.isDead) {
      const dx = this.boss.x - atkData.x;
      const dy = this.boss.y - atkData.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= atkData.range + this.boss.radius) {
        const angleToTarget = Math.atan2(dy, dx);
        let angleDiff = Math.abs(angleToTarget - atkData.angle);
        while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        if (angleDiff <= atkData.arc / 2) {
          const isCrit = Math.random() < atkData.critRate;
          let finalDmg = atkData.damage;
          if (this.relicSystem.hasRelic('relic_colossus_smasher')) {
            finalDmg = Math.round(finalDmg * 1.5);
          }
          if (this.relicSystem.hasRelic('relic_lumen_filament') && this.player.isInLightZone) {
            finalDmg = Math.round(finalDmg * 1.4);
          }

          const bossDetRes = this.boss.takeDamage(
            finalDmg,
            isCrit,
            atkData.critMult,
            this.particles,
            this.player.form === FORMS.RADIANT ? 'radiant' : 'shadow'
          );

          if (bossDetRes && bossDetRes.isDetonation) {
            this.triggerEclipseNovaDetonation(bossDetRes.x, bossDetRes.y, bossDetRes.damage);
          }

          this.relicSystem.onPlayerHitEnemy(this.player, this.boss, finalDmg, isCrit, this.player.form === FORMS.RADIANT, this.enemies, this.particles);
        }
      }
    }

    // Demonic Pillars Melee Damage
    for (const pil of this.dungeon.pillars) {
      if (pil.isDestroyed) continue;
      const dx = pil.x - atkData.x;
      const dy = pil.y - atkData.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= atkData.range + pil.radius) {
        const angleToTarget = Math.atan2(dy, dx);
        let angleDiff = Math.abs(angleToTarget - atkData.angle);
        while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        if (angleDiff <= atkData.arc / 2) {
          pil.takeDamage(atkData.damage, this.particles, this.player);
        }
      }
    }
  }

  triggerExpeditionOutcome(isVictory) {
    this.state = isVictory ? GAME_STATES.VICTORY : GAME_STATES.DEFEAT;
    const modal = document.getElementById('expedition-outcome-modal');
    const title = document.getElementById('outcome-title');
    const box = modal.querySelector('.outcome-box');
    const ratingBadge = document.getElementById('outcome-rating-badge');

    const durationSec = Math.max(1, Math.floor((Date.now() - this.runStartTime) / 1000));
    const mins = Math.floor(durationSec / 60).toString().padStart(2, '0');
    const secs = (durationSec % 60).toString().padStart(2, '0');

    const destroyedPillars = this.dungeon.pillars.filter(p => p.isDestroyed).length;
    const totalPillars = this.dungeon.pillars.length;

    let rating = 'B';
    if (isVictory) {
      title.innerText = '⚔️ 遠征大捷：深淵肅清！';
      box.classList.remove('defeat');

      const tierBonus = this.dungeonTier * 40;
      this.runLoot.blackIron += 150 + tierBonus;
      this.runLoot.starlightShards += 80 + tierBonus;
      this.citadel.forgeTickets += this.dungeonTier >= 3 ? 3 : 2;

      if (durationSec <= 150 && (totalPillars === 0 || destroyedPillars === totalPillars)) {
        rating = 'S';
      } else if (durationSec <= 240) {
        rating = 'A';
      } else {
        rating = 'B';
      }

      // Bonus food rewards according to rating
      let bonusRations = 40;
      if (rating === 'S') bonusRations = 120;
      else if (rating === 'A') bonusRations = 75;
      this.runLoot.rations += bonusRations;
    } else {
      title.innerText = '💀 提燈熄滅：遠征潰敗...';
      box.classList.add('defeat');
      rating = 'C';
    }

    if (ratingBadge) {
      ratingBadge.innerText = rating;
      if (rating === 'S') {
        ratingBadge.style.background = 'radial-gradient(circle, #fde047, #b45309)';
        ratingBadge.style.color = '#000';
      } else if (rating === 'A') {
        ratingBadge.style.background = 'radial-gradient(circle, #a855f7, #6b21a8)';
        ratingBadge.style.color = '#fff';
      } else {
        ratingBadge.style.background = 'radial-gradient(circle, #38bdf8, #0369a1)';
        ratingBadge.style.color = '#fff';
      }
    }

    const timeEl = document.getElementById('outcome-stat-time');
    const killsEl = document.getElementById('outcome-stat-kills');
    const pillarsEl = document.getElementById('outcome-stat-pillars');
    if (timeEl) timeEl.innerText = `${mins}:${secs}`;
    if (killsEl) killsEl.innerText = `${this.runKills}`;
    if (pillarsEl) pillarsEl.innerText = `${destroyedPillars} / ${totalPillars}`;

    // Apply Loot to Citadel
    this.citadel.applyExpeditionLoot(this.runLoot);

    document.getElementById('outcome-loot-display').innerHTML = `
      <div class="loot-reward-item">⭐ 獲得經驗: +${this.runExp || 0} EXP</div>
      <div class="loot-reward-item">⛓️ 黑鐵 +${this.runLoot.blackIron}</div>
      <div class="loot-reward-item">🍞 糧草 +${this.runLoot.rations}</div>
      <div class="loot-reward-item">✨ 星光碎屑 +${this.runLoot.starlightShards}</div>
      <div class="loot-reward-item">💀 討伐魔物: ${this.runKills} 隻</div>
    `;

    modal.classList.add('active');
  }

  updateHUD() {
    // 1. Health Bar
    const hpFill = document.getElementById('hud-hp-fill');
    const hpVal = document.getElementById('hud-hp-val');
    const maxHp = this.player.getMaxHp();
    if (hpFill) hpFill.style.width = `${Math.max(0, (this.player.hp / maxHp) * 100)}%`;
    if (hpVal) hpVal.innerText = `${Math.max(0, Math.round(this.player.hp))} / ${maxHp}`;

    // 2. Dual Form Energy
    const energyFill = document.getElementById('hud-energy-fill');
    const energyVal = document.getElementById('hud-energy-val');
    const curEnergy = this.player.form === FORMS.RADIANT ? this.player.radiantEnergy : this.player.shadowEnergy;
    if (energyFill) {
      energyFill.style.width = `${curEnergy}%`;
      if (this.player.form === FORMS.SHADOW) {
        energyFill.classList.add('shadow-mode');
      } else {
        energyFill.classList.remove('shadow-mode');
      }
    }
    if (energyVal) energyVal.innerText = `${Math.round(curEnergy)} / 100`;

    // 3. Lantern Fuel
    const lanternFill = document.getElementById('hud-lantern-fill');
    const lanternVal = document.getElementById('hud-lantern-val');
    if (lanternFill) lanternFill.style.width = `${this.player.lanternFuel}%`;
    if (lanternVal) lanternVal.innerText = `${Math.round(this.player.lanternFuel)}%`;

    // 3.5 Player Level & EXP Gauge (等級與經驗進度)
    const levelBadge = document.getElementById('hud-player-level');
    if (levelBadge) levelBadge.innerText = `Lv.${this.player.level || 1}`;

    const expFill = document.getElementById('hud-exp-fill');
    const expVal = document.getElementById('hud-exp-val');
    const maxExp = this.player.getMaxExp();
    const curExp = this.player.exp || 0;
    const expPct = Math.min(100, Math.max(0, (curExp / maxExp) * 100));
    if (expFill) expFill.style.width = `${expPct}%`;
    if (expVal) expVal.innerText = `${curExp} / ${maxExp} (${Math.round(expPct)}%)`;

    // 4. Form Portrait & Peak Shift
    const formRing = document.getElementById('hud-form-ring');
    const formIcon = document.getElementById('hud-form-icon');
    const isPeak = curEnergy >= 100;

    if (formRing) {
      if (this.player.form === FORMS.SHADOW) {
        formRing.classList.add('shadow-active');
      } else {
        formRing.classList.remove('shadow-active');
      }
      if (isPeak) {
        formRing.classList.add('peak-shift-ready');
      } else {
        formRing.classList.remove('peak-shift-ready');
      }
    }
    if (formIcon) {
      formIcon.innerText = this.player.form === FORMS.RADIANT ? '☀️' : '🌑';
    }

    // 5. Zone, Demonic Pillars, Tower Floor & Siege Core Status Tracker
    const siegeBadge = document.getElementById('hud-siege-badge');
    const siegeCoreText = document.getElementById('hud-siege-core-text');
    const siegeWaveText = document.getElementById('hud-siege-wave-text');
    const towerBadge = document.getElementById('hud-tower-badge');
    const towerText = document.getElementById('hud-tower-floor-text');
    const pillarBadge = document.getElementById('hud-pillar-badge');
    const zoneDot = document.getElementById('hud-zone-dot');
    const zoneText = document.getElementById('hud-zone-text');
    const zoneBuff = document.getElementById('hud-zone-buff');
    const curZ = this.dungeon.currentZone || MAP_ZONES.barren_wastes;

    if (this.expeditionMode === 'siege') {
      if (siegeBadge) siegeBadge.style.display = 'flex';
      if (siegeCoreText && this.dungeon.citadelCore) {
        const corePct = Math.max(0, Math.round((this.dungeon.citadelCore.hp / this.dungeon.citadelCore.maxHp) * 100));
        siegeCoreText.innerText = `${corePct}%`;
        siegeCoreText.style.color = corePct > 50 ? '#4ade80' : (corePct > 25 ? '#fde047' : '#ef4444');
      }
      if (siegeWaveText) siegeWaveText.innerText = `🌊 第 ${this.currentSiegeWave} / 5 波`;
      if (towerBadge) towerBadge.style.display = 'none';
      if (pillarBadge) pillarBadge.style.display = 'none';
      if (zoneText) zoneText.innerText = `終末要塞·血月守城 (第 ${this.currentSiegeWave} 波)`;
    } else if (this.expeditionMode === 'tower') {
      if (siegeBadge) siegeBadge.style.display = 'none';
      if (towerBadge) towerBadge.style.display = 'flex';
      if (towerText) towerText.innerText = `第 ${this.currentTowerFloor} / 100 層`;
      if (pillarBadge) pillarBadge.style.display = 'none';
      if (zoneText) zoneText.innerText = `永夜天梯 · 第 ${this.currentTowerFloor} 層 (${curZ.name})`;
    } else {
      if (siegeBadge) siegeBadge.style.display = 'none';
      if (towerBadge) towerBadge.style.display = 'none';
      if (pillarBadge) pillarBadge.style.display = 'flex';
      if (zoneText) zoneText.innerText = `${curZ.name} (${curZ.engName})`;
    }
    
    if (this.player.isInLightZone) {
      if (zoneDot) zoneDot.classList.remove('in-darkness');
      if (zoneBuff) {
        zoneBuff.classList.remove('dark-buff');
        zoneBuff.innerText = curZ.hazard;
      }
    } else {
      if (zoneDot) zoneDot.classList.add('in-darkness');
      if (zoneBuff) {
        zoneBuff.classList.add('dark-buff');
        zoneBuff.innerText = '⚡ 黯影暴擊率 +40% | 黑暗侵蝕中';
      }
    }

    // Pillars Count Tracker
    const destroyedPillars = this.dungeon.pillars.filter(p => p.isDestroyed).length;
    const totalPillars = this.dungeon.pillars.length;
    const pillarCountEl = document.getElementById('hud-pillar-count');
    if (pillarCountEl) {
      pillarCountEl.innerText = `${destroyedPillars} / ${totalPillars}`;
    }

    // 6. Boss Bar
    const bossContainer = document.getElementById('boss-health-container');
    if (this.boss.isActive && !this.boss.isDead) {
      bossContainer.style.display = 'flex';
      const bossFill = document.getElementById('boss-hp-fill');
      const bossShield = document.getElementById('boss-shield-fill');
      const bossHint = document.getElementById('boss-mechanic-text');

      if (bossFill) bossFill.style.width = `${(this.boss.hp / this.boss.maxHp) * 100}%`;
      if (bossShield) bossShield.style.display = this.boss.isShielded ? 'block' : 'none';

      if (this.boss.isShielded) {
        bossHint.innerText = '⚠️ 首領處於暗影狂暴護盾！請點燃 3 座神聖火盆破盾！';
      } else if (this.boss.stunTimer > 0) {
        bossHint.innerText = '💥 神聖領域生效！首領防禦崩解，全力爆發輸出！';
      } else {
        bossHint.innerText = `階段 ${this.boss.phase}：小心地面爆發的骨刺與深淵風暴！`;
      }
    } else {
      bossContainer.style.display = 'none';
    }

    // 7. Skill Cooldown Slots
    const qSlot = document.getElementById('slot-q');
    const eSlot = document.getElementById('slot-e');
    const rSlot = document.getElementById('slot-r');

    this.updateSlotCd(qSlot, this.player.skillQCooldown);
    this.updateSlotCd(eSlot, this.player.skillECooldown);
    this.updateSlotCd(rSlot, this.player.skillRCooldown);

    // Companion HUD
    document.getElementById('hud-comp-name').innerText = this.companion.data.name.split('·')[0];
    document.getElementById('hud-comp-skill').innerText = `[F] ${this.companion.data.activeSkillName}`;
  }

  updateSlotCd(slotElem, cd) {
    if (!slotElem) return;
    const overlay = slotElem.querySelector('.skill-cooldown-overlay');
    if (cd > 0) {
      slotElem.classList.add('on-cooldown');
      if (overlay) overlay.innerText = cd.toFixed(1);
    } else {
      slotElem.classList.remove('on-cooldown');
    }
  }

  // --- Render Loop ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const renderCamX = this.cameraX + this.particles.shakeOffsetX;
    const renderCamY = this.cameraY + this.particles.shakeOffsetY;

    // 1. Draw World & Dungeon
    this.dungeon.render(this.ctx, renderCamX, renderCamY, this.canvas.width, this.canvas.height);

    // 2. Draw Enemies
    for (const en of this.enemies) {
      en.render(this.ctx, renderCamX, renderCamY);
    }

    // 3. Draw Enemy Projectiles
    for (const p of this.enemyProjectiles) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(p.x - renderCamX, p.y - renderCamY, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.restore();
    }

    // 4. Draw Boss
    this.boss.render(this.ctx, renderCamX, renderCamY);

    // 5. Draw Companion
    this.companion.render(this.ctx, renderCamX, renderCamY);

    // 5.5 Draw Relic Clones
    this.relicSystem.renderShadowClones(this.ctx, renderCamX, renderCamY);

    // 6. Draw Player & Remote Multiplayer Allies
    this.player.render(this.ctx, renderCamX, renderCamY);
    networkEngine.renderRemotePlayers(this.ctx, renderCamX, renderCamY);

    // 7. Render Particles & Floating Combat Text & Tactical Ground Pings
    this.particles.render(this.ctx, renderCamX, renderCamY);
    chatSystem.renderWorldPings(this.ctx, renderCamX, renderCamY);

    // 8. Overlay Dynamic Chiaroscuro Darkness & Lighting
    this.lighting.render(this.ctx, renderCamX, renderCamY, this.canvas.width, this.canvas.height);

    // 9. Render Tactical Radar Mini-Map with Teammates & Pings
    if (this.state === GAME_STATES.EXPEDITION) {
      minimap.render(
        this.dungeon,
        this.player,
        this.companion,
        this.enemies,
        this.boss,
        networkEngine.remotePlayers,
        chatSystem.activePings
      );
    }
  }

  gameLoop(currentTime) {
    const dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    try {
      this.update(dt);
      this.render();
    } catch (loopError) {
      console.warn('🛡️ [Loop Exception Guard Intercepted]:', loopError);
      diagnostics.autoCorrectRuntimeState(this, loopError);
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Start Game on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  const game = new EvernightGame();
  game.init();
});
