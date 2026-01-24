# 📱 Iconos PWA

Para que la aplicación funcione como PWA (Progressive Web App) y se pueda instalar en el móvil, necesitas crear dos iconos:

## Iconos Requeridos

1. **icon-192.png** - 192x192 píxeles
2. **icon-512.png** - 512x512 píxeles

## Cómo Generarlos

### Opción 1: Usar el Generador Incluido

1. Abre `public/icon-generator.html` en tu navegador
2. Haz clic en "Generar 192x192" y guarda el archivo
3. Haz clic en "Generar 512x512" y guarda el archivo
4. Coloca ambos archivos en la carpeta `public/`

### Opción 2: Crear Manualmente

Puedes usar cualquier editor de imágenes (Photoshop, GIMP, Canva, etc.):

- Crea una imagen cuadrada de 192x192 píxeles
- Crea una imagen cuadrada de 512x512 píxeles
- Usa el tema verde (#4CAF50) con un icono de gota de agua 💧
- Guarda como PNG con fondo transparente o sólido
- Nombra los archivos exactamente: `icon-192.png` y `icon-512.png`

### Opción 3: Usar un Generador Online

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

## Verificación

Una vez que tengas los iconos en `public/`:

1. Ejecuta `npm run dev`
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña "Application" → "Manifest"
4. Deberías ver los iconos cargados correctamente

## Nota

Si no tienes los iconos, la PWA seguirá funcionando, pero no se verá tan profesional cuando se instale en el móvil.

