const url = window.location.href;
const isLocalhost = url.includes('127.0.0.1') || url.includes('localhost');
const componentUrl = isLocalhost ? '../../dist/clipboard-copy-defined.js' : '../lib/clipboard-copy-defined.js';

try {
  await import(componentUrl);
} catch (err) {
  console.error(err);
}

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
