const isLocalhost = window.location.href.includes('127.0.0.1') || window.location.href.includes('localhost');
const componentUrl = isLocalhost ? '../../dist/clipboard-copy.js' : '../lib/clipboard-copy.js';

import(componentUrl).then(res => {
  const { ClipboardCopy } = res;

  ClipboardCopy.defineCustomElement();

  const $console = document.getElementById('console');

  document.addEventListener('clipboard-copy-error', evt => {
    console.log('clipboard-copy-error ->', evt.detail);
    $console.innerHTML += `<div>$ <span class="error">clipboard-copy-error</span> -> ${evt.detail.error.name}: ${evt.detail.error.message}</div>`;
  });
}).catch(err => {
  console.error(err);
});
