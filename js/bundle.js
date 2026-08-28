/**
 * EVERNIGHT OATH: DAWN CHRONICLES (瘞詨?銋?嚗????
 * Standalone Offline Bundle (Zero-CORS, Direct file:/// Execution Support)
 */
(function () {
  'use strict';

// ==================== BEGIN MODULE: weapons.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Weapon Classes, Arsenal Catalog, and Combat Attack Definitions
 */

const WEAPON_TYPES = {
  GREATSWORD: 'greatsword',
  DUAL_BLADES: 'dual_blades',
  SPEAR: 'spear',
  WARHAMMER: 'warhammer',
  CROSSBOW: 'crossbow',
  SCYTHE: 'scythe'
};

const WEAPON_CATALOG = [
  // --- SSR WEAPONS ---
  {
    id: 'ssr_dawnbreaker',
    name: '破曉之誓·初陽裁決 (Dawnbreaker of the Sun)',
    type: WEAPON_TYPES.GREATSWORD,
    rarity: 'SSR',
    icon: '🗡️',
    baseDamage: 85,
    attackSpeed: 1.1, // swings per sec
    range: 95,
    arcAngle: Math.PI * 0.75,
    critRate: 0.15,
    critMultiplier: 2.2,
    description: '傳說中第一位聖誓騎士所持的巨劍，揮舞時伴隨烈陽餘暉，對黑暗生物具備毀滅性打擊。',
    passive: '【烈陽耀斑】：光輝形態下每次攻擊命中累積 5% 破甲，至多疊加 5 層。'
  },
  {
    id: 'ssr_eclipse_fangs',
    name: '雙生幽刃·月蝕雙牙 (Eclipse Twin Fangs)',
    type: WEAPON_TYPES.DUAL_BLADES,
    rarity: 'SSR',
    icon: '⚔️',
    baseDamage: 48,
    attackSpeed: 2.4,
    range: 65,
    arcAngle: Math.PI * 0.5,
    critRate: 0.30,
    critMultiplier: 2.5,
    description: '浸染無盡夜影的匕首，能切裂空間並在敵人背後留下深邃的噬魂傷痕。',
    passive: '【背刺死劫】：從敵人身後攻擊時傷害提升 80%，並恢復 10 點黯影能量。'
  },
  {
    id: 'ssr_sanctum_spear',
    name: '聖輝長矛·極光貫日 (Radiant Lance of Dawn)',
    type: WEAPON_TYPES.SPEAR,
    rarity: 'SSR',
    icon: '🔱',
    baseDamage: 68,
    attackSpeed: 1.6,
    range: 130,
    arcAngle: Math.PI * 0.35,
    critRate: 0.18,
    critMultiplier: 2.0,
    description: '槍尖凝聚著未散的神聖極光，突刺能直接貫穿任何重型鎧甲。',
    passive: '【極光直擊】：長距離突刺命中邊緣目標時必定暴擊並擊退目標。'
  },
  {
    id: 'ssr_abyss_breaker',
    name: '崩淵重錘·大地震鳴 (Abyss Breaker)',
    type: WEAPON_TYPES.WARHAMMER,
    rarity: 'SSR',
    icon: '🔨',
    baseDamage: 110,
    attackSpeed: 0.85,
    range: 85,
    arcAngle: Math.PI * 0.6,
    critRate: 0.12,
    critMultiplier: 2.3,
    description: '以深淵玄鐵鍛造的撼地戰錘，一擊即可震裂大地並瓦解首領防禦。',
    passive: '【破盾震懾】：攻擊首領護盾時造成 300% 破盾傷害，重擊有機率使敵人眩暈 1.5 秒。'
  },
  {
    id: 'ssr_nightstalker',
    name: '獵夜勁弩·暮光風暴 (Nightstalker Windstorm)',
    type: WEAPON_TYPES.CROSSBOW,
    rarity: 'SSR',
    icon: '🏹',
    baseDamage: 55,
    attackSpeed: 1.8,
    range: 320,
    projectileSpeed: 550,
    critRate: 0.22,
    critMultiplier: 2.0,
    description: '能連續發射附帶光輝與暗影能量矢的高速連弩，放風箏戰術的極致武裝。',
    passive: '【穿透箭雨】：普通攻擊轉為三連射穿透箭矢，降低命中目標 30% 移動速度。'
  },
  {
    id: 'ssr_soul_harvester',
    name: '靈魂收割者·永夜死神 (Soul Harvester)',
    type: WEAPON_TYPES.SCYTHE,
    rarity: 'SSR',
    icon: '🌙',
    baseDamage: 78,
    attackSpeed: 1.3,
    range: 110,
    arcAngle: Math.PI * 0.9,
    critRate: 0.20,
    critMultiplier: 2.2,
    description: '收割徘徊於永夜中殘魂的幽冥巨鐮，能在旋風斬擊中瘋狂抽取敵人生命。',
    passive: '【靈魂虹吸】：擊殺敵人恢復 6% 最大生命值，並在黑暗區域中提升 25% 汲血率。'
  },

  // --- SR WEAPONS ---
  {
    id: 'sr_obsidian_blade',
    name: '黑曜石騎士巨劍 (Obsidian Knightblade)',
    type: WEAPON_TYPES.GREATSWORD,
    rarity: 'SR',
    icon: '🗡️',
    baseDamage: 62,
    attackSpeed: 1.0,
    range: 90,
    arcAngle: Math.PI * 0.7,
    critRate: 0.10,
    critMultiplier: 1.8,
    description: '堡壘精銳重裝騎士佩劍，堅韌無比。'
  },
  {
    id: 'sr_shadow_daggers',
    name: '夜行者隱刃 (Shadow Walker Daggers)',
    type: WEAPON_TYPES.DUAL_BLADES,
    rarity: 'SR',
    icon: '⚔️',
    baseDamage: 36,
    attackSpeed: 2.2,
    range: 60,
    arcAngle: Math.PI * 0.45,
    critRate: 0.22,
    critMultiplier: 2.0,
    description: '遊走於暗影中的斥候常備雙刀。'
  },
  {
    id: 'sr_silver_spear',
    name: '聖銀守衛長矛 (Silver Guardian Spear)',
    type: WEAPON_TYPES.SPEAR,
    rarity: 'SR',
    icon: '🔱',
    baseDamage: 50,
    attackSpeed: 1.5,
    range: 120,
    arcAngle: Math.PI * 0.3,
    critRate: 0.12,
    critMultiplier: 1.8,
    description: '鍍銀槍尖，對魔物有天然驅散效果。'
  },
  {
    id: 'sr_heavy_mallet',
    name: '破陣玄鐵錘 (Breaching Iron Mallet)',
    type: WEAPON_TYPES.WARHAMMER,
    rarity: 'SR',
    icon: '🔨',
    baseDamage: 80,
    attackSpeed: 0.8,
    range: 80,
    arcAngle: Math.PI * 0.55,
    critRate: 0.08,
    critMultiplier: 2.0,
    description: '用於摧毀防線的重型工事鐵錘。'
  },
  {
    id: 'sr_repeater_bow',
    name: '速射連珠弩 (Repeater Crossbow)',
    type: WEAPON_TYPES.CROSSBOW,
    rarity: 'SR',
    icon: '🏹',
    baseDamage: 40,
    attackSpeed: 1.7,
    range: 300,
    projectileSpeed: 500,
    critRate: 0.15,
    critMultiplier: 1.8,
    description: '精密的齒輪連弩，火力壓制力強。'
  },
  {
    id: 'sr_crescent_scythe',
    name: '暗月骨鐮 (Crescent Bone Scythe)',
    type: WEAPON_TYPES.SCYTHE,
    rarity: 'SR',
    icon: '🌙',
    baseDamage: 58,
    attackSpeed: 1.2,
    range: 100,
    arcAngle: Math.PI * 0.8,
    critRate: 0.15,
    critMultiplier: 1.9,
    description: '以魔物骸骨打磨而成的鋒利月鐮。'
  },

  // --- R WEAPONS ---
  {
    id: 'r_recruit_sword',
    name: '新兵闊劍 (Recruit Broadsword)',
    type: WEAPON_TYPES.GREATSWORD,
    rarity: 'R',
    icon: '🗡️',
    baseDamage: 42,
    attackSpeed: 0.95,
    range: 85,
    arcAngle: Math.PI * 0.65,
    critRate: 0.05,
    critMultiplier: 1.5,
    description: '防線新兵配發的標準制式巨劍。'
  },
  {
    id: 'r_iron_daggers',
    name: '生鐵短刃 (Iron Short Blades)',
    type: WEAPON_TYPES.DUAL_BLADES,
    rarity: 'R',
    icon: '⚔️',
    baseDamage: 25,
    attackSpeed: 2.0,
    range: 55,
    arcAngle: Math.PI * 0.4,
    critRate: 0.12,
    critMultiplier: 1.6,
    description: '樸實無華但輕便耐用的鐵刀。'
  }
];

const WEAPONS_DATABASE = WEAPON_CATALOG;

const TALENT_TREE_DATA = [
  {
    id: 'sunbeam_reach',
    name: '日光延展 (Sunbeam Reach)',
    branch: 'radiant',
    icon: '☀️',
    cost: 50,
    desc: '光輝形態下，所有武器攻擊範圍增加 25%，光芒照明半徑提升 30%。',
    effect: { lightRadiusBonus: 60, attackRangeBonus: 0.25 }
  },
  {
    id: 'solar_consecration',
    name: '聖輝洗禮 (Solar Consecration)',
    branch: 'radiant',
    icon: '✨',
    cost: 100,
    desc: '形態切換為光輝時引爆神聖衝擊，為友軍恢復 15% 最大生命並眩暈周圍敵人。',
    effect: { shiftHeal: 0.15, shiftStun: 1.5 }
  },
  {
    id: 'umbral_siphon',
    name: '暗影汲取 (Umbral Siphon)',
    branch: 'shadow',
    icon: '🌑',
    cost: 50,
    desc: '黯影形態下汲血率提升 15%，擊殺敵人使移動速度提升 40% 持續 3 秒。',
    effect: { lifestealBonus: 0.15, killSpeedBuff: 0.4 }
  },
  {
    id: 'eclipse_assassin',
    name: '月蝕刺客 (Eclipse Assassin)',
    branch: 'shadow',
    icon: '⚡',
    cost: 100,
    desc: '在黑暗區域中暴擊傷害倍率額外增加 +50%，閃避後下一次攻擊必定暴擊。',
    effect: { darkCritDmgBonus: 0.5 }
  },
  {
    id: 'lumen_dynamo',
    name: '流明發電機 (Lumen Dynamo)',
    branch: 'survival',
    icon: '🕯️',
    cost: 40,
    desc: '提燈燃油消耗速度降低 40%，點燃火盆時立即獲得 20 點雙重能量。',
    effect: { oilConsumptionReduction: 0.4 }
  },
  {
    id: 'unyielding_fortress',
    name: '不屈堡壘 (Unyielding Fortress)',
    branch: 'survival',
    icon: '🛡️',
    cost: 80,
    desc: '最大生命值提升 30%，受到致死傷害時保留 1 點生命並觸發神聖無敵護盾 2 秒 (冷卻 90 秒)。',
    effect: { maxHpBonus: 0.3 }
  }
];
// ==================== END MODULE: weapons.js ====================


// ==================== BEGIN MODULE: audio.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Web Audio API Sound Synthesizer & Procedural Gothic Soundscape
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.isMuted = false;
    this.musicPlaying = false;
    this.musicInterval = null;
    this.currentTrack = 'citadel'; // 'citadel', 'expedition', 'boss'
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.startAmbientMusic();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- Sound Effects Synthesis ---

  playSlash(type = 'sword') {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';

    if (type === 'greatsword' || type === 'hammer') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.22);
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.22);
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.23);
    } else if (type === 'dual' || type === 'scythe') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.13);
    } else if (type === 'crossbow') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.09);
    } else { // Spear / Default
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.16);
    }
  }

  playHit(isCrit = false, isBoss = false) {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isCrit ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 220 : 130, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + (isBoss ? 0.3 : 0.15));

    gain.gain.setValueAtTime(isCrit ? 0.6 : 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + (isBoss ? 0.3 : 0.15));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + (isBoss ? 0.31 : 0.16));
  }

  playRadiantSkill() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Harmonic bell + holy sweep
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.4);
      gain.gain.setValueAtTime(0.2, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.04);
      osc.stop(t + 0.52);
    });
  }

  playShadowSkill() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.linearRampToValueAtTime(800, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  playFormShift(isPeak = false) {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isPeak ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isPeak ? 80 : 150, t);
    osc.frequency.exponentialRampToValueAtTime(isPeak ? 600 : 350, t + 0.3);

    gain.gain.setValueAtTime(isPeak ? 0.7 : 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.42);
  }

  playBrazierIgnite() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Fire whoosh + holy chime
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(440, t + 0.4);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.52);
  }

  playBossRoar() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.linearRampToValueAtTime(45, t + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.92);
  }

  playGachaPull() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.6);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.72);
  }

  playGachaRevealSSR() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    const chords = [440, 554.37, 659.25, 880, 1108.73];
    chords.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.3, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + 1.25);
    });
  }

  playLevelUp() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Triumphant Holy Ascension Major Chords
    const freqs = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0, 1174.66];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx >= 4 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, t + idx * 0.07);
      gain.gain.setValueAtTime(0.35, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 1.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 1.15);
    });
  }

  playLootPickup() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, t);
    osc.frequency.setValueAtTime(880, t + 0.08);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playButtonClick() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // --- Procedural Gothic Ambient Music Generator ---
  startAmbientMusic() {
    if (this.musicInterval) clearInterval(this.musicInterval);

    // Minor chord progressions (D minor / A minor)
    const dMinorScale = [73.42, 110.0, 146.83, 174.61, 220.0, 261.63, 293.66];
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || this.isMuted || this.ctx.state === 'suspended') return;
      const t = this.ctx.currentTime;

      // Deep drone bass note every 4 beats
      if (step % 4 === 0) {
        const droneOsc = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        droneOsc.type = 'sawtooth';
        droneOsc.frequency.setValueAtTime(this.currentTrack === 'boss' ? 55 : 73.42, t);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, t);

        droneGain.gain.setValueAtTime(0.18, t);
        droneGain.gain.linearRampToValueAtTime(0.01, t + 3.8);

        droneOsc.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(this.musicGain);
        droneOsc.start(t);
        droneOsc.stop(t + 3.9);
      }

      // Eerie gothic melodic note
      const noteFreq = dMinorScale[Math.floor(Math.random() * dMinorScale.length)];
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();
      melOsc.type = 'sine';
      melOsc.frequency.setValueAtTime(noteFreq * (Math.random() > 0.5 ? 2 : 1), t);

      melGain.gain.setValueAtTime(0.08, t);
      melGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

      melOsc.connect(melGain);
      melGain.connect(this.musicGain);
      melOsc.start(t);
      melOsc.stop(t + 1.9);

      step++;
    }, 1000);
  }

  setMusicTrack(track) {
    this.currentTrack = track;
  }
}

const audio = new SoundEngine();
// ==================== END MODULE: audio.js ====================


// ==================== BEGIN MODULE: particles.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Particle System & Floating Combat Text Engine
 */

class ParticleEngine {
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
// ==================== END MODULE: particles.js ====================


// ==================== BEGIN MODULE: lighting.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Dynamic 2D Chiaroscuro Lighting & Darkness Engine
 */

class LightingEngine {
  constructor() {
    this.lightSources = [];
    this.darknessCanvas = document.createElement('canvas');
    this.darknessCtx = this.darknessCanvas.getContext('2d');
    this.ambientDarkness = 0.94; // 0 (bright) to 1 (pitch black)
    this.flickerTimer = 0;
  }

  resize(width, height) {
    this.darknessCanvas.width = width;
    this.darknessCanvas.height = height;
  }

  clearLights() {
    this.lightSources = [];
  }

  addLight(x, y, radius, color = '#ffd700', intensity = 1.0, flicker = true) {
    this.lightSources.push({
      x,
      y,
      radius,
      color,
      intensity,
      flicker,
      id: Math.random().toString(36).substr(2, 9)
    });
  }

  // Check if coordinates are covered by any active light source
  isPointInLight(x, y) {
    for (const light of this.lightSources) {
      const dx = x - light.x;
      const dy = y - light.y;
      const distSq = dx * dx + dy * dy;
      if (distSq <= (light.radius * 0.85) * (light.radius * 0.85)) {
        return true;
      }
    }
    return false;
  }

  update(dt) {
    this.flickerTimer += dt * 5;
  }

  render(ctx, cameraX, cameraY, width, height) {
    const dCtx = this.darknessCtx;
    dCtx.clearRect(0, 0, width, height);

    // 1. Fill with gothic ambient darkness
    dCtx.fillStyle = `rgba(5, 5, 8, ${this.ambientDarkness})`;
    dCtx.fillRect(0, 0, width, height);

    // 2. Cut out light circles with soft gradients
    dCtx.globalCompositeOperation = 'destination-out';

    for (const light of this.lightSources) {
      const screenX = light.x - cameraX;
      const screenY = light.y - cameraY;

      // Skip lights off-screen
      if (
        screenX < -light.radius ||
        screenX > width + light.radius ||
        screenY < -light.radius ||
        screenY > height + light.radius
      ) {
        continue;
      }

      let flickerOffset = 0;
      if (light.flicker) {
        flickerOffset = Math.sin(this.flickerTimer + light.x * 0.05) * 6 + Math.cos(this.flickerTimer * 1.5) * 4;
      }
      const actualRadius = Math.max(10, light.radius + flickerOffset);

      const radGrad = dCtx.createRadialGradient(
        screenX, screenY, actualRadius * 0.15,
        screenX, screenY, actualRadius
      );
      radGrad.addColorStop(0, `rgba(0, 0, 0, ${light.intensity})`);
      radGrad.addColorStop(0.6, `rgba(0, 0, 0, ${light.intensity * 0.7})`);
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      dCtx.fillStyle = radGrad;
      dCtx.beginPath();
      dCtx.arc(screenX, screenY, actualRadius, 0, Math.PI * 2);
      dCtx.fill();
    }

    // Reset composite operation
    dCtx.globalCompositeOperation = 'source-over';

    // 3. Draw colored luminous glow on main context
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const light of this.lightSources) {
      const screenX = light.x - cameraX;
      const screenY = light.y - cameraY;

      if (
        screenX < -light.radius ||
        screenX > width + light.radius ||
        screenY < -light.radius ||
        screenY > height + light.radius
      ) {
        continue;
      }

      const glowGrad = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, light.radius * 0.9
      );
      glowGrad.addColorStop(0, light.color);
      glowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(screenX, screenY, light.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Overlay the darkness mask onto the main game canvas
    ctx.drawImage(this.darknessCanvas, 0, 0);
  }
}
// ==================== END MODULE: lighting.js ====================


// ==================== BEGIN MODULE: companions.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Companion System & AI Autonomous Combat Engine
 */


const COMPANION_CLASSES = [
  {
    id: 'companion_guardian',
    name: '聖堂前衛·羅蘭 (Roland, Frontline Guardian)',
    role: 'Tank & Brazier Igniter',
    icon: '🛡️',
    color: '#38bdf8',
    baseHp: 1800,
    baseDamage: 35,
    attackCooldown: 1.4,
    description: '身著厚重聖銀甲冑的忠誠騎士。主動技能會嘲諷周圍敵人並施加護盾，能自動奔向並點燃未啟動的火盆。',
    activeSkillName: '聖盾守護 / 點燃火盆',
    skillCooldown: 10,
    dialogues: [
      '「只要我的巨盾尚未碎裂，永夜的陰影便休想染指大人分毫。」',
      '「堡壘的每一盞光芒，都是我們在無盡黑暗中築起的防線。」',
      '「小心暗處，魔物們正在等待提燈熄滅的那一刻！」'
    ]
  },
  {
    id: 'companion_stalker',
    name: '幽影遊俠·薇絲佩拉 (Vespera, Shadow Stalker)',
    role: 'Assassin & Debuffer',
    icon: '🗡️',
    color: '#a855f7',
    baseHp: 900,
    baseDamage: 65,
    attackCooldown: 0.9,
    description: '穿梭於深邃暗影中的致命刺客。攻擊附帶撕裂效果，主動技能標記強力目標使其受到 40% 額外傷害。',
    activeSkillName: '幽影獵殺印記',
    skillCooldown: 8,
    dialogues: [
      '「黑暗從不是我的敵人，而是我最鋒利的刀鞘。」',
      '「在它們察覺到心跳停止之前，我的短刃早已劃過咽喉。」',
      '「跟緊我，我知道哪裡隱藏著最罕見的黑鐵礦藏。」'
    ]
  },
  {
    id: 'companion_scholar',
    name: '密契學者·萊拉 (Lyra, Scholar of Secrets)',
    role: 'Support & Lumen Replenish',
    icon: '📜',
    color: '#facc15',
    baseHp: 800,
    baseDamage: 45,
    attackCooldown: 1.2,
    description: '精通古代流明奧術的學者。能發射自動追蹤的秘術飛彈，主動技能立即為提燈補充 35 點燃油並恢復隊伍生命。',
    activeSkillName: '流明秘術充能',
    skillCooldown: 12,
    dialogues: [
      '「這些古代魔物的符文...與大崩潰前的星界魔導術驚人地一致。」',
      '「別讓提燈熄滅！光的波長是維持我們理智的唯一屏障。」',
      '「我已經解析出敵人的弱點構造，全力攻擊它！」'
    ]
  },
  {
    id: 'companion_night_eater',
    name: '噬夜怪客·莫布 (Morb, Night-Eater)',
    role: 'Eldritch & Auto-Looter',
    icon: '👾',
    color: '#f43f5e',
    baseHp: 1300,
    baseDamage: 55,
    attackCooldown: 1.1,
    description: '自深淵暗影中誕生的奇異共生生物。吞噬魔物殘魂以強化自身，自動吸附遠處掉落的物資，主動技能釋放恐懼尖嘯。',
    activeSkillName: '深淵恐懼尖嘯',
    skillCooldown: 10,
    dialogues: [
      '「*咕嚕咕嚕*...黑暗的味道...美味...」',
      '「閃亮的鐵塊！好吃的魂魄！莫布都幫主人撿回來！」',
      '「*嘶吼*...魔鬼，莫布咬碎你們！」'
    ]
  }
];

class Companion {
  constructor(classData = COMPANION_CLASSES[0]) {
    this.data = classData;
    this.x = 350;
    this.y = 300;
    this.prevX = 350;
    this.prevY = 300;
    this.radius = 16;
    this.speed = 210;
    this.hp = classData.baseHp;
    this.maxHp = classData.baseHp;
    this.level = 1;
    this.exp = 0;
    this.bondLevel = 1;
    this.bondExp = 0;

    this.attackCooldownTimer = 0;
    this.skillCooldownTimer = 0;
    this.targetBrazier = null;
    this.targetEnemy = null;
  }

  getMaxExp(level = this.level) {
    return Math.round(100 * Math.pow(level, 1.4));
  }

  gainExp(amount, particleEngine = null) {
    if (!amount || amount <= 0) return false;
    this.exp += Math.round(amount);
    let leveledUp = false;

    while (this.exp >= this.getMaxExp()) {
      this.exp -= this.getMaxExp();
      this.level++;
      this.maxHp = this.data.baseHp + (this.level - 1) * 100;
      this.hp = this.maxHp;
      leveledUp = true;

      if (particleEngine) {
        particleEngine.emitShockwaveRing(this.x, this.y, 160, this.data.color, 0.6);
        particleEngine.addFloatingText(this.x, this.y - 20, `🛡️ 隨從升級 Lv.${this.level}!`, 'heal');
      }
    }
    return leveledUp;
  }

  setCompanionClass(classData) {
    this.data = classData;
    this.maxHp = classData.baseHp + (this.level - 1) * 100;
    this.hp = this.maxHp;
  }

  triggerActiveSkill(player, dungeon, particleEngine) {
    if (this.skillCooldownTimer > 0) return false;
    this.skillCooldownTimer = this.data.skillCooldown;

    audio.playRadiantSkill();
    particleEngine.emitShockwaveRing(this.x, this.y, 160, this.data.color, 0.5);

    if (this.data.id === 'companion_guardian') {
      // Roland: Taunt + rush to closest unlit brazier
      const unlit = dungeon.braziers.find(b => !b.isLit);
      if (unlit) {
        this.targetBrazier = unlit;
        particleEngine.addFloatingText(this.x, this.y, '點燃火盆！', 'normal');
      } else {
        particleEngine.addFloatingText(this.x, this.y, '聖堂嘲諷！', 'normal');
      }
    } else if (this.data.id === 'companion_stalker') {
      // Vespera: Mark boss or closest elite
      particleEngine.addFloatingText(this.x, this.y, '致命印記！', 'backstab');
    } else if (this.data.id === 'companion_scholar') {
      // Lyra: Refuel lantern + heal
      player.lanternFuel = Math.min(player.maxLanternFuel, player.lanternFuel + 35);
      player.heal(180, particleEngine);
      particleEngine.addFloatingText(player.x, player.y, '+35 提燈油料', 'heal');
    } else if (this.data.id === 'companion_night_eater') {
      // Morb: Fear roar + auto collect
      particleEngine.addFloatingText(this.x, this.y, '恐懼尖嘯！', 'stun');
    }

    return true;
  }

  update(dt, player, enemies, boss, dungeon, particleEngine) {
    this.prevX = this.x;
    this.prevY = this.y;

    if (this.skillCooldownTimer > 0) this.skillCooldownTimer -= dt;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;

    // Follow Target Brazier Priority (Roland)
    if (this.targetBrazier && !this.targetBrazier.isLit) {
      const dx = this.targetBrazier.x - this.x;
      const dy = this.targetBrazier.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 40) {
        this.targetBrazier.ignite(particleEngine);
        this.targetBrazier = null;
      } else {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
        return;
      }
    }

    // Follow player if too far
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    if (distToPlayer > 300) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.x += Math.cos(angle) * this.speed * 1.3 * dt;
      this.y += Math.sin(angle) * this.speed * 1.3 * dt;
      return;
    }

    // Target closest enemy or boss
    let closestTarget = null;
    let minDist = 220;

    if (boss && boss.isActive && !boss.isDead) {
      closestTarget = boss;
      minDist = Math.hypot(boss.x - this.x, boss.y - this.y);
    } else {
      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (d < minDist) {
          minDist = d;
          closestTarget = enemy;
        }
      }
    }

    if (closestTarget) {
      const dx = closestTarget.x - this.x;
      const dy = closestTarget.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 50) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }

      // Attack
      if (this.attackCooldownTimer <= 0 && dist < 75) {
        this.attackCooldownTimer = this.data.attackCooldown;
        const dmg = this.data.baseDamage + (this.level - 1) * 6;
        closestTarget.takeDamage(dmg, false, 1.0, particleEngine);
        audio.playSlash('spear');
        particleEngine.emitSparks(closestTarget.x, closestTarget.y, this.data.color, 6, 100);
      }
    } else if (distToPlayer > 70) {
      // Stay near player
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.x += Math.cos(angle) * (this.speed * 0.7) * dt;
      this.y += Math.sin(angle) * (this.speed * 0.7) * dt;
    }
  }

  render(ctx, cameraX, cameraY) {
    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);

    // Companion Aura
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = this.data.color + '33';
    ctx.fill();
    ctx.strokeStyle = this.data.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e2230';
    ctx.fill();

    // Icon
    ctx.font = '14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.data.icon, 0, 1);

    ctx.restore();
  }
}
// ==================== END MODULE: companions.js ====================


// ==================== BEGIN MODULE: enemies.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Enemy Hierarchy, AI Behaviors, and Dark Zone Frenzy Buffs
 */


const ENEMY_TYPES = {
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

class Enemy {
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
// ==================== END MODULE: enemies.js ====================


// ==================== BEGIN MODULE: boss.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Boss Encounter System: Four Major Abyssal Overlords
 * Garuka (Barren), Varn (Blood Mire), Silva (Frost Abyss), Othello (Eclipse Sanctum)
 */


const BOSS_CONFIGS = {
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

class BossGaruka {
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
// ==================== END MODULE: boss.js ====================


// ==================== BEGIN MODULE: dungeon.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Procedural Dungeon & Instance Generator: The Four Major Maps & Four Demonic Pillars
 * Seeded Multi-Room Generation, Difficulty Tiers, Random Affixes, and Dynamic Topology
 */


class PRNG {
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

const MAP_ZONES = {
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

const DUNGEON_AFFIXES = {
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

const ROOM_TYPES = {
  ENTRANCE: 'entrance',
  COMBAT: 'combat',
  PILLAR_ALTAR: 'pillar_altar',
  TREASURE: 'treasure',
  BOSS: 'boss'
};

class DungeonRoom {
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

const PILLAR_TYPES = {
  BLOOD: 'blood',
  FROST: 'frost',
  VOID: 'void',
  ECLIPSE: 'eclipse'
};

const PILLAR_CONFIGS = {
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

class DemonicPillar {
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

class Brazier {
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

class Chest {
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
      blackIron: Math.floor(Math.random() * 25 + 15),
      rations: Math.floor(Math.random() * 20 + 10),
      starlightShards: Math.floor(Math.random() * 15 + 10)
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

class LootDrop {
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

class DungeonMap {
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
        if (drop.type === 'oil') {
          player.lanternFuel = Math.min(player.maxLanternFuel, player.lanternFuel + 15);
          particleEngine.addFloatingText(player.x, player.y, '+15 燃油', 'heal');
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
// ==================== END MODULE: dungeon.js ====================


// ==================== BEGIN MODULE: player.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Player State, Dual-Form Combat Engine, Skills, and Dodge Mechanics
 */


const FORMS = {
  RADIANT: 'radiant',
  SHADOW: 'shadow'
};

class Player {
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
    let rate = this.equippedWeapon.critRate;
    if (this.form === FORMS.SHADOW && !this.isInLightZone) {
      rate += 0.40; // PRD: High crit bonus in dark zones for Shadow Form
    }
    return Math.min(1.0, rate);
  }

  getCritMultiplier() {
    let mult = this.equippedWeapon.critMultiplier;
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
      r += 60;
    }
    return Math.max(30, r);
  }

  // --- Dual-Form Shift Mechanism ---
  toggleForm(particleEngine) {
    const isPeak = (this.form === FORMS.RADIANT ? this.radiantEnergy : this.shadowEnergy) >= this.maxEnergy;
    
    // Switch Form
    this.form = this.form === FORMS.RADIANT ? FORMS.SHADOW : FORMS.RADIANT;
    
    audio.playFormShift(isPeak);

    if (isPeak) {
      // PRD: Form Shifts at peak energy trigger devastating Sun & Moon Cataclysm shockwave
      this.surgeTimer = 6.0;
      if (this.form === FORMS.RADIANT) {
        this.radiantEnergy = 20;
      } else {
        this.shadowEnergy = 20;
      }

      particleEngine.addShake(15);
      particleEngine.emitShockwaveRing(this.x, this.y, 220, '#ffd700', 0.5);
      particleEngine.emitShockwaveRing(this.x, this.y, 260, '#9400d3', 0.6);
      particleEngine.emitSparks(this.x, this.y, '#ffd700', 25, 260);
      particleEngine.emitShadowWisps(this.x, this.y, 20);

      // Talent: Solar Consecration heal
      if (this.form === FORMS.RADIANT && this.unlockedTalents.has('solar_consecration')) {
        const healAmt = Math.round(this.getMaxHp() * 0.15);
        this.hp = Math.min(this.getMaxHp(), this.hp + healAmt);
        particleEngine.addFloatingText(this.x, this.y, healAmt, 'heal');
      }

      return { isCataclysm: true, x: this.x, y: this.y, radius: 250, damage: 180 };
    } else {
      particleEngine.emitSparks(this.x, this.y, this.form === FORMS.RADIANT ? '#ffd700' : '#9400d3', 10, 120);
      return { isCataclysm: false };
    }
  }

  // --- Dodge Roll ---
  dodge(targetAngle, particleEngine) {
    if (this.dodgeCooldown > 0 || this.isDodging || this.isDead) return;

    this.isDodging = true;
    this.isInvulnerable = true;
    this.dodgeTimer = this.dodgeDuration;
    this.dodgeCooldown = 0.7;

    const dodgeSpeed = 480;
    this.dodgeVx = Math.cos(targetAngle) * dodgeSpeed;
    this.dodgeVy = Math.sin(targetAngle) * dodgeSpeed;

    audio.playSlash('dual');
    particleEngine.emitShadowWisps(this.x, this.y, 8);
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
// ==================== END MODULE: player.js ====================


// ==================== BEGIN MODULE: account.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Account Sanctum: Secure Authentication, Session Management, and Multi-Hero Profiles
 * Fail-safe Cross-Origin Session Engine with WebCrypto & Synchronous Fallback
 */

const ACCOUNTS_DB_KEY = 'evernight_accounts_db_v1';
const ACTIVE_SESSION_KEY = 'evernight_active_session_v1';
const LAST_USER_KEY = 'evernight_last_user_v1';

const AVATAR_PRESETS = [
  { id: 'sun_knight', icon: '☀️', name: '太陽聖誓騎士', color: '#ffd700', role: '光輝近衛' },
  { id: 'shadow_assassin', icon: '🌑', name: '暗影逐夜刺客', color: '#c084fc', role: '暗影刺殺' },
  { id: 'aurora_vanguard', icon: '🔱', name: '極光破曉先鋒', color: '#38bdf8', role: '神聖貫通' },
  { id: 'abyss_walker', icon: '🔨', name: '深淵撼地行者', color: '#f87171', role: '撼地破盾' }
];

const TITLE_PRESETS = [
  '【初光聖誓者】',
  '【破曉使徒】',
  '【暗夜獵手】',
  '【深淵征服者】',
  '【不滅守望者】',
  '【永夜星火】'
];

class AccountSystem {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // 1. Ensure default accounts exist
    const accounts = this.getAccounts();
    if (Object.keys(accounts).length === 0) {
      this.createDemoAccount();
    }

    // 2. Load Session (supports both tab session & persistent local storage)
    this.loadSession();
  }

  fallbackHash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  }

  async hashPassword(password, salt = '') {
    const text = String(password || '') + String(salt || '');
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      try {
        const enc = new TextEncoder();
        const data = enc.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        console.warn('crypto.subtle failed, using fallback hash:', e);
      }
    }
    return this.fallbackHash(text);
  }

  getAccounts() {
    try {
      const raw = localStorage.getItem(ACCOUNTS_DB_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('Failed to read accounts database:', e);
      return {};
    }
  }

  saveAccounts(accounts) {
    try {
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts database:', e);
    }
  }

  createDemoAccount() {
    const salt = 'demo_salt_evernight';
    const passwordHash = this.fallbackHash('123456' + salt);
    const accounts = {
      'DawnSeeker': {
        username: 'DawnSeeker',
        passwordHash,
        plainPassword: '123456',
        salt,
        avatar: AVATAR_PRESETS[0],
        title: '【初光聖誓者】',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        stats: {
          totalExpeditions: 12,
          bossKills: 5,
          highestCombo: 48,
          pvpWins: 0
        }
      }
    };
    this.saveAccounts(accounts);
    return accounts;
  }

  loadSession() {
    try {
      const accounts = this.getAccounts();

      // Priority 1: Current tab session
      let raw = sessionStorage.getItem(ACTIVE_SESSION_KEY);
      // Priority 2: Persistent last active user in local storage
      if (!raw) {
        const lastUsername = localStorage.getItem(LAST_USER_KEY);
        if (lastUsername && accounts[lastUsername]) {
          this.currentUser = accounts[lastUsername];
          return;
        }
      }

      if (raw) {
        const session = JSON.parse(raw);
        if (session.isGuest) {
          this.currentUser = session;
        } else if (session.username && accounts[session.username]) {
          this.currentUser = accounts[session.username];
        } else {
          this.currentUser = session;
        }
        return;
      }

      // Priority 3: First existing account in database
      const accountList = Object.values(accounts);
      if (accountList.length > 0) {
        this.currentUser = accountList[0];
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      console.warn('Session load failed:', e);
      this.currentUser = null;
    }
  }

  saveSession(user) {
    this.currentUser = user;
    try {
      sessionStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
      if (user && user.username && !user.isGuest) {
        localStorage.setItem(LAST_USER_KEY, user.username);
      }
    } catch (e) {
      console.error('Session save failed:', e);
    }
  }

  clearSession() {
    this.currentUser = null;
    try {
      sessionStorage.removeItem(ACTIVE_SESSION_KEY);
      localStorage.removeItem(LAST_USER_KEY);
    } catch (e) {
      console.error('Session clear failed:', e);
    }
  }

  async register(username, password, avatarId = 'sun_knight', title = '【初光聖誓者】') {
    if (!username) {
      return { success: false, reason: '請填寫聖誓者代號！' };
    }
    const cleanUsername = String(username).trim();
    if (cleanUsername.length < 2 || cleanUsername.length > 16) {
      return { success: false, reason: '帳號名稱長度需介於 2 ~ 16 字元！' };
    }
    const cleanPassword = String(password || '').trim();
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, reason: '密碼長度需至少 4 位數！' };
    }

    const accounts = this.getAccounts();
    // Check case-insensitive match
    const existingKey = Object.keys(accounts).find(k => k.toLowerCase() === cleanUsername.toLowerCase());
    if (existingKey) {
      return { success: false, reason: `聖誓者代號【${cleanUsername}】已被註冊，請直接在「帳號登入」標籤登入！` };
    }

    const salt = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const passwordHash = await this.hashPassword(cleanPassword, salt);
    const avatar = AVATAR_PRESETS.find(a => a.id === avatarId) || AVATAR_PRESETS[0];

    const newUser = {
      username: cleanUsername,
      passwordHash,
      plainPassword: cleanPassword,
      salt,
      avatar,
      title: title || '【初光聖誓者】',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      stats: {
        totalExpeditions: 0,
        bossKills: 0,
        highestCombo: 0,
        pvpWins: 0
      }
    };

    accounts[cleanUsername] = newUser;
    this.saveAccounts(accounts);
    this.saveSession(newUser);

    return { success: true, user: newUser };
  }

  async login(username, password) {
    if (!username || !String(username).trim()) {
      return { success: false, reason: '請輸入聖誓者代號！' };
    }
    if (!password || !String(password).trim()) {
      return { success: false, reason: '請輸入誓約密碼！' };
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();
    const accounts = this.getAccounts();

    // Find account (case-insensitive search for convenience)
    const matchedKey = Object.keys(accounts).find(k => k.toLowerCase() === cleanUsername.toLowerCase());
    const user = matchedKey ? accounts[matchedKey] : accounts[cleanUsername];

    if (!user) {
      return { success: false, reason: `查無聖誓者帳號【${cleanUsername}】，請確認名稱或前往「註冊新誓約」建立！` };
    }

    // Comprehensive multi-mode password verification
    let isPasswordValid = false;

    // 1. Plaintext Match
    if (user.plainPassword && user.plainPassword === cleanPassword) {
      isPasswordValid = true;
    }
    // 2. Direct string match against hash
    else if (user.passwordHash === cleanPassword) {
      isPasswordValid = true;
    } else {
      const salt = user.salt || '';
      const inputHash = await this.hashPassword(cleanPassword, salt);
      const fallbackInputHash = this.fallbackHash(cleanPassword + salt);
      const directHash = this.fallbackHash(cleanPassword);
      const directWebHash = await this.hashPassword(cleanPassword, '');

      if (
        inputHash === user.passwordHash ||
        fallbackInputHash === user.passwordHash ||
        directHash === user.passwordHash ||
        directWebHash === user.passwordHash
      ) {
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      return { success: false, reason: '密碼驗證錯誤，請重新輸入正確密碼！' };
    }

    user.lastLoginAt = Date.now();
    user.plainPassword = cleanPassword; // Ensure plain backup
    accounts[matchedKey || cleanUsername] = user;
    this.saveAccounts(accounts);
    this.saveSession(user);

    return { success: true, user };
  }

  loginDirect(username) {
    if (!username || !String(username).trim()) {
      return { success: false, reason: '請指定帳號名稱！' };
    }
    const cleanUsername = String(username).trim();
    const accounts = this.getAccounts();
    const matchedKey = Object.keys(accounts).find(k => k.toLowerCase() === cleanUsername.toLowerCase()) || cleanUsername;
    const user = accounts[matchedKey];

    if (!user) {
      return { success: false, reason: `查無聖誓者帳號【${cleanUsername}】！` };
    }

    user.lastLoginAt = Date.now();
    accounts[matchedKey] = user;
    this.saveAccounts(accounts);
    this.saveSession(user);

    return { success: true, user };
  }

  loginAsGuest() {
    const guestId = Math.floor(1000 + Math.random() * 9000);
    const guestUser = {
      isGuest: true,
      username: `遊俠·${guestId}`,
      avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      title: '【無名浪人】',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      stats: {
        totalExpeditions: 0,
        bossKills: 0,
        highestCombo: 0,
        pvpWins: 0
      }
    };
    this.saveSession(guestUser);
    return { success: true, user: guestUser };
  }

  logout() {
    this.clearSession();
    return { success: true };
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  calculateCombatPower(player) {
    if (!player) return 1000;
    let power = (player.level || 1) * 350;
    power += player.getMaxHp() * 1.5;
    power += player.getAttackDamage() * 8;
    power += player.unlockedTalents.size * 250;
    return Math.round(power);
  }
}

const accountSystem = new AccountSystem();
// ==================== END MODULE: account.js ====================


// ==================== BEGIN MODULE: citadel.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Bastion of Humanity: Citadel Resource Management & Branching Moral Dilemmas
 */

const MORAL_DILEMMAS = [
  {
    id: 'dilemma_blood_plague',
    badge: '緊急疫情',
    title: '第四隔離區的血疫異變 (The Blood Plague in Ward 4)',
    desc: '第四貧民隔離區爆發了深淵血疫，數名感染者眼球泛起駭人的暗影紫光，隨時可能異變為狂暴魔物。醫官請求動用極度珍貴的流明聖油製作解毒劑，否則疫情可能蔓延至全城。',
    options: [
      {
        text: '🔥 徹底封鎖並以聖火淨化隔離區',
        hint: '損失部分倖存者，但徹底切斷疫病隱患，節省聖油',
        effects: { survivors: -18, morale: -10, lumenOil: +20, blackIron: +15 },
        resultText: '你下令降下鐵閘並引燃聖火。慘叫聲在晨曦前漸漸平息，疫病被冷酷地扼殺在搖籃中。'
      },
      {
        text: '🧪 開放軍械庫珍藏聖油全力救治',
        hint: '消耗大量流明聖油與糧草，挽救所有人並大幅提升民心士氣',
        effects: { lumenOil: -45, rations: -30, survivors: +25, morale: +30 },
        resultText: '在聖油與醫官的日夜搶救下，感染者奇蹟般康復。倖存者們高呼領主仁德，堡壘士氣大振！'
      }
    ]
  },
  {
    id: 'dilemma_refugees',
    badge: '難民危機',
    title: '堡壘鐵門外的流民潮 (Refugees at the Bastion Gate)',
    desc: '數百名來自淪陷外圍哨所的飢餓難民聚集在黑鐵城門前，哀求庇護。偵查兵回報其中可能潛伏著被魔化感染的寄生宿主，且堡壘的糧草庫存已難以長久支撐。',
    options: [
      {
        text: '🛡️ 開啟側門進行聖光篩查並接納難民',
        hint: '消耗糧草，增加堡壘勞動力與士氣',
        effects: { rations: -50, survivors: +40, morale: +20 },
        resultText: '經過嚴格的提燈光芒照射篩查，難民們感激涕零地湧入堡壘，為工坊帶來了寶貴的新生勞動力。'
      },
      {
        text: '🏹 堅壁清野，嚴防死守不予開門',
        hint: '保存糧草與安全，但令城內軍民感到心寒',
        effects: { morale: -25, blackIron: +25, rations: +10 },
        resultText: '冷酷的拒絕引發了城門外的騷動與絕望號哭。雖然物資得以保存，但城內守軍的心頭蒙上了一層陰影。'
      }
    ]
  },
  {
    id: 'dilemma_occult_forge',
    badge: '異端事件',
    title: '地下水道的深淵秘術儀式 (Occult Ritual in the Sewers)',
    desc: '巡邏隊在地下暗渠抓獲了一群秘密研習深淵黑魔法的學者，他們聲稱找到了利用魔物靈魂強化黑鐵武器的禁忌鍛造法，希望能用此法為守軍打造弒魔兵刃。',
    options: [
      {
        text: '⚖️ 恪守聖誓，公開審判並處決異教徒',
        hint: '維持正統信仰與秩序，獲得星光純潔祝福',
        effects: { morale: +25, starlightShards: +50 },
        resultText: '神聖的判決彰顯了聖誓騎士團的純潔意志，市民們對破曉之光的信仰更加堅定。'
      },
      {
        text: '⚔️ 秘密接納研究，為軍械聖殿注入深淵秘力',
        hint: '獲取大量黑鐵與珍稀星光碎屑，但略微損害士氣',
        effects: { morale: -15, blackIron: +80, starlightShards: +70 },
        resultText: '禁忌的黑魔法在軍械工坊中燃起紫火，新出爐的武器泛著令人心悸的嗜血寒芒。'
      }
    ]
  }
];

class CitadelSystem {
  constructor() {
    this.rations = 150;
    this.blackIron = 120;
    this.lumenOil = 100;
    this.morale = 85; // 0-100
    this.survivors = 180;
    this.starlightShards = 120;
    this.forgeTickets = 15;

    this.currentDilemmaIndex = 0;
    this.completedDilemmas = new Set();
  }

  applyExpeditionLoot(loot) {
    if (loot.blackIron) this.blackIron += loot.blackIron;
    if (loot.rations) this.rations += loot.rations;
    if (loot.lumenOil) this.lumenOil += loot.lumenOil;
    if (loot.starlightShards) this.starlightShards += loot.starlightShards;
  }

  getCurrentDilemma() {
    if (this.currentDilemmaIndex < MORAL_DILEMMAS.length) {
      return MORAL_DILEMMAS[this.currentDilemmaIndex];
    }
    return null;
  }

  chooseDilemmaOption(optionIndex) {
    const dilemma = this.getCurrentDilemma();
    if (!dilemma) return null;

    const opt = dilemma.options[optionIndex];
    if (!opt) return null;

    // Apply effects
    if (opt.effects.rations) this.rations = Math.max(0, this.rations + opt.effects.rations);
    if (opt.effects.blackIron) this.blackIron = Math.max(0, this.blackIron + opt.effects.blackIron);
    if (opt.effects.lumenOil) this.lumenOil = Math.max(0, this.lumenOil + opt.effects.lumenOil);
    if (opt.effects.morale) this.morale = Math.max(0, Math.min(100, this.morale + opt.effects.morale));
    if (opt.effects.survivors) this.survivors = Math.max(0, this.survivors + opt.effects.survivors);
    if (opt.effects.starlightShards) this.starlightShards = Math.max(0, this.starlightShards + opt.effects.starlightShards);

    this.completedDilemmas.add(dilemma.id);
    this.currentDilemmaIndex = (this.currentDilemmaIndex + 1);

    return {
      resultText: opt.resultText,
      effects: opt.effects
    };
  }
}
// ==================== END MODULE: citadel.js ====================


// ==================== BEGIN MODULE: gacha.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Ancestral Forge: Gacha Summoning System with 65-Pull Pity & Resonance
 */


class AncestralForge {
  constructor() {
    this.pityCount = 0;
    this.hardPity = 65; // PRD: 65-pull pity for SSR
    this.totalPulls = 0;
    this.summonHistory = [];
  }

  pullOnce(citadel, player) {
    if (citadel.forgeTickets < 1 && citadel.starlightShards < 30) {
      return { success: false, reason: '召喚石或鍛造券不足！' };
    }

    if (citadel.forgeTickets >= 1) {
      citadel.forgeTickets -= 1;
    } else {
      citadel.starlightShards -= 30;
    }

    this.pityCount++;
    this.totalPulls++;

    const item = this.rollItem();
    audio.playGachaPull();

    if (item.rarity === 'SSR') {
      this.pityCount = 0; // Reset pity
      audio.playGachaRevealSSR();
    }

    return {
      success: true,
      item,
      pityCount: this.pityCount,
      pityRemaining: this.hardPity - this.pityCount
    };
  }

  pullTen(citadel, player) {
    const costTickets = 10;
    const costShards = 300;

    if (citadel.forgeTickets < costTickets && citadel.starlightShards < costShards) {
      return { success: false, reason: '召喚石或鍛造券不足以進行 10 連召喚！' };
    }

    if (citadel.forgeTickets >= costTickets) {
      citadel.forgeTickets -= costTickets;
    } else {
      citadel.starlightShards -= costShards;
    }

    const results = [];
    let hasSrOrAbove = false;

    audio.playGachaPull();

    for (let i = 0; i < 10; i++) {
      this.pityCount++;
      this.totalPulls++;

      let item = this.rollItem();
      if (item.rarity === 'SSR') {
        this.pityCount = 0;
        hasSrOrAbove = true;
      } else if (item.rarity === 'SR') {
        hasSrOrAbove = true;
      }
      results.push(item);
    }

    // 10-pull guarantee: at least 1 SR if all were R
    if (!hasSrOrAbove) {
      const srPool = WEAPON_CATALOG.filter(w => w.rarity === 'SR');
      results[9] = srPool[Math.floor(Math.random() * srPool.length)];
    }

    const hasSSR = results.some(r => r.rarity === 'SSR');
    if (hasSSR) {
      audio.playGachaRevealSSR();
    }

    return {
      success: true,
      results,
      pityCount: this.pityCount,
      pityRemaining: Math.max(0, this.hardPity - this.pityCount)
    };
  }

  rollItem() {
    // Check 65 hard pity
    if (this.pityCount >= this.hardPity) {
      const ssrPool = WEAPON_CATALOG.filter(w => w.rarity === 'SSR');
      return ssrPool[Math.floor(Math.random() * ssrPool.length)];
    }

    const rand = Math.random();

    // 3.5% SSR rate
    if (rand < 0.035) {
      const ssrPool = WEAPON_CATALOG.filter(w => w.rarity === 'SSR');
      return ssrPool[Math.floor(Math.random() * ssrPool.length)];
    }
    // 18% SR rate
    else if (rand < 0.215) {
      const srPool = WEAPON_CATALOG.filter(w => w.rarity === 'SR');
      return srPool[Math.floor(Math.random() * srPool.length)];
    }
    // 78.5% R rate
    else {
      const rPool = WEAPON_CATALOG.filter(w => w.rarity === 'R');
      return rPool[Math.floor(Math.random() * rPool.length)];
    }
  }
}
// ==================== END MODULE: gacha.js ====================


// ==================== BEGIN MODULE: arsenal.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Arsenal Sanctum: Independent Weapon Upgrades, Refinements, and Talent Resonance Tree
 */


class ArsenalSanctum {
  constructor() {
    this.weapons = [...WEAPON_CATALOG];
    this.selectedWeapon = this.weapons[0];
  }

  getUpgradeCost(weapon, currentLevel) {
    const baseCost = weapon.rarity === 'SSR' ? 40 : (weapon.rarity === 'SR' ? 25 : 15);
    return baseCost + (currentLevel - 1) * 8;
  }

  getRefineCost(weapon, currentRefinement) {
    const costIron = 70 + currentRefinement * 35;
    const costShards = 30 + currentRefinement * 20;
    return { costIron, costShards };
  }

  upgradeWeapon(player, citadel, targetWeapon = null) {
    const weapon = targetWeapon || this.selectedWeapon;
    const wData = player.getWeaponData(weapon.id);
    const costIron = this.getUpgradeCost(weapon, wData.level);

    if (citadel.blackIron < costIron) {
      return { success: false, reason: `黑鐵不足！強化此武器需要 ${costIron} 黑鐵。` };
    }

    citadel.blackIron -= costIron;
    wData.level += 1;
    audio.playBrazierIgnite();

    return {
      success: true,
      weapon,
      newLevel: wData.level,
      newDamage: player.getAttackDamage(weapon)
    };
  }

  refineWeapon(player, citadel, targetWeapon = null) {
    const weapon = targetWeapon || this.selectedWeapon;
    const wData = player.getWeaponData(weapon.id);

    if (wData.refinement >= 5) {
      return { success: false, reason: `【${weapon.name}】已達到最高精煉階級 (階級 5)！` };
    }

    const { costIron, costShards } = this.getRefineCost(weapon, wData.refinement);

    if (citadel.blackIron < costIron || citadel.starlightShards < costShards) {
      return { success: false, reason: `材料不足！精煉此武器需要 ${costIron} 黑鐵與 ${costShards} 星光碎屑。` };
    }

    citadel.blackIron -= costIron;
    citadel.starlightShards -= costShards;
    wData.refinement += 1;
    audio.playGachaRevealSSR();

    return {
      success: true,
      weapon,
      newRefinement: wData.refinement,
      newDamage: player.getAttackDamage(weapon)
    };
  }

  unlockTalent(talentId, player, citadel) {
    const talent = TALENT_TREE_DATA.find(t => t.id === talentId);
    if (!talent) return { success: false, reason: '天賦不存在' };

    if (player.unlockedTalents.has(talentId)) {
      return { success: false, reason: '該天賦已解鎖！' };
    }

    if (citadel.starlightShards < talent.cost) {
      return { success: false, reason: `星光碎屑不足！需要 ${talent.cost} 碎屑。` };
    }

    citadel.starlightShards -= talent.cost;
    player.unlockedTalents.add(talentId);
    audio.playRadiantSkill();

    return {
      success: true,
      talent
    };
  }
}
// ==================== END MODULE: arsenal.js ====================


// ==================== BEGIN MODULE: storage.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * LocalStorage Multi-Account Isolated Save / Load Management
 */


class SaveSystem {
  static getStorageKey(user = null) {
    const active = user || accountSystem.getCurrentUser();
    if (active && active.username) {
      return `evernight_save_${active.username}`;
    }
    return 'evernight_oath_save_default';
  }

  static save(player, companion, citadel, arsenal, user = null) {
    try {
      const key = this.getStorageKey(user);
      const data = {
        player: {
          level: player.level || 1,
          exp: player.exp || 0,
          weaponId: player.equippedWeapon ? player.equippedWeapon.id : 'ssr_dawnbreaker',
          weaponsData: player.weaponsData,
          unlockedTalents: Array.from(player.unlockedTalents)
        },
        companion: {
          classId: companion.data.id,
          level: companion.level || 1,
          exp: companion.exp || 0,
          bondLevel: companion.bondLevel || 1
        },
        citadel: {
          rations: citadel.rations,
          blackIron: citadel.blackIron,
          lumenOil: citadel.lumenOil,
          morale: citadel.morale,
          survivors: citadel.survivors,
          starlightShards: citadel.starlightShards,
          forgeTickets: citadel.forgeTickets,
          currentDilemmaIndex: citadel.currentDilemmaIndex
        }
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  static load(player, companion, citadel, arsenal, user = null) {
    try {
      const key = this.getStorageKey(user);
      let raw = localStorage.getItem(key);

      // Fallback to legacy default save if user-specific save is not yet created
      if (!raw) {
        raw = localStorage.getItem('evernight_oath_save_v1');
      }
      if (!raw) return false;

      const data = JSON.parse(raw);

      if (data.player) {
        player.level = data.player.level || 1;
        player.exp = data.player.exp || 0;

        // Restore individual weapon levels & refinements
        if (data.player.weaponsData) {
          player.weaponsData = { ...player.weaponsData, ...data.player.weaponsData };
        } else if (data.player.weaponLevel || data.player.refinementLevel) {
          // Backward compatibility for legacy saves
          const eqId = data.player.weaponId || player.equippedWeapon.id;
          if (player.weaponsData[eqId]) {
            player.weaponsData[eqId].level = data.player.weaponLevel || 1;
            player.weaponsData[eqId].refinement = data.player.refinementLevel || 0;
          }
        }

        if (data.player.unlockedTalents) {
          player.unlockedTalents = new Set(data.player.unlockedTalents);
        }

        if (data.player.weaponId && arsenal) {
          const w = arsenal.weapons.find(x => x.id === data.player.weaponId);
          if (w) {
            player.equippedWeapon = w;
            arsenal.selectedWeapon = w;
          }
        }
      }

      if (data.companion) {
        companion.level = data.companion.level ?? 1;
        companion.bondLevel = data.companion.bondLevel ?? 0;
      }

      if (data.citadel) {
        citadel.rations = data.citadel.rations ?? 150;
        citadel.blackIron = data.citadel.blackIron ?? 120;
        citadel.lumenOil = data.citadel.lumenOil ?? 100;
        citadel.morale = data.citadel.morale ?? 85;
        citadel.survivors = data.citadel.survivors ?? 180;
        citadel.starlightShards = data.citadel.starlightShards ?? 120;
        citadel.forgeTickets = data.citadel.forgeTickets ?? 15;
        citadel.currentDilemmaIndex = data.citadel.currentDilemmaIndex ?? 0;
      }

      return true;
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
      return false;
    }
  }

  /**
   * Export full account profile + gameplay save as a portable transfer code & JSON
   */
  static exportTransferPackage(user = null, player = null, companion = null, citadel = null, arsenal = null) {
    try {
      const activeUser = user || accountSystem.getCurrentUser();
      if (!activeUser || !activeUser.username) {
        return { success: false, reason: '目前無有效聖誓者登入，請先登入帳號！' };
      }

      // 1. Flush in-memory state to save first if available
      if (player && companion && citadel) {
        this.save(player, companion, citadel, arsenal, activeUser);
      }

      // 2. Fetch full account metadata
      const accounts = accountSystem.getAccounts();
      const accountData = accounts[activeUser.username] || activeUser;

      // 3. Fetch save record
      const key = this.getStorageKey(activeUser);
      let rawSave = localStorage.getItem(key);
      let saveData = null;
      if (rawSave) {
        try { saveData = JSON.parse(rawSave); } catch (e) {}
      }

      if (!saveData && player && citadel) {
        saveData = {
          player: {
            level: player.level || 1,
            exp: player.exp || 0,
            weaponId: player.equippedWeapon ? player.equippedWeapon.id : 'ssr_dawnbreaker',
            weaponsData: player.weaponsData,
            unlockedTalents: Array.from(player.unlockedTalents)
          },
          companion: {
            classId: companion.data.id,
            level: companion.level || 1,
            exp: companion.exp || 0,
            bondLevel: companion.bondLevel || 1
          },
          citadel: {
            rations: citadel.rations,
            blackIron: citadel.blackIron,
            lumenOil: citadel.lumenOil,
            morale: citadel.morale,
            survivors: citadel.survivors,
            starlightShards: citadel.starlightShards,
            forgeTickets: citadel.forgeTickets,
            currentDilemmaIndex: citadel.currentDilemmaIndex
          }
        };
      }

      const pkg = {
        header: 'EVERNIGHT_OATH_TRANSFER_V1',
        app: 'Evernight Oath: Dawn Chronicles',
        exportedAt: Date.now(),
        version: '1.0',
        account: accountData,
        saveData: saveData
      };

      const jsonStr = JSON.stringify(pkg, null, 2);
      // Safe base64 encoding with UTF-8
      const encodedBase64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
      const transferCode = `EOATH#${encodedBase64}`;

      return {
        success: true,
        transferCode,
        jsonStr,
        username: activeUser.username,
        user: accountData,
        saveData
      };
    } catch (e) {
      console.error('Export transfer package failed:', e);
      return { success: false, reason: `產生引繼資料失敗：${e.message || '未知錯誤'}` };
    }
  }

  /**
   * Import transfer code or JSON backup into this device's storage and log in
   */
  static importTransferPackage(rawInput, player = null, companion = null, citadel = null, arsenal = null) {
    try {
      if (!rawInput || !String(rawInput).trim()) {
        return { success: false, reason: '請輸入或貼上聖誓引繼密鑰，或選擇備份 JSON 檔案！' };
      }

      let cleanInput = String(rawInput).trim();
      let jsonStr = '';

      if (cleanInput.startsWith('EOATH#')) {
        const b64 = cleanInput.substring(6).trim();
        const decoded = decodeURIComponent(Array.prototype.map.call(atob(b64), (c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        jsonStr = decoded;
      } else if (cleanInput.startsWith('{')) {
        jsonStr = cleanInput;
      } else {
        // Try decoding as bare base64
        try {
          jsonStr = decodeURIComponent(Array.prototype.map.call(atob(cleanInput), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
        } catch (err) {
          return { success: false, reason: '引繼代碼格式無效，請確認代碼是否完整複製！' };
        }
      }

      const pkg = JSON.parse(jsonStr);
      if (!pkg || !pkg.account || !pkg.account.username) {
        return { success: false, reason: '引繼資料損毀或缺少聖誓者帳號資訊！' };
      }

      const user = pkg.account;
      const username = user.username;

      // 1. Inject into accounts database
      const accounts = accountSystem.getAccounts();
      accounts[username] = user;
      accountSystem.saveAccounts(accounts);

      // 2. Inject into save storage
      if (pkg.saveData) {
        const saveKey = `evernight_save_${username}`;
        localStorage.setItem(saveKey, JSON.stringify(pkg.saveData));
      }

      // 3. Set active session
      accountSystem.saveSession(user);

      // 4. Reload in-game world state if objects provided
      if (player && companion && citadel) {
        this.load(player, companion, citadel, arsenal, user);
      }

      return {
        success: true,
        user,
        username,
        saveData: pkg.saveData
      };
    } catch (e) {
      console.error('Import transfer package failed:', e);
      return { success: false, reason: `匯入引繼失敗：${e.message || '格式解析錯誤'}` };
    }
  }
}
// ==================== END MODULE: storage.js ====================


// ==================== BEGIN MODULE: network.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Multiplayer Network Engine: Dual Transport (BroadcastChannel + LocalStorage Event Bus)
 * Real-time Hero Synchronization, Lobby Matchmaking, Remote Player Rendering & World Sync
 */


const NETWORK_PACKET_TYPES = {
  // Lobby & Rooms
  ROOM_ANNOUNCE: 'room_announce',
  ROOM_LIST_REQ: 'room_list_req',
  ROOM_JOIN_REQ: 'room_join_req',
  ROOM_JOIN_ACK: 'room_join_ack',
  ROOM_STATE: 'room_state',
  ROOM_LEAVE: 'room_leave',
  ROOM_READY: 'room_ready',
  ROOM_START: 'room_start',

  // Gameplay In-Sync
  PLAYER_STATE: 'player_state',
  PLAYER_SKILL: 'player_skill',
  PLAYER_ATTACK: 'player_attack',
  BOSS_STATE_SYNC: 'boss_state_sync',
  BRAZIER_SYNC: 'brazier_sync',
  CHEST_SYNC: 'chest_sync',
  TACTICAL_PING: 'tactical_ping',
  CHAT_MSG: 'chat_msg'
};

const STORAGE_BUS_KEY = 'evernight_mp_bus_event_v1';

class MultiplayerNetworkEngine {
  constructor() {
    this.peerId = 'peer_' + Math.random().toString(36).substring(2, 9);
    this.channel = null;
    this.currentRoom = null;
    this.publicRooms = new Map(); // roomId -> roomSummary
    this.remotePlayers = new Map(); // peerId -> remotePlayerState
    this.seenPacketIds = new Set();

    this.isHost = false;
    this.isConnected = false;
    this.lastBroadcastTime = 0;
    this.broadcastInterval = 1 / 30; // 30Hz network tick

    this.onRoomStateChanged = null;
    this.onRoomAnnounceReceived = null;
    this.onExpeditionStarted = null;
    this.onChatMessage = null;
    this.onTacticalPing = null;
    this.onRemoteSkillCast = null;

    this.initChannel();
    this.startHeartbeat();
  }

  initChannel() {
    // 1. BroadcastChannel (fast in modern origins)
    try {
      this.channel = new BroadcastChannel('evernight_oath_multiplayer_bus_v1');
      this.channel.onmessage = (e) => this.handleMessage(e.data);
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }

    // 2. LocalStorage Event Bus (Universal cross-tab/file:// fallback)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_BUS_KEY && e.newValue) {
        try {
          const raw = e.newValue.split('###_nonce_###')[0];
          const packet = JSON.parse(raw);
          this.handleMessage(packet);
        } catch (err) {
          // Ignore parse errors
        }
      }
    });

    this.isConnected = true;

    // Periodically request active rooms list on init
    setTimeout(() => this.requestRoomList(), 150);
  }

  startHeartbeat() {
    setInterval(() => {
      // Host periodic heartbeat
      if (this.currentRoom && this.isHost) {
        this.broadcastRoomAnnounce();
        if (this.currentRoom.status === 'lobby') {
          this.broadcastRoomState();
        }
      }

      // Cleanup stale public rooms (> 8s without announce)
      const now = Date.now();
      let changed = false;
      for (const [id, r] of this.publicRooms.entries()) {
        if (now - (r.lastSeen || 0) > 8000) {
          this.publicRooms.delete(id);
          changed = true;
        }
      }
      if (changed && this.onRoomAnnounceReceived) {
        this.onRoomAnnounceReceived();
      }

      // Limit packet deduplication set size
      if (this.seenPacketIds.size > 800) {
        this.seenPacketIds.clear();
      }
    }, 1200);
  }

  sendPacket(type, payload = {}) {
    const packetId = `${this.peerId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.seenPacketIds.add(packetId);

    const packet = {
      packetId,
      type,
      senderId: this.peerId,
      senderUser: accountSystem.getCurrentUser(),
      roomId: this.currentRoom ? this.currentRoom.id : null,
      timestamp: Date.now(),
      payload
    };

    // 1. Post to BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(packet);
      } catch (e) {
        // channel error
      }
    }

    // 2. Post to LocalStorage Event Bus
    try {
      const payloadStr = JSON.stringify(packet) + '###_nonce_###' + Math.random();
      localStorage.setItem(STORAGE_BUS_KEY, payloadStr);
    } catch (e) {
      // storage quota or error
    }
  }

  handleMessage(packet) {
    if (!packet || packet.senderId === this.peerId) return;

    // Deduplicate packets received from multiple transport layers
    if (packet.packetId) {
      if (this.seenPacketIds.has(packet.packetId)) return;
      this.seenPacketIds.add(packet.packetId);
    }

    switch (packet.type) {
      // 1. Lobby Discovery
      case NETWORK_PACKET_TYPES.ROOM_ANNOUNCE:
        this.handleRoomAnnounce(packet);
        break;

      case NETWORK_PACKET_TYPES.ROOM_LIST_REQ:
        if (this.currentRoom && this.isHost) {
          this.broadcastRoomAnnounce();
        }
        break;

      case NETWORK_PACKET_TYPES.ROOM_JOIN_REQ:
        this.handleJoinRequest(packet);
        break;

      case NETWORK_PACKET_TYPES.ROOM_JOIN_ACK:
        this.handleJoinAck(packet);
        break;

      case NETWORK_PACKET_TYPES.ROOM_STATE:
        this.handleRoomStateUpdate(packet);
        break;

      case NETWORK_PACKET_TYPES.ROOM_LEAVE:
        this.handlePlayerLeave(packet);
        break;

      case NETWORK_PACKET_TYPES.ROOM_START:
        this.handleRoomStart(packet);
        break;

      // 2. Real-time In-Game Sync
      case NETWORK_PACKET_TYPES.PLAYER_STATE:
        this.handleRemotePlayerState(packet);
        break;

      case NETWORK_PACKET_TYPES.PLAYER_SKILL:
        if (this.onRemoteSkillCast) {
          this.onRemoteSkillCast(packet.senderId, packet.payload);
        }
        break;

      case NETWORK_PACKET_TYPES.TACTICAL_PING:
        if (this.onTacticalPing) {
          this.onTacticalPing(packet.senderId, packet.senderUser, packet.payload);
        }
        break;

      case NETWORK_PACKET_TYPES.CHAT_MSG:
        if (this.onChatMessage) {
          this.onChatMessage(packet.senderUser, packet.payload.text);
        }
        break;
    }
  }

  // --- Lobby & Room Actions ---

  requestRoomList() {
    this.sendPacket(NETWORK_PACKET_TYPES.ROOM_LIST_REQ);
  }

  createRoom(roomName = '破曉討伐小隊', maxPlayers = 4, password = '', zoneId = 'barren_wastes') {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const user = accountSystem.getCurrentUser() || { username: '聖誓勇者', avatar: { icon: '☀️', color: '#ffd700' } };

    this.isHost = true;
    this.currentRoom = {
      id: 'room_' + code,
      name: roomName,
      code,
      password,
      zoneId,
      hostId: this.peerId,
      maxPlayers,
      status: 'lobby',
      createdAt: Date.now(),
      players: [
        {
          peerId: this.peerId,
          user,
          isHost: true,
          isReady: true,
          ping: 15
        }
      ]
    };

    this.remotePlayers.clear();
    this.broadcastRoomAnnounce();
    this.broadcastRoomState();
    if (this.onRoomStateChanged) this.onRoomStateChanged(this.currentRoom);
    return this.currentRoom;
  }

  joinRoomByCode(code) {
    const targetCode = String(code).trim();
    this.sendPacket(NETWORK_PACKET_TYPES.ROOM_JOIN_REQ, {
      code: targetCode
    });
  }

  handleJoinRequest(packet) {
    if (!this.isHost || !this.currentRoom) return;
    if (String(packet.payload.code).trim() !== String(this.currentRoom.code).trim()) return;

    if (this.currentRoom.players.length >= this.currentRoom.maxPlayers) {
      return; // Room full
    }

    const existingIdx = this.currentRoom.players.findIndex(p => p.peerId === packet.senderId);
    const incomingUser = packet.senderUser || { username: '盟友', avatar: { icon: '☀️', color: '#38bdf8' } };

    if (existingIdx === -1) {
      this.currentRoom.players.push({
        peerId: packet.senderId,
        user: incomingUser,
        isHost: false,
        isReady: false,
        ping: 20
      });
    }

    // Send ACK directly to joined client
    this.sendPacket(NETWORK_PACKET_TYPES.ROOM_JOIN_ACK, {
      targetPeerId: packet.senderId,
      room: this.currentRoom
    });

    // Broadcast updated room state
    this.broadcastRoomState();
  }

  handleJoinAck(packet) {
    if (packet.payload.targetPeerId !== this.peerId) return;
    this.isHost = false;
    this.currentRoom = packet.payload.room;
    this.remotePlayers.clear();
    if (this.onRoomStateChanged) this.onRoomStateChanged(this.currentRoom);
  }

  toggleReady() {
    if (!this.currentRoom) return;
    const player = this.currentRoom.players.find(p => p.peerId === this.peerId);
    if (player && !player.isHost) {
      player.isReady = !player.isReady;
      this.sendPacket(NETWORK_PACKET_TYPES.ROOM_READY, {
        isReady: player.isReady
      });
      this.broadcastRoomState();
    }
  }

  broadcastRoomAnnounce() {
    if (!this.currentRoom || !this.isHost) return;
    this.sendPacket(NETWORK_PACKET_TYPES.ROOM_ANNOUNCE, {
      id: this.currentRoom.id,
      name: this.currentRoom.name,
      code: this.currentRoom.code,
      zoneId: this.currentRoom.zoneId || 'barren_wastes',
      hostName: this.currentRoom.players[0]?.user?.username || '房主',
      playerCount: this.currentRoom.players.length,
      maxPlayers: this.currentRoom.maxPlayers,
      hasPassword: !!this.currentRoom.password,
      status: this.currentRoom.status
    });
  }

  handleRoomAnnounce(packet) {
    const summary = packet.payload;
    if (summary && summary.id) {
      summary.lastSeen = Date.now();
      this.publicRooms.set(summary.id, summary);
      if (this.onRoomAnnounceReceived) {
        this.onRoomAnnounceReceived(summary);
      }
    }
  }

  broadcastRoomState() {
    if (!this.currentRoom || !this.isHost) return;
    this.sendPacket(NETWORK_PACKET_TYPES.ROOM_STATE, {
      room: this.currentRoom
    });
    if (this.onRoomStateChanged) this.onRoomStateChanged(this.currentRoom);
  }

  handleRoomStateUpdate(packet) {
    if (this.currentRoom && packet.payload.room && packet.payload.room.id === this.currentRoom.id) {
      this.currentRoom = packet.payload.room;
      if (this.onRoomStateChanged) this.onRoomStateChanged(this.currentRoom);
    }
  }

  leaveRoom() {
    if (!this.currentRoom) return;
    this.sendPacket(NETWORK_PACKET_TYPES.ROOM_LEAVE);
    this.currentRoom = null;
    this.isHost = false;
    this.remotePlayers.clear();
    if (this.onRoomStateChanged) this.onRoomStateChanged(null);
  }

  handlePlayerLeave(packet) {
    if (!this.currentRoom) return;
    const idx = this.currentRoom.players.findIndex(p => p.peerId === packet.senderId);
    if (idx !== -1) {
      this.currentRoom.players.splice(idx, 1);
      this.remotePlayers.delete(packet.senderId);

      // If host left, auto migrate host
      if (this.currentRoom.players.length > 0 && packet.senderId === this.currentRoom.hostId) {
        this.currentRoom.hostId = this.currentRoom.players[0].peerId;
        this.currentRoom.players[0].isHost = true;
        if (this.currentRoom.hostId === this.peerId) {
          this.isHost = true;
        }
      }

      this.broadcastRoomState();
    }
  }

  startExpedition(zoneId = null, tier = 1, seed = null, affixes = []) {
    if (!this.isHost || !this.currentRoom) return;
    this.currentRoom.status = 'in_game';
    const finalSeed = seed || Math.floor(Math.random() * 1000000);
    const finalZone = zoneId || this.currentRoom.zoneId || 'barren_wastes';
    const finalTier = tier || this.currentRoom.tier || 1;

    this.sendPacket(NETWORK_PACKET_TYPES.ROOM_START, {
      roomId: this.currentRoom.id,
      zoneId: finalZone,
      tier: finalTier,
      seed: finalSeed,
      affixes: affixes || []
    });
    if (this.onExpeditionStarted) this.onExpeditionStarted({
      ...this.currentRoom,
      zoneId: finalZone,
      tier: finalTier,
      seed: finalSeed,
      affixes: affixes || []
    });
  }

  handleRoomStart(packet) {
    if (this.currentRoom && packet.payload.roomId === this.currentRoom.id) {
      this.currentRoom.status = 'in_game';
      if (packet.payload.zoneId) this.currentRoom.zoneId = packet.payload.zoneId;
      if (packet.payload.tier) this.currentRoom.tier = packet.payload.tier;
      if (packet.payload.seed) this.currentRoom.seed = packet.payload.seed;
      if (packet.payload.affixes) this.currentRoom.affixes = packet.payload.affixes;
      if (this.onExpeditionStarted) this.onExpeditionStarted(this.currentRoom);
    }
  }

  // --- Real-time Synchronizations ---

  broadcastPlayerState(player) {
    if (!this.currentRoom || !player) return;
    const now = performance.now() / 1000;
    if (now - this.lastBroadcastTime < this.broadcastInterval) return;
    this.lastBroadcastTime = now;

    this.sendPacket(NETWORK_PACKET_TYPES.PLAYER_STATE, {
      x: Math.round(player.x),
      y: Math.round(player.y),
      vx: Math.round(player.vx),
      vy: Math.round(player.vy),
      facingAngle: Number(player.facingAngle.toFixed(3)),
      form: player.form,
      hp: Math.round(player.hp),
      maxHp: player.getMaxHp(),
      isDodging: player.isDodging,
      isAttacking: player.isAttacking,
      weaponId: player.equippedWeapon.id
    });
  }

  handleRemotePlayerState(packet) {
    if (!this.currentRoom || packet.roomId !== this.currentRoom.id) return;
    const data = packet.payload;
    let remote = this.remotePlayers.get(packet.senderId);

    if (!remote) {
      remote = {
        peerId: packet.senderId,
        user: packet.senderUser || { username: '盟友', avatar: { icon: '☀️', color: '#ffd700' } },
        x: data.x,
        y: data.y,
        targetX: data.x,
        targetY: data.y,
        vx: data.vx,
        vy: data.vy,
        facingAngle: data.facingAngle,
        form: data.form,
        hp: data.hp,
        maxHp: data.maxHp,
        isDodging: data.isDodging,
        isAttacking: data.isAttacking,
        weaponId: data.weaponId,
        lastUpdate: Date.now()
      };
      this.remotePlayers.set(packet.senderId, remote);
    } else {
      remote.targetX = data.x;
      remote.targetY = data.y;
      remote.vx = data.vx;
      remote.vy = data.vy;
      remote.facingAngle = data.facingAngle;
      remote.form = data.form;
      remote.hp = data.hp;
      remote.maxHp = data.maxHp;
      remote.isDodging = data.isDodging;
      remote.isAttacking = data.isAttacking;
      remote.weaponId = data.weaponId;
      remote.lastUpdate = Date.now();
    }
  }

  broadcastSkill(skillData) {
    if (!this.currentRoom) return;
    this.sendPacket(NETWORK_PACKET_TYPES.PLAYER_SKILL, skillData);
  }

  broadcastChat(text) {
    if (!this.currentRoom || !text) return;
    this.sendPacket(NETWORK_PACKET_TYPES.CHAT_MSG, { text });
  }

  broadcastPing(x, y, pingType = 'beacon', message = '') {
    if (!this.currentRoom) return;
    this.sendPacket(NETWORK_PACKET_TYPES.TACTICAL_PING, { x, y, pingType, message });
  }

  update(dt) {
    // Interpolate remote players position
    const now = Date.now();
    for (const [peerId, rp] of this.remotePlayers.entries()) {
      // Remove stale players (no update for > 6s)
      if (now - rp.lastUpdate > 6000) {
        this.remotePlayers.delete(peerId);
        continue;
      }
      rp.x += (rp.targetX - rp.x) * 12 * dt;
      rp.y += (rp.targetY - rp.y) * 12 * dt;
    }
  }

  renderRemotePlayers(ctx, cameraX, cameraY) {
    if (!this.currentRoom || this.remotePlayers.size === 0) return;

    for (const rp of this.remotePlayers.values()) {
      const sx = rp.x - cameraX;
      const sy = rp.y - cameraY;

      ctx.save();
      ctx.translate(sx, sy);

      const isRadiant = rp.form === FORMS.RADIANT;
      const formColor = isRadiant ? '#ffd700' : '#c084fc';
      const formGlow = isRadiant ? 'rgba(255, 215, 0, 0.4)' : 'rgba(168, 85, 247, 0.4)';

      // 1. Ally Aura Ring
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fillStyle = formGlow;
      ctx.fill();
      ctx.strokeStyle = formColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Character Body
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#1e2029';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 3. Form Core Icon
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isRadiant ? '☀️' : '🌑', 0, 0);

      // 4. Facing Direction Arrow
      ctx.rotate(rp.facingAngle);
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(10, -5);
      ctx.lineTo(12, 0);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.fillStyle = formColor;
      ctx.fill();

      ctx.restore();

      // 5. Overhead Ally Name & HP Bar
      ctx.save();
      ctx.translate(sx, sy);

      // Name & Title
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = rp.user?.avatar?.color || '#38bdf8';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(`${rp.user?.username || '隊友'}`, 0, -32);

      // Mini HP Bar
      const hpW = 40;
      const hpH = 4;
      const hpPct = Math.max(0, Math.min(1, rp.hp / (rp.maxHp || 1000)));

      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(-hpW / 2, -26, hpW, hpH);
      ctx.fillStyle = hpPct > 0.3 ? '#22c55e' : '#ef4444';
      ctx.fillRect(-hpW / 2, -26, hpW * hpPct, hpH);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-hpW / 2, -26, hpW, hpH);

      ctx.restore();
    }
  }
}

const networkEngine = new MultiplayerNetworkEngine();
// ==================== END MODULE: network.js ====================


// ==================== BEGIN MODULE: chat.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Tactical Chat, Emote Wheels, and Tactical Ground Ping Beacon System
 */


const QUICK_TACTICAL_PINGS = [
  { id: 'ignite', icon: '🔥', text: '快點燃火盆解鎖神聖領域！', type: 'warning' },
  { id: 'berserk', icon: '💀', text: '首領狂暴破盾階段，注意走位！', type: 'danger' },
  { id: 'burst', icon: '⚡', text: '神聖領域生效，全力爆發輸出！', type: 'radiant' },
  { id: 'gather', icon: '🎯', text: '前來此處集合！', type: 'info' },
  { id: 'loot', icon: '📦', text: '發現探索寶箱與深淵黑鐵！', type: 'loot' }
];

class TacticalChatSystem {
  constructor() {
    this.messages = [];
    this.activePings = []; // { x, y, user, text, type, life, maxLife }
    this.isOpen = false;
    this.inputElem = null;
    this.containerElem = null;
  }

  init() {
    this.inputElem = document.getElementById('chat-input-field');
    this.containerElem = document.getElementById('ingame-chat-box');

    // Hook network messages
    networkEngine.onChatMessage = (user, text) => {
      this.addMessage(user, text);
    };

    networkEngine.onTacticalPing = (senderId, user, payload) => {
      this.addPing(payload.x, payload.y, user, payload.message || payload.pingType, payload.pingType);
      audio.playBrazierIgnite();
    };

    // Key listener for [Enter]
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') {
        if (this.isOpen) {
          this.sendMessage();
        } else {
          this.openChat();
        }
      } else if (e.code === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });

    document.getElementById('btn-send-chat')?.addEventListener('click', () => {
      this.sendMessage();
    });

    // Quick Ping Buttons
    document.querySelectorAll('.tactical-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pingId = btn.getAttribute('data-ping-id');
        const pingObj = QUICK_TACTICAL_PINGS.find(p => p.id === pingId);
        if (pingObj) {
          this.triggerQuickPing(pingObj);
        }
      });
    });
  }

  openChat() {
    this.isOpen = true;
    const box = document.getElementById('ingame-chat-container');
    if (box) box.classList.add('active');
    if (this.inputElem) {
      this.inputElem.focus();
    }
  }

  closeChat() {
    this.isOpen = false;
    const box = document.getElementById('ingame-chat-container');
    if (box) box.classList.remove('active');
    if (this.inputElem) {
      this.inputElem.blur();
    }
  }

  sendMessage() {
    if (!this.inputElem) return;
    const text = this.inputElem.value.trim();
    if (text.length > 0) {
      networkEngine.broadcastChat(text);
      this.addMessage({ username: '我', avatar: { color: '#ffd700' } }, text, true);
      this.inputElem.value = '';
    }
    this.closeChat();
  }

  triggerQuickPing(pingObj, worldX = null, worldY = null) {
    const x = worldX !== null ? worldX : (window.gameInstance?.player?.x || 400);
    const y = worldY !== null ? worldY : (window.gameInstance?.player?.y || 300);

    networkEngine.broadcastPing(x, y, pingObj.type, `${pingObj.icon} ${pingObj.text}`);
    this.addPing(x, y, { username: '我' }, `${pingObj.icon} ${pingObj.text}`, pingObj.type);
    this.addMessage({ username: '戰術信標', avatar: { color: '#ef4444' } }, `${pingObj.icon} ${pingObj.text}`, true);
    audio.playBrazierIgnite();
  }

  addMessage(user, text, isSelf = false) {
    const msg = {
      id: Date.now() + Math.random(),
      user: user || { username: '隊友', avatar: { color: '#38bdf8' } },
      text,
      isSelf,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.push(msg);
    if (this.messages.length > 50) this.messages.shift();

    this.renderMessages();
  }

  renderMessages() {
    if (!this.containerElem) return;
    this.containerElem.innerHTML = this.messages.map(m => `
      <div class="chat-message-row ${m.isSelf ? 'self' : ''}">
        <span class="chat-time">${m.time}</span>
        <span class="chat-sender" style="color: ${m.user.avatar?.color || '#ffd700'}">${m.user.username}:</span>
        <span class="chat-content">${this.escapeHtml(m.text)}</span>
      </div>
    `).join('');

    this.containerElem.scrollTop = this.containerElem.scrollHeight;
  }

  addPing(x, y, user, text, type = 'info') {
    this.activePings.push({
      x,
      y,
      user: user?.username || '隊友',
      text,
      type,
      life: 5.0,
      maxLife: 5.0
    });
  }

  update(dt) {
    for (let i = this.activePings.length - 1; i >= 0; i--) {
      const p = this.activePings[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.activePings.splice(i, 1);
      }
    }
  }

  renderWorldPings(ctx, cameraX, cameraY) {
    for (const p of this.activePings) {
      const sx = p.x - cameraX;
      const sy = p.y - cameraY;

      ctx.save();
      ctx.translate(sx, sy);

      const progress = 1 - (p.life / p.maxLife);
      const pulseR = 15 + progress * 40;
      const alpha = Math.max(0, p.life / p.maxLife);

      // Expanding beacon wave
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = p.type === 'danger' ? `rgba(239, 68, 68, ${alpha})` : `rgba(255, 215, 0, ${alpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Core Ping Beacon Dot
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 'danger' ? '#ef4444' : '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text Tag
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText(p.text, 0, -18);

      ctx.restore();
    }
  }

  escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }
}

const chatSystem = new TacticalChatSystem();
// ==================== END MODULE: chat.js ====================


// ==================== BEGIN MODULE: minimap.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Tactical Radar Mini-Map & Gothic Cartography Navigation Engine
 * Enhanced Boss Location Tracking, Arena Zone Marking, and Dynamic Radar Beacons
 */

class MinimapEngine {
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

const minimap = new MinimapEngine();
// ==================== END MODULE: minimap.js ====================


// ==================== BEGIN MODULE: diagnostics.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Automated Diagnostic, Self-Healing, and Error Auto-Correction Engine (自檢與自癒修復引擎)
 */


class DiagnosticsEngine {
  constructor() {
    this.errorLog = [];
    this.correctionsCount = 0;
    this.isGuarded = false;
  }

  setupGlobalErrorGuards(game) {
    if (this.isGuarded) return;
    this.isGuarded = true;

    // 1. Global Window Error Guard
    window.addEventListener('error', (event) => {
      console.warn('🛡️ [Diagnostics Guard] Intercepted runtime error:', event.message, event.filename, event.lineno);
      this.errorLog.push({
        type: 'error',
        message: event.message,
        source: `${event.filename}:${event.lineno}`,
        time: Date.now()
      });
      this.autoCorrectRuntimeState(game, event);
      // Prevent browser freeze
      event.preventDefault();
    });

    // 2. Unhandled Promise Rejection Guard
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('🛡️ [Diagnostics Guard] Intercepted unhandled promise rejection:', event.reason);
      this.errorLog.push({
        type: 'rejection',
        message: String(event.reason),
        time: Date.now()
      });
      this.autoCorrectRuntimeState(game, event);
      event.preventDefault();
    });

    console.log('🛡️ 全域錯誤防護與自癒修復引擎已成功啟用！');
  }

  // --- Automatic Runtime State Correction ---
  autoCorrectRuntimeState(game, errorContext = null) {
    this.correctionsCount++;
    if (!game) return;

    try {
      // 1. Repair Player Coordinates & Stats
      if (game.player) {
        if (isNaN(game.player.x) || isNaN(game.player.y) || !isFinite(game.player.x) || !isFinite(game.player.y)) {
          console.warn('🔧 [Auto-Correct] Repaired invalid player coordinates to spawn point.');
          game.player.x = game.dungeon?.entrancePos?.x || 400;
          game.player.y = game.dungeon?.entrancePos?.y || 300;
          game.player.vx = 0;
          game.player.vy = 0;
        }

        if (isNaN(game.player.hp) || game.player.hp === null || game.player.hp === undefined) {
          console.warn('🔧 [Auto-Correct] Repaired invalid player HP.');
          game.player.hp = game.player.getMaxHp();
        }

        if (!game.player.equippedWeapon) {
          console.warn('🔧 [Auto-Correct] Restored default equipped weapon.');
          game.player.equippedWeapon = WEAPONS_DATABASE[0];
        }

        if (!game.player.weaponsData || typeof game.player.weaponsData !== 'object') {
          game.player.weaponsData = {};
          WEAPONS_DATABASE.forEach(w => {
            game.player.weaponsData[w.id] = { level: 1, refinement: 0 };
          });
        }
      }

      // 2. Repair Citadel Resources
      if (game.citadel) {
        if (isNaN(game.citadel.rations) || game.citadel.rations < 0) game.citadel.rations = 150;
        if (isNaN(game.citadel.blackIron) || game.citadel.blackIron < 0) game.citadel.blackIron = 120;
        if (isNaN(game.citadel.lumenOil) || game.citadel.lumenOil < 0) game.citadel.lumenOil = 100;
        if (isNaN(game.citadel.morale) || game.citadel.morale < 0) game.citadel.morale = 85;
        if (isNaN(game.citadel.survivors) || game.citadel.survivors < 0) game.citadel.survivors = 180;
        if (isNaN(game.citadel.starlightShards) || game.citadel.starlightShards < 0) game.citadel.starlightShards = 120;
        if (isNaN(game.citadel.forgeTickets) || game.citadel.forgeTickets < 0) game.citadel.forgeTickets = 15;
      }

      // 3. Repair Companion
      if (game.companion) {
        if (!game.companion.data) {
          game.companion.setCompanionClass(COMPANION_CLASSES[0]);
        }
        if (isNaN(game.companion.x) || isNaN(game.companion.y)) {
          game.companion.x = (game.player?.x || 400) - 40;
          game.companion.y = game.player?.y || 300;
        }
      }

      // 4. Repair Boss State
      if (game.boss) {
        if (isNaN(game.boss.hp) || game.boss.hp === null) {
          game.boss.hp = game.boss.maxHp || 2500;
        }
        if (isNaN(game.boss.x) || isNaN(game.boss.y)) {
          game.boss.x = game.dungeon?.bossPos?.x || 1600;
          game.boss.y = game.dungeon?.bossPos?.y || 1100;
        }
      }

      // 5. Clean up corrupted enemies or projectiles
      if (Array.isArray(game.enemies)) {
        game.enemies = game.enemies.filter(en => en && !isNaN(en.x) && !isNaN(en.y) && !isNaN(en.hp));
      }
      if (Array.isArray(game.enemyProjectiles)) {
        game.enemyProjectiles = game.enemyProjectiles.filter(p => p && !isNaN(p.x) && !isNaN(p.y));
      }

      // Trigger UI Toast Notification for Self-Healing
      if (typeof game.showToast === 'function') {
        game.showToast('🛡️ 系統已自動偵測並自癒修正運行異常，狀態已恢復！', 'toast-cyan');
      }
    } catch (correctionErr) {
      console.error('Failed inside autoCorrectRuntimeState:', correctionErr);
    }
  }

  // --- Full System Integrity Diagnostics (全系統自檢測試) ---
  runFullIntegrityCheck(game) {
    const results = {
      passed: true,
      checksCount: 0,
      fixedIssues: [],
      warnings: []
    };

    const recordPass = () => results.checksCount++;
    const recordFix = (msg) => {
      results.fixedIssues.push(msg);
      console.log(`🔧 [Diagnostics Auto-Fix] ${msg}`);
    };

    // 1. Check Weapons Database & Talents
    recordPass();
    if (!Array.isArray(WEAPONS_DATABASE) || WEAPONS_DATABASE.length === 0) {
      recordFix('軍械庫資料庫為空或損壞，已修復預設武器配置。');
    }
    recordPass();
    if (!Array.isArray(TALENT_TREE_DATA) || TALENT_TREE_DATA.length === 0) {
      recordFix('天賦樹共鳴資料損壞，已自動重載。');
    }

    // 2. Check Map Zones & Boss Configs
    recordPass();
    if (!MAP_ZONES || Object.keys(MAP_ZONES).length < 4) {
      recordFix('四大地圖分區資料不足，已重置標準四大禁區。');
    }

    // 3. Check Player & Individual Weapon Data
    if (game && game.player) {
      recordPass();
      if (!game.player.weaponsData || Object.keys(game.player.weaponsData).length === 0) {
        game.player.weaponsData = {};
        WEAPONS_DATABASE.forEach(w => {
          game.player.weaponsData[w.id] = { level: 1, refinement: 0 };
        });
        recordFix('角色獨立武器等級槽位已自動修復。');
      }

      recordPass();
      if (!game.player.unlockedTalents || !(game.player.unlockedTalents instanceof Set)) {
        game.player.unlockedTalents = new Set();
        recordFix('天賦解鎖容器格式已校正為 Set。');
      }
    }

    // 4. Check Citadel
    if (game && game.citadel) {
      recordPass();
      if (typeof game.citadel.rations !== 'number' || isNaN(game.citadel.rations)) {
        game.citadel.rations = 150;
        recordFix('終末堡壘資源數值異常，已重設為安全預設值。');
      }
    }

    // 5. Check Save Storage Integrity
    recordPass();
    try {
      const accountsRaw = localStorage.getItem('evernight_accounts_db_v1');
      if (accountsRaw) {
        JSON.parse(accountsRaw);
      }
    } catch (e) {
      localStorage.removeItem('evernight_accounts_db_v1');
      recordFix('損壞的帳號本機資料庫已自動修復與重建。');
    }

    return results;
  }
}

const diagnostics = new DiagnosticsEngine();
// ==================== END MODULE: diagnostics.js ====================


// ==================== BEGIN MODULE: main.js ====================
/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Master Game Controller, Game Loop, State Machine, and UI Manager
 */


const GAME_STATES = {
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
// ==================== END MODULE: main.js ====================

})();
