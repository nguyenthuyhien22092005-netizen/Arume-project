import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ép cứng biến môi trường khi build trên Vercel để sửa lỗi gọi nhầm link API
    'process.env.VITE_API_URL': JSON.stringify('https://arume-project-production.up.railway.app/api'),
    'import.meta.env.VITE_API_URL': JSON.stringify('https://arume-project-production.up.railway.app/api')
  },
  server: {
    port: 5173,
    proxy: {
      // Giữ nguyên cấu hình chạy máy local để không lỗi CORS
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})