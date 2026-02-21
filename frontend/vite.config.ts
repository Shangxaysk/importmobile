import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'subexternal-offenseless-emilee.ngrok-free.dev' // Xatolikda chiqqan manzilni aynan shu yerga yozing
    ]
  }
})
