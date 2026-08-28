/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Bastion of Humanity: Citadel Resource Management & Branching Moral Dilemmas
 */

export const MORAL_DILEMMAS = [
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

export const FACILITIES_CATALOG = {
  smeltery: {
    id: 'smeltery',
    name: '黑鐵精煉軍工廠',
    icon: '🏭',
    desc: '精煉深淵礦脈，提升遠征黑鐵產量，並為守城戰所有城防砲塔提供彈藥鍛造強化。',
    maxLevel: 10,
    baseCostIron: 60,
    baseCostShards: 30,
    getBonusText: (lvl) => `遠征黑鐵產量 +${lvl * 20}% | 城防砲塔傷害 +${lvl * 15}%`,
  },
  greenhouse: {
    id: 'greenhouse',
    name: '聖光水耕溫室',
    icon: '🌿',
    desc: '利用聖光水晶照耀作物，大幅提升離線與掛機自動產糧效率，並擴充最大糧草儲藏量。',
    maxLevel: 10,
    baseCostIron: 45,
    baseCostShards: 25,
    getBonusText: (lvl) => `自動產糧效率 +${lvl * 30}% | 溫室儲存上限 ${300 + lvl * 150} 份`,
  },
  bastion_wall: {
    id: 'bastion_wall',
    name: '破曉城防壁壘',
    icon: '🛡️',
    desc: '加固要塞外圍黑鐵重甲與聖核防護結界，守城戰中提升堡壘聖核耐久度與反傷刺盾。',
    maxLevel: 10,
    baseCostIron: 75,
    baseCostShards: 40,
    getBonusText: (lvl) => `聖核最大生命值 +${lvl * 500} | 聖核荊棘反傷 +${lvl * 10}%`,
  },
  workshop: {
    id: 'workshop',
    name: '聖遺魔導工坊',
    icon: '⚡',
    desc: '研究古代魔導武裝，提升城防砲塔射速，解鎖烈陽雷射砲、破曉連弩與迫擊重砲。',
    maxLevel: 10,
    baseCostIron: 80,
    baseCostShards: 50,
    getBonusText: (lvl) => `砲塔射速 +${lvl * 12}% | 解鎖等級 ${Math.min(3, Math.ceil(lvl / 3))} 階魔導砲塔`,
  },
  barracks: {
    id: 'barracks',
    name: '守備騎士營',
    icon: '👥',
    desc: '訓練堡壘守軍衛隊。守城戰中派遣英勇的聖誓駐軍步兵與破曉弩手在城前列陣防守。',
    maxLevel: 10,
    baseCostIron: 50,
    baseCostShards: 35,
    getBonusText: (lvl) => `守城戰駐軍人數 +${lvl * 2} 人 | 駐軍攻擊與生命 +${lvl * 20}%`,
  }
};

export class CitadelSystem {
  constructor() {
    this.rations = 150;
    this.blackIron = 120;
    this.lumenOil = 100;
    this.morale = 85; // 0-100
    this.survivors = 180;
    this.starlightShards = 120;
    this.forgeTickets = 15;

    // Base Facilities Expansion (基地設施擴建)
    this.facilities = {
      smeltery: 1,
      greenhouse: 1,
      bastion_wall: 1,
      workshop: 1,
      barracks: 1
    };

    // Greenhouse & Food Production
    this.greenhouseRations = 45;
    this.lastGreenhouseUpdate = Date.now();

    // Endless Tower / Abyssal Spire Progress
    this.towerMaxFloor = 1;

    // Citadel Siege Record (血月守城最佳波次)
    this.siegeMaxWave = 0;

    this.currentDilemmaIndex = 0;
    this.completedDilemmas = new Set();
  }

  getMaxGreenhouseCapacity() {
    const ghLvl = this.facilities?.greenhouse || 1;
    return 300 + ghLvl * 150;
  }

  getFacilityUpgradeCost(facilityId) {
    const info = FACILITIES_CATALOG[facilityId];
    if (!info) return null;
    const curLvl = this.facilities[facilityId] || 1;
    if (curLvl >= info.maxLevel) return null; // Max level reached

    const costIron = Math.round(info.baseCostIron * Math.pow(1.35, curLvl - 1));
    const costShards = Math.round(info.baseCostShards * Math.pow(1.3, curLvl - 1));
    return { costIron, costShards, nextLevel: curLvl + 1 };
  }

  upgradeFacility(facilityId) {
    const info = FACILITIES_CATALOG[facilityId];
    if (!info) return { success: false, reason: '未知的設施類型！' };

    const cost = this.getFacilityUpgradeCost(facilityId);
    if (!cost) return { success: false, reason: '該設施已達最高等級上限 (Lv.10)！' };

    if (this.blackIron < cost.costIron) {
      return { success: false, reason: `深淵黑鐵不足！需要 ${cost.costIron} 黑鐵 (目前持有 ${this.blackIron})` };
    }
    if (this.starlightShards < cost.costShards) {
      return { success: false, reason: `星光碎屑不足！需要 ${cost.costShards} 碎屑 (目前持有 ${this.starlightShards})` };
    }

    this.blackIron -= cost.costIron;
    this.starlightShards -= cost.costShards;
    this.facilities[facilityId] = cost.nextLevel;

    return {
      success: true,
      facilityName: info.name,
      newLevel: cost.nextLevel,
      bonusText: info.getBonusText(cost.nextLevel)
    };
  }

  unlockTowerFloor(floor) {
    if (floor > this.towerMaxFloor) {
      this.towerMaxFloor = floor;
      return true;
    }
    return false;
  }

  recordSiegeWave(wave) {
    if (wave > this.siegeMaxWave) {
      this.siegeMaxWave = wave;
      return true;
    }
    return false;
  }

  getProductionRatePerMin() {
    const popFactor = (this.survivors || 180) / 100;
    const moraleFactor = (this.morale || 85) / 80;
    const ghLvl = this.facilities?.greenhouse || 1;
    const ghFactor = 1 + (ghLvl - 1) * 0.3;
    return Math.round(15 * popFactor * moraleFactor * ghFactor);
  }

  updateGreenhouse(now = Date.now()) {
    const elapsedMinutes = Math.max(0, (now - (this.lastGreenhouseUpdate || now)) / 60000);
    if (elapsedMinutes > 0) {
      const rate = this.getProductionRatePerMin();
      const produced = Math.floor(elapsedMinutes * rate);
      if (produced > 0) {
        const maxCap = this.getMaxGreenhouseCapacity();
        this.greenhouseRations = Math.min(maxCap, (this.greenhouseRations || 0) + produced);
        this.lastGreenhouseUpdate = now;
      }
    }
    return this.greenhouseRations;
  }

  harvestGreenhouse() {
    this.updateGreenhouse();
    const amount = Math.floor(this.greenhouseRations || 0);
    if (amount <= 0) return { success: false, reason: '溫室中尚無成熟糧草可收割！' };

    this.rations += amount;
    this.greenhouseRations = 0;
    this.lastGreenhouseUpdate = Date.now();
    return { success: true, harvested: amount, totalRations: this.rations };
  }

  dispatchFarming(costOil = 20) {
    if (this.lumenOil < costOil) {
      return { success: false, reason: `流明聖油不足！需要 ${costOil} 點聖油進行開墾照明！` };
    }
    this.lumenOil -= costOil;
    const harvested = Math.floor(Math.random() * 35 + 55); // +55~90 rations
    this.rations += harvested;
    return { success: true, harvested, totalRations: this.rations, lumenOil: this.lumenOil };
  }

  exchangeIronForRations(ironAmount = 25) {
    if (this.blackIron < ironAmount) {
      return { success: false, reason: `深淵黑鐵不足！需要 ${ironAmount} 塊黑鐵！` };
    }
    this.blackIron -= ironAmount;
    const gain = 60;
    this.rations += gain;
    return { success: true, gain, totalRations: this.rations, blackIron: this.blackIron };
  }

  exchangeShardsForRations(shardsAmount = 10) {
    if (this.starlightShards < shardsAmount) {
      return { success: false, reason: `星光碎屑不足！需要 ${shardsAmount} 顆碎屑！` };
    }
    this.starlightShards -= shardsAmount;
    const gain = 100;
    this.rations += gain;
    return { success: true, gain, totalRations: this.rations, starlightShards: this.starlightShards };
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
