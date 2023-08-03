const COMPONENT_NAME = 'clipboard-copy';
const DEFAULT_FEEDBACK_DURATION = 1000;
const SUCCESS_STATUS = 'success';
const ERROR_STATUS = 'error';
const template = document.createElement('template');

template.innerHTML = /* html */`
  <style>
    :host([hidden]),
    [hidden],
    ::slotted([hidden]) {
      display: none !important;
    }
  </style>

  <button type="button" part="button">
    <slot name="copy">Copy</slot>
    <slot name="success" hidden>Copied!</slot>
    <slot name="error" hidden>Error</slot>
  </button>
`;

class ClipboardCopy extends HTMLElement {
  #timeout = null;
  #buttonEl;
  #copySlot;
  #successSlot;
  #errorSlot;

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    this.#buttonEl = this.shadowRoot.querySelector('button');
    this.#copySlot = this.shadowRoot.querySelector('slot[name="copy"]');
    this.#successSlot = this.shadowRoot.querySelector('slot[name="success"]');
    this.#errorSlot = this.shadowRoot.querySelector('slot[name="error"]');
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  connectedCallback() {
    this.#upgradeProperty('value');
    this.#upgradeProperty('from');
    this.#upgradeProperty('disabled');

    this.#buttonEl && this.#buttonEl.addEventListener('click', this.#handleClick);
  }

  disconnectedCallback() {
    this.#buttonEl && this.#buttonEl.removeEventListener('click', this.#handleClick);
  }

  attributeChangedCallback(name) {
    if (name === 'disabled' && this.#buttonEl) {
      this.#buttonEl.disabled = this.disabled;
      this.#buttonEl.setAttribute('aria-disabled', this.disabled);

      if (this.#buttonEl.part && this.#buttonEl.part.contains('button')) {
        this.#buttonEl.part.toggle('button--disabled', this.disabled);
      }
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  get feedbackDuration() {
    return Number(this.getAttribute('feedback-duration')) || DEFAULT_FEEDBACK_DURATION;
  }

  set feedbackDuration(value) {
    this.setAttribute('feedback-duration', value);
  }

  get value() {
    return this.getAttribute('value');
  }

  set value(value) {
    this.setAttribute('value', value);
  }

  get from() {
    return this.getAttribute('from');
  }

  set from(value) {
    this.setAttribute('from', value);
  }

  async #copy() {
    if (!this.value && !this.from) {
      return;
    }

    try {
      let copyValue = '';

      if (this.value) {
        copyValue = this.value;
      } else if (this.from) {
        const root = 'getRootNode' in Element.prototype ? this.#buttonEl.getRootNode({ composed: true }) : this.#buttonEl.ownerDocument;
        const element = root.querySelector(this.from);

        if (!element) {
          return;
        }

        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          copyValue = element.value;
        } else if (element instanceof HTMLAnchorElement && element.hasAttribute('href')) {
          copyValue = element.href;
        } else {
          copyValue = element.textContent;
        }
      }

      await navigator.clipboard.writeText(copyValue);

      this.#showStatus(SUCCESS_STATUS);

      this.dispatchEvent(new CustomEvent(`${COMPONENT_NAME}-success`, {
        bubbles: true,
        composed: true,
        detail: { value: copyValue }
      }));
    } catch (error) {
      this.#showStatus(ERROR_STATUS);

      this.dispatchEvent(new CustomEvent(`${COMPONENT_NAME}-error`, {
        bubbles: true,
        composed: true,
        detail: { error }
      }));
    }
  }

  #handleClick = evt => {
    evt.preventDefault();

    if (this.disabled || this.#timeout) {
      return;
    }

    this.#copy();
  };

  #showStatus(status) {
    const validStatuses = [SUCCESS_STATUS, ERROR_STATUS];

    if (!validStatuses.includes(status)) {
      return;
    }

    this.#copySlot.hidden = true;
    this.#successSlot.hidden = status !== SUCCESS_STATUS;
    this.#errorSlot.hidden = status !== ERROR_STATUS;

    if (this.#buttonEl) {
      this.#buttonEl.part.remove('button--success');
      this.#buttonEl.part.remove('button--error');
      this.#buttonEl.part.add(`button--${status}`);
    }

    clearTimeout(this.#timeout);

    this.#timeout = setTimeout(() => {
      this.#copySlot.hidden = false;
      this.#successSlot.hidden = true;
      this.#errorSlot.hidden = true;

      if (this.#buttonEl) {
        this.#buttonEl.part.remove(`button--${status}`);
      }

      this.#timeout = null;
    }, this.feedbackDuration);
  }

  /**
   * https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
   * This is to safe guard against cases where, for instance, a framework
   * may have added the element to the page and set a value on one of its
   * properties, but lazy loaded its definition. Without this guard, the
   * upgraded element would miss that property and the instance property
   * would prevent the class property setter from ever being called.
   */
  #upgradeProperty(prop) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  static defineCustomElement(elementName = COMPONENT_NAME) {
    if (typeof window !== 'undefined' && !window.customElements.get(elementName)) {
      window.customElements.define(elementName, ClipboardCopy);
    }
  }
}

export { ClipboardCopy };
