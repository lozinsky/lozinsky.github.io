import { EffectsPlayerElementTaskTimeout } from './effects-player-element-task-timeout.js';
import { EffectsPlayerElementTaskTransition } from './effects-player-element-task-transition.js';

export class EffectsPlayerElementTask {
  /**
   * @type {EffectsPlayerElementTaskTimeout}
   */
  #timeout;
  /**
   * @type {EffectsPlayerElementTaskTransition}
   */
  #transition;

  /**
   * @param {AbortSignal} abortSignal
   */
  constructor(abortSignal) {
    this.#timeout = new EffectsPlayerElementTaskTimeout(abortSignal);
    this.#transition = new EffectsPlayerElementTaskTransition(abortSignal);
  }

  /**
   * @param {number} [duration]
   *
   * @returns {Promise<void>}
   */
  setTimeout(duration) {
    return this.#timeout.set(duration);
  }

  /**
   * @param {HTMLElement} element
   *
   * @returns {Promise<void>}
   */
  transitionEnd(element) {
    return this.#transition.end(element);
  }
}
