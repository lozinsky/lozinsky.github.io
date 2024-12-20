import { delay, loop, parallel, when } from './shared/async.js';
import { getInteger, getSample } from './shared/random.js';

const DROPLET = '\u{1f4a7}';
const SLOPES = [-200, 200];
const MIN_TRANSITION_DURATION = 500;
const MAX_TRANSITION_DURATION = 1000;
const MIN_START_DELAY = 1;
const MAX_START_DELAY = 5000;

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
  const slope = getSample(SLOPES);
  const transitionDuration = getInteger(MIN_TRANSITION_DURATION, MAX_TRANSITION_DURATION);

  await parallel(window.innerWidth / 2, async () => {
    await loop(async () => {
      const droplet = document.createElement('span');

      try {
        droplet.textContent = DROPLET;
        droplet.style.left = '0';
        droplet.style.pointerEvents = 'none';
        droplet.style.position = 'fixed';
        droplet.style.top = '0';
        droplet.style.transform = 'translate(var(--droplet-x), var(--droplet-y)) rotate(var(--droplet-angle))';
        droplet.style.transitionProperty = 'transform';
        droplet.style.transitionTimingFunction = 'linear';
        droplet.style.visibility = 'hidden';

        root.appendChild(droplet);

        await delay(100, { signal });

        const startDelay = getInteger(MIN_START_DELAY, MAX_START_DELAY);
        const startX = getInteger(-Math.abs(slope), window.innerWidth);
        const startY = -droplet.offsetHeight;
        const endX = startX - slope;
        const endY = window.innerHeight;
        const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI - 90;

        droplet.style.transitionDuration = `${startDelay}ms`;
        droplet.style.setProperty('--droplet-x', `${startX}px`);
        droplet.style.setProperty('--droplet-y', `${startY}px`);
        droplet.style.setProperty('--droplet-angle', `${angle}deg`);

        await when(droplet, 'transitionend', { signal });

        droplet.style.visibility = '';
        droplet.style.transitionDuration = `${transitionDuration}ms`;
        droplet.style.setProperty('--droplet-x', `${endX}px`);
        droplet.style.setProperty('--droplet-y', `${endY}px`);

        await when(droplet, 'transitionend', { signal });
      } finally {
        droplet.remove();
      }
    });
  });
}
