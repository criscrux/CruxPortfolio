import { supabase } from "./supabase.js";


const programsLink =
    document.getElementById("programsLink");

const privateLink =
    document.getElementById("privateLink");

const profileUsername =
    document.getElementById("profileUsername");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");

const profileAvatar =
    document.getElementById("profileAvatar");

const logoutButton =
    document.getElementById("logoutButton");

const sidebar =
    document.getElementById("sidebar");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");


/* ========================================
   MOBILE SIDEBAR
======================================== */

function closeSidebar() {

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("show");
    }

    if (mobileMenuButton) {
        mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }
}


function toggleSidebar() {

    if (!sidebar) {
        return;
    }

    const isOpen =
        sidebar.classList.toggle("open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.toggle(
            "show",
            isOpen
        );
    }

    if (mobileMenuButton) {
        mobileMenuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    }
}


if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        toggleSidebar
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


document.querySelectorAll(
    ".sidebar-link"
).forEach(function (link) {

    link.addEventListener(
        "click",
        closeSidebar
    );

});


/* ========================================
   LOAD PROFILE
======================================== */

async function loadProfile() {

    const {
        data: userData,
        error: userError
    } = await supabase.auth.getUser();


    /* --------------------------------
       NOT LOGGED IN
    -------------------------------- */

    if (
        userError ||
        !userData.user
    ) {

        window.location.href =
            "./login.html";

        return;
    }


    const user =
        userData.user;


    /* --------------------------------
       DISPLAY EMAIL
    -------------------------------- */

    if (profileEmail) {

        profileEmail.textContent =
            user.email || "Not available";

    }


    /* --------------------------------
       LOAD PROFILE DATA
    -------------------------------- */

    const {
        data: profile,
        error: profileError
    } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", user.id)
        .single();


    if (
        profileError ||
        !profile
    ) {

        console.error(
            "Profile error:",
            profileError
        );

        if (profileUsername) {
            profileUsername.textContent =
                "Unavailable";
        }

        if (profileRole) {
            profileRole.textContent =
                "Unavailable";
        }

        return;
    }


    /* --------------------------------
       DISPLAY USERNAME
    -------------------------------- */

    const username =
        profile.username || "User";

    const role =
        profile.role || "viewer";


    if (profileUsername) {

        profileUsername.textContent =
            username;

    }


    /* --------------------------------
       DISPLAY ROLE
    -------------------------------- */

    if (profileRole) {

        profileRole.textContent =
            role;

    }


    /* --------------------------------
       PROFILE AVATAR
    -------------------------------- */

    if (profileAvatar) {

        profileAvatar.textContent =
            username
                .charAt(0)
                .toUpperCase();

    }


    /* --------------------------------
       PROGRAMS ACCESS
    -------------------------------- */

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

        programsLink.style.display =
            "flex";

    }


    /* --------------------------------
       PRIVATE ACCESS
    -------------------------------- */

    const privateRoles = [
        "partner",
        "admin"
    ];


    if (
        privateLink &&
        privateRoles.includes(role)
    ) {

        privateLink.style.display =
            "flex";

    }

}


/* ========================================
   LOGOUT
======================================== */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            logoutButton.disabled = true;

            logoutButton.textContent =
                "Logging out...";


            const {
                error
            } = await supabase.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                logoutButton.disabled =
                    false;

                logoutButton.textContent =
                    "Log out";

                alert(
                    "Unable to log out. Please try again."
                );

                return;
            }


            window.location.href =
                "./login.html";

        }
    );

}


/* ========================================
   START
======================================== */

loadProfile();