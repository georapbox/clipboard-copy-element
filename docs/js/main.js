const isLocalhost = window.location.href.includes('127.0.0.1') || window.location.href.includes('localhost');
const componentUrl = isLocalhost ? '../../dist/clipboard-copy-defined.js' : '../lib/clipboard-copy-defined.js';

import(componentUrl).then(() => {
  document.addEventListener('clipboard-copy-success', evt => {
    const preEl = evt.target.closest('.card')?.querySelector('.no-highlight');
    const codeEl = preEl?.querySelector('code');

    if (preEl && codeEl) {
      codeEl.innerHTML += `$ clipboard-copy-success -> ${JSON.stringify(evt.detail)}\n`;
      preEl.scrollTop = preEl.scrollHeight;
    }

    console.log('clipboard-copy-success ->', evt.detail);
  });

  document.addEventListener('clipboard-copy-error', evt => {
    const preEl = evt.target.closest('.card')?.querySelector('.no-highlight');
    const codeEl = preEl?.querySelector('code');

    if (preEl && codeEl) {
      codeEl.innerHTML += `$ clipboard-copy-error -> ${evt.detail.error.name}: ${evt.detail.error.message}\n`;
      preEl.scrollTop = preEl.scrollHeight;
    }

    console.log('clipboard-copy-error ->', evt.detail);
  });
}).catch(err => {
  console.error(err);
});
