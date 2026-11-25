import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { createRoot } from 'react-dom/client';

// Adapt the two runtime imports used by the supplied compiled module.
let Worldline;
globalThis.TURBOPACK = { push(chunk) {
  for (let index = 1; index < chunk.length; index += 2) {
    const id = chunk[index];
    if (id !== 375029) continue;
    chunk[index + 1]({
      i(moduleId) {
        if (moduleId === 843476) return jsxRuntime;
        if (moduleId === 271645) return React;
        throw new Error(`Unsupported runtime module: ${moduleId}`);
      },
      s(exports) {
        for (let j = 0; j < exports.length; j += 3) {
          if (exports[j] === 'default') Worldline = exports[j + 2];
        }
      }
    });
  }
}};
const script = document.createElement('script');
script.src = '/worldline-original.js';
script.onload = () => {
  if (!Worldline) throw new Error('Worldline module was not found');
  createRoot(document.getElementById('root')).render(React.createElement(Worldline));
};
script.onerror = () => { document.getElementById('root').textContent = 'Could not load preview module.'; };
document.head.appendChild(script);
