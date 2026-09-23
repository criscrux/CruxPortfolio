import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ command }) => ({
    /*
        GitHub Pages needs /CruxPortfolio/
        Local development needs /
    */
    base: command === "build"
        ? "/CruxPortfolio/"
        : "/",

    server: {
        host: "0.0.0.0"
    },

    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, "html/index.html"),
                login: resolve(__dirname, "html/login.html"),
                private: resolve(__dirname, "html/private.html"),
                programs: resolve(__dirname, "html/programs.html"),
                settings: resolve(__dirname, "html/settings.html")
            }
        }
    }
}));