import React, { useState, useEffect, useCallback } from 'react';
import { obtenerEstado } from './services/api';
import { solicitarPermiso, analizarYNotificar } from './services/notificaciones';
import Dashboard from './components/Dashboard';
import PanelControl from './components/PanelControl';
import TablaHistorial from './components/TablaHistorial';
import Tabs from './components/Tabs';
import './App.css';

function App() {
  const [datos, setDatos] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Función para agregar datos al historial
  const agregarAlHistorial = useCallback((nuevosDatos) => {
    if (!nuevosDatos || !nuevosDatos.sensores) return;

    const registro = {
      hora: nuevosDatos.ultima_actualizacion || new Date().toLocaleTimeString('es-ES'),
      nivel: nuevosDatos.sensores.nivel_agua || 0,
      temperatura: nuevosDatos.sensores.temperatura || 0,
      bomba: nuevosDatos.sensores.bomba_estado_real || false,
      evento: nuevosDatos.sensores.ultimo_animal || 'Ninguno',
    };

    setHistorial((prev) => {
      const nuevoHistorial = [registro, ...prev];
      // Limitar a los últimos 20 registros
      return nuevoHistorial.slice(0, 20);
    });
  }, []);

  // Función para obtener datos del servidor
  const actualizarDatos = useCallback(async () => {
    try {
      const nuevosDatos = await obtenerEstado();
      setDatos(nuevosDatos);
      setConectado(true);
      setError(null);
      
      // Agregar al historial
      agregarAlHistorial(nuevosDatos);
    } catch (err) {
      console.error('Error al obtener datos:', err);
      setError(err.message);
      setConectado(false);
    }
  }, [agregarAlHistorial]);

  // Efecto para solicitar permiso de notificaciones al cargar
  useEffect(() => {
    const inicializarNotificaciones = async () => {
      const permiso = await solicitarPermiso();
      setNotificacionesActivas(permiso);
      
      if (!permiso && Notification.permission === 'default') {
        // Mostrar mensaje informativo si el usuario aún no ha decidido
        console.log('Las notificaciones están desactivadas. Actívalas para recibir alertas.');
      }
    };

    inicializarNotificaciones();
  }, []);

  // Efecto para actualización automática cada 1 segundo
  useEffect(() => {
    // Primera carga inmediata
    actualizarDatos();

    // Configurar intervalo para actualizar cada 1 segundo
    const intervalo = setInterval(() => {
      actualizarDatos();
    }, 1000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalo);
  }, [actualizarDatos]);

  // Efecto para analizar y notificar cambios
  useEffect(() => {
    if (datos && notificacionesActivas) {
      analizarYNotificar(datos);
    }
  }, [datos, notificacionesActivas]);

  // Manejar comando enviado desde PanelControl
  const manejarComandoEnviado = useCallback((accion) => {
    console.log(`Comando ${accion} enviado, actualizando datos...`);
    // Esperar un momento y luego actualizar para ver el cambio
    setTimeout(() => {
      actualizarDatos();
    }, 500);
  }, [actualizarDatos]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>💧 Bebedero Inteligente IoT</h1>
        <div className="header-status">
          <div className="status-indicator">
            <span className={`status-dot ${conectado ? 'status-online' : 'status-offline'}`}></span>
            <span>{conectado ? 'Conectado' : 'Desconectado'}</span>
          </div>
          <div className="notification-status">
            <span className={`notification-icon ${notificacionesActivas ? 'notification-on' : 'notification-off'}`}>
              {notificacionesActivas ? '🔔' : '🔕'}
            </span>
            <span className="notification-text">
              {notificacionesActivas ? 'Notificaciones ON' : 'Notificaciones OFF'}
            </span>
            {!notificacionesActivas && Notification.permission !== 'denied' && (
              <button 
                className="btn-enable-notifications"
                onClick={async () => {
                  const permiso = await solicitarPermiso();
                  setNotificacionesActivas(permiso);
                  if (permiso) {
                    alert('✅ Notificaciones activadas. Recibirás alertas sobre eventos importantes.');
                  }
                }}
              >
                Activar
              </button>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ Error de conexión: {error}
        </div>
      )}

      <main className="app-main">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === 'dashboard' && (
          <>
            <Dashboard datos={datos} />
            <PanelControl 
              modoActual={datos?.control?.modo || 'AUTO'}
              modoLuzActual={datos?.control?.modo_luz || 'AUTO'}
              onComandoEnviado={manejarComandoEnviado}
            />
          </>
        )}
        
        {activeTab === 'historial' && (
          <TablaHistorial historial={historial} />
        )}
      </main>

      <footer className="app-footer">
        <p>Actualización automática cada 1 segundo</p>
        {datos && (
          <p className="ultima-actualizacion">
            Última señal: {datos.ultima_actualizacion}
          </p>
        )}
      </footer>
    </div>
  );
}

export default App;

