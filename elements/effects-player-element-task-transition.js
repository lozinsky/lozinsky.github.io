import { EffectsPlayerElementTaskError } from './effects-player-element-task-error.js';

export class EffectsPlayerElementTaskTransition {
  /**
   * @type {AbortSignal}
   */
  #abortSignal;

  /**
   * @param {AbortSignal} abortSignal
   */
  constructor(abortSignal) {
    this.#abortSignal = abortSignal;
  }

  /**
   * @param {HTMLElement} element
   *
   * @returns {Promise<void>}
   */
  end(element) {
    return new Promise((resolve, reject) => {
      /**
       * @returns {void}
       */
      let handleTransitionEnd = () => {
        this.#abortSignal.removeEventListener('abort', handleAbort);
        resolve();
      };

      /**
       * @returns {void}
       */
      let handleAbort = () => {
        element.removeEventListener('transitionend', handleTransitionEnd);
        reject(new EffectsPlayerElementTaskError('Transition is aborted'));
      };

      element.addEventListener('transitionend', handleTransitionEnd, { once: true });

      this.#abortSignal.addEventListener('abort', handleAbort, { once: true });
    });
  }
}
