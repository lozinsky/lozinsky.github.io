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
  let promises = [];

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
 * @template T
 *
 * @param {(resolve: (value: T) => void) => () => void} executor
 * @param {{ signal?: AbortSignal }=} options
 *
 * @returns {Promise<T>}
 */
export async function promisify(executor, { signal } = {}) {
  /** @type {T} */
  let value = await new Promise((resolve, reject) => {
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
      reject(new DOMException('Aborted', 'AbortError'));
    }

    /**
     * @returns {void}
     */
    function handleAbort() {
      cleanup();
      abort();
    }

    signal.addEventListener('abort', handleAbort, { once: true });

    let cleanup = executor((value) => {
      signal.removeEventListener('abort', handleAbort);
      resolve(value);
    });
  });

  return value;
}

/**
 *
 * @param {number} duration
 * @param {{ signal?: AbortSignal }=} options
 *
 * @returns {Promise<void>}
 */
export async function delay(duration, { signal } = {}) {
  await promisify(
    (resolve) => {
      let id = window.setTimeout(resolve, duration);

      return () => {
        window.clearTimeout(id);
      };
    },
    { signal },
  );
}

/**
 *
 * @param {{ signal?: AbortSignal }=} options
 *
 * @returns {Promise<void>}
 */
export async function nextFrame({ signal } = {}) {
  await promisify(
    (resolve) => {
      let handle = window.requestAnimationFrame(resolve);

      return () => {
        window.cancelAnimationFrame(handle);
      };
    },
    { signal },
  );
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
export async function when(target, type, { signal, filter } = {}) {
  /** @type {T} */
  let event = await promisify(
    (resolve) => {
      /**
       * @param {T} event
       *
       * @returns {void}
       */
      function handleType(event) {
        if (filter === undefined || filter(event)) {
          target.removeEventListener(type, handleType);
          resolve(event);
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
