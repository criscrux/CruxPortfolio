import { supabase } from "./supabase.js";


const programsLink =
    document.getElementById("programsLink");

const privateLink =
    document.getElementById("privateLink");

const loginButton =
    document.getElementById("loginButton");

const sidebar =
    document.getElementById("sidebar");

const mobileMenuButton =
    document.getElementById("mobileMenuButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link[data-section]"
    );


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


/*
    Close the sidebar after
    selecting any sidebar link.
*/

document.querySelectorAll(
    ".sidebar-link"
).forEach(function (link) {

    link.addEventListener(
        "click",
        closeSidebar
    );

});


/* ========================================
   ACTIVE SECTION
======================================== */

function setActiveSection(sectionId) {

    sidebarLinks.forEach(function (link) {

        const linkSection =
            link.dataset.section;

        link.classList.toggle(
            "active",
            linkSection === sectionId
        );

    });

}


/*
    Determine the active section
    based on the user's scroll position.
*/

function updateActiveSection() {

    const home =
        document.getElementById("home");

    const about =
        document.getElementById("about");


    if (!home || !about) {
        return;
    }


    /*
        The point used to determine
        which section is active.

        This is slightly below the
        top of the screen.
    */

    const scrollPoint =
        window.scrollY +
        window.innerHeight * 0.35;


    if (
        scrollPoint >= about.offsetTop
    ) {

        setActiveSection("about");

    } else {

        setActiveSection("home");

    }

}


/*
    Update immediately when the
    page loads and whenever the
    user scrolls.
*/

updateActiveSection();


window.addEventListener(
    "scroll",
    updateActiveSection,
    {
        passive: true
    }
);


/* ========================================
   ROLE-BASED ACCESS
======================================== */

async function checkLogin() {

    const {
        data: userData,
        error: userError
    } = await supabase.auth.getUser();


    /* --------------------------------
       ERROR
    -------------------------------- */

    if (userError) {

        console.error(
            "User error:",
            userError
        );

        return;

    }


    /* --------------------------------
       NOT LOGGED IN
    -------------------------------- */

    if (!userData.user) {

        if (loginButton) {

            loginButton.style.display =
                "inline-flex";

        }


        if (programsLink) {

            programsLink.style.display =
                "none";

        }


        if (privateLink) {

            privateLink.style.display =
                "none";

        }


        return;

    }


    /* --------------------------------
       LOGGED IN
    -------------------------------- */

    const user =
        userData.user;


    /*
        Hide Login after
        authentication.
    */

    if (loginButton) {

        loginButton.style.display =
            "none";

    }


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

        return;

    }


    const role =
        profile.role;


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
   START
======================================== */

checkLogin();