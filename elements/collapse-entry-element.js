export class CollapseEntryElement extends HTMLElement {
  static {
    customElements.define('collapse-entry', this);
  }

  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['opened', 'once'];
  }

  constructor() {
    super();

    this.addEventListener('collapse-handle-toggle', this.#handleCollapseHandleToggle);
  }

  /**
   * @returns {void}
   */
  connectedCallback() {
    if (!this.hasAttribute('opened')) {
      this.#handleOpenedChange(false);
    }

    if (!this.hasAttribute('once')) {
      this.#handleOnceChange(false);
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
    if (oldValue === newValue) {
      return;
    }

    switch (name) {
      case 'opened':
        this.#handleOpenedChange(newValue !== null);
        break;

      case 'once':
        this.#handleOnceChange(newValue !== null);
        break;
    }
  }

  /**
   * @type {boolean}
   */
  get opened() {
    return this.hasAttribute('opened');
  }

  /**
   * @param {boolean} value
   */
  set opened(value) {
    this.toggleAttribute('opened', value);
  }

  /**
   * @type {boolean}
   */
  get once() {
    return this.hasAttribute('once');
  }

  /**
   * @param {boolean} value
   */
  set once(value) {
    this.toggleAttribute('once', value);
  }

  /**
   * @param {Event} event
   *
   * @returns {Promise<void>}
   */
  async #handleCollapseHandleToggle(event) {
    event.stopPropagation();

    this.opened = !this.opened;

    if (this.once) {
      await this.#disableHandle(true);
    }
  }

  /**
   * @param {boolean} opened
   *
   * @returns {Promise<void>}
   */
  async #handleOpenedChange(opened) {
    await Promise.all([customElements.whenDefined('collapse-handle'), customElements.whenDefined('collapse-content')]);

    /** @type {import('./collapse-content-element').CollapseContentElement} */
    let collapseContent = this.querySelector('collapse-content');
    /** @type {import('./collapse-handle-element').CollapseHandleElement} */
    let collapseHandle = this.querySelector('collapse-handle');
    let eventType = opened ? 'collapse-entry-opened' : 'collapse-entry-closed';

    collapseContent.hidden = !opened;
    collapseHandle.setAttribute('aria-expanded', opened.toString());

    this.dispatchEvent(new CustomEvent(eventType, { bubbles: true }));
  }

  /**
   * @param {boolean} once
   *
   * @returns {Promise<void>}
   */
  async #handleOnceChange(once) {
    if (!once) {
      await this.#disableHandle(false);
    }
  }

  /**
   * @param {boolean} disabled
   *
   * @returns {Promise<void>}
   */
  async #disableHandle(disabled) {
    await customElements.whenDefined('collapse-handle');

    /** @type {import('./collapse-handle-element').CollapseHandleElement} */
    let collapseHandle = this.querySelector('collapse-handle');
    let eventType = disabled ? 'collapse-entry-disabled' : 'collapse-entry-enabled';

    collapseHandle.disabled = disabled;

    this.dispatchEvent(new CustomEvent(eventType, { bubbles: true }));
  }
}
