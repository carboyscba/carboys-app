import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './cotizador'   // Fase 1: expone window.__cotizador en dev; no monta UI todavía.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
