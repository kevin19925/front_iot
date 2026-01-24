import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: parseInt(process.env.PORT) || 4173,
    host: '0.0.0.0',
    allowedHosts: [
      'front-iot-3fi3.onrender.com',
      '.onrender.com' // Permite cualquier subdominio de Render
    ]
  }
})

