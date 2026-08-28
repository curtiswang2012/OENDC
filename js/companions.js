/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Companion System & AI Autonomous Combat Engine
 */

import { audio } from './audio.js';

export const COMPANION_CLASSES = [
  {
    id: 'companion_guardian',
    name: '聖堂前衛·羅蘭 (Roland, Frontline Guardian)',
    role: 'Tank & Brazier Igniter',
    icon: '🛡️',
    color: '#38bdf8',
    baseHp: 1800,
    baseDamage: 35,
    attackCooldown: 1.4,
    description: '身著厚重聖銀甲冑的忠誠騎士。主動技能會嘲諷周圍敵人並施加護盾，能自動奔向並點燃未啟動的火盆。',
    activeSkillName: '聖盾守護 / 點燃火盆',
    skillCooldown: 10,
    dialogues: [
      '「只要我的巨盾尚未碎裂，永夜的陰影便休想染指大人分毫。」',
      '「堡壘的每一盞光芒，都是我們在無盡黑暗中築起的防線。」',
      '「小心暗處，魔物們正在等待提燈熄滅的那一刻！」'
    ]
  },
  {
    id: 'companion_stalker',
    name: '幽影遊俠·薇絲佩拉 (Vespera, Shadow Stalker)',
    role: 'Assassin & Debuffer',
    icon: '🗡️',
    color: '#a855f7',
    baseHp: 900,
    baseDamage: 65,
    attackCooldown: 0.9,
    description: '穿梭於深邃暗影中的致命刺客。攻擊附帶撕裂效果，主動技能標記強力目標使其受到 40% 額外傷害。',
    activeSkillName: '幽影獵殺印記',
    skillCooldown: 8,
    dialogues: [
      '「黑暗從不是我的敵人，而是我最鋒利的刀鞘。」',
      '「在它們察覺到心跳停止之前，我的短刃早已劃過咽喉。」',
      '「跟緊我，我知道哪裡隱藏著最罕見的黑鐵礦藏。」'
    ]
  },
  {
    id: 'companion_scholar',
    name: '密契學者·萊拉 (Lyra, Scholar of Secrets)',
    role: 'Support & Lumen Replenish',
    icon: '📜',
    color: '#facc15',
    baseHp: 800,
    baseDamage: 45,
    attackCooldown: 1.2,
    description: '精通古代流明奧術的學者。能發射自動追蹤的秘術飛彈，主動技能立即為提燈補充 35 點燃油並恢復隊伍生命。',
    activeSkillName: '流明秘術充能',
    skillCooldown: 12,
    dialogues: [
      '「這些古代魔物的符文...與大崩潰前的星界魔導術驚人地一致。」',
      '「別讓提燈熄滅！光的波長是維持我們理智的唯一屏障。」',
      '「我已經解析出敵人的弱點構造，全力攻擊它！」'
    ]
  },
  {
    id: 'companion_night_eater',
    name: '噬夜怪客·莫布 (Morb, Night-Eater)',
    role: 'Eldritch & Auto-Looter',
    icon: '👾',
    color: '#f43f5e',
    baseHp: 1300,
    baseDamage: 55,
    attackCooldown: 1.1,
    description: '自深淵暗影中誕生的奇異共生生物。吞噬魔物殘魂以強化自身，自動吸附遠處掉落的物資，主動技能釋放恐懼尖嘯。',
    activeSkillName: '深淵恐懼尖嘯',
    skillCooldown: 10,
    dialogues: [
      '「*咕嚕咕嚕*...黑暗的味道...美味...」',
      '「閃亮的鐵塊！好吃的魂魄！莫布都幫主人撿回來！」',
      '「*嘶吼*...魔鬼，莫布咬碎你們！」'
    ]
  }
];

export class Companion {
  constructor(classData = COMPANION_CLASSES[0]) {
    this.data = classData;
    this.x = 350;
    this.y = 300;
    this.prevX = 350;
    this.prevY = 300;
    this.radius = 16;
    this.speed = 210;
    this.hp = classData.baseHp;
    this.maxHp = classData.baseHp;
    this.level = 1;
    this.exp = 0;
    this.bondLevel = 1;
    this.bondExp = 0;

    this.attackCooldownTimer = 0;
    this.skillCooldownTimer = 0;
    this.targetBrazier = null;
    this.targetEnemy = null;
  }

  getMaxExp(level = this.level) {
    return Math.round(100 * Math.pow(level, 1.4));
  }

  gainExp(amount, particleEngine = null) {
    if (!amount || amount <= 0) return false;
    this.exp += Math.round(amount);
    let leveledUp = false;

    while (this.exp >= this.getMaxExp()) {
      this.exp -= this.getMaxExp();
      this.level++;
      this.maxHp = this.data.baseHp + (this.level - 1) * 100;
      this.hp = this.maxHp;
      leveledUp = true;

      if (particleEngine) {
        particleEngine.emitShockwaveRing(this.x, this.y, 160, this.data.color, 0.6);
        particleEngine.addFloatingText(this.x, this.y - 20, `🛡️ 隨從升級 Lv.${this.level}!`, 'heal');
      }
    }
    return leveledUp;
  }

  setCompanionClass(classData) {
    this.data = classData;
    this.maxHp = classData.baseHp + (this.level - 1) * 100;
    this.hp = this.maxHp;
  }

  triggerActiveSkill(player, dungeon, particleEngine) {
    if (this.skillCooldownTimer > 0) return false;
    this.skillCooldownTimer = this.data.skillCooldown;

    audio.playRadiantSkill();
    particleEngine.emitShockwaveRing(this.x, this.y, 160, this.data.color, 0.5);

    if (this.data.id === 'companion_guardian') {
      // Roland: Taunt + rush to closest unlit brazier
      const unlit = dungeon.braziers.find(b => !b.isLit);
      if (unlit) {
        this.targetBrazier = unlit;
        particleEngine.addFloatingText(this.x, this.y, '點燃火盆！', 'normal');
      } else {
        particleEngine.addFloatingText(this.x, this.y, '聖堂嘲諷！', 'normal');
      }
    } else if (this.data.id === 'companion_stalker') {
      // Vespera: Mark boss or closest elite
      particleEngine.addFloatingText(this.x, this.y, '致命印記！', 'backstab');
    } else if (this.data.id === 'companion_scholar') {
      // Lyra: Refuel lantern + heal
      player.lanternFuel = Math.min(player.maxLanternFuel, player.lanternFuel + 35);
      player.heal(180, particleEngine);
      particleEngine.addFloatingText(player.x, player.y, '+35 提燈油料', 'heal');
    } else if (this.data.id === 'companion_night_eater') {
      // Morb: Fear roar + auto collect
      particleEngine.addFloatingText(this.x, this.y, '恐懼尖嘯！', 'stun');
    }

    return true;
  }

  update(dt, player, enemies, boss, dungeon, particleEngine) {
    this.prevX = this.x;
    this.prevY = this.y;

    if (this.skillCooldownTimer > 0) this.skillCooldownTimer -= dt;
    if (this.attackCooldownTimer > 0) this.attackCooldownTimer -= dt;

    // Follow Target Brazier Priority (Roland)
    if (this.targetBrazier && !this.targetBrazier.isLit) {
      const dx = this.targetBrazier.x - this.x;
      const dy = this.targetBrazier.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 40) {
        this.targetBrazier.ignite(particleEngine);
        this.targetBrazier = null;
      } else {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
        return;
      }
    }

    // Follow player if too far
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    if (distToPlayer > 300) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.x += Math.cos(angle) * this.speed * 1.3 * dt;
      this.y += Math.sin(angle) * this.speed * 1.3 * dt;
      return;
    }

    // Target closest enemy or boss
    let closestTarget = null;
    let minDist = 220;

    if (boss && boss.isActive && !boss.isDead) {
      closestTarget = boss;
      minDist = Math.hypot(boss.x - this.x, boss.y - this.y);
    } else {
      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (d < minDist) {
          minDist = d;
          closestTarget = enemy;
        }
      }
    }

    if (closestTarget) {
      const dx = closestTarget.x - this.x;
      const dy = closestTarget.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 50) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }

      // Attack
      if (this.attackCooldownTimer <= 0 && dist < 75) {
        this.attackCooldownTimer = this.data.attackCooldown;
        const dmg = this.data.baseDamage + (this.level - 1) * 6;
        closestTarget.takeDamage(dmg, false, 1.0, particleEngine);
        audio.playSlash('spear');
        particleEngine.emitSparks(closestTarget.x, closestTarget.y, this.data.color, 6, 100);
      }
    } else if (distToPlayer > 70) {
      // Stay near player
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.x += Math.cos(angle) * (this.speed * 0.7) * dt;
      this.y += Math.sin(angle) * (this.speed * 0.7) * dt;
    }
  }

  render(ctx, cameraX, cameraY) {
    const sx = this.x - cameraX;
    const sy = this.y - cameraY;

    ctx.save();
    ctx.translate(sx, sy);

    // Companion Aura
    ctx.beginPath();
    ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = this.data.color + '33';
    ctx.fill();
    ctx.strokeStyle = this.data.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#1e2230';
    ctx.fill();

    // Icon
    ctx.font = '14px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.data.icon, 0, 1);

    ctx.restore();
  }
}
