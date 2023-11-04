export class EffectsPlayerElementSwitcher {
  /**
   * @type {number}
   */
  #current;
  /**
   * @type {string[]}
   */
  #names;

  constructor() {
    this.#current = 0;
    this.#names = ['rainbow-highlight', 'code', 'firework', 'rain'];
  }

  /**
   * @param {HTMLElement} root
   * @param {AbortSignal} signal
   *
   * @returns {Promise<void>}
   */
  async switch(root, signal) {
    let name = this.#names[this.#current];
    let effect = await import(`./effects-player-element-${name}-effect.js`);

    this.#current = (this.#current + 1) % this.#names.length;

    return effect.isSupported() ? effect.run(root, signal) : this.switch(root, signal);
  }
}
