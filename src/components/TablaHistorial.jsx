import React, { useState, useMemo } from 'react';
import { Filter, Search, Calendar, Droplets, Thermometer, Power, PawPrint } from 'lucide-react';
import './TablaHistorial.css';

// Dimensiones del recipiente para calcular litros
const ALTURA_RECIPIENTE = 6; // cm
const ANCHO_RECIPIENTE = 19.75; // cm
const LARGO_RECIPIENTE = 25; // cm
const VOLUMEN_TOTAL_LITROS = (ALTURA_RECIPIENTE * ANCHO_RECIPIENTE * LARGO_RECIPIENTE) / 1000;

const TablaHistorial = ({ historial }) => {
  const [filtroEvento, setFiltroEvento] = useState('todos');
  const [filtroBomba, setFiltroBomba] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fechaHora'); // 'fechaHora' o 'nivel' o 'temperatura'

  // Calcular litros desde porcentaje
  const calcularLitros = (porcentaje) => {
    return (VOLUMEN_TOTAL_LITROS * porcentaje) / 100;
  };

  // Filtrar y ordenar datos
  const datosFiltrados = useMemo(() => {
    let filtrados = [...historial];

    // Filtro por evento
    if (filtroEvento !== 'todos') {
      filtrados = filtrados.filter(item => item.evento === filtroEvento);
    }

    // Filtro por bomba
    if (filtroBomba !== 'todos') {
      filtrados = filtrados.filter(item => 
        filtroBomba === 'on' ? item.bomba : !item.bomba
      );
    }

    // Búsqueda por texto
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      filtrados = filtrados.filter(item => 
        item.fecha?.toLowerCase().includes(busquedaLower) ||
        item.hora?.toLowerCase().includes(busquedaLower) ||
        item.evento?.toLowerCase().includes(busquedaLower) ||
        item.nivel?.toString().includes(busquedaLower) ||
        item.temperatura?.toString().includes(busquedaLower)
      );
    }

    // Ordenar
    filtrados.sort((a, b) => {
      if (ordenarPor === 'fechaHora') {
        return new Date(b.fechaHora) - new Date(a.fechaHora); // Más reciente primero
      } else if (ordenarPor === 'nivel') {
        return b.nivel - a.nivel; // Mayor a menor
      } else if (ordenarPor === 'temperatura') {
        return b.temperatura - a.temperatura; // Mayor a menor
      }
      return 0;
    });

    return filtrados;
  }, [historial, filtroEvento, filtroBomba, busqueda, ordenarPor]);

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

      {/* Panel de Filtros */}
      <div className="filtros-panel">
        <div className="filtro-grupo">
          <label>
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="filtro-input"
            />
          </label>
        </div>

        <div className="filtro-grupo">
          <label>
            <PawPrint size={16} />
            <select
              value={filtroEvento}
              onChange={(e) => setFiltroEvento(e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos los eventos</option>
              <option value="Gato">🐱 Gato</option>
              <option value="Perro">🐶 Perro</option>
              <option value="Ninguno">Sin evento</option>
            </select>
          </label>
        </div>

        <div className="filtro-grupo">
          <label>
            <Power size={16} />
            <select
              value={filtroBomba}
              onChange={(e) => setFiltroBomba(e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todas las bombas</option>
              <option value="on">🔵 Bomba ON</option>
              <option value="off">⚫ Bomba OFF</option>
            </select>
          </label>
        </div>

        <div className="filtro-grupo">
          <label>
            <Filter size={16} />
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              className="filtro-select"
            >
              <option value="fechaHora">Ordenar por fecha</option>
              <option value="nivel">Ordenar por nivel</option>
              <option value="temperatura">Ordenar por temperatura</option>
            </select>
          </label>
        </div>
      </div>

      {/* Tabla */}
      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>
                <Calendar size={16} /> Fecha
              </th>
              <th>
                <Calendar size={16} /> Hora
              </th>
              <th>
                <Droplets size={16} /> Nivel
              </th>
              <th>
                <Droplets size={16} /> Litros
              </th>
              <th>
                <Thermometer size={16} /> Temp.
              </th>
              <th>
                <Power size={16} /> Bomba
              </th>
              <th>
                <PawPrint size={16} /> Evento
              </th>
            </tr>
          </thead>
          <tbody>
            {datosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="sin-resultados">
                  No se encontraron registros con los filtros aplicados
                </td>
              </tr>
            ) : (
              datosFiltrados.map((item, index) => (
                <tr key={index} className={index === 0 ? 'fila-nueva' : ''}>
                  <td className="fecha-cell">{item.fecha || '--'}</td>
                  <td className="hora-cell">{item.hora || '--'}</td>
                  <td>
                    <span className={`nivel ${item.nivel > 50 ? 'alto' : item.nivel > 20 ? 'medio' : 'bajo'}`}>
                      {item.nivel?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="litros-cell">
                    <span className="litros-value">
                      {calcularLitros(item.nivel || 0).toFixed(2)} L
                    </span>
                  </td>
                  <td>{item.temperatura?.toFixed(1)}°C</td>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="tabla-info">
        Mostrando {datosFiltrados.length} de {historial.length} registros
        {datosFiltrados.length !== historial.length && ' (filtrados)'}
      </p>
    </div>
  );
};

export default TablaHistorial;
