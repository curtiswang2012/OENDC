/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Tactical Chat, Emote Wheels, and Tactical Ground Ping Beacon System
 */

import { networkEngine } from './network.js';
import { audio } from './audio.js';

export const QUICK_TACTICAL_PINGS = [
  { id: 'ignite', icon: '🔥', text: '快點燃火盆解鎖神聖領域！', type: 'warning' },
  { id: 'berserk', icon: '💀', text: '首領狂暴破盾階段，注意走位！', type: 'danger' },
  { id: 'burst', icon: '⚡', text: '神聖領域生效，全力爆發輸出！', type: 'radiant' },
  { id: 'gather', icon: '🎯', text: '前來此處集合！', type: 'info' },
  { id: 'loot', icon: '📦', text: '發現探索寶箱與深淵黑鐵！', type: 'loot' }
];

export class TacticalChatSystem {
  constructor() {
    this.messages = [];
    this.activePings = []; // { x, y, user, text, type, life, maxLife }
    this.isOpen = false;
    this.inputElem = null;
    this.containerElem = null;
  }

  init() {
    this.inputElem = document.getElementById('chat-input-field');
    this.containerElem = document.getElementById('ingame-chat-box');

    // Hook network messages
    networkEngine.onChatMessage = (user, text) => {
      this.addMessage(user, text);
    };

    networkEngine.onTacticalPing = (senderId, user, payload) => {
      this.addPing(payload.x, payload.y, user, payload.message || payload.pingType, payload.pingType);
      audio.playBrazierIgnite();
    };

    // Key listener for [Enter]
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Enter') {
        if (this.isOpen) {
          this.sendMessage();
        } else {
          this.openChat();
        }
      } else if (e.code === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });

    document.getElementById('btn-send-chat')?.addEventListener('click', () => {
      this.sendMessage();
    });

    // Quick Ping Buttons
    document.querySelectorAll('.tactical-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pingId = btn.getAttribute('data-ping-id');
        const pingObj = QUICK_TACTICAL_PINGS.find(p => p.id === pingId);
        if (pingObj) {
          this.triggerQuickPing(pingObj);
        }
      });
    });
  }

  openChat() {
    this.isOpen = true;
    const box = document.getElementById('ingame-chat-container');
    if (box) box.classList.add('active');
    if (this.inputElem) {
      this.inputElem.focus();
    }
  }

  closeChat() {
    this.isOpen = false;
    const box = document.getElementById('ingame-chat-container');
    if (box) box.classList.remove('active');
    if (this.inputElem) {
      this.inputElem.blur();
    }
  }

  sendMessage() {
    if (!this.inputElem) return;
    const text = this.inputElem.value.trim();
    if (text.length > 0) {
      networkEngine.broadcastChat(text);
      this.addMessage({ username: '我', avatar: { color: '#ffd700' } }, text, true);
      this.inputElem.value = '';
    }
    this.closeChat();
  }

  triggerQuickPing(pingObj, worldX = null, worldY = null) {
    const x = worldX !== null ? worldX : (window.gameInstance?.player?.x || 400);
    const y = worldY !== null ? worldY : (window.gameInstance?.player?.y || 300);

    networkEngine.broadcastPing(x, y, pingObj.type, `${pingObj.icon} ${pingObj.text}`);
    this.addPing(x, y, { username: '我' }, `${pingObj.icon} ${pingObj.text}`, pingObj.type);
    this.addMessage({ username: '戰術信標', avatar: { color: '#ef4444' } }, `${pingObj.icon} ${pingObj.text}`, true);
    audio.playBrazierIgnite();
  }

  addMessage(user, text, isSelf = false) {
    const msg = {
      id: Date.now() + Math.random(),
      user: user || { username: '隊友', avatar: { color: '#38bdf8' } },
      text,
      isSelf,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.push(msg);
    if (this.messages.length > 50) this.messages.shift();

    this.renderMessages();
  }

  renderMessages() {
    if (!this.containerElem) return;
    this.containerElem.innerHTML = this.messages.map(m => `
      <div class="chat-message-row ${m.isSelf ? 'self' : ''}">
        <span class="chat-time">${m.time}</span>
        <span class="chat-sender" style="color: ${m.user.avatar?.color || '#ffd700'}">${m.user.username}:</span>
        <span class="chat-content">${this.escapeHtml(m.text)}</span>
      </div>
    `).join('');

    this.containerElem.scrollTop = this.containerElem.scrollHeight;
  }

  addPing(x, y, user, text, type = 'info') {
    this.activePings.push({
      x,
      y,
      user: user?.username || '隊友',
      text,
      type,
      life: 5.0,
      maxLife: 5.0
    });
  }

  update(dt) {
    for (let i = this.activePings.length - 1; i >= 0; i--) {
      const p = this.activePings[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.activePings.splice(i, 1);
      }
    }
  }

  renderWorldPings(ctx, cameraX, cameraY) {
    for (const p of this.activePings) {
      const sx = p.x - cameraX;
      const sy = p.y - cameraY;

      ctx.save();
      ctx.translate(sx, sy);

      const progress = 1 - (p.life / p.maxLife);
      const pulseR = 15 + progress * 40;
      const alpha = Math.max(0, p.life / p.maxLife);

      // Expanding beacon wave
      ctx.beginPath();
      ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = p.type === 'danger' ? `rgba(239, 68, 68, ${alpha})` : `rgba(255, 215, 0, ${alpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Core Ping Beacon Dot
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = p.type === 'danger' ? '#ef4444' : '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text Tag
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 6;
      ctx.fillText(p.text, 0, -18);

      ctx.restore();
    }
  }

  escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }
}

export const chatSystem = new TacticalChatSystem();
