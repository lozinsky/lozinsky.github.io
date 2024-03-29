import { assert, expect } from '@esm-bundle/chai';
import { restoreAll, spy, spyOn } from 'tinyspy';

import { delay, loop, parallel, promisify, when } from './effects-player-element-async.js';

describe('effects-player-element-async', () => {
  afterEach(() => {
    restoreAll();
  });

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
      let task = spy(async () => {
        if (task.callCount === 2) {
          throw new DOMException('Aborted', 'AbortError');
        }
      });
      let promise = loop(task);

      await promise;

      expect(task.callCount).to.equal(2);
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
      let task = spy(async () => {});
      let promise = parallel(2, task);

      await promise;

      expect(task.callCount).to.equal(2);
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
      let promise = promisify(
        (resolve) => {
          resolve('value');

          return () => {};
        },
        { signal: new AbortController().signal },
      );

      expect(await promise).to.equal('value');
    });

    it('resolves when resolve is called earlier than abort', async () => {
      let abortController = new AbortController();
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
      let cleanup = spy();
      let abortController = new AbortController();
      let promise = promisify(
        (resolve) => {
          resolve();

          return cleanup;
        },
        { signal: abortController.signal },
      );

      abortController.abort();
      await promise;

      expect(cleanup.callCount).to.equal(0);
    });

    it('rejects when signal is aborted', async () => {
      let abortController = new AbortController();
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
      let cleanup = spy();
      let abortController = new AbortController();
      let promise = promisify(
        () => {
          return cleanup;
        },
        { signal: abortController.signal },
      );

      abortController.abort();
      await promise.catch(() => {});

      expect(cleanup.callCount).to.equal(1);
    });

    it('rejects when signal is already aborted', async () => {
      let promise = promisify(
        () => {
          return () => {};
        },
        { signal: AbortSignal.abort() },
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
      let cleanup = spy();
      let promise = promisify(
        () => {
          return cleanup;
        },
        { signal: AbortSignal.abort() },
      );

      await promise.catch(() => {});

      expect(cleanup.callCount).to.equal(0);
    });

    it('does not execute when signal is already aborted', async () => {
      let executor = spy(() => {
        return () => {};
      });
      let promise = promisify(executor, { signal: AbortSignal.abort() });

      await promise.catch(() => {});

      expect(executor.callCount).to.equal(0);
    });
  });

  describe('delay', () => {
    it('resolves on timeout when signal is not provided', async () => {
      let promise = delay(10);

      expect(await promise).to.equal(undefined);
    });

    it('resolves on timeout when signal is provided', async () => {
      let promise = delay(10, { signal: new AbortController().signal });

      expect(await promise).to.equal(undefined);
    });

    it('rejects when signal is aborted', async () => {
      let abortController = new AbortController();
      let promise = delay(10, { signal: abortController.signal });

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
      let setTimeout = spyOn(window, 'setTimeout');
      let clearTimeout = spyOn(window, 'clearTimeout');
      let abortController = new AbortController();
      let promise = delay(10, { signal: abortController.signal });

      abortController.abort();
      await promise.catch(() => {});

      expect(clearTimeout.callCount).to.equal(1);
      expect(clearTimeout.calls).to.deep.equal([setTimeout.returns]);
    });

    it('rejects when signal is already aborted', async () => {
      let promise = delay(10, { signal: AbortSignal.abort() });

      try {
        await promise;
        assert.fail();
      } catch (error) {
        expect(error).to.instanceOf(DOMException);
        expect(error.name).to.equal('AbortError');
      }
    });

    it('does not clear timeout when signal is already aborted', async () => {
      let clearTimeout = spyOn(window, 'clearTimeout');
      let promise = delay(10, { signal: AbortSignal.abort() });

      await promise.catch(() => {});

      expect(clearTimeout.callCount).to.equal(0);
    });

    it('does not set timeout when signal is already aborted', async () => {
      let setTimeout = spyOn(window, 'setTimeout');
      let promise = delay(10, { signal: AbortSignal.abort() });

      await promise.catch(() => {});

      expect(setTimeout.callCount).to.equal(0);
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
      let filter = spy(() => true);
      let abortController = new AbortController();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { filter, signal: abortController.signal });
      let timeout = delay(100, { signal: abortController.signal });

      eventTarget.dispatchEvent(event);

      expect(filter.calls).to.deep.equal([[event]]);
      expect(await Promise.race([promise, timeout])).to.equal(event);

      abortController.abort();
    });

    it('does not resolve on event when filter returns "false"', async () => {
      let filter = spy(() => false);
      let abortController = new AbortController();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { filter, signal: abortController.signal });
      let timeout = delay(100, { signal: abortController.signal });

      eventTarget.dispatchEvent(event);

      expect(filter.calls).to.deep.equal([[event]]);
      expect(await Promise.race([promise, timeout])).to.equal(undefined);

      abortController.abort();
    });

    it('resolves on event when signal is provided', async () => {
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { signal: new AbortController().signal });

      eventTarget.dispatchEvent(event);

      expect(await promise).to.equal(event);
    });

    it('removes event listener on event', async () => {
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let addEventListener = spyOn(eventTarget, 'addEventListener');
      let removeEventListener = spyOn(eventTarget, 'removeEventListener');
      let promise = when(eventTarget, 'event');

      eventTarget.dispatchEvent(event);
      await promise;

      expect(removeEventListener.callCount).to.equal(1);
      expect(removeEventListener.calls).to.deep.equal(addEventListener.calls);
    });

    it('rejects when signal is aborted', async () => {
      let abortController = new AbortController();
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
      let abortController = new AbortController();
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let addEventListener = spyOn(eventTarget, 'addEventListener');
      let removeEventListener = spyOn(eventTarget, 'removeEventListener');
      let promise = when(eventTarget, 'event', { signal: abortController.signal });

      abortController.abort();
      eventTarget.dispatchEvent(event);
      await promise.catch(() => {});

      expect(removeEventListener.callCount).to.equal(1);
      expect(removeEventListener.calls).to.deep.equal(addEventListener.calls);
    });

    it('rejects when signal is already aborted', async () => {
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let promise = when(eventTarget, 'event', { signal: AbortSignal.abort() });

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
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let removeEventListener = spyOn(eventTarget, 'removeEventListener');
      let promise = when(eventTarget, 'event', { signal: AbortSignal.abort() });

      eventTarget.dispatchEvent(event);
      await promise.catch(() => {});

      expect(removeEventListener.callCount).to.equal(0);
    });

    it('does not add event listener when signal is already aborted', async () => {
      let eventTarget = new EventTarget();
      let event = new Event('event');
      let addEventListener = spyOn(eventTarget, 'addEventListener');
      let promise = when(eventTarget, 'event', { signal: AbortSignal.abort() });

      eventTarget.dispatchEvent(event);
      await promise.catch(() => {});

      expect(addEventListener.callCount).to.equal(0);
    });
  });
});
