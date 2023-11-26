import { delay, loop, parallel, when } from './effects-player-element-async.js';
import { getInteger } from './effects-player-element-random.js';

const MIN_FONT_SIZE = 1;
const MAX_FONT_SIZE = 3;
const MIN_OPACITY = 10;
const MAX_OPACITY = 30;
const MIN_TRANSITION_DURATION = 20000;
const MAX_TRANSITION_DURATION = 50000;
const MIN_TRANSLATE_X = -10;
const MAX_TRANSLATE_X = 10;

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
  let textContent = document.documentElement.innerHTML;

  await parallel(3, async () => {
    await loop(async () => {
      let code = document.createElement('pre');

      try {
        let fontSize = getInteger(MIN_FONT_SIZE, MAX_FONT_SIZE);
        let opacity = getInteger(MIN_OPACITY, MAX_OPACITY);
        let transitionDuration = getInteger(MIN_TRANSITION_DURATION, MAX_TRANSITION_DURATION);
        let translateX = getInteger(MIN_TRANSLATE_X, MAX_TRANSLATE_X);

        code.textContent = textContent;
        code.style.fontSize = `${fontSize}rem`;
        code.style.left = '0';
        code.style.opacity = `${opacity}%`;
        code.style.pointerEvents = 'none';
        code.style.position = 'fixed';
        code.style.top = '0';
        code.style.transform = `translate(${translateX}%, var(--code-y))`;
        code.style.transition = `transform ${transitionDuration}ms linear`;
        code.style.setProperty('--code-y', '-100%');

        root.appendChild(code);

        await delay(100, { signal });

        code.style.setProperty('--code-y', `${window.innerHeight}px`);

        await when(code, 'transitionend', { signal });
      } finally {
        code.remove();
      }
    });
  });
}
