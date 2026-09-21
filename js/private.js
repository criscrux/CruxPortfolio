import { supabase } from "./supabase.js";

const privateMessage = document.getElementById("privateMessage");
const logoutLink = document.getElementById("logoutLink");

const BASE_URL = import.meta.env.BASE_URL;

async function checkAccess() {

    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError || !userData.user) {
        window.location.href = BASE_URL + "login.html";
        return;
    }

    const user = userData.user;

    const { data: profile, error: profileError } =
        await supabase
            .from("profiles")
            .select("username, role")
            .eq("id", user.id)
            .single();

    if (profileError || !profile) {
        privateMessage.textContent =
            "Unable to verify your access.";
        return;
    }

    const allowedRoles = [
        "viewer",
        "contributor",
        "admin"
    ];

    if (!allowedRoles.includes(profile.role)) {
        privateMessage.textContent =
            "You do not have permission to view this page.";
        return;
    }

    privateMessage.textContent =
        "Welcome, " +
        profile.username +
        ". You have access to the private area.";
}

if (logoutLink) {
    logoutLink.addEventListener("click", async function (event) {

        event.preventDefault();

        await supabase.auth.signOut({
            scope: "local"
        });

        window.location.href = BASE_URL + "login.html";
    });
}

checkAccess();