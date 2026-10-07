import { supabase } from "./supabase.js";


const googleLogin =
    document.getElementById("googleLogin");

const loginMessage =
    document.getElementById("loginMessage");


googleLogin.addEventListener(
    "click",
    async function () {

        loginMessage.textContent =
            "Connecting to Google...";


        /*
         * Return to the Home page after Google login.
         *
         * Local Codespaces:
         * /html/index.html
         *
         * GitHub Pages:
         * /CruxPortfolio/html/index.html
         */

        const redirectUrl =
            window.location.origin +
            window.location.pathname
                .replace(
                    "/login.html",
                    "/index.html"
                );


        const {
            error
        } = await supabase.auth.signInWithOAuth({

            provider: "google",

            options: {
                redirectTo: redirectUrl
            }

        });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                "Login failed: " +
                error.message;

        }

    }
);