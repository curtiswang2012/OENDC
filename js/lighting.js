/**
 * EVERNIGHT OATH: DAWN CHRONICLES (永夜之誓：破曉紀錄)
 * Dynamic 2D Chiaroscuro Lighting & Darkness Engine
 */

export class LightingEngine {
  constructor() {
    this.lightSources = [];
    this.darknessCanvas = document.createElement('canvas');
    this.darknessCtx = this.darknessCanvas.getContext('2d');
    this.ambientDarkness = 0.94; // 0 (bright) to 1 (pitch black)
    this.flickerTimer = 0;
  }

  resize(width, height) {
    this.darknessCanvas.width = width;
    this.darknessCanvas.height = height;
  }

  clearLights() {
    this.lightSources = [];
  }

  addLight(x, y, radius, color = '#ffd700', intensity = 1.0, flicker = true) {
    this.lightSources.push({
      x,
      y,
      radius,
      color,
      intensity,
      flicker,
      id: Math.random().toString(36).substr(2, 9)
    });
  }

  // Check if coordinates are covered by any active light source
  isPointInLight(x, y) {
    for (const light of this.lightSources) {
      const dx = x - light.x;
      const dy = y - light.y;
      const distSq = dx * dx + dy * dy;
      if (distSq <= (light.radius * 0.85) * (light.radius * 0.85)) {
        return true;
      }
    }
    return false;
  }

  update(dt) {
    this.flickerTimer += dt * 5;
  }

  render(ctx, cameraX, cameraY, width, height) {
    const dCtx = this.darknessCtx;
    dCtx.clearRect(0, 0, width, height);

    // 1. Fill with gothic ambient darkness
    dCtx.fillStyle = `rgba(5, 5, 8, ${this.ambientDarkness})`;
    dCtx.fillRect(0, 0, width, height);

    // 2. Cut out light circles with soft gradients
    dCtx.globalCompositeOperation = 'destination-out';

    for (const light of this.lightSources) {
      const screenX = light.x - cameraX;
      const screenY = light.y - cameraY;

      // Skip lights off-screen
      if (
        screenX < -light.radius ||
        screenX > width + light.radius ||
        screenY < -light.radius ||
        screenY > height + light.radius
      ) {
        continue;
      }

      let flickerOffset = 0;
      if (light.flicker) {
        flickerOffset = Math.sin(this.flickerTimer + light.x * 0.05) * 6 + Math.cos(this.flickerTimer * 1.5) * 4;
      }
      const actualRadius = Math.max(10, light.radius + flickerOffset);

      const radGrad = dCtx.createRadialGradient(
        screenX, screenY, actualRadius * 0.15,
        screenX, screenY, actualRadius
      );
      radGrad.addColorStop(0, `rgba(0, 0, 0, ${light.intensity})`);
      radGrad.addColorStop(0.6, `rgba(0, 0, 0, ${light.intensity * 0.7})`);
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      dCtx.fillStyle = radGrad;
      dCtx.beginPath();
      dCtx.arc(screenX, screenY, actualRadius, 0, Math.PI * 2);
      dCtx.fill();
    }

    // Reset composite operation
    dCtx.globalCompositeOperation = 'source-over';

    // 3. Draw colored luminous glow on main context
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const light of this.lightSources) {
      const screenX = light.x - cameraX;
      const screenY = light.y - cameraY;

      if (
        screenX < -light.radius ||
        screenX > width + light.radius ||
        screenY < -light.radius ||
        screenY > height + light.radius
      ) {
        continue;
      }

      const glowGrad = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, light.radius * 0.9
      );
      glowGrad.addColorStop(0, light.color);
      glowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(screenX, screenY, light.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Overlay the darkness mask onto the main game canvas
    ctx.drawImage(this.darknessCanvas, 0, 0);
  }
}
