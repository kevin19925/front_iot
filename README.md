# 💧 Dashboard Bebedero IoT

Aplicación web React en tiempo real para monitorear y controlar el sistema de bebedero inteligente.

## 🚀 Características

- **📱 PWA (Progressive Web App)**: Instálala como app móvil desde el navegador
- **📊 Dashboard en Tiempo Real**: Visualización de KPIs (Nivel, Temperatura, Estado Bomba)
- **🎛️ Panel de Control**: Botones para controlar bomba y luz (ON/OFF/AUTO)
- **📋 Tabla de Historial**: Registro de los últimos 20 eventos en tiempo real (en pestaña separada)
- **🔄 Actualización Automática**: Los datos se actualizan cada 1 segundo automáticamente
- **🔔 Notificaciones del Navegador**: Alertas en tiempo real sobre eventos importantes
- **📱 Totalmente Responsive**: Optimizado para móviles, tablets y desktop
- **🎨 Interfaz Moderna**: Diseño profesional con animaciones suaves

## 📋 Requisitos

- Node.js 16 o superior
- npm o yarn

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
cd appmovil
npm install
```

2. **Configurar URL del servidor:**
   - Abre `src/services/api.js`
   - Cambia `API_BASE_URL` por la URL de tu servidor en Render:
   ```javascript
   const API_BASE_URL = 'https://tu-servidor.onrender.com';
   ```

3. **Generar iconos PWA (Opcional pero recomendado):**
   - Abre `public/icon-generator.html` en tu navegador
   - Haz clic en "Generar 192x192" y guarda como `icon-192.png` en `public/`
   - Haz clic en "Generar 512x512" y guarda como `icon-512.png` en `public/`
   - O crea tus propios iconos de 192x192 y 512x512 píxeles

4. **Ejecutar en desarrollo:**
```bash
npm run dev
```

La aplicación se abrirá automáticamente en `http://localhost:5173`

## 🏗️ Construir para Producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 📡 Endpoints Utilizados

- `GET /api/general` - Obtiene el estado completo del sistema
- `POST /api/control` - Envía comandos de control (ENCENDER/APAGAR/AUTO)

## 🎨 Componentes

- **Dashboard**: Muestra KPIs con gráficos y LEDs virtuales
- **PanelControl**: Botones para controlar la bomba
- **TablaHistorial**: Tabla con historial de eventos en tiempo real

## 🔄 Flujo de Datos

1. La aplicación hace polling cada 1 segundo a `/api/general`
2. Los datos se actualizan automáticamente en la interfaz
3. Cada nuevo dato se agrega al historial (máximo 20 registros)
4. Los comandos se envían a `/api/control` y se actualiza el estado

## 🛠️ Tecnologías

- React 18
- Vite (Build tool)
- CSS3 (Estilos personalizados)

## 🔔 Notificaciones

La aplicación incluye notificaciones del navegador que te alertan sobre:

- ⚠️ **Nivel de agua bajo** (< 20%)
- 🚨 **Nivel crítico** (< 10%)
- 🐱🐶 **Animal detectado** (Gato o Perro)
- 🔵 **Bomba activada/desactivada**
- 🔄 **Cambio de modo** (AUTO/MANUAL)
- 🌡️ **Temperatura alta** (> 30°C)

### Activar Notificaciones

1. Al cargar la aplicación, el navegador pedirá permiso para mostrar notificaciones
2. Haz clic en "Permitir" o "Allow"
3. Si las rechazaste, puedes activarlas desde el botón "Activar" en el header
4. Las notificaciones funcionan incluso cuando la pestaña está en segundo plano

**Nota**: Las notificaciones solo funcionan en navegadores modernos (Chrome, Firefox, Edge, Safari) y requieren HTTPS en producción.

## 📱 Instalación como App Móvil (PWA)

### En Android (Chrome):
1. Abre la aplicación en Chrome
2. Toca el menú (3 puntos) → "Agregar a la pantalla de inicio"
3. La app se instalará como una aplicación nativa

### En iOS (Safari):
1. Abre la aplicación en Safari
2. Toca el botón de compartir (cuadrado con flecha)
3. Selecciona "Agregar a pantalla de inicio"
4. La app aparecerá en tu pantalla de inicio

### Características PWA:
- ✅ Funciona offline (con caché)
- ✅ Se ve como app nativa (sin barra del navegador)
- ✅ Acceso rápido desde la pantalla de inicio
- ✅ Notificaciones push (si están activadas)

## 🎯 Sistema de Pestañas

La aplicación ahora tiene dos pestañas principales:

1. **📊 Dashboard**: 
   - Visualización de sensores en tiempo real
   - Panel de control de bomba y luz
   - Detección de animales con animaciones

2. **📋 Historial**:
   - Tabla completa con todos los eventos
   - Mejor visualización en pantalla grande
   - Badges de colores para gatos y perros

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 **Móviles** (< 480px): Layout de una columna, iconos grandes
- 📱 **Tablets** (480px - 768px): Layout adaptativo
- 💻 **Desktop** (> 768px): Layout completo con múltiples columnas

## 📝 Notas

- La aplicación funciona completamente en el navegador
- No requiere backend propio, solo se conecta a tu servidor en Render
- El historial se mantiene solo durante la sesión (se pierde al recargar)
- Las notificaciones requieren permiso del usuario y HTTPS en producción
- PWA requiere HTTPS en producción (funciona en localhost para desarrollo)

