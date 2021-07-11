/**
 * @param {number} min
 * @param {number} max
 *
 * @returns {number}
 */
export function range(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * @template T
 *
 * @param {T[]} items
 *
 * @returns {T}
 */
export function takeAny(items) {
  if (items.length === 0) {
    throw new Error('Cannot take an item from an empty array');
  }

  return items[Math.floor(Math.random() * items.length)];
}
