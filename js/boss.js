/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Boss Encounter System: Four Major Abyssal Overlords
 * Garuka (Barren), Varn (Blood Mire), Silva (Frost Abyss), Othello (Eclipse Sanctum)
 */

import { audio } from './audio.js';

export const BOSS_CONFIGS = {
  garuka: {
    id: 'garuka',
    name: '💀 噬骨魔靈·迦魯卡',
    engName: 'Garuka, the Bone-Gnaw',
    icon: '💀',
    color: '#d97706',
    glowColor: 'rgba(217, 119, 6, 0.4)',
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
    maxHp: 9000,
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
    maxHp: 13000,
    speed: 130,
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
    maxHp: 20000,
    speed: 140,
    attackPower: 110,
    spikeName: '虛空天崩',
    phase2Text: '極夜浩劫！日蝕魔柱共鳴無敵屏障！',
    phase3Text: '終焉破滅！日蝕黑洞引力撕裂全場！'
  }
};

export class BossGaruka {
  constructor(x = 1600, y = 1100, bossId = 'garuka') {
    this.x = x;
    this.y = y;
    this.radius = 44;
    this.bossId = bossId;
    this.config = BOSS_CONFIGS[bossId] || BOSS_CONFIGS.garuka;
    this.maxHp = this.config.maxHp;
    this.hp = this.config.maxHp;
    this.speed = this.config.speed;

    this.isActive = false;
    this.isDead = false;
    this.phase = 1; // 1 (Normal), 2 (Evernight Berserk), 3 (Enraged Dawn)

    // Berserk Shield & Sanctified Zone Mechanic
    this.isShielded = false;
    this.shield = 0;
    this.stunTimer = 0;
    this.attackCooldownTimer = 0;
    this.boneSpikeTimer = 3.0;

    // Ground spikes & shockwave rings
    this.activeSpikes = [];
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
    this.activeSpikes = [];
  }

  takeDamage(amount, isCrit, critMult, particleEngine) {
    if (this.isDead || !this.isActive) return 0;

    let finalDmg = amount;
    if (isCrit) {
      finalDmg = Math.round(finalDmg * critMult);
    }

    // Shield Reduction in Phase 2
    if (this.isShielded) {
      finalDmg = Math.round(finalDmg * 0.15); // 85% DR
      particleEngine.addFloatingText(this.x, this.y, '🛡️ 暗影護盾減傷中！擊破魔柱或點燃火盆！', 'stun');
    } else if (this.stunTimer > 0) {
      finalDmg = Math.round(finalDmg * 1.8); // 180% vulnerability while stunned
    }

    this.hp = Math.max(0, this.hp - finalDmg);
    particleEngine.emitBlood(this.x, this.y, 14);
    particleEngine.addFloatingText(this.x, this.y, finalDmg, isCrit ? 'crit' : 'normal');
    audio.playHit(isCrit, true);

    // Phase Transitions
    const hpPct = this.hp / this.maxHp;

    if (this.phase === 1 && hpPct <= 0.65) {
      this.triggerPhase2(particleEngine);
    } else if (this.phase === 2 && hpPct <= 0.25) {
      this.triggerPhase3(particleEngine);
    }

    if (this.hp <= 0) {
      this.isDead = true;
      particleEngine.addShake(25);
      particleEngine.emitSparks(this.x, this.y, '#ffd700', 50, 300);
      particleEngine.emitShadowWisps(this.x, this.y, 40);
      audio.playBossRoar();
    }

    return finalDmg;
  }

  triggerPhase2(particleEngine) {
    this.phase = 2;
    this.isShielded = true;
    audio.playBossRoar();
    particleEngine.addShake(20);
    particleEngine.emitShockwaveRing(this.x, this.y, 300, this.config.color, 0.8);
    particleEngine.addFloatingText(this.x, this.y, this.config.phase2Text, 'crit');
  }

  triggerPhase3(particleEngine) {
    this.phase = 3;
    this.isShielded = false;
    this.speed = this.config.speed * 1.4;
    audio.playBossRoar();
    particleEngine.addShake(22);
    particleEngine.emitShockwaveRing(this.x, this.y, 350, '#9400d3', 0.9);
    particleEngine.addFloatingText(this.x, this.y, this.config.phase3Text, 'crit');
  }

  update(dt, player, dungeonMap, particleEngine, allProjectiles) {
    if (!this.isActive || this.isDead || !player) return;

    this.prevX = this.x;
    this.prevY = this.y;

    // Check if player activated the Boss
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    if (!this.isActive && distToPlayer < 450) {
      this.isActive = true;
      audio.playBossRoar();
    }

    // Stunned State
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      if (particleEngine && Math.random() < 0.3) {
        particleEngine.emitSparks(this.x, this.y, '#ffd700', 1, 30);
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

    // Direct Melee Hit Check
    this.attackCooldownTimer -= dt;
    if (distToPlayer < this.radius + player.radius) {
      if (this.attackCooldownTimer <= 0) {
        player.takeDamage(this.config.attackPower, particleEngine);
        this.attackCooldownTimer = 1.2;
        if (particleEngine) particleEngine.emitBlood(player.x, player.y, 8);
      }
    }

    // Special Skill: Periodic Elemental Spikes / Tears
    this.boneSpikeTimer -= dt;
    if (this.boneSpikeTimer <= 0) {
      this.boneSpikeTimer = this.phase === 3 ? 2.5 : 4.0;
      this.castGroundSpikes(player, particleEngine);
    }

    // Update Ground Spikes
    for (let i = this.activeSpikes.length - 1; i >= 0; i--) {
      const sp = this.activeSpikes[i];
      sp.timer -= dt;

      // Telegraph warning stage
      if (sp.timer <= 0.6 && !sp.erupted) {
        sp.erupted = true;
        if (particleEngine) particleEngine.emitSparks(sp.x, sp.y, this.config.color, 10, 100);

        if (Math.hypot(player.x - sp.x, player.y - sp.y) < sp.radius) {
          player.takeDamage(this.config.attackPower * 0.8, particleEngine);
          if (particleEngine) particleEngine.addFloatingText(player.x, player.y, `-${Math.round(this.config.attackPower * 0.8)}`, 'damage');
        }
      }

      if (sp.timer <= 0) {
        this.activeSpikes.splice(i, 1);
      }
    }
  }

  breakShieldAndStun(duration = 6.0, particleEngine = null) {
    this.isShielded = false;
    this.stunTimer = duration;
    audio.playBossRoar();
    if (particleEngine) {
      particleEngine.addShake(15);
      particleEngine.emitShockwaveRing(this.x, this.y, 300, '#ffd700', 0.8);
      particleEngine.addFloatingText(this.x, this.y, '💥 神聖領域生效！首領護盾崩解，進入大破防狀態！', 'heal');
    }
  }

  castGroundSpikes(player, particleEngine) {
    // Spawn 3-4 spikes around player
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 200;
      const offsetY = (Math.random() - 0.5) * 200;
      this.activeSpikes.push({
        x: player.x + offsetX,
        y: player.y + offsetY,
        radius: 34,
        timer: 1.3,
        erupted: false
      });
      if (particleEngine) particleEngine.emitShadowWisps(player.x + offsetX, player.y + offsetY, 4);
    }
  }

  render(ctx, cameraX, cameraY) {
    if (!this.isActive || this.isDead) return;

    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    // 1. Draw Active Spike Warnings
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

    // 2. Boss Body & Auras
    ctx.save();
    ctx.translate(sx, sy);

    // Aura ring
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 10, 0, Math.PI * 2);
    ctx.fillStyle = this.config.glowColor;
    ctx.fill();
    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shield Aura if active
    if (this.isShielded) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 18, 0, Math.PI * 2);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
    }

    // Main Body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#150a12';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Boss Icon
    ctx.font = '34px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.icon, 0, 0);

    ctx.restore();
  }
}
