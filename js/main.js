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
import { CitadelSystem } from './citadel.js';
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
    this.forge = new AncestralForge();
    this.arsenal = new ArsenalSanctum();

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

    audio.setMusicTrack('expedition');
    this.showToast(`進入秘境副本：${this.dungeon.currentZone.name} (階級 ${this.dungeonTier} · 種子 #${this.dungeonSeed})`, 'toast-gold');
  }

  triggerFormShift() {
    const shiftRes = this.player.toggleForm(this.particles);
    if (shiftRes && shiftRes.isCataclysm) {
      for (const en of this.enemies) {
        if (en.isDead) continue;
        if (Math.hypot(en.x - shiftRes.x, en.y - shiftRes.y) < shiftRes.radius) {
          en.takeDamage(shiftRes.damage, true, 1.5, this.particles);
          en.stun(2.0, this.particles);
        }
      }
      if (this.boss.isActive && !this.boss.isDead && Math.hypot(this.boss.x - shiftRes.x, this.boss.y - shiftRes.y) < shiftRes.radius) {
        this.boss.takeDamage(shiftRes.damage, true, 1.5, this.particles);
      }
    }
  }

  setupEventListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.inputState.keys[e.code] = true;
      audio.init();

      if (this.state === GAME_STATES.EXPEDITION) {
        // Space or Tab: Form Switch
        if (e.code === 'Space' || e.code === 'Tab') {
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

        // F: Interact / Companion Skill
        if (e.code === 'KeyF') {
          const interactRes = this.dungeon.interactClosest(this.player, this.particles);
          if (!interactRes) {
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
        // Right click: Dodge roll
        if (this.state === GAME_STATES.EXPEDITION) {
          const angle = Math.atan2(
            this.inputState.mouse.worldY - this.player.y,
            this.inputState.mouse.worldX - this.player.x
          );
          this.player.dodge(angle, this.particles);
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

    // Start Expedition Button in Citadel
    document.getElementById('btn-start-expedition')?.addEventListener('click', () => {
      this.startExpedition();
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
      networkEngine.joinRoomByCode(code);
      this.showToast(`正在嘗試加入房間【${code}】...`, 'toast-cyan');
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

    document.getElementById('btn-leave-room')?.addEventListener('click', () => {
      networkEngine.leaveRoom();
      this.updateMultiplayerModal();
      this.showToast('已離開遠征房間。', 'toast-purple');
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

  updateCitadelModal() {
    document.getElementById('res-rations').innerText = this.citadel.rations;
    document.getElementById('res-iron').innerText = this.citadel.blackIron;
    document.getElementById('res-oil').innerText = this.citadel.lumenOil;
    document.getElementById('res-morale').innerText = `${this.citadel.morale}%`;
    document.getElementById('res-survivors').innerText = this.citadel.survivors;
    document.getElementById('res-shards').innerText = this.citadel.starlightShards;
    document.getElementById('res-tickets').innerText = this.citadel.forgeTickets;

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

      // Render Public Rooms List
      const list = document.getElementById('public-rooms-list');
      if (list) {
        if (networkEngine.publicRooms.size === 0) {
          list.innerHTML = `<div style="color:var(--text-muted); font-size:0.85rem; padding: 16px; text-align:center;">目前無公開小隊，請創建房間或輸入 4 位數房號加入！</div>`;
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

      if (networkEngine.isHost) {
        if (launchBtn) launchBtn.style.display = 'block';
        if (readyBtn) readyBtn.style.display = 'none';
      } else {
        if (launchBtn) launchBtn.style.display = 'none';
        if (readyBtn) readyBtn.style.display = 'block';
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
                <div class="seat-avatar">${p.user?.avatar?.icon || '☀️'}</div>
                <div style="font-weight: 700; color: #fff; font-size: 0.95rem;">${p.user?.username || '隊友'}</div>
                <div style="font-size: 0.75rem; color: #fde047;">${p.user?.title || '【聖誓者】'}</div>
                <div class="seat-ready-status ${p.isReady ? 'ready' : 'waiting'}">
                  ${p.isReady ? '✅ 已準備' : '⏳ 等待中'}
                </div>
              </div>
            `;
          } else {
            html += `
              <div class="player-seat-card empty">
                <span style="font-size: 2rem;">➕</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">等待聖誓者加入...</span>
              </div>
            `;
          }
        }
        seatsContainer.innerHTML = html;
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

  // --- Hitbox Check for Linear AoE (Beams / Slashes) ---
  hitLineEnemies(startX, startY, angle, length, width, damage, critRate, critMult) {
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;

    for (const en of this.enemies) {
      if (en.isDead) continue;
      const dist = this.distToSegment(en.x, en.y, startX, startY, endX, endY);
      if (dist <= width / 2 + en.radius) {
        en.takeDamage(damage, Math.random() < critRate, critMult, this.particles);
      }
    }

    if (this.boss.isActive && !this.boss.isDead) {
      const dist = this.distToSegment(this.boss.x, this.boss.y, startX, startY, endX, endY);
      if (dist <= width / 2 + this.boss.radius) {
        this.boss.takeDamage(damage, Math.random() < critRate, critMult, this.particles);
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

    // Continuous attack on mouse hold
    if (this.inputState.mouse.isDown) {
      const atkRes = this.player.triggerBasicAttack(
        this.inputState.mouse.worldX,
        this.inputState.mouse.worldY,
        this.particles
      );

      if (atkRes && atkRes.type === 'melee') {
        this.performMeleeAttack(atkRes);
      }
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

      this.boss.update(dt, this.player, this.dungeon, this.particles, this.enemyProjectiles);
      this.dungeon.clampEntityToBounds(this.boss, 50);

      // Check Boss Death -> Victory
      if (this.boss.isDead) {
        const bossExp = Math.round(1500 * (1 + (this.dungeonTier - 1) * 0.5));
        this.runExp += bossExp;
        const expRes = this.player.gainExp(bossExp, this.particles);
        this.companion.gainExp(bossExp * 0.8, this.particles);
        this.particles.addFloatingText(this.boss.x, this.boss.y - 30, `+${bossExp} EXP (討伐首領)`, 'heal');
        if (expRes && expRes.leveledUp) {
          const lvlDiff = expRes.newLevel - expRes.oldLevel;
          this.citadel.starlightShards += 15 * lvlDiff;
          this.citadel.forgeTickets += 1 * lvlDiff;
          this.showToast(`✨ 聖誓晉升！達到 Lv.${expRes.newLevel}！獲得 ${15 * lvlDiff} 碎屑與 ${lvlDiff} 鍛造券獎勵！`, 'toast-gold');
          SaveSystem.save(this.player, this.companion, this.citadel, this.arsenal);
        }
        this.triggerExpeditionOutcome(true);
        return;
      }
    }

    // 4.5 Demonic Pillars Update (四大魔柱)
    this.dungeon.updatePillars(dt, this.particles, this);
    this.dungeon.updatePlayerRoomExploration(this.player);

    // 4.6 Dungeon Affixes Effects
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
      en.update(dt, this.player, this.lighting, this.particles, this.enemyProjectiles);
      this.dungeon.clampEntityToBounds(en, 28);

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
        if (Math.random() < 0.6) {
          this.dungeon.lootDrops.push(new LootDrop(en.x, en.y, 'oil', 1));
        }
        if (Math.random() < 0.4) {
          this.dungeon.lootDrops.push(new LootDrop(en.x, en.y, 'shards', Math.floor(Math.random() * 6 + 3)));
        }
        this.enemies.splice(i, 1);
      }
    }

    // 6. Enemy Projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.traveled = (p.traveled || 0) + Math.hypot(p.vx * dt, p.vy * dt);

      // Despawn if out of map bounds
      if (p.x < 0 || p.x > this.dungeon.width || p.y < 0 || p.y > this.dungeon.height || p.traveled >= 800) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (Math.hypot(this.player.x - p.x, this.player.y - p.y) < this.player.radius + p.radius) {
        this.player.takeDamage(p.damage, this.particles);
        this.enemyProjectiles.splice(i, 1);
        continue;
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
          en.takeDamage(p.damage, Math.random() < p.critRate, p.critMult, this.particles);
          hit = true;
          break;
        }
      }

      if (!hit && this.boss.isActive && !this.boss.isDead) {
        if (Math.hypot(this.boss.x - p.x, this.boss.y - p.y) < this.boss.radius + 10) {
          this.boss.takeDamage(p.damage, Math.random() < p.critRate, p.critMult, this.particles);
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
    if (collected.iron > 0) this.runLoot.blackIron += collected.iron;
    if (collected.rations > 0) this.runLoot.rations += collected.rations;
    if (collected.shards > 0) this.runLoot.starlightShards += collected.shards;

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

    for (const en of this.enemies) {
      if (en.isDead) continue;
      const dx = en.x - atkData.x;
      const dy = en.y - atkData.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= atkData.range + en.radius) {
        const angleToTarget = Math.atan2(dy, dx);
        let angleDiff = Math.abs(angleToTarget - atkData.angle);
        while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

        if (angleDiff <= atkData.arc / 2) {
          const isCrit = Math.random() < atkData.critRate;
          en.takeDamage(atkData.damage, isCrit, atkData.critMult, this.particles);

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
          this.boss.takeDamage(atkData.damage, isCrit, atkData.critMult, this.particles);
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

    // 5. Zone & Demonic Pillars Status Tracker
    const zoneDot = document.getElementById('hud-zone-dot');
    const zoneText = document.getElementById('hud-zone-text');
    const zoneBuff = document.getElementById('hud-zone-buff');
    const curZ = this.dungeon.currentZone || MAP_ZONES.barren_wastes;
    if (zoneText) zoneText.innerText = `${curZ.name} (${curZ.engName})`;
    
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
