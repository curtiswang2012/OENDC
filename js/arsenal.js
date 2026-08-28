/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Arsenal Sanctum: Independent Weapon Upgrades, Refinements, and Talent Resonance Tree
 */

import { WEAPON_CATALOG, TALENT_TREE_DATA } from './weapons.js';
import { audio } from './audio.js';

export class ArsenalSanctum {
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
