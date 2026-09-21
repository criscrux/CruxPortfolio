import { supabase } from "./supabase.js";

const googleLogin = document.getElementById("googleLogin");
const loginMessage = document.getElementById("loginMessage");

const BASE_URL = import.meta.env.BASE_URL;

googleLogin.addEventListener("click", async function () {

    loginMessage.textContent = "Connecting to Google...";

    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.origin + BASE_URL
        }
    });

    if (error) {
        console.error(error);
        loginMessage.textContent =
            "Login failed: " + error.message;
    }
});