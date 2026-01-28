import React, { useState, useMemo, useEffect } from 'react';
import { Filter, Search, Calendar, Droplets, Thermometer, Power, PawPrint, Clock } from 'lucide-react';
import './TablaHistorial.css';

// Dimensiones del recipiente para calcular litros
const ALTURA_RECIPIENTE = 6; // cm
const ANCHO_RECIPIENTE = 19.75; // cm
const LARGO_RECIPIENTE = 25; // cm
const VOLUMEN_TOTAL_LITROS = (ALTURA_RECIPIENTE * ANCHO_RECIPIENTE * LARGO_RECIPIENTE) / 1000;

const TablaHistorial = ({ historial }) => {
  const [filtroEvento, setFiltroEvento] = useState('todos');
  const [filtroBomba, setFiltroBomba] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState(''); // Filtro por fecha
  const [filtroHoraDesde, setFiltroHoraDesde] = useState(''); // Filtro hora desde
  const [filtroHoraHasta, setFiltroHoraHasta] = useState(''); // Filtro hora hasta
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fechaHora'); // 'fechaHora' o 'nivel' o 'temperatura'
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 20;

  // Obtener fechas únicas del historial
  const fechasDisponibles = useMemo(() => {
    const fechas = new Set();
    historial.forEach(item => {
      if (item.fecha) {
        fechas.add(item.fecha);
      }
    });
    return Array.from(fechas).sort().reverse(); // Más recientes primero
  }, [historial]);

  // Generar horas predefinidas desde 8:30 AM hasta 10:00 AM (cada minuto)
  const horasPredefinidas = useMemo(() => {
    const horas = [];
    const fechaBase = new Date('2026-01-28T08:30:00'); // Inicio a las 8:30 AM
    
    // Generar horas cada minuto desde 8:30 hasta 10:00 (90 minutos)
    for (let i = 0; i <= 90; i++) {
      const hora = new Date(fechaBase.getTime() + (i * 60 * 1000));
      const horaStr = hora.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      horas.push({
        value: horaStr,
        label: horaStr
      });
    }
    
    return horas;
  }, []);

  // Calcular litros desde porcentaje
  const calcularLitros = (porcentaje) => {
    return (VOLUMEN_TOTAL_LITROS * porcentaje) / 100;
  };

  // Filtrar y ordenar datos
  const datosFiltrados = useMemo(() => {
    let filtrados = [...historial];

    // Filtrar solo gatos y perros
    filtrados = filtrados.filter(item => {
      const tieneAnimal = item.evento === 'Gato' || item.evento === 'Perro';
      return tieneAnimal;
    });

    // Filtro por fecha
    if (filtroFecha) {
      filtrados = filtrados.filter(item => item.fecha === filtroFecha);
    }

    // Filtro por rango de horas (desde - hasta)
    if (filtroHoraDesde || filtroHoraHasta) {
      filtrados = filtrados.filter(item => {
        if (!item.hora) return false;
        const horaItem = item.hora.substring(0, 5); // "HH:mm"
        
        if (filtroHoraDesde && filtroHoraHasta) {
          // Rango completo: desde <= hora <= hasta
          return horaItem >= filtroHoraDesde && horaItem <= filtroHoraHasta;
        } else if (filtroHoraDesde) {
          // Solo desde
          return horaItem >= filtroHoraDesde;
        } else if (filtroHoraHasta) {
          // Solo hasta
          return horaItem <= filtroHoraHasta;
        }
        return true;
      });
    }

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
  }, [historial, filtroEvento, filtroBomba, filtroFecha, filtroHoraDesde, filtroHoraHasta, busqueda, ordenarPor]);

  // Calcular paginación
  const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const datosPaginados = datosFiltrados.slice(inicio, fin);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEvento, filtroBomba, filtroFecha, filtroHoraDesde, filtroHoraHasta, busqueda, ordenarPor]);

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
            <Calendar size={16} />
            <select
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="filtro-select"
            >
              <option value="">Todas las fechas</option>
              {fechasDisponibles.map((fecha, index) => (
                <option key={index} value={fecha}>
                  {fecha}
                </option>
              ))}
            </select>
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
            <Clock size={16} />
            <span style={{ color: '#aaa', fontSize: '0.85em', marginRight: '8px' }}>Desde:</span>
            <select
              value={filtroHoraDesde}
              onChange={(e) => setFiltroHoraDesde(e.target.value)}
              className="filtro-select"
            >
              <option value="">Todas</option>
              {horasPredefinidas.map((hora, index) => (
                <option key={index} value={hora.value}>
                  {hora.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filtro-grupo">
          <label>
            <Clock size={16} />
            <span style={{ color: '#aaa', fontSize: '0.85em', marginRight: '8px' }}>Hasta:</span>
            <select
              value={filtroHoraHasta}
              onChange={(e) => setFiltroHoraHasta(e.target.value)}
              className="filtro-select"
            >
              <option value="">Todas</option>
              {horasPredefinidas.map((hora, index) => (
                <option key={index} value={hora.value}>
                  {hora.label}
                </option>
              ))}
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
            {datosPaginados.length === 0 ? (
              <tr>
                <td colSpan="7" className="sin-resultados">
                  No se encontraron registros con los filtros aplicados
                </td>
              </tr>
            ) : (
              datosPaginados.map((item, index) => (
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

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
            disabled={paginaActual === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: paginaActual === 1 ? '#333' : '#4CAF50',
              color: '#fff',
              cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: paginaActual === 1 ? 0.5 : 1
            }}
          >
            ← Anterior
          </button>
          <span style={{ color: '#aaa', fontSize: '0.9em' }}>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
            disabled={paginaActual === totalPaginas}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: paginaActual === totalPaginas ? '#333' : '#4CAF50',
              color: '#fff',
              cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: paginaActual === totalPaginas ? 0.5 : 1
            }}
          >
            Siguiente →
          </button>
        </div>
      )}

      <p className="tabla-info">
        Mostrando {inicio + 1}-{Math.min(fin, datosFiltrados.length)} de {datosFiltrados.length} registros
        {datosFiltrados.length !== historial.length && ' (filtrados)'}
        {historial.length >= 1000 && ` | Total almacenados: ${historial.length}`}
      </p>
    </div>
  );
};

export default TablaHistorial;
