import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Droplets, Thermometer, Zap, PawPrint, Power, Lightbulb, RefreshCw, Bell, BellOff, Download, Smartphone } from 'lucide-react';
import { obtenerEstado, enviarComando } from './services/api';
import { solicitarPermiso, analizarYNotificar, verificarPermisos } from './services/notificaciones';
import TablaHistorial from './components/TablaHistorial';
import Graficas from './components/Graficas';
import GaugeRecipiente from './components/GaugeRecipiente';
import Tabs from './components/Tabs';
import './App.css';

const API_URL = "https://proyecto-iot-fdl2.onrender.com/api";

function App() {
  const [datos, setDatos] = useState({
    sensores: {
      nivel_agua: 0,
      temperatura: 0,
      bomba_estado_real: false,
      luz: 0,
      ultimo_animal: "Cargando..."
    },
    control: { 
      modo: "AUTO",
      modo_bomba: "AUTO", 
      modo_luz: "AUTO" 
    },
    ultima_actualizacion: "--"
  });

  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mostrarBotonInstalar, setMostrarBotonInstalar] = useState(false);

  // Función para agregar datos al historial
  const agregarAlHistorial = useCallback((nuevosDatos) => {
    if (!nuevosDatos || !nuevosDatos.sensores) return;

    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const hora = ahora.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    const registro = {
      fecha: fecha,
      hora: hora,
      fechaHora: ahora.toISOString(), // Para ordenamiento
      nivel: nuevosDatos.sensores.nivel_agua || 0,
      temperatura: nuevosDatos.sensores.temperatura || 0,
      bomba: nuevosDatos.sensores.bomba_estado_real || false,
      evento: nuevosDatos.sensores.ultimo_animal || 'Ninguno',
    };

    setHistorial((prev) => {
      const nuevoHistorial = [registro, ...prev];
      return nuevoHistorial.slice(0, 50); // Aumentar a 50 registros
    });
  }, []);

  // 1. LEER DATOS (Polling)
  const obtenerDatos = async () => {
    try {
      const json = await obtenerEstado();
      setDatos(json);
      setConectado(true);
      setError(null);
      agregarAlHistorial(json);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      setConectado(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 1000);
    return () => clearInterval(intervalo);
  }, [agregarAlHistorial]);

  // Efecto para solicitar permiso de notificaciones
  useEffect(() => {
    const inicializarNotificaciones = async () => {
      const permiso = await solicitarPermiso();
      setNotificacionesActivas(permiso);
    };
    inicializarNotificaciones();
  }, []);

  // Efecto para analizar y notificar cambios
  useEffect(() => {
    if (datos && notificacionesActivas && datos.sensores) {
      analizarYNotificar(datos);
    }
  }, [datos, notificacionesActivas]);

  // Verificar permisos periódicamente
  useEffect(() => {
    const intervaloPermisos = setInterval(() => {
      const nuevoEstado = verificarPermisos();
      if (nuevoEstado !== notificacionesActivas) {
        setNotificacionesActivas(nuevoEstado);
      }
    }, 5000);
    return () => clearInterval(intervaloPermisos);
  }, [notificacionesActivas]);

  // Detectar si la PWA puede instalarse
  useEffect(() => {
    // Verificar si ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isStandalone) {
      setMostrarBotonInstalar(false);
      return;
    }

    // Para Android/Chrome - capturar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setMostrarBotonInstalar(true);
    };

    // Para iOS - siempre mostrar el botón con instrucciones
    if (isIOS) {
      setMostrarBotonInstalar(true);
    } else {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (!isIOS) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  // Función para instalar la PWA
  const instalarPWA = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Mostrar instrucciones para iOS
      alert('Para instalar en iOS:\n\n1. Toca el botón de compartir (□↑)\n2. Selecciona "Agregar a pantalla de inicio"\n3. Toca "Agregar"');
    } else if (deferredPrompt) {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
        setMostrarBotonInstalar(false);
      } else {
        console.log('❌ Usuario rechazó instalar la PWA');
      }
      
      setDeferredPrompt(null);
    }
  };

  // 2. FUNCIÓN ÚNICA DE CONTROL
  const enviarComandoUnificado = async (accion) => {
    if (cargando) return;
    setCargando(true);
    try {
      await enviarComando(accion);
      setTimeout(obtenerDatos, 300);
    } catch (error) {
      alert("Error enviando comando: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  // Estilos rápidos mejorados
  const btnStyle = (color, activo = false) => ({
    flex: 1, 
    background: activo 
      ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` 
      : 'linear-gradient(135deg, #444 0%, #333 100%)', 
    border: activo ? `2px solid ${color}` : '2px solid #555', 
    padding: '14px 16px', 
    borderRadius: '10px', 
    color: 'white', 
    fontWeight: '700', 
    fontSize: '0.95em',
    cursor: cargando ? 'not-allowed' : 'pointer',
    opacity: cargando ? 0.6 : 1,
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: activo 
      ? `0 4px 15px ${color}60, 0 0 0 1px ${color}40` 
      : '0 2px 8px rgba(0, 0, 0, 0.3)',
    transform: activo ? 'scale(1.05)' : 'scale(1)',
    minHeight: '48px' // Tamaño táctil mínimo para móviles
  });

  // Componente Card mejorado
  const Card = ({ titulo, icono, valor, color = '#fff' }) => (
    <div 
      className="sensor-card"
      style={{ 
        background: 'linear-gradient(135deg, rgba(45, 45, 45, 0.95) 0%, rgba(35, 35, 35, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        padding: '20px', 
        borderRadius: '12px', 
        textAlign: 'center', 
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '10px',
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
      }}>
        {icono}
      </div>
      <div style={{ 
        color: '#bbb', 
        fontSize: '0.75em', 
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px'
      }}>
        {titulo}
      </div>
      <div style={{ 
        fontSize: '1.8em', 
        fontWeight: '700', 
        color,
        textShadow: `0 2px 8px ${color}40`
      }}>
        {valor}
      </div>
    </div>
  );

  return (
    <div className="app" style={{ 
      minHeight: '-webkit-fill-available',
      backgroundColor: '#121212', 
      color: 'white', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', 
      padding: '20px',
      paddingTop: 'max(20px, env(safe-area-inset-top))',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      width: '100%',
      position: 'relative'
    }}>
      
      {/* HEADER */}
      <header className="app-header" style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '25px 20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
      }}>
        <h1 style={{ 
          color: '#4CAF50', 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          alignItems: 'center',
          fontSize: 'clamp(1.5em, 4vw, 2.2em)',
          fontWeight: '700',
          marginBottom: '15px'
        }}>
          <Activity size={28} /> PANEL DE CONTROL IOT
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '15px', 
          marginTop: '10px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ 
            color: conectado ? '#4CAF50' : '#F44336', 
            fontSize: '0.9em', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 15px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '20px'
          }}>
            <span style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: conectado ? '#4CAF50' : '#F44336',
              display: 'inline-block',
              animation: conectado ? 'blink 1s infinite' : 'none',
              boxShadow: conectado ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none'
            }}></span>
            {conectado ? 'Conectado' : 'Desconectado'}
          </div>
          <div style={{ 
            color: '#888', 
            fontSize: '0.9em', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 15px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '20px'
          }}>
            {notificacionesActivas ? <Bell size={16} color="#4CAF50" /> : <BellOff size={16} color="#888" />}
            <span style={{ fontSize: '0.85em' }}>
              {notificacionesActivas ? 'Notificaciones ON' : 'Notificaciones OFF'}
            </span>
            {!notificacionesActivas && Notification.permission !== 'denied' && (
              <button 
                className="btn-enable-notifications"
                onClick={async () => {
                  const permiso = await solicitarPermiso();
                  setNotificacionesActivas(permiso);
                }}
                style={{ 
                  marginLeft: '5px', 
                  padding: '5px 12px', 
                  fontSize: '0.8em',
                  background: '#4CAF50',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Activar
              </button>
            )}
          </div>
          
          {/* Botón de Instalar PWA */}
          {mostrarBotonInstalar && (
            <div style={{ 
              marginTop: '15px',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={instalarPWA}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.95em',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
                }}
              >
                <Smartphone size={18} />
                Instalar App
              </button>
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ Error de conexión: {error}
        </div>
      )}

      {/* TABS AL INICIO */}
      <div style={{ marginBottom: '30px', maxWidth: '800px', margin: '0 auto 30px' }}>
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* TARJETAS DE SENSORES */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px', 
            maxWidth: '800px', 
            margin: '0 auto 30px' 
          }}>
            <Card 
              titulo="Nivel Agua" 
              icono={<Droplets color="#00BFFF" size={28}/>} 
              valor={`${datos.sensores.nivel_agua}%`}
              color={datos.sensores.nivel_agua > 50 ? '#4CAF50' : datos.sensores.nivel_agua > 20 ? '#FF9800' : '#F44336'}
            />
            <Card 
              titulo="Temperatura" 
              icono={<Thermometer color="#FF6347" size={28}/>} 
              valor={`${datos.sensores.temperatura}°C`}
              color="#FF6347"
            />
            <Card 
              titulo="Luz (LDR)" 
              icono={<Lightbulb color="#FFD700" size={28}/>} 
              valor={datos.sensores.luz}
              color="#FFD700"
            />
            <Card 
              titulo="Detección" 
              icono={<PawPrint color="#DA70D6" size={28}/>} 
              valor={datos.sensores.ultimo_animal}
              color="#DA70D6"
            />
            {/* Estado Real Bomba */}
            <Card 
              titulo="Estado Bomba" 
              icono={<Power color={datos.sensores.bomba_estado_real ? "#00FF00" : "#FF5555"} size={28}/>} 
              valor={datos.sensores.bomba_estado_real ? "ON" : "OFF"}
              color={datos.sensores.bomba_estado_real ? "#00FF00" : "#FF5555"}
            />
            {/* Estado Real Luz (basado en modo) */}
            <Card 
              titulo="Estado Luz" 
              icono={<Lightbulb color={datos.control.modo_luz === 'MANUAL_ON' ? "#FFD700" : "#666"} size={28}/>} 
              valor={datos.control.modo_luz === 'MANUAL_ON' ? "ON" : datos.control.modo_luz === 'MANUAL_OFF' ? "OFF" : "AUTO"}
              color={datos.control.modo_luz === 'MANUAL_ON' ? "#FFD700" : datos.control.modo_luz === 'MANUAL_OFF' ? "#666" : "#1565C0"}
            />
          </div>

          {/* GAUGE RECIPIENTE - Visualización 3D */}
          <div style={{ maxWidth: '1200px', margin: '0 auto 30px' }}>
            <GaugeRecipiente nivelPorcentaje={datos.sensores.nivel_agua || 0} />
          </div>

          {/* --- PANELES DE CONTROL --- */}
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            
            {/* PANEL BOMBA */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(25, 25, 25, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              padding: '25px', 
              borderRadius: '16px', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              <h3 style={{ 
                color: '#00BFFF', 
                borderBottom: '2px solid rgba(0, 191, 255, 0.3)', 
                paddingBottom: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '1.2em',
                fontWeight: '700',
                marginBottom: '15px'
              }}>
                <Droplets size={24} /> BOMBA DE AGUA
              </h3>
              
              {/* Estado Real en Tiempo Real */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#aaa', fontSize: '0.9em' }}>Estado Real:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%',
                    backgroundColor: datos.sensores.bomba_estado_real ? '#00FF00' : '#FF5555',
                    boxShadow: datos.sensores.bomba_estado_real ? '0 0 10px rgba(0, 255, 0, 0.6)' : 'none',
                    animation: datos.sensores.bomba_estado_real ? 'blink 1s infinite' : 'none'
                  }}></span>
                  <strong style={{ 
                    color: datos.sensores.bomba_estado_real ? '#00FF00' : '#FF5555',
                    fontSize: '1.1em'
                  }}>
                    {datos.sensores.bomba_estado_real ? 'ENCENDIDA' : 'APAGADA'}
                  </strong>
                </div>
              </div>

              <p style={{ 
                color: '#aaa', 
                fontSize: '0.9em', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Modo: <strong style={{ 
                  color: '#fff',
                  background: 'rgba(0, 191, 255, 0.2)',
                  padding: '4px 12px',
                  borderRadius: '6px'
                }}>
                  {datos.control.modo_bomba || datos.control.modo || 'AUTO'}
                </strong>
              </p>
              
              {/* Si está en AUTO, mostrar solo botón para cambiar a MANUAL */}
              {(datos.control.modo_bomba === 'AUTO' || datos.control.modo === 'AUTO') ? (
                <button 
                  style={{
                    width: '100%',
                    ...btnStyle('#FF9800', false),
                    marginTop: '10px'
                  }}
                  onClick={() => enviarComandoUnificado("BOMBA_ON")}
                  disabled={cargando}
                >
                  <Power size={18}/> Cambiar a Modo Manual
                </button>
              ) : (
                /* Si está en MANUAL, mostrar menú desplegable */
                <div style={{ 
                  marginTop: '15px',
                  animation: 'slideDown 0.3s ease'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    marginBottom: '10px'
                  }}>
                    <button 
                      style={btnStyle('#2E7D32', datos.control.modo_bomba === 'MANUAL_ON' || datos.control.modo === 'MANUAL_ON')} 
                      onClick={() => enviarComandoUnificado("BOMBA_ON")}
                      disabled={cargando}
                    >
                      <Power size={18}/> ENCENDER
                    </button>
                    <button 
                      style={btnStyle('#C62828', datos.control.modo_bomba === 'MANUAL_OFF' || datos.control.modo === 'MANUAL_OFF')} 
                      onClick={() => enviarComandoUnificado("BOMBA_OFF")}
                      disabled={cargando}
                    >
                      <Power size={18}/> APAGAR
                    </button>
                  </div>
                  <button 
                    style={{
                      width: '100%',
                      ...btnStyle('#1565C0', false)
                    }}
                    onClick={() => enviarComandoUnificado("BOMBA_AUTO")}
                    disabled={cargando}
                  >
                    <RefreshCw size={18}/> Volver a AUTO
                  </button>
                </div>
              )}
            </div>

            {/* PANEL LUZ */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(25, 25, 25, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              padding: '25px', 
              borderRadius: '16px', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
            }}>
              <h3 style={{ 
                color: '#FFD700', 
                borderBottom: '2px solid rgba(255, 215, 0, 0.3)', 
                paddingBottom: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                fontSize: '1.2em',
                fontWeight: '700',
                marginBottom: '15px'
              }}>
                <Lightbulb size={24} /> ILUMINACIÓN
              </h3>
              
              {/* Estado Real en Tiempo Real */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#aaa', fontSize: '0.9em' }}>Estado Real:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%',
                    backgroundColor: datos.control.modo_luz === 'MANUAL_ON' ? '#FFD700' : '#666',
                    boxShadow: datos.control.modo_luz === 'MANUAL_ON' ? '0 0 10px rgba(255, 215, 0, 0.6)' : 'none',
                    animation: datos.control.modo_luz === 'MANUAL_ON' ? 'blink 1s infinite' : 'none'
                  }}></span>
                  <strong style={{ 
                    color: datos.control.modo_luz === 'MANUAL_ON' ? '#FFD700' : datos.control.modo_luz === 'MANUAL_OFF' ? '#666' : '#1565C0',
                    fontSize: '1.1em'
                  }}>
                    {datos.control.modo_luz === 'MANUAL_ON' ? 'ENCENDIDA' : datos.control.modo_luz === 'MANUAL_OFF' ? 'APAGADA' : 'AUTO'}
                  </strong>
                </div>
              </div>

              <p style={{ 
                color: '#aaa', 
                fontSize: '0.9em', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Modo: <strong style={{ 
                  color: '#fff',
                  background: 'rgba(255, 215, 0, 0.2)',
                  padding: '4px 12px',
                  borderRadius: '6px'
                }}>
                  {datos.control.modo_luz || 'AUTO'}
                </strong>
              </p>
              
              {/* Si está en AUTO, mostrar solo botón para cambiar a MANUAL */}
              {datos.control.modo_luz === 'AUTO' ? (
                <button 
                  style={{
                    width: '100%',
                    ...btnStyle('#FF9800', false),
                    marginTop: '10px'
                  }}
                  onClick={() => enviarComandoUnificado("LUZ_ON")}
                  disabled={cargando}
                >
                  <Lightbulb size={18}/> Cambiar a Modo Manual
                </button>
              ) : (
                /* Si está en MANUAL, mostrar menú desplegable */
                <div style={{ 
                  marginTop: '15px',
                  animation: 'slideDown 0.3s ease'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    marginBottom: '10px'
                  }}>
                    <button 
                      style={btnStyle('#F9A825', datos.control.modo_luz === 'MANUAL_ON')} 
                      onClick={() => enviarComandoUnificado("LUZ_ON")}
                      disabled={cargando}
                    >
                      <Lightbulb size={18}/> ENCENDER
                    </button>
                    <button 
                      style={btnStyle('#424242', datos.control.modo_luz === 'MANUAL_OFF')} 
                      onClick={() => enviarComandoUnificado("LUZ_OFF")}
                      disabled={cargando}
                    >
                      <Lightbulb size={18}/> APAGAR
                    </button>
                  </div>
                  <button 
                    style={{
                      width: '100%',
                      ...btnStyle('#1565C0', false)
                    }}
                    onClick={() => enviarComandoUnificado("LUZ_AUTO")}
                    disabled={cargando}
                  >
                    <RefreshCw size={18}/> Volver a AUTO
                  </button>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {activeTab === 'graficas' && (
        <Graficas historial={historial} datosActuales={datos} />
      )}

      {activeTab === 'historial' && (
        <TablaHistorial historial={historial} />
      )}

      <footer className="app-footer" style={{ marginTop: '40px' }}>
        <p style={{ marginBottom: '8px' }}>🔄 Actualización automática cada 1 segundo</p>
        {datos && (
          <p className="ultima-actualizacion" style={{ 
            color: '#4CAF50',
            fontWeight: '600'
          }}>
            ⏱️ Última señal: {datos.ultima_actualizacion}
          </p>
        )}
      </footer>
    </div>
  );
}

export default App;
