import './collapse-content-element.js';

import { expect } from '@esm-bundle/chai';

describe('collapse-content-element', () => {
  let root = document.body;

  afterEach(() => {
    root.innerHTML = '';
  });

  /**
   * @param {string} template
   */
  function setup(template) {
    root.innerHTML = template;

    /** @type {import('./collapse-content-element').CollapseContentElement} */
    let collapseContent = root.querySelector('collapse-content');
    /** @type {HTMLElement} */
    let receiver = root.querySelector('#receiver');
    /** @type {HTMLElement} */
    let newReceiver = root.querySelector('#new-receiver');

    return { collapseContent, receiver, newReceiver };
  }

  it('adds "receiver" "aria-owns" attribute when forwards is defined', () => {
    let { collapseContent } = setup(/* HTML */ `
      <collapse-content forwards="receiver">Foo</collapse-content>
      <div id="receiver">Bar</div>
    `);

    expect(collapseContent.getAttribute('aria-owns')).to.equal('receiver');
  });

  it('removes "receiver" "aria-owns" attribute when forwards is not defined', () => {
    let { collapseContent } = setup(/* HTML */ `
      <collapse-content forwards="receiver">Foo</collapse-content>
      <div id="receiver">Bar</div>
    `);

    collapseContent.forwards = null;

    expect(collapseContent.getAttribute('aria-owns')).to.equal(null);
  });

  it('adds hidden attribute to receiver when forwards is defined and is hidden', () => {
    let { receiver } = setup(/* HTML */ `
      <collapse-content forwards="receiver" hidden="">Foo</collapse-content>
      <div id="receiver">Bar</div>
    `);

    expect(receiver.hidden).to.equal(true);
  });

  it('removes hidden attribute from receiver when forwards is defined and is visible', () => {
    let { receiver } = setup(/* HTML */ `
      <collapse-content forwards="receiver">Foo</collapse-content>
      <div id="receiver" hidden="">Bar</div>
    `);

    expect(receiver.hidden).to.equal(false);
  });

  it('adds hidden attribute to new receiver when forwards is changed and is hidden', () => {
    let { collapseContent, newReceiver } = setup(/* HTML */ `
      <collapse-content forwards="receiver" hidden="">Foo</collapse-content>
      <div id="receiver">Bar</div>
      <div id="new-receiver">Baz</div>
    `);

    collapseContent.forwards = 'new-receiver';

    expect(newReceiver.hidden).to.equal(true);
  });

  it('removes hidden attribute from new receiver when forwards is changed and is visible', () => {
    let { collapseContent, newReceiver } = setup(/* HTML */ `
      <collapse-content forwards="receiver">Foo</collapse-content>
      <div id="receiver" hidden="">Bar</div>
      <div id="new-receiver" hidden="">Baz</div>
    `);

    collapseContent.forwards = 'new-receiver';

    expect(newReceiver.hidden).to.equal(false);
  });
});
