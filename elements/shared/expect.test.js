import { describe, expect, it } from 'vitest';

import { expectToBeDefined } from './expect.js';

describe('expectToBeDefined', () => {
  it('returns value and does not throw if value is not "null" or "undefined"', () => {
    expect(expectToBeDefined('value')).toBe('value');
  });

  it('returns value and does not throw if value is not "null" or "undefined"', () => {
    expect(expectToBeDefined(0)).toBe(0);
  });

  it('returns value and does not throw if value is not "null" or "undefined"', () => {
    expect(expectToBeDefined(false)).toBe(false);
  });

  it('does not return value and throws if value is "null"', () => {
    expect(() => {
      expectToBeDefined(null);
    }).toThrowError('Expected value to be defined');
  });

  it('does not return value and throws if value is "null" with message', () => {
    expect(() => {
      expectToBeDefined(null, 'Message');
    }).toThrowError('Message');
  });

  it('does not return value and throws if value is "undefined"', () => {
    expect(() => {
      expectToBeDefined(undefined);
    }).toThrowError('Expected value to be defined');
  });

  it('does not return value and throws if value is "undefined" with message', () => {
    expect(() => {
      expectToBeDefined(undefined, 'Message');
    }).toThrowError('Message');
  });
});
