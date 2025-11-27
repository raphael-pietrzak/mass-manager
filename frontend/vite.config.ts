import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0", // écoute toutes les interfaces réseau
    port: 5173,      // port utilisé par Vite
    allowedHosts: [
      "intentions-messes-lagrasse.matthiasgousseau.fr" // ton sous-domaine
    ],
  },
})
