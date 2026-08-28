/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * World Boss Encounter System: Multi-Stage Abyssal Overlords & Spire Guardians
 * Garuka, Varn, Silva, Othello, Solaris, Nyxara, Primordial Sovereign
 */

import { audio } from './audio.js';

export const BOSS_CONFIGS = {
  garuka: {
    id: 'garuka',
    name: '💀 噬骨魔靈·迦魯卡',
    engName: 'Garuka, the Bone-Gnaw',
    icon: '💀',
    color: '#d97706',
    glowColor: 'rgba(217, 119, 6, 0.45)',
    maxHp: 6000,
    speed: 105,
    attackPower: 45,
    spikeName: '骨刺預警',
    phase2Text: '永夜狂暴！熄滅全場火盆並啟動骸骨護盾！',
    phase3Text: '狂怒極限！骨風暴全屏爆發！'
  },
  varn: {
    id: 'varn',
    name: '🩸 猩紅血魘·凡爾納',
    engName: 'Varn, the Crimson Nightmare',
    icon: '🩸',
    color: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    maxHp: 9500,
    speed: 120,
    attackPower: 65,
    spikeName: '血池沸騰',
    phase2Text: '血月降臨！召喚血煞護盾與血池浪潮！',
    phase3Text: '猩紅狂噬！進入全場血霧撕裂狀態！'
  },
  silva: {
    id: 'silva',
    name: '❄️ 永凍骸龍·席瓦',
    engName: 'Silva, the Frost Wyrm',
    icon: '❄️',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    maxHp: 14000,
    speed: 125,
    attackPower: 85,
    spikeName: '冰晶穿刺',
    phase2Text: '永凍極寒！凝聚寒冰稜鏡護盾與冰風暴！',
    phase3Text: '絕對零度！極霜龍息全場覆蓋！'
  },
  othello: {
    id: 'othello',
    name: '🌑 終焉蝕日之主·歐瑟羅',
    engName: 'Othello, Lord of the Eclipse',
    icon: '🌑',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    maxHp: 22000,
    speed: 135,
    attackPower: 110,
    spikeName: '虛空天崩',
    phase2Text: '極夜浩劫！日蝕魔柱共鳴無敵屏障！',
    phase3Text: '終焉破滅！日蝕黑洞引力撕裂全場！'
  },
  solaris: {
    id: 'solaris',
    name: '☀️ 日蝕暴君·索拉里斯',
    engName: 'Solaris, the Eclipse Sovereign',
    icon: '☀️',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.55)',
    maxHp: 35000,
    speed: 145,
    attackPower: 135,
    spikeName: '超新星日冕',
    phase2Text: '日蝕天譴！召喚狂暴烈陽金輪割裂空間！',
    phase3Text: '恆星湮滅！全場超新星爆發，尋求神聖庇護！'
  },
  nyxara: {
    id: 'nyxara',
    name: '🕷️ 虛空母皇·奈薩拉',
    engName: 'Nyxara, Void Matron',
    icon: '🕷️',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    maxHp: 48000,
    speed: 150,
    attackPower: 160,
    spikeName: '深淵裂隙',
    phase2Text: '蟲潮復甦！召喚虛空奇點重力黑洞！',
    phase3Text: '終末噬滅！腐蝕酸液狂潮與次元撕裂！'
  },
  primordial: {
    id: 'primordial',
    name: '👑 永夜原初至尊·創世裁決者',
    engName: 'Primordial Sovereign of Evernight',
    icon: '👑',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.6)',
    maxHp: 88888,
    speed: 160,
    attackPower: 200,
    spikeName: '原初終焉滅殺',
    phase2Text: '創世神輪展開！8 向八荒死光極限旋轉！',
    phase3Text: '極夜逆轉！日月浩劫全屏星爆！',
    phase4Text: '神性崩解！進入狂怒超限滅世模式！'
  }
};

export class BossGaruka {
  constructor(x = 1600, y = 1100, bossId = 'garuka') {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.radius = 48;
    this.bossId = bossId;
    this.config = BOSS_CONFIGS[bossId] || BOSS_CONFIGS.garuka;
    this.maxHp = this.config.maxHp;
    this.hp = this.config.maxHp;
    this.speed = this.config.speed;

    this.isActive = false;
    this.isDead = false;
    this.phase = 1; // 1, 2, 3, 4

    // Mechanics & Timers
    this.isShielded = false;
    this.shield = 0;
    this.stunTimer = 0;
    this.attackCooldownTimer = 0;
    this.specialSkillTimer = 3.5;
    this.bulletHellTimer = 1.8;
    this.laserAngle = 0;

    // Dual-Form Elemental Marks
    this.solarStacks = 0;
    this.lunarStacks = 0;
    this.elementalTimer = 0;

    // Active Area Hazards
    this.activeSpikes = [];
    this.activeLasers = [];
    this.activeVortices = [];
  }

  setBossType(bossId) {
    this.bossId = bossId;
    this.config = BOSS_CONFIGS[bossId] || BOSS_CONFIGS.garuka;
    this.maxHp = this.config.maxHp;
    this.hp = this.config.maxHp;
    this.speed = this.config.speed;
  }

  reset(x = 1600, y = 1100, bossId = null) {
    if (bossId) this.setBossType(bossId);
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.hp = this.maxHp;
    this.isActive = true;
    this.isDead = false;
    this.phase = 1;
    this.isShielded = false;
    this.shield = 0;
    this.stunTimer = 0;
    this.attackCooldownTimer = 0;
    this.specialSkillTimer = 3.5;
    this.bulletHellTimer = 1.8;
    this.laserAngle = 0;
    this.solarStacks = 0;
    this.lunarStacks = 0;
    this.elementalTimer = 0;
    this.activeSpikes = [];
    this.activeLasers = [];
    this.activeVortices = [];
  }

  takeDamage(amount, isCrit, critMult, particleEngine, form = null) {
    if (this.isDead || !this.isActive) return { isDetonation: false, damage: 0 };

    let finalDmg = amount;
    if (isCrit) {
      finalDmg = Math.round(finalDmg * critMult);
    }

    let detonationRes = { isDetonation: false, damage: 0 };

    // --- DUAL-FORM ELEMENTAL RESONANCE COMBO (雙形態連攜爆散) ---
    if (form === 'radiant') {
      if (this.lunarStacks > 0) {
        const burstDmg = Math.round(450 + this.lunarStacks * 260 + finalDmg * 0.8);
        finalDmg += burstDmg;
        this.lunarStacks = 0;
        this.solarStacks = 0;
        this.elementalTimer = 0;
        detonationRes = { isDetonation: true, damage: burstDmg, x: this.x, y: this.y };
      } else {
        this.solarStacks = Math.min(3, this.solarStacks + 1);
        this.elementalTimer = 6.0;
      }
    } else if (form === 'shadow') {
      if (this.solarStacks > 0) {
        const burstDmg = Math.round(450 + this.solarStacks * 260 + finalDmg * 0.8);
        finalDmg += burstDmg;
        this.solarStacks = 0;
        this.lunarStacks = 0;
        this.elementalTimer = 0;
        detonationRes = { isDetonation: true, damage: burstDmg, x: this.x, y: this.y };
      } else {
        this.lunarStacks = Math.min(3, this.lunarStacks + 1);
        this.elementalTimer = 6.0;
      }
    }

    // Shield Reduction in Phase 2
    if (this.isShielded) {
      finalDmg = Math.round(finalDmg * 0.15); // 85% DR
      if (particleEngine) {
        particleEngine.addFloatingText(this.x, this.y - 20, '🛡️ 暗影狂暴護盾減傷 85%！', 'stun');
      }
    } else if (this.stunTimer > 0) {
      finalDmg = Math.round(finalDmg * 1.8); // 180% vulnerability while stunned
    }

    this.hp = Math.max(0, this.hp - finalDmg);
    if (particleEngine) {
      particleEngine.emitBlood(this.x, this.y, 14);
      particleEngine.addFloatingText(this.x, this.y, finalDmg, isCrit ? 'crit' : 'normal');
    }
    audio.playHit(isCrit, true);

    // Phase Transitions
    const hpPct = this.hp / this.maxHp;

    if (this.phase === 1 && hpPct <= 0.70) {
      this.triggerPhase2(particleEngine);
    } else if (this.phase === 2 && hpPct <= 0.35) {
      this.triggerPhase3(particleEngine);
    } else if (this.phase === 3 && hpPct <= 0.15 && this.config.id === 'primordial') {
      this.triggerPhase4(particleEngine);
    }

    if (this.hp <= 0) {
      this.isDead = true;
      if (particleEngine) {
        particleEngine.addShake(28);
        particleEngine.emitSparks(this.x, this.y, this.config.color, 60, 320);
        particleEngine.emitShadowWisps(this.x, this.y, 50);
        particleEngine.emitShockwaveRing(this.x, this.y, 450, '#ffd700', 1.2);
      }
      audio.playBossRoar();
    }

    return detonationRes;
  }

  triggerPhase2(particleEngine) {
    this.phase = 2;
    this.isShielded = true;
    audio.playBossRoar();
    if (particleEngine) {
      particleEngine.addShake(20);
      particleEngine.emitShockwaveRing(this.x, this.y, 350, this.config.color, 0.8);
      particleEngine.addFloatingText(this.x, this.y - 30, this.config.phase2Text, 'crit');
    }
  }

  triggerPhase3(particleEngine) {
    this.phase = 3;
    this.isShielded = false;
    this.speed = this.config.speed * 1.35;
    audio.playBossRoar();
    if (particleEngine) {
      particleEngine.addShake(24);
      particleEngine.emitShockwaveRing(this.x, this.y, 400, '#a855f7', 0.9);
      particleEngine.addFloatingText(this.x, this.y - 30, this.config.phase3Text, 'crit');
    }
  }

  triggerPhase4(particleEngine) {
    this.phase = 4;
    this.isShielded = false;
    this.speed = this.config.speed * 1.6;
    audio.playBossRoar();
    if (particleEngine) {
      particleEngine.addShake(30);
      particleEngine.emitShockwaveRing(this.x, this.y, 500, '#ec4899', 1.2);
      particleEngine.addFloatingText(this.x, this.y - 35, this.config.phase4Text || '超限滅世！', 'crit');
    }
  }

  update(dt, player, dungeonMap, particleEngine, allProjectiles) {
    if (!this.isActive || this.isDead || !player) return;

    this.prevX = this.x;
    this.prevY = this.y;

    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

    // Stunned State
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      if (particleEngine && Math.random() < 0.3) {
        particleEngine.emitSparks(this.x, this.y, '#ffd700', 2, 40);
      }
      return;
    }

    // Check if player lit all braziers in phase 2 -> Breaks shield!
    if (this.isShielded && dungeonMap && typeof dungeonMap.areAllBossBraziersLit === 'function' && dungeonMap.areAllBossBraziersLit()) {
      this.breakShieldAndStun(6.0, particleEngine);
    }

    // Movement toward player
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;

    // Direct Melee Hit
    this.attackCooldownTimer -= dt;
    if (distToPlayer < this.radius + player.radius) {
      if (this.attackCooldownTimer <= 0) {
        player.takeDamage(this.config.attackPower, particleEngine);
        this.attackCooldownTimer = 1.1;
        if (particleEngine) particleEngine.emitBlood(player.x, player.y, 8);
      }
    }

    // Update Special Skill Hazard (Spikes, Blood pools, Lasers, Singularity)
    this.specialSkillTimer -= dt;
    if (this.specialSkillTimer <= 0) {
      this.specialSkillTimer = this.phase >= 3 ? 2.2 : 3.8;
      this.castBossSkill(player, particleEngine, allProjectiles);
    }

    // Update Bullet Hell Projectiles for advanced Bosses
    this.bulletHellTimer -= dt;
    if (this.bulletHellTimer <= 0 && (this.bossId === 'solaris' || this.bossId === 'othello' || this.bossId === 'primordial')) {
      this.bulletHellTimer = this.phase >= 3 ? 1.4 : 2.5;
      this.castBulletRing(allProjectiles, particleEngine);
    }

    // Update Ground Spikes / Hazards
    for (let i = this.activeSpikes.length - 1; i >= 0; i--) {
      const sp = this.activeSpikes[i];
      sp.timer -= dt;

      if (sp.timer <= 0.5 && !sp.erupted) {
        sp.erupted = true;
        if (particleEngine) particleEngine.emitSparks(sp.x, sp.y, this.config.color, 12, 120);

        if (Math.hypot(player.x - sp.x, player.y - sp.y) < sp.radius) {
          const dmg = Math.round(this.config.attackPower * 0.85);
          player.takeDamage(dmg, particleEngine);
          if (particleEngine) particleEngine.addFloatingText(player.x, player.y, `-${dmg}`, 'damage');
        }
      }

      if (sp.timer <= 0) {
        this.activeSpikes.splice(i, 1);
      }
    }

    // Update Rotating Lasers (Primordial / Solaris)
    if (this.phase >= 2 && (this.bossId === 'primordial' || this.bossId === 'solaris')) {
      this.laserAngle += dt * 0.9;
      // Laser collision check
      const laserCount = this.bossId === 'primordial' ? 8 : 4;
      const laserLen = 650;
      for (let k = 0; k < laserCount; k++) {
        const lAngle = this.laserAngle + (k * (Math.PI * 2 / laserCount));
        const lx2 = this.x + Math.cos(lAngle) * laserLen;
        const ly2 = this.y + Math.sin(lAngle) * laserLen;
        const dLine = this.distToSegment(player.x, player.y, this.x, this.y, lx2, ly2);
        if (dLine < player.radius + 14) {
          player.takeDamage(Math.round(this.config.attackPower * 0.45 * dt * 30), particleEngine);
          if (particleEngine && Math.random() < 0.2) particleEngine.emitSparks(player.x, player.y, '#ffd700', 2, 50);
        }
      }
    }

    // Update Gravitational Singularity (Nyxara / Othello)
    for (let i = this.activeVortices.length - 1; i >= 0; i--) {
      const vox = this.activeVortices[i];
      vox.duration -= dt;
      const dV = Math.hypot(player.x - vox.x, player.y - vox.y);
      if (dV < vox.radius) {
        // Pull player toward center
        const pullStr = (1 - dV / vox.radius) * 180 * dt;
        player.x += ((vox.x - player.x) / dV) * pullStr;
        player.y += ((vox.y - player.y) / dV) * pullStr;
        if (dV < 40) {
          player.takeDamage(Math.round(this.config.attackPower * 0.5 * dt * 25), particleEngine);
        }
      }
      if (vox.duration <= 0) {
        this.activeVortices.splice(i, 1);
      }
    }
  }

  castBossSkill(player, particleEngine, allProjectiles) {
    audio.playBossRoar();

    // 1. Spikes / AoE Eruptions
    const count = this.phase >= 3 ? 5 : 3;
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 320;
      const offsetY = (Math.random() - 0.5) * 320;
      this.activeSpikes.push({
        x: player.x + offsetX,
        y: player.y + offsetY,
        radius: 38,
        timer: 1.2,
        erupted: false
      });
      if (particleEngine) particleEngine.emitShadowWisps(player.x + offsetX, player.y + offsetY, 6);
    }

    // 2. Boss-specific Unique Skill
    if (this.bossId === 'nyxara' || this.bossId === 'othello') {
      // Spawn Gravity Singularity Vortex
      this.activeVortices.push({
        x: player.x + (Math.random() - 0.5) * 100,
        y: player.y + (Math.random() - 0.5) * 100,
        radius: 220,
        duration: 5.5
      });
      if (particleEngine) particleEngine.emitShockwaveRing(player.x, player.y, 220, '#a855f7', 0.8);
    }

    if (this.bossId === 'varn' && allProjectiles) {
      // Blood Leech Swarm Missiles
      for (let a = 0; a < 6; a++) {
        const pAngle = (a / 6) * Math.PI * 2;
        allProjectiles.push({
          x: this.x,
          y: this.y,
          vx: Math.cos(pAngle) * 220,
          vy: Math.sin(pAngle) * 220,
          radius: 8,
          damage: Math.round(this.config.attackPower * 0.7),
          color: '#e11d48',
          traveled: 0,
          range: 650
        });
      }
    }
  }

  castBulletRing(allProjectiles, particleEngine) {
    if (!allProjectiles) return;
    const bullets = this.bossId === 'primordial' ? 16 : 10;
    const speed = 190;
    for (let i = 0; i < bullets; i++) {
      const pAngle = (i / bullets) * Math.PI * 2 + this.laserAngle;
      allProjectiles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(pAngle) * speed,
        vy: Math.sin(pAngle) * speed,
        radius: 7,
        damage: Math.round(this.config.attackPower * 0.6),
        color: this.config.color,
        traveled: 0,
        range: 750
      });
    }
    if (particleEngine) particleEngine.emitSparks(this.x, this.y, this.config.color, 12, 100);
  }

  breakShieldAndStun(duration = 6.0, particleEngine = null) {
    this.isShielded = false;
    this.stunTimer = duration;
    audio.playBossRoar();
    if (particleEngine) {
      particleEngine.addShake(18);
      particleEngine.emitShockwaveRing(this.x, this.y, 350, '#ffd700', 0.9);
      particleEngine.addFloatingText(this.x, this.y - 30, '💥 神聖領域共鳴！首領護盾瓦解，進入大破防！', 'heal');
    }
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  render(ctx, cameraX, cameraY) {
    if (!this.isActive || this.isDead) return;

    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    // 1. Draw Active Singularity Vortices
    for (const vox of this.activeVortices) {
      const vx = vox.x - cameraX;
      const vy = vox.y - cameraY;
      ctx.save();
      ctx.beginPath();
      ctx.arc(vx, vy, vox.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.stroke();

      // Singularity core
      ctx.beginPath();
      ctx.arc(vx, vy, 24, 0, Math.PI * 2);
      ctx.fillStyle = '#110c1c';
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw Active Spike Warnings
    for (const sp of this.activeSpikes) {
      const spx = sp.x - cameraX;
      const spy = sp.y - cameraY;

      ctx.save();
      ctx.beginPath();
      ctx.arc(spx, spy, sp.radius, 0, Math.PI * 2);
      ctx.fillStyle = sp.erupted ? this.config.glowColor : 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
      ctx.strokeStyle = sp.erupted ? this.config.color : '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw Rotating Laser Beams (Primordial / Solaris)
    if (this.phase >= 2 && (this.bossId === 'primordial' || this.bossId === 'solaris')) {
      const laserCount = this.bossId === 'primordial' ? 8 : 4;
      const laserLen = 650;
      ctx.save();
      for (let k = 0; k < laserCount; k++) {
        const lAngle = this.laserAngle + (k * (Math.PI * 2 / laserCount));
        const lx2 = sx + Math.cos(lAngle) * laserLen;
        const ly2 = sy + Math.sin(lAngle) * laserLen;

        // Laser beam glow
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(lx2, ly2);
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 6;
        ctx.shadowColor = this.config.color;
        ctx.shadowBlur = 14;
        ctx.stroke();

        // Laser beam core
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(lx2, ly2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Boss Body & Auras
    ctx.save();
    ctx.translate(sx, sy);

    // Aura ring
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
    ctx.fillStyle = this.config.glowColor;
    ctx.fill();
    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Shield Aura if active
    if (this.isShielded) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
    }

    // Main Body Sphere
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f0a14';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Boss Icon
    ctx.font = '36px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.icon, 0, 0);

    // Phase Badge Ring
    ctx.font = '10px Outfit, sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`PHASE ${this.phase}`, 0, this.radius + 18);

    // Dual-Form Elemental Marks Badges
    if (this.solarStacks > 0 || this.lunarStacks > 0) {
      let markText = '';
      if (this.solarStacks > 0) markText = `☀️ 【日耀聖痕】×${this.solarStacks}`;
      else if (this.lunarStacks > 0) markText = `🌑 【黯月侵蝕】×${this.lunarStacks}`;

      ctx.fillStyle = this.solarStacks > 0 ? '#ffd700' : '#c084fc';
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.fillText(markText, 0, -this.radius - 14);
    }

    ctx.restore();
  }
}
