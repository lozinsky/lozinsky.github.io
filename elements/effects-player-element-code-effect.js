import { EffectsPlayerElementEffect } from './effects-player-element-effect.js';
import { range } from './effects-player-element-random.js';

const MIN_FONT_SIZE = 1;
const MAX_FONT_SIZE = 3;
const MIN_OPACITY = 10;
const MAX_OPACITY = 30;
const MIN_TRANSITION_DURATION = 20000;
const MAX_TRANSITION_DURATION = 50000;
const MIN_TRANSLATE_X = -10;
const MAX_TRANSLATE_X = 10;

class EffectsPlayerElementCodeEffect extends EffectsPlayerElementEffect {
  /**
   * @type {string}
   */
  #code;

  constructor() {
    super();

    this.#code = document.documentElement.innerHTML;
  }

  /**
   * @override
   *
   * @type {number}
   */
  get times() {
    return 3;
  }

  /**
   * @override
   *
   * @returns {HTMLElement}
   */
  init() {
    let code = document.createElement('pre');
    let fontSize = range(MIN_FONT_SIZE, MAX_FONT_SIZE);
    let opacity = range(MIN_OPACITY, MAX_OPACITY);
    let transitionDuration = range(MIN_TRANSITION_DURATION, MAX_TRANSITION_DURATION);
    let translateX = range(MIN_TRANSLATE_X, MAX_TRANSLATE_X);

    code.textContent = this.#code;
    code.style.fontSize = `${fontSize}rem`;
    code.style.left = '0';
    code.style.opacity = `${opacity}%`;
    code.style.pointerEvents = 'none';
    code.style.position = 'fixed';
    code.style.top = '0';
    code.style.transform = `translate(${translateX}%, var(--code-y))`;
    code.style.transition = `transform ${transitionDuration}ms linear`;
    code.style.setProperty('--code-y', '-100%');

    return code;
  }

  /**
   * @override
   *
   * @param {HTMLElement} code
   * @param {import('./effects-player-element-task').EffectsPlayerElementTask} task
   *
   * @returns {Promise<void>}
   */
  async draw(code, task) {
    code.style.setProperty('--code-y', `${window.innerHeight}px`);

    await task.transitionEnd(code);
  }
}

/**
 * @returns {EffectsPlayerElementEffect}
 */
export function create() {
  return new EffectsPlayerElementCodeEffect();
}
