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
