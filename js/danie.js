
import { supabase } from "./supabase.js";

/* ========================================
   ELEMENTS
======================================== */

const page = document.getElementById("herPage");
const accessMessage = document.getElementById("accessMessage");

const startButton = document.getElementById("startButton");
const introScreen = document.getElementById("introScreen");
const nextScreen = document.getElementById("nextScreen");

const pageNavigation = document.getElementById("pageNavigation");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");

const pageTurnOverlay = document.getElementById("pageTurnOverlay");
const pageTurnSheet = document.getElementById("pageTurnSheet");
const pageTurnFront = document.getElementById("pageTurnFront");

let currentPage = "flower";
let isAnimating = false;

// Keep navigation hidden until the intro page is revealed.
pageNavigation.hidden = true;

/* ========================================
   TEXT AND NAVIGATION FADE-IN
======================================== */

function playTextFadeIn(screen) {
    const content = screen.querySelector(
        ".intro-content, .next-content"
    );

    if (!content) return;

    // Reset the text animation.
    content.style.animation = "none";
    content.style.opacity = "0";
    content.style.transform = "translateY(25px)";
    content.style.filter = "blur(5px)";

    // Prepare navigation for the same animation.
    pageNavigation.hidden = false;

    pageNavigation.classList.remove("is-turning");
    pageNavigation.style.animation = "none";
    pageNavigation.style.opacity = "0";
    pageNavigation.style.transform = "translateY(25px)";
    pageNavigation.style.filter = "blur(5px)";

    // Force the browser to apply the resets.
    void content.offsetWidth;
    void pageNavigation.offsetWidth;

    // Start both animations together.
    const fadeAnimation =
        "page-text-appear 1.2s ease 0.25s 1 both";

    content.style.animation = fadeAnimation;
    pageNavigation.style.animation = fadeAnimation;
}

/* ========================================
   CHECK ACCESS
======================================== */

async function checkAccess() {
    try {
        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError || !userData.user) {
            window.location.replace("./login.html");
            return;
        }

        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("role")
                .eq("id", userData.user.id)
                .single();

        if (profileError || !profile) {
            console.error("Could not load profile:", profileError);
            window.location.replace("./index.html");
            return;
        }

        const allowedRoles = ["partner", "admin"];

        if (!allowedRoles.includes(profile.role)) {
            window.location.replace("./index.html");
            return;
        }

        document.body.classList.add("authorized");
        page.hidden = false;
        accessMessage.textContent = "";

    } catch (error) {
        console.error("Her Page access check failed:", error);
        window.location.replace("./index.html");
    }
}

/* ========================================
   START TRANSITION
======================================== */

startButton.addEventListener("click", function () {
    if (isAnimating || currentPage !== "flower") return;

    isAnimating = true;

    const buttonRect = startButton.getBoundingClientRect();

    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    document.body.style.setProperty("--circle-x", `${centerX}px`);
    document.body.style.setProperty("--circle-y", `${centerY}px`);

    startButton.disabled = true;

    document.body.classList.add("is-transitioning");

    window.setTimeout(function () {
        introScreen.hidden = false;

        document.body.classList.add("intro-revealed");
        document.body.classList.remove("is-transitioning");

        currentPage = "intro";

        // Fade in the text and navigation together.
        playTextFadeIn(introScreen);

        isAnimating = false;

    }, 1350);
});

/* ========================================
   FULL PAGE TURN FUNCTION
======================================== */

function turnPage(source, destination, direction, callback) {
    if (isAnimating) return;

    isAnimating = true;

    // Immediately hide navigation during the page turn.
    pageNavigation.classList.add("is-turning");
    pageNavigation.style.animation = "none";
    pageNavigation.style.opacity = "0";
    pageNavigation.style.transform = "translateY(25px)";
    pageNavigation.style.filter = "blur(5px)";

    // Prepare the destination underneath the turning sheet.
    destination.hidden = false;

    // Hide both pages' text during the page-turn animation.
    source.classList.add("page-turning");
    destination.classList.add("page-turning");

    // Keep the turning sheet completely blank.
    pageTurnFront.innerHTML = "";

    // Reset the sheet before starting.
    pageTurnSheet.className = "page-turn-sheet";

    pageTurnOverlay.hidden = false;

    // Force the browser to apply the reset.
    void pageTurnSheet.offsetWidth;

    // Start the page-turn animation.
    pageTurnSheet.classList.add(
        direction === "forward"
            ? "turn-forward"
            : "turn-backward"
    );

    function handleTurn(event) {
        if (event.target !== pageTurnSheet) return;

        pageTurnSheet.removeEventListener(
            "animationend",
            handleTurn
        );

        // Hide the page we are leaving.
        source.classList.remove("page-turning");
        source.hidden = true;

        // Reveal the destination page.
        destination.classList.remove("page-turning");

        // Hide and reset the turning sheet.
        pageTurnOverlay.hidden = true;

        pageTurnSheet.className = "page-turn-sheet";
        pageTurnFront.innerHTML = "";

        // Update the current page and button visibility.
        callback();

        // Fade in the destination text and navigation together.
        playTextFadeIn(destination);

        isAnimating = false;
    }

    pageTurnSheet.addEventListener("animationend", handleTurn);
}

/* ========================================
   NEXT PAGE
======================================== */

nextButton.addEventListener("click", function () {
    if (isAnimating || currentPage !== "intro") return;

    turnPage(
        introScreen,
        nextScreen,
        "forward",
        function () {
            currentPage = "next";

            // Only the Back button is needed on the second page.
            nextButton.hidden = true;
        }
    );
});

/* ========================================
   BACK BUTTON
======================================== */

backButton.addEventListener("click", function () {
    if (isAnimating) return;

    if (currentPage === "next") {
        returnToIntro();
    } else if (currentPage === "intro") {
        returnToFlower();
    }
});

/* ========================================
   RETURN TO INTRO PAGE
======================================== */

function returnToIntro() {
    turnPage(
        nextScreen,
        introScreen,
        "backward",
        function () {
            currentPage = "intro";

            // Restore the Next button.
            nextButton.hidden = false;
        }
    );
}

/* ========================================
   RETURN TO FLOWER PAGE
======================================== */

function returnToFlower() {
    if (isAnimating) return;

    isAnimating = true;

    // Completely hide the navigation.
    pageNavigation.hidden = true;
    pageNavigation.classList.remove("is-turning");

    // Reset its animation for the next opening.
    pageNavigation.style.animation = "none";
    pageNavigation.style.opacity = "0";
    pageNavigation.style.transform = "translateY(25px)";
    pageNavigation.style.filter = "blur(5px)";

    document.body.classList.add("is-returning");

    window.setTimeout(function () {
        document.body.classList.remove(
            "intro-revealed",
            "is-returning",
            "is-transitioning"
        );

        introScreen.hidden = true;

        startButton.disabled = false;

        currentPage = "flower";
        isAnimating = false;

    }, 1350);
}

/* ========================================
   START PAGE
======================================== */

checkAccess();
