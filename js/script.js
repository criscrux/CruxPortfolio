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
    document.getElementById("programsButton") ||
    document.getElementById("programsToggle");

const programsMenu =
    document.getElementById("programsMenu") ||
    document.getElementById("programsSubmenu");

const programsArrow =
    document.getElementById("programsArrow") ||
    document.querySelector(".program-arrow");

const privateLink =
    document.getElementById("privateLink");

const loginButton =
    document.getElementById("loginButton");

const sidebarLinks =
    document.querySelectorAll(
        ".sidebar-link[data-section]"
    );


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

        programsMenu.classList.toggle(
            "open",
            isOpen
        );

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
   PROGRAM LINKS
======================================== */

document
    .querySelectorAll(".sidebar-sublink")
    .forEach(function (link) {

        link.addEventListener(
            "click",
            closeSidebar
        );

    });


/* ========================================
   NORMAL SIDEBAR LINKS
======================================== */

sidebarLinks.forEach(function (link) {

    link.addEventListener(
        "click",
        closeSidebar
    );

});


/* ========================================
   ACTIVE SECTION
======================================== */

function setActiveSection(sectionId) {

    sidebarLinks.forEach(
        function (link) {

            link.classList.toggle(
                "active",
                link.dataset.section === sectionId
            );

        }
    );

}


function updateActiveSection() {

    const home =
        document.getElementById("home");

    const about =
        document.getElementById("about");

    const socials =
        document.getElementById("socials");


    if (
        !home ||
        !about ||
        !socials
    ) {
        return;
    }


    const scrollPoint =
        window.scrollY +
        window.innerHeight * 0.35;


    if (
        scrollPoint >= socials.offsetTop
    ) {

        setActiveSection("socials");

    } else if (
        scrollPoint >= about.offsetTop
    ) {

        setActiveSection("about");

    } else {

        setActiveSection("home");

    }

}


updateActiveSection();


window.addEventListener(
    "scroll",
    updateActiveSection,
    {
        passive: true
    }
);


/* ========================================
   AUTHENTICATION
======================================== */

async function loadSession() {

    try {

        const {
            data,
            error
        } = await supabase.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return;

        }


        const session =
            data.session;


        if (!session) {

            return;

        }


        console.log(
            "Logged in:",
            session.user
        );


        /* --------------------------------
           HIDE LOGIN
        -------------------------------- */

        if (loginButton) {

            loginButton.style.display =
                "none";

        }


        /* --------------------------------
           LOAD ROLE
        -------------------------------- */

        const {
            data: profile,
            error: profileError
        } = await supabase
            .from("profiles")
            .select("username, role")
            .eq("id", session.user.id)
            .single();


        if (profileError) {

            console.error(
                "Profile error:",
                profileError
            );

            return;

        }


        const role =
            profile?.role || "viewer";


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

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

    }

}


/* ========================================
   START
======================================== */

loadSession();