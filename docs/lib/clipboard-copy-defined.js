/*!
 * @georapbox/clipboard-copy-element
 * A custom element that implements the Clipboard API to copy text content from elements or input values to the clipboard.
 *
 * @version 3.0.2
 * @homepage https://github.com/georapbox/clipboard-copy-element#readme
 * @author George Raptis <georapbox@gmail.com>
 * @license MIT
 */
var o="clipboard-copy";var r="success",n="error",h=document.createElement("template"),a=`
  :host([hidden]),
    [hidden],
    ::slotted([hidden]) {
      display: none !important;
    }
`;h.innerHTML=`
  <style>${a}</style>
  <button type="button" part="button">
    <slot name="copy">Copy</slot>
    <slot name="success" hidden>Copied!</slot>
    <slot name="error" hidden>Error</slot>
  </button>
`;var s=class d extends HTMLElement{#e=void 0;#t=null;#i=null;#s=null;#o=null;constructor(){super(),this.shadowRoot||this.attachShadow({mode:"open"}).appendChild(h.content.cloneNode(!0)),this.shadowRoot&&(this.#t=this.shadowRoot.querySelector("button"),this.#i=this.shadowRoot.querySelector('slot[name="copy"]'),this.#s=this.shadowRoot.querySelector('slot[name="success"]'),this.#o=this.shadowRoot.querySelector('slot[name="error"]'))}static get observedAttributes(){return["disabled"]}attributeChangedCallback(t,i,e){t==="disabled"&&i!==e&&this.#t&&(this.#t.disabled=this.disabled,this.#t.setAttribute("aria-disabled",this.disabled.toString()),this.#t.part.contains("button")&&this.#t.part.toggle("button--disabled",this.disabled))}connectedCallback(){this.#r("value"),this.#r("from"),this.#r("disabled"),this.#r("feedbackDuration"),this.#t?.addEventListener("click",this.#n)}disconnectedCallback(){this.#t?.removeEventListener("click",this.#n),this.#a()}get value(){return this.getAttribute("value")||""}set value(t){this.setAttribute("value",t!=null?t.toString():t)}get from(){return this.getAttribute("from")||""}set from(t){this.setAttribute("from",t!=null?t.toString():t)}get disabled(){return this.hasAttribute("disabled")}set disabled(t){this.toggleAttribute("disabled",!!t)}get feedbackDuration(){return Number(this.getAttribute("feedback-duration"))||1e3}set feedbackDuration(t){this.setAttribute("feedback-duration",t!=null?t.toString():t)}async#d(){if(!(!this.value&&!this.from))try{let t="";if(this.value)t=this.value;else if(this.from){let i="getRootNode"in Element.prototype?this.#t?.getRootNode({composed:!0}):this.#t?.ownerDocument;if(!i||!(i instanceof Document||i instanceof ShadowRoot))return;let e=i.querySelector(this.from);if(!e)return;e instanceof HTMLInputElement||e instanceof HTMLTextAreaElement?t=e.value:e instanceof HTMLAnchorElement&&e.hasAttribute("href")?t=e.href:t=e.textContent||""}await navigator.clipboard.writeText(t),this.#h(r),this.dispatchEvent(new CustomEvent(`${o}-success`,{bubbles:!0,composed:!0,detail:{value:t}}))}catch(t){this.#h(n),this.dispatchEvent(new CustomEvent(`${o}-error`,{bubbles:!0,composed:!0,detail:{error:t}}))}}#n=t=>{t.preventDefault(),!(this.disabled||this.#e)&&this.#d()};#h(t){this.#i&&(this.#i.hidden=!0),this.#s&&(this.#s.hidden=t!==r),this.#o&&(this.#o.hidden=t!==n),this.#t?.part.remove("button--success"),this.#t?.part.remove("button--error"),this.#t?.part.add(`button--${t}`),this.#e&&clearTimeout(this.#e),this.#e=setTimeout(()=>{this.#i&&(this.#i.hidden=!1),this.#s&&(this.#s.hidden=!0),this.#o&&(this.#o.hidden=!0),this.#t?.part.remove(`button--${t}`),this.#e=void 0},this.feedbackDuration)}#a(){this.#e&&clearTimeout(this.#e),this.#e=void 0,this.#i&&(this.#i.hidden=!1),this.#s&&(this.#s.hidden=!0),this.#o&&(this.#o.hidden=!0),this.#t?.part.remove("button--success"),this.#t?.part.remove("button--error")}#r(t){let i=this;if(Object.prototype.hasOwnProperty.call(i,t)){let e=i[t];delete i[t],i[t]=e}}static defineCustomElement(t=o){typeof window<"u"&&!window.customElements.get(t)&&window.customElements.define(t,d)}};s.defineCustomElement();export{s as ClipboardCopy};
