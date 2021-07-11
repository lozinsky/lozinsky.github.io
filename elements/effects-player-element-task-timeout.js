import { EffectsPlayerElementTaskError } from './effects-player-element-task-error.js';

export class EffectsPlayerElementTaskTimeout {
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
   * @param {number} [duration]
   *
   * @returns {Promise<void>}
   */
  set(duration) {
    return new Promise((resolve, reject) => {
      /**
       * @returns {void}
       */
      let handleTimeout = () => {
        this.#abortSignal.removeEventListener('abort', handleAbort);
        resolve();
      };

      /**
       * @returns {void}
       */
      let handleAbort = () => {
        clearTimeout(timeout);
        reject(new EffectsPlayerElementTaskError('Timeout is aborted'));
      };

      let timeout = setTimeout(handleTimeout, duration);

      this.#abortSignal.addEventListener('abort', handleAbort, { once: true });
    });
  }
}
