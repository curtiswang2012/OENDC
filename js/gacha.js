/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Ancestral Forge: Gacha Summoning System with 65-Pull Pity & Resonance
 */

import { WEAPON_CATALOG } from './weapons.js';
import { COMPANION_CLASSES } from './companions.js';
import { audio } from './audio.js';

export class AncestralForge {
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
