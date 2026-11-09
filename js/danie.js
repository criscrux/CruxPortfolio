
import { supabase } from "./supabase.js";

const page = document.getElementById("herPage");
const accessMessage = document.getElementById("accessMessage");

const openingScreen = document.getElementById("openingScreen");
const startButton = document.getElementById("startButton");

const pageNavigation = document.getElementById("pageNavigation");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");

const pageTurnOverlay = document.getElementById("pageTurnOverlay");
const pageTurnSheet = document.getElementById("pageTurnSheet");
const pageTurnFront = document.getElementById("pageTurnFront");
const pageTurnBack = pageTurnSheet.querySelector(".page-turn-back");

const pages = [
    document.getElementById("page1Screen"),
    document.getElementById("page2Screen"),
    document.getElementById("page3Screen"),
    document.getElementById("page4Screen"),
    document.getElementById("page5Screen")
];

let currentPage = -1;
let isAnimating = false;
let turnFallback = null;

pageNavigation.hidden = true;


/* ACCESS VERIFICATION */

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

        /* OPEN PAGE 5 WHEN RETURNING FROM CAKE */

        const requestedPage = new URLSearchParams(
            window.location.search
        ).get("page");

        if (requestedPage === "5") {
            openingScreen.hidden = true;

            pages.forEach((screen, index) => {
                screen.hidden = index !== 4;
            });

            currentPage = 4;

            document.body.classList.add("intro-revealed");
            document.body.classList.remove(
                "is-transitioning",
                "flower-fade-in"
            );

            playPageFadeIn(pages[4]);
        }

    } catch (error) {
        console.error("Her Page access check failed:", error);
        window.location.replace("./index.html");
    }
}


/* FLOWER LOBBY */

function returnToFlower() {
    if (isAnimating || currentPage !== 0) return;

    isAnimating = true;

    pageNavigation.hidden = true;
    pageNavigation.classList.remove("is-turning");
    pageNavigation.style.animation = "none";
    pageNavigation.style.opacity = "0";

    const currentContent =
        pages[currentPage].querySelector(".page-content");

    if (currentContent) {
        currentContent.style.animation = "none";
        currentContent.style.opacity = "0";
        currentContent.style.transform = "translateY(25px)";
        currentContent.style.filter = "blur(5px)";
    }

    pages[currentPage].hidden = true;

    document.body.classList.remove(
        "intro-revealed",
        "is-transitioning"
    );

    document.body.classList.add("flower-fade-in");

    window.setTimeout(() => {
        currentPage = -1;

        startButton.disabled = false;

        document.body.classList.remove("flower-fade-in");

        isAnimating = false;
    }, 1350);
}


startButton.addEventListener("click", () => {
    if (isAnimating || currentPage !== -1) return;

    isAnimating = true;

    const buttonRect = startButton.getBoundingClientRect();

    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;

    document.body.style.setProperty("--circle-x", `${centerX}px`);
    document.body.style.setProperty("--circle-y", `${centerY}px`);

    startButton.disabled = true;

    document.body.classList.add("is-transitioning");

    window.setTimeout(() => {
        pages[0].hidden = false;

        document.body.classList.add("intro-revealed");
        document.body.classList.remove("is-transitioning");

        currentPage = 0;

        playPageFadeIn(pages[currentPage]);

        isAnimating = false;
    }, 1350);
});


/* PAGE FADE-IN */

function playPageFadeIn(screen) {
    const content = screen.querySelector(".page-content");

    if (!content) return;

    content.style.animation = "none";
    content.style.opacity = "0";
    content.style.transform = "translateY(25px)";
    content.style.filter = "blur(5px)";

    pageNavigation.hidden = false;

    pageNavigation.classList.remove("is-turning");
    pageNavigation.style.animation = "none";
    pageNavigation.style.opacity = "0";
    pageNavigation.style.transform = "translateY(25px)";
    pageNavigation.style.filter = "blur(5px)";

    backButton.hidden = false;
    nextButton.hidden = false;

    void content.offsetWidth;
    void pageNavigation.offsetWidth;

    const fadeAnimation =
        "page-text-appear 0.7s ease 0.25s both";

    content.style.animation = fadeAnimation;
    pageNavigation.style.animation = fadeAnimation;
}


/* PAGE TURN */

function copyPageContent(source, destination) {
    destination.innerHTML = "";

    const content = source.querySelector(".page-content");

    if (!content) return;

    const clone = content.cloneNode(true);

    clone.style.animation = "none";
    clone.style.opacity = "1";
    clone.style.transform = "none";
    clone.style.filter = "none";

    destination.appendChild(clone);
}


function turnPage(source, destination, direction, callback) {
    if (isAnimating) return;

    isAnimating = true;

    pageNavigation.classList.add("is-turning");
    pageNavigation.style.animation = "none";
    pageNavigation.style.opacity = "0";
    pageNavigation.style.transform = "translateY(25px)";
    pageNavigation.style.filter = "blur(5px)";

    copyPageContent(source, pageTurnFront);
    copyPageContent(destination, pageTurnBack);

    destination.hidden = false;

    source.classList.add("page-turning");
    destination.classList.add("page-turning");

    pageTurnSheet.className = "page-turn-sheet";
    pageTurnOverlay.hidden = false;

    void pageTurnSheet.offsetWidth;

    const animationName = direction === "forward"
        ? "full-page-turn-forward"
        : "full-page-turn-backward";

    pageTurnSheet.classList.add(
        direction === "forward"
            ? "turn-forward"
            : "turn-backward"
    );

    let turnFinished = false;

    function finishTurn() {
        if (turnFinished) return;

        turnFinished = true;

        pageTurnSheet.removeEventListener(
            "animationend",
            handleTurn
        );

        if (turnFallback !== null) {
            window.clearTimeout(turnFallback);
            turnFallback = null;
        }

        source.classList.remove("page-turning");
        source.hidden = true;

        destination.classList.remove("page-turning");

        pageTurnOverlay.hidden = true;

        pageTurnSheet.className = "page-turn-sheet";
        pageTurnFront.innerHTML = "";
        pageTurnBack.innerHTML = "";

        callback();

        playPageFadeIn(destination);

        isAnimating = false;
    }

    function handleTurn(event) {
        if (
            event.target !== pageTurnSheet ||
            event.animationName !== animationName
        ) {
            return;
        }

        finishTurn();
    }

    pageTurnSheet.addEventListener("animationend", handleTurn);

    turnFallback = window.setTimeout(finishTurn, 1800);
}


/* PAGE NAVIGATION */

function goToNextPage() {
    if (isAnimating || currentPage < 0) return;

    if (currentPage >= pages.length - 1) {
        window.location.href = "./cake.html";
        return;
    }

    const source = pages[currentPage];
    const destination = pages[currentPage + 1];

    turnPage(source, destination, "forward", () => {
        currentPage++;
    });
}


function goToPreviousPage() {
    if (isAnimating || currentPage < 0) return;

    if (currentPage === 0) {
        returnToFlower();
        return;
    }

    const source = pages[currentPage];
    const destination = pages[currentPage - 1];

    turnPage(source, destination, "backward", () => {
        currentPage--;
    });
}


/* INITIALIZATION */

nextButton.addEventListener("click", goToNextPage);
backButton.addEventListener("click", goToPreviousPage);

checkAccess();
