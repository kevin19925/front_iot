/**
 * Servicio para manejar notificaciones del navegador
 */

let permisoConcedido = false;
let datosAnteriores = null;

/**
 * Solicita permiso para mostrar notificaciones
 */
export const solicitarPermiso = async () => {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    permisoConcedido = true;
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permiso = await Notification.requestPermission();
    permisoConcedido = permiso === 'granted';
    return permisoConcedido;
  }

  return false;
};

/**
 * Muestra una notificación
 * @param {string} titulo - Título de la notificación
 * @param {object} opciones - Opciones de la notificación
 */
export const mostrarNotificacion = (titulo, opciones = {}) => {
  if (!permisoConcedido && Notification.permission !== 'granted') {
    return;
  }

  const opcionesDefault = {
    icon: '/favicon.ico', // Puedes cambiar esto por una imagen
    badge: '/favicon.ico',
    tag: 'bebedero-iot', // Evita notificaciones duplicadas
    requireInteraction: false,
    ...opciones,
  };

  try {
    const notificacion = new Notification(titulo, opcionesDefault);
    
    // Cerrar automáticamente después de 5 segundos
    setTimeout(() => {
      notificacion.close();
    }, 5000);

    // Hacer clic en la notificación para enfocar la ventana
    notificacion.onclick = () => {
      window.focus();
      notificacion.close();
    };
  } catch (error) {
    console.error('Error al mostrar notificación:', error);
  }
};

/**
 * Analiza los datos y muestra notificaciones según eventos
 * @param {object} datosActuales - Datos actuales del sistema
 */
export const analizarYNotificar = (datosActuales) => {
  if (!datosActuales || !datosActuales.sensores) return;

  // Primera vez, solo guardar datos
  if (!datosAnteriores) {
    datosAnteriores = { ...datosActuales };
    return;
  }

  const sensoresActuales = datosActuales.sensores;
  const sensoresAnteriores = datosAnteriores.sensores;
  const controlActual = datosActuales.control;
  const controlAnterior = datosAnteriores.control;

  // 1. Notificación: Nivel de agua bajo (< 20%)
  if (sensoresActuales.nivel_agua < 20 && sensoresAnteriores.nivel_agua >= 20) {
    mostrarNotificacion('⚠️ Nivel de Agua Bajo', {
      body: `El nivel de agua está en ${sensoresActuales.nivel_agua}%. ¡Recarga el bebedero!`,
      icon: '💧',
      tag: 'nivel-bajo',
    });
  }

  // 2. Notificación: Nivel crítico (< 10%)
  if (sensoresActuales.nivel_agua < 10 && sensoresAnteriores.nivel_agua >= 10) {
    mostrarNotificacion('🚨 Nivel de Agua Crítico', {
      body: `¡ATENCIÓN! El nivel está en ${sensoresActuales.nivel_agua}%. Recarga urgente.`,
      icon: '🚨',
      tag: 'nivel-critico',
      requireInteraction: true, // Requiere interacción para crítico
    });
  }

  // 3. Notificación: Animal detectado
  if (
    sensoresActuales.ultimo_animal !== 'Ninguno' &&
    sensoresActuales.ultimo_animal !== sensoresAnteriores.ultimo_animal
  ) {
    const emoji = sensoresActuales.ultimo_animal === 'Gato' ? '🐱' : '🐶';
    mostrarNotificacion(`${emoji} ${sensoresActuales.ultimo_animal} Detectado`, {
      body: `Se detectó un ${sensoresActuales.ultimo_animal.toLowerCase()} en el bebedero.`,
      icon: emoji,
      tag: `animal-${Date.now()}`, // Único para cada detección
    });
  }

  // 4. Notificación: Bomba encendida
  if (
    sensoresActuales.bomba_estado_real === true &&
    sensoresAnteriores.bomba_estado_real === false
  ) {
    mostrarNotificacion('🔵 Bomba Activada', {
      body: 'La bomba se ha encendido para llenar el bebedero.',
      icon: '💧',
      tag: 'bomba-on',
    });
  }

  // 5. Notificación: Bomba apagada
  if (
    sensoresActuales.bomba_estado_real === false &&
    sensoresAnteriores.bomba_estado_real === true
  ) {
    mostrarNotificacion('⚫ Bomba Desactivada', {
      body: 'La bomba se ha apagado. El bebedero está lleno.',
      icon: '✅',
      tag: 'bomba-off',
    });
  }

  // 6. Notificación: Cambio de modo
  if (controlActual.modo !== controlAnterior.modo) {
    const modoEmoji = {
      AUTO: '🔄',
      MANUAL_ON: '🔵',
      MANUAL_OFF: '⚫',
    };

    mostrarNotificacion(`Modo Cambiado: ${controlActual.modo}`, {
      body: `El sistema ahora está en modo ${controlActual.modo}.`,
      icon: modoEmoji[controlActual.modo] || '⚙️',
      tag: 'modo-cambio',
    });
  }

  // 7. Notificación: Temperatura alta (> 30°C)
  if (sensoresActuales.temperatura > 30 && sensoresAnteriores.temperatura <= 30) {
    mostrarNotificacion('🌡️ Temperatura Alta', {
      body: `La temperatura es de ${sensoresActuales.temperatura}°C. El agua puede estar caliente.`,
      icon: '🌡️',
      tag: 'temp-alta',
    });
  }

  // 8. Notificación: Cambio de modo de luz
  if (controlActual.modo_luz !== controlAnterior.modo_luz) {
    const modoLuzEmoji = {
      AUTO: '🔄',
      MANUAL_ON: '💡',
      MANUAL_OFF: '🌙',
    };

    mostrarNotificacion(`💡 Modo Luz Cambiado: ${controlActual.modo_luz}`, {
      body: `La luz ahora está en modo ${controlActual.modo_luz}.`,
      icon: modoLuzEmoji[controlActual.modo_luz] || '💡',
      tag: 'luz-modo-cambio',
    });
  }

  // Actualizar datos anteriores
  datosAnteriores = { ...datosActuales };
};

/**
 * Limpia todas las notificaciones pendientes
 */
export const limpiarNotificaciones = () => {
  // Las notificaciones se cierran automáticamente, pero podemos forzar el cierre
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.showNotification = () => {};
      });
    });
  }
};

