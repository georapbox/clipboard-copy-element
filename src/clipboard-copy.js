// @ts-check

/**
 * Represents a value that may be of type T, or null.
 *
 * @template T
 * @typedef {T | null} Nullable
 */

const COMPONENT_NAME = 'clipboard-copy';
const DEFAULT_FEEDBACK_DURATION = 1000;
const SUCCESS_STATUS = 'success';
const ERROR_STATUS = 'error';
const template = document.createElement('template');

const styles = /* css */ `
  :host([hidden]),
  [hidden],
  ::slotted([hidden]) {
    display: none !important;
  }
`;

template.innerHTML = /* html */ `
  <style>${styles}</style>
  <button type="button" part="button">
    <slot name="copy">Copy</slot>
    <slot name="success" hidden>Copied!</slot>
    <slot name="error" hidden>Error</slot>
  </button>
`;

/**
 * @summary A custom element for copying text to the clipboard.
 * @documentation https://github.com/georapbox/clipboard-copy-element#readme
 *
 * @tagname clipboard-copy - This is the default tag name, unless overridden by the `defineCustomElement` method.
 * @extends HTMLElement
 *
 * @property {string} value - The value to be copied to clipboard.
 * @property {string} from - The CSS selector of the element to copy from.
 * @property {boolean} disabled - Whether the copy to clipboard button is disabled.
 * @property {number} feedbackDuration - The duration for displaying the success or error status.
 *
 * @attribute {string} value - Reflects the value property.
 * @attribute {string} from - Reflects the from property.
 * @attribute {boolean} disabled - Reflects the disabled property.
 * @attribute {number} feedback-duration - Reflects the feedbackDuration property.
 *
 * @slot copy - The default slot for the copy button.
 * @slot success - The slot for the success status message.
 * @slot error - The slot for the error status message.
 *
 * @csspart button - The button element.
 * @csspart button--success - The button element when the copy operation is successful.
 * @csspart button--error - The button element when the copy operation fails.
 * @csspart button--disabled - The button element when the disabled attribute is set.
 *
 * @fires clipboard-copy-success - Dispatched when the copy operation is successful.
 * @fires clipboard-copy-error - Dispatched when the copy operation fails.
 *
 * @method defineCustomElement - Static method. Defines a custom element with the given name.
 */
class ClipboardCopy extends HTMLElement {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #timeout = void 0;

  /** @type {Nullable<HTMLButtonElement>} */
  #buttonEl = null;

  /** @type {Nullable<HTMLSlotElement>} */
  #copySlot = null;

  /** @type {Nullable<HTMLSlotElement>} */
  #successSlot = null;

  /** @type {Nullable<HTMLSlotElement>} */
  #errorSlot = null;

  constructor() {
    super();

    if (!this.shadowRoot) {
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.content.cloneNode(true));
    }

    if (this.shadowRoot) {
      this.#buttonEl = this.shadowRoot.querySelector('button');
      this.#copySlot = this.shadowRoot.querySelector('slot[name="copy"]');
      this.#successSlot = this.shadowRoot.querySelector('slot[name="success"]');
      this.#errorSlot = this.shadowRoot.querySelector('slot[name="error"]');
    }
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  /**
   * Lifecycle method that is called when attributes are changed, added, removed, or replaced.
   *
   * @param {string} name - The name of the attribute.
   * @param {string} oldValue - The old value of the attribute.
   * @param {string} newValue - The new value of the attribute.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'disabled' && oldValue !== newValue) {
      if (this.#buttonEl) {
        this.#buttonEl.disabled = this.disabled;
        this.#buttonEl.setAttribute('aria-disabled', this.disabled.toString());

        if (this.#buttonEl.part.contains('button')) {
          this.#buttonEl.part.toggle('button--disabled', this.disabled);
        }
      }
    }
  }

  /**
   * Lifecycle method that is called when the element is added to the DOM.
   */
  connectedCallback() {
    this.#upgradeProperty('value');
    this.#upgradeProperty('from');
    this.#upgradeProperty('disabled');
    this.#upgradeProperty('feedbackDuration');

    this.#buttonEl?.addEventListener('click', this.#handleClick);
  }

  /**
   * Lifecycle method that is called when the element is removed from the DOM.
   */
  disconnectedCallback() {
    this.#buttonEl?.removeEventListener('click', this.#handleClick);

    // `disconnectedCallback` is also called when the element is moved to a different document,
    // via `Document: adoptNode()` method, therefore we reset the component to its initial state.
    this.#forceResetStatus();
  }

  /**
   * The value to be copied to clipboard.
   *
   * @type {string}
   * @attribute value - Reflects the value property.
   */
  get value() {
    return this.getAttribute('value') || '';
  }

  set value(value) {
    this.setAttribute('value', value != null ? value.toString() : value);
  }

  /**
   * The CSS selector of the element to copy from.
   *
   * @type {string}
   * @attribute from - Reflects the from property.
   */
  get from() {
    return this.getAttribute('from') || '';
  }

  set from(value) {
    this.setAttribute('from', value != null ? value.toString() : value);
  }

  /**
   * Whether the copy to clipboard button is disabled.
   *
   * @type {boolean}
   * @attribute disabled - Reflects the disabled property.
   */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    this.toggleAttribute('disabled', !!value);
  }

  /**
   * The duration for displaying the success or error status.
   *
   * @type {number}
   * @attribute feedback-duration - Reflects the feedbackDuration property.
   */
  get feedbackDuration() {
    return Number(this.getAttribute('feedback-duration')) || DEFAULT_FEEDBACK_DURATION;
  }

  set feedbackDuration(value) {
    this.setAttribute('feedback-duration', value != null ? value.toString() : value);
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
        const root =
          'getRootNode' in Element.prototype
            ? this.#buttonEl?.getRootNode({ composed: true })
            : this.#buttonEl?.ownerDocument;

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
          copyValue = element.textContent || '';
        }
      }

      await navigator.clipboard.writeText(copyValue);

      this.#showStatus(SUCCESS_STATUS);

      this.dispatchEvent(
        new CustomEvent(`${COMPONENT_NAME}-success`, {
          bubbles: true,
          composed: true,
          detail: { value: copyValue }
        })
      );
    } catch (error) {
      this.#showStatus(ERROR_STATUS);

      this.dispatchEvent(
        new CustomEvent(`${COMPONENT_NAME}-error`, {
          bubbles: true,
          composed: true,
          detail: { error }
        })
      );
    }
  }

  /**
   * Handles the button click event.
   *
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
   *
   * @param {string} status - The status to display.
   */
  #showStatus(status) {
    if (this.#copySlot) {
      this.#copySlot.hidden = true;
    }

    if (this.#successSlot) {
      this.#successSlot.hidden = status !== SUCCESS_STATUS;
    }

    if (this.#errorSlot) {
      this.#errorSlot.hidden = status !== ERROR_STATUS;
    }

    this.#buttonEl?.part.remove('button--success');
    this.#buttonEl?.part.remove('button--error');
    this.#buttonEl?.part.add(`button--${status}`);

    this.#timeout && clearTimeout(this.#timeout);

    this.#timeout = setTimeout(() => {
      if (this.#copySlot) {
        this.#copySlot.hidden = false;
      }

      if (this.#successSlot) {
        this.#successSlot.hidden = true;
      }

      if (this.#errorSlot) {
        this.#errorSlot.hidden = true;
      }

      this.#buttonEl?.part.remove(`button--${status}`);

      this.#timeout = void 0;
    }, this.feedbackDuration);
  }

  /**
   * Resets the status to the initial state.
   * Clears the feedback timeout, hides the success or error slots and shows the copy slot.
   */
  #forceResetStatus() {
    this.#timeout && clearTimeout(this.#timeout);
    this.#timeout = void 0;

    if (this.#copySlot) {
      this.#copySlot.hidden = false;
    }

    if (this.#successSlot) {
      this.#successSlot.hidden = true;
    }

    if (this.#errorSlot) {
      this.#errorSlot.hidden = true;
    }

    this.#buttonEl?.part.remove('button--success');
    this.#buttonEl?.part.remove('button--error');
  }

  /**
   * This is to safe guard against cases where, for instance, a framework may have added the element to the page and set a
   * value on one of its properties, but lazy loaded its definition. Without this guard, the upgraded element would miss that
   * property and the instance property would prevent the class property setter from ever being called.
   *
   * https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
   *
   * @param {'value' | 'from' | 'disabled' | 'feedbackDuration'} prop - The property to upgrade.
   */
  #upgradeProperty(prop) {
    /** @type {any} */
    const instance = this;

    if (Object.prototype.hasOwnProperty.call(instance, prop)) {
      const value = instance[prop];
      delete instance[prop];
      instance[prop] = value;
    }
  }

  /**
   * Defines a custom element with the given name.
   * The name must contain a dash (-).
   *
   * @param {string} [elementName='clipboard-copy'] - The name of the custom element.
   * @example
   *
   * ClipboardCopy.defineCustomElement('my-clipboard-copy');
   */
  static defineCustomElement(elementName = COMPONENT_NAME) {
    if (typeof window !== 'undefined' && !window.customElements.get(elementName)) {
      window.customElements.define(elementName, ClipboardCopy);
    }
  }
}

export { ClipboardCopy };
