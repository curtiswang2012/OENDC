/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Procedural Dungeon & Instance Generator: The Four Major Maps & Four Demonic Pillars
 * Seeded Multi-Room Generation, Difficulty Tiers, Random Affixes, and Dynamic Topology
 */

import { audio } from './audio.js';

export class PRNG {
  constructor(seed = 12345) {
    this.seed = typeof seed === 'number' ? seed : this.hashString(String(seed));
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) || 12345;
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }

  rangeInt(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  pick(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export const MAP_ZONES = {
  barren_wastes: {
    id: 'barren_wastes',
    name: '荒蕪禁區',
    engName: 'The Barren Wastes',
    icon: '🏰',
    themeColor: '#d97706',
    bgColor: '#0f111a',
    borderColor: '#78350f',
    gridColor: 'rgba(217, 119, 6, 0.12)',
    bossId: 'garuka',
    bossName: '💀 噬骨魔靈·迦魯卡',
    hazard: '🛡️ 提燈消耗標準，注意地面骨刺陷阱',
    lootHint: '深淵黑鐵、堡壘口糧',
    recPower: 1000
  },
  blood_mire: {
    id: 'blood_mire',
    name: '幽影血沼',
    engName: 'Blood Sanguine Mire',
    icon: '🩸',
    themeColor: '#e11d48',
    bgColor: '#160a0e',
    borderColor: '#881337',
    gridColor: 'rgba(225, 29, 72, 0.14)',
    bossId: 'varn',
    bossName: '🩸 猩紅血魘·凡爾納',
    hazard: '🩸 黑暗中流血侵蝕；黯影形態吸血 +50%',
    lootHint: '提燈流明油、星輝碎片',
    recPower: 2200
  },
  frost_abyss: {
    id: 'frost_abyss',
    name: '霜蝕寒淵',
    engName: 'Frostbitten Abyss',
    icon: '❄️',
    themeColor: '#38bdf8',
    bgColor: '#0a101d',
    borderColor: '#0369a1',
    gridColor: 'rgba(56, 189, 248, 0.14)',
    bossId: 'silva',
    bossName: '❄️ 永凍骸龍·席瓦',
    hazard: '❄️ 提燈範圍縮減；光輝形態破冰暴擊',
    lootHint: '祖靈鍛造券、深淵黑鐵',
    recPower: 3500
  },
  eclipse_sanctum: {
    id: 'eclipse_sanctum',
    name: '終焉日蝕聖殿',
    engName: 'Sanctum of Total Eclipse',
    icon: '🌑',
    themeColor: '#a855f7',
    bgColor: '#0c0716',
    borderColor: '#581c87',
    gridColor: 'rgba(168, 85, 247, 0.16)',
    bossId: 'othello',
    bossName: '🌑 終焉蝕日之主·歐瑟羅',
    hazard: '🌑 全圖深度極夜；全技能 CD -20%、浩劫雙倍',
    lootHint: '傳奇星核、星輝碎片、鍛造券',
    recPower: 4800
  }
};

export const DUNGEON_AFFIXES = {
  blood_boil: {
    id: 'blood_boil',
    name: '血煞沸騰',
    icon: '🩸',
    color: '#e11d48',
    desc: '魔物移動速度 +25%，魔物死亡時在原地引爆血浪'
  },
  frost_bind: {
    id: 'frost_bind',
    name: '寒霜凝固',
    icon: '❄️',
    color: '#38bdf8',
    desc: '提燈光圈範圍縮減 20%，衝刺後地面殘留減速冰晶'
  },
  void_strike: {
    id: 'void_strike',
    name: '雷暴天譴',
    icon: '⚡',
    color: '#c084fc',
    desc: '全場每隔 8 秒隨機降下虛空天雷轟擊地面'
  },
  eclipse_frenzy: {
    id: 'eclipse_frenzy',
    name: '永夜狂亂',
    icon: '🌑',
    color: '#fde047',
    desc: '首領生命值 +40%，副本內必定出現 4 座深淵魔柱'
  }
};

export const ROOM_TYPES = {
  ENTRANCE: 'entrance',
  COMBAT: 'combat',
  PILLAR_ALTAR: 'pillar_altar',
  TREASURE: 'treasure',
  BOSS: 'boss'
};

export class DungeonRoom {
  constructor(id, gridX, gridY, x, y, w, h, type = ROOM_TYPES.COMBAT) {
    this.id = id;
    this.gridX = gridX;
    this.gridY = gridY;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
    this.isExplored = false;
    this.isCleared = false;
    this.connectedRoomIds = [];
    this.pillar = null;
    this.chests = [];
    this.braziers = [];
    this.obstacles = [];
    this.spawnPoints = [];
  }

  get center() {
    return { x: this.x + this.w / 2, y: this.y + this.h / 2 };
  }

  contains(px, py) {
    return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
  }
}

export const PILLAR_TYPES = {
  BLOOD: 'blood',
  FROST: 'frost',
  VOID: 'void',
  ECLIPSE: 'eclipse'
};

export const PILLAR_CONFIGS = {
  blood: {
    id: 'pillar_blood',
    type: 'blood',
    name: '噬血腐化魔柱',
    icon: '🩸',
    color: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.35)',
    maxHp: 2500,
    auraRadius: 160,
    pulsePeriod: 5.0,
    desc: '擊碎全隊回血 500 + 20秒暴擊狂怒'
  },
  frost: {
    id: 'pillar_frost',
    type: 'frost',
    name: '永凍凋零魔柱',
    icon: '❄️',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.35)',
    maxHp: 2500,
    auraRadius: 160,
    pulsePeriod: 5.0,
    desc: '擊碎凍結全場魔物 4 秒 + 提燈燃油 +40'
  },
  void: {
    id: 'pillar_void',
    type: 'void',
    name: '虛空雷煞魔柱',
    icon: '⚡',
    color: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.35)',
    maxHp: 3000,
    auraRadius: 170,
    pulsePeriod: 4.5,
    desc: '擊碎引發全場虛空天雷 + 跑速 +50%'
  },
  eclipse: {
    id: 'pillar_eclipse',
    type: 'eclipse',
    name: '日蝕終焉魔柱',
    icon: '🌑',
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    maxHp: 4000,
    auraRadius: 200,
    pulsePeriod: 4.0,
    desc: '擊碎瓦解首領無敵屏障並掉落星輝寶箱'
  }
};

export class DemonicPillar {
  constructor(x, y, pillarType = PILLAR_TYPES.BLOOD) {
    this.x = x;
    this.y = y;
    this.type = pillarType;
    this.config = PILLAR_CONFIGS[pillarType] || PILLAR_CONFIGS.blood;
    this.name = this.config.name;
    this.radius = 28;
    this.maxHp = this.config.maxHp;
    this.hp = this.config.maxHp;
    this.isDestroyed = false;
    this.pulseTimer = 0;
    this.pulseWave = 0;
    this.runeAngle = 0;
  }

  takeDamage(amount, particleEngine, sourcePlayer = null) {
    if (this.isDestroyed) return false;
    this.hp = Math.max(0, this.hp - amount);

    particleEngine.emitSparks(this.x, this.y, this.config.color, 12, 140);
    particleEngine.addFloatingText(this.x, this.y, `-${Math.round(amount)}`, 'damage');

    if (this.hp <= 0) {
      this.shatter(particleEngine, window.gameInstance);
      return true;
    }
    return false;
  }

  shatter(particleEngine, game) {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    audio.playBossRoar();

    // Massive explosion particles
    particleEngine.emitShockwaveRing(this.x, this.y, 280, this.config.color, 0.8);
    particleEngine.emitSparks(this.x, this.y, '#ffffff', 40, 450);
    particleEngine.emitSparks(this.x, this.y, this.config.color, 50, 400);
    particleEngine.addFloatingText(this.x, this.y - 20, `💥【${this.name}】已被摧毀淨化！`, 'crit');

    if (!game) return;

    // Grant EXP reward for purifying pillar
    const pillarExp = Math.round(350 * (1 + (game.dungeonTier - 1) * 0.35));
    if (game.player) {
      game.player.gainExp(pillarExp, particleEngine);
      game.runExp = (game.runExp || 0) + pillarExp;
      particleEngine.addFloatingText(this.x, this.y - 40, `+${pillarExp} EXP`, 'heal');
    }
    if (game.companion) {
      game.companion.gainExp(pillarExp * 0.8, particleEngine);
    }

    // Apply Specific Element Destruction Reward / Buff
    switch (this.type) {
      case PILLAR_TYPES.BLOOD:
        game.player.heal(500, particleEngine);
        game.player.surgeTimer = Math.max(game.player.surgeTimer, 20.0);
        game.showToast('🩸 噬血魔柱瓦解！小隊獲得 500 生命回復與 20 秒嗜血暴擊增益！', 'toast-crimson');
        break;

      case PILLAR_TYPES.FROST:
        for (const en of game.enemies) {
          if (!en.isDead) en.stunTimer = 4.0;
        }
        game.player.lanternFuel = Math.min(game.player.maxLanternFuel, game.player.lanternFuel + 40);
        game.showToast('❄️ 永凍魔柱崩解！全場魔物凍結 4 秒，提燈燃油補充 +40！', 'toast-cyan');
        break;

      case PILLAR_TYPES.VOID:
        for (const en of game.enemies) {
          if (!en.isDead) en.takeDamage(2000, true, 1.5, particleEngine);
        }
        if (game.boss.isActive && !game.boss.isDead) {
          game.boss.takeDamage(2500, true, 1.5, particleEngine);
        }
        game.showToast('⚡ 虛空雷煞魔柱破滅！天雷轟頂重創敵軍，小隊移動速度大幅提升！', 'toast-purple');
        break;

      case PILLAR_TYPES.ECLIPSE:
        if (game.boss.isActive && !game.boss.isDead) {
          game.boss.shield = 0;
          game.boss.stunTimer = 6.0;
        }
        game.dungeon.chests.push(new Chest(this.x, this.y));
        game.showToast('🌑 日蝕終焉魔柱粉碎！首領無敵護盾瓦解，進入大破防癱瘓狀態！', 'toast-gold');
        break;
    }
  }

  update(dt, particleEngine, game) {
    if (this.isDestroyed) return;
    this.runeAngle += dt * 0.8;
    this.pulseTimer += dt;

    if (this.pulseTimer >= this.config.pulsePeriod) {
      this.pulseTimer = 0;
      this.pulseWave = 1.0;
      particleEngine.emitShockwaveRing(this.x, this.y, this.config.auraRadius, this.config.color, 0.5);

      if (game && game.player) {
        const dist = Math.hypot(game.player.x - this.x, game.player.y - this.y);
        if (dist < this.config.auraRadius) {
          if (this.type === PILLAR_TYPES.BLOOD) {
            game.player.takeDamage(25, particleEngine);
          } else if (this.type === PILLAR_TYPES.VOID) {
            game.player.takeDamage(35, particleEngine);
          }
        }
      }
    }

    if (this.pulseWave > 0) {
      this.pulseWave -= dt * 1.5;
    }
  }

  render(ctx, cameraX, cameraY) {
    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);

    if (this.isDestroyed) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f111a';
      ctx.fill();
      ctx.strokeStyle = '#333847';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = '24px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪨', 0, 0);

      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('【已淨化】', 0, -32);

      ctx.restore();
      return;
    }

    // 1. Elemental Pulsing Aura Ground Disc
    const glowR = this.config.auraRadius * (0.8 + Math.sin(this.runeAngle * 2) * 0.1);
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, glowR);
    grad.addColorStop(0, this.config.glowColor);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 2. Rotating Ancient Runes Ring
    ctx.save();
    ctx.rotate(this.runeAngle);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6, 2, 6]);
    ctx.stroke();
    ctx.restore();

    // 3. Demonic Monolith Pillar Base & Body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#12141e';
    ctx.fill();
    ctx.strokeStyle = this.config.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Core Crystal Icon
    ctx.font = '26px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.config.icon, 0, 0);

    ctx.restore();

    // 4. Overhead Pillar Name & Health Bar
    ctx.save();
    ctx.translate(sx, sy);

    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.config.color;
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 6;
    ctx.fillText(`🗼 ${this.name}`, 0, -42);

    // Health Bar
    const barW = 56;
    const barH = 5;
    const hpPct = Math.max(0, Math.min(1, this.hp / this.maxHp));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(-barW / 2, -34, barW, barH);
    ctx.fillStyle = this.config.color;
    ctx.fillRect(-barW / 2, -34, barW * hpPct, barH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-barW / 2, -34, barW, barH);

    ctx.restore();
  }
}

export class Brazier {
  constructor(x, y, isLit = false, isBossBrazier = false) {
    this.x = x;
    this.y = y;
    this.radius = 18;
    this.lightRadius = 240;
    this.isLit = isLit;
    this.isBossBrazier = isBossBrazier;
  }

  ignite(particleEngine) {
    if (this.isLit) return;
    this.isLit = true;
    audio.playBrazierIgnite();
    particleEngine.emitShockwaveRing(this.x, this.y, 140, '#ffd700', 0.4);
    particleEngine.emitSparks(this.x, this.y, '#ffd700', 20, 180);
    particleEngine.addFloatingText(this.x, this.y, '🔥 聖火已點燃！', 'heal');
  }

  extinguish(particleEngine) {
    if (!this.isLit) return;
    this.isLit = false;
    particleEngine.emitShadowWisps(this.x, this.y, 12);
  }

  render(ctx, cameraX, cameraY) {
    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#262933';
    ctx.fill();
    ctx.strokeStyle = this.isLit ? '#ffd700' : '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = '18px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isLit ? '🔥' : '🪨', 0, 0);

    if (!this.isLit) {
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText('[F] 點燃', 0, -26);
    }

    ctx.restore();
  }
}

export class Chest {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 18;
    this.isOpened = false;
  }

  open(particleEngine) {
    if (this.isOpened) return null;
    this.isOpened = true;
    audio.playLootPickup();
    particleEngine.emitSparks(this.x, this.y, '#ffd700', 16, 160);
    particleEngine.addFloatingText(this.x, this.y, '寶箱開啟！', 'crit');

    return {
      blackIron: Math.floor(Math.random() * 30 + 20),
      rations: Math.floor(Math.random() * 35 + 25),
      starlightShards: Math.floor(Math.random() * 20 + 10)
    };
  }

  render(ctx, cameraX, cameraY) {
    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);
    ctx.font = '22px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.isOpened ? '📭' : '📦', 0, 0);
    if (!this.isOpened) {
      ctx.font = '11px Outfit, sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('[F] 開啟', 0, -22);
    }
    ctx.restore();
  }
}

export class LootDrop {
  constructor(x, y, type = 'iron', amount = 1) {
    this.x = x;
    this.y = y;
    this.type = type; // 'iron', 'oil', 'ration', 'shards'
    this.amount = amount;
    this.radius = 10;
    this.life = 60.0;
  }

  render(ctx, cameraX, cameraY) {
    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);

    let icon = '⛓️';
    if (this.type === 'oil') icon = '🕯️';
    if (this.type === 'ration') icon = '🍞';
    if (this.type === 'shards') icon = '✨';

    ctx.font = '14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 0, 0);
    ctx.restore();
  }
}

export class DungeonMap {
  constructor() {
    this.width = 3200;
    this.height = 2400;
    this.currentZone = MAP_ZONES.barren_wastes;
    this.seed = 12345;
    this.difficultyTier = 1;
    this.activeAffixes = [];
    this.rooms = [];
    this.corridors = [];
    this.braziers = [];
    this.chests = [];
    this.lootDrops = [];
    this.obstacles = [];
    this.bossBraziers = [];
    this.pillars = [];
    this.spawnPoints = [];
    this.entrancePos = { x: 400, y: 300 };
    this.bossPos = { x: 2600, y: 1900 };
  }

  // --- PROCEDURAL DUNGEON GENERATOR ENGINE (程序化副本生成引擎) ---
  generateProceduralDungeon(zoneId = 'barren_wastes', difficultyTier = 1, seed = null, chosenAffixes = []) {
    this.currentZone = MAP_ZONES[zoneId] || MAP_ZONES.barren_wastes;
    this.difficultyTier = difficultyTier;
    this.activeAffixes = chosenAffixes;
    this.seed = seed !== null ? seed : Math.floor(Math.random() * 1000000);
    const rng = new PRNG(this.seed);

    // Reset Containers
    this.rooms = [];
    this.corridors = [];
    this.braziers = [];
    this.chests = [];
    this.lootDrops = [];
    this.obstacles = [];
    this.bossBraziers = [];
    this.pillars = [];
    this.spawnPoints = [];

    // 1. Grid of 3x3 Room Slots
    const gridCols = 3;
    const gridRows = 3;
    const cellW = 1000;
    const cellH = 750;
    this.width = gridCols * cellW + 200;
    this.height = gridRows * cellH + 200;

    // Room Slot Coordinates Table
    const slotGrid = [];
    let roomIdCounter = 1;

    for (let r = 0; r < gridRows; r++) {
      slotGrid[r] = [];
      for (let c = 0; c < gridCols; c++) {
        // Leave 1-2 random edge cells empty on higher tiers for maze shape
        if ((r === 0 && c === 2 && rng.next() > 0.6) || (r === 2 && c === 0 && rng.next() > 0.6)) {
          slotGrid[r][c] = null;
          continue;
        }

        const rw = rng.rangeInt(540, 780);
        const rh = rng.rangeInt(420, 600);
        const rx = c * cellW + 100 + rng.rangeInt(20, cellW - rw - 40);
        const ry = r * cellH + 100 + rng.rangeInt(20, cellH - rh - 40);

        const room = new DungeonRoom(`room_${roomIdCounter++}`, c, r, rx, ry, rw, rh, ROOM_TYPES.COMBAT);
        slotGrid[r][c] = room;
        this.rooms.push(room);
      }
    }

    // 2. Designate Key Rooms: Entrance, Boss, Pillar Altars, Treasure
    // Start room is Top-Left (0, 0)
    const entranceRoom = slotGrid[0][0] || this.rooms[0];
    entranceRoom.type = ROOM_TYPES.ENTRANCE;
    entranceRoom.isExplored = true;
    this.entrancePos = { x: entranceRoom.center.x, y: entranceRoom.center.y };

    // Boss room is Bottom-Right (2, 2)
    const bossRoom = slotGrid[gridRows - 1][gridCols - 1] || this.rooms[this.rooms.length - 1];
    bossRoom.type = ROOM_TYPES.BOSS;
    this.bossPos = { x: bossRoom.center.x, y: bossRoom.center.y };

    // Available intermediate rooms for Pillars & Treasure
    const midRooms = this.rooms.filter(rm => rm !== entranceRoom && rm !== bossRoom);

    // Number of Pillars: Tier 1 -> 1-2, Tier 2-3 -> 2-3, Tier 4+ or Eclipse -> 4
    let numPillars = Math.min(midRooms.length, difficultyTier >= 4 || zoneId === 'eclipse_sanctum' ? 4 : (difficultyTier >= 2 ? 2 : 1));
    const pillarPool = [PILLAR_TYPES.BLOOD, PILLAR_TYPES.FROST, PILLAR_TYPES.VOID, PILLAR_TYPES.ECLIPSE];

    // Shuffle and assign Pillar rooms
    for (let i = 0; i < numPillars && midRooms.length > 0; i++) {
      const pRoom = midRooms.splice(Math.floor(rng.next() * midRooms.length), 1)[0];
      pRoom.type = ROOM_TYPES.PILLAR_ALTAR;
      const pType = pillarPool[i % pillarPool.length];
      const pillar = new DemonicPillar(pRoom.center.x, pRoom.center.y, pType);
      pRoom.pillar = pillar;
      this.pillars.push(pillar);
    }

    // Assign Treasure Vault if room available
    if (midRooms.length > 0) {
      const tRoom = midRooms.splice(Math.floor(rng.next() * midRooms.length), 1)[0];
      tRoom.type = ROOM_TYPES.TREASURE;
    }

    // 3. Connect Adjacent Rooms with Corridors (Hallways)
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const curRoom = slotGrid[r][c];
        if (!curRoom) continue;

        // Connect Right Neighbor
        if (c + 1 < gridCols && slotGrid[r][c + 1]) {
          const rightRoom = slotGrid[r][c + 1];
          curRoom.connectedRoomIds.push(rightRoom.id);
          rightRoom.connectedRoomIds.push(curRoom.id);
          this.corridors.push({
            x1: curRoom.center.x,
            y1: curRoom.center.y,
            x2: rightRoom.center.x,
            y2: rightRoom.center.y,
            width: 140
          });
        }

        // Connect Down Neighbor
        if (r + 1 < gridRows && slotGrid[r + 1][c]) {
          const downRoom = slotGrid[r + 1][c];
          curRoom.connectedRoomIds.push(downRoom.id);
          downRoom.connectedRoomIds.push(curRoom.id);
          this.corridors.push({
            x1: curRoom.center.x,
            y1: curRoom.center.y,
            x2: downRoom.center.x,
            y2: downRoom.center.y,
            width: 140
          });
        }
      }
    }

    // 4. Populate Room Entities (Braziers, Chests, Obstacles, Spawns)
    for (const rm of this.rooms) {
      switch (rm.type) {
        case ROOM_TYPES.ENTRANCE:
          // Entrance lit sanctuary
          this.braziers.push(new Brazier(rm.center.x, rm.center.y, true));
          this.braziers.push(new Brazier(rm.x + 60, rm.y + 60, false));
          this.braziers.push(new Brazier(rm.x + rm.w - 60, rm.y + rm.h - 60, false));
          // Starting cache
          this.chests.push(new Chest(rm.center.x + 120, rm.center.y));
          break;

        case ROOM_TYPES.BOSS:
          // Boss Sanctum 3 Perimeter Braziers
          const b1 = new Brazier(rm.center.x - 200, rm.center.y - 120, true, true);
          const b2 = new Brazier(rm.center.x + 200, rm.center.y - 120, true, true);
          const b3 = new Brazier(rm.center.x, rm.center.y + 200, true, true);
          this.bossBraziers = [b1, b2, b3];
          this.braziers.push(b1, b2, b3);

          // Boss Altar Obsidian Pillars
          this.obstacles.push({ x: rm.center.x - 220, y: rm.center.y + 120, r: 35 });
          this.obstacles.push({ x: rm.center.x + 220, y: rm.center.y + 120, r: 35 });
          this.chests.push(new Chest(rm.center.x + 240, rm.center.y - 160));
          break;

        case ROOM_TYPES.PILLAR_ALTAR:
          // Guardian Braziers
          this.braziers.push(new Brazier(rm.x + 70, rm.center.y, false));
          this.braziers.push(new Brazier(rm.x + rm.w - 70, rm.center.y, false));
          // Obstacles flanking the pillar
          this.obstacles.push({ x: rm.center.x - 120, y: rm.center.y - 100, r: 30 });
          this.obstacles.push({ x: rm.center.x + 120, y: rm.center.y + 100, r: 30 });
          // Elite guardian spawn points
          this.spawnPoints.push({ x: rm.center.x - 90, y: rm.center.y, type: 'knight', isElite: true });
          this.spawnPoints.push({ x: rm.center.x + 90, y: rm.center.y, type: 'caster', isElite: true });
          break;

        case ROOM_TYPES.TREASURE:
          // 2-3 Chests in vault
          this.chests.push(new Chest(rm.center.x - 90, rm.center.y));
          this.chests.push(new Chest(rm.center.x + 90, rm.center.y));
          if (rng.next() > 0.5) {
            this.chests.push(new Chest(rm.center.x, rm.center.y - 90));
          }
          this.braziers.push(new Brazier(rm.center.x, rm.center.y + 80, true));
          this.obstacles.push({ x: rm.x + 80, y: rm.y + 80, r: 28 });
          this.obstacles.push({ x: rm.x + rm.w - 80, y: rm.y + rm.h - 80, r: 28 });
          break;

        case ROOM_TYPES.COMBAT:
        default:
          // 1 Brazier & 1 Chest
          if (rng.next() > 0.3) {
            this.braziers.push(new Brazier(rm.center.x + rng.rangeInt(-120, 120), rm.center.y + rng.rangeInt(-100, 100), false));
          }
          if (rng.next() > 0.4) {
            this.chests.push(new Chest(rm.x + rng.rangeInt(70, rm.w - 70), rm.y + rng.rangeInt(70, rm.h - 70)));
          }

          // Random obstacles
          const obsCount = rng.rangeInt(1, 3);
          for (let k = 0; k < obsCount; k++) {
            this.obstacles.push({
              x: rm.x + rng.rangeInt(90, rm.w - 90),
              y: rm.y + rng.rangeInt(90, rm.h - 90),
              r: rng.rangeInt(25, 36)
            });
          }

          // Monster pack spawn points
          const packSize = rng.rangeInt(3, 5 + difficultyTier);
          for (let m = 0; m < packSize; m++) {
            const mType = rng.pick(['crawler', 'stalker', 'knight', 'caster']);
            this.spawnPoints.push({
              x: rm.x + rng.rangeInt(60, rm.w - 60),
              y: rm.y + rng.rangeInt(60, rm.h - 60),
              type: mType,
              isElite: rng.next() < 0.15 * difficultyTier
            });
          }
          break;
      }
    }
  }

  // --- Classic Fixed Initializers (for standard route fallback) ---
  initZone(zoneId = 'barren_wastes') {
    this.generateProceduralDungeon(zoneId, 1, 12345);
  }

  extinguishAllBossBraziers(particleEngine) {
    for (const b of this.bossBraziers) {
      b.extinguish(particleEngine);
    }
  }

  areAllBossBraziersLit() {
    return this.bossBraziers.every(b => b.isLit);
  }

  interactClosest(player, particleEngine) {
    for (const b of this.braziers) {
      if (!b.isLit && Math.hypot(player.x - b.x, player.y - b.y) < 55) {
        b.ignite(particleEngine);
        return { type: 'brazier' };
      }
    }

    for (const c of this.chests) {
      if (!c.isOpened && Math.hypot(player.x - c.x, player.y - c.y) < 55) {
        const loot = c.open(particleEngine);
        return { type: 'chest', loot };
      }
    }

    return null;
  }

  updateLootCollection(player, companion, particleEngine) {
    const collected = { iron: 0, oil: 0, ration: 0, shards: 0 };

    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      const drop = this.lootDrops[i];

      if (companion.data.id === 'companion_night_eater') {
        const dComp = Math.hypot(companion.x - drop.x, companion.y - drop.y);
        if (dComp < 200) {
          drop.x += ((companion.x - drop.x) / dComp) * 300 * 0.016;
          drop.y += ((companion.y - drop.y) / dComp) * 300 * 0.016;
        }
      }

      const dPlayer = Math.hypot(player.x - drop.x, player.y - drop.y);
      if (dPlayer < 120) {
        drop.x += ((player.x - drop.x) / dPlayer) * 380 * 0.016;
        drop.y += ((player.y - drop.y) / dPlayer) * 380 * 0.016;
      }

      if (dPlayer < 30 || (companion.data.id === 'companion_night_eater' && Math.hypot(companion.x - drop.x, companion.y - drop.y) < 30)) {
        collected[drop.type] = (collected[drop.type] || 0) + drop.amount;
        if (drop.type === 'ration') {
          collected.rations = (collected.rations || 0) + drop.amount;
          particleEngine.addFloatingText(player.x, player.y - 12, `+${drop.amount} 糧草 🍞`, 'heal');
        } else if (drop.type === 'oil') {
          player.lanternFuel = Math.min(player.maxLanternFuel, player.lanternFuel + 15);
          particleEngine.addFloatingText(player.x, player.y - 12, '+15 燃油 🕯️', 'heal');
        } else if (drop.type === 'iron') {
          particleEngine.addFloatingText(player.x, player.y - 12, `+${drop.amount} 黑鐵 ⛓️`, 'crit');
        } else if (drop.type === 'shards') {
          particleEngine.addFloatingText(player.x, player.y - 12, `+${drop.amount} 星光 💎`, 'crit');
        }
        audio.playLootPickup();
        particleEngine.emitSparks(drop.x, drop.y, '#ffd700', 6, 80);
        this.lootDrops.splice(i, 1);
      }
    }

    return collected;
  }

  updatePillars(dt, particleEngine, game) {
    for (const p of this.pillars) {
      p.update(dt, particleEngine, game);
    }
  }

  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // --- Walkable Collision Query (走道與房間可行走區域判斷) ---
  isPointWalkable(px, py, radius = 16) {
    // 1. Check if point is inside any room
    for (const rm of this.rooms) {
      if (
        px >= rm.x + radius + 4 &&
        px <= rm.x + rm.w - radius - 4 &&
        py >= rm.y + radius + 4 &&
        py <= rm.y + rm.h - radius - 4
      ) {
        return true;
      }
    }

    // 2. Check if point is inside any connecting corridor
    for (const cor of this.corridors) {
      const d = this.distToSegment(px, py, cor.x1, cor.y1, cor.x2, cor.y2);
      if (d <= (cor.width / 2) - radius - 2) {
        return true;
      }
    }

    return false;
  }

  snapToNearestWalkable(entity, rad = 16) {
    let closestDist = Infinity;
    let targetX = this.entrancePos.x;
    let targetY = this.entrancePos.y;

    // Check rooms
    for (const rm of this.rooms) {
      const clampedX = Math.max(rm.x + rad + 8, Math.min(rm.x + rm.w - rad - 8, entity.x));
      const clampedY = Math.max(rm.y + rad + 8, Math.min(rm.y + rm.h - rad - 8, entity.y));
      const d = Math.hypot(entity.x - clampedX, entity.y - clampedY);
      if (d < closestDist) {
        closestDist = d;
        targetX = clampedX;
        targetY = clampedY;
      }
    }

    // Check corridors
    for (const cor of this.corridors) {
      const l2 = (cor.x2 - cor.x1) * (cor.x2 - cor.x1) + (cor.y2 - cor.y1) * (cor.y2 - cor.y1);
      if (l2 > 0) {
        let t = ((entity.x - cor.x1) * (cor.x2 - cor.x1) + (entity.y - cor.y1) * (cor.y2 - cor.y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        const px = cor.x1 + t * (cor.x2 - cor.x1);
        const py = cor.y1 + t * (cor.y2 - cor.y1);
        const d = Math.hypot(entity.x - px, entity.y - py);
        if (d < closestDist) {
          closestDist = d;
          targetX = px;
          targetY = py;
        }
      }
    }

    entity.x = targetX;
    entity.y = targetY;
  }

  clampEntityToBounds(entity, margin = 28, particleEngine = null) {
    if (!entity) return;
    const rad = entity.radius || 16;
    const prevX = (entity.prevX !== undefined && !isNaN(entity.prevX)) ? entity.prevX : entity.x;
    const prevY = (entity.prevY !== undefined && !isNaN(entity.prevY)) ? entity.prevY : entity.y;

    // 1. Solid Outer World Bounds Clamping (keeps player and all entities strictly inside playable map)
    const minX = margin + rad;
    const maxX = this.width - margin - rad;
    const minY = margin + rad;
    const maxY = this.height - margin - rad;

    entity.x = Math.max(minX, Math.min(maxX, entity.x));
    entity.y = Math.max(minY, Math.min(maxY, entity.y));

    // 2. Room & Corridor Wall Collision with Smooth Sliding (實體走道與房間牆壁碰撞限制)
    if (!this.isPointWalkable(entity.x, entity.y, rad)) {
      let resolved = false;

      // Try X slide (move X, keep prevY)
      if (this.isPointWalkable(entity.x, prevY, rad)) {
        entity.y = prevY;
        if (entity.vy) entity.vy = 0;
        resolved = true;
      }
      // Try Y slide (keep prevX, move Y)
      else if (this.isPointWalkable(prevX, entity.y, rad)) {
        entity.x = prevX;
        if (entity.vx) entity.vx = 0;
        resolved = true;
      }

      if (!resolved) {
        entity.x = prevX;
        entity.y = prevY;
        if (entity.vx) entity.vx = 0;
        if (entity.vy) entity.vy = 0;

        if (!this.isPointWalkable(entity.x, entity.y, rad)) {
          this.snapToNearestWalkable(entity, rad);
        }
      }

      if (particleEngine && entity.isPlayer && Math.random() < 0.1) {
        particleEngine.emitSparks(entity.x, entity.y, this.currentZone?.themeColor || '#ffd700', 1, 30);
      }
    }

    // 3. Obstacle Circle Collisions
    for (const obs of this.obstacles) {
      const dx = entity.x - obs.x;
      const dy = entity.y - obs.y;
      const dist = Math.hypot(dx, dy);
      const minDist = (obs.r || 30) + rad;
      if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        entity.x += (dx / dist) * overlap;
        entity.y += (dy / dist) * overlap;
      }
    }
  }

  updatePlayerRoomExploration(player) {
    for (const rm of this.rooms) {
      if (rm.contains(player.x, player.y)) {
        rm.isExplored = true;
      }
    }
  }

  render(ctx, cameraX, cameraY, width, height) {
    const zone = this.currentZone || MAP_ZONES.barren_wastes;
    const now = Date.now();

    // 0. Background Void Floor Grid (Deep Abyss Foundation)
    ctx.save();
    ctx.fillStyle = '#07080d';
    ctx.fillRect(-cameraX, -cameraY, this.width, this.height);
    ctx.restore();

    // 1. Draw Corridors (Walkway Floor + 3D Stone Walls + Glowing Boundary Rails)
    ctx.save();
    for (const cor of this.corridors) {
      const sx1 = cor.x1 - cameraX;
      const sy1 = cor.y1 - cameraY;
      const sx2 = cor.x2 - cameraX;
      const sy2 = cor.y2 - cameraY;

      // 1.1 Outer Shadow / Wall Base
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.strokeStyle = '#05060a';
      ctx.lineWidth = cor.width + 24;
      ctx.lineCap = 'square';
      ctx.stroke();

      // 1.2 Corridor Floor Slab
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.strokeStyle = zone.bgColor || '#11131c';
      ctx.lineWidth = cor.width;
      ctx.stroke();

      // 1.3 Corridor Floor Pattern / Central Paving Track
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.strokeStyle = zone.gridColor;
      ctx.lineWidth = cor.width - 12;
      ctx.setLineDash([20, 10]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 1.4 Corridor Side Boundary Walls & Glowing Rails (走道兩側立體邊界牆與符文護欄)
      const dx = sx2 - sx1;
      const dy = sy2 - sy1;
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        const nx = -dy / len;
        const ny = dx / len;
        const hw = cor.width / 2;

        // Side A Heavy Stone Wall + Barrier Rail
        ctx.beginPath();
        ctx.moveTo(sx1 + nx * (hw + 5), sy1 + ny * (hw + 5));
        ctx.lineTo(sx2 + nx * (hw + 5), sy2 + ny * (hw + 5));
        ctx.strokeStyle = '#1e212b';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx1 + nx * hw, sy1 + ny * hw);
        ctx.lineTo(sx2 + nx * hw, sy2 + ny * hw);
        ctx.strokeStyle = zone.themeColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = zone.themeColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Side B Heavy Stone Wall + Barrier Rail
        ctx.beginPath();
        ctx.moveTo(sx1 - nx * (hw + 5), sy1 - ny * (hw + 5));
        ctx.lineTo(sx2 - nx * (hw + 5), sy2 - ny * (hw + 5));
        ctx.strokeStyle = '#1e212b';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(sx1 - nx * hw, sy1 - ny * hw);
        ctx.lineTo(sx2 - nx * hw, sy2 - ny * hw);
        ctx.strokeStyle = zone.themeColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = zone.themeColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Wall Totems / Brackets along Corridor
        const steps = Math.floor(len / 120);
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          const px = sx1 + dx * t;
          const py = sy1 + dy * t;
          // Side A Totem
          ctx.fillStyle = zone.themeColor;
          ctx.beginPath();
          ctx.arc(px + nx * hw, py + ny * hw, 4, 0, Math.PI * 2);
          ctx.fill();
          // Side B Totem
          ctx.beginPath();
          ctx.arc(px - nx * hw, py - ny * hw, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // 2. Draw Rooms Floor & Perimeter Walls (房間地板與外牆邊界)
    ctx.save();
    for (const rm of this.rooms) {
      const rx = rm.x - cameraX;
      const ry = rm.y - cameraY;

      // Room Outer Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(rx - 8, ry - 8, rm.w + 16, rm.h + 16);

      // Room Floor
      ctx.fillStyle = zone.bgColor || '#11131c';
      ctx.fillRect(rx, ry, rm.w, rm.h);

      // Tiled Grid
      ctx.strokeStyle = zone.gridColor;
      ctx.lineWidth = 1;
      const tSize = 75;
      for (let x = rx; x < rx + rm.w; x += tSize) {
        ctx.beginPath();
        ctx.moveTo(x, ry);
        ctx.lineTo(x, ry + rm.h);
        ctx.stroke();
      }
      for (let y = ry; y < ry + rm.h; y += tSize) {
        ctx.beginPath();
        ctx.moveTo(rx, y);
        ctx.lineTo(rx + rm.w, y);
        ctx.stroke();
      }

      // Room Solid Stone Wall (厚實哥德石牆)
      ctx.strokeStyle = '#1e212b';
      ctx.lineWidth = 8;
      ctx.strokeRect(rx, ry, rm.w, rm.h);

      // Room Outer Glowing Trim Border
      ctx.strokeStyle = rm.type === ROOM_TYPES.BOSS ? '#dc2626' : (rm.type === ROOM_TYPES.PILLAR_ALTAR ? zone.themeColor : zone.borderColor);
      ctx.lineWidth = rm.type === ROOM_TYPES.BOSS ? 3.5 : 2;
      ctx.strokeRect(rx, ry, rm.w, rm.h);

      // Corner Battlement Brackets
      const cbSize = 18;
      ctx.fillStyle = zone.themeColor;
      // Top-Left
      ctx.fillRect(rx - 4, ry - 4, cbSize, 5);
      ctx.fillRect(rx - 4, ry - 4, 5, cbSize);
      // Top-Right
      ctx.fillRect(rx + rm.w - cbSize + 4, ry - 4, cbSize, 5);
      ctx.fillRect(rx + rm.w - 1, ry - 4, 5, cbSize);
      // Bottom-Left
      ctx.fillRect(rx - 4, ry + rm.h - 1, cbSize, 5);
      ctx.fillRect(rx - 4, ry + rm.h - cbSize + 4, 5, cbSize);
      // Bottom-Right
      ctx.fillRect(rx + rm.w - cbSize + 4, ry + rm.h - 1, cbSize, 5);
      ctx.fillRect(rx + rm.w - 1, ry + rm.h - cbSize + 4, 5, cbSize);

      // Room Type Tag on Floor
      ctx.font = 'bold 13px Outfit, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      let rName = '⚔️ 戰鬥室';
      if (rm.type === ROOM_TYPES.ENTRANCE) rName = '🟢 安全聖所';
      else if (rm.type === ROOM_TYPES.BOSS) rName = '💀 首領終焉殿堂';
      else if (rm.type === ROOM_TYPES.PILLAR_ALTAR) rName = '🗼 魔柱祭壇';
      else if (rm.type === ROOM_TYPES.TREASURE) rName = '💎 遠古寶庫';
      ctx.fillText(rName, rx + 18, ry + 28);
    }
    ctx.restore();

    // 3. ANCIENT RUNIC MAP BOUNDARY BARRIER & WARD TOTEMS (深淵古神結界邊界牆)
    ctx.save();
    const bx = -cameraX;
    const by = -cameraY;
    const bw = this.width;
    const bh = this.height;

    // 3.1 Outer Dark Void Frame
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#07090e';
    ctx.strokeRect(bx, by, bw, bh);

    // 3.2 Pulsing Glowing Energy Boundary
    const dashAnim = (now / 60) % 36;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = zone.themeColor;
    ctx.setLineDash([20, 8, 4, 8]);
    ctx.lineDashOffset = -dashAnim;
    ctx.shadowColor = zone.themeColor;
    ctx.shadowBlur = 14;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // 3.3 Boundary Ward Totems every 300px along the 4 borders
    const step = 320;
    const totemR = 14;
    ctx.fillStyle = '#1e212b';
    ctx.strokeStyle = zone.themeColor;
    ctx.lineWidth = 2;

    // Top & Bottom Border Totems
    for (let x = 0; x <= bw; x += step) {
      // Top
      ctx.beginPath();
      ctx.arc(bx + x, by, totemR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bottom
      ctx.beginPath();
      ctx.arc(bx + x, by + bh, totemR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Left & Right Border Totems
    for (let y = 0; y <= bh; y += step) {
      // Left
      ctx.beginPath();
      ctx.arc(bx, by + y, totemR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Right
      ctx.beginPath();
      ctx.arc(bx + bw, by + y, totemR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 3.4 Corner Ancient Runic Ward Crystals
    const corners = [
      { x: bx, y: by },
      { x: bx + bw, y: by },
      { x: bx, y: by + bh },
      { x: bx + bw, y: by + bh }
    ];

    for (const c of corners) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 22, 0, Math.PI * 2);
      ctx.fillStyle = '#0f111a';
      ctx.fill();
      ctx.strokeStyle = zone.themeColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', c.x, c.y);
    }
    ctx.restore();

    // 4. Render Obstacles
    for (const obs of this.obstacles) {
      const sx = obs.x - cameraX;
      const sy = obs.y - cameraY;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, obs.r, 0, Math.PI * 2);
      ctx.fillStyle = '#1e212b';
      ctx.fill();
      ctx.strokeStyle = zone.themeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, obs.r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = '#11131a';
      ctx.fill();
      ctx.restore();
    }

    // 5. Render Demonic Pillars (四大魔柱)
    for (const p of this.pillars) {
      p.render(ctx, cameraX, cameraY);
    }

    // 6. Render Braziers & Chests
    for (const b of this.braziers) {
      b.render(ctx, cameraX, cameraY);
    }
    for (const c of this.chests) {
      c.render(ctx, cameraX, cameraY);
    }

    // 7. Render Loot Drops
    for (const drop of this.lootDrops) {
      drop.render(ctx, cameraX, cameraY);
    }
  }
}
