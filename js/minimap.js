/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Tactical Radar Mini-Map & Gothic Cartography Navigation Engine
 * Enhanced Boss Location Tracking, Arena Zone Marking, and Dynamic Radar Beacons
 */

export class MinimapEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isExpanded = false;
    this.width = 180;
    this.height = 140;
  }

  init(canvasId = 'minimap-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.updateSize();
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    const container = document.getElementById('minimap-container');
    if (container) {
      if (this.isExpanded) {
        container.classList.add('expanded');
      } else {
        container.classList.remove('expanded');
      }
    }
    this.updateSize();
    return this.isExpanded;
  }

  updateSize() {
    if (!this.canvas) return;
    if (this.isExpanded) {
      this.width = 380;
      this.height = 280;
    } else {
      this.width = 180;
      this.height = 135;
    }
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  render(dungeon, player, companion, enemies, boss, remotePlayers = null, pings = null) {
    if (!this.ctx || !this.canvas || !dungeon || !player) return;
    const ctx = this.ctx;
    const cw = this.width;
    const ch = this.height;

    ctx.clearRect(0, 0, cw, ch);

    // 1. Background Grid & Gothic Cartography Theme
    ctx.fillStyle = 'rgba(10, 12, 16, 0.95)';
    ctx.fillRect(0, 0, cw, ch);

    // Map Scaling (Dungeon is 2400 x 1800)
    const offsetX = 8;
    const offsetY = 8;
    const innerW = cw - offsetX * 2;
    const innerH = ch - offsetY * 2;
    const scaleX = innerW / dungeon.width;
    const scaleY = innerH / dungeon.height;

    const toMapX = (wx) => offsetX + wx * scaleX;
    const toMapY = (wy) => offsetY + wy * scaleY;

    // 2. Dungeon Boundary Frame & Corner Ward Brackets
    const zone = dungeon.currentZone || { themeColor: '#ffd700' };
    ctx.strokeStyle = zone.themeColor || 'rgba(180, 140, 60, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(offsetX, offsetY, innerW, innerH);

    // Corner boundary brackets
    const cSize = 6;
    ctx.fillStyle = zone.themeColor || '#ffd700';
    ctx.fillRect(offsetX - 1, offsetY - 1, cSize, 2);
    ctx.fillRect(offsetX - 1, offsetY - 1, 2, cSize);
    ctx.fillRect(offsetX + innerW - cSize + 1, offsetY - 1, cSize, 2);
    ctx.fillRect(offsetX + innerW - 1, offsetY - 1, 2, cSize);
    ctx.fillRect(offsetX - 1, offsetY + innerH - 1, cSize, 2);
    ctx.fillRect(offsetX - 1, offsetY + innerH - cSize + 1, 2, cSize);
    ctx.fillRect(offsetX + innerW - cSize + 1, offsetY + innerH - 1, cSize, 2);
    ctx.fillRect(offsetX + innerW - 1, offsetY + innerH - cSize + 1, 2, cSize);

    // Grid lines
    // 2.5 Procedural Dungeon Rooms & Corridors Rendering
    if (dungeon.rooms && dungeon.rooms.length > 0) {
      ctx.save();
      // Draw Corridors on minimap with crisp road and boundary rails
      for (const cor of dungeon.corridors) {
        const x1 = toMapX(cor.x1);
        const y1 = toMapY(cor.y1);
        const x2 = toMapX(cor.x2);
        const y2 = toMapY(cor.y2);
        const corW = Math.max(4, cor.width * scaleX);

        // Corridor Road Base
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(25, 30, 42, 0.95)';
        ctx.lineWidth = corW;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Corridor Glowing Rails Outline
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = zone.themeColor || 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Draw Room Boxes
      for (const rm of dungeon.rooms) {
        const rx = toMapX(rm.x);
        const ry = toMapY(rm.y);
        const rw = rm.w * scaleX;
        const rh = rm.h * scaleY;
        const isCurrent = rm.contains(player.x, player.y);

        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        if (rm.isExplored) {
          ctx.fillStyle = isCurrent ? 'rgba(255, 215, 0, 0.15)' : 'rgba(30, 35, 50, 0.75)';
          ctx.strokeStyle = isCurrent ? '#ffd700' : (rm.type === 'boss' ? '#ef4444' : (rm.type === 'pillar_altar' ? '#a855f7' : '#475569'));
          ctx.lineWidth = isCurrent ? 1.5 : 1;
        } else {
          ctx.fillStyle = 'rgba(10, 12, 18, 0.85)';
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
          ctx.lineWidth = 0.8;
        }
        ctx.fill();
        ctx.stroke();

        // Room Type Badge in Expanded Minimap
        if (this.isExpanded && rm.isExplored) {
          const cx = toMapX(rm.center.x);
          const cy = toMapY(rm.center.y);
          ctx.font = '8px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          let icon = '';
          if (rm.type === 'entrance') icon = '🟢';
          else if (rm.type === 'boss') icon = '💀';
          else if (rm.type === 'pillar_altar') icon = '🗼';
          else if (rm.type === 'treasure') icon = '💎';
          if (icon) ctx.fillText(icon, cx, cy);
        }
      }
      ctx.restore();
    } else {
      // Classic Grid Fallback
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 400; x < dungeon.width; x += 400) {
        ctx.beginPath();
        ctx.moveTo(toMapX(x), offsetY);
        ctx.lineTo(toMapX(x), offsetY + innerH);
        ctx.stroke();
      }
      for (let y = 400; y < dungeon.height; y += 400) {
        ctx.beginPath();
        ctx.moveTo(offsetX, toMapY(y));
        ctx.lineTo(offsetX + innerW, toMapY(y));
        ctx.stroke();
      }
    }

    // 4. Obstacles (Pillars)
    ctx.fillStyle = '#262933';
    ctx.strokeStyle = '#3b4252';
    ctx.lineWidth = 1;
    for (const obs of dungeon.obstacles) {
      ctx.beginPath();
      ctx.arc(toMapX(obs.x), toMapY(obs.y), Math.max(2, obs.r * scaleX), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 5. Braziers (Light Radii & Flame markers)
    for (const b of dungeon.braziers) {
      const mx = toMapX(b.x);
      const my = toMapY(b.y);

      if (b.isLit) {
        // Lit Brazier Light Field
        ctx.beginPath();
        ctx.arc(mx, my, b.lightRadius * scaleX, 0, Math.PI * 2);
        ctx.fillStyle = b.isBossBrazier ? 'rgba(255, 215, 0, 0.22)' : 'rgba(255, 180, 0, 0.15)';
        ctx.fill();

        // Flame Dot
        ctx.beginPath();
        ctx.arc(mx, my, b.isBossBrazier ? 4 : 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd700';
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Unlit Brazier Dot
        ctx.beginPath();
        ctx.arc(mx, my, b.isBossBrazier ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = b.isBossBrazier ? '#475569' : '#334155';
        ctx.fill();
        ctx.strokeStyle = b.isBossBrazier ? '#94a3b8' : '#64748b';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 6. Chests
    for (const c of dungeon.chests) {
      if (!c.isOpened) {
        const cx = toMapX(c.x);
        const cy = toMapY(c.y);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - 2.5, cy - 2.5, 5, 5);
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(cx - 2.5, cy - 2.5, 5, 5);
      }
    }

    // 6.2 Ancient Shrines Markers
    if (dungeon.shrines) {
      for (const sh of dungeon.shrines) {
        const sx = toMapX(sh.x);
        const sy = toMapY(sh.y);
        ctx.save();
        ctx.beginPath();
        ctx.arc(sx, sy, sh.isActivated ? 3 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = sh.isActivated ? '#64748b' : '#ffd700';
        ctx.fill();
        ctx.strokeStyle = sh.isActivated ? '#475569' : '#b45309';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 6.3 Cursed Chests Markers
    if (dungeon.cursedChests) {
      for (const cc of dungeon.cursedChests) {
        const cx = toMapX(cc.x);
        const cy = toMapY(cc.y);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = cc.state === 'cleared' ? '#ffd700' : '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 6.4 Ascent Portal Markers (天梯登頂傳送陣)
    if (dungeon.ascentPortals) {
      for (const ap of dungeon.ascentPortals) {
        const ax = toMapX(ap.x);
        const ay = toMapY(ap.y);
        ctx.save();
        ctx.beginPath();
        ctx.arc(ax, ay, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 6.45 Citadel Siege Core & Turrets Radar Markers (血月守城要塞標記)
    if (dungeon.isSiegeMode) {
      // Citadel Core
      if (dungeon.citadelCore) {
        const cx = toMapX(dungeon.citadelCore.x);
        const cy = toMapY(dungeon.citadelCore.y);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, this.isExpanded ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Turrets
      if (dungeon.turrets) {
        for (const t of dungeon.turrets) {
          const tx = toMapX(t.x);
          const ty = toMapY(t.y);
          ctx.save();
          ctx.beginPath();
          ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 6.5 Demonic Pillars Markers (四大魔柱戰術雷達標記)
    if (dungeon.pillars && dungeon.pillars.length > 0) {
      const now = Date.now();
      for (const p of dungeon.pillars) {
        const px = toMapX(p.x);
        const py = toMapY(p.y);

        ctx.save();
        if (p.isDestroyed) {
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#475569';
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Dynamic pillar radar ring
          const pCycle = ((now + px * 10) % 1500) / 1500;
          const pR = 4 + pCycle * (this.isExpanded ? 14 : 9);
          ctx.beginPath();
          ctx.arc(px, py, pR, 0, Math.PI * 2);
          ctx.strokeStyle = p.config.color;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Core Monolith Dot
          ctx.beginPath();
          ctx.arc(px, py, this.isExpanded ? 4.5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = p.config.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Pillar text tag
          if (this.isExpanded) {
            ctx.font = 'bold 7px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = p.config.color;
            ctx.fillText(p.config.icon, px, py - 6);
          }
        }
        ctx.restore();
      }
    }

    // 7. Regular Enemies
    for (const en of enemies) {
      if (en.isDead) continue;
      const ex = toMapX(en.x);
      const ey = toMapY(en.y);

      ctx.beginPath();
      ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = en.isFrenzied ? '#f43f5e' : '#ef4444';
      ctx.fill();
    }

    // 8. BOSS MARKER & TRACKING SYSTEM (首領位置與戰術雷達標記)
    if (boss) {
      const bx = toMapX(boss.x);
      const by = toMapY(boss.y);
      const now = Date.now();

      if (!boss.isDead) {
        ctx.save();

        // 8.1 Expanding Pulse Sonar Rings (波紋雷達預警)
        const pulseCycle = (now % 1600) / 1600; // 0 to 1
        const r1 = 6 + pulseCycle * (this.isExpanded ? 24 : 16);
        const a1 = (1 - pulseCycle) * 0.7;

        ctx.beginPath();
        ctx.arc(bx, by, r1, 0, Math.PI * 2);
        ctx.strokeStyle = boss.isActive ? `rgba(239, 68, 68, ${a1})` : `rgba(245, 158, 11, ${a1 * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const pulseCycle2 = ((now + 800) % 1600) / 1600;
        const r2 = 6 + pulseCycle2 * (this.isExpanded ? 24 : 16);
        const a2 = (1 - pulseCycle2) * 0.7;

        ctx.beginPath();
        ctx.arc(bx, by, r2, 0, Math.PI * 2);
        ctx.strokeStyle = boss.isActive ? `rgba(220, 38, 38, ${a2})` : `rgba(217, 119, 6, ${a2 * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 8.2 Boss Shield Barrier Ring (Phase 2 Berserk Shield)
        if (boss.isShielded) {
          ctx.beginPath();
          ctx.arc(bx, by, 12, 0, Math.PI * 2);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 2]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 8.3 Boss Badge Disc Background
        ctx.beginPath();
        ctx.arc(bx, by, this.isExpanded ? 9 : 7, 0, Math.PI * 2);
        ctx.fillStyle = boss.isActive ? '#7f1d1d' : '#450a0a';
        ctx.fill();
        ctx.strokeStyle = boss.isActive ? '#ef4444' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 8.4 Boss Icon (Demon Skull)
        ctx.font = this.isExpanded ? '12px sans-serif' : '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', bx, by);

        // 8.5 "BOSS" Text Badge
        const tagY = by - (this.isExpanded ? 14 : 10);
        ctx.font = 'bold 8px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = boss.isActive ? '#ef4444' : '#fbbf24';
        ctx.fillText(boss.isActive ? 'BOSS' : '首領', bx, tagY);

        // 8.6 Boss Mini HP Bar (When Active or in Expanded Mode)
        if (boss.isActive || this.isExpanded) {
          const hpW = this.isExpanded ? 36 : 24;
          const hpH = 3;
          const hpX = bx - hpW / 2;
          const hpY = by + (this.isExpanded ? 12 : 9);
          const hpPct = Math.max(0, Math.min(1, boss.hp / boss.maxHp));

          // Track background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(hpX - 1, hpY - 1, hpW + 2, hpH + 2);

          // Fill
          ctx.fillStyle = boss.isShielded ? '#eab308' : (boss.phase === 3 ? '#9333ea' : '#dc2626');
          ctx.fillRect(hpX, hpY, hpW * hpPct, hpH);

          // Border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(hpX, hpY, hpW, hpH);
        }

        ctx.restore();
      } else {
        // Boss Defeated State
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚔️', bx, by);
        ctx.restore();
      }

      // 8.7 Off-Screen / Long-Distance Boss Directional Guide Arrow
      const distToBoss = Math.hypot(boss.x - player.x, boss.y - player.y);
      if (!boss.isDead && distToBoss > 450) {
        const px = toMapX(player.x);
        const py = toMapY(player.y);
        const angleToBoss = Math.atan2(boss.y - player.y, boss.x - player.x);

        ctx.save();
        const pointerDist = 18;
        const arrowX = px + Math.cos(angleToBoss) * pointerDist;
        const arrowY = py + Math.sin(angleToBoss) * pointerDist;

        ctx.translate(arrowX, arrowY);
        ctx.rotate(angleToBoss);

        // Crimson arrow chevron
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(-3, -3.5);
        ctx.lineTo(-1, 0);
        ctx.lineTo(-3, 3.5);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }
    }

    // 9. Companion Marker
    if (companion) {
      const compX = toMapX(companion.x);
      const compY = toMapY(companion.y);

      ctx.beginPath();
      ctx.arc(compX, compY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = companion.data.color || '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 9.1 Multiplayer Remote Teammates Markers (多人連線隊友標記)
    if (remotePlayers && remotePlayers.size > 0) {
      for (const rp of remotePlayers.values()) {
        const tx = toMapX(rp.x);
        const ty = toMapY(rp.y);
        const tColor = rp.form === 'radiant' ? '#fde047' : '#c084fc';
        const roleColor = rp.user?.avatar?.color || '#38bdf8';

        ctx.save();
        // Pulse ring around teammate
        ctx.beginPath();
        ctx.arc(tx, ty, this.isExpanded ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = roleColor;
        ctx.fill();
        ctx.strokeStyle = tColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Teammate Name Tag
        ctx.font = 'bold 7px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#fff';
        ctx.fillText(rp.user?.username ? rp.user.username.substring(0, 4) : '隊友', tx, ty - 6);
        ctx.restore();
      }
    }

    // 9.2 Tactical Ground Pings on Minimap (戰術信標標記)
    if (pings && pings.length > 0) {
      for (const p of pings) {
        const mx = toMapX(p.x);
        const my = toMapY(p.y);
        const progress = 1 - (p.life / p.maxLife);
        const r = 4 + progress * (this.isExpanded ? 14 : 9);

        ctx.save();
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.strokeStyle = p.type === 'danger' ? '#ef4444' : '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'danger' ? '#ef4444' : '#ffd700';
        ctx.fill();
        ctx.restore();
      }
    }

    // 10. PLAYER MARKER & TACTICAL NAVIGATION SYSTEM (玩家即時位置與戰術導航)
    const px = toMapX(player.x);
    const py = toMapY(player.y);
    const isRadiant = player.form === 'radiant';
    const formColor = isRadiant ? '#ffd700' : '#c084fc';
    const formGlow = isRadiant ? 'rgba(255, 215, 0, 0.28)' : 'rgba(168, 85, 247, 0.28)';
    const formThemeDark = isRadiant ? '#78350f' : '#4c1d95';
    const now = Date.now();

    ctx.save();

    // 10.1 Player Light Radius Aura Field (提燈光明領域圈)
    const lightR = player.getLightRadius() * scaleX;
    const lightGrad = ctx.createRadialGradient(px, py, 2, px, py, Math.max(5, lightR));
    lightGrad.addColorStop(0, formGlow);
    lightGrad.addColorStop(0.7, isRadiant ? 'rgba(255, 215, 0, 0.08)' : 'rgba(147, 51, 234, 0.08)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(px, py, Math.max(5, lightR), 0, Math.PI * 2);
    ctx.fillStyle = lightGrad;
    ctx.fill();

    // Subtle light field dashed rim
    ctx.beginPath();
    ctx.arc(px, py, Math.max(5, lightR), 0, Math.PI * 2);
    ctx.strokeStyle = isRadiant ? 'rgba(255, 215, 0, 0.2)' : 'rgba(192, 132, 252, 0.2)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 10.2 Forward Vision Cone (前方視野扇形)
    const viewDist = this.isExpanded ? 24 : 16;
    const halfFov = 0.45; // ~26 degrees
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, viewDist, player.facingAngle - halfFov, player.facingAngle + halfFov);
    ctx.closePath();
    ctx.fillStyle = isRadiant ? 'rgba(255, 235, 120, 0.18)' : 'rgba(216, 180, 254, 0.18)';
    ctx.fill();

    // 10.3 Dynamic Breathing Sonar Pulse Ring (定位呼吸脈衝波)
    const pPulse = (now % 1400) / 1400; // 0 to 1
    const pR = (this.isExpanded ? 8 : 6) + pPulse * (this.isExpanded ? 16 : 11);
    const pAlpha = (1 - pPulse) * 0.8;
    ctx.beginPath();
    ctx.arc(px, py, pR, 0, Math.PI * 2);
    ctx.strokeStyle = isRadiant ? `rgba(255, 215, 0, ${pAlpha})` : `rgba(192, 132, 252, ${pAlpha})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 10.4 Player Core Badge Disc (玩家底盤與光環)
    const coreR = this.isExpanded ? 6.5 : 5;
    ctx.beginPath();
    ctx.arc(px, py, coreR + 1.5, 0, Math.PI * 2);
    ctx.fillStyle = formThemeDark;
    ctx.fill();
    ctx.strokeStyle = formColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 10.5 Circular Health Gauge Arc around Player (微型生命圓環)
    const hpPct = Math.max(0, Math.min(1, player.hp / player.getMaxHp()));
    if (hpPct < 1) {
      ctx.beginPath();
      ctx.arc(px, py, coreR + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpPct);
      ctx.strokeStyle = hpPct > 0.3 ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 10.6 Directional Navigation Arrow Chevron (金色/紫晶朝向指針)
    ctx.translate(px, py);
    ctx.rotate(player.facingAngle);

    ctx.beginPath();
    ctx.moveTo(this.isExpanded ? 8 : 6, 0);
    ctx.lineTo(this.isExpanded ? -5 : -4, this.isExpanded ? -4.5 : -3.5);
    ctx.lineTo(this.isExpanded ? -2.5 : -2, 0);
    ctx.lineTo(this.isExpanded ? -5 : -4, this.isExpanded ? 4.5 : 3.5);
    ctx.closePath();
    ctx.fillStyle = isRadiant ? '#fff59d' : '#f3e8ff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // 10.7 Player Text Tag (【玩家 / YOU】標籤)
    const playerTagY = py - (this.isExpanded ? 13 : 9);
    ctx.save();
    ctx.font = 'bold 8px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = formColor;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    if (this.isExpanded) {
      ctx.fillText(`${isRadiant ? '☀️' : '🌑'} 玩家 (YOU)`, px, playerTagY);
    } else {
      ctx.fillText('YOU', px, playerTagY);
    }
    ctx.restore();

    // 11. Coordinates & Distance Text in Corner
    ctx.font = '9px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(player.x)}, ${Math.round(player.y)}`, cw - 6, ch - 4);

    if (boss && !boss.isDead) {
      const distMeters = Math.round(Math.hypot(boss.x - player.x, boss.y - player.y));
      ctx.textAlign = 'left';
      ctx.fillStyle = boss.isActive ? '#ef4444' : '#f59e0b';
      ctx.fillText(`🎯 首領: ${distMeters}m`, offsetX, ch - 4);
    }
  }
}

export const minimap = new MinimapEngine();
