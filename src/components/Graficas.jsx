import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Droplets, Thermometer, Lightbulb } from 'lucide-react';
import './Graficas.css';

const Graficas = ({ historial, datosActuales }) => {
  // Preparar datos para las gráficas (últimos 20 registros)
  const datosGrafica = historial.slice(0, 20).reverse().map((item, index) => ({
    tiempo: item.hora || `${index}`,
    nivel: item.nivel || 0,
    temperatura: item.temperatura || 0,
  }));

  // Datos para gráfica circular (estado actual)
  const datosPie = [
    { name: 'Nivel Agua', value: datosActuales?.sensores?.nivel_agua || 0, color: '#00BFFF' },
    { name: 'Restante', value: 100 - (datosActuales?.sensores?.nivel_agua || 0), color: '#333' }
  ];

  // Colores para las gráficas
  const COLORS = {
    nivel: '#00BFFF',
    temperatura: '#FF6347',
    luz: '#FFD700',
    bomba: '#4CAF50'
  };

  return (
    <div className="graficas-container">
      {/* Gráfica de Línea - Nivel de Agua y Temperatura */}
      <div className="grafica-card" style={{ gridColumn: '1 / -1' }}>
        <div className="grafica-header">
          <Droplets size={24} color={COLORS.nivel} />
          <h3>Nivel de Agua y Temperatura en Tiempo Real</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={datosGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNivel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.nivel} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.nivel} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.temperatura} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS.temperatura} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="tiempo" 
              stroke="#888" 
              style={{ fontSize: '12px' }}
              tick={{ fill: '#aaa' }}
            />
            <YAxis 
              stroke="#888" 
              style={{ fontSize: '12px' }}
              tick={{ fill: '#aaa' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#fff', paddingTop: '20px' }}
            />
            <Area 
              type="monotone" 
              dataKey="nivel" 
              stroke={COLORS.nivel} 
              fillOpacity={1} 
              fill="url(#colorNivel)"
              name="Nivel Agua (%)"
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="temperatura" 
              stroke={COLORS.temperatura} 
              fillOpacity={1} 
              fill="url(#colorTemp)"
              name="Temperatura (°C)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica de Barras - Comparación de Sensores */}
      <div className="grafica-card">
        <div className="grafica-header">
          <Thermometer size={24} color={COLORS.temperatura} />
          <h3>Comparación de Sensores</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={[{
            name: 'Actual',
            nivel: datosActuales?.sensores?.nivel_agua || 0,
            temperatura: datosActuales?.sensores?.temperatura || 0,
            luz: (datosActuales?.sensores?.luz || 0) / 40, // Normalizar luz
          }]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#888" tick={{ fill: '#aaa' }} />
            <YAxis stroke="#888" tick={{ fill: '#aaa' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#fff', paddingTop: '20px' }}
            />
            <Bar dataKey="nivel" fill={COLORS.nivel} name="Nivel Agua (%)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="temperatura" fill={COLORS.temperatura} name="Temperatura (°C)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="luz" fill={COLORS.luz} name="Luz (normalizado)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica Circular - Nivel de Agua */}
      <div className="grafica-card">
        <div className="grafica-header">
          <Droplets size={24} color={COLORS.nivel} />
          <h3>Nivel de Agua Actual</h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datosPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {datosPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div style={{ 
            fontSize: '2.5em', 
            fontWeight: 'bold', 
            color: COLORS.nivel,
            textShadow: `0 0 20px ${COLORS.nivel}40`
          }}>
            {datosActuales?.sensores?.nivel_agua || 0}%
          </div>
        </div>
      </div>

      {/* Gráfica de Línea Simple - Tendencia de Temperatura */}
      <div className="grafica-card">
        <div className="grafica-header">
          <Thermometer size={24} color={COLORS.temperatura} />
          <h3>Tendencia de Temperatura</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosGrafica} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="tiempo" 
              stroke="#888" 
              style={{ fontSize: '12px' }}
              tick={{ fill: '#aaa' }}
            />
            <YAxis 
              stroke="#888" 
              style={{ fontSize: '12px' }}
              tick={{ fill: '#aaa' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="temperatura" 
              stroke={COLORS.temperatura} 
              strokeWidth={3}
              dot={{ fill: COLORS.temperatura, r: 5 }}
              activeDot={{ r: 8 }}
              name="Temperatura (°C)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Graficas;

