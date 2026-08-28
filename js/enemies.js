/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Enemy Hierarchy, AI Behaviors, and Dark Zone Frenzy Buffs
 */

import { audio } from './audio.js';

export const ENEMY_TYPES = {
  CRAWLER: {
    name: '深淵爬行者 (Abyssal Crawler)',
    radius: 15,
    maxHp: 160,
    speed: 150,
    damage: 22,
    attackCooldown: 1.0,
    color: '#991b1b',
    icon: '🕷️'
  },
  STALKER: {
    name: '幽影潛伏者 (Gloom Stalker)',
    radius: 17,
    maxHp: 240,
    speed: 180,
    damage: 35,
    attackCooldown: 1.2,
    color: '#6b21a8',
    icon: '🦇'
  },
  KNIGHT: {
    name: '虛空重裝騎士 (Hollow Knight)',
    radius: 24,
    maxHp: 550,
    speed: 95,
    damage: 55,
    attackCooldown: 1.8,
    color: '#1e293b',
    icon: '🛡️'
  },
  CASTER: {
    name: '幽冥咒術師 (Umbral Caster)',
    radius: 18,
    maxHp: 280,
    speed: 110,
    damage: 40,
    attackCooldown: 2.2,
    color: '#4c1d95',
    icon: '🔮'
  }
};

export class Enemy {
  constructor(x, y, type = ENEMY_TYPES.CRAWLER) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.type = type;
    this.radius = type.radius;
    this.maxHp = type.maxHp;
    this.hp = type.maxHp;
    this.speed = type.speed;
    this.damage = type.damage;
    this.attackCooldownTimer = Math.random() * 0.5;

    this.isDead = false;
    this.isFrenzied = false; // PRD: High risk in Dark Zones (gains frenzy speed & attack)
    this.stunTimer = 0;

    // Ranged attack projectiles
    this.enemyProjectiles = [];
  }

  takeDamage(amount, isCrit, critMult, particleEngine) {
    if (this.isDead) return;

    let finalDmg = amount;
    if (isCrit) {
      finalDmg = Math.round(finalDmg * critMult);
    }

    this.hp -= finalDmg;
    particleEngine.emitBlood(this.x, this.y, 8);
    particleEngine.addFloatingText(this.x, this.y, finalDmg, isCrit ? 'crit' : 'normal');
    audio.playHit(isCrit, false);

    if (this.hp <= 0) {
      this.isDead = true;
      particleEngine.emitSparks(this.x, this.y, '#ffd700', 14, 160);
      particleEngine.emitShadowWisps(this.x, this.y, 10);
    }
  }

  stun(duration, particleEngine) {
    this.stunTimer = Math.max(this.stunTimer, duration);
    particleEngine.addFloatingText(this.x, this.y, 'STUNNED', 'stun');
  }

  update(dt, player, lightingEngine, particleEngine, allProjectiles) {
    if (this.isDead) return;

    this.prevX = this.x;
    this.prevY = this.y;

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return;
    }

    if (this.attackCooldownTimer > 0) {
      this.attackCooldownTimer -= dt;
    }

    // 1. Dark Zone Detection -> Frenzy Mode
    const inLight = lightingEngine.isPointInLight(this.x, this.y);
    this.isFrenzied = !inLight;

    let effectiveSpeed = this.speed * (this.isFrenzied ? 1.4 : 1.0);
    let effectiveDmg = this.damage * (this.isFrenzied ? 1.3 : 1.0);

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    // AI Aggro Behavior
    if (dist < 550) {
      if (this.type === ENEMY_TYPES.CASTER) {
        // Ranged Kiting & Casting
        if (dist < 220) {
          // Back away
          this.x -= (dx / dist) * effectiveSpeed * dt;
          this.y -= (dy / dist) * effectiveSpeed * dt;
        } else if (dist > 300) {
          this.x += (dx / dist) * effectiveSpeed * dt;
          this.y += (dy / dist) * effectiveSpeed * dt;
        }

        // Cast Dark Orb
        if (this.attackCooldownTimer <= 0 && dist < 420) {
          this.attackCooldownTimer = this.type.attackCooldown;
          const angle = Math.atan2(dy, dx);
          allProjectiles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * 260,
            vy: Math.sin(angle) * 260,
            radius: 8,
            damage: effectiveDmg,
            color: '#a855f7',
            isEnemy: true,
            range: 450,
            traveled: 0
          });
          audio.playShadowSkill();
        }
      } else {
        // Melee Pursue
        if (dist > this.radius + player.radius) {
          this.x += (dx / dist) * effectiveSpeed * dt;
          this.y += (dy / dist) * effectiveSpeed * dt;
        }

        // Melee Strike
        if (dist <= this.radius + player.radius + 15 && this.attackCooldownTimer <= 0) {
          this.attackCooldownTimer = this.type.attackCooldown;
          player.takeDamage(effectiveDmg, particleEngine);
          audio.playSlash('greatsword');
        }
      }
    }
  }

  render(ctx, cameraX, cameraY) {
    if (this.isDead) return;

    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);

    // Frenzy Aura in Dark Zones
    if (this.isFrenzied) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.type.color;
    ctx.fill();
    ctx.strokeStyle = this.isFrenzied ? '#ef4444' : '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.font = `${this.radius * 1.1}px Outfit, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.type.icon, 0, 1);

    // Mini Health Bar above monster
    if (this.hp < this.maxHp) {
      const barW = this.radius * 2;
      const barH = 4;
      const hpPct = Math.max(0, this.hp / this.maxHp);

      ctx.fillStyle = '#000';
      ctx.fillRect(-barW / 2, -this.radius - 10, barW, barH);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-barW / 2, -this.radius - 10, barW * hpPct, barH);
    }

    ctx.restore();
  }
}
