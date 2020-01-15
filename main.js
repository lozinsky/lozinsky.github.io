const drops = [
  'balloon',
  'bicyclist',
  'camera',
  'crab',
  'dolphin',
  'face-with-tears-of-joy',
  'frog-face',
  'growing-heart',
  'monkey-face',
  'nerd-face',
  'personal-computer',
  'rainbow',
  'seedling',
  'slice-of-pizza',
  'water-wave',
];
const duration = 5000;
const minTimeout = 300;
const maxTimeout = drops.length * 100;
const target = document.querySelector('h1');
const area = document.body;
const paths = drops.map(drop => `/assets/emoji/${drop}.png`);

target.addEventListener('click', () => {
  if (isReducedMotion()) {
    return;
  }

  shuffle(paths).forEach(createAsset);
});

function shuffle(input) {
  return [...input].sort(() => Math.random() - 0.5);
}

function range(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function isReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function createAsset(src) {
  const image = new Image();

  image.src = src;
  image.addEventListener('transitionend', () => image.remove());
  image.addEventListener('load', () => {
    const timeout = range(minTimeout, maxTimeout);

    appendAsset();
    setTimeout(dropAsset, timeout);
  });

  function getFinalX() {
    return range(0, window.innerWidth - image.naturalWidth);
  }

  function getStartY() {
    return -image.naturalHeight;
  }

  function getEndY() {
    return window.innerHeight + image.naturalHeight;
  }

  function appendAsset() {
    const x = getFinalX();
    const y = getStartY();

    image.style.position = 'fixed';
    image.style.top = '0';
    image.style.left = `${x}px`;
    image.style.transform = `translateY(${y}px)`;
    image.style.transition = `transform ${duration}ms var(--ease-out-back-function)`;
    image.style.pointerEvents = 'none';

    area.appendChild(image);
  }

  function dropAsset() {
    const y = getEndY();

    image.style.transform = `translateY(${y}px)`;
  }
}
