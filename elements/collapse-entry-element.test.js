import './collapse-content-element.js';
import './collapse-entry-element.js';
import './collapse-handle-element.js';

import { expect } from '@esm-bundle/chai';
import { restoreAll, spyOn } from 'tinyspy';

describe('collapse-entry-element', () => {
  let root = document.body;

  afterEach(() => {
    root.innerHTML = '';

    restoreAll();
  });

  /**
   * @param {string} eventType
   */
  async function when(eventType) {
    /** @type {import('./collapse-entry-element').CollapseEntryElement} */
    let collapseEntry = root.querySelector('collapse-entry');

    await new Promise((resolve) => collapseEntry.addEventListener(eventType, resolve, { once: true }));
  }

  /**
   * @param {string} template
   */
  function setup(template) {
    root.innerHTML = template;

    /** @type {import('./collapse-entry-element').CollapseEntryElement} */
    let collapseEntry = root.querySelector('collapse-entry');
    /** @type {import('./collapse-handle-element').CollapseHandleElement} */
    let collapseHandle = root.querySelector('collapse-handle');
    /** @type {import('./collapse-content-element').CollapseContentElement} */
    let collapseContent = root.querySelector('collapse-content');

    return { collapseEntry, collapseHandle, collapseContent };
  }

  it('shows "collapse-content" when is opened', async () => {
    let { collapseContent } = setup(/* HTML */ `
      <collapse-entry opened="">
        <span><collapse-handle>Foo</collapse-handle></span>
        <collapse-content hidden="">Bar</collapse-content>
      </collapse-entry>
    `);

    await when('collapse-entry-opened');

    expect(collapseContent.hidden).to.equal(false);
  });

  it('hides "collapse-content" when is closed', async () => {
    let { collapseContent } = setup(/* HTML */ `
      <collapse-entry>
        <span><collapse-handle>Foo</collapse-handle></span>
        <collapse-content>Bar</collapse-content>
      </collapse-entry>
    `);

    await when('collapse-entry-closed');

    expect(collapseContent.hidden).to.equal(true);
  });

  it('adds "true" "aria-expanded" attribute to "collapse-handle" when is opened', async () => {
    let { collapseHandle } = setup(/* HTML */ `
      <collapse-entry opened="">
        <span><collapse-handle>Foo</collapse-handle></span>
        <collapse-content hidden="">Bar</collapse-content>
      </collapse-entry>
    `);

    await when('collapse-entry-opened');

    expect(collapseHandle.getAttribute('aria-expanded')).to.equal('true');
  });

  it('adds "false" "aria-expanded" attribute to "collapse-handle" when is closed', async () => {
    let { collapseHandle } = setup(/* HTML */ `
      <collapse-entry>
        <span><collapse-handle>Foo</collapse-handle></span>
        <collapse-content>Bar</collapse-content>
      </collapse-entry>
    `);

    await when('collapse-entry-closed');

    expect(collapseHandle.getAttribute('aria-expanded')).to.equal('false');
  });

  it('enables "collapse-handle" when once is changed to false', async () => {
    let { collapseEntry, collapseHandle } = setup(/* HTML */ `
      <collapse-entry once="">
        <span><collapse-handle disabled="">Foo</collapse-handle></span>
        <collapse-content>Bar</collapse-content>
      </collapse-entry>
    `);

    await when('collapse-entry-closed');

    collapseEntry.once = false;

    await when('collapse-entry-enabled');

    expect(collapseHandle.disabled).to.equal(false);
  });

  it('disables "collapse-handle" on "collapse-handle-toggle" event when once is defined', async () => {
    let { collapseEntry, collapseHandle } = setup(/* HTML */ `
      <collapse-entry once="">
        <span><collapse-handle>Foo</collapse-handle></span>
        <collapse-content>Bar</collapse-content>
      </collapse-entry>
    `);

    await when('collapse-entry-closed');

    collapseEntry.dispatchEvent(new CustomEvent('collapse-handle-toggle', { bubbles: true }));

    await when('collapse-entry-disabled');

    expect(collapseHandle.disabled).to.equal(true);
  });

  it('opens on "collapse-handle-toggle" event when is closed', async () => {
    let { collapseEntry } = setup(/* HTML */ `
      <collapse-entry>
        <span><collapse-handle>Foo</collapse-handle></span>
        <collapse-content>Bar</collapse-content>
      </collapse-entry>
    `);

    await when('collapse-entry-closed');

    collapseEntry.dispatchEvent(new CustomEvent('collapse-handle-toggle', { bubbles: true }));

    expect(collapseEntry.opened).to.equal(true);
  });

  it('closes on "collapse-handle-toggle" event when is opened', async () => {
    let { collapseEntry } = setup(/* HTML */ `
      <collapse-entry opened="">
        <span><collapse-handle>Foo</collapse-handle></span>
        <collapse-content hidden="">Bar</collapse-content>
      </collapse-entry>
    `);

    await when('collapse-entry-opened');

    collapseEntry.dispatchEvent(new CustomEvent('collapse-handle-toggle', { bubbles: true }));

    expect(collapseEntry.opened).to.equal(false);
  });

  it('stops "collapse-handle-toggle" event propagation', async () => {
    let { collapseEntry } = setup(/* HTML */ `
      <collapse-entry>
        <span><collapse-handle>Foo</collapse-handle></span>
        <collapse-content>Bar</collapse-content>
      </collapse-entry>
    `);
    let collapseHandleToggleEvent = new CustomEvent('collapse-handle-toggle', { bubbles: true });
    let stopPropagation = spyOn(collapseHandleToggleEvent, 'stopPropagation');

    await when('collapse-entry-closed');

    collapseEntry.dispatchEvent(collapseHandleToggleEvent);

    expect(stopPropagation.callCount).to.equal(1);
  });
});
