import { supabase } from "./supabase.js";

const googleLogin = document.getElementById("googleLogin");
const loginMessage = document.getElementById("loginMessage");

googleLogin.addEventListener("click", async function () {
    loginMessage.textContent = "Connecting to Google...";

    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.origin + "/html/index.html"
        }
    });

    if (error) {
        console.error(error);
        loginMessage.textContent = "Login failed: " + error.message;
    }
});