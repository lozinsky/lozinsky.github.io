import './collapse-handle-element.js';

import { afterEach, expect, it, vi } from 'vitest';

import { expectToBeDefined } from './shared/expect.js';

const root = document.body;
const keys = [' ', 'Enter'];

afterEach(() => {
  root.innerHTML = '';
});

/**
 * @param {string} template
 */
function setup(template) {
  root.innerHTML = template;

  const collapseHandle = expectToBeDefined(root.querySelector('collapse-handle'));

  return { collapseHandle };
}

it('adds "0" "tabindex" attribute when is enabled', () => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);

  expect(collapseHandle.getAttribute('tabindex')).toBe('0');
});

it('removes "0" "tabindex" attribute when is disabled', () => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);

  expect(collapseHandle.getAttribute('tabindex')).toBeNull();
});

it('adds "button" "role" attribute when is enabled', () => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);

  expect(collapseHandle.getAttribute('role')).toBe('button');
});

it('removes "button" "role" attribute when is disabled', () => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);

  expect(collapseHandle.getAttribute('role')).toBeNull();
});

it('triggers "collapse-handle-toggle" event on click when is enabled', () => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
  const handleCollapseHandleToggle = vi.fn();

  collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
  collapseHandle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(handleCollapseHandleToggle).toBeCalledTimes(1);
});

it('does not trigger "collapse-handle-toggle" event on click when is disabled', () => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);
  const handleCollapseHandleToggle = vi.fn();

  collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
  collapseHandle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(handleCollapseHandleToggle).not.toBeCalled();
});

it.each(keys)('triggers "collapse-handle-toggle" event on "%s" keydown when is enabled', (key) => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
  const handleCollapseHandleToggle = vi.fn();

  collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
  collapseHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

  expect(handleCollapseHandleToggle).toBeCalledTimes(1);
});

it.each(keys)('does not trigger "collapse-handle-toggle" event on "%s" keydown when is disabled', (key) => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);
  const handleCollapseHandleToggle = vi.fn();

  collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
  collapseHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

  expect(handleCollapseHandleToggle).not.toBeCalled();
});

it('blurs when is focused and is disabled', () => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
  const blur = vi.spyOn(collapseHandle, 'blur');

  collapseHandle.focus();
  collapseHandle.disabled = true;

  expect(blur).toBeCalledTimes(1);
});

it('does not blur when is blurred and is disabled', () => {
  const { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
  const blur = vi.spyOn(collapseHandle, 'blur');

  collapseHandle.disabled = true;

  expect(blur).not.toBeCalled();
});
