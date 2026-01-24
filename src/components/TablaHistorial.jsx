import React from 'react';
import './TablaHistorial.css';

const TablaHistorial = ({ historial }) => {
  if (!historial || historial.length === 0) {
    return (
      <div className="tabla-historial">
        <h2>📋 Historial en Tiempo Real</h2>
        <p className="sin-datos">Esperando datos...</p>
      </div>
    );
  }

  return (
    <div className="tabla-historial">
      <h2>📋 Historial en Tiempo Real</h2>
      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Nivel (%)</th>
              <th>Temperatura (°C)</th>
              <th>Bomba</th>
              <th>Evento</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item, index) => (
              <tr key={index} className={index === 0 ? 'fila-nueva' : ''}>
                <td>{item.hora}</td>
                <td>
                  <span className={`nivel ${item.nivel > 50 ? 'alto' : item.nivel > 20 ? 'medio' : 'bajo'}`}>
                    {item.nivel}%
                  </span>
                </td>
                <td>{item.temperatura}°C</td>
                <td>
                  <span className={`bomba ${item.bomba ? 'on' : 'off'}`}>
                    {item.bomba ? '🔵 ON' : '⚫ OFF'}
                  </span>
                </td>
                <td className="evento">
                  {item.evento !== 'Ninguno' ? (
                    <span className={`evento-badge ${item.evento.toLowerCase()}`}>
                      {item.evento === 'Gato' ? '🐱' : '🐶'} {item.evento}
                    </span>
                  ) : (
                    <span className="evento-badge none">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tabla-info">Mostrando últimos {historial.length} registros</p>
    </div>
  );
};

export default TablaHistorial;

