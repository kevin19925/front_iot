import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Fix para iOS - Asegurar que el root existe
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Fix iOS - Limpiar contenido de carga inicial pero mantener fondo visible
const loadingDiv = rootElement.querySelector('div');
if (loadingDiv) {
  loadingDiv.remove();
}
rootElement.innerHTML = '';

// Asegurar que el body tenga fondo visible inmediatamente (fix pantalla negra iOS)
document.body.style.backgroundColor = '#121212';
document.body.style.color = 'white';

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

// Fix iOS - Remover clase loading y asegurar visibilidad
setTimeout(() => {
  document.body.classList.remove('loading');
  document.body.style.backgroundColor = '#121212';
  rootElement.style.backgroundColor = '#121212';
  rootElement.style.opacity = '1';
  rootElement.style.visibility = 'visible';
}, 100);

// Fix adicional para iOS - Forzar repintado
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  setTimeout(() => {
    document.body.style.display = 'none';
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = '';
  }, 200);
}

