import { loop, nextFrame, parallel } from './effects-player-element-async.js';
import { getSample } from './effects-player-element-random.js';

const HIGHLIGHT_COUNT = 7;

/**
 * @returns {boolean}
 */
export function isSupported() {
  return 'highlights' in CSS;
}

/**
 * @param {HTMLElement} root
 * @param {AbortSignal} signal
 *
 * @returns {Promise<void>}
 */
export async function run(root, signal) {
  /** @type {string[]} */
  let names = [];
  /** @type {Highlight[]} */
  let highlights = [];
  /** @type {Map<Range, Highlight>} */
  let highlightByRange = new Map();
  /** @type {Range[]} */
  let ranges = [];

  try {
    let treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let treeWalkerNode = treeWalker.nextNode();

    while (treeWalkerNode !== null) {
      let parentElement = treeWalkerNode.parentElement;

      if (parentElement !== null && parentElement.offsetParent !== null) {
        let textContent = treeWalkerNode.textContent ?? '';

        for (let index = 0; index < textContent.length; index++) {
          let range = new Range();

          range.setStart(treeWalkerNode, index);
          range.setEnd(treeWalkerNode, index + 1);

          ranges.push(range);
        }
      }

      treeWalkerNode = treeWalker.nextNode();
    }

    for (let index = 0; index < HIGHLIGHT_COUNT; index++) {
      let name = `effects-player-rainbow-${index + 1}`;
      let highlight = new Highlight(); // eslint-disable-line no-undef, compat/compat

      names.push(name);
      highlights.push(highlight);
      CSS.highlights.set(name, highlight); // eslint-disable-line compat/compat
    }

    await parallel(HIGHLIGHT_COUNT, async () => {
      await loop(async () => {
        let range = getSample(ranges);

        if (highlightByRange.has(range)) {
          let highlight = highlightByRange.get(range);

          highlight.delete(range);
          highlightByRange.delete(range);
        }

        let highlight = getSample(highlights);

        highlight.add(range);
        highlightByRange.set(range, highlight);

        await nextFrame({ signal });
      });
    });
  } finally {
    for (let name of names) {
      CSS.highlights.delete(name); // eslint-disable-line compat/compat
    }
  }
}
