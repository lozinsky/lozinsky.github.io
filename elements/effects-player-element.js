import { EffectsPlayerElementSwitcher } from './effects-player-element-switcher.js';
import { when } from './shared/async.js';

export class EffectsPlayerElement extends HTMLElement {
  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['stopped'];
  }

  static {
    customElements.define('effects-player', this);
  }

  /**
   * @type {boolean}
   */
  get stopped() {
    return this.hasAttribute('stopped');
  }

  /**
   * @param {boolean} value
   */
  set stopped(value) {
    this.toggleAttribute('stopped', value);
  }

  /**
   * @type {AbortController | null}
   */
  #playing;
  /**
   * @type {EffectsPlayerElementSwitcher}
   */
  #switcher;

  constructor() {
    super();

    this.#playing = null;
    this.#switcher = new EffectsPlayerElementSwitcher();
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  /**
   * @param {string} name
   * @param {string | null} oldValue
   * @param {string | null} newValue
   *
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && name === 'stopped') {
      this.#handleStoppedChange(newValue !== null);
    }
  }

  /**
   * @returns {void}
   */
  connectedCallback() {
    if (!this.hasAttribute('stopped')) {
      this.#handleStoppedChange(false);
    }
  }

  /**
   * @returns {void}
   */
  disconnectedCallback() {
    this.#stop();
  }

  /**
   * @param {MouseEvent} event
   *
   * @returns {void}
   */
  #handleClick(event) {
    if (this.stopped) {
      event.stopPropagation();

      this.stopped = false;
    }
  }

  /**
   * @param {KeyboardEvent} event
   *
   * @returns {void}
   */
  #handleKeydown(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      this.stopped = false;
    }
  }

  /**
   * @param {boolean} stopped
   *
   * @returns {void}
   */
  #handleStoppedChange(stopped) {
    if (stopped) {
      this.setAttribute('tabindex', '0');
      this.setAttribute('role', 'button');
      this.#stop();
    } else {
      if (this.isSameNode(document.activeElement)) {
        this.blur();
      }

      this.removeAttribute('tabindex');
      this.removeAttribute('role');
      void this.#play();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async #play() {
    try {
      const root = document.body;
      const playing = new AbortController();

      this.#playing = playing;
      void this.#switcher.switch(root, playing.signal);

      await Promise.race([
        when(document, 'click', {
          signal: playing.signal,
        }),
        when(document, 'keydown', {
          /**
           * @param {KeyboardEvent} event
           *
           * @returns {boolean}
           */
          filter: (event) => event.key === 'Escape',
          signal: playing.signal,
        }),
        when(document, 'visibilitychange', {
          filter: () => document.visibilityState === 'hidden',
          signal: playing.signal,
        }),
        when(window, 'resize', {
          signal: playing.signal,
        }),
      ]);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      throw error;
    } finally {
      this.stopped = true;
    }
  }

  #stop() {
    this.#playing?.abort();
    this.#playing = null;
  }
}
