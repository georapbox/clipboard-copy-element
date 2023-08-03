const template = document.createElement('template');

template.innerHTML = /* html */`
  <slot name="button"><button type="button" part="button"><slot name="button-content">Copy</slot></button></slot>
`;

class ClipboardCopy extends HTMLElement {
  #buttonSlot;
  #buttonEl;

  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    this.#buttonSlot = this.shadowRoot.querySelector('slot[name="button"]');
    this.#buttonEl = this.#getButton();
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  connectedCallback() {
    this.#upgradeProperty('value');
    this.#upgradeProperty('from');
    this.#upgradeProperty('disabled');

    this.#buttonSlot && this.#buttonSlot.addEventListener('slotchange', this.#onSlotChange);
    this.#buttonEl && this.#buttonEl.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.#buttonSlot.removeEventListener('slotchange', this.#onSlotChange);
    this.#buttonEl && this.#buttonEl.removeEventListener('click', this.#onClick);
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

      this.dispatchEvent(new CustomEvent('clipboard-copy:success', {
        bubbles: true,
        composed: true,
        detail: { value: copyValue }
      }));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('clipboard-copy:error', {
        bubbles: true,
        composed: true,
        detail: { error }
      }));
    }
  }

  #getButton() {
    if (!this.#buttonSlot) {
      return null;
    }

    return this.#buttonSlot.assignedElements({ flatten: true }).find(el => {
      return el.nodeName === 'BUTTON' || el.getAttribute('slot') === 'button';
    });
  }

  #onClick = evt => {
    evt.preventDefault();

    if (this.disabled) {
      return;
    }

    this.#copy();
  };

  #onSlotChange = evt => {
    if (evt.target && evt.target.name === 'button') {
      this.#buttonEl && this.#buttonEl.removeEventListener('click', this.#onClick);
      this.#buttonEl = this.#getButton();

      if (this.#buttonEl) {
        this.#buttonEl.addEventListener('click', this.#onClick);

        if (this.#buttonEl.nodeName !== 'BUTTON' && !this.#buttonEl.hasAttribute('role')) {
          this.#buttonEl.setAttribute('role', 'button');
        }
      }
    }
  };

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

  static defineCustomElement(elementName = 'clipboard-copy') {
    if (typeof window !== 'undefined' && !window.customElements.get(elementName)) {
      window.customElements.define(elementName, ClipboardCopy);
    }
  }
}

export { ClipboardCopy };
