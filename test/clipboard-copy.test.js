import { elementUpdated, expect, fixture, fixtureCleanup, html, waitUntil, oneEvent, aTimeout } from '@open-wc/testing';
import sinon from 'sinon';
import { ClipboardCopy } from '../src/clipboard-copy.js';

ClipboardCopy.defineCustomElement();

describe('<clipboard-copy>', () => {
  afterEach(() => {
    const targetEl = document.getElementById('target-element');
    targetEl && targetEl.remove();
    fixtureCleanup();
  });

  it('passes accessibility test', async () => {
    const el = await fixture(html`
      <clipboard-copy>
        <span slot="copy">Copy to clipboard</span>
        <span slot="success">Copied successfully!</span>
        <span slot="error">Error copying</span>
      </clipboard-copy>
    `);
    await expect(el).to.be.accessible();
  });

  it('reflects attribute "value" to property "value"', async () => {
    const el = await fixture(html`<clipboard-copy value="foo"></clipboard-copy>`);
    expect(el.value).to.equal('foo');
  });

  it('reflects property "value" to attribute "value"', async () => {
    const el = await fixture(html`<clipboard-copy></clipboard-copy>`);
    el.value = 'foo';
    await elementUpdated(el);
    expect(el.getAttribute('value')).to.equal('foo');
  });

  it('reflects attribute "from" to property "from"', async () => {
    const el = await fixture(html`<clipboard-copy from="#foo"></clipboard-copy>`);
    expect(el.from).to.equal('#foo');
  });

  it('reflects property "from" to attribute "from"', async () => {
    const el = await fixture(html`<clipboard-copy></clipboard-copy>`);
    el.from = '#foo';
    await elementUpdated(el);
    expect(el.getAttribute('from')).to.equal('#foo');
  });

  it('reflects attribute "disabled" to property "disabled"', async () => {
    const el = await fixture(html`<clipboard-copy disabled></clipboard-copy>`);
    expect(el.disabled).to.be.true;
  });

  it('reflects property "disabled" to attribute "disabled"', async () => {
    const el = await fixture(html`<clipboard-copy></clipboard-copy>`);
    el.disabled = true;
    await elementUpdated(el);
    expect(el.getAttribute('disabled')).to.equal('');
    el.disabled = false;
    await elementUpdated(el);
    expect(el.getAttribute('disabled')).to.be.null;
  });

  it('reflects attribute "feedback-duration" to property "feedbackDuration"', async () => {
    const el = await fixture(html`<clipboard-copy feedback-duration="2000"></clipboard-copy>`);
    expect(el.feedbackDuration).to.equal(2000);
  });

  it('reflects property "feedbackDuration" to attribute "feedback-duration"', async () => {
    const el = await fixture(html`<clipboard-copy></clipboard-copy>`);
    el.feedbackDuration = 2000;
    await elementUpdated(el);
    expect(el.getAttribute('feedback-duration')).to.equal('2000');
  });

  it('change `copy` slot', async () => {
    const el = await fixture(html`
      <clipboard-copy>
        <span slot="copy">Copy to clipboard</span>
      </clipboard-copy>
    `);

    expect(el).lightDom.to.equal('<span slot="copy">Copy to clipboard</span>');
  });

  it('change `success` slot', async () => {
    const el = await fixture(html`
      <clipboard-copy>
        <span slot="success">Copied successfully!</span>
      </clipboard-copy>
    `);

    expect(el).lightDom.to.equal('<span slot="success">Copied successfully!</span>');
  });

  it('change `error` slot', async () => {
    const el = await fixture(html`
      <clipboard-copy>
        <span slot="error">Error copying</span>
      </clipboard-copy>
    `);

    expect(el).lightDom.to.equal('<span slot="error">Error copying</span>');
  });

  it('copies from "value" attribute', async () => {
    const copyValue = 'Text to copy from value';
    const el = await fixture(html`<clipboard-copy value="${copyValue}"></clipboard-copy>`);
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

  it('`clipboard-copy-success` event is emitted', async () => {
    const copyValue = 'Text to copy from value';
    const el = await fixture(html`<clipboard-copy value="${copyValue}"></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const writeTextStub = sinon.stub(navigator.clipboard, 'writeText').callsFake(() => Promise.resolve());
    const listener = oneEvent(el, 'clipboard-copy-success');

    btn.click();

    const { detail } = await listener;

    expect(detail).to.deep.equal({
      value: copyValue
    });

    writeTextStub.restore();
  });

  it('`clipboard-copy-error` event is emitted', async () => {
    const copyValue = 'Text to copy from value';
    const el = await fixture(html`<clipboard-copy value="${copyValue}"></clipboard-copy>`);
    const btn = el.shadowRoot.querySelector('button');
    const handler = sinon.spy();
    const writeTextStub = sinon.stub(navigator.clipboard, 'writeText').callsFake(() => Promise.reject());

    el.addEventListener('clipboard-copy-error', handler);

    btn.click();

    await waitUntil(() => handler.calledOnce);

    expect(handler).to.have.been.calledOnce;

    writeTextStub.restore();
  });

  it('shows the success status feedback and after a timeout it restores to default', async () => {
    const FEEDBACK_DURATION = 100;
    const el = await fixture(
      html`<clipboard-copy value="Text to copy" feedback-duration="${FEEDBACK_DURATION}"></clipboard-copy>`
    );
    const btn = el.shadowRoot.querySelector('button');
    const copySlot = el.shadowRoot.querySelector('slot[name="copy"]');
    const successSlot = el.shadowRoot.querySelector('slot[name="success"]');
    const errorSlot = el.shadowRoot.querySelector('slot[name="error"]');
    const writeTextStub = sinon.stub(navigator.clipboard, 'writeText').callsFake(() => Promise.resolve());

    btn.click();

    await waitUntil(() => !successSlot.hasAttribute('hidden'));

    expect(successSlot).to.not.have.attribute('hidden');
    expect(errorSlot).to.have.attribute('hidden');
    expect(copySlot).to.have.attribute('hidden');

    await aTimeout(FEEDBACK_DURATION + 100);

    expect(successSlot).to.have.attribute('hidden');
    expect(errorSlot).to.have.attribute('hidden');
    expect(copySlot).to.not.have.attribute('hidden');

    writeTextStub.restore();
  });

  it('shows the error status feedback and after a timeout it restores to default', async () => {
    const FEEDBACK_DURATION = 100;
    const el = await fixture(
      html`<clipboard-copy value="Text to copy" feedback-duration="${FEEDBACK_DURATION}"></clipboard-copy>`
    );
    const btn = el.shadowRoot.querySelector('button');
    const copySlot = el.shadowRoot.querySelector('slot[name="copy"]');
    const successSlot = el.shadowRoot.querySelector('slot[name="success"]');
    const errorSlot = el.shadowRoot.querySelector('slot[name="error"]');
    const writeTextStub = sinon.stub(navigator.clipboard, 'writeText').callsFake(() => Promise.reject());

    btn.click();

    await waitUntil(() => !errorSlot.hasAttribute('hidden'));

    expect(successSlot).to.have.attribute('hidden');
    expect(errorSlot).to.not.have.attribute('hidden');
    expect(copySlot).to.have.attribute('hidden');

    await aTimeout(FEEDBACK_DURATION + 100);

    expect(successSlot).to.have.attribute('hidden');
    expect(errorSlot).to.have.attribute('hidden');
    expect(copySlot).to.not.have.attribute('hidden');

    writeTextStub.restore();
  });
});
