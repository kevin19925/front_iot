import React from 'react';
import './Dashboard.css';

const Dashboard = ({ datos }) => {
  if (!datos) {
    return (
      <div className="dashboard">
        <h2>📊 Dashboard</h2>
        <p>Cargando datos...</p>
      </div>
    );
  }

  const { sensores, control } = datos;
  const nivel = sensores?.nivel_agua || 0;
  const temperatura = sensores?.temperatura || 0;
  const bombaActiva = sensores?.bomba_estado_real || false;
  const ultimoAnimal = sensores?.ultimo_animal || 'Ninguno';
  const modo = control?.modo || 'AUTO';
  const modoLuz = control?.modo_luz || 'AUTO';
  const luzForzada = control?.forzar_luz || false;

  // Color según nivel de agua
  const getNivelColor = () => {
    if (nivel > 50) return '#4CAF50'; // Verde
    if (nivel > 20) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  return (
    <div className="dashboard">
      <h2>📊 Dashboard en Vivo</h2>
      
      <div className="dashboard-grid">
        {/* Tarjeta de Nivel de Agua */}
        <div className="card">
          <div className="card-label">Nivel de Agua</div>
          <div className="card-value" style={{ color: getNivelColor() }}>
            {nivel}%
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${nivel}%`, 
                backgroundColor: getNivelColor() 
              }}
            ></div>
          </div>
        </div>

        {/* Tarjeta de Temperatura */}
        <div className="card">
          <div className="card-label">Temperatura</div>
          <div className="card-value temperatura">
            {temperatura}°C
          </div>
        </div>

        {/* Tarjeta de Estado Bomba */}
        <div className="card">
          <div className="card-label">Estado Bomba</div>
          <div className={`led ${bombaActiva ? 'led-on' : 'led-off'}`}>
            <div className="led-circle"></div>
            <div className="led-text">
              {bombaActiva ? 'ENCENDIDA' : 'APAGADA'}
            </div>
          </div>
        </div>

        {/* Tarjeta de Modo */}
        <div className="card">
          <div className="card-label">Modo Actual</div>
          <div className="card-value modo">
            {modo}
          </div>
        </div>

        {/* Tarjeta de Detección de Animal - MEJORADA */}
        <div className={`card card-animal ${ultimoAnimal !== 'Ninguno' ? 'card-animal-detected' : ''}`}>
          <div className="card-label">Detección IA</div>
          {ultimoAnimal !== 'Ninguno' ? (
            <div className="animal-detection">
              <div className={`animal-icon ${ultimoAnimal.toLowerCase()}`}>
                {ultimoAnimal === 'Gato' ? '🐱' : '🐶'}
              </div>
              <div className="animal-name">{ultimoAnimal}</div>
              <div className="animal-badge">Detectado</div>
            </div>
          ) : (
            <div className="animal-detection no-animal">
              <div className="animal-icon none">👁️</div>
              <div className="animal-name">Ninguno</div>
              <div className="animal-badge idle">Esperando...</div>
            </div>
          )}
        </div>

        {/* Tarjeta de Estado Luz */}
        <div className="card">
          <div className="card-label">Estado Luz</div>
          <div className={`led ${luzForzada ? 'led-on' : 'led-off'}`}>
            <div className="led-circle"></div>
            <div className="led-text">
              {luzForzada ? 'ENCENDIDA' : 'APAGADA'}
            </div>
          </div>
          <div className="card-label" style={{ marginTop: '10px', fontSize: '0.75em' }}>
            Modo: {modoLuz}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

