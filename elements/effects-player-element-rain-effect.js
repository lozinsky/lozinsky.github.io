import { EffectsPlayerElementEffect } from './effects-player-element-effect.js';
import { range, takeAny } from './effects-player-element-random.js';

const DROPLET = '\u{1f4a7}';
const SLOPES = [-200, 200];
const MIN_TRANSITION_DURATION = 500;
const MAX_TRANSITION_DURATION = 1000;
const MIN_START_DELAY = 1;
const MAX_START_DELAY = 5000;

class EffectsPlayerElementRainEffect extends EffectsPlayerElementEffect {
  /**
   * @type {number}
   */
  #slope;
  /**
   * @type {number}
   */
  #transitionDuration;

  constructor() {
    super();

    this.#slope = takeAny(SLOPES);
    this.#transitionDuration = range(MIN_TRANSITION_DURATION, MAX_TRANSITION_DURATION);
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

    droplet.textContent = DROPLET;
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
   * @param {import('./effects-player-element-task').EffectsPlayerElementTask} task
   *
   * @returns {Promise<void>}
   */
  async draw(droplet, task) {
    let startDelay = range(MIN_START_DELAY, MAX_START_DELAY);
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

/**
 * @returns {EffectsPlayerElementEffect}
 */
export function create() {
  return new EffectsPlayerElementRainEffect();
}
