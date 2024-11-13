import './time-ago-element.js';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('time-ago-element', () => {
  let root = document.body;

  beforeEach(() => {
    document.documentElement.lang = 'en';

    vi.useFakeTimers({ now: new Date('2021-07-05T12:00:00.000Z') });
  });

  afterEach(() => {
    root.innerHTML = '';
  });

  /**
   * @param {string} template
   */
  function setup(template) {
    root.innerHTML = template;

    /** @type {import('./time-ago-element').TimeAgoElement} */
    let timeAgo = root.querySelector('time-ago');

    return { timeAgo };
  }

  for (let [date, expected] of [
    ['2021-07-05T12:00:00.000Z', '0 days'],
    ['2021-07-04T12:00:00.000Z', '1 day'],
    ['2021-06-29T12:00:00.000Z', '6 days'],
    ['2021-06-28T12:00:00.000Z', '1 week'],
    ['2021-06-05T12:00:00.000Z', '4 weeks'],
    ['2021-06-04T12:00:00.000Z', '1 month'],
    ['2020-08-04T12:00:00.000Z', '11 months'],
    ['2020-07-05T12:00:00.000Z', '1 year'],
    ['2009-07-05T12:00:00.000Z', '12 years'],
  ]) {
    it(`assigns text content "${expected}" when "date" is "${date}"`, () => {
      let { timeAgo } = setup(/* HTML */ `<time-ago date="${date}"></time-ago>`);

      expect(timeAgo.textContent).toBe(expected);
    });
  }

  it('assigns new text content when "date" is changed', () => {
    let { timeAgo } = setup(/* HTML */ `<time-ago date="2021-07-05T12:00:00.000Z"></time-ago>`);

    timeAgo.date = new Date('2019-07-05T12:00:00.000Z');

    expect(timeAgo.textContent).toBe('2 years');
  });
});
