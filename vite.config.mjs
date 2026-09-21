import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    base: "/CruxPortfolio/",

    server: {
        host: true
    },

    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "html/index.html"),
                login: resolve(__dirname, "html/login.html"),
                private: resolve(__dirname, "html/private.html")
            }
        }
    }
});