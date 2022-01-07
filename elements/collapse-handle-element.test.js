import { expect } from '@esm-bundle/chai';
import { restoreAll, spy, spyOn } from 'tinyspy';

import { CollapseHandleElement } from './collapse-handle-element.js';

describe('collapse-handle-element', () => {
  let root = document.body;
  let keys = [' ', 'Enter'];

  afterEach(() => {
    root.innerHTML = '';

    restoreAll();
  });

  /**
   * @param {string} template
   */
  function setup(template) {
    root.innerHTML = template;

    /** @type {CollapseHandleElement} */
    let collapseHandle = root.querySelector('collapse-handle');

    return { collapseHandle };
  }

  it('adds "0" "tabindex" attribute when is enabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('tabindex')).to.equal('0');
  });

  it('removes "0" "tabindex" attribute when is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('tabindex')).to.equal(null);
  });

  it('adds "button" "role" attribute when is enabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('role')).to.equal('button');
  });

  it('removes "button" "role" attribute when is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('role')).to.equal(null);
  });

  it('triggers "collapse-handle-toggle" event on click when is enabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
    let handleCollapseHandleToggle = spy();

    collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
    collapseHandle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleCollapseHandleToggle.callCount).to.equal(1);
  });

  it('does not trigger "collapse-handle-toggle" event on click when is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);
    let handleCollapseHandleToggle = spy();

    collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
    collapseHandle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleCollapseHandleToggle.callCount).to.equal(0);
  });

  for (let key of keys) {
    it(`triggers "collapse-handle-toggle" event on "${key}" keydown when is enabled`, () => {
      let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
      let handleCollapseHandleToggle = spy();

      collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
      collapseHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

      expect(handleCollapseHandleToggle.callCount).to.equal(1);
    });

    it(`does not trigger "collapse-handle-toggle" event on "${key}" keydown when is disabled`, () => {
      let { collapseHandle } = setup(/* HTML */ `<collapse-handle disabled="">Foo</collapse-handle>`);
      let handleCollapseHandleToggle = spy();

      collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
      collapseHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

      expect(handleCollapseHandleToggle.callCount).to.equal(0);
    });
  }

  it('blurs when is focused and is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
    let blur = spyOn(collapseHandle, 'blur');

    collapseHandle.focus();
    collapseHandle.disabled = true;

    expect(blur.callCount).to.equal(1);
  });

  it('does not blur when is blurred and is disabled', () => {
    let { collapseHandle } = setup(/* HTML */ `<collapse-handle>Foo</collapse-handle>`);
    let blur = spyOn(collapseHandle, 'blur');

    collapseHandle.disabled = true;

    expect(blur.callCount).to.equal(0);
  });
});
