[![npm version](https://img.shields.io/npm/v/@georapbox/clipboard-copy-element.svg)](https://www.npmjs.com/package/@georapbox/clipboard-copy-element)
[![npm license](https://img.shields.io/npm/l/@georapbox/clipboard-copy-element.svg)](https://www.npmjs.com/package/@georapbox/clipboard-copy-element)

[demo]: https://georapbox.github.io/clipboard-copy-element/
[support]: https://caniuse.com/#feat=custom-elementsv1
[polyfill]: https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements
[license]: https://georapbox.mit-license.org/@2022
[changelog]: https://github.com/georapbox/clipboard-copy-element/blob/main/CHANGELOG.md

# &lt;clipboard-copy&gt;

A custom element that implements the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) to copy text content from elements or input values to the clipboard.

[API documentation](#api) &bull; [Demo][demo]

## Install

```sh
$ npm install --save @georapbox/clipboard-copy-element
```

## Usage

### Script

```js
import { ClipboardCopy } from './node_modules/@georapbox/clipboard-copy-element/dist/clipboard-copy.min.js';

// Manually define the element.
ClipboardCopy.defineCustomElement();
```

Alternatively, you can import the automatically defined custom element.

```js
import './node_modules/@georapbox/clipboard-copy-element/dist/clipboard-copy-defined.min.js';
```

### Markup

```html
<clipboard-copy value="Text to copy"></clipboard-copy>
```

### Style

By default, the component is style-free to remain as less opinionated as possible. However, you can style the various elements of the component using the `::part()` CSS pseudo-elements provided for this purpose. Below are demonstrated all available parts for styling.

```css
clipboard-copy::part(button) {
  /* The button element */
}

clipboard-copy::part(button--disabled) {
  /* The button element - disabled state */
}
```

## API

### Properties
| Name | Reflects | Type | Default | Description |
| ---- | -------- | ---- | ------- | ----------- |
| `value` | ✓ | String | `null` | Optional. The value to be copied to clipboard. |
| `from` | ✓ | String | `null` | Optional. A valid CSS selector string to target the first element within the document that matches this selector. If the element is `HTMLInputElement` or `HTMLTextAreaElement` the `value` attribute of the element will be copied. If the element is `HTMLAnchorElement` the `href` attribute of the element will be copied. In any other case, the `textContent` of the element will be copied. If both `value` and `from` properties are set, the `value` property will take precedence over the `from` property. |
| `disabled` | ✓ | Boolean | `false` | Optional. Defines if the copy button is disabled. |

All of the above properties reflect their values as HTML attributes to keep the element's DOM representation in sync with its JavaScript state.

### Slots

| Name | Description |
| ---- | ----------- |
| `button` | Override the copy button with another element of your preference. Example: `<a href="#" slot="button" role="button">Copy text</a>` |
| `button-content` | Override the copy button's content with content of your preference. Useful if all you need is to change the button's label. Example: `<span slot="button-content">Copy text</span>` |

### CSS Parts

| Name | Description |
| ---- | ----------- |
| `button` | The copy button. |
| `button--disabled` | The copy button when is disabled. |

### Events

`clipboard-copy:click` - Emitted when copy button is clicked.

```js
document.addEventListener('clipboard-copy:click', evt => {
  console.log('Copy button clicked');
});
```

`clipboard-copy:success` - Emitted when copy is successful.

```js
document.addEventListener('clipboard-copy:success', evt => {
  console.log(evt.detail);
  // => { value: 'The copied text' }
});
```

`clipboard-copy:error` - Emitted when copy fails for any reason.

```js
document.addEventListener('clipboard-copy:error', evt => {
  console.log(evt.detail);
  // => { error: DOMException: Document is not focused. }
});
```

## Changelog

For API updates and breaking changes, check the [CHANGELOG][changelog].

## Browser support

Browsers without native [custom element support][support] require a [polyfill][polyfill].

- Firefox
- Chrome
- Microsoft Edge
- Safari

## License

[The MIT License (MIT)][license]
