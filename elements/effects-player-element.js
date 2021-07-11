import { EffectsPlayerElementSwitcher } from './effects-player-element-switcher.js';

export class EffectsPlayerElement extends HTMLElement {
  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['stopped'];
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
   * @returns {void}
   */
  #handleClick() {
    this.stopped = false;
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
      this.#play();
    }
  }

  /**
   * @returns {void}
   */
  #play() {
    let root = document.body;
    let playing = new AbortController();

    /**
     * @param {MouseEvent} event
     *
     * @returns {void}
     */
    let handleDocumentClick = (event) => {
      if (!this.isSameNode(event.target)) {
        this.stopped = true;
      }
    };

    /**
     * @param {KeyboardEvent} event
     *
     * @returns {void}
     */
    let handleDocumentKeydown = (event) => {
      if (event.key === 'Escape') {
        this.stopped = true;
      }
    };

    /**
     * @returns {void}
     */
    let handleDocumentVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        this.stopped = true;
      }
    };

    /**
     * @returns {void}
     */
    let handleWindowResize = () => {
      this.stopped = true;
    };

    /**
     * @returns {void}
     */
    let handleAbort = () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleDocumentKeydown);
      document.removeEventListener('visibilitychange', handleDocumentVisibilityChange);

      window.removeEventListener('resize', handleWindowResize);

      this.#playing = null;
    };

    this.#switcher.switch(root, playing.signal);

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeydown);
    document.addEventListener('visibilitychange', handleDocumentVisibilityChange);

    window.addEventListener('resize', handleWindowResize);

    playing.signal.addEventListener('abort', handleAbort, { once: true });

    this.#playing = playing;
  }

  #stop() {
    this.#playing?.abort();
  }
}

customElements.define('effects-player', EffectsPlayerElement);
