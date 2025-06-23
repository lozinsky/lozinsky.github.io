import { getCountryForTimezone } from 'countries-and-timezones';

import { delay, loop } from './shared/async.js';
import { expectToBeDefined } from './shared/expect.js';
import { getInteger } from './shared/random.js';

const HIGHLIGHTS_QUANTITY = 7;
const HIGHLIGHT_DELAY = 100;
const MIN_FIRST_HIGHLIGHT_DELAY = 100;
const MAX_FIRST_HIGHLIGHT_DELAY = 1000;

/**
 * @returns {boolean}
 */
export function isSupported() {
  if (getCountryForTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)?.id === 'RU') {
    return false;
  }

  return 'highlights' in CSS;
}

/**
 * @param {HTMLElement} root
 * @param {AbortSignal} signal
 *
 * @returns {Promise<void>}
 */
export async function run(root, signal) {
  const ranges = getRanges(root);
  const highlightByName = getHighlightByName();
  const highlights = [...highlightByName.values()];
  const highlightByRange = getHighlightByRange(ranges, highlights);
  const nextHighlightByPrevHighlight = getNextHighlightByPrevHighlight(highlights);

  for (const [name, highlight] of highlightByName.entries()) {
    CSS.highlights.set(name, highlight);
  }

  await Promise.all(
    ranges.map(async (range) => {
      await loop(async () => {
        const prevHighlight = expectToBeDefined(highlightByRange.get(range));

        if (prevHighlight.has(range)) {
          const nextHighlight = expectToBeDefined(nextHighlightByPrevHighlight.get(prevHighlight));

          await delay(HIGHLIGHT_DELAY, { signal });

          prevHighlight.delete(range);
          nextHighlight.add(range);

          highlightByRange.set(range, nextHighlight);
        } else {
          await delay(getInteger(MIN_FIRST_HIGHLIGHT_DELAY, MAX_FIRST_HIGHLIGHT_DELAY), { signal });

          prevHighlight.add(range);
        }
      });
    }),
  );

  for (const name of highlightByName.keys()) {
    CSS.highlights.delete(name);
  }
}

/**
 * @returns {Map<string, Highlight>}
 */
function getHighlightByName() {
  /** @type {Map<string, Highlight>} */
  const highlightByName = new Map();

  for (let index = 0; index < HIGHLIGHTS_QUANTITY; index++) {
    const name = `effects-player-rainbow-${index + 1}`;
    const highlight = new Highlight();

    highlightByName.set(name, highlight);
  }

  return highlightByName;
}

/**
 * @param {Range[]} ranges
 * @param {Highlight[]} highlights
 *
 * @returns {Map<Range, Highlight>}
 */
function getHighlightByRange(ranges, highlights) {
  /** @type {Map<Range, Highlight>} */
  const highlightByRange = new Map();

  for (let index = 0; index < ranges.length; index++) {
    const range = expectToBeDefined(ranges[index]);
    const highlight = expectToBeDefined(highlights[index % highlights.length]);

    highlightByRange.set(range, highlight);
  }

  return highlightByRange;
}

/**
 * @param {Highlight[]} highlights
 *
 * @returns {Map<Highlight, Highlight>}
 */
function getNextHighlightByPrevHighlight(highlights) {
  /** @type {Map<Highlight, Highlight>} */
  const nextHighlightByPrevHighlight = new Map();

  for (let index = 0; index < highlights.length; index++) {
    const prevHighlight = expectToBeDefined(highlights[index]);
    const nextHighlight = expectToBeDefined(highlights[(index + 1) % highlights.length]);

    nextHighlightByPrevHighlight.set(prevHighlight, nextHighlight);
  }

  return nextHighlightByPrevHighlight;
}

/**
 * @param {HTMLElement} root
 *
 * @returns {Range[]}
 */
function getRanges(root) {
  /** @type {Range[]} */
  const ranges = [];
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let treeWalkerNode = treeWalker.nextNode();

  while (treeWalkerNode !== null) {
    const parentElement = treeWalkerNode.parentElement;

    if (parentElement?.offsetParent != null) {
      const textContent = treeWalkerNode.textContent ?? '';

      for (let index = 0; index < textContent.length; index++) {
        const range = new Range();

        range.setStart(treeWalkerNode, index);
        range.setEnd(treeWalkerNode, index + 1);

        ranges.push(range);
      }
    }

    treeWalkerNode = treeWalker.nextNode();
  }

  return ranges;
}
