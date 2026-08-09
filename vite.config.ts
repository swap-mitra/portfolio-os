import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Default 5173 falls inside a Windows-reserved TCP range (observed:
    // 5141-5240, likely a Hyper-V/WSL NAT exclusion — check with
    // `netsh interface ipv4 show excludedportrange protocol=tcp`), which
    // fails with EACCES rather than falling back to another port. 5999 sits
    // outside every range this project has hit so far.
    port: 3000,
  },
});
