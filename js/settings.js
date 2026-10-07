import { supabase } from "./supabase.js";


/* ========================================
   ELEMENTS
======================================== */

const sidebar =
    document.getElementById("sidebar");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const programsButton =
    document.getElementById("programsButton");

const programsMenu =
    document.getElementById("programsMenu");

const programsArrow =
    document.getElementById("programsArrow");

const privateLink =
    document.getElementById("privateLink");


/* ========================================
   PROFILE ELEMENTS
======================================== */

const profileAvatar =
    document.getElementById("profileAvatar");

const profileAvatarImage =
    document.getElementById("profileAvatarImage");

const profileUsername =
    document.getElementById("profileUsername");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");

const logoutButton =
    document.getElementById("logoutButton");


/* ========================================
   ACTIVE SIDEBAR ITEM
======================================== */

document
    .querySelectorAll(".sidebar-link")
    .forEach(function (link) {

        link.classList.remove("active");

    });


const settingsLink =
    document.querySelector(
        '.sidebar-bottom a[href="./settings.html"]'
    );


settingsLink?.classList.add("active");


/* ========================================
   SIDEBAR
======================================== */

function closeSidebar() {

    sidebar?.classList.remove("open");

    sidebarOverlay?.classList.remove("show");

    mobileMenuButton?.setAttribute(
        "aria-expanded",
        "false"
    );

}


function toggleSidebar() {

    if (!sidebar) {
        return;
    }

    const isOpen =
        sidebar.classList.toggle("open");

    sidebarOverlay?.classList.toggle(
        "show",
        isOpen
    );

    mobileMenuButton?.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

}


mobileMenuButton?.addEventListener(
    "click",
    toggleSidebar
);


sidebarOverlay?.addEventListener(
    "click",
    closeSidebar
);


/* ========================================
   PROGRAMS DROPDOWN
======================================== */

programsButton?.addEventListener(
    "click",
    function () {

        if (!programsMenu) {
            return;
        }

        const isOpen =
            programsMenu.classList.toggle("show");

        programsArrow?.classList.toggle(
            "open",
            isOpen
        );

        programsButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    }
);


/* ========================================
   SIDEBAR LINKS
======================================== */

document
    .querySelectorAll(".sidebar-sublink")
    .forEach(function (link) {

        link.addEventListener(
            "click",
            closeSidebar
        );

    });


document
    .querySelectorAll(".sidebar-link")
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                if (
                    link === programsButton
                ) {
                    return;
                }

                closeSidebar();

            }
        );

    });


/* ========================================
   LOAD USER
======================================== */

async function loadUser() {

    const {
        data,
        error
    } = await supabase.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        window.location.href =
            "./login.html";

        return;

    }


    const user =
        data.user;


    const metadata =
        user.user_metadata || {};


    /* --------------------------------
       NAME
    -------------------------------- */

    const name =
        metadata.full_name ||
        metadata.name ||
        user.email ||
        "User";


    if (profileUsername) {

        profileUsername.textContent =
            name;

    }


    /* --------------------------------
       EMAIL
    -------------------------------- */

    if (profileEmail) {

        profileEmail.textContent =
            user.email ||
            "Not available";

    }


    /* --------------------------------
       PROFILE PICTURE
    -------------------------------- */

    const picture =
        metadata.avatar_url ||
        metadata.picture ||
        "";


    if (
        picture &&
        profileAvatarImage
    ) {

        profileAvatarImage.src =
            picture;

        profileAvatarImage.style.display =
            "block";

        profileAvatar?.style.setProperty(
            "display",
            "none"
        );

    }
    else if (profileAvatar) {

        profileAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

        profileAvatar.style.display =
            "flex";

        profileAvatarImage?.style.setProperty(
            "display",
            "none"
        );

    }


    /* --------------------------------
       PROFILE / ROLE
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

        if (profileRole) {

            profileRole.textContent =
                "Unavailable";

        }

        return;

    }


    const role =
        profile.role || "viewer";


    if (profileRole) {

        profileRole.textContent =
            role;

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


    if (programsButton) {

        programsButton.style.display =
            programsRoles.includes(role)
                ? "flex"
                : "none";

    }


    /* --------------------------------
       PRIVATE ACCESS
    -------------------------------- */

    const privateRoles = [
        "partner",
        "admin"
    ];


    if (privateLink) {

        privateLink.style.display =
            privateRoles.includes(role)
                ? "flex"
                : "none";

    }

}


/* ========================================
   LOGOUT
======================================== */

logoutButton?.addEventListener(
    "click",
    async function () {

        logoutButton.disabled =
            true;

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


/* ========================================
   START
======================================== */

loadUser();