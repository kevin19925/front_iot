import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Fix para iOS - Asegurar que el root existe
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Limpiar contenido de carga inicial
rootElement.innerHTML = '';

// Registrar Service Worker para PWA (solo si no es iOS o si está instalado)
if ('serviceWorker' in navigator) {
  // En iOS, el Service Worker puede causar problemas, solo registrarlo si es necesario
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  if (!isIOS || window.matchMedia('(display-mode: standalone)').matches) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);
        })
        .catch((error) => {
          console.log('❌ Error al registrar Service Worker:', error);
          // No es crítico, continuar sin SW
        });
    });
  }
}

// Renderizar la app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Remover clase loading del body cuando React cargue
setTimeout(() => {
  document.body.classList.remove('loading');
}, 100);

