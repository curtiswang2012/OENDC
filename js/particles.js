/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Particle System & Floating Combat Text Engine
 */

export class ParticleEngine {
  constructor() {
    this.particles = [];
    this.texts = [];
    this.rings = [];
    this.screenShake = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  addShake(amount = 8) {
    this.screenShake = Math.min(25, this.screenShake + amount);
  }

  emitSparks(x, y, color = '#ffd700', count = 12, speed = 180) {
    if (this.particles.length > 200) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: Math.random() * 3 + 2,
        color,
        life: 1.0,
        decay: Math.random() * 2 + 2, // dies in ~0.3-0.5s
        shape: 'circle'
      });
    }
  }

  emitBlood(x, y, count = 8) {
    if (this.particles.length > 200) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 120 + 30;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: Math.random() * 3 + 2,
        color: Math.random() > 0.3 ? '#8b0000' : '#dc2626',
        life: 1.0,
        decay: Math.random() * 1.5 + 1.5,
        shape: 'circle'
      });
    }
  }

  emitShadowWisps(x, y, count = 6) {
    if (this.particles.length > 200) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 90 + 20;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 30,
        radius: Math.random() * 5 + 3,
        color: Math.random() > 0.5 ? '#9400d3' : '#3b0764',
        life: 1.0,
        decay: Math.random() * 1.2 + 1.0,
        shape: 'wisp'
      });
    }
  }

  emitShockwaveRing(x, y, maxRadius = 120, color = '#ffd700', duration = 0.4) {
    if (this.rings.length > 12) this.rings.shift();
    this.rings.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      life: 1.0,
      decay: 1 / duration
    });
  }

  addFloatingText(x, y, text, type = 'normal') {
    if (this.texts.length > 20) this.texts.shift();
    let color = '#ffffff';
    let size = 16;
    let weight = '600';

    if (type === 'crit') {
      color = '#ffd700';
      size = 22;
      weight = '900';
      text = `⚡ ${text} CRIT!`;
    } else if (type === 'backstab') {
      color = '#c084fc';
      size = 20;
      weight = '700';
      text = `🗡️ ${text} BACKSTAB!`;
    } else if (type === 'heal') {
      color = '#4ade80';
      size = 18;
      text = `+${text} HP`;
    } else if (type === 'player_hit') {
      color = '#ef4444';
      size = 20;
    } else if (type === 'stun') {
      color = '#fef08a';
      size = 18;
      text = `💫 STUNNED!`;
    }

    this.texts.push({
      x: x + (Math.random() * 20 - 10),
      y: y - 10,
      text: String(text),
      color,
      size,
      weight,
      life: 1.0,
      vy: -45
    });
  }

  update(dt) {
    // Update screenshake
    if (this.screenShake > 0) {
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.screenShake;
      this.shakeOffsetY = (Math.random() * 2 - 1) * this.screenShake;
      this.screenShake = Math.max(0, this.screenShake - dt * 40);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= r.decay * dt;
      r.radius += (r.maxRadius - r.radius) * (dt * 10);
      if (r.life <= 0) {
        this.rings.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.y += t.vy * dt;
      t.life -= dt * 1.5;
      if (t.life <= 0) {
        this.texts.splice(i, 1);
      }
    }
  }

  render(ctx, cameraX, cameraY) {
    // Render shockwave rings
    for (const r of this.rings) {
      ctx.save();
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = Math.max(0, r.life);
      ctx.lineWidth = 4 * r.life;
      ctx.beginPath();
      ctx.arc(r.x - cameraX, r.y - cameraY, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render particles
    for (const p of this.particles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.beginPath();
      ctx.arc(p.x - cameraX, p.y - cameraY, Math.max(1, p.radius * p.life), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render floating combat texts
    for (const t of this.texts) {
      ctx.save();
      ctx.font = `${t.weight} ${t.size}px Outfit, Cinzel, sans-serif`;
      ctx.fillStyle = t.color;
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.strokeText(t.text, t.x - cameraX, t.y - cameraY);
      ctx.fillText(t.text, t.x - cameraX, t.y - cameraY);
      ctx.restore();
    }
  }
}
