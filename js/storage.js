/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * LocalStorage Multi-Account Isolated Save / Load Management
 */

import { accountSystem } from './account.js';

export class SaveSystem {
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
}
