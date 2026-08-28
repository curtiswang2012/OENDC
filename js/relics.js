/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Roguelike Relics & Boons System (遠征神龕遺物與祝福系統)
 */

export const RELIC_RARITY = {
  SSR: { name: '傳奇神遺物', color: '#ffd700', bg: 'rgba(255, 215, 0, 0.18)', border: '#ffd700' },
  SR: { name: '史詩秘寶', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.18)', border: '#c084fc' },
  R: { name: '精良聖痕', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.18)', border: '#38bdf8' }
};

export const RELICS_DATABASE = [
  // --- 光輝系 (Radiant) ---
  {
    id: 'relic_solar_wrath',
    name: '熾陽天罰之冠',
    icon: '👑',
    rarity: 'SSR',
    type: 'radiant',
    tag: '天降流星 · 範圍轟炸',
    desc: '光輝形態攻擊時有 35% 機率召喚聖光天罰流星砸向目標，造成 220 點範圍聖火傷害並點燃敵人。'
  },
  {
    id: 'relic_dawn_aegis',
    name: '晨曦不滅聖鎧',
    icon: '🛡️',
    rarity: 'SSR',
    type: 'radiant',
    tag: '護盾生成 · 致命免死',
    desc: '每 12 秒自動凝結一層抵擋 200 點傷害的光輝聖盾；受到致命攻擊時免疫死亡並獲得 2.5 秒無敵（每場遠征 1 次）。'
  },
  {
    id: 'relic_lumen_filament',
    name: '璀璨流明燈芯',
    icon: '🕯️',
    rarity: 'SR',
    type: 'radiant',
    tag: '提燈強化 · 光照增傷',
    desc: '流明提燈光照半徑提升 +50%，且身處光亮區域時造成的全傷害額外提升 +40%。'
  },

  // --- 黯影系 (Shadow) ---
  {
    id: 'relic_shadow_wings',
    name: '暗夜幽影之翼',
    icon: '🪽',
    rarity: 'SSR',
    type: 'shadow',
    tag: '翻滾嘲諷 · 殘影分身',
    desc: '翻滾冷卻縮減 40%，且每次翻滾時在原地留下一個暗影殘影，吸引並嘲諷周圍所有魔物 3 秒。'
  },
  {
    id: 'relic_bloodthirst_pact',
    name: '嗜血魔刃契約',
    icon: '🩸',
    rarity: 'SSR',
    type: 'shadow',
    tag: '暴擊狂熱 · 傷害吸血',
    desc: '黯影形態下暴擊率提升 +25%，每次觸發暴擊時吸取造成傷害 18% 的生命值。'
  },
  {
    id: 'relic_venom_fangs',
    name: '影煞劇毒獠牙',
    icon: '🐍',
    rarity: 'SR',
    type: 'shadow',
    tag: '暗影劇毒 · 真實傷害',
    desc: '攻擊命中敵人時施加「暗影劇毒」，每秒造成 35 點真實傷害，最多可疊加 5 層。'
  },

  // --- 元素與秘術系 (Arcane & General) ---
  {
    id: 'relic_thunder_rune',
    name: '雷霆連鎖符石',
    icon: '⚡',
    rarity: 'SR',
    type: 'arcane',
    tag: '連鎖閃電 · 群體麻痺',
    desc: '任意攻擊命中時有 30% 機率引爆連鎖雷電，在最多 4 名敵人之間彈跳，造成 140 點雷電傷害。'
  },
  {
    id: 'relic_colossus_smasher',
    name: '破甲巨靈腕甲',
    icon: '🔨',
    rarity: 'SR',
    type: 'arcane',
    tag: '精英破盾 · 巨額特攻',
    desc: '對精英魔物、首領與魔柱造成的傷害提升 +50%，對護盾造成的破盾值提升 150%。'
  },
  {
    id: 'relic_stigma_swiftness',
    name: '神速疾風聖痕',
    icon: '👟',
    rarity: 'R',
    type: 'general',
    tag: '極速走位 · 迅捷連擊',
    desc: '移動速度提升 +30%，普通攻擊連擊攻速提升 +40%，翻滾衝刺距離提升 +25%。'
  },
  {
    id: 'relic_greed_chalice',
    name: '深淵貪婪金杯',
    icon: '🏆',
    rarity: 'R',
    type: 'general',
    tag: '磁吸翻倍 · 豐厚物資',
    desc: '戰利品掉落物磁吸拾取範圍翻倍，遠征擊殺怪物獲得的黑鐵、口糧與星光碎屑數量 +100%。'
  },
  {
    id: 'relic_frost_nova',
    name: '永凍極寒之淚',
    icon: '❄️',
    rarity: 'SR',
    type: 'arcane',
    tag: '受創受擊 · 冰凍反制',
    desc: '受到敵人攻擊時，立即引爆極寒霜凍新星，冰凍周圍 200 像素內的所有魔物 2 秒。'
  },
  {
    id: 'relic_astral_resonance',
    name: '破曉星光共鳴',
    icon: '✨',
    rarity: 'SSR',
    type: 'radiant',
    tag: '形態切換 · 全場天譴',
    desc: '每次切換形態 (Form Shift) 時，引發全場破曉星爆，對所有在場敵人造成 320 點神聖真實傷害。'
  }
];

export class RelicSystem {
  constructor() {
    this.activeRelics = new Map(); // id -> relic definition
    this.shieldTimer = 0;
    this.hasRevived = false; // For dawn aegis
    this.shadowClones = []; // Active shadow clones from dodge
    this.poisonTicks = new Map(); // enemy -> { stacks, timer }
  }

  reset() {
    this.activeRelics.clear();
    this.shieldTimer = 0;
    this.hasRevived = false;
    this.shadowClones = [];
    this.poisonTicks.clear();
  }

  addRelic(relicId) {
    const relic = RELICS_DATABASE.find(r => r.id === relicId);
    if (relic) {
      this.activeRelics.set(relic.id, relic);
      return relic;
    }
    return null;
  }

  hasRelic(relicId) {
    return this.activeRelics.has(relicId);
  }

  getActiveList() {
    return Array.from(this.activeRelics.values());
  }

  getRandomChoices(count = 3) {
    // Filter out already owned relics
    const pool = RELICS_DATABASE.filter(r => !this.activeRelics.has(r.id));
    if (pool.length === 0) return [];

    // Shuffle and pick
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Hook: On Player Dodge (翻滾)
  onPlayerDodge(player, particleEngine) {
    if (this.hasRelic('relic_shadow_wings')) {
      // Spawn a taunting shadow clone at previous position
      this.shadowClones.push({
        x: player.x,
        y: player.y,
        life: 3.0,
        radius: 20
      });
      particleEngine.emitSparks(player.x, player.y, '#c084fc', 16, 120);
      particleEngine.addFloatingText(player.x, player.y - 20, '暗影殘影！', 'crit');
    }
  }

  // Hook: On Form Shift (切換形態)
  onFormShift(player, enemies, boss, particleEngine) {
    if (this.hasRelic('relic_astral_resonance')) {
      particleEngine.emitShockwaveRing(player.x, player.y, 400, '#ffd700', 0.8);
      particleEngine.addFloatingText(player.x, player.y - 30, '✨ 破曉星光天譴！', 'crit');

      for (const en of enemies) {
        if (en.isDead) continue;
        en.takeDamage(320, true, 1.5, particleEngine);
        particleEngine.emitSparks(en.x, en.y, '#ffd700', 8, 100);
      }

      if (boss && boss.isActive && !boss.isDead) {
        boss.takeDamage(320, true, 1.5, particleEngine);
      }
    }
  }

  // Hook: On Player Hit Enemy (攻擊命中敵人)
  onPlayerHitEnemy(player, target, damage, isCrit, isRadiant, enemies, particleEngine) {
    // 1. Solar Wrath (熾陽天罰之冠)
    if (this.hasRelic('relic_solar_wrath') && isRadiant && Math.random() < 0.35) {
      const strikeX = target.x + (Math.random() - 0.5) * 20;
      const strikeY = target.y + (Math.random() - 0.5) * 20;
      particleEngine.emitShockwaveRing(strikeX, strikeY, 80, '#ff9900', 0.5);
      particleEngine.emitSparks(strikeX, strikeY, '#ffd700', 20, 180);
      particleEngine.addFloatingText(strikeX, strikeY - 25, '☄️ 聖光流星！', 'crit');

      for (const en of enemies) {
        if (en.isDead) continue;
        if (Math.hypot(en.x - strikeX, en.y - strikeY) < 95) {
          en.takeDamage(220, true, 1.5, particleEngine);
        }
      }
    }

    // 2. Bloodthirst Pact (嗜血魔刃契約)
    if (this.hasRelic('relic_bloodthirst_pact') && !isRadiant && isCrit) {
      const healAmt = Math.max(15, Math.round(damage * 0.18));
      player.hp = Math.min(player.maxHp, player.hp + healAmt);
      particleEngine.addFloatingText(player.x, player.y - 20, `+${healAmt} HP 吸血`, 'heal');
      particleEngine.emitSparks(player.x, player.y, '#f87171', 8, 80);
    }

    // 3. Thunder Rune (雷霆連鎖符石)
    if (this.hasRelic('relic_thunder_rune') && Math.random() < 0.3) {
      let chainCount = 0;
      let currentSource = target;
      const hitSet = new Set([target]);

      particleEngine.addFloatingText(target.x, target.y - 20, '⚡ 連鎖雷霆！', 'crit');

      while (chainCount < 4) {
        let nextTarget = null;
        let minDist = 220;

        for (const en of enemies) {
          if (en.isDead || hitSet.has(en)) continue;
          const d = Math.hypot(en.x - currentSource.x, en.y - currentSource.y);
          if (d < minDist) {
            minDist = d;
            nextTarget = en;
          }
        }

        if (nextTarget) {
          hitSet.add(nextTarget);
          nextTarget.takeDamage(140, true, 1.5, particleEngine);
          particleEngine.emitSparks(nextTarget.x, nextTarget.y, '#38bdf8', 12, 140);
          currentSource = nextTarget;
          chainCount++;
        } else {
          break;
        }
      }
    }

    // 4. Venom Fangs (影煞劇毒獠牙)
    if (this.hasRelic('relic_venom_fangs')) {
      const current = this.poisonTicks.get(target) || { stacks: 0, timer: 0 };
      current.stacks = Math.min(5, current.stacks + 1);
      current.timer = 4.0;
      this.poisonTicks.set(target, current);
    }
  }

  // Hook: On Player Damaged (玩家受傷)
  onPlayerDamaged(player, damage, particleEngine, enemies) {
    // 1. Frost Nova on Damaged (永凍極寒之淚)
    if (this.hasRelic('relic_frost_nova')) {
      particleEngine.emitShockwaveRing(player.x, player.y, 200, '#38bdf8', 0.6);
      particleEngine.addFloatingText(player.x, player.y - 25, '❄️ 極寒霜凍！', 'crit');
      for (const en of enemies) {
        if (en.isDead) continue;
        if (Math.hypot(en.x - player.x, en.y - player.y) < 200) {
          en.stun(2.0, particleEngine);
        }
      }
    }

    // 2. Dawn Aegis Fatal Save (晨曦不滅聖鎧致命免死)
    if (this.hasRelic('relic_dawn_aegis') && player.hp <= 0 && !this.hasRevived) {
      this.hasRevived = true;
      player.hp = Math.round(player.maxHp * 0.4);
      player.isInvulnerable = true;
      player.invulnerabilityTimer = 2.5;
      particleEngine.emitShockwaveRing(player.x, player.y, 280, '#ffd700', 1.0);
      particleEngine.addFloatingText(player.x, player.y - 40, '✨ 晨曦聖鎧·神聖免死！', 'heal');
      return true; // prevented death
    }

    return false;
  }

  // Update Loop (每幀狀態更新)
  update(dt, player, enemies, boss, particleEngine) {
    // 1. Dawn Aegis Periodic Shield (晨曦聖鎧每 12 秒護盾)
    if (this.hasRelic('relic_dawn_aegis')) {
      this.shieldTimer += dt;
      if (this.shieldTimer >= 12.0) {
        this.shieldTimer = 0;
        player.shield = Math.min(200, (player.shield || 0) + 200);
        particleEngine.addFloatingText(player.x, player.y - 20, '+200 聖鎧護盾 🛡️', 'heal');
        particleEngine.emitSparks(player.x, player.y, '#ffd700', 12, 100);
      }
    }

    // 2. Update Shadow Clones from Dodge
    for (let i = this.shadowClones.length - 1; i >= 0; i--) {
      const clone = this.shadowClones[i];
      clone.life -= dt;
      if (clone.life <= 0) {
        particleEngine.emitSparks(clone.x, clone.y, '#c084fc', 10, 80);
        this.shadowClones.splice(i, 1);
      } else {
        // Taunt nearby enemies
        for (const en of enemies) {
          if (en.isDead) continue;
          if (Math.hypot(en.x - clone.x, en.y - clone.y) < 220) {
            // Draw enemy towards clone
            const dx = clone.x - en.x;
            const dy = clone.y - en.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 20) {
              en.x += (dx / dist) * 70 * dt;
              en.y += (dy / dist) * 70 * dt;
            }
          }
        }
      }
    }

    // 3. Update Poison Ticks on Enemies
    for (const [en, poison] of this.poisonTicks.entries()) {
      if (en.isDead || poison.timer <= 0) {
        this.poisonTicks.delete(en);
        continue;
      }
      poison.timer -= dt;
      poison.tickAcc = (poison.tickAcc || 0) + dt;
      if (poison.tickAcc >= 1.0) {
        poison.tickAcc = 0;
        const poisonDmg = poison.stacks * 35;
        en.takeDamage(poisonDmg, false, 1.0, particleEngine);
        particleEngine.addFloatingText(en.x, en.y - 15, `-${poisonDmg} 劇毒`, 'crit');
      }
    }
  }

  // Render Shadow Clones
  renderShadowClones(ctx, cameraX, cameraY) {
    for (const clone of this.shadowClones) {
      const sx = clone.x - cameraX;
      const sy = clone.y - cameraY;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.globalAlpha = Math.min(1.0, clone.life / 2.0);

      // Shadow aura ring
      ctx.beginPath();
      ctx.arc(0, 0, clone.radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '24px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👤', 0, 0);

      ctx.font = '10px Outfit, sans-serif';
      ctx.fillStyle = '#c084fc';
      ctx.fillText('暗影殘影', 0, -18);

      ctx.restore();
    }
  }
}

export const relicSystem = new RelicSystem();
