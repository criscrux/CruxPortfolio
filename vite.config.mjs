import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ command }) => ({
    base: command === "build"
        ? "/CruxPortfolio/"
        : "/",

    server: {
        host: "0.0.0.0"
    },

    build: {
        rollupOptions: {
            input: {

                index: resolve(
                    __dirname,
                    "html/index.html"
                ),

                login: resolve(
                    __dirname,
                    "html/login.html"
                ),

                private: resolve(
                    __dirname,
                    "html/private.html"
                ),

                danie: resolve(
                    __dirname,
                    "html/danie.html"
                ),

                cake: resolve(
                    __dirname,
                    "html/cake.html"
                ),

                flower: resolve(
                    __dirname,
                    "html/flower.html"
                ),

                settings: resolve(
                    __dirname,
                    "html/settings.html"
                ),

                firstYear: resolve(
                    __dirname,
                    "html/programs/1st-year/index.html"
                ),

                secondYear: resolve(
                    __dirname,
                    "html/programs/2nd-year/index.html"
                ),

                thirdYear: resolve(
                    __dirname,
                    "html/programs/3rd-year/index.html"
                ),

                fourthYear: resolve(
                    __dirname,
                    "html/programs/4th-year/index.html"
                ),

                firstYearPrelim: resolve(
                    __dirname,
                    "html/programs/1st-year/prelim.html"
                ),

                firstYearMidterm: resolve(
                    __dirname,
                    "html/programs/1st-year/midterm.html"
                ),

                firstYearFinals: resolve(
                    __dirname,
                    "html/programs/1st-year/finals.html"
                ),

                secondYearPrelim: resolve(
                    __dirname,
                    "html/programs/2nd-year/prelim.html"
                ),

                secondYearMidterm: resolve(
                    __dirname,
                    "html/programs/2nd-year/midterm.html"
                ),

                secondYearFinals: resolve(
                    __dirname,
                    "html/programs/2nd-year/finals.html"
                ),

                thirdYearPrelim: resolve(
                    __dirname,
                    "html/programs/3rd-year/prelim.html"
                ),

                thirdYearMidterm: resolve(
                    __dirname,
                    "html/programs/3rd-year/midterm.html"
                ),

                thirdYearFinals: resolve(
                    __dirname,
                    "html/programs/3rd-year/finals.html"
                ),

                fourthYearPrelim: resolve(
                    __dirname,
                    "html/programs/4th-year/prelim.html"
                ),

                fourthYearMidterm: resolve(
                    __dirname,
                    "html/programs/4th-year/midterm.html"
                ),

                fourthYearFinals: resolve(
                    __dirname,
                    "html/programs/4th-year/finals.html"
                )
            }
        }
    }
}));