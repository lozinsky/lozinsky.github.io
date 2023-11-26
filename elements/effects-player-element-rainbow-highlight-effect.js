import { delay, loop } from './effects-player-element-async.js';
import { getInteger } from './effects-player-element-random.js';

const HIGHLIGHTS_QUANTITY = 7;
const HIGHLIGHT_DELAY = 100;
const MIN_FIRST_HIGHLIGHT_DELAY = 100;
const MAX_FIRST_HIGHLIGHT_DELAY = 1000;

/**
 * @returns {Map<string, Highlight>}
 */
function getHighlightByName() {
  /** @type {Map<string, Highlight>} */
  let highlightByName = new Map();

  for (let index = 0; index < HIGHLIGHTS_QUANTITY; index++) {
    let name = `effects-player-rainbow-${index + 1}`;
    let highlight = new Highlight(); // eslint-disable-line no-undef

    highlightByName.set(name, highlight);
  }

  return highlightByName;
}

/**
 * @param {Highlight[]} highlights
 *
 * @returns {Map<Highlight, Highlight>}
 */
function getNextHighlightByPrevHighlight(highlights) {
  /** @type {Map<Highlight, Highlight>} */
  let nextHighlightByPrevHighlight = new Map();

  for (let index = 0; index < highlights.length; index++) {
    let prevHighlight = highlights[index];
    let nextHighlight = highlights[(index + 1) % highlights.length];

    nextHighlightByPrevHighlight.set(prevHighlight, nextHighlight);
  }

  return nextHighlightByPrevHighlight;
}

/**
 * @param {Range[]} ranges
 * @param {Highlight[]} highlights
 *
 * @returns {Map<Range, Highlight>}
 */
function getHighlightByRange(ranges, highlights) {
  /** @type {Map<Range, Highlight>} */
  let highlightByRange = new Map();

  for (let index = 0; index < ranges.length; index++) {
    let range = ranges[index];
    let highlight = highlights[index % highlights.length];

    highlightByRange.set(range, highlight);
  }

  return highlightByRange;
}

/**
 * @param {HTMLElement} root
 *
 * @returns {Range[]}
 */
function getRanges(root) {
  /** @type {Range[]} */
  let ranges = [];
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

  return ranges;
}

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
  let ranges = getRanges(root);
  let highlightByName = getHighlightByName();
  let highlights = [...highlightByName.values()];
  let highlightByRange = getHighlightByRange(ranges, highlights);
  let nextHighlightByPrevHighlight = getNextHighlightByPrevHighlight(highlights);

  for (let [name, highlight] of highlightByName.entries()) {
    CSS.highlights.set(name, highlight);
  }

  await Promise.all(
    ranges.map(async (range) => {
      await loop(async () => {
        let prevHighlight = highlightByRange.get(range);

        if (prevHighlight.has(range)) {
          let nextHighlight = nextHighlightByPrevHighlight.get(prevHighlight);

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

  for (let name of highlightByName.keys()) {
    CSS.highlights.delete(name);
  }
}
