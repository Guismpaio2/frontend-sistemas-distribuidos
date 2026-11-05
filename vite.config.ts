import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // O plugin do Tailwind processa as classes utilitárias (bg-papel, text-tinta, ...).
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // O gateway só aceita CORS de localhost:5173; se a porta estiver ocupada,
    // preferimos falhar a abrir silenciosamente em 5174 (que o CORS bloquearia).
    strictPort: true,
  },
})
