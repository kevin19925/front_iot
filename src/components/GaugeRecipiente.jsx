import React from 'react';
import { Droplets } from 'lucide-react';
import './GaugeRecipiente.css';

// Dimensiones del recipiente en cm
const ALTURA_RECIPIENTE = 6; // cm
const ANCHO_RECIPIENTE = 19.75; // cm
const LARGO_RECIPIENTE = 25; // cm

// Volumen total en cm³
const VOLUMEN_TOTAL_CM3 = ALTURA_RECIPIENTE * ANCHO_RECIPIENTE * LARGO_RECIPIENTE;
// Convertir a litros (1 litro = 1000 cm³)
const VOLUMEN_TOTAL_LITROS = VOLUMEN_TOTAL_CM3 / 1000;

const GaugeRecipiente = ({ nivelPorcentaje, bombaActiva = false }) => {
  // Calcular volumen actual en litros
  const volumenActualLitros = (VOLUMEN_TOTAL_LITROS * nivelPorcentaje) / 100;
  const alturaAgua = (ALTURA_RECIPIENTE * nivelPorcentaje) / 100; // Altura del agua en cm

  // Color del agua siempre azul
  const colorAgua = '#00BFFF'; // Azul siempre
  
  // Color para indicadores (según nivel)
  const getColorNivel = (nivel) => {
    if (nivel > 50) return '#4CAF50'; // Verde
    if (nivel > 20) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  const colorIndicador = getColorNivel(nivelPorcentaje);
  
  // Mostrar burbujas solo si hay suficiente agua (>10%)
  const mostrarBurbujas = nivelPorcentaje > 10;

  return (
    <div className="gauge-recipiente-container">
      <div className="gauge-header">
        <Droplets size={28} color={colorAgua} />
        <h3>Nivel de Agua del Recipiente</h3>
        {bombaActiva && (
          <span style={{ 
            marginLeft: 'auto', 
            color: '#4CAF50', 
            fontSize: '0.9em',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: '600',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🔵 Bomba activa
          </span>
        )}
      </div>

      <div className="gauge-content">
        {/* Visualización 3D del Recipiente */}
        <div className="recipiente-3d">
          <div className="recipiente-fondo">
            {/* Agua dentro del recipiente */}
            <div 
              className={`agua-nivel ${bombaActiva ? 'bomba-activa' : 'bomba-inactiva'}`}
              style={{
                height: `${nivelPorcentaje}%`,
                backgroundColor: colorAgua,
                boxShadow: `0 0 20px ${colorAgua}80, inset 0 0 30px ${colorAgua}40`,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Capa base de agua con gradiente animado */}
              <div className="agua-base"></div>
              
              {/* Múltiples capas de ondas para efecto realista */}
              <div className="onda-agua onda-1" style={{ animationDelay: '0s' }}></div>
              <div className="onda-agua onda-2" style={{ animationDelay: '0.5s' }}></div>
              <div className="onda-agua onda-3" style={{ animationDelay: '1s' }}></div>
              <div className="onda-agua onda-4" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Reflejos y brillos que se mueven - Solo si hay agua */}
              {nivelPorcentaje > 5 && (
                <>
                  <div className="reflejo-agua reflejo-1"></div>
                  <div className="reflejo-agua reflejo-2"></div>
                </>
              )}
              
              {/* Partículas/burbujas flotantes - Solo si hay suficiente agua */}
              {mostrarBurbujas && (
                <>
                  <div className="burbuja burbuja-1"></div>
                  <div className="burbuja burbuja-2"></div>
                  <div className="burbuja burbuja-3"></div>
                </>
              )}
            </div>
            
            {/* Marcas de nivel */}
            <div className="marcas-nivel">
              <div className="marca marca-100">100%</div>
              <div className="marca marca-75">75%</div>
              <div className="marca marca-50">50%</div>
              <div className="marca marca-25">25%</div>
              <div className="marca marca-0">0%</div>
            </div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="gauge-info">
          <div className="info-card">
            <div className="info-label">Volumen Actual</div>
            <div className="info-value" style={{ color: colorAgua }}>
              {volumenActualLitros.toFixed(2)} L
            </div>
            <div className="info-subtext">
              {nivelPorcentaje.toFixed(1)}% del total
            </div>
          </div>

          <div className="info-card">
            <div className="info-label">Capacidad Total</div>
            <div className="info-value">
              {VOLUMEN_TOTAL_LITROS.toFixed(2)} L
            </div>
            <div className="info-subtext">
              {ALTURA_RECIPIENTE}cm × {ANCHO_RECIPIENTE}cm × {LARGO_RECIPIENTE}cm
            </div>
          </div>

          <div className="info-card">
            <div className="info-label">Altura del Agua</div>
            <div className="info-value" style={{ color: colorAgua }}>
              {alturaAgua.toFixed(2)} cm
            </div>
            <div className="info-subtext">
              de {ALTURA_RECIPIENTE}cm de altura total
            </div>
          </div>

          <div className="info-card">
            <div className="info-label">Volumen Restante</div>
            <div className="info-value">
              {(VOLUMEN_TOTAL_LITROS - volumenActualLitros).toFixed(2)} L
            </div>
            <div className="info-subtext">
              Espacio disponible
            </div>
          </div>
        </div>
      </div>

      {/* Barra de progreso adicional */}
      <div className="progreso-bar-container">
        <div className="progreso-bar-label">
          <span>Nivel: {nivelPorcentaje.toFixed(1)}%</span>
          <span>{volumenActualLitros.toFixed(2)} L / {VOLUMEN_TOTAL_LITROS.toFixed(2)} L</span>
        </div>
        <div className="progreso-bar">
          <div 
            className="progreso-bar-fill"
            style={{
              width: `${nivelPorcentaje}%`,
              backgroundColor: colorAgua,
              boxShadow: `0 0 15px ${colorAgua}60`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GaugeRecipiente;

