export class TimeAgoElement extends HTMLElement {
  /**
   * @type {string[]}
   */
  static get observedAttributes() {
    return ['date'];
  }

  /**
   * @param {string} name
   * @param {string | null} oldValue
   * @param {string | null} newValue
   *
   * @returns {void}
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && name === 'date') {
      this.#handleDateChange(new Date(newValue));
    }
  }

  /**
   * @type {Date}
   */
  get date() {
    return new Date(this.getAttribute('date'));
  }

  /**
   * @param {Date} value
   */
  set date(value) {
    this.setAttribute('date', value.toISOString());
  }

  /**
   * @param {Date} date
   *
   * @returns {void}
   */
  #handleDateChange(date) {
    this.textContent = this.#formatToTextContent(new Date().getTime() - date.getTime());
  }

  /**
   * @param {number} msec
   *
   * @returns {string}
   */
  #formatToTextContent(msec) {
    let sec = Math.floor(msec / 1000);
    let min = Math.floor(sec / 60);
    let hour = Math.floor(min / 60);
    let day = Math.floor(hour / 24);
    let week = Math.floor(day / 7);
    let month = Math.floor(week / 4);
    let year = Math.floor(month / 12);

    if (day < 7) {
      return this.#formatToLocaleUnit(day, 'day');
    }

    if (week < 4) {
      return this.#formatToLocaleUnit(week, 'week');
    }

    if (month < 12) {
      return this.#formatToLocaleUnit(month, 'month');
    }

    return this.#formatToLocaleUnit(year, 'year');
  }

  /**
   * @param {number} target
   * @param {string} unit
   *
   * @returns {string}
   */
  #formatToLocaleUnit(target, unit) {
    return target.toLocaleString(this.#closestLocale(), {
      unit,
      style: 'unit',
      unitDisplay: 'long',
    });
  }

  /**
   * @returns {string}
   */
  #closestLocale() {
    /** @type {HTMLElement} */
    let element = this.closest('[lang]');

    if (element === null) {
      return 'default';
    }

    return element.lang;
  }
}

customElements.define('time-ago', TimeAgoElement);
