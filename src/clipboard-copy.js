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

/**
 * A custom element for copying text to the clipboard.
 * @extends HTMLElement
 */
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
    this.#upgradeProperty('feedbackDuration');

    this.#buttonEl.addEventListener('click', this.#handleClick);
  }

  disconnectedCallback() {
    this.#buttonEl.removeEventListener('click', this.#handleClick);

    // `disconnectedCallback` is also called when the element is moved to a different document,
    // via `Document: adoptNode()` method, therefore we reset the component to its initial state.
    this.#forceResetStatus();
  }

  attributeChangedCallback(name) {
    if (name === 'disabled') {
      this.#buttonEl.disabled = this.disabled;
      this.#buttonEl.setAttribute('aria-disabled', this.disabled.toString());

      if (this.#buttonEl.part.contains('button')) {
        this.#buttonEl.part.toggle('button--disabled', this.disabled);
      }
    }
  }

  /**
   * Getter for the value to copy.
   * @returns {string | null}
   */
  get value() {
    return this.getAttribute('value');
  }

  /**
   * Setter for the value to copy.
   * @param {string} value - The value to copy.
   */
  set value(value) {
    this.setAttribute('value', value);
  }

  /**
   * Getter for the CSS selector of the element to copy from.
   * @returns {string | null}
   */
  get from() {
    return this.getAttribute('from');
  }

  /**
   * Setter for the CSS selector of the element to copy from.
   * @param {string} value - The value of the CSS selector.
   */
  set from(value) {
    this.setAttribute('from', value);
  }

  /**
   * Getter for the disabled state.
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  /**
   * Setter for the disabled state.
   * @param {boolean} value - The value of the disabled state.
   */
  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  /**
   * Getter for the duration for displaying the success or error status.
   * If the value is not a number, the default value is used.
   * @returns {number}
   */
  get feedbackDuration() {
    return Number(this.getAttribute('feedback-duration')) || DEFAULT_FEEDBACK_DURATION;
  }

  /**
   * Setter for the duration for displaying the success or error status.
   * @param {number} value - The value of the duration.
   */
  set feedbackDuration(value) {
    this.setAttribute('feedback-duration', value);
  }

  /**
   * Copies the value to the clipboard and handles success or error states.
   */
  async #copy() {
    if (!this.value && !this.from) {
      return;
    }

    try {
      let copyValue = '';

      if (this.value) {
        copyValue = this.value;
      } else if (this.from) {
        const root = 'getRootNode' in Element.prototype
          ? this.#buttonEl.getRootNode({ composed: true })
          : this.#buttonEl.ownerDocument;

        if (!root || !(root instanceof Document || root instanceof ShadowRoot)) {
          return;
        }

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

  /**
   * Handles the button click event.
   * @param {MouseEvent} evt - The click event.
   */
  #handleClick = evt => {
    evt.preventDefault();

    if (this.disabled || this.#timeout) {
      return;
    }

    this.#copy();
  };

  /**
   * Displays the success or error status.
   * @param {string} status - The status to display.
   */
  #showStatus(status) {
    this.#copySlot.hidden = true;
    this.#successSlot.hidden = status !== SUCCESS_STATUS;
    this.#errorSlot.hidden = status !== ERROR_STATUS;

    this.#buttonEl.part.remove('button--success');
    this.#buttonEl.part.remove('button--error');
    this.#buttonEl.part.add(`button--${status}`);

    this.#timeout && clearTimeout(this.#timeout);

    this.#timeout = setTimeout(() => {
      this.#copySlot.hidden = false;
      this.#successSlot.hidden = true;
      this.#errorSlot.hidden = true;

      this.#buttonEl.part.remove(`button--${status}`);

      this.#timeout = null;
    }, this.feedbackDuration);
  }

  /**
   * Resets the status to the initial state.
   * Clears the feedback timeout, hides the success or error slots and shows the copy slot.
   */
  #forceResetStatus() {
    this.#timeout && clearTimeout(this.#timeout);
    this.#timeout = null;

    this.#copySlot.hidden = false;
    this.#successSlot.hidden = true;
    this.#errorSlot.hidden = true;

    this.#buttonEl.part.remove('button--success');
    this.#buttonEl.part.remove('button--error');
  }

  /**
   * https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
   * This is to safe guard against cases where, for instance, a framework may have added the element
   * to the page and set a value on one of its properties, but lazy loaded its definition.
   * Without this guard, the upgraded element would miss that property and the instance property
   * would prevent the class property setter from ever being called.
   * @param {string} prop - The property name.
   */
  #upgradeProperty(prop) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  /**
   * Registers the custom element to custom elements registry.
   * @param {string} [elementName] - The name of the custom element.
   */
  static defineCustomElement(elementName = COMPONENT_NAME) {
    if (typeof window !== 'undefined' && !window.customElements.get(elementName)) {
      window.customElements.define(elementName, ClipboardCopy);
    }
  }
}

export { ClipboardCopy };
