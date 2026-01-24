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
 * Envía un comando de control al servidor
 * @param {string} accion - "ENCENDER", "APAGAR", o "AUTO"
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
 * Envía un comando de control de luz al servidor
 * @param {string} accion - "LUZ_ON", "LUZ_OFF", o "LUZ_AUTO"
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const enviarComandoLuz = async (accion) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/control/luz`, {
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
    console.error('Error al enviar comando de luz:', error);
    throw error;
  }
};

