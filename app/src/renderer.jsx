import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './renderer/App.jsx';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Renderer root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
