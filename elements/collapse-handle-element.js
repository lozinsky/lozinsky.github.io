export class CollapseHandleElement extends HTMLElement {
  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['disabled'];
  }

  constructor() {
    super();

    this.addEventListener('click', this.#handleClick);
    this.addEventListener('keydown', this.#handleKeydown);
  }

  /**
   * @returns {void}
   */
  connectedCallback() {
    if (!this.hasAttribute('disabled')) {
      this.#handleDisabledChange(false);
    }
  }

  /**
   * @param {string} name
   * @param {string | null} oldValue
   * @param {string | null} newValue
   *
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && name === 'disabled') {
      this.#handleDisabledChange(newValue !== null);
    }
  }

  /**
   * @type {boolean}
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  /**
   * @param {boolean} value
   */
  set disabled(value) {
    this.toggleAttribute('disabled', value);
  }

  /**
   * @returns {void}
   */
  #handleClick() {
    this.#toggle();
  }

  /**
   * @param {KeyboardEvent} event
   *
   * @returns {void}
   */
  #handleKeydown(event) {
    if (event.key === ' ' || event.key === 'Enter') {
      this.#toggle();
    }
  }

  /**
   * @param {boolean} disabled
   *
   * @returns {void}
   */
  #handleDisabledChange(disabled) {
    if (disabled) {
      if (this.isSameNode(document.activeElement)) {
        this.blur();
      }

      this.removeAttribute('tabindex');
      this.removeAttribute('role');
    } else {
      this.setAttribute('tabindex', '0');
      this.setAttribute('role', 'button');
    }
  }

  /**
   * @returns {void}
   */
  #toggle() {
    if (!this.disabled) {
      this.dispatchEvent(new CustomEvent('collapse-handle-toggle', { bubbles: true }));
    }
  }
}

customElements.define('collapse-handle', CollapseHandleElement);
