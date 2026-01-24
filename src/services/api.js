// URL base de tu servidor en Render
// ⚠️ CAMBIA ESTA URL por la de tu servidor en Render
const API_BASE_URL = 'https://proyecto-iot-fdl2.onrender.com';

/**
 * Obtiene el estado general del sistema
 * @returns {Promise<Object>} Datos del sistema
 */
export const obtenerEstado = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/general?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener estado:', error);
    throw error;
  }
};

/**
 * Envía un comando de control al servidor (Sistema Unificado)
 * @param {string} accion - "BOMBA_ON", "BOMBA_OFF", "BOMBA_AUTO", "LUZ_ON", "LUZ_OFF", "LUZ_AUTO"
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const enviarComando = async (accion) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accion }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar comando:', error);
    throw error;
  }
};

/**
 * @deprecated Usa enviarComando con "LUZ_ON", "LUZ_OFF", "LUZ_AUTO"
 * Mantenido por compatibilidad
 */
export const enviarComandoLuz = async (accion) => {
  // Convertir acciones antiguas a nuevas
  const accionesMap = {
    'LUZ_ON': 'LUZ_ON',
    'LUZ_OFF': 'LUZ_OFF',
    'LUZ_AUTO': 'LUZ_AUTO'
  };
  return enviarComando(accionesMap[accion] || accion);
};

