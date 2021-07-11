import { expect, assert } from '@esm-bundle/chai';

import { EffectsPlayerElementTaskTransition } from './effects-player-element-task-transition.js';
import { EffectsPlayerElementTaskError } from './effects-player-element-task-error.js';

describe('effects-player-element-task-transition', () => {
  function setup() {
    let transitioning = new AbortController();
    let element = document.createElement('div');
    let transition = new EffectsPlayerElementTaskTransition(transitioning.signal);
    let transitionEnd = transition.end(element);

    return { transitioning, transitionEnd, element };
  }

  it('resolves when transition ended', async () => {
    let { transitionEnd, element } = setup();

    element.dispatchEvent(new Event('transitionend', { bubbles: true }));

    let value = await transitionEnd;

    expect(value).to.equal(undefined);
  });

  it('rejects when task aborted', async () => {
    let { transitioning, transitionEnd, element } = setup();

    transitioning.abort();
    element.dispatchEvent(new Event('transitionend', { bubbles: true }));

    try {
      await transitionEnd;
      assert.fail();
    } catch (error) {
      expect(error).to.instanceOf(EffectsPlayerElementTaskError);
      expect(error.message).to.equal('Transition is aborted');
    }
  });
});
