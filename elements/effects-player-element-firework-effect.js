import { EffectsPlayerElementEffect } from './effects-player-element-effect.js';
import { range, takeAny } from './effects-player-element-random.js';
import { EffectsPlayerElementTask } from './effects-player-element-task.js';

const TAU = 2 * Math.PI;

export class EffectsPlayerElementFireworkEffect extends EffectsPlayerElementEffect {
  /**
   * @type {string[]}
   */
  #particles;
  /**
   * @type {number}
   */
  #viewportPadding;
  /**
   * @type {number}
   */
  #minCirclesQuantity;
  /**
   * @type {number}
   */
  #maxCirclesQuantity;
  /**
   * @type {number}
   */
  #minCirclesDensity;
  /**
   * @type {number}
   */
  #maxCirclesDensity;
  /**
   * @type {number}
   */
  #minStartDelay;
  /**
   * @type {number}
   */
  #maxStartDelay;
  /**
   * @type {number}
   */
  #minTransitionDuration;
  /**
   * @type {number}
   */
  #maxTransitionDuration;
  /**
   * @type {number}
   */
  #particleTransitionDuration;
  /**
   * @type {number}
   */
  #minHueRotateAngle;
  /**
   * @type {number}
   */
  #maxHueRotateAngle;
  /**
   * @type {number}
   */
  #minParticleBias;
  /**
   * @type {number}
   */
  #maxParticleBias;

  constructor() {
    super();

    this.#particles = ['\u{2728}', '\u{2b50}', '\u{1f31f}'];
    this.#viewportPadding = 100;
    this.#minCirclesQuantity = 5;
    this.#maxCirclesQuantity = 9;
    this.#minCirclesDensity = 2;
    this.#maxCirclesDensity = 4;
    this.#minStartDelay = 1;
    this.#maxStartDelay = 5000;
    this.#minTransitionDuration = 500;
    this.#maxTransitionDuration = 1000;
    this.#particleTransitionDuration = 1000;
    this.#minHueRotateAngle = 0;
    this.#maxHueRotateAngle = 360;
    this.#minParticleBias = -50;
    this.#maxParticleBias = 50;
  }

  /**
   * @override
   *
   * @type {number}
   */
  get times() {
    return 10;
  }

  /**
   * @override
   *
   * @returns {HTMLElement}
   */
  init() {
    let firework = document.createElement('span');
    let circlesQuantity = range(this.#minCirclesQuantity, this.#maxCirclesQuantity);
    let hueRotateAngle = range(this.#minHueRotateAngle, this.#maxHueRotateAngle);

    firework.style.fontSize = '0.5rem';
    firework.style.bottom = '0';
    firework.style.filter = `hue-rotate(${hueRotateAngle}deg)`;
    firework.style.height = '1em';
    firework.style.left = '0';
    firework.style.pointerEvents = 'none';
    firework.style.position = 'fixed';
    firework.style.transform = 'translate(var(--firework-x), var(--firework-y))';
    firework.style.transitionProperty = 'transform';
    firework.style.transitionTimingFunction = 'linear';
    firework.style.visibility = 'hidden';

    for (let i = 0; i < circlesQuantity; i++) {
      let circle = document.createElement('span');
      let particlesQuantity = i * circlesQuantity + 1;

      for (let j = 0; j < particlesQuantity; j++) {
        let particle = document.createElement('span');

        particle.textContent = takeAny(this.#particles);
        particle.style.position = 'absolute';
        particle.style.transform = 'translate(var(--particle-x), var(--particle-y))';
        particle.style.transitionProperty = 'transform, opacity';
        particle.style.transitionDuration = `${this.#particleTransitionDuration}ms`;
        particle.style.transitionTimingFunction = 'ease-out';

        circle.appendChild(particle);
      }

      firework.appendChild(circle);
    }

    return firework;
  }

  /**
   * @override
   *
   * @param {HTMLElement} firework
   * @param {EffectsPlayerElementTask} task
   *
   * @returns {Promise<void>}
   */
  async draw(firework, task) {
    /** @type {HTMLElement[]}  */
    let circles = [...firework.children];
    let circlesQuantity = circles.length;
    let circlesDensity = range(this.#minCirclesDensity, this.#maxCirclesDensity);
    let transitionDuration = range(this.#minTransitionDuration, this.#maxTransitionDuration);
    let startDelay = range(this.#minStartDelay, this.#maxStartDelay);
    let startX = range(this.#viewportPadding, window.innerWidth - this.#viewportPadding);
    let startY = firework.offsetHeight;
    let endY = range(-this.#viewportPadding, -window.innerHeight + this.#viewportPadding);

    firework.style.transitionDuration = `${startDelay}ms`;
    firework.style.setProperty('--firework-x', `${startX}px`);
    firework.style.setProperty('--firework-y', `${startY}px`);

    await task.transitionEnd(firework);

    firework.style.visibility = '';
    firework.style.transitionDuration = `${transitionDuration}ms`;
    firework.style.setProperty('--firework-y', `${endY}px`);

    await task.transitionEnd(firework);

    await Promise.all(
      circles.map(async (circle, i) => {
        /** @type {HTMLElement[]}  */
        let particles = [...circle.children];
        let particlesQuantity = particles.length;
        let circleRadius = i * circlesQuantity * circlesDensity;

        await Promise.all(
          particles.map(async (particle, j) => {
            let particleAngle = (TAU * j) / particlesQuantity;
            let particleBiasX = range(this.#minParticleBias, this.#maxParticleBias);
            let particleBiasY = range(this.#minParticleBias, this.#maxParticleBias);
            let particleEndX = circleRadius * Math.cos(particleAngle) + particleBiasX;
            let particleEndY = circleRadius * Math.sin(particleAngle) + particleBiasY;

            particle.style.setProperty('--particle-x', `${particleEndX}px`);
            particle.style.setProperty('--particle-y', `${particleEndY}px`);
            particle.style.opacity = '0';

            await task.transitionEnd(particle);
          }),
        );
      }),
    );
  }
}
