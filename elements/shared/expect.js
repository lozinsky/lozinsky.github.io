import { assert } from './assert.js';

/**
 * @template T
 *
 * @param {T | null | undefined} value
 * @param {string=} message
 *
 * @returns {NonNullable<T>}
 */
export function expectToBeDefined(value, message) {
  assert(value !== null && value !== undefined, message ?? 'Expected value to be defined');

  return value;
}
