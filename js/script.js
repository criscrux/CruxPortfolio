import { supabase } from "./supabase.js";

const learnMoreButton = document.getElementById("learnMoreButton");
const loginLink = document.getElementById("loginLink");
const userStatus = document.getElementById("userStatus");

const programsLink = document.getElementById("programsLink");
const privateLink = document.getElementById("privateLink");

const BASE_URL = import.meta.env.BASE_URL;

if (learnMoreButton) {
    learnMoreButton.addEventListener("click", function () {
        alert("Welcome to Crux's Portfolio!");
    });
}

async function checkLogin() {

    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError) {
        console.error(userError);
        return;
    }

    // User is not logged in
    if (!userData.user) {

        if (userStatus) {
            userStatus.textContent = "Not logged in";
        }

        if (programsLink) {
            programsLink.style.display = "none";
        }

        if (privateLink) {
            privateLink.style.display = "none";
        }

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

        console.error(profileError);

        if (userStatus) {
            userStatus.textContent =
                "Logged in, but profile could not be loaded.";
        }

        return;
    }

    const username = profile.username;
    const role = profile.role;

    // Show login status
    if (userStatus) {
        userStatus.textContent =
            "Logged in as " +
            username +
            " | Role: " +
            role;
    }

    // --------------------------------
    // PROGRAMS ACCESS
    // --------------------------------

    const programsRoles = [
        "classmate",
        "family",
        "partner",
        "admin"
    ];

    if (
        programsLink &&
        programsRoles.includes(role)
    ) {
        programsLink.style.display = "inline-block";
    }

    // --------------------------------
    // PRIVATE ACCESS
    // --------------------------------

    const privateRoles = [
        "partner",
        "admin"
    ];

    if (
        privateLink &&
        privateRoles.includes(role)
    ) {
        privateLink.style.display = "inline-block";
    }

    // --------------------------------
    // LOGOUT
    // --------------------------------

    if (loginLink) {

        loginLink.textContent = "Logout";
        loginLink.href = "#";

        loginLink.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                await supabase.auth.signOut({
                    scope: "local"
                });

                window.location.reload();
            }
        );
    }
}

checkLogin();