/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Weapon Classes, Arsenal Catalog, and Combat Attack Definitions
 */

export const WEAPON_TYPES = {
  GREATSWORD: 'greatsword',
  DUAL_BLADES: 'dual_blades',
  SPEAR: 'spear',
  WARHAMMER: 'warhammer',
  CROSSBOW: 'crossbow',
  SCYTHE: 'scythe'
};

export const WEAPON_CATALOG = [
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

export const WEAPONS_DATABASE = WEAPON_CATALOG;

export const TALENT_TREE_DATA = [
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
