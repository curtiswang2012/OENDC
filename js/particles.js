/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Particle System & Floating Combat Text Engine
 */

export class ParticleEngine {
  constructor() {
    this.particles = [];
    this.texts = [];
    this.rings = [];
    this.decoys = [];
    this.screenShake = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  addShake(amount = 8) {
    this.screenShake = Math.min(30, this.screenShake + amount);
  }

  createHologramDecoy(x, y, form = 'radiant', radius = 24) {
    this.decoys.push({
      x,
      y,
      radius,
      form,
      color: form === 'radiant' ? '#ffd700' : '#c084fc',
      life: 1.0,
      maxLife: 1.8,
      auraRadius: 10
    });
  }

  emitParrySparks(x, y) {
    this.addShake(12);
    this.emitShockwaveRing(x, y, 90, '#ffd700', 0.25);
    this.emitShockwaveRing(x, y, 140, '#ffffff', 0.35);
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 320 + 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: Math.random() * 4 + 2,
        color: Math.random() > 0.3 ? '#ffd700' : '#ffffff',
        life: 1.0,
        decay: Math.random() * 3 + 3,
        shape: 'spark'
      });
    }
  }

  emitElementalBurst(x, y, radius = 160) {
    this.addShake(16);
    this.emitShockwaveRing(x, y, radius, '#ffd700', 0.4);
    this.emitShockwaveRing(x, y, radius * 1.3, '#c084fc', 0.5);

    // Dual vortex particles (Golden Sun & Void Violet)
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius * 0.8;
      const isSun = i % 2 === 0;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: -Math.sin(angle) * (180 + Math.random() * 80),
        vy: Math.cos(angle) * (180 + Math.random() * 80),
        radius: Math.random() * 4 + 3,
        color: isSun ? '#fde047' : '#a855f7',
        life: 1.0,
        decay: Math.random() * 2 + 1.5,
        shape: 'circle'
      });
    }
  }

  addFloatingText(x, y, text, type = 'normal') {
    if (this.texts.length > 25) this.texts.shift();
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
    } else if (type === 'parry') {
      color = '#fde047';
      size = 24;
      weight = '900';
      text = `⚔️ 完美彈刀！反擊！`;
    } else if (type === 'perfect_dodge') {
      color = '#38bdf8';
      size = 22;
      weight = '900';
      text = `⚡ 極限閃避！時空斷裂！`;
    } else if (type === 'elemental_burst') {
      color = '#f43f5e';
      size = 26;
      weight = '900';
      text = `💥 日蝕連攜爆散！+${text}`;
    } else if (type === 'heal') {
      color = '#4ade80';
      size = 18;
      text = `+${text} HP`;
    } else if (type === 'player_hit') {
      color = '#ef4444';
      size = 20;
    } else if (type === 'stun' || type === 'stagger') {
      color = '#fef08a';
      size = 20;
      weight = '800';
      text = `💫 破勢硬直 (STAGGERED!)`;
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

    // Update decoys
    for (let i = this.decoys.length - 1; i >= 0; i--) {
      const d = this.decoys[i];
      d.life -= dt / d.maxLife;
      d.auraRadius += dt * 25;
      if (d.life <= 0) {
        this.decoys.splice(i, 1);
      }
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
    // Render decoys (Holographic afterimages)
    for (const d of this.decoys) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, d.life * 0.8);
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(d.x - cameraX, d.y - cameraY, d.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = d.form === 'radiant' ? 'rgba(255, 215, 0, 0.25)' : 'rgba(192, 132, 252, 0.25)';
      ctx.fill();

      // Outer ripple
      ctx.beginPath();
      ctx.arc(d.x - cameraX, d.y - cameraY, d.radius + d.auraRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

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
      ctx.strokeStyle = 'rgba(0,0,0,0.9)';
      ctx.lineWidth = 3.5;
      ctx.textAlign = 'center';
      ctx.globalAlpha = Math.max(0, t.life);
      ctx.strokeText(t.text, t.x - cameraX, t.y - cameraY);
      ctx.fillText(t.text, t.x - cameraX, t.y - cameraY);
      ctx.restore();
    }
  }
}
