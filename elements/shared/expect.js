import { assert } from './assert.js';

/**
 * @template T
 *
 * @param {T} value
 * @param {string=} message
 *
 * @returns {NonNullable<T>}
 */
export function expectToBeDefined(value, message) {
  assert(value != null, message ?? 'Expected value to be defined');

  return value;
}
