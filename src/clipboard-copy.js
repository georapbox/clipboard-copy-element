const template = document.createElement('template');

const html = String.raw;

template.innerHTML = html`
  <slot name="button"><button type="button" part="button"><slot name="button-content">Copy</slot></button></slot>
`;

class ClipboardCopy extends HTMLElement {
  constructor() {
    super();

    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    this._buttonSlot = this.shadowRoot.querySelector('slot[name="button"]');
    this.$button = this._getButton();

    this._onClick = this._onClick.bind(this);
    this._onSlotChange = this._onSlotChange.bind(this);
  }

  static get observedAttributes() {
    return ['disabled'];
  }

  connectedCallback() {
    this._buttonSlot && this._buttonSlot.addEventListener('slotchange', this._onSlotChange);
    this.$button && this.$button.addEventListener('click', this._onClick);

    this._upgradeProperty('value');
    this._upgradeProperty('from');
    this._upgradeProperty('disabled');
  }

  disconnectedCallback() {
    this._buttonSlot.removeEventListener('slotchange', this._onSlotChange);
    this.$button && this.$button.removeEventListener('click', this._onClick);
  }

  attributeChangedCallback(name) {
    if (name === 'disabled' && this.$button) {
      this.$button.disabled = this.disabled;
      this.$button.setAttribute('aria-disabled', this.disabled);

      if (this.$button.part && this.$button.part.contains('button')) {
        this.$button.part.toggle('button--disabled', this.disabled);
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

  async _copy() {
    if (!this.value && !this.from) {
      return;
    }

    try {
      let copyValue = '';

      if (this.value) {
        copyValue = this.value;
      } else if (this.from) {
        const root = 'getRootNode' in Element.prototype ? this.$button.getRootNode({ composed: true }) : this.$button.ownerDocument;
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
        detail: { value: copyValue }
      }));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('clipboard-copy:error', {
        bubbles: true,
        detail: { error }
      }));
    }
  }

  _getButton() {
    if (!this._buttonSlot) {
      return null;
    }

    return this._buttonSlot.assignedElements({ flatten: true }).find(el => {
      return el.nodeName === 'BUTTON' || el.getAttribute('slot') === 'button';
    });
  }

  _onClick(evt) {
    evt.preventDefault();

    if (this.disabled) {
      return;
    }

    this.dispatchEvent(new Event('clipboard-copy:click', {
      bubbles: true
    }));

    this._copy();
  }

  _onSlotChange(evt) {
    if (evt.target && evt.target.name === 'button') {
      this.$button && this.$button.removeEventListener('click', this._onClick);
      this.$button = this._getButton();

      if (this.$button) {
        this.$button.addEventListener('click', this._onClick);

        if (this.$button.nodeName !== 'BUTTON' && !this.$button.hasAttribute('role')) {
          this.$button.setAttribute('role', 'button');
        }
      }
    }
  }

  /**
   * https://developers.google.com/web/fundamentals/web-components/best-practices#lazy-properties
   * This is to safe guard against cases where, for instance, a framework
   * may have added the element to the page and set a value on one of its
   * properties, but lazy loaded its definition. Without this guard, the
   * upgraded element would miss that property and the instance property
   * would prevent the class property setter from ever being called.
   */
  _upgradeProperty(prop) {
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
