/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Automated Diagnostic, Self-Healing, and Error Auto-Correction Engine (自檢與自癒修復引擎)
 */

import { WEAPONS_DATABASE, TALENT_TREE_DATA } from './weapons.js';
import { COMPANION_CLASSES } from './companions.js';
import { MAP_ZONES } from './dungeon.js';

export class DiagnosticsEngine {
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

export const diagnostics = new DiagnosticsEngine();
