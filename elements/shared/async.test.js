import { describe, expect, it, vi } from 'vitest';

import { delay, loop, parallel, promisify, when } from './async.js';

describe('loop', () => {
  it('resolves when task throws "AbortError"', async () => {
    const promise = loop(async () => {
      throw new DOMException('Aborted', 'AbortError');
    });

    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects when task throws an error', async () => {
    const promise = loop(async () => {
      throw new Error('Error');
    });

    await expect(promise).rejects.toThrowError('Error');
  });

  it('runs task twice', async () => {
    const task = vi.fn(async () => {
      if (task.mock.calls.length === 2) {
        throw new DOMException('Aborted', 'AbortError');
      }
    });
    const promise = loop(task);

    await promise;

    expect(task).toBeCalledTimes(2);
  });
});

describe('parallel', () => {
  it('resolves when task throws "AbortError"', async () => {
    const promise = parallel(2, async () => {
      throw new DOMException('Aborted', 'AbortError');
    });

    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects when task throws an error', async () => {
    const promise = parallel(2, async () => {
      throw new Error('Error');
    });

    await expect(promise).rejects.toThrowError('Error');
  });

  it('runs task twice', async () => {
    const task = vi.fn(async () => {});
    const promise = parallel(2, task);

    await promise;

    expect(task).toBeCalledTimes(2);
  });
});

describe('promisify', () => {
  it('resolves when resolve is called and signal is not provided', async () => {
    /**
     * @type {Promise<string>}
     */
    const promise = promisify((resolve) => {
      resolve('value');

      return () => {};
    });

    await expect(promise).resolves.toBe('value');
  });

  it('resolves when resolve is called and signal is provided', async () => {
    const promise = promisify(
      (resolve) => {
        resolve('value');

        return () => {};
      },
      { signal: new AbortController().signal },
    );

    await expect(promise).resolves.toBe('value');
  });

  it('resolves when resolve is called earlier than abort', async () => {
    const abortController = new AbortController();
    /**
     * @type {Promise<void>}
     */
    const promise = promisify(
      (resolve) => {
        resolve();

        return () => {};
      },
      { signal: abortController.signal },
    );

    abortController.abort();

    await expect(promise).resolves.toBeUndefined();
  });

  it('does not cleanup when resolve is called earlier than abort', async () => {
    const cleanup = vi.fn();
    const abortController = new AbortController();
    /**
     * @type {Promise<void>}
     */
    const promise = promisify(
      (resolve) => {
        resolve();

        return cleanup;
      },
      { signal: abortController.signal },
    );

    abortController.abort();
    await promise;

    expect(cleanup).not.toBeCalled();
  });

  it('rejects when signal is aborted', async () => {
    const abortController = new AbortController();
    const promise = promisify(
      () => {
        return () => {};
      },
      { signal: abortController.signal },
    );

    abortController.abort();

    await expect(promise).rejects.toThrowError('signal is aborted without reason');
  });

  it('cleanups when signal is aborted', async () => {
    const cleanup = vi.fn();
    const abortController = new AbortController();
    const promise = promisify(
      () => {
        return cleanup;
      },
      { signal: abortController.signal },
    );

    abortController.abort();
    await promise.catch(() => {});

    expect(cleanup).toBeCalledTimes(1);
  });

  it('rejects when signal is already aborted', async () => {
    const promise = promisify(
      () => {
        return () => {};
      },
      { signal: AbortSignal.abort() },
    );

    await expect(promise).rejects.toThrowError('signal is aborted without reason');
  });

  it('does not cleanup when signal is already aborted', async () => {
    const cleanup = vi.fn();
    const promise = promisify(
      () => {
        return cleanup;
      },
      { signal: AbortSignal.abort() },
    );

    await promise.catch(() => {});

    expect(cleanup).not.toBeCalled();
  });

  it('does not execute when signal is already aborted', async () => {
    const executor = vi.fn(() => {
      return () => {};
    });
    const promise = promisify(executor, { signal: AbortSignal.abort() });

    await promise.catch(() => {});

    expect(executor).not.toBeCalled();
  });
});

describe('delay', () => {
  it('resolves on timeout when signal is not provided', async () => {
    const promise = delay(10);

    await expect(promise).resolves.toBeUndefined();
  });

  it('resolves on timeout when signal is provided', async () => {
    const promise = delay(10, { signal: new AbortController().signal });

    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects when signal is aborted', async () => {
    const abortController = new AbortController();
    const promise = delay(10, { signal: abortController.signal });

    abortController.abort();

    await expect(promise).rejects.toThrowError('signal is aborted without reason');
  });

  it('clears timeout when signal is aborted', async () => {
    const setTimeout = vi.spyOn(window, 'setTimeout');
    const clearTimeout = vi.spyOn(window, 'clearTimeout');
    const abortController = new AbortController();
    const promise = delay(10, { signal: abortController.signal });

    abortController.abort();
    await promise.catch(() => {});

    expect(clearTimeout).toBeCalledTimes(1);
    expect(clearTimeout.mock.calls).toEqual([
      setTimeout.mock.results.map((result) => /** @type {unknown} */ (result.value)),
    ]);
  });

  it('rejects when signal is already aborted', async () => {
    const promise = delay(10, { signal: AbortSignal.abort() });

    await expect(promise).rejects.toThrowError('signal is aborted without reason');
  });

  it('does not clear timeout when signal is already aborted', async () => {
    const clearTimeout = vi.spyOn(window, 'clearTimeout');
    const promise = delay(10, { signal: AbortSignal.abort() });

    await promise.catch(() => {});

    expect(clearTimeout).not.toBeCalled();
  });

  it('does not set timeout when signal is already aborted', async () => {
    const setTimeout = vi.spyOn(window, 'setTimeout');
    const promise = delay(10, { signal: AbortSignal.abort() });

    await promise.catch(() => {});

    expect(setTimeout).not.toBeCalled();
  });
});

describe('when', () => {
  it('resolves on event when signal is not provided', async () => {
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const promise = when(eventTarget, 'event');

    eventTarget.dispatchEvent(event);

    await expect(promise).resolves.toBe(event);
  });

  it('resolves on event when filter returns "true"', async () => {
    const filter = vi.fn(() => true);
    const abortController = new AbortController();
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const promise = when(eventTarget, 'event', { filter, signal: abortController.signal });
    const timeout = delay(100, { signal: abortController.signal });

    eventTarget.dispatchEvent(event);

    expect(filter).toBeCalledWith(event);
    await expect(Promise.race([promise, timeout])).resolves.toBe(event);

    abortController.abort();
  });

  it('does not resolve on event when filter returns "false"', async () => {
    const filter = vi.fn(() => false);
    const abortController = new AbortController();
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const promise = when(eventTarget, 'event', { filter, signal: abortController.signal });
    const timeout = delay(100, { signal: abortController.signal });

    eventTarget.dispatchEvent(event);

    expect(filter).toBeCalledWith(event);
    await expect(Promise.race([promise, timeout])).resolves.toBeUndefined();

    abortController.abort();
  });

  it('resolves on event when signal is provided', async () => {
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const promise = when(eventTarget, 'event', { signal: new AbortController().signal });

    eventTarget.dispatchEvent(event);

    await expect(promise).resolves.toBe(event);
  });

  it('removes event listener on event', async () => {
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const addEventListener = vi.spyOn(eventTarget, 'addEventListener');
    const removeEventListener = vi.spyOn(eventTarget, 'removeEventListener');
    const promise = when(eventTarget, 'event');

    eventTarget.dispatchEvent(event);
    await promise;

    expect(removeEventListener).toBeCalledTimes(1);
    expect(removeEventListener.mock.calls).toEqual(addEventListener.mock.calls);
  });

  it('rejects when signal is aborted', async () => {
    const abortController = new AbortController();
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const promise = when(eventTarget, 'event', { signal: abortController.signal });

    abortController.abort();
    eventTarget.dispatchEvent(event);

    await expect(promise).rejects.toThrowError('signal is aborted without reason');
  });

  it('removes event listener when signal is aborted', async () => {
    const abortController = new AbortController();
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const addEventListener = vi.spyOn(eventTarget, 'addEventListener');
    const removeEventListener = vi.spyOn(eventTarget, 'removeEventListener');
    const promise = when(eventTarget, 'event', { signal: abortController.signal });

    abortController.abort();
    eventTarget.dispatchEvent(event);
    await promise.catch(() => {});

    expect(removeEventListener).toBeCalledTimes(1);
    expect(removeEventListener.mock.calls).toEqual(addEventListener.mock.calls);
  });

  it('rejects when signal is already aborted', async () => {
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const promise = when(eventTarget, 'event', { signal: AbortSignal.abort() });

    eventTarget.dispatchEvent(event);

    await expect(promise).rejects.toThrowError('signal is aborted without reason');
  });

  it('does not remove event listener when signal is already aborted', async () => {
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const removeEventListener = vi.spyOn(eventTarget, 'removeEventListener');
    const promise = when(eventTarget, 'event', { signal: AbortSignal.abort() });

    eventTarget.dispatchEvent(event);
    await promise.catch(() => {});

    expect(removeEventListener).not.toBeCalled();
  });

  it('does not add event listener when signal is already aborted', async () => {
    const eventTarget = new EventTarget();
    const event = new Event('event');
    const addEventListener = vi.spyOn(eventTarget, 'addEventListener');
    const promise = when(eventTarget, 'event', { signal: AbortSignal.abort() });

    eventTarget.dispatchEvent(event);
    await promise.catch(() => {});

    expect(addEventListener).not.toBeCalled();
  });
});
