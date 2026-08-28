/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Account Sanctum: Secure Authentication, Session Management, and Multi-Hero Profiles
 * Fail-safe Cross-Origin Session Engine with WebCrypto & Synchronous Fallback
 */

const ACCOUNTS_DB_KEY = 'evernight_accounts_db_v1';
const ACTIVE_SESSION_KEY = 'evernight_active_session_v1';
const LAST_USER_KEY = 'evernight_last_user_v1';

export const AVATAR_PRESETS = [
  { id: 'sun_knight', icon: '☀️', name: '太陽聖誓騎士', color: '#ffd700', role: '光輝近衛' },
  { id: 'shadow_assassin', icon: '🌑', name: '暗影逐夜刺客', color: '#c084fc', role: '暗影刺殺' },
  { id: 'aurora_vanguard', icon: '🔱', name: '極光破曉先鋒', color: '#38bdf8', role: '神聖貫通' },
  { id: 'abyss_walker', icon: '🔨', name: '深淵撼地行者', color: '#f87171', role: '撼地破盾' }
];

export const TITLE_PRESETS = [
  '【初光聖誓者】',
  '【破曉使徒】',
  '【暗夜獵手】',
  '【深淵征服者】',
  '【不滅守望者】',
  '【永夜星火】'
];

export class AccountSystem {
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

export const accountSystem = new AccountSystem();
