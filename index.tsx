import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// --- SUPRESSÃO DE ERRO BENIGNO DO RESIZE OBSERVER ---
// Esse erro é frequente ao usar React Flow/D3/Recharts e ocorre quando o layout é recalculado
// dentro do mesmo frame de animação. Não afeta a funcionalidade real do app.
const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications';

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes(resizeObserverLoopErr)) {
    return;
  }
  originalError.call(console, ...args);
};

window.addEventListener('error', (e) => {
  if (typeof e.message === 'string' && e.message.includes(resizeObserverLoopErr)) {
    e.stopImmediatePropagation();
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);