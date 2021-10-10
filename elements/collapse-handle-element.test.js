import { expect } from '@esm-bundle/chai';
import { fake, spy } from 'sinon';

import { CollapseHandleElement } from './collapse-handle-element.js';

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

    /** @type {CollapseHandleElement} */
    let collapseHandle = root.querySelector('collapse-handle');

    return { collapseHandle };
  }

  it('adds "0" "tabindex" attribute when is enabled', () => {
    let { collapseHandle } = setup(`<collapse-handle>Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('tabindex')).to.equal('0');
  });

  it('removes "0" "tabindex" attribute when is disabled', () => {
    let { collapseHandle } = setup(`<collapse-handle disabled="">Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('tabindex')).to.equal(null);
  });

  it('adds "button" "role" attribute when is enabled', () => {
    let { collapseHandle } = setup(`<collapse-handle>Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('role')).to.equal('button');
  });

  it('removes "button" "role" attribute when is disabled', () => {
    let { collapseHandle } = setup(`<collapse-handle disabled="">Foo</collapse-handle>`);

    expect(collapseHandle.getAttribute('role')).to.equal(null);
  });

  it('triggers "collapse-handle-toggle" event on click when is enabled', () => {
    let { collapseHandle } = setup(`<collapse-handle>Foo</collapse-handle>`);
    let handleCollapseHandleToggle = fake();

    collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
    collapseHandle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleCollapseHandleToggle.calledOnce).to.equal(true);
  });

  it('does not trigger "collapse-handle-toggle" event on click when is disabled', () => {
    let { collapseHandle } = setup(`<collapse-handle disabled="">Foo</collapse-handle>`);
    let handleCollapseHandleToggle = fake();

    collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
    collapseHandle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(handleCollapseHandleToggle.calledOnce).to.equal(false);
  });

  for (let key of keys) {
    it(`triggers "collapse-handle-toggle" event on "${key}" keydown when is enabled`, () => {
      let { collapseHandle } = setup(`<collapse-handle>Foo</collapse-handle>`);
      let handleCollapseHandleToggle = fake();

      collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
      collapseHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

      expect(handleCollapseHandleToggle.calledOnce).to.equal(true);
    });

    it(`does not trigger "collapse-handle-toggle" event on "${key}" keydown when is disabled`, () => {
      let { collapseHandle } = setup(`<collapse-handle disabled="">Foo</collapse-handle>`);
      let handleCollapseHandleToggle = fake();

      collapseHandle.addEventListener('collapse-handle-toggle', handleCollapseHandleToggle);
      collapseHandle.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));

      expect(handleCollapseHandleToggle.calledOnce).to.equal(false);
    });
  }

  it('blurs when is focused and is disabled', () => {
    let { collapseHandle } = setup(`<collapse-handle>Foo</collapse-handle>`);
    let blur = spy(collapseHandle, 'blur');

    collapseHandle.focus();
    collapseHandle.disabled = true;

    expect(blur.calledOnce).to.equal(true);
  });

  it('does not blur when is blurred and is disabled', () => {
    let { collapseHandle } = setup(`<collapse-handle>Foo</collapse-handle>`);
    let blur = spy(collapseHandle, 'blur');

    collapseHandle.disabled = true;

    expect(blur.calledOnce).to.equal(false);
  });
});
