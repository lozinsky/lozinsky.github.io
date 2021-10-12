import { expect } from '@esm-bundle/chai';
import { useFakeTimers } from 'sinon';

import { TimeAgoElement } from './time-ago-element.js';

describe('time-ago-element', () => {
  let root = document.body;

  beforeEach(() => {
    document.documentElement.lang = 'en';

    useFakeTimers({
      now: new Date('2021-07-05T12:00:00.000Z').getTime(),
      shouldAdvanceTime: true,
    });
  });

  afterEach(() => {
    root.innerHTML = '';
  });

  /**
   * @param {string} template
   */
  function setup(template) {
    root.innerHTML = template;

    /** @type {TimeAgoElement} */
    let timeAgo = root.querySelector('time-ago');

    return { timeAgo };
  }

  for (let [date, expected] of [
    ['2021-07-05T12:00:00.000Z', '0 days'],
    ['2021-07-04T12:00:00.000Z', '1 day'],
    ['2021-06-29T12:00:00.000Z', '6 days'],
    ['2021-06-28T12:00:00.000Z', '1 week'],
    ['2021-06-14T12:00:00.000Z', '3 weeks'],
    ['2021-06-05T12:00:00.000Z', '1 month'],
    ['2020-08-05T12:00:00.000Z', '11 months'],
    ['2020-07-05T12:00:00.000Z', '1 year'],
    ['2009-07-05T12:00:00.000Z', '13 years'],
  ]) {
    it(`assigns text content "${expected}" when "date" is "${date}"`, () => {
      let { timeAgo } = setup(/* HTML */ `<time-ago date="${date}"></time-ago>`);

      expect(timeAgo.textContent).to.equal(expected);
    });
  }

  it('assigns new text content when "date" is changed', () => {
    let { timeAgo } = setup(/* HTML */ `<time-ago date="2021-07-05T12:00:00.000Z"></time-ago>`);

    timeAgo.date = new Date('2019-07-05T12:00:00.000Z');

    expect(timeAgo.textContent).to.equal('2 years');
  });
});
