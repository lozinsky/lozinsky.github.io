import { expect, it } from 'vitest';

import { assert } from './assert.js';

it('does not throw if condition is "true"', () => {
  expect(() => {
    assert(true);
  }).not.toThrow();
});

it('throws if condition is "false"', () => {
  expect(() => {
    assert(false);
  }).toThrowError('Expected condition to be true');
});

it('throws if condition is "false" with message', () => {
  expect(() => {
    assert(false, 'Message');
  }).toThrowError('Message');
});
