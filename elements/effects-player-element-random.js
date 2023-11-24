/**
 * @param {number} min
 * @param {number} max
 *
 * @returns {number}
 */
export function getInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * @template T
 *
 * @param {T[]} target
 *
 * @returns {T}
 */
export function getSample(target) {
  if (target.length === 0) {
    throw new RangeError('Target must not be empty');
  }

  return target[Math.floor(Math.random() * target.length)];
}
