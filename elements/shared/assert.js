class AssertionError extends Error {
  /**
   * @param {string=} message
   */
  constructor(message) {
    super(message);

    this.name = 'AssertionError';
  }
}

/**
 * @param {boolean} condition
 * @param {string=} message
 *
 * @returns {asserts condition}
 */
export function assert(condition, message) {
  if (!condition) {
    throw new AssertionError(message ?? 'Expected condition to be true');
  }
}
