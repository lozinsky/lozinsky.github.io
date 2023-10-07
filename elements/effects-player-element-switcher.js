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
    this.#names = ['code', 'firework', 'rain'];
  }

  /**
   * @param {HTMLElement} root
   * @param {AbortSignal} abortSignal
   *
   * @returns {Promise<void>}
   */
  async switch(root, abortSignal) {
    let name = this.#names[this.#current];
    let effect = await import(`./effects-player-element-${name}-effect.js`);

    effect.create().run(root, abortSignal);

    this.#current = (this.#current + 1) % this.#names.length;
  }
}
