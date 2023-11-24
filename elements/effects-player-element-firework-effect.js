import { loop, parallel, setTimeout, when } from './effects-player-element-async.js';
import { getInteger, getSample } from './effects-player-element-random.js';

const TAU = 2 * Math.PI;
const PARTICLES = ['\u{2728}', '\u{2b50}', '\u{1f31f}'];
const VIEWPORT_PADDING = 100;
const MIN_CIRCLES_QUANTITY = 5;
const MAX_CIRCLES_QUANTITY = 9;
const MIN_CIRCLES_DENSITY = 2;
const MAX_CIRCLES_DENSITY = 4;
const MIN_START_DELAY = 1;
const MAX_START_DELAY = 5000;
const MIN_TRANSITION_DURATION = 500;
const MAX_TRANSITION_DURATION = 1000;
const PARTICLE_TRANSITION_DURATION = 1000;
const MIN_HUE_ROTATE_ANGLE = 0;
const MAX_HUE_ROTATE_ANGLE = 360;
const MIN_PARTICLE_BIAS = -50;
const MAX_PARTICLE_BIAS = 50;

/**
 * @returns {boolean}
 */
export function isSupported() {
  return true;
}

/**
 * @param {HTMLElement} root
 * @param {AbortSignal} signal
 *
 * @returns {Promise<void>}
 */
export async function run(root, signal) {
  await parallel(10, async () => {
    await loop(async () => {
      let firework = document.createElement('span');

      try {
        let circlesQuantity = getInteger(MIN_CIRCLES_QUANTITY, MAX_CIRCLES_QUANTITY);
        let hueRotateAngle = getInteger(MIN_HUE_ROTATE_ANGLE, MAX_HUE_ROTATE_ANGLE);

        firework.style.fontSize = '0.5rem';
        firework.style.bottom = '0';
        firework.style.filter = `hue-rotate(${hueRotateAngle}deg)`;
        firework.style.height = '1em';
        firework.style.left = '0';
        firework.style.pointerEvents = 'none';
        firework.style.position = 'fixed';
        firework.style.transform = 'translate(var(--firework-x), var(--firework-y))';
        firework.style.transitionProperty = 'transform';
        firework.style.transitionTimingFunction = 'linear';
        firework.style.visibility = 'hidden';

        for (let i = 0; i < circlesQuantity; i++) {
          let circle = document.createElement('span');
          let particlesQuantity = i * circlesQuantity + 1;

          for (let j = 0; j < particlesQuantity; j++) {
            let particle = document.createElement('span');

            particle.textContent = getSample(PARTICLES);
            particle.style.position = 'absolute';
            particle.style.transform = 'translate(var(--particle-x), var(--particle-y))';
            particle.style.transitionProperty = 'transform, opacity';
            particle.style.transitionDuration = `${PARTICLE_TRANSITION_DURATION}ms`;
            particle.style.transitionTimingFunction = 'ease-out';

            circle.appendChild(particle);
          }

          firework.appendChild(circle);
        }

        root.appendChild(firework);

        await setTimeout(100, { signal });

        /** @type {HTMLElement[]}  */
        let circles = [...firework.children];
        let circlesDensity = getInteger(MIN_CIRCLES_DENSITY, MAX_CIRCLES_DENSITY);
        let transitionDuration = getInteger(MIN_TRANSITION_DURATION, MAX_TRANSITION_DURATION);
        let startDelay = getInteger(MIN_START_DELAY, MAX_START_DELAY);
        let startX = getInteger(VIEWPORT_PADDING, window.innerWidth - VIEWPORT_PADDING);
        let startY = firework.offsetHeight;
        let endY = getInteger(-VIEWPORT_PADDING, -window.innerHeight + VIEWPORT_PADDING);

        firework.style.transitionDuration = `${startDelay}ms`;
        firework.style.setProperty('--firework-x', `${startX}px`);
        firework.style.setProperty('--firework-y', `${startY}px`);

        await when(firework, 'transitionend', { signal });

        firework.style.visibility = '';
        firework.style.transitionDuration = `${transitionDuration}ms`;
        firework.style.setProperty('--firework-y', `${endY}px`);

        await when(firework, 'transitionend', { signal });

        await Promise.all(
          circles.map(async (circle, i) => {
            /** @type {HTMLElement[]}  */
            let particles = [...circle.children];
            let particlesQuantity = particles.length;
            let circleRadius = i * circlesQuantity * circlesDensity;

            await Promise.all(
              particles.map(async (particle, j) => {
                let particleAngle = (TAU * j) / particlesQuantity;
                let particleBiasX = getInteger(MIN_PARTICLE_BIAS, MAX_PARTICLE_BIAS);
                let particleBiasY = getInteger(MIN_PARTICLE_BIAS, MAX_PARTICLE_BIAS);
                let particleEndX = circleRadius * Math.cos(particleAngle) + particleBiasX;
                let particleEndY = circleRadius * Math.sin(particleAngle) + particleBiasY;

                particle.style.setProperty('--particle-x', `${particleEndX}px`);
                particle.style.setProperty('--particle-y', `${particleEndY}px`);
                particle.style.opacity = '0';

                await when(particle, 'transitionend', { signal });
              }),
            );
          }),
        );
      } finally {
        firework.remove();
      }
    });
  });
}
