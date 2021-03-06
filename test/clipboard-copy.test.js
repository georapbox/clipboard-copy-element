import { elementUpdated, expect, fixture, fixtureCleanup, html, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
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

  it('copies from "value" attribute', async () => {
    const copyValue = 'Text to copy from value';
    const el = await fixture(html`<clipboard-copy value=${copyValue}></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const writeTextSpy = sinon.spy(navigator.clipboard, 'writeText');

    btn.click();

    expect(writeTextSpy).to.have.been.calledWith(copyValue);

    writeTextSpy.restore();
  });

  it('copies value from input element', async () => {
    const copyValue = 'Text to copy from input value';

    const targetEl = document.createElement('input');
    targetEl.id = 'target-element';
    targetEl.type = 'text';
    targetEl.value = copyValue;
    document.body.appendChild(targetEl);

    const el = await fixture(html`<clipboard-copy from="input[type='text']"></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const writeTextSpy = sinon.spy(navigator.clipboard, 'writeText');

    btn.click();

    expect(writeTextSpy).to.have.been.calledWith(copyValue);

    writeTextSpy.restore();
  });

  it('copies value from textarea element', async () => {
    const copyValue = 'Text to copy from textarea';

    const targetEl = document.createElement('textarea');
    targetEl.id = 'target-element';
    targetEl.value = copyValue;
    document.body.appendChild(targetEl);

    const el = await fixture(html`<clipboard-copy from="textarea"></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const writeTextSpy = sinon.spy(navigator.clipboard, 'writeText');

    btn.click();

    expect(writeTextSpy).to.have.been.calledWith(copyValue);

    writeTextSpy.restore();
  });

  it('copies href from anchor element', async () => {
    const copyValue = 'https://giithub.com/';

    const targetEl = document.createElement('a');
    targetEl.id = 'target-element';
    targetEl.href = copyValue;
    document.body.appendChild(targetEl);

    const el = await fixture(html`<clipboard-copy from="#target-element"></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const writeTextSpy = sinon.spy(navigator.clipboard, 'writeText');

    btn.click();

    expect(writeTextSpy).to.have.been.calledWith(copyValue);

    writeTextSpy.restore();
  });

  it('copies textContent from div element', async () => {
    const copyValue = 'Text to copy from div element';

    const targetEl = document.createElement('div');
    targetEl.id = 'target-element';
    targetEl.textContent = copyValue;
    document.body.appendChild(targetEl);

    const el = await fixture(html`<clipboard-copy from="#target-element"></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const writeTextSpy = sinon.spy(navigator.clipboard, 'writeText');

    btn.click();

    expect(writeTextSpy).to.have.been.calledWith(copyValue);

    writeTextSpy.restore();
  });

  it('tries to copy textContent from element that does not exist', async () => {
    const el = await fixture(html`<clipboard-copy from="#does-not-exist"></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const writeTextSpy = sinon.spy(navigator.clipboard, 'writeText');

    btn.click();

    expect(writeTextSpy).to.not.have.been.called;

    writeTextSpy.restore();
  });

  it('do not provide value and from attributes', async () => {
    const el = await fixture(html`<clipboard-copy></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const writeTextSpy = sinon.spy(navigator.clipboard, 'writeText');

    btn.click();

    expect(writeTextSpy).to.not.have.been.called;

    writeTextSpy.restore();
  });

  it('clipboard-copy:click event is emitted', async () => {
    const el = await fixture(html`<clipboard-copy value="Text to copy from value"></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const handler = sinon.spy();

    el.addEventListener('clipboard-copy:click', handler);

    btn.click();

    await waitUntil(() => handler.calledOnce);

    expect(handler).to.have.been.calledOnce;
  });

  it('clipboard-copy:success event is emitted', async () => {
    const copyValue = 'Text to copy from value';
    const el = await fixture(html`<clipboard-copy value=${copyValue}></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const handler = sinon.spy();
    const writeTextStub = sinon.stub(navigator.clipboard, 'writeText').callsFake(() => Promise.resolve());

    el.addEventListener('clipboard-copy:success', handler);

    btn.click();

    await waitUntil(() => handler.calledOnce);

    expect(handler).to.have.been.calledOnce;

    writeTextStub.restore();
  });

  it('clipboard-copy:error event is emitted', async () => {
    const copyValue = 'Text to copy from value';
    const el = await fixture(html`<clipboard-copy value=${copyValue}></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const handler = sinon.spy();
    const writeTextStub = sinon.stub(navigator.clipboard, 'writeText').callsFake(() => Promise.reject());

    el.addEventListener('clipboard-copy:error', handler);

    btn.click();

    await waitUntil(() => handler.calledOnce);

    expect(handler).to.have.been.calledOnce;

    writeTextStub.restore();
  });

  afterEach(() => {
    const targetEl = document.getElementById('target-element');
    targetEl && targetEl.remove();
    fixtureCleanup();
  });
});
