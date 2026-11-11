
/* ==========================================================
   ring.js
   Anniversary ring box: hydrangeas, sparkles and interaction
   ========================================================== */

const T = {
    LID: 1600,
    RING_DELAY: 900,
    RING_IN: 1000,
    VANISH: 1600,
    BACK_DELAY: 10000
};

const OPEN_DONE = Math.max(T.LID, T.RING_DELAY + T.RING_IN);

const root = document.body;
const box = document.getElementById("ring-box");
const ringWrap = document.getElementById("ring-wrap");
const sparkleLayer = document.getElementById("ring-sparkles");
const backBtn = document.getElementById("ring-back");
const flowers = document.getElementById("ring-flowers");

if (!box || !ringWrap || !sparkleLayer || !backBtn || !flowers) {
    throw new Error("Ring page elements are missing. Check ring.html.");
}

/* Apply animation timings to CSS */
root.style.setProperty("--lid-ms", `${T.LID}ms`);
root.style.setProperty("--ring-in-ms", `${T.RING_IN}ms`);
root.style.setProperty("--ring-delay-ms", `${T.RING_DELAY}ms`);
root.style.setProperty("--vanish-ms", `${T.VANISH}ms`);

const rand = (min, max) => min + Math.random() * (max - min);

const pick = (items) =>
    items[Math.floor(Math.random() * items.length)];


/* ==========================================================
   1. HYDRANGEA FLOWER BACKGROUND
   ========================================================== */

const COLORS = [
    { h: [205, 230], s: [62, 85], l: [55, 75] },
    { h: [325, 348], s: [55, 82], l: [70, 88] },
    { h: [245, 280], s: [5, 24], l: [88, 98] },
    { h: [258, 288], s: [45, 72], l: [53, 75] }
];

const FLOWER_LAYERS = [
    {
        selector: ".ring-flowers__layer--back",
        spacing: 29,
        size: [34, 49],
        opacity: 0.88
    },
    {
        selector: ".ring-flowers__layer--mid",
        spacing: 36,
        size: [38, 54],
        opacity: 0.94
    },
    {
        selector: ".ring-flowers__layer--front",
        spacing: 48,
        size: [44, 64],
        opacity: 0.98
    }
];

function flowerColor() {
    const palette = pick(COLORS);

    return {
        h: rand(...palette.h),
        s: rand(...palette.s),
        l: rand(...palette.l)
    };
}

function createFloret(color, x, y, size) {
    const hue = color.h + rand(-5, 5);
    const saturation = color.s + rand(-5, 5);
    const lightness = color.l + rand(-5, 5);

    const fill =
        `hsl(${hue.toFixed(0)} ` +
        `${saturation.toFixed(0)}% ` +
        `${lightness.toFixed(0)}%)`;

    const rotation = rand(0, 360).toFixed(0);

    return `
        <use
            href="#rg-floret"
            x="${(x - size / 2).toFixed(1)}"
            y="${(y - size / 2).toFixed(1)}"
            width="${size.toFixed(1)}"
            height="${size.toFixed(1)}"
            style="color:${fill}"
            opacity="${rand(.78, 1).toFixed(2)}"
            transform="rotate(${rotation} ${x.toFixed(1)} ${y.toFixed(1)})"
        />
    `;
}

function buildFlowers() {
    const W = Math.ceil(window.innerWidth);
    const H = Math.ceil(window.innerHeight);

    FLOWER_LAYERS.forEach((layer) => {
        const container = flowers.querySelector(layer.selector);
        if (!container) return;

        const spacing = layer.spacing;
        const columns = Math.ceil(W / spacing) + 3;
        const rows = Math.ceil(H / spacing) + 3;

        const patchSize = 5;
        const patchColors = [];

        for (let y = 0; y <= Math.ceil(rows / patchSize); y++) {
            patchColors[y] = [];

            for (let x = 0; x <= Math.ceil(columns / patchSize); x++) {
                patchColors[y][x] = flowerColor();
            }
        }

        let markup = `
            <svg
                viewBox="0 0 ${W} ${H}"
                width="${W}"
                height="${H}"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
            >
        `;

        for (let row = -1; row < rows; row++) {
            for (let col = -1; col < columns; col++) {
                const offset = row % 2 === 0 ? 0 : spacing * .5;

                const x = col * spacing + offset + rand(-spacing * .18, spacing * .18);
                const y = row * spacing + rand(-spacing * .18, spacing * .18);

                const patchX = Math.max(0, Math.floor((col + 1) / patchSize));
                const patchY = Math.max(0, Math.floor((row + 1) / patchSize));

                const color =
                    patchColors[patchY]?.[patchX] || flowerColor();

                const size = rand(...layer.size);

                markup += createFloret(color, x, y, size);

                if (Math.random() > .42) {
                    const smallX = x + rand(-spacing * .4, spacing * .4);
                    const smallY = y + rand(-spacing * .4, spacing * .4);

                    markup += createFloret(
                        color,
                        smallX,
                        smallY,
                        size * rand(.48, .68)
                    );
                }
            }
        }

        markup += "</svg>";

        container.innerHTML = markup;
        container.style.opacity = layer.opacity;
    });
}


/* ==========================================================
   2. SPARKLES
   ========================================================== */

function sparkle(x, y, distance = 60) {
    const element = document.createElement("i");

    element.className = "ring-sparkle";

    const angle = rand(0, Math.PI * 2);
    const distanceValue = rand(distance * 0.3, distance);

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    element.style.setProperty(
        "--dx",
        `${(Math.cos(angle) * distanceValue).toFixed(0)}px`
    );

    element.style.setProperty(
        "--dy",
        `${(Math.sin(angle) * distanceValue - 10).toFixed(0)}px`
    );

    element.style.setProperty("--s", `${rand(7, 16).toFixed(0)}px`);
    element.style.setProperty("--d", `${rand(0.9, 1.7).toFixed(2)}s`);

    element.addEventListener("animationend", () => {
        element.remove();
    });

    sparkleLayer.appendChild(element);
}

function burst(element, count, spread = 0.5) {
    const rect = element.getBoundingClientRect();
    const layerRect = sparkleLayer.getBoundingClientRect();

    const centerX = rect.left - layerRect.left + rect.width / 2;
    const centerY = rect.top - layerRect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
        sparkle(
            centerX + rand(-rect.width, rect.width) * spread,
            centerY + rand(-rect.height, rect.height) * spread,
            rect.width * 1.1
        );
    }
}


/* ==========================================================
   3. TIMERS AND STATE
   ========================================================== */

const timers = new Set();

function later(callback, delay) {
    const timer = setTimeout(() => {
        timers.delete(timer);
        callback();
    }, delay);

    timers.add(timer);

    return timer;
}

let state = "closed";
let idleTimer = null;


/* ==========================================================
   4. IDLE SPARKLES
   ========================================================== */

function startIdle() {
    stopIdle();

    idleTimer = setInterval(() => {
        if (state === "closed" || state === "empty") {
            burst(box, Math.random() > 0.6 ? 2 : 1, 0.5);
        }
    }, 750);
}

function stopIdle() {
    if (idleTimer !== null) {
        clearInterval(idleTimer);
        idleTimer = null;
    }
}


/* ==========================================================
   5. OPEN THE BOX
   ========================================================== */

function openBox() {
    if (state !== "closed") return;

    state = "opening";
    box.disabled = true;

    stopIdle();

    root.classList.add("is-open");

    later(() => {
        burst(ringWrap, 16);
    }, T.RING_DELAY + 300);

    later(() => {
        state = "display";
        box.disabled = false;
    }, OPEN_DONE);
}


/* ==========================================================
   6. DISAPPEAR THE RING ON SECOND CLICK
   ========================================================== */

function vanishRing() {
    if (state !== "display") return;

    state = "vanishing";
    box.disabled = true;

    burst(ringWrap, 26, 0.6);

    root.classList.add("is-ring-gone");

    later(() => {
        state = "empty";

        root.classList.add("is-empty");

        startIdle();

        later(() => {
            backBtn.classList.add("is-visible");
        }, T.BACK_DELAY);

    }, T.VANISH);
}


/* ==========================================================
   7. INITIALIZE PAGE
   ========================================================== */

buildFlowers();
startIdle();

box.addEventListener("click", () => {
    if (state === "closed") {
        openBox();
    } else if (state === "display") {
        vanishRing();
    }
});


/* ==========================================================
   8. RESPONSIVE FLOWER REGENERATION
   ========================================================== */

let resizeTimer = null;

function handleResize() {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        buildFlowers();
    }, 250);
}

window.addEventListener("resize", handleResize);
window.addEventListener("orientationchange", handleResize);

if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleResize);
}
