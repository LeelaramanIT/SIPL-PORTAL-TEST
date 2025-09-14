import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()],
  optimizeDeps: {
    include: ['redux-persist-transform-encrypt'],
    // exclude: ['@react-pdf/renderer'],
  },
  server:{
    port:"5174",
    host:'0.0.0.0'
  }
})
