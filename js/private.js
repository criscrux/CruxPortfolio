import { supabase } from "./supabase.js";


const sidebar =
    document.getElementById("sidebar");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const programsLink =
    document.getElementById("programsLink");

const privateLink =
    document.getElementById("privateLink");


/* ========================================
   SIDEBAR
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
   ROLE-BASED ACCESS
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
        profile.role;


    const allowedRoles = [
        "partner",
        "admin"
    ];


    if (
        !allowedRoles.includes(role)
    ) {

        window.location.href =
            "./index.html";

        return;

    }


    /* --------------------------------
       SIDEBAR ACCESS
    -------------------------------- */

    if (privateLink) {

        privateLink.style.display =
            "flex";

    }


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

}


/* ========================================
   START
======================================== */

checkAccess();