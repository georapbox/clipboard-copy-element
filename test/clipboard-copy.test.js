import { elementUpdated, expect, fixture, fixtureCleanup, html } from '@open-wc/testing';
import { ClipboardCopy } from '../src/clipboard-copy.js';

ClipboardCopy.defineCustomElement();

describe('<clipboard-copy>', () => {
  it('passes accessibility test', async () => {
    const el = await fixture(html`<clipboard-copy></clipboard-copy>`);
    await expect(el).to.be.accessible();
  });

  it('default properties', async () => {
    const el = await fixture(html`<clipboard-copy></clipboard-copy>`);

    expect(el.value).to.be.null;
    expect(el.getAttribute('value')).to.be.null;

    expect(el.from).to.be.null;
    expect(el.getAttribute('from')).to.be.null;

    expect(el.disabled).to.be.false;
    expect(el.getAttribute('disabled')).to.be.null;
  });

  it('change default properties', async () => {
    const el = await fixture(html`<clipboard-copy value="foo" from="#foo" disabled></clipboard-copy>`);

    expect(el.value).to.equal('foo');
    expect(el.getAttribute('value')).to.equal('foo');

    expect(el.from).to.equal('#foo');
    expect(el.getAttribute('from')).to.equal('#foo');

    expect(el.disabled).to.be.true;
    expect(el.getAttribute('disabled')).to.equal('');
  });

  it('change properties programmatically', async () => {
    const el = await fixture(html`<clipboard-copy></clipboard-copy>`);

    el.value = 'foo';
    el.from = '#foo';
    el.disabled = true;

    await elementUpdated(el);

    expect(el.value).to.equal('foo');
    expect(el.getAttribute('value')).to.equal('foo');

    expect(el.from).to.equal('#foo');
    expect(el.getAttribute('from')).to.equal('#foo');

    expect(el.disabled).to.be.true;
    expect(el.getAttribute('disabled')).to.equal('');
  });

  it('change button slot', async () => {
    const el = await fixture(html`
      <clipboard-copy>
        <button slot="button" type="button">Copy</button>
      </clipboard-copy>
    `);

    expect(el).lightDom.to.equal('<button slot="button" type="button">Copy</button>');
  });

  it('change button slot with non button element', async () => {
    const el = await fixture(html`
      <clipboard-copy>
        <a href="#" slot="button" role="button">Copy</a>
      </clipboard-copy>
    `);

    expect(el).lightDom.to.equal('<a href="#" slot="button" role="button">Copy</a>');
  });

  it('role="button" is added on button slot if node is not button', async () => {
    const el = await fixture(html`
      <clipboard-copy>
        <a href="#" slot="button">Copy</a>
      </clipboard-copy>
    `);

    expect(el).lightDom.to.equal('<a href="#" slot="button" role="button">Copy</a>');
  });

  it('change button-content slot', async () => {
    const el = await fixture(html`
      <clipboard-copy>
        <span slot="button-content">Copy</span>
      </clipboard-copy>
    `);

    expect(el).lightDom.to.equal('<span slot="button-content">Copy</span>');
  });

  afterEach(() => {
    fixtureCleanup();
  });
});
