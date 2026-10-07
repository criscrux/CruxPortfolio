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
   ACTIVE SIDEBAR ITEM
======================================== */

document
    .querySelectorAll(".sidebar-link")
    .forEach(function (link) {

        link.classList.remove("active");

    });


privateLink?.classList.add("active");


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
   CHECK ACCESS
======================================== */

async function checkAccess() {

    const {
        data: userData,
        error: userError
    } = await supabase.auth.getUser();


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
       LOAD PROFILE
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

        window.location.href =
            "./index.html";

        return;

    }


    const role =
        profile.role || "viewer";


    /* --------------------------------
       PRIVATE ACCESS
    -------------------------------- */

    const privateRoles = [
        "partner",
        "admin"
    ];


    if (
        !privateRoles.includes(role)
    ) {

        window.location.href =
            "./index.html";

        return;

    }


    /* --------------------------------
       SHOW PRIVATE
    -------------------------------- */

    if (privateLink) {

        privateLink.style.display =
            "flex";

        privateLink.classList.add(
            "active"
        );

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

}


/* ========================================
   START
======================================== */

checkAccess();