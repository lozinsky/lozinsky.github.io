import { expectToBeDefined } from './expect.js';

/**
 * @param {number} duration
 * @param {{ signal?: AbortSignal }=} options
 *
 * @returns {Promise<void>}
 */
export async function delay(duration, { signal } = {}) {
  await promisify(
    (resolve) => {
      const id = window.setTimeout(resolve, duration);

      return () => {
        window.clearTimeout(id);
      };
    },
    { signal },
  );
}

/**
 * @param {() => Promise<void>} task
 *
 * @returns {Promise<void>}
 */
export async function loop(task) {
  while (true) {
    try {
      await task();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      throw error;
    }
  }
}

/**
 * @param {number} total
 * @param {() => Promise<void>} task
 *
 * @returns {Promise<void>}
 */
export async function parallel(total, task) {
  /** @type {Array<Promise<void>>} */
  const promises = [];

  for (let index = 0; index < total; index++) {
    promises.push(task());
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return;
    }

    throw error;
  }
}

/**
 * @template [T=unknown]
 *
 * @param {(resolve: (value: T) => void) => () => void} executor
 * @param {{ signal?: AbortSignal }=} options
 *
 * @returns {Promise<T>}
 */
export async function promisify(executor, { signal } = {}) {
  /** @type {T} */
  const value = await new Promise((resolve, reject) => {
    if (signal === undefined) {
      executor(resolve);
      return;
    }

    if (signal.aborted) {
      abort();
      return;
    }

    /**
     * @returns {void}
     */
    function abort() {
      reject(expectToBeDefined(signal).reason);
    }

    /**
     * @returns {void}
     */
    function handleAbort() {
      cleanup();
      abort();
    }

    signal.addEventListener('abort', handleAbort, { once: true });

    const cleanup = executor((value) => {
      signal.removeEventListener('abort', handleAbort);
      resolve(value);
    });
  });

  return value;
}

/**
 * @template {Event} T
 *
 * @param {EventTarget} target
 * @param {string} type
 * @param {{ signal?: AbortSignal; filter?: (event: T) => boolean }=} options
 *
 * @returns {Promise<T>}
 */
export async function when(target, type, { filter, signal } = {}) {
  /** @type {T} */
  const event = await promisify(
    (resolve) => {
      /**
       * @param {Event} event
       *
       * @returns {void}
       */
      function handleType(event) {
        if (filter === undefined || filter(/** @type {T} */ (event))) {
          target.removeEventListener(type, handleType);
          resolve(/** @type {T} */ (event));
        }
      }

      target.addEventListener(type, handleType);

      return () => {
        target.removeEventListener(type, handleType);
      };
    },
    { signal },
  );

  return event;
}
