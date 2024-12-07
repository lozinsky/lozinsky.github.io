import './collapse-content-element.js';
import './collapse-entry-element.js';
import './collapse-handle-element.js';

import { afterEach, expect, it, vi } from 'vitest';

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

  const collapseEntry = expectToBeDefined(root.querySelector('collapse-entry'));
  const collapseHandle = expectToBeDefined(root.querySelector('collapse-handle'));
  const collapseContent = expectToBeDefined(root.querySelector('collapse-content'));

  return { collapseContent, collapseEntry, collapseHandle };
}

/**
 * @param {string} eventType
 */
async function when(eventType) {
  const collapseEntry = expectToBeDefined(root.querySelector('collapse-entry'));

  await new Promise((resolve) => {
    collapseEntry.addEventListener(eventType, resolve, { once: true });
  });
}

it('shows "collapse-content" when is opened', async () => {
  const { collapseContent } = setup(/* HTML */ `
    <collapse-entry opened="">
      <span><collapse-handle>Foo</collapse-handle></span>
      <collapse-content hidden="">Bar</collapse-content>
    </collapse-entry>
  `);

  await when('collapse-entry-opened');

  expect(collapseContent.hidden).toBe(false);
});

it('hides "collapse-content" when is closed', async () => {
  const { collapseContent } = setup(/* HTML */ `
    <collapse-entry>
      <span><collapse-handle>Foo</collapse-handle></span>
      <collapse-content>Bar</collapse-content>
    </collapse-entry>
  `);

  await when('collapse-entry-closed');

  expect(collapseContent.hidden).toBe(true);
});

it('adds "true" "aria-expanded" attribute to "collapse-handle" when is opened', async () => {
  const { collapseHandle } = setup(/* HTML */ `
    <collapse-entry opened="">
      <span><collapse-handle>Foo</collapse-handle></span>
      <collapse-content hidden="">Bar</collapse-content>
    </collapse-entry>
  `);

  await when('collapse-entry-opened');

  expect(collapseHandle.getAttribute('aria-expanded')).toBe('true');
});

it('adds "false" "aria-expanded" attribute to "collapse-handle" when is closed', async () => {
  const { collapseHandle } = setup(/* HTML */ `
    <collapse-entry>
      <span><collapse-handle>Foo</collapse-handle></span>
      <collapse-content>Bar</collapse-content>
    </collapse-entry>
  `);

  await when('collapse-entry-closed');

  expect(collapseHandle.getAttribute('aria-expanded')).toBe('false');
});

it('enables "collapse-handle" when once is changed to false', async () => {
  const { collapseEntry, collapseHandle } = setup(/* HTML */ `
    <collapse-entry once="">
      <span><collapse-handle disabled="">Foo</collapse-handle></span>
      <collapse-content>Bar</collapse-content>
    </collapse-entry>
  `);

  await when('collapse-entry-closed');

  collapseEntry.once = false;

  await when('collapse-entry-enabled');

  expect(collapseHandle.disabled).toBe(false);
});

it('disables "collapse-handle" on "collapse-handle-toggle" event when once is defined', async () => {
  const { collapseEntry, collapseHandle } = setup(/* HTML */ `
    <collapse-entry once="">
      <span><collapse-handle>Foo</collapse-handle></span>
      <collapse-content>Bar</collapse-content>
    </collapse-entry>
  `);

  await when('collapse-entry-closed');

  collapseEntry.dispatchEvent(new CustomEvent('collapse-handle-toggle', { bubbles: true }));

  await when('collapse-entry-disabled');

  expect(collapseHandle.disabled).toBe(true);
});

it('opens on "collapse-handle-toggle" event when is closed', async () => {
  const { collapseEntry } = setup(/* HTML */ `
    <collapse-entry>
      <span><collapse-handle>Foo</collapse-handle></span>
      <collapse-content>Bar</collapse-content>
    </collapse-entry>
  `);

  await when('collapse-entry-closed');

  collapseEntry.dispatchEvent(new CustomEvent('collapse-handle-toggle', { bubbles: true }));

  expect(collapseEntry.opened).toBe(true);
});

it('closes on "collapse-handle-toggle" event when is opened', async () => {
  const { collapseEntry } = setup(/* HTML */ `
    <collapse-entry opened="">
      <span><collapse-handle>Foo</collapse-handle></span>
      <collapse-content hidden="">Bar</collapse-content>
    </collapse-entry>
  `);

  await when('collapse-entry-opened');

  collapseEntry.dispatchEvent(new CustomEvent('collapse-handle-toggle', { bubbles: true }));

  expect(collapseEntry.opened).toBe(false);
});

it('stops "collapse-handle-toggle" event propagation', async () => {
  const { collapseEntry } = setup(/* HTML */ `
    <collapse-entry>
      <span><collapse-handle>Foo</collapse-handle></span>
      <collapse-content>Bar</collapse-content>
    </collapse-entry>
  `);
  const collapseHandleToggleEvent = new CustomEvent('collapse-handle-toggle', { bubbles: true });
  const stopPropagation = vi.spyOn(collapseHandleToggleEvent, 'stopPropagation');

  await when('collapse-entry-closed');

  collapseEntry.dispatchEvent(collapseHandleToggleEvent);

  expect(stopPropagation).toBeCalledTimes(1);
});
