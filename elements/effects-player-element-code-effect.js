import { EffectsPlayerElementEffect } from './effects-player-element-effect.js';
import { EffectsPlayerElementTask } from './effects-player-element-task.js';
import { range } from './effects-player-element-random.js';

export class EffectsPlayerElementCodeEffect extends EffectsPlayerElementEffect {
  /**
   * @type {string}
   */
  #code;
  /**
   * @type {number}
   */
  #minFontSize;
  /**
   * @type {number}
   */
  #maxFontSize;
  /**
   * @type {number}
   */
  #minOpacity;
  /**
   * @type {number}
   */
  #maxOpacity;
  /**
   * @type {number}
   */
  #minTransitionDuration;
  /**
   * @type {number}
   */
  #maxTransitionDuration;
  /**
   * @type {number}
   */
  #minTranslateX;
  /**
   * @type {number}
   */
  #maxTranslateX;

  constructor() {
    super();

    this.#code = document.documentElement.innerHTML;
    this.#minFontSize = 1;
    this.#maxFontSize = 3;
    this.#minOpacity = 10;
    this.#maxOpacity = 30;
    this.#minTransitionDuration = 20000;
    this.#maxTransitionDuration = 50000;
    this.#minTranslateX = -10;
    this.#maxTranslateX = 10;
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
    let fontSize = range(this.#minFontSize, this.#maxFontSize);
    let opacity = range(this.#minOpacity, this.#maxOpacity);
    let transitionDuration = range(this.#minTransitionDuration, this.#maxTransitionDuration);
    let translateX = range(this.#minTranslateX, this.#maxTranslateX);

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
   * @param {EffectsPlayerElementTask} task
   *
   * @returns {Promise<void>}
   */
  async draw(code, task) {
    code.style.setProperty('--code-y', `${window.innerHeight}px`);

    await task.transitionEnd(code);
  }
}
