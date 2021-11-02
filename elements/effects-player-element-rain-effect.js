import { EffectsPlayerElementEffect } from './effects-player-element-effect.js';
import { range, takeAny } from './effects-player-element-random.js';
import { EffectsPlayerElementTask } from './effects-player-element-task.js';

export class EffectsPlayerElementRainEffect extends EffectsPlayerElementEffect {
  /**
   * @type {string}
   */
  #droplet;
  /**
   * @type {number}
   */
  #slope;
  /**
   * @type {number}
   */
  #transitionDuration;
  /**
   * @type {number}
   */
  #minStartDelay;
  /**
   * @type {number}
   */
  #maxStartDelay;

  constructor() {
    super();

    this.#droplet = '\u{1f4a7}';
    this.#slope = takeAny([-200, 200]);
    this.#transitionDuration = range(500, 1000);
    this.#minStartDelay = 1;
    this.#maxStartDelay = 5000;
  }

  /**
   * @override
   *
   * @type {number}
   */
  get times() {
    return window.innerWidth / 2;
  }

  /**
   * @override
   *
   * @returns {HTMLElement}
   */
  init() {
    let droplet = document.createElement('span');

    droplet.textContent = this.#droplet;
    droplet.style.left = '0';
    droplet.style.pointerEvents = 'none';
    droplet.style.position = 'fixed';
    droplet.style.top = '0';
    droplet.style.transform = 'translate(var(--droplet-x), var(--droplet-y)) rotate(var(--droplet-angle))';
    droplet.style.transitionProperty = 'transform';
    droplet.style.transitionTimingFunction = 'linear';
    droplet.style.visibility = 'hidden';

    return droplet;
  }

  /**
   * @override
   *
   * @param {HTMLElement} droplet
   * @param {EffectsPlayerElementTask} task
   *
   * @returns {Promise<void>}
   */
  async draw(droplet, task) {
    let startDelay = range(this.#minStartDelay, this.#maxStartDelay);
    let startX = range(-Math.abs(this.#slope), window.innerWidth);
    let startY = -droplet.offsetHeight;
    let endX = startX - this.#slope;
    let endY = window.innerHeight;
    let angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI - 90;

    droplet.style.transitionDuration = `${startDelay}ms`;
    droplet.style.setProperty('--droplet-x', `${startX}px`);
    droplet.style.setProperty('--droplet-y', `${startY}px`);
    droplet.style.setProperty('--droplet-angle', `${angle}deg`);

    await task.transitionEnd(droplet);

    droplet.style.visibility = '';
    droplet.style.transitionDuration = `${this.#transitionDuration}ms`;
    droplet.style.setProperty('--droplet-x', `${endX}px`);
    droplet.style.setProperty('--droplet-y', `${endY}px`);

    await task.transitionEnd(droplet);
  }
}
