/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Multiplayer Network Engine: Dual Transport (BroadcastChannel + LocalStorage Event Bus)
 * Real-time Hero Synchronization, Lobby Matchmaking, Remote Player Rendering & World Sync
 */

import { accountSystem } from './account.js';
import { FORMS } from './player.js';

export const NETWORK_PACKET_TYPES = {
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

export const AI_MERCENARIES = [
  {
    id: 'ai_roland',
    name: '聖堂守衛·羅蘭',
    title: '【初光聖誓者】',
    role: '光輝近衛 (坦克/護盾)',
    avatar: { icon: '🛡️', color: '#ffd700' },
    form: 'radiant',
    weaponId: 'ssr_dawnbreaker',
    level: 3,
    hp: 1200,
    maxHp: 1200,
    color: '#ffd700'
  },
  {
    id: 'ai_sylvia',
    name: '逐夜刺客·希爾薇',
    title: '【暗夜獵手】',
    role: '暗影刺殺 (高爆發/瞬移)',
    avatar: { icon: '🌑', color: '#c084fc' },
    form: 'shadow',
    weaponId: 'sr_shadow_daggers',
    level: 3,
    hp: 900,
    maxHp: 900,
    color: '#c084fc'
  },
  {
    id: 'ai_elena',
    name: '極光破曉·艾蓮娜',
    title: '【破曉使徒】',
    role: '神聖貫通 (長槍/範圍控制)',
    avatar: { icon: '🔱', color: '#38bdf8' },
    form: 'radiant',
    weaponId: 'sr_aurora_spear',
    level: 3,
    hp: 1050,
    maxHp: 1050,
    color: '#38bdf8'
  },
  {
    id: 'ai_valdor',
    name: '深淵行者·瓦爾德',
    title: '【深淵征服者】',
    role: '撼地破盾 (重錘/巨額打擊)',
    avatar: { icon: '🔨', color: '#f87171' },
    form: 'shadow',
    weaponId: 'sr_abyss_hammer',
    level: 3,
    hp: 1350,
    maxHp: 1350,
    color: '#f87171'
  }
];

export class MultiplayerNetworkEngine {
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

    this.serverBaseUrl = '';
    this.serverAvailable = false;
    this.lastServerPollTime = 0;
    this._pollingStarted = false;

    this.initChannel();
    this.initHttpRelay();
    this.startHeartbeat();
  }

  initHttpRelay() {
    if (typeof window !== 'undefined') {
      if (window.location.protocol.startsWith('http')) {
        this.serverBaseUrl = window.location.origin;
      } else {
        this.serverBaseUrl = 'http://localhost:8080';
      }
    }

    const checkServer = async () => {
      try {
        const resp = await fetch(`${this.serverBaseUrl}/api/mp/rooms`, { method: 'GET', mode: 'cors' });
        if (resp.ok) {
          this.serverAvailable = true;
          this.startHttpPolling();
        }
      } catch (e) {
        this.serverAvailable = false;
      }
    };

    setTimeout(checkServer, 100);
    setInterval(checkServer, 4000);
  }

  startHttpPolling() {
    if (this._pollingStarted) return;
    this._pollingStarted = true;

    const poll = async () => {
      if (this.serverAvailable && this.serverBaseUrl) {
        try {
          const url = `${this.serverBaseUrl}/api/mp/poll?since=${this.lastServerPollTime}&peerId=${this.peerId}`;
          const resp = await fetch(url, { method: 'GET', mode: 'cors' });
          if (resp.ok) {
            const data = await resp.json();
            if (data) {
              if (data.timestamp) this.lastServerPollTime = data.timestamp;
              if (data.packets && Array.isArray(data.packets)) {
                for (const p of data.packets) {
                  this.handleMessage(p);
                }
              }
            }
          }
        } catch (e) {
          // fetch error
        }
      }
      setTimeout(poll, 45);
    };

    poll();
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

    // 3. Post to HTTP Relay Server if available
    if (this.serverAvailable && this.serverBaseUrl) {
      fetch(`${this.serverBaseUrl}/api/mp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet),
        mode: 'cors'
      }).catch(() => {});
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

  addAiMercenary(mercenaryId = null) {
    if (!this.currentRoom || !this.isHost) return false;
    if (this.currentRoom.players.length >= this.currentRoom.maxPlayers) return false;

    let candidate = null;
    if (mercenaryId) {
      candidate = AI_MERCENARIES.find(m => m.id === mercenaryId);
    } else {
      const existingIds = new Set(this.currentRoom.players.filter(p => p.isAi).map(p => p.aiData?.id));
      candidate = AI_MERCENARIES.find(m => !existingIds.has(m.id)) || AI_MERCENARIES[0];
    }

    if (!candidate) return false;

    const peerId = 'ai_' + Math.random().toString(36).substring(2, 8);
    const aiSlot = {
      peerId,
      user: {
        username: candidate.name,
        avatar: candidate.avatar,
        title: candidate.title,
        isAi: true
      },
      isHost: false,
      isReady: true,
      isAi: true,
      aiData: candidate,
      ping: 5
    };

    this.currentRoom.players.push(aiSlot);
    this.broadcastRoomState();
    return true;
  }

  removePlayerSlot(peerId) {
    if (!this.currentRoom || !this.isHost) return false;
    const idx = this.currentRoom.players.findIndex(p => p.peerId === peerId);
    if (idx !== -1 && !this.currentRoom.players[idx].isHost) {
      this.currentRoom.players.splice(idx, 1);
      this.remotePlayers.delete(peerId);
      this.broadcastRoomState();
      return true;
    }
    return false;
  }

  fillPartyWithAi() {
    if (!this.currentRoom || !this.isHost) return false;
    let count = 0;
    while (this.currentRoom.players.length < this.currentRoom.maxPlayers) {
      if (this.addAiMercenary()) {
        count++;
      } else {
        break;
      }
    }
    return count > 0;
  }

  quickMatch(zoneId = 'barren_wastes') {
    // 1. Check if an active open human room exists in public channel
    const available = Array.from(this.publicRooms.values()).find(r => r.playerCount < r.maxPlayers && r.status === 'lobby');
    if (available) {
      this.joinRoomByCode(available.code);
      return { type: 'join', room: available };
    }

    // 2. Otherwise auto create a room and assemble 2 AI companions
    const room = this.createRoom('破曉討伐先鋒隊', 4, '', zoneId);
    this.addAiMercenary('ai_roland');
    this.addAiMercenary('ai_sylvia');
    return { type: 'create_ai', room };
  }

  createGuildNpcRoom(guildType = 'radiant') {
    if (guildType === 'shadow') {
      const room = this.createRoom('【暗夜深淵暗殺組】', 4, '', 'blood_mire');
      this.addAiMercenary('ai_sylvia');
      this.addAiMercenary('ai_valdor');
      return room;
    } else {
      const room = this.createRoom('【聖堂先鋒遠征隊】', 4, '', 'barren_wastes');
      this.addAiMercenary('ai_roland');
      this.addAiMercenary('ai_elena');
      return room;
    }
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

export const networkEngine = new MultiplayerNetworkEngine();
