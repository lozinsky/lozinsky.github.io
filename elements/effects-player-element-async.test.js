import { assert, expect } from '@esm-bundle/chai';
import { restoreAll, spy, spyOn } from 'tinyspy';

import { loop, parallel, promisify, setTimeout, when } from './effects-player-element-async.js';

describe('effects-player-element-async', () => {
  afterEach(() => {
    restoreAll();
  });

  class AbortControllerBuilder {
    /**
     * @type {AbortController}
     */
    #abortController;

    constructor() {
      this.#abortController = new AbortController();
    }

    abort() {
      this.#abortController.abort();
      return this;
    }

    build() {
      return this.#abortController;
    }
  }

  describe('loop', () => {
    it('resolves when task throws "AbortError"', async () => {
      let promise = loop(async () => {
        throw new DOMException('Aborted', 'AbortError');
      });

      expect(await promise).to.equal(undefined);
    });

    it('rejects when task throws an error', async () => {
      let promise = loop(async () => {
        throw new Error('Error');
      });

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(Error);
        expect(error.message).to.equal('Error');
      }
    });

    it('runs task twice', async () => {
      let taskSpy = spy(async () => {
        if (taskSpy.callCount === 2) {
          throw new DOMException('Aborted', 'AbortError');
        }
      });
      let promise = loop(taskSpy);

      await promise;

      expect(taskSpy.callCount).to.equal(2);
    });
  });

  describe('parallel', () => {
    it('resolves when task throws "AbortError"', async () => {
      let promise = parallel(2, async () => {
        throw new DOMException('Aborted', 'AbortError');
      });

      expect(await promise).to.equal(undefined);
    });

    it('rejects when task throws an error', async () => {
      let promise = parallel(2, async () => {
        throw new Error('Error');
      });

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(Error);
        expect(error.message).to.equal('Error');
      }
    });

    it('runs task twice', async () => {
      let taskSpy = spy(async () => {});
      let promise = parallel(2, taskSpy);

      await promise;

      expect(taskSpy.callCount).to.equal(2);
    });
  });

  describe('promisify', () => {
    it('resolves when resolve is called and signal is not provided', async () => {
      let promise = promisify((resolve) => {
        resolve('value');

        return () => {};
      });

      expect(await promise).to.equal('value');
    });

    it('resolves when resolve is called and signal is provided', async () => {
      let abortController = new AbortControllerBuilder().build();
      let promise = promisify(
        (resolve) => {
          resolve('value');

          return () => {};
        },
        { signal: abortController.signal },
      );

      expect(await promise).to.equal('value');
    });

    it('resolves when resolve is called earlier than abort', async () => {
      let abortController = new AbortControllerBuilder().build();
      let promise = promisify(
        (resolve) => {
          resolve();

          return () => {};
        },
        { signal: abortController.signal },
      );

      abortController.abort();

      expect(await promise).to.equal(undefined);
    });

    it('does not cleanup when resolve is called earlier than abort', async () => {
      let cleanupSpy = spy();
      let abortController = new AbortControllerBuilder().build();
      let promise = promisify(
        (resolve) => {
          resolve();

          return cleanupSpy;
        },
        { signal: abortController.signal },
      );

      abortController.abort();
      await promise;

      expect(cleanupSpy.callCount).to.equal(0);
    });

    it('rejects when signal is aborted', async () => {
      let abortController = new AbortControllerBuilder().build();
      let promise = promisify(
        () => {
          return () => {};
        },
        { signal: abortController.signal },
      );

      abortController.abort();

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(DOMException);
        expect(error.name).to.equal('AbortError');
      }
    });

    it('cleanups when signal is aborted', async () => {
      let cleanupSpy = spy();
      let abortController = new AbortControllerBuilder().build();
      let promise = promisify(
        () => {
          return cleanupSpy;
        },
        { signal: abortController.signal },
      );

      abortController.abort();
      await promise.catch(() => {});

      expect(cleanupSpy.callCount).to.equal(1);
    });

    it('rejects when signal is already aborted', async () => {
      let abortController = new AbortControllerBuilder().abort().build();
      let promise = promisify(
        () => {
          return () => {};
        },
        { signal: abortController.signal },
      );

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(DOMException);
        expect(error.name).to.equal('AbortError');
      }
    });

    it('does not cleanup when signal is already aborted', async () => {
      let cleanupSpy = spy();
      let abortController = new AbortControllerBuilder().abort().build();
      let promise = promisify(
        () => {
          return cleanupSpy;
        },
        { signal: abortController.signal },
      );

      await promise.catch(() => {});

      expect(cleanupSpy.callCount).to.equal(0);
    });

    it('does not execute when signal is already aborted', async () => {
      let executorSpy = spy(() => {
        return () => {};
      });
      let abortController = new AbortControllerBuilder().abort().build();
      let promise = promisify(executorSpy, { signal: abortController.signal });

      await promise.catch(() => {});

      expect(executorSpy.callCount).to.equal(0);
    });
  });

  describe('setTimeout', () => {
    it('resolves on timeout when signal is not provided', async () => {
      let promise = setTimeout(10);

      expect(await promise).to.equal(undefined);
    });

    it('resolves on timeout when signal is provided', async () => {
      let abortController = new AbortControllerBuilder().build();
      let promise = setTimeout(10, { signal: abortController.signal });

      expect(await promise).to.equal(undefined);
    });

    it('rejects when signal is aborted', async () => {
      let abortController = new AbortControllerBuilder().build();
      let promise = setTimeout(10, { signal: abortController.signal });

      abortController.abort();

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(DOMException);
        expect(error.name).to.equal('AbortError');
      }
    });

    it('clears timeout when signal is aborted', async () => {
      let setTimeoutSpy = spyOn(window, 'setTimeout');
      let clearTimeoutSpy = spyOn(window, 'clearTimeout');
      let abortController = new AbortControllerBuilder().build();
      let promise = setTimeout(10, { signal: abortController.signal });

      abortController.abort();
      await promise.catch(() => {});

      expect(clearTimeoutSpy.callCount).to.equal(1);
      expect(clearTimeoutSpy.calls).to.deep.equal([setTimeoutSpy.returns]);
    });

    it('rejects when signal is already aborted', async () => {
      let abortController = new AbortControllerBuilder().abort().build();
      let promise = setTimeout(10, { signal: abortController.signal });

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(DOMException);
        expect(error.name).to.equal('AbortError');
      }
    });

    it('does not clear timeout when signal is already aborted', async () => {
      let clearTimeoutSpy = spyOn(window, 'clearTimeout');
      let abortController = new AbortControllerBuilder().abort().build();
      let promise = setTimeout(10, { signal: abortController.signal });

      await promise.catch(() => {});

      expect(clearTimeoutSpy.callCount).to.equal(0);
    });

    it('does not set timeout when signal is already aborted', async () => {
      let setTimeoutSpy = spyOn(window, 'setTimeout');
      let abortController = new AbortControllerBuilder().abort().build();
      let promise = setTimeout(10, { signal: abortController.signal });

      await promise.catch(() => {});

      expect(setTimeoutSpy.callCount).to.equal(0);
    });
  });

  describe('when', () => {
    it('resolves on event when signal is not provided', async () => {
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event');

      eventTarget.dispatchEvent(event);

      expect(await promise).to.equal(event);
    });

    it('resolves on event when filter returns "true"', async () => {
      let filterSpy = spy(() => true);
      let abortController = new AbortControllerBuilder().build();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { filter: filterSpy, signal: abortController.signal });
      let timeout = setTimeout(100, { signal: abortController.signal });

      eventTarget.dispatchEvent(event);

      expect(filterSpy.calls).to.deep.equal([[event]]);
      expect(await Promise.race([promise, timeout])).to.equal(event);

      abortController.abort();
    });

    it('does not resolve on event when filter returns "false"', async () => {
      let filterSpy = spy(() => false);
      let abortController = new AbortControllerBuilder().build();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { filter: filterSpy, signal: abortController.signal });
      let timeout = setTimeout(100, { signal: abortController.signal });

      eventTarget.dispatchEvent(event);

      expect(filterSpy.calls).to.deep.equal([[event]]);
      expect(await Promise.race([promise, timeout])).to.equal(undefined);

      abortController.abort();
    });

    it('resolves on event when signal is provided', async () => {
      let abortController = new AbortControllerBuilder().build();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { signal: abortController.signal });

      eventTarget.dispatchEvent(event);

      expect(await promise).to.equal(event);
    });

    it('removes event listener on event', async () => {
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let addEventListenerSpy = spyOn(eventTarget, 'addEventListener');
      let removeEventListenerSpy = spyOn(eventTarget, 'removeEventListener');
      let promise = when(eventTarget, 'event');

      eventTarget.dispatchEvent(event);
      await promise;

      expect(removeEventListenerSpy.callCount).to.equal(1);
      expect(removeEventListenerSpy.calls).to.deep.equal(addEventListenerSpy.calls);
    });

    it('rejects when signal is aborted', async () => {
      let abortController = new AbortControllerBuilder().build();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { signal: abortController.signal });

      abortController.abort();
      eventTarget.dispatchEvent(event);

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(DOMException);
        expect(error.name).to.equal('AbortError');
      }
    });

    it('removes event listener when signal is aborted', async () => {
      let abortController = new AbortControllerBuilder().build();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let addEventListenerSpy = spyOn(eventTarget, 'addEventListener');
      let removeEventListenerSpy = spyOn(eventTarget, 'removeEventListener');
      let promise = when(eventTarget, 'event', { signal: abortController.signal });

      abortController.abort();
      eventTarget.dispatchEvent(event);
      await promise.catch(() => {});

      expect(removeEventListenerSpy.callCount).to.equal(1);
      expect(removeEventListenerSpy.calls).to.deep.equal(addEventListenerSpy.calls);
    });

    it('rejects when signal is already aborted', async () => {
      let abortController = new AbortControllerBuilder().abort().build();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { signal: abortController.signal });

      eventTarget.dispatchEvent(event);

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(DOMException);
        expect(error.name).to.equal('AbortError');
      }
    });

    it('does not remove event listener when signal is already aborted', async () => {
      let abortController = new AbortControllerBuilder().abort().build();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let removeEventListenerSpy = spyOn(eventTarget, 'removeEventListener');
      let promise = when(eventTarget, 'event', { signal: abortController.signal });

      eventTarget.dispatchEvent(event);
      await promise.catch(() => {});

      expect(removeEventListenerSpy.callCount).to.equal(0);
    });

    it('does not add event listener when signal is already aborted', async () => {
      let abortController = new AbortControllerBuilder().abort().build();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let addEventListenerSpy = spyOn(eventTarget, 'addEventListener');
      let promise = when(eventTarget, 'event', { signal: abortController.signal });

      eventTarget.dispatchEvent(event);
      await promise.catch(() => {});

      expect(addEventListenerSpy.callCount).to.equal(0);
    });
  });
});
