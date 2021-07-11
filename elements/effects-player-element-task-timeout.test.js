import { expect, assert } from '@esm-bundle/chai';

import { EffectsPlayerElementTaskTimeout } from './effects-player-element-task-timeout.js';
import { EffectsPlayerElementTaskError } from './effects-player-element-task-error.js';

describe('effects-player-element-task-timeout', () => {
  function setup() {
    let timing = new AbortController();
    let timeout = new EffectsPlayerElementTaskTimeout(timing.signal);
    let setTimeout = timeout.set();

    return { timing, setTimeout };
  }

  it('resolves when timeout ended', async () => {
    let { setTimeout } = setup();
    let value = await setTimeout;

    expect(value).to.equal(undefined);
  });

  it('rejects when task aborted', async () => {
    let { timing, setTimeout } = setup();

    timing.abort();

    try {
      await setTimeout;
      assert.fail();
    } catch (error) {
      expect(error).to.instanceOf(EffectsPlayerElementTaskError);
      expect(error.message).to.equal('Timeout is aborted');
    }
  });
});
