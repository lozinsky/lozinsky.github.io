export class EffectsPlayerElementTaskError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);

    this.name = 'EffectsPlayerElementTaskError';
  }
}
