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
  const [filtroTiempo, setFiltroTiempo] = useState('todos'); // Filtro por tiempo (horas/minutos)
  const [filtroHoraManual, setFiltroHoraManual] = useState(''); // Filtro por hora manual (HH:mm)
  const [busqueda, setBusqueda] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('fechaHora'); // 'fechaHora' o 'nivel' o 'temperatura'
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 20;

  // Generar 100 horas predefinidas (horas del día de hoy)
  const horasPredefinidas = useMemo(() => {
    const horas = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio del día
    
    // Generar horas cada 15 minutos durante 24 horas = 96 horas
    for (let i = 0; i < 96; i++) {
      const hora = new Date(hoy.getTime() + (i * 15 * 60 * 1000));
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
    
    // Agregar 4 horas más para llegar a 100
    for (let i = 96; i < 100; i++) {
      const hora = new Date(hoy.getTime() + (i * 15 * 60 * 1000));
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

    // Filtrar solo gatos y perros del día de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    
    filtrados = filtrados.filter(item => {
      if (!item.fechaHora) return false;
      const fechaItem = new Date(item.fechaHora);
      // Solo registros de hoy
      const esHoy = fechaItem >= hoy && fechaItem < mañana;
      // Solo registros con gato o perro
      const tieneAnimal = item.evento === 'Gato' || item.evento === 'Perro';
      return esHoy && tieneAnimal;
    });

    // Filtro por hora manual
    if (filtroHoraManual) {
      filtrados = filtrados.filter(item => {
        if (!item.hora) return false;
        // Comparar solo hora:minuto (sin segundos)
        const horaItem = item.hora.substring(0, 5); // "HH:mm"
        return horaItem === filtroHoraManual;
      });
    }

    // Filtro por tiempo (horas y minutos) - solo si no hay filtro manual
    if (filtroTiempo !== 'todos' && !filtroHoraManual) {
      const ahora = new Date();
      let minutosAtras = 0;
      
      switch (filtroTiempo) {
        case '15m':
          minutosAtras = 15;
          break;
        case '30m':
          minutosAtras = 30;
          break;
        case '1h':
          minutosAtras = 60;
          break;
        case '3h':
          minutosAtras = 180;
          break;
        case '6h':
          minutosAtras = 360;
          break;
        case '12h':
          minutosAtras = 720;
          break;
        case '24h':
          minutosAtras = 1440;
          break;
        default:
          minutosAtras = 0;
      }
      
      if (minutosAtras > 0) {
        const fechaLimite = new Date(ahora.getTime() - (minutosAtras * 60 * 1000));
        filtrados = filtrados.filter(item => {
          if (!item.fechaHora) return false;
          const fechaItem = new Date(item.fechaHora);
          return fechaItem >= fechaLimite;
        });
      }
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
  }, [historial, filtroEvento, filtroBomba, filtroTiempo, filtroHoraManual, busqueda, ordenarPor]);

  // Calcular paginación
  const totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);
  const inicio = (paginaActual - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const datosPaginados = datosFiltrados.slice(inicio, fin);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEvento, filtroBomba, filtroTiempo, filtroHoraManual, busqueda, ordenarPor]);

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
            <Clock size={16} />
            <input
              type="time"
              value={filtroHoraManual}
              onChange={(e) => {
                setFiltroHoraManual(e.target.value);
                setFiltroTiempo('todos'); // Resetear filtro de tiempo cuando se usa hora manual
              }}
              className="filtro-input"
              placeholder="Hora manual (HH:mm)"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '0.9em'
              }}
            />
          </label>
        </div>

        <div className="filtro-grupo">
          <label>
            <Clock size={16} />
            <select
              value={filtroTiempo}
              onChange={(e) => {
                setFiltroTiempo(e.target.value);
                setFiltroHoraManual(''); // Resetear hora manual cuando se usa filtro de tiempo
              }}
              className="filtro-select"
            >
              <option value="todos">Todo el tiempo</option>
              <option value="15m">Últimos 15 minutos</option>
              <option value="30m">Últimos 30 minutos</option>
              <option value="1h">Última hora</option>
              <option value="3h">Últimas 3 horas</option>
              <option value="6h">Últimas 6 horas</option>
              <option value="12h">Últimas 12 horas</option>
              <option value="24h">Últimas 24 horas</option>
            </select>
          </label>
        </div>

        <div className="filtro-grupo" style={{ gridColumn: '1 / -1' }}>
          <label style={{ width: '100%' }}>
            <Clock size={16} />
            <span style={{ color: '#aaa', fontSize: '0.85em', marginRight: '10px' }}>
              Horas predefinidas (100 horas del día):
            </span>
            <select
              value={filtroHoraManual}
              onChange={(e) => {
                setFiltroHoraManual(e.target.value);
                setFiltroTiempo('todos');
              }}
              className="filtro-select"
              style={{ width: '100%', maxWidth: '200px' }}
            >
              <option value="">Seleccionar hora...</option>
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
