import "../css/sidebar.css";
import { supabase } from "./supabase.js";

/* ========================================
   LOAD SHARED SIDEBAR
======================================== */

async function loadSidebar() {
    const container = document.getElementById("sidebar-container");

    if (!container) {
        console.error("Sidebar container not found.");
        return;
    }

    try {
        const response = await fetch(
            `${import.meta.env.BASE_URL}html/components/sidebar.html`
        );

        if (!response.ok) {
            throw new Error("Could not load sidebar.html");
        }

        const html = await response.text();

        container.innerHTML = html;

        initializeSidebar();

    } catch (error) {
        console.error("Sidebar loading failed:", error);
    }
}


/* ========================================
   FIX SIDEBAR NAVIGATION PATHS
======================================== */

function updateSidebarLinks() {

    const baseURL = import.meta.env.BASE_URL;

    const links = {
        home: `${baseURL}html/index.html#home`,
        about: `${baseURL}html/index.html#about`,
        socials: `${baseURL}html/index.html#socials`,

        "1st-year": `${baseURL}html/programs/1st-year/`,
        "2nd-year": `${baseURL}html/programs/2nd-year/`,
        "3rd-year": `${baseURL}html/programs/3rd-year/`,
        "4th-year": `${baseURL}html/programs/4th-year/`,

        private: `${baseURL}html/private.html`,
        danie: `${baseURL}html/danie.html`,
        settings: `${baseURL}html/settings.html`
    };

    const sidebar = document.getElementById("sidebar");

    if (!sidebar) return;

    const sidebarLinks = sidebar.querySelectorAll("a");

    sidebarLinks.forEach(function (link) {

        const href = link.getAttribute("href");

        if (!href) return;

        if (href.includes("#home")) {
            link.href = links.home;
        } else if (href.includes("#about")) {
            link.href = links.about;
        } else if (href.includes("#socials")) {
            link.href = links.socials;
        } else if (href.includes("1st-year")) {
            link.href = links["1st-year"];
        } else if (href.includes("2nd-year")) {
            link.href = links["2nd-year"];
        } else if (href.includes("3rd-year")) {
            link.href = links["3rd-year"];
        } else if (href.includes("4th-year")) {
            link.href = links["4th-year"];
        } else if (href.includes("private.html")) {
            link.href = links.private;
        } else if (href.includes("danie.html")) {
            link.href = links.danie;
        } else if (href.includes("settings.html")) {
            link.href = links.settings;
        }

    });

}


/* ========================================
   INITIALIZE SIDEBAR
======================================== */

function initializeSidebar() {

    updateSidebarLinks();

    const sidebar = document.getElementById("sidebar");
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    const programsButton = document.getElementById("programsButton");
    const programsMenu = document.getElementById("programsMenu");
    const programsArrow = document.getElementById("programsArrow");

    const sidebarLinks = document.querySelectorAll(
        ".sidebar-link[data-section]"
    );


    /* ========================================
       MOBILE SIDEBAR
    ======================================== */

    function closeSidebar() {

        sidebar?.classList.remove("open");
        sidebarOverlay?.classList.remove("show");

        mobileMenuButton?.setAttribute("aria-expanded", "false");
        mobileMenuButton?.setAttribute("aria-label", "Open navigation");

    }


    function toggleSidebar() {

        if (!sidebar) return;

        const isOpen = sidebar.classList.toggle("open");

        sidebarOverlay?.classList.toggle("show", isOpen);

        mobileMenuButton?.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        mobileMenuButton?.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );

    }


    mobileMenuButton?.addEventListener("click", toggleSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);


    /* ========================================
       CLOSE SIDEBAR WHEN LINK IS CLICKED
    ======================================== */

    sidebar?.querySelectorAll("a.sidebar-link, a.sidebar-sublink")
        .forEach(function (link) {

            link.addEventListener("click", function () {
                closeSidebar();
            });

        });


    /* ========================================
       PROGRAMS DROPDOWN
    ======================================== */

    programsButton?.addEventListener("click", function () {

        if (!programsMenu) return;

        const isOpen = programsMenu.classList.toggle("show");

        programsMenu.classList.toggle("open", isOpen);
        programsArrow?.classList.toggle("open", isOpen);

        programsButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    /* ========================================
       ACTIVE PAGE
    ======================================== */

    const currentPage = window.location.pathname;

    if (currentPage.includes("danie.html")) {

        document.getElementById("danieLink")?.classList.add("active");

    } else if (currentPage.includes("private.html")) {

        document.getElementById("privateLink")?.classList.add("active");

    }


    /* ========================================
       ACTIVE LOBBY SECTION
    ======================================== */

    function setActiveSection(sectionId) {

        sidebarLinks.forEach(function (link) {

            link.classList.toggle(
                "active",
                link.dataset.section === sectionId
            );

        });

    }


    function updateActiveSection() {

        const home = document.getElementById("home");
        const about = document.getElementById("about");
        const socials = document.getElementById("socials");

        if (!home || !about || !socials) return;

        const scrollPoint = window.scrollY + window.innerHeight * 0.35;

        if (scrollPoint >= socials.offsetTop) {

            setActiveSection("socials");

        } else if (scrollPoint >= about.offsetTop) {

            setActiveSection("about");

        } else {

            setActiveSection("home");

        }

    }


    if (document.getElementById("home")) {

        updateActiveSection();

        window.addEventListener(
            "scroll",
            updateActiveSection,
            { passive: true }
        );

    }


    /* ========================================
       AUTHENTICATION AND ROLE ACCESS
    ======================================== */

    loadSession();

}


/* ========================================
   LOAD USER SESSION
======================================== */

async function loadSession() {

    try {

        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error("Session error:", error);
            return;
        }

        const session = data.session;

        if (!session) return;

        console.log("Logged in:", session.user);


        /* HIDE LOGIN BUTTON */

        const loginButton = document.getElementById("loginButton");

        if (loginButton) {
            loginButton.style.display = "none";
        }


        /* LOAD USER ROLE */

        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("username, role")
                .eq("id", session.user.id)
                .single();

        if (profileError) {
            console.error("Profile error:", profileError);
            return;
        }

        const role = profile?.role || "viewer";


        /* PROGRAMS ACCESS */

        const programsRoles = [
            "classmate",
            "family",
            "partner",
            "admin"
        ];

        const programsButton = document.getElementById("programsButton");

        if (programsButton) {
            programsButton.style.display =
                programsRoles.includes(role) ? "flex" : "none";
        }


        /* PRIVATE ACCESS */

        const privateRoles = ["partner", "admin"];

        const privateLink = document.getElementById("privateLink");

        if (privateLink) {
            privateLink.style.display =
                privateRoles.includes(role) ? "flex" : "none";
        }


        /* DANIE ACCESS */

        const danieLink = document.getElementById("danieLink");

        if (danieLink) {
            danieLink.style.display =
                privateRoles.includes(role) ? "flex" : "none";
        }

    } catch (error) {

        console.error("Authentication error:", error);

    }

}


/* ========================================
   START
======================================== */

loadSidebar();
