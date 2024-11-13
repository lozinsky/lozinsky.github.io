import './collapse-handle-element.js';

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('collapse-handle-element', () => {
  let root = document.body;
  let keys = [' ', 'Enter'];

  afterEach(() => {
    root.innerHTML = '';
  });

  /**
   * @param {string} template
   */
  function setup(template) {
    root.innerHTML = template;

    /** @type {import('./collapse-handle-element').CollapseHandleElement} */
    let collapseHandle = root.querySelector('collapse-handle');

    return { collapseHandle };
  }

  it('adds "0" "tabindex" attribute when is enabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('tabindex')).toBe('0');
  });

  it('removes "0" "tabindex" attribute when is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('tabindex')).toBeNull();
  });

  it('adds "button" "role" attribute when is enabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('role')).toBe('button');
  });

  it('removes "button" "role" attribute when is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('role')).toBeNull();
  });

  it('triggers "collapse-handle-toggle" event on click when is enabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
    let handleCollapseHandleToggle = vi.fn();

    collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
    collapseHandle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleCollapseHandleToggle).toBeCalledTimes(1);
  });

  it('does not trigger "collapse-handle-toggle" event on click when is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);
    let handleCollapseHandleToggle = vi.fn();

    collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
    collapseHandle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleCollapseHandleToggle).not.toBeCalled();
  });

  for (let key of keys) {
    it(`triggers "collapse-handle-toggle" event on "${key}" keydown when is enabled`, () => {
      let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
      let handleCollapseHandleToggle = vi.fn();

      collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
      collapseHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

      expect(handleCollapseHandleToggle).toBeCalledTimes(1);
    });

    it(`does not trigger "collapse-handle-toggle" event on "${key}" keydown when is disabled`, () => {
      let { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);
      let handleCollapseHandleToggle = vi.fn();

      collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
      collapseHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

      expect(handleCollapseHandleToggle).not.toBeCalled();
    });
  }

  it('blurs when is focused and is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
    let blur = vi.spyOn(collapseHandle, 'blur');

    collapseHandle.focus();
    collapseHandle.disabled = true;

    expect(blur).toBeCalledTimes(1);
  });

  it('does not blur when is blurred and is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
    let blur = vi.spyOn(collapseHandle, 'blur');

    collapseHandle.disabled = true;

    expect(blur).not.toBeCalled();
  });
});
