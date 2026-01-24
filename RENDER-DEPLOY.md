# 🚀 Desplegar en Render

Guía paso a paso para desplegar la aplicación React en Render.

## 📋 Configuración en Render

### 1. Crear Nuevo Web Service

1. Ve a [render.com](https://render.com)
2. Haz clic en "New" → "Web Service"
3. Conecta tu repositorio de GitHub

### 2. Configuración del Servicio

**Name:**
```
bebedero-dashboard
```

**Runtime:**
```
Node
```

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm start
```

**Environment:**
- No necesitas variables de entorno adicionales (la URL del servidor está en el código)

### 3. Plan

- **Free**: Funciona perfectamente para desarrollo
- **Starter**: Si necesitas más recursos

## ✅ Verificación

Una vez desplegado:

1. Render te dará una URL como: `https://bebedero-dashboard.onrender.com`
2. Abre la URL en tu navegador
3. Deberías ver la aplicación funcionando

## 🔧 Solución de Problemas

### Error: "Start Command Required"
- Asegúrate de que el Start Command sea exactamente: `npm start`

### Error: "Build failed"
- Verifica que el Build Command sea: `npm install && npm run build`
- Revisa los logs en Render para ver el error específico

### La app no carga
- Verifica que la URL del servidor en `src/services/api.js` sea correcta
- Asegúrate de que el servidor Node.js esté funcionando

## 📝 Notas Importantes

- Render usa el puerto automáticamente (variable `$PORT`)
- El comando `npm start` ejecuta `vite preview` que sirve los archivos de producción
- Los archivos se construyen en `dist/` durante el build
- El Service Worker y PWA funcionarán en HTTPS (Render lo proporciona automáticamente)

