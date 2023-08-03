# CHANGELOG

## v3.0.0 (2023-08-04)

### Breaking Changes

- Remove `clipboard-copy:click` event.
- Rename `clipboard-copy:success` event to `clipboard-copy-success`.
- Rename `clipboard-copy:error` event to `clipboard-copy-error`.

### Other Changes

- Update dev dependencies.

## v2.0.0 (2022-11-18)

### Breaking Changes

- Only minified production builds will be included in the `dist` folder from now on.

### Other Changes

- Refactor to use private class fields.
- Replace rollup.js with parcel.js for bundling.
- Update dev dependencies.

## v1.0.2 (2022-07-26)

- Update Events section in documentation.
- Update tests for dispatched events in order to also test `event.detail` values.
- Update dev dependencies.

## v1.0.1 (2022-06-27)

- Use `composed: true` for all dispatched events, to make them propagate across the shadow DOM boundary into the standard DOM.

## v1.0.0 (2022-04-11)

- Initial release
