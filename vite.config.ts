import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error Runtime server module intentionally stays plain Node.js.
import { localPersistencePlugin } from './scripts/server/localServer.mjs'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1', cors: false,
    fs: { deny: ['.env', '.env.*', '*.{crt,pem,key,p12,pfx,cer,der}', '.npmrc', '.yarnrc.yml', '**/.git/**', '**/storage/backups/**'] },
  },
  preview: { host: '127.0.0.1', cors: false },
  plugins: [
    react(),
    tailwindcss(),
    localPersistencePlugin()
  ],
})
