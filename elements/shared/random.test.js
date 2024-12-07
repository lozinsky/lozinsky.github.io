import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getInteger, getSample } from './random.js';

beforeEach(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
});

describe('getInteger', () => {
  it.each([
    [0, 100, 50],
    [-100, 0, -50],
    [-100, 100, 0],
  ])('returns random number', (min, max, expected) => {
    expect(getInteger(min, max)).toBe(expected);
  });
});

describe('getSample', () => {
  it.each([
    [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 6],
    [[10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 5],
  ])('returns random array item', (target, expected) => {
    expect(getSample(target)).toBe(expected);
  });
});
