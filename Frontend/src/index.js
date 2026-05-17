import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

if (process.env.NODE_ENV === 'development') {
  window.addEventListener(
    'error',
    (event) => {
      if (event.message === 'Script error.' && !event.filename) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
