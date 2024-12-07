import './collapse-content-element.js';

import { afterEach, expect, it } from 'vitest';

import { expectToBeDefined } from './shared/expect.js';

const root = document.body;

afterEach(() => {
  root.innerHTML = '';
});

/**
 * @param {string} template
 */
function setup(template) {
  root.innerHTML = template;

  const collapseContent = expectToBeDefined(root.querySelector('collapse-content'));
  /** @type {HTMLElement} */
  const receiver = expectToBeDefined(root.querySelector('#receiver'));
  /** @type {HTMLElement | null} */
  const newReceiver = root.querySelector('#new-receiver');

  return { collapseContent, newReceiver, receiver };
}

it('adds "receiver" "aria-owns" attribute when forwards is defined', () => {
  const { collapseContent } = setup(/* HTML */ `
    <collapse-content forwards="receiver">Foo</collapse-content>
    <div id="receiver">Bar</div>
  `);

  expect(collapseContent.getAttribute('aria-owns')).toBe('receiver');
});

it('removes "receiver" "aria-owns" attribute when forwards is not defined', () => {
  const { collapseContent } = setup(/* HTML */ `
    <collapse-content forwards="receiver">Foo</collapse-content>
    <div id="receiver">Bar</div>
  `);

  collapseContent.forwards = null;

  expect(collapseContent.getAttribute('aria-owns')).toBeNull();
});

it('adds hidden attribute to receiver when forwards is defined and is hidden', () => {
  const { receiver } = setup(/* HTML */ `
    <collapse-content forwards="receiver" hidden="">Foo</collapse-content>
    <div id="receiver">Bar</div>
  `);

  expect(receiver.hidden).toBe(true);
});

it('removes hidden attribute from receiver when forwards is defined and is visible', () => {
  const { receiver } = setup(/* HTML */ `
    <collapse-content forwards="receiver">Foo</collapse-content>
    <div id="receiver" hidden="">Bar</div>
  `);

  expect(receiver.hidden).toBe(false);
});

it('adds hidden attribute to new receiver when forwards is changed and is hidden', () => {
  const { collapseContent, newReceiver } = setup(/* HTML */ `
    <collapse-content forwards="receiver" hidden="">Foo</collapse-content>
    <div id="receiver">Bar</div>
    <div id="new-receiver">Baz</div>
  `);

  collapseContent.forwards = 'new-receiver';

  expect(expectToBeDefined(newReceiver).hidden).toBe(true);
});

it('removes hidden attribute from new receiver when forwards is changed and is visible', () => {
  const { collapseContent, newReceiver } = setup(/* HTML */ `
    <collapse-content forwards="receiver">Foo</collapse-content>
    <div id="receiver" hidden="">Bar</div>
    <div id="new-receiver" hidden="">Baz</div>
  `);

  collapseContent.forwards = 'new-receiver';

  expect(expectToBeDefined(newReceiver).hidden).toBe(false);
});
