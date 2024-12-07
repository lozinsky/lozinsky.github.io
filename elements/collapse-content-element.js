import { expectToBeDefined } from './shared/expect.js';

export class CollapseContentElement extends HTMLElement {
  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['forwards', 'hidden'];
  }

  static {
    customElements.define('collapse-content', this);
  }

  /**
   * @type {string | null}
   */
  get forwards() {
    return this.getAttribute('forwards');
  }

  /**
   * @param {string | null} value
   */
  set forwards(value) {
    if (value === null) {
      this.removeAttribute('forwards');
    } else {
      this.setAttribute('forwards', value);
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
      case 'forwards':
        this.#handleForwardsChange(newValue);
        break;

      case 'hidden':
        this.#handleHiddenChange(newValue !== null);
        break;
    }
  }

  /**
   * @returns {void}
   */
  connectedCallback() {
    if (!this.hasAttribute('forwards')) {
      this.#handleForwardsChange(null);
    }

    if (!this.hasAttribute('hidden')) {
      this.#handleHiddenChange(false);
    }
  }

  /**
   * @param {string} id
   * @param {boolean} hidden
   *
   * @returns {void}
   */
  #forwardHidden(id, hidden) {
    const receiver = expectToBeDefined(document.getElementById(id));

    receiver.hidden = hidden;
  }

  /**
   * @param {string | null} forwards
   *
   * @returns {void}
   */
  #handleForwardsChange(forwards) {
    if (forwards === null) {
      this.removeAttribute('aria-owns');
    } else {
      this.setAttribute('aria-owns', forwards);
      this.#forwardHidden(forwards, this.hidden);
    }
  }

  /**
   * @param {boolean} hidden
   *
   * @returns {void}
   */
  #handleHiddenChange(hidden) {
    const forwards = this.forwards;

    if (forwards !== null) {
      this.#forwardHidden(forwards, hidden);
    }
  }
}
