import { supabase } from "./supabase.js";

const learnMoreButton = document.getElementById("learnMoreButton");
const loginLink = document.getElementById("loginLink");
const userStatus = document.getElementById("userStatus");

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

    if (!userData.user) {
        if (userStatus) {
            userStatus.textContent = "Not logged in";
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

    if (profileError) {
        console.error(profileError);

        if (userStatus) {
            userStatus.textContent =
                "Logged in, but profile could not be loaded.";
        }

        return;
    }

    if (userStatus) {
        userStatus.textContent =
            "Logged in as " +
            profile.username +
            " | Role: " +
            profile.role;
    }

    if (loginLink) {
        loginLink.textContent = "Logout";
        loginLink.href = "#";

        loginLink.addEventListener("click", async function (event) {

            event.preventDefault();

            await supabase.auth.signOut({
                scope: "local"
            });

            window.location.reload();
        });
    }
}

checkLogin();