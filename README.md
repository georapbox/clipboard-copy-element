[![npm version](https://img.shields.io/npm/v/@georapbox/clipboard-copy-element.svg)](https://www.npmjs.com/package/@georapbox/clipboard-copy-element)
[![npm license](https://img.shields.io/npm/l/@georapbox/clipboard-copy-element.svg)](https://www.npmjs.com/package/@georapbox/clipboard-copy-element)

[demo]: https://georapbox.github.io/clipboard-copy-element/
[support]: https://caniuse.com/#feat=custom-elementsv1
[polyfill]: https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements
[license]: https://github.com/georapbox/clipboard-copy-element/blob/main/LICENSE
[changelog]: https://github.com/georapbox/clipboard-copy-element/blob/main/CHANGELOG.md

# &lt;clipboard-copy&gt;

A custom element that implements the [Clipboard API](https://developer.mozilla.org/docs/Web/API/Clipboard_API) to copy text content from elements or input values to the clipboard.

[API documentation](#api) &bull; [Demo][demo]

## Install

```sh
$ npm install --save @georapbox/clipboard-copy-element
```

## Usage

### Script

```js
import { ClipboardCopy } from './node_modules/@georapbox/clipboard-copy-element/dist/clipboard-copy.js';

// Manually define the element.
ClipboardCopy.defineCustomElement();
```

Alternatively, you can import the automatically defined custom element.

```js
import './node_modules/@georapbox/clipboard-copy-element/dist/clipboard-copy-defined.js';
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

clipboard-copy::part(button--success) {
  /* The button element - success state */
}

clipboard-copy::part(button--error) {
  /* The button element - error state */
}
```

## API

### Properties
| Name | Reflects | Type | Default | Description |
| ---- | -------- | ---- | ------- | ----------- |
| `value` | ✓ | String | `""` | Optional. The value to be copied to clipboard. |
| `from` | ✓ | String | `""` | Optional. A valid CSS selector string to target the first element within the document that matches this selector. If the element is `HTMLInputElement` or `HTMLTextAreaElement` the `value` attribute of the element will be copied. If the element is `HTMLAnchorElement` the `href` attribute of the element will be copied. In any other case, the `textContent` of the element will be copied. If both `value` and `from` properties are set, the `value` property will take precedence over the `from` property. |
| `disabled` | ✓ | Boolean | `false` | Optional. Defines if the copy button is disabled. |
| `feedbackDuration`<br>*`feedback-duration`* | ✓ | Number | 1000 | The duration (in milliseconds) that the feedback is displayed before restoring the default button's content. |

All of the above properties reflect their values as HTML attributes to keep the element's DOM representation in sync with its JavaScript state.

### Slots

| Name | Default | Description |
| ---- | ------- | ----------- |
| `copy` | "Copy" | Override the button's default content. Example: `<span slot="copy">Copy text</span>` |
| `success` | "Copied!" | Override the button's feedback for success. Example: `<span slot="success">Copied successfully!</span>` |
| `error` | "Error" | Override the button's feedback for error. Example: `<span slot="error">Could not copy!</span>` |

### CSS Parts

| Name | Description |
| ---- | ----------- |
| `button` | Represents the button element. |
| `button--disabled` | Represents the disabled state of the button. |
| `button--success` | Represents the success state of the button. |
| `button--error` | Represents the error state of the button. |

### Events

| Name | Description | Event Detail |
| ---- | ----------- | ------------ |
| `clipboard-copy-success` | Emitted when copy is successful. | `{ value: String }` |
| `clipboard-copy-error` | Emitted when copy fails for any reason. | `{ error: DOMException }` |

### Methods

| Name | Type | Description | Arguments |
| ---- | ---- | ----------- | --------- |
| `defineCustomElement` | Static | Defines/registers the custom element with the name provided. If no name is provided, the default name is used. The method checks if the element is already defined, hence will skip trying to redefine it. | `elementName='clipboard-copy'` |

## Changelog

For API updates and breaking changes, check the [CHANGELOG][changelog].

## Development setup

### Prerequisites

The project requires `Node.js` and `npm` to be installed on your environment. Preferrably, use [nvm](https://github.com/nvm-sh/nvm) Node Version Manager and use the version of Node.js specified in the `.nvmrc` file by running `nvm use`.

### Install dependencies

Install the project dependencies by running the following command.

```sh
npm install
```

### Build for development

Watch for changes and start a development server by running the following command.

```sh
npm start
```

### Linting

Lint the code by running the following command.

```sh
npm run lint
```

### Testing

Run the tests by running any of the following commands.

```sh
npm test
npm run test:watch # watch mode
```

### Build for production

Create a production build by running the following command.

```sh
npm run build
```

## License

[The MIT License (MIT)][license]
