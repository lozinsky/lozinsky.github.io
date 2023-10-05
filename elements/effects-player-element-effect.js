import { EffectsPlayerElementTask } from './effects-player-element-task.js';
import { EffectsPlayerElementTaskError } from './effects-player-element-task-error.js';

export class EffectsPlayerElementEffect {
  /**
   * @type {number}
   */
  get times() {
    return 1;
  }

  /**
   * @param {HTMLElement} root
   * @param {AbortSignal} abortSignal
   *
   * @returns {void}
   */
  run(root, abortSignal) {
    let times = this.times;

    for (let i = 0; i < times; i++) {
      this.#repeat(root, abortSignal);
    }
  }

  /**
   * @abstract
   *
   * @returns {HTMLElement}
   */
  init() {
    throw new Error('Unimplemented');
  }

  /**
   * @abstract
   *
   * @returns {Promise<void>}
   */
  async draw() {
    throw new Error('Unimplemented');
  }

  /**
   * @param {HTMLElement} root
   * @param {AbortSignal} abortSignal
   *
   * @returns {Promise<void>}
   */
  async #repeat(root, abortSignal) {
    let task = new EffectsPlayerElementTask(abortSignal);
    let element = this.init();

    root.appendChild(element);

    try {
      await task.setTimeout();
      await this.draw(element, task);
    } catch (error) {
      if (error instanceof EffectsPlayerElementTaskError) {
        return;
      }

      throw error;
    } finally {
      element.remove();
    }

    this.#repeat(root, abortSignal);
  }
}
