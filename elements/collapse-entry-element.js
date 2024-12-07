import { expectToBeDefined } from './shared/expect.js';

export class CollapseEntryElement extends HTMLElement {
  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['opened', 'once'];
  }

  static {
    customElements.define('collapse-entry', this);
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

  constructor() {
    super();

    this.addEventListener('collapse-handle-toggle', this.#handleCollapseHandleToggle);
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
      case 'once':
        void this.#handleOnceChange(newValue !== null);
        break;

      case 'opened':
        void this.#handleOpenedChange(newValue !== null);
        break;
    }
  }

  /**
   * @returns {void}
   */
  connectedCallback() {
    if (!this.hasAttribute('opened')) {
      void this.#handleOpenedChange(false);
    }

    if (!this.hasAttribute('once')) {
      void this.#handleOnceChange(false);
    }
  }

  /**
   * @param {boolean} disabled
   *
   * @returns {Promise<void>}
   */
  async #disableHandle(disabled) {
    await customElements.whenDefined('collapse-handle');

    const collapseHandle = expectToBeDefined(this.querySelector('collapse-handle'));
    const eventType = disabled ? 'collapse-entry-disabled' : 'collapse-entry-enabled';

    collapseHandle.disabled = disabled;

    this.dispatchEvent(new CustomEvent(eventType, { bubbles: true }));
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
   * @param {boolean} opened
   *
   * @returns {Promise<void>}
   */
  async #handleOpenedChange(opened) {
    await Promise.all([customElements.whenDefined('collapse-handle'), customElements.whenDefined('collapse-content')]);

    const collapseContent = expectToBeDefined(this.querySelector('collapse-content'));
    const collapseHandle = expectToBeDefined(this.querySelector('collapse-handle'));
    const eventType = opened ? 'collapse-entry-opened' : 'collapse-entry-closed';

    collapseContent.hidden = !opened;
    collapseHandle.setAttribute('aria-expanded', opened.toString());

    this.dispatchEvent(new CustomEvent(eventType, { bubbles: true }));
  }
}
