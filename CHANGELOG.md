# CHANGELOG

## v2.0.0 (2022-11-18)

- Refactor to use private class fields.
- Replace rollup.js with parcel.js for bundling.
- Update dev dependencies.

### Breaking Changes

- Only minified production builds will be included in the `dist` folder from now on.

## v1.0.2 (2022-07-26)

- Update Events section in documentation.
- Update tests for dispatched events in order to also test `event.detail` values.
- Update dev dependencies.

## v1.0.1 (2022-06-27)

- Use `composed: true` for all dispatched events, to make them propagate across the shadow DOM boundary into the standard DOM.

## v1.0.0 (2022-04-11)

- Initial release
