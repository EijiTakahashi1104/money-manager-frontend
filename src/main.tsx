import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// ★インポートを追加
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* ★BrowserRouterでAppを囲む */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);