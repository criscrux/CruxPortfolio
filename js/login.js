
import { supabase } from "./supabase.js";

const googleLogin = document.getElementById("googleLogin");
const loginMessage = document.getElementById("loginMessage");

googleLogin?.addEventListener("click", async function () {
    loginMessage.textContent = "Connecting to Google...";

    const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    const redirectUrl = isLocal
        ? `${window.location.origin}/html/index.html`
        : `${window.location.origin}/CruxPortfolio/`;

    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: redirectUrl
        }
    });

    if (error) {
        console.error("Login error:", error);
        loginMessage.textContent = "Login failed: " + error.message;
    }
});
