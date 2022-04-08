// import { ClipboardCopy } from 'https://unpkg.com/@georapbox/clipboard-copy-element/dist/clipboard-copy.min.js';
import { ClipboardCopy } from '../src/clipboard-copy.js';

ClipboardCopy.defineCustomElement();

const $console = document.getElementById('console');

document.addEventListener('clipboard-copy:click', evt => {
  console.log('clipboard-copy:click ->', evt);
  $console.innerHTML += `<div>$ <span class="info">clipboard-copy:click</span> -> Button clicked</div>`;
});

document.addEventListener('clipboard-copy:success', evt => {
  console.log('clipboard-copy:success ->', evt.detail);
  $console.innerHTML += `<div>$ <span class="success">clipboard-copy:success</span> -> ${JSON.stringify(evt.detail)}</div>`;

  evt.target.innerHTML = '<span slot="button-content">Copied!</span>';

  setTimeout(() => {
    evt.target.querySelector('[slot="button-content"]').textContent = 'Copy';
  }, 1000);
});

document.addEventListener('clipboard-copy:error', evt => {
  console.log('clipboard-copy:error ->', evt.detail);
  $console.innerHTML += `<div>$ <span class="error">clipboard-copy:error</span> -> ${evt.detail.error.name}: ${evt.detail.error.message}</div>`;
});
