/**
 * Servicio para manejar notificaciones del navegador
 */

let permisoConcedido = false;
let datosAnteriores = null;

/**
 * Solicita permiso para mostrar notificaciones
 * Mejorado para móviles
 */
export const solicitarPermiso = async () => {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones');
    return false;
  }

  // Si ya tiene permiso, actualizar estado
  if (Notification.permission === 'granted') {
    permisoConcedido = true;
    return true;
  }

  // Si está denegado, no intentar de nuevo (evitar spam)
  if (Notification.permission === 'denied') {
    console.warn('Permisos de notificación denegados por el usuario');
    return false;
  }

  // Solicitar permiso (solo funciona en respuesta a una acción del usuario)
  try {
    const permiso = await Notification.requestPermission();
    permisoConcedido = permiso === 'granted';
    
    if (permisoConcedido) {
      console.log('✅ Permisos de notificación concedidos');
      // Probar que funciona mostrando una notificación de bienvenida
      setTimeout(() => {
        mostrarNotificacion('🔔 Notificaciones Activadas', {
          body: 'Recibirás alertas sobre eventos importantes del bebedero.',
          icon: '✅',
          tag: 'notificaciones-activadas',
          silent: true, // No hacer sonido en la primera
        });
      }, 500);
    }
    
    return permisoConcedido;
  } catch (error) {
    console.error('Error al solicitar permisos:', error);
    return false;
  }
};

/**
 * Muestra una notificación
 * Optimizado para móviles con vibración y mejor manejo
 * @param {string} titulo - Título de la notificación
 * @param {object} opciones - Opciones de la notificación
 */
export const mostrarNotificacion = (titulo, opciones = {}) => {
  // Verificar permisos
  if (Notification.permission !== 'granted') {
    if (!permisoConcedido) {
      console.warn('Permisos de notificación no concedidos');
      return;
    }
  }

  // Vibración para móviles (si está disponible)
  if ('vibrate' in navigator && opciones.vibrate !== false) {
    const vibracion = opciones.vibrate || [200, 100, 200]; // Patrón de vibración
    navigator.vibrate(vibracion);
  }

  const opcionesDefault = {
    icon: '/icon-192.png', // Icono de la app
    badge: '/icon-192.png',
    tag: 'bebedero-iot', // Evita notificaciones duplicadas
    requireInteraction: false,
    silent: false, // Permitir sonido
    timestamp: Date.now(),
    // Opciones específicas para móviles
    renotify: false, // No rennotificar si ya existe una con el mismo tag
    ...opciones,
  };

  try {
    const notificacion = new Notification(titulo, opcionesDefault);
    
    // Cerrar automáticamente después de 7 segundos (más tiempo en móvil)
    const tiempoCierre = opciones.requireInteraction ? 10000 : 7000;
    setTimeout(() => {
      if (notificacion) {
        notificacion.close();
      }
    }, tiempoCierre);

    // Hacer clic en la notificación para enfocar la ventana
    notificacion.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      // Si la app está en segundo plano, traerla al frente
      if (document.hidden) {
        window.focus();
      }
      
      notificacion.close();
      
      // Opcional: navegar a una URL específica
      if (opciones.url) {
        window.location.href = opciones.url;
      }
    };

    // Manejar errores de la notificación
    notificacion.onerror = (error) => {
      console.error('Error en la notificación:', error);
    };

    // Manejar cuando se cierra
    notificacion.onclose = () => {
      console.log('Notificación cerrada:', titulo);
    };

    return notificacion;
  } catch (error) {
    console.error('Error al mostrar notificación:', error);
    return null;
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
      vibrate: [200, 100, 200], // Vibración media
    });
  }

  // 2. Notificación: Nivel crítico (< 10%)
  if (sensoresActuales.nivel_agua < 10 && sensoresAnteriores.nivel_agua >= 10) {
    mostrarNotificacion('🚨 Nivel de Agua Crítico', {
      body: `¡ATENCIÓN! El nivel está en ${sensoresActuales.nivel_agua}%. Recarga urgente.`,
      icon: '🚨',
      tag: 'nivel-critico',
      requireInteraction: true, // Requiere interacción para crítico
      vibrate: [300, 100, 300, 100, 300], // Vibración fuerte para crítico
      silent: false, // Permitir sonido para crítico
    });
  }

  // 3. Notificación: Animal detectado - Solo si hay suficiente agua
  if (
    sensoresActuales.ultimo_animal !== 'Ninguno' &&
    sensoresActuales.ultimo_animal !== sensoresAnteriores.ultimo_animal
  ) {
    const animal = sensoresActuales.ultimo_animal;
    const nivelAgua = sensoresActuales.nivel_agua;
    const emoji = animal === 'Gato' ? '🐱' : '🐶';
    
    // Requisitos de agua por animal
    const nivelRequerido = animal === 'Gato' ? 30 : 70; // Gato: 30%, Perro: 70%
    
    // Solo notificar si hay suficiente agua (Gato >= 30%, Perro >= 70%)
    if (nivelAgua >= nivelRequerido) {
      mostrarNotificacion(
        `${emoji} ${animal} Detectado - Agua Suficiente`,
        {
          body: `✅ Se detectó un ${animal.toLowerCase()}. El nivel de agua (${nivelAgua}%) es suficiente (requiere ${nivelRequerido}%).`,
          icon: emoji,
          tag: `animal-${animal.toLowerCase()}-suficiente-${Date.now()}`,
          vibrate: [100, 50, 100], // Vibración suave
        }
      );
    }
    // Si no hay suficiente agua, NO se muestra notificación
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

  // 7. Notificación: Cambio de nivel de agua mientras hay animal detectado
  // Solo notificar cuando el nivel sube y alcanza el mínimo requerido
  if (
    sensoresActuales.ultimo_animal !== 'Ninguno' &&
    sensoresActuales.nivel_agua !== sensoresAnteriores.nivel_agua
  ) {
    const animal = sensoresActuales.ultimo_animal;
    const nivelAgua = sensoresActuales.nivel_agua;
    const nivelRequerido = animal === 'Gato' ? 30 : 70;
    const emoji = animal === 'Gato' ? '🐱' : '🐶';
    
    // Solo notificar cuando el nivel sube y alcanza el mínimo requerido
    const antesSuficiente = sensoresAnteriores.nivel_agua >= nivelRequerido;
    const ahoraSuficiente = nivelAgua >= nivelRequerido;
    
    if (!antesSuficiente && ahoraSuficiente) {
      // El nivel subió y ahora es suficiente
      mostrarNotificacion(
        `✅ Agua Suficiente para ${animal}`,
        {
          body: `El nivel de agua (${nivelAgua}%) ahora es suficiente para el ${animal.toLowerCase()} detectado (requiere ${nivelRequerido}%).`,
          icon: emoji,
          tag: `nivel-suficiente-${animal.toLowerCase()}-${Date.now()}`,
          vibrate: [100, 50, 100],
        }
      );
    }
    // Si el nivel baja, NO se muestra notificación
  }

  // 8. Notificación: Temperatura alta (> 30°C)
  if (sensoresActuales.temperatura > 30 && sensoresAnteriores.temperatura <= 30) {
    mostrarNotificacion('🌡️ Temperatura Alta', {
      body: `La temperatura es de ${sensoresActuales.temperatura}°C. El agua puede estar caliente.`,
      icon: '🌡️',
      tag: 'temp-alta',
    });
  }

  // 9. Notificación: Cambio de modo de luz
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
 * Verifica el estado de las notificaciones
 * @returns {object} Estado de las notificaciones
 */
export const verificarEstadoNotificaciones = () => {
  const estado = {
    soportado: 'Notification' in window,
    permiso: Notification.permission,
    activo: permisoConcedido && Notification.permission === 'granted',
    vibracion: 'vibrate' in navigator,
  };
  
  return estado;
};

/**
 * Re-solicita permisos si fueron denegados anteriormente
 * Solo funciona si el usuario cambió la configuración del navegador
 */
export const verificarPermisos = () => {
  if (Notification.permission === 'granted' && !permisoConcedido) {
    permisoConcedido = true;
    return true;
  }
  return permisoConcedido;
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

