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

export class CitadelSystem {
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
