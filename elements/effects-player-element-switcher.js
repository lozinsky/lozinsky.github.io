import { EffectsPlayerElementCodeEffect } from './effects-player-element-code-effect.js';
import { EffectsPlayerElementFireworkEffect } from './effects-player-element-firework-effect.js';
import { EffectsPlayerElementRainEffect } from './effects-player-element-rain-effect.js';

export class EffectsPlayerElementSwitcher {
  /**
   * @type {Array<import('./effects-player-element-effect').EffectsPlayerElementEffect>}
   */
  #effects;
  /**
   * @type {number}
   */
  #current;

  constructor() {
    this.#current = 0;
    this.#effects = [
      new EffectsPlayerElementCodeEffect(),
      new EffectsPlayerElementRainEffect(),
      new EffectsPlayerElementFireworkEffect(),
    ];
  }

  /**
   * @param {HTMLElement} root
   * @param {AbortSignal} abortSignal
   *
   * @returns {void}
   */
  switch(root, abortSignal) {
    let effect = this.#effects[this.#current];

    effect.run(root, abortSignal);

    this.#current = (this.#current + 1) % this.#effects.length;
  }
}
