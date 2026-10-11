import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Serves shared/tokens.js (the design values the app reads too) as CSS
// variables: `import 'virtual:tokens.css'`. The file is read afresh on each
// load, so an edit to it reaches the page without a restart.
const TOKENS = fileURLToPath(new URL('./shared/tokens.js', import.meta.url))
const tokens = () => ({
  name: 'tokens',
  resolveId: (id) => (id === 'virtual:tokens.css' ? '\0virtual:tokens.css' : null),
  async load(id) {
    if (id !== '\0virtual:tokens.css') return null
    this.addWatchFile(TOKENS)
    const { cssVariables } = await import(`${pathToFileURL(TOKENS).href}?t=${Date.now()}`)
    return cssVariables()
  },
  handleHotUpdate({ file, server }) {
    if (file !== TOKENS) return
    const mod = server.moduleGraph.getModuleById('\0virtual:tokens.css')
    if (mod) server.reloadModule(mod)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tokens()],
})
