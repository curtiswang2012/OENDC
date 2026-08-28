/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Player State, Dual-Form Combat Engine, Skills, and Dodge Mechanics
 */

import { WEAPON_CATALOG, WEAPON_TYPES } from './weapons.js';
import { audio } from './audio.js';

export const FORMS = {
  RADIANT: 'radiant',
  SHADOW: 'shadow'
};

export class Player {
  constructor(x = 400, y = 300) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 20;
    this.speed = 220;
    this.facingAngle = 0;

    // Health & Stats
    this.level = 1;
    this.exp = 0;
    this.maxHp = 1000;
    this.hp = 1000;
    this.isDead = false;

    // Dual Form Mechanics
    this.form = FORMS.RADIANT; // 'radiant' | 'shadow'
    this.radiantEnergy = 50;
    this.shadowEnergy = 50;
    this.maxEnergy = 100;
    this.surgeTimer = 0; // Surge buff duration

    // Lantern Survival System
    this.lanternFuel = 100;
    this.maxLanternFuel = 100;
    this.lanternBaseRadius = 180;
    this.isInLightZone = true;

    // Equipped Weapon & Individual Weapons Progression Data
    this.equippedWeapon = WEAPON_CATALOG[0]; // SSR Dawnbreaker default
    this.weaponsData = {};
    for (const w of WEAPON_CATALOG) {
      this.weaponsData[w.id] = { level: 1, refinement: 0 };
    }
    this.unlockedTalents = new Set();

    // Combat State
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.attackAnimTimer = 0;
    this.attackCombo = 0;

    // Dodge Roll
    this.dodgeCooldown = 0;
    this.isDodging = false;
    this.dodgeTimer = 0;
    this.dodgeDuration = 0.28;
    this.dodgeVx = 0;
    this.dodgeVy = 0;
    this.isInvulnerable = false;

    // Skills Cooldowns
    this.skillQCooldown = 0;
    this.skillECooldown = 0;
    this.skillRCooldown = 0;

    this.skillQMaxCd = { radiant: 5, shadow: 4 };
    this.skillEMaxCd = { radiant: 8, shadow: 7 };
    this.skillRMaxCd = { radiant: 18, shadow: 15 };

    // Active Projectiles / Skill Zones
    this.activeProjectiles = [];
    this.activeZones = [];
    this.phantomSlashTarget = null;
    this.phantomSlashesLeft = 0;
    this.phantomTimer = 0;
  }

  getWeaponData(weaponId) {
    if (!this.weaponsData[weaponId]) {
      this.weaponsData[weaponId] = { level: 1, refinement: 0 };
    }
    return this.weaponsData[weaponId];
  }

  getWeaponLevel(weaponId = null) {
    const id = weaponId || (this.equippedWeapon ? this.equippedWeapon.id : 'ssr_dawnbreaker');
    return this.getWeaponData(id).level;
  }

  getWeaponRefinement(weaponId = null) {
    const id = weaponId || (this.equippedWeapon ? this.equippedWeapon.id : 'ssr_dawnbreaker');
    return this.getWeaponData(id).refinement;
  }

  get weaponLevel() {
    return this.getWeaponLevel();
  }

  set weaponLevel(val) {
    if (this.equippedWeapon) {
      this.getWeaponData(this.equippedWeapon.id).level = val;
    }
  }

  get refinementLevel() {
    return this.getWeaponRefinement();
  }

  set refinementLevel(val) {
    if (this.equippedWeapon) {
      this.getWeaponData(this.equippedWeapon.id).refinement = val;
    }
  }

  reset(x = 400, y = 300) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.getMaxHp();
    this.radiantEnergy = 50;
    this.shadowEnergy = 50;
    this.lanternFuel = 100;
    this.isDead = false;
    this.isDodging = false;
    this.activeProjectiles = [];
    this.activeZones = [];
    this.skillQCooldown = 0;
    this.skillECooldown = 0;
    this.skillRCooldown = 0;
  }

  getMaxExp(level = this.level) {
    return Math.round(120 * Math.pow(level, 1.45));
  }

  getLevelBonusHp() {
    return (this.level - 1) * 60;
  }

  getLevelBonusDamage() {
    return 1 + (this.level - 1) * 0.04;
  }

  gainExp(amount, particleEngine = null) {
    if (this.isDead || !amount || amount <= 0) return { leveledUp: false, expGained: 0 };

    this.exp += Math.round(amount);
    let leveledUp = false;
    let oldLevel = this.level;

    while (this.exp >= this.getMaxExp()) {
      this.exp -= this.getMaxExp();
      this.level++;
      leveledUp = true;

      // Full heal & energy recovery on level up
      this.hp = this.getMaxHp();
      this.radiantEnergy = Math.min(this.maxEnergy, this.radiantEnergy + 50);
      this.shadowEnergy = Math.min(this.maxEnergy, this.shadowEnergy + 50);

      // Level up SFX & VFX
      audio.playLevelUp();
      if (particleEngine) {
        particleEngine.addShake(12);
        particleEngine.emitShockwaveRing(this.x, this.y, 240, '#ffd700', 0.8);
        particleEngine.emitSparks(this.x, this.y, '#ffd700', 40, 260);
        particleEngine.addFloatingText(this.x, this.y - 30, `⭐ 晉升 Lv.${this.level}!`, 'crit');
      }
    }

    return {
      leveledUp,
      oldLevel,
      newLevel: this.level,
      currentExp: this.exp,
      maxExp: this.getMaxExp()
    };
  }

  getMaxHp() {
    let hp = this.maxHp + this.getLevelBonusHp();
    if (this.unlockedTalents.has('unyielding_fortress')) {
      hp *= 1.3;
    }
    return Math.round(hp);
  }

  getAttackDamage(targetWeapon = null) {
    const w = targetWeapon || this.equippedWeapon;
    const wData = this.getWeaponData(w.id);
    const lvlGain = w.rarity === 'SSR' ? 10 : (w.rarity === 'SR' ? 8 : 6);
    let base = w.baseDamage + (wData.level - 1) * lvlGain;
    // Individual Refinement bonus (12% per rank)
    base *= (1 + wData.refinement * 0.12);
    // Player Level Scaling bonus (+4% per player level)
    base *= this.getLevelBonusDamage();
    // Surge buff
    if (this.surgeTimer > 0) {
      base *= 1.3;
    }
    // Form bonus
    if (this.form === FORMS.RADIANT) {
      base *= 1.15; // Radiant burst
    }
    return Math.round(base);
  }

  getCritRate() {
    if (this.hyperchargeTimer > 0) return 1.0; // 100% Guaranteed Crit after Perfect Dodge
    let rate = this.equippedWeapon.critRate;
    if (this.form === FORMS.SHADOW && !this.isInLightZone) {
      rate += 0.40; // PRD: High crit bonus in dark zones for Shadow Form
    }
    return Math.min(1.0, rate);
  }

  getCritMultiplier() {
    let mult = this.equippedWeapon.critMultiplier;
    if (this.hyperchargeTimer > 0) {
      mult += 0.8; // +80% Crit DMG on Hypercharge
    }
    if (this.form === FORMS.SHADOW && !this.isInLightZone && this.unlockedTalents.has('eclipse_assassin')) {
      mult += 0.5;
    }
    return mult;
  }

  getLightRadius() {
    let r = this.lanternBaseRadius * (this.lanternFuel / 100);
    if (this.form === FORMS.RADIANT) {
      r += 70; // Radiant form emits light
    }
    if (this.unlockedTalents.has('sunbeam_reach')) {
      r += 40;
    }
    return Math.max(30, r);
  }

  // --- Form Switch Mechanics ---
  toggleForm(particleEngine) {
    this.form = this.form === FORMS.RADIANT ? FORMS.SHADOW : FORMS.RADIANT;
    this.attackCombo = 0;

    audio.playFormShift();

    if (this.form === FORMS.RADIANT) {
      particleEngine.emitShockwaveRing(this.x, this.y, 140, '#ffd700', 0.5);
      particleEngine.emitSparks(this.x, this.y, '#ffd700', 16, 200);
    } else {
      particleEngine.emitShockwaveRing(this.x, this.y, 140, '#9400d3', 0.5);
      particleEngine.emitShadowWisps(this.x, this.y, 18);
    }

    // Check Peak Cataclysm Shift (When Energy >= 100)
    const curEnergy = this.form === FORMS.RADIANT ? this.radiantEnergy : this.shadowEnergy;
    if (curEnergy >= 100) {
      if (this.form === FORMS.RADIANT) this.radiantEnergy = 0;
      else this.shadowEnergy = 0;

      // Trigger Cataclysm Shockwave Area
      particleEngine.addShake(15);
      particleEngine.emitShockwaveRing(this.x, this.y, 240, this.form === FORMS.RADIANT ? '#ffd700' : '#8a2be2', 0.6);
      particleEngine.emitSparks(this.x, this.y, '#ffffff', 30, 280);
      audio.playFormShift(true);

      return {
        isCataclysm: true,
        x: this.x,
        y: this.y,
        radius: 240,
        damage: this.getAttackDamage() * 3.5,
        form: this.form
      };
    } else {
      return { isCataclysm: false };
    }
  }

  // --- Dodge Roll & Perfect Dodge (極限閃避) ---
  dodge(targetAngle, particleEngine, nearbyEnemies = [], incomingProjectiles = []) {
    if (this.dodgeCooldown > 0 || this.isDodging || this.isDead) return null;

    this.isDodging = true;
    this.isInvulnerable = true;
    this.dodgeTimer = this.dodgeDuration;
    this.dodgeCooldown = 0.6;

    const dodgeSpeed = 520;
    this.dodgeVx = Math.cos(targetAngle) * dodgeSpeed;
    this.dodgeVy = Math.sin(targetAngle) * dodgeSpeed;

    // Check for Perfect Dodge (極限閃避判定)
    let isPerfect = false;

    // 1. Nearby attacking enemy in windup or close strike
    for (const en of nearbyEnemies) {
      if (en.isDead) continue;
      const d = Math.hypot(en.x - this.x, en.y - this.y);
      if (d < 140 && (en.isWindup || en.attackTelegraphTimer > 0 || d < en.radius + this.radius + 30)) {
        isPerfect = true;
        break;
      }
    }

    // 2. Incoming hostile projectile in trajectory
    if (!isPerfect) {
      for (const p of incomingProjectiles) {
        if (p.isPlayerSide) continue;
        const d = Math.hypot(p.x - this.x, p.y - this.y);
        if (d < 130) {
          isPerfect = true;
          break;
        }
      }
    }

    if (isPerfect) {
      this.hyperchargeTimer = 3.5;
      if (this.form === FORMS.RADIANT) {
        this.radiantEnergy = Math.min(this.maxEnergy, this.radiantEnergy + 30);
      } else {
        this.shadowEnergy = Math.min(this.maxEnergy, this.shadowEnergy + 30);
      }

      particleEngine.createHologramDecoy(this.x, this.y, this.form === FORMS.RADIANT ? 'radiant' : 'shadow', this.radius);
      particleEngine.emitShockwaveRing(this.x, this.y, 140, this.form === FORMS.RADIANT ? '#38bdf8' : '#c084fc', 0.45);
      particleEngine.addFloatingText(this.x, this.y - 25, 'PERFECT DODGE', 'perfect_dodge');
      audio.playPerfectDodge();
    } else {
      audio.playSlash('dual');
      particleEngine.emitShadowWisps(this.x, this.y, 8);
    }

    return { dodged: true, isPerfect };
  }

  // --- Basic Attack Execution ---
  triggerBasicAttack(targetX, targetY, particleEngine) {
    if (this.attackCooldown > 0 || this.isDodging || this.isDead) return null;

    const atkSpeed = this.equippedWeapon.attackSpeed * (this.surgeTimer > 0 ? 1.3 : 1.0);
    this.attackCooldown = 1 / atkSpeed;
    this.attackAnimTimer = 0.2;
    this.attackCombo = (this.attackCombo + 1) % 3;

    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.facingAngle = angle;

    audio.playSlash(this.equippedWeapon.type);

    if (this.hyperchargeTimer > 0) {
      this.hyperchargeTimer = 0;
      particleEngine.emitSparks(this.x, this.y, '#ffd700', 25, 240);
      particleEngine.emitShockwaveRing(this.x, this.y, 90, '#ffd700', 0.2);
    }

    // Energy Generation
    if (this.form === FORMS.RADIANT) {
      this.radiantEnergy = Math.min(this.maxEnergy, this.radiantEnergy + 12);
    } else {
      this.shadowEnergy = Math.min(this.maxEnergy, this.shadowEnergy + 12);
    }

    if (this.equippedWeapon.type === WEAPON_TYPES.CROSSBOW) {
      // Spawn Crossbow Projectile(s)
      const count = this.equippedWeapon.id === 'ssr_nightstalker' ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) / 2) * 0.12;
        const arrowAngle = angle + spread;
        this.activeProjectiles.push({
          x: this.x + Math.cos(angle) * 20,
          y: this.y + Math.sin(angle) * 20,
          vx: Math.cos(arrowAngle) * this.equippedWeapon.projectileSpeed,
          vy: Math.sin(arrowAngle) * this.equippedWeapon.projectileSpeed,
          damage: this.getAttackDamage(),
          critRate: this.getCritRate(),
          critMult: this.getCritMultiplier(),
          range: this.equippedWeapon.range,
          traveled: 0,
          type: 'arrow',
          form: this.form,
          color: this.form === FORMS.RADIANT ? '#ffd700' : '#c084fc'
        });
      }
      return null;
    } else {
      // Melee Swing Hitbox Data
      let rangeBonus = this.unlockedTalents.has('sunbeam_reach') && this.form === FORMS.RADIANT ? 1.25 : 1.0;
      return {
        type: 'melee',
        x: this.x,
        y: this.y,
        angle,
        range: this.equippedWeapon.range * rangeBonus,
        arc: this.equippedWeapon.arcAngle || Math.PI * 0.6,
        damage: this.getAttackDamage(),
        critRate: this.getCritRate(),
        critMult: this.getCritMultiplier(),
        form: this.form,
        weaponType: this.equippedWeapon.type
      };
    }
  }

  // --- Active Skills (Q, E, R) ---
  triggerSkillQ(targetX, targetY, particleEngine) {
    if (this.skillQCooldown > 0 || this.isDead) return null;
    this.skillQCooldown = this.skillQMaxCd[this.form];
    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.facingAngle = angle;

    if (this.form === FORMS.RADIANT) {
      // RADIANT Q: Solar Flare Beam
      audio.playRadiantSkill();
      particleEngine.addShake(8);
      particleEngine.emitShockwaveRing(this.x, this.y, 80, '#ffd700', 0.3);
      
      return {
        skill: 'solar_flare',
        x: this.x,
        y: this.y,
        angle,
        length: 380,
        width: 60,
        damage: this.getAttackDamage() * 2.4,
        critRate: this.getCritRate() + 0.2,
        critMult: this.getCritMultiplier()
      };
    } else {
      // SHADOW Q: Shadow Blink & Backstab
      audio.playShadowSkill();
      const blinkDist = 180;
      const startX = this.x;
      const startY = this.y;

      this.x += Math.cos(angle) * blinkDist;
      this.y += Math.sin(angle) * blinkDist;

      particleEngine.emitShadowWisps(startX, startY, 15);
      particleEngine.emitShadowWisps(this.x, this.y, 15);
      particleEngine.addShake(6);

      return {
        skill: 'shadow_blink',
        startX,
        startY,
        endX: this.x,
        endY: this.y,
        damage: this.getAttackDamage() * 2.8,
        critRate: 1.0, // Guaranteed backstab crit
        critMult: this.getCritMultiplier()
      };
    }
  }

  triggerSkillE(targetX, targetY, particleEngine) {
    if (this.skillECooldown > 0 || this.isDead) return null;
    this.skillECooldown = this.skillEMaxCd[this.form];

    if (this.form === FORMS.RADIANT) {
      // RADIANT E: Sanctified Bastion Consecrated Ground
      audio.playRadiantSkill();
      particleEngine.emitShockwaveRing(this.x, this.y, 180, '#ffd700', 0.6);

      this.activeZones.push({
        x: this.x,
        y: this.y,
        radius: 140,
        duration: 4.5,
        tickTimer: 0,
        type: 'sanctified',
        damagePerTick: Math.round(this.getAttackDamage() * 0.4),
        healPerTick: Math.round(this.getMaxHp() * 0.03)
      });
      return { skill: 'sanctified_zone' };
    } else {
      // SHADOW E: Umbral Siphon Vortex
      audio.playShadowSkill();
      particleEngine.emitShadowWisps(this.x, this.y, 25);
      particleEngine.emitShockwaveRing(this.x, this.y, 160, '#9400d3', 0.5);

      return {
        skill: 'umbral_vortex',
        x: this.x,
        y: this.y,
        radius: 160,
        damage: this.getAttackDamage() * 2.0,
        lifestealRate: 0.35,
        critRate: this.getCritRate(),
        critMult: this.getCritMultiplier()
      };
    }
  }

  triggerSkillR(targetX, targetY, particleEngine) {
    if (this.skillRCooldown > 0 || this.isDead) return null;
    this.skillRCooldown = this.skillRMaxCd[this.form];
    const angle = Math.atan2(targetY - this.y, targetX - this.x);

    if (this.form === FORMS.RADIANT) {
      // RADIANT R: Dawnbreaker Judgment (Giant Holy Blade Beam)
      audio.playRadiantSkill();
      particleEngine.addShake(20);
      particleEngine.emitShockwaveRing(this.x, this.y, 280, '#ffd700', 0.8);
      particleEngine.emitSparks(this.x, this.y, '#ffd700', 40, 320);

      return {
        skill: 'dawnbreaker_judgment',
        x: this.x,
        y: this.y,
        angle,
        length: 550,
        width: 120,
        damage: this.getAttackDamage() * 4.5,
        critRate: this.getCritRate() + 0.3,
        critMult: this.getCritMultiplier() * 1.2
      };
    } else {
      // SHADOW R: Eclipse Execution (Multi-phantom flurry)
      audio.playShadowSkill();
      particleEngine.addShake(18);
      this.phantomSlashesLeft = 6;
      this.phantomTimer = 0.08;
      this.isInvulnerable = true;

      return {
        skill: 'eclipse_execution',
        x: this.x,
        y: this.y,
        radius: 240,
        damage: this.getAttackDamage() * 1.2,
        totalSlashes: 6,
        critRate: this.getCritRate() + 0.4,
        critMult: this.getCritMultiplier()
      };
    }
  }

  takeDamage(amount, particleEngine) {
    if (this.isDead || this.isInvulnerable) return false;

    this.hp = Math.max(0, this.hp - amount);
    particleEngine.addShake(10);
    particleEngine.emitBlood(this.x, this.y, 12);
    particleEngine.addFloatingText(this.x, this.y, amount, 'player_hit');
    audio.playHit(false, false);

    // Damage flash screen
    const dmgOverlay = document.getElementById('damage-overlay');
    if (dmgOverlay) {
      dmgOverlay.style.opacity = '0.7';
      setTimeout(() => { dmgOverlay.style.opacity = '0'; }, 150);
    }

    if (this.hp <= 0) {
      this.isDead = true;
    }
    return true;
  }

  heal(amount, particleEngine) {
    if (this.isDead) return;
    const max = this.getMaxHp();
    const actual = Math.min(max - this.hp, amount);
    if (actual > 0) {
      this.hp += actual;
      particleEngine.addFloatingText(this.x, this.y, actual, 'heal');
    }
  }

  update(dt, inputState, lightingEngine, particleEngine) {
    if (this.isDead) return;

    this.prevX = this.x;
    this.prevY = this.y;

    // 1. Timers
    if (this.hyperchargeTimer > 0) this.hyperchargeTimer -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;
    if (this.dodgeCooldown > 0) this.dodgeCooldown -= dt;
    if (this.surgeTimer > 0) this.surgeTimer -= dt;
    if (this.skillQCooldown > 0) this.skillQCooldown -= dt;
    if (this.skillECooldown > 0) this.skillECooldown -= dt;
    if (this.skillRCooldown > 0) this.skillRCooldown -= dt;

    // 2. Light Zone Detection & Lantern Fuel Consumption
    this.isInLightZone = lightingEngine.isPointInLight(this.x, this.y);

    let fuelDrain = this.isInLightZone ? 0.4 : 1.0;
    if (this.unlockedTalents.has('lumen_dynamo')) {
      fuelDrain *= 0.6;
    }
    this.lanternFuel = Math.max(0, this.lanternFuel - fuelDrain * dt);

    // PRD: In dark zones with 0 fuel, take sanity drain damage
    if (!this.isInLightZone && this.lanternFuel <= 0 && this.form !== FORMS.SHADOW) {
      this.takeDamage(15 * dt, particleEngine);
    }

    // 3. Dodge Movement
    if (this.isDodging) {
      this.x += this.dodgeVx * dt;
      this.y += this.dodgeVy * dt;
      this.dodgeTimer -= dt;
      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        this.isInvulnerable = false;
      }
      return;
    }

    // 4. Phantom Slash Ult Execution
    if (this.phantomSlashesLeft > 0) {
      this.phantomTimer -= dt;
      if (this.phantomTimer <= 0) {
        this.phantomTimer = 0.09;
        this.phantomSlashesLeft--;
        particleEngine.emitShadowWisps(this.x + (Math.random() * 80 - 40), this.y + (Math.random() * 80 - 40), 8);
        audio.playSlash('dual');
        if (this.phantomSlashesLeft <= 0) {
          this.isInvulnerable = false;
        }
      }
    }

    // 5. Normal Movement
    let mx = 0;
    let my = 0;
    if (inputState.keys['KeyW'] || inputState.keys['ArrowUp']) my -= 1;
    if (inputState.keys['KeyS'] || inputState.keys['ArrowDown']) my += 1;
    if (inputState.keys['KeyA'] || inputState.keys['ArrowLeft']) mx -= 1;
    if (inputState.keys['KeyD'] || inputState.keys['ArrowRight']) mx += 1;

    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      let curSpeed = this.speed;
      if (this.form === FORMS.SHADOW) curSpeed *= 1.2;
      if (this.surgeTimer > 0) curSpeed *= 1.25;

      this.vx = (mx / len) * curSpeed;
      this.vy = (my / len) * curSpeed;

      this.x += this.vx * dt;
      this.y += this.vy * dt;
    } else {
      this.vx = 0;
      this.vy = 0;
    }

    // 6. Update Projectiles
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const p = this.activeProjectiles[i];
      const step = Math.hypot(p.vx * dt, p.vy * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.traveled += step;
      if (p.traveled >= p.range) {
        this.activeProjectiles.splice(i, 1);
      }
    }

    // 7. Update Zones
    for (let i = this.activeZones.length - 1; i >= 0; i--) {
      const z = this.activeZones[i];
      z.duration -= dt;
      z.tickTimer += dt;
      if (z.tickTimer >= 0.5) {
        z.tickTimer = 0;
        if (z.type === 'sanctified' && Math.hypot(this.x - z.x, this.y - z.y) < z.radius) {
          this.heal(z.healPerTick, particleEngine);
        }
      }
      if (z.duration <= 0) {
        this.activeZones.splice(i, 1);
      }
    }
  }

  render(ctx, cameraX, cameraY) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // Render Active Zones
    for (const z of this.activeZones) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(z.x - cameraX, z.y - cameraY, z.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // Render Projectiles
    for (const p of this.activeProjectiles) {
      ctx.save();
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x - cameraX, p.y - cameraY);
      ctx.lineTo(p.x - cameraX - p.vx * 0.03, p.y - cameraY - p.vy * 0.03);
      ctx.stroke();
      ctx.restore();
    }

    // Render Player Aura & Character
    ctx.save();
    ctx.translate(screenX, screenY);

    // Dual Form Aura
    const auraGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, this.radius * 2);
    if (this.form === FORMS.RADIANT) {
      auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
      auraGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    } else {
      auraGrad.addColorStop(0, 'rgba(148, 0, 211, 0.45)');
      auraGrad.addColorStop(1, 'rgba(148, 0, 211, 0)');
    }
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.rotate(this.facingAngle);
    ctx.fillStyle = this.form === FORMS.RADIANT ? '#e6b800' : '#3b0764';
    ctx.strokeStyle = this.form === FORMS.RADIANT ? '#ffd700' : '#c084fc';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Directional Pointer / Weapon Graphic
    ctx.fillStyle = this.form === FORMS.RADIANT ? '#ffffff' : '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(this.radius + 8, 0);
    ctx.lineTo(this.radius - 4, -6);
    ctx.lineTo(this.radius - 4, 6);
    ctx.closePath();
    ctx.fill();

    // Attack Swing Slash Visual
    if (this.attackAnimTimer > 0) {
      ctx.strokeStyle = this.form === FORMS.RADIANT ? '#ffd700' : '#c084fc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const swingArc = this.equippedWeapon.arcAngle || Math.PI * 0.6;
      ctx.arc(0, 0, this.equippedWeapon.range * 0.8, -swingArc / 2, swingArc / 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
