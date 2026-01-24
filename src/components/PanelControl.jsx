import React, { useState } from 'react';
import { enviarComando, enviarComandoLuz } from '../services/api';
import './PanelControl.css';

const PanelControl = ({ modoActual, modoLuzActual, onComandoEnviado }) => {
  const [cargando, setCargando] = useState(false);
  const [cargandoLuz, setCargandoLuz] = useState(false);
  const [ultimoComando, setUltimoComando] = useState(null);
  const [ultimoComandoLuz, setUltimoComandoLuz] = useState(null);

  const manejarComando = async (accion) => {
    if (cargando) return; // Evitar clics dobles
    
    setCargando(true);
    setUltimoComando(accion);
    
    try {
      await enviarComando(accion);
      console.log(`✅ Comando enviado: ${accion}`);
      
      // Notificar al componente padre
      if (onComandoEnviado) {
        onComandoEnviado(accion);
      }
      
      // Deshabilitar botón por 2 segundos
      setTimeout(() => {
        setCargando(false);
        setUltimoComando(null);
      }, 2000);
    } catch (error) {
      console.error('Error al enviar comando:', error);
      alert(`Error al enviar comando: ${error.message}`);
      setCargando(false);
      setUltimoComando(null);
    }
  };

  const manejarComandoLuz = async (accion) => {
    if (cargandoLuz) return; // Evitar clics dobles
    
    setCargandoLuz(true);
    setUltimoComandoLuz(accion);
    
    try {
      await enviarComandoLuz(accion);
      console.log(`✅ Comando de luz enviado: ${accion}`);
      
      // Notificar al componente padre
      if (onComandoEnviado) {
        onComandoEnviado(`LUZ_${accion}`);
      }
      
      // Deshabilitar botón por 2 segundos
      setTimeout(() => {
        setCargandoLuz(false);
        setUltimoComandoLuz(null);
      }, 2000);
    } catch (error) {
      console.error('Error al enviar comando de luz:', error);
      alert(`Error al enviar comando de luz: ${error.message}`);
      setCargandoLuz(false);
      setUltimoComandoLuz(null);
    }
  };

  const getBotonActivo = (accion) => {
    if (accion === 'ENCENDER' && modoActual === 'MANUAL_ON') return true;
    if (accion === 'APAGAR' && modoActual === 'MANUAL_OFF') return true;
    if (accion === 'AUTO' && modoActual === 'AUTO') return true;
    return false;
  };

  const getBotonLuzActivo = (accion) => {
    if (accion === 'LUZ_ON' && modoLuzActual === 'MANUAL_ON') return true;
    if (accion === 'LUZ_OFF' && modoLuzActual === 'MANUAL_OFF') return true;
    if (accion === 'LUZ_AUTO' && modoLuzActual === 'AUTO') return true;
    return false;
  };

  return (
    <div className="panel-control">
      <h2>🎛️ Panel de Control</h2>
      
      <div className="control-group">
        <h3>Control de Bomba</h3>
        
        <div className="botones-grid">
          <button
            className={`btn-control ${getBotonActivo('ENCENDER') ? 'btn-active' : ''} ${cargando && ultimoComando === 'ENCENDER' ? 'btn-loading' : ''}`}
            onClick={() => manejarComando('ENCENDER')}
            disabled={cargando}
          >
            {cargando && ultimoComando === 'ENCENDER' ? '⏳' : '🔵'} Manual ON
          </button>
          
          <button
            className={`btn-control ${getBotonActivo('APAGAR') ? 'btn-active' : ''} ${cargando && ultimoComando === 'APAGAR' ? 'btn-loading' : ''}`}
            onClick={() => manejarComando('APAGAR')}
            disabled={cargando}
          >
            {cargando && ultimoComando === 'APAGAR' ? '⏳' : '⚫'} Manual OFF
          </button>
          
          <button
            className={`btn-control ${getBotonActivo('AUTO') ? 'btn-active' : ''} ${cargando && ultimoComando === 'AUTO' ? 'btn-loading' : ''}`}
            onClick={() => manejarComando('AUTO')}
            disabled={cargando}
          >
            {cargando && ultimoComando === 'AUTO' ? '⏳' : '🔄'} Modo AUTO
          </button>
        </div>
      </div>

      <div className="control-group">
        <h3>Control de Luz</h3>
        
        <div className="botones-grid">
          <button
            className={`btn-control btn-luz ${getBotonLuzActivo('LUZ_ON') ? 'btn-active' : ''} ${cargandoLuz && ultimoComandoLuz === 'LUZ_ON' ? 'btn-loading' : ''}`}
            onClick={() => manejarComandoLuz('LUZ_ON')}
            disabled={cargandoLuz}
          >
            {cargandoLuz && ultimoComandoLuz === 'LUZ_ON' ? '⏳' : '💡'} Manual ON
          </button>
          
          <button
            className={`btn-control btn-luz ${getBotonLuzActivo('LUZ_OFF') ? 'btn-active' : ''} ${cargandoLuz && ultimoComandoLuz === 'LUZ_OFF' ? 'btn-loading' : ''}`}
            onClick={() => manejarComandoLuz('LUZ_OFF')}
            disabled={cargandoLuz}
          >
            {cargandoLuz && ultimoComandoLuz === 'LUZ_OFF' ? '⏳' : '🌙'} Manual OFF
          </button>
          
          <button
            className={`btn-control btn-luz ${getBotonLuzActivo('LUZ_AUTO') ? 'btn-active' : ''} ${cargandoLuz && ultimoComandoLuz === 'LUZ_AUTO' ? 'btn-loading' : ''}`}
            onClick={() => manejarComandoLuz('LUZ_AUTO')}
            disabled={cargandoLuz}
          >
            {cargandoLuz && ultimoComandoLuz === 'LUZ_AUTO' ? '⏳' : '🔄'} Modo AUTO
          </button>
        </div>
      </div>

      {(ultimoComando || ultimoComandoLuz) && (
        <div className="feedback">
          Comando enviado: <strong>{ultimoComando || ultimoComandoLuz}</strong>
        </div>
      )}
    </div>
  );
};

export default PanelControl;

