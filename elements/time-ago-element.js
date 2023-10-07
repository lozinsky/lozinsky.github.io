const MSECS_PER_SEC = 1000;
const SECS_PER_MIN = 60;
const MINS_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;
const DAYS_PER_YEAR = 365;
const MONTHS_PER_YEAR = 12;
const WEEKS_PER_MONTH = DAYS_PER_YEAR / DAYS_PER_WEEK / MONTHS_PER_YEAR;

export class TimeAgoElement extends HTMLElement {
  static {
    customElements.define('time-ago', this);
  }

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
    this.textContent = this.#formatToTextContent(Date.now() - date.getTime());
  }

  /**
   * @param {number} msec
   *
   * @returns {string}
   */
  #formatToTextContent(msec) {
    let sec = msec / MSECS_PER_SEC;
    let min = sec / SECS_PER_MIN;
    let hour = min / MINS_PER_HOUR;
    let day = hour / HOURS_PER_DAY;
    let week = day / DAYS_PER_WEEK;
    let month = week / WEEKS_PER_MONTH;
    let year = month / MONTHS_PER_YEAR;

    if (day < DAYS_PER_WEEK) {
      return this.#formatToLocaleUnit(day, 'day');
    }

    if (week < WEEKS_PER_MONTH) {
      return this.#formatToLocaleUnit(week, 'week');
    }

    if (month < MONTHS_PER_YEAR) {
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
    return Math.floor(target).toLocaleString(this.#closestLocale(), {
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
