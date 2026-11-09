(() => {
    'use strict';

    // Put her name here to show it in the headline after the candle goes out, e.g. 'Maria'.
    const CONFIG = { partnerName: '' };

    const $ = (s) => document.querySelector(s);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const rnd = (a, b) => a + Math.random() * (b - a);
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const body = document.body;
    const lean = $('#lean');
    const fire = $('#fire');
    const bar = $('#bar');
    const note = $('#note');
    const sensInput = $('#sens');

    if (CONFIG.partnerName.trim()) $('#postTitle').textContent = 'Happy 1st Anniversary, ' + CONFIG.partnerName.trim();

    /* ---------------- UI state ---------------- */
    const SHOW = {
        btnMic: ['idle', 'fail'],
        meterRow: ['listening'],
        btnAgain: ['out'],
        btnTap: ['idle', 'listening', 'fail']
    };
    function setUI(s, msg) {
        for (const [id, list] of Object.entries(SHOW)) $('#' + id).hidden = !list.includes(s);
        note.textContent = msg || '';
        $('#btnMic').textContent = s === 'fail' ? 'Try again' : 'Happy Anniversary';
    }

    /* ---------------- Microphone ---------------- */
    let lit = true, micWanted = false, micLive = false;
    let stream = null, ctx = null, analyser = null, buf = null, micRaf = 0;
    let meter = 0, base = 0, baseN = 0, lastT = 0, leanSmooth = 0;
    let sens = 0.6;

    const threshold = () => 0.22 - sens * 0.19;           // RMS needed to count as a breath
    const setBlow = (v) => lean.style.setProperty('--blow', v.toFixed(3));

    async function startMic() {
        if (micLive || !lit) return;
        micWanted = true;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setUI('fail', 'This browser will not give the page your mic. Tap the candle to blow it out instead.');
            return;
        }
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });
        } catch (err) {
            const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
            setUI('fail', denied
                ? 'The mic is blocked. Allow it in the address bar and try again, or tap the candle.'
                : 'No microphone found. Tap the candle to blow it out instead.');
            return;
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
        try { await ctx.resume(); } catch (_) { }
        const src = ctx.createMediaStreamSource(stream);
        analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0;
        src.connect(analyser);
        buf = new Uint8Array(analyser.fftSize);
        micLive = true; meter = 0; base = 0; baseN = 0; leanSmooth = 0;
        lastT = performance.now();
        setUI('listening');
        micRaf = requestAnimationFrame(listen);
    }

    function stopMic() {
        micLive = false;
        cancelAnimationFrame(micRaf);
        if (stream) stream.getTracks().forEach((t) => t.stop());
        if (ctx && ctx.close) ctx.close().catch(() => { });
        stream = ctx = analyser = buf = null;
        bar.style.width = '0%';
        setBlow(0);
    }

    function listen(now) {
        if (!micLive) return;
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;

        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);

        // learn the room's background noise during the first ~0.7 seconds
        if (baseN < 40) { base = (base * baseN + rms) / (baseN + 1); baseN++; }
        const T = Math.max(threshold(), base * 3 + 0.03);

        // a breath has to last a moment, so a clap or a cough does not count
        meter = clamp(meter + (rms > T ? dt / 0.45 : -dt / 0.6), 0, 1);

        // the flame leans and shrinks as you blow
        const target = clamp((rms - base) / (T * 1.6), 0, 1) * 0.65;
        leanSmooth += (target - leanSmooth) * 0.35;
        setBlow(Math.max(leanSmooth, meter));
        bar.style.width = Math.round(clamp(rms / (T * 1.4), 0, 1) * 100) + '%';

        if (meter >= 1) { blowOut(); return; }
        micRaf = requestAnimationFrame(listen);
    }

    /* ---------------- Blow out / relight ---------------- */
    function blowOut() {
        if (!lit) return;
        lit = false;
        body.classList.add('out');
        stopMic();
        setUI('out');
        $('#msgPre').setAttribute('aria-hidden', 'true');
        $('#msgPost').removeAttribute('aria-hidden');
        try { navigator.vibrate && navigator.vibrate([30, 40, 60]); } catch (_) { }
        setTimeout(celebrate, 320);
    }

    function relight() {
        if (lit) return;
        lit = true;
        body.classList.remove('out');
        clearConfetti();
        $('#msgPost').setAttribute('aria-hidden', 'true');
        $('#msgPre').removeAttribute('aria-hidden');
        setBlow(0);
        setUI('idle');
        if (micWanted) startMic();
    }

    $('#btnMic').addEventListener('click', startMic);
    $('#btnAgain').addEventListener('click', relight);
    $('#btnTap').addEventListener('click', blowOut);
    $('#candle').addEventListener('click', () => { if (lit) blowOut(); });
    sensInput.addEventListener('input', () => { sens = clamp(Number(sensInput.value) / 100, 0.1, 1); });
    addEventListener('pagehide', stopMic);

    /* ---------------- Confetti ---------------- */
    const cv = $('#confetti');
    const g = cv.getContext('2d');
    const COLORS = ['#a78bfa', '#8b5cf6', '#c4b5fd', '#e9d5ff', '#f0abfc', '#f472b6', '#fcd34d', '#ffffff', '#6d28d9'];
    let W = 0, H = 0, parts = [], raf = 0, last = 0, rainTimer = 0;

    function fit() {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = innerWidth; H = innerHeight;
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    addEventListener('resize', fit);
    fit();

    function piece(x, y, vx, vy) {
        const r = Math.random();
        return {
            x, y, vx, vy, size: rnd(7, 13), rot: rnd(0, 6.28), vr: rnd(-8, 8), tilt: rnd(0, 6.28), vt: rnd(4, 9),
            color: COLORS[(Math.random() * COLORS.length) | 0],
            shape: r < 0.55 ? 0 : r < 0.75 ? 1 : r < 0.9 ? 2 : 3,
            age: 0, life: rnd(3.6, 6)
        };
    }

    function burst(x, y, n, angle, spread, vmin, vmax) {
        n = Math.round(n * (reduceMotion ? 0.35 : 1));
        for (let i = 0; i < n; i++) {
            const a = (angle + rnd(-spread / 2, spread / 2)) * Math.PI / 180;
            const v = rnd(vmin, vmax);
            parts.push(piece(x, y, Math.cos(a) * v, Math.sin(a) * v));
        }
        kick();
    }

    function rain(ms) {
        if (reduceMotion) return;
        const end = performance.now() + ms;
        clearInterval(rainTimer);
        rainTimer = setInterval(() => {
            if (performance.now() > end) { clearInterval(rainTimer); rainTimer = 0; return; }
            for (let i = 0; i < 5; i++) parts.push(piece(rnd(0, W), -12, rnd(-50, 50), rnd(80, 260)));
            kick();
        }, 80);
    }

    function celebrate() {
        const r = fire.getBoundingClientRect();
        burst(r.left, r.top, 110, -90, 90, 650, 1400);
        setTimeout(() => {
            burst(0, H * 0.92, 80, -58, 40, 800, 1500);
            burst(W, H * 0.92, 80, -122, 40, 800, 1500);
        }, 180);
        setTimeout(() => burst(r.left, r.top, 70, -90, 120, 500, 1100), 700);
        rain(2400);
    }

    function clearConfetti() {
        clearInterval(rainTimer); rainTimer = 0;
        parts.length = 0;
        g.clearRect(0, 0, W, H);
    }

    function kick() {
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    }

    function heart(s) {
        g.beginPath();
        g.moveTo(0, -s * 0.25);
        g.bezierCurveTo(-s * 0.1, -s * 0.55, -s * 0.5, -s * 0.55, -s * 0.5, -s * 0.2);
        g.bezierCurveTo(-s * 0.5, s * 0.15, -s * 0.15, s * 0.3, 0, s * 0.5);
        g.bezierCurveTo(s * 0.15, s * 0.3, s * 0.5, s * 0.15, s * 0.5, -s * 0.2);
        g.bezierCurveTo(s * 0.5, -s * 0.55, s * 0.1, -s * 0.55, 0, -s * 0.25);
        g.closePath();
        g.fill();
    }

    function frame(t) {
        const dt = Math.min(0.033, (t - last) / 1000);
        last = t;
        g.clearRect(0, 0, W, H);
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.age += dt;
            if (p.age > p.life || p.y > H + 40) { parts.splice(i, 1); continue; }
            const k = Math.exp(-2.4 * dt);
            p.vx *= k;
            p.vy = p.vy * k + 720 * dt;
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.rot += p.vr * dt; p.tilt += p.vt * dt;
            g.save();
            g.globalAlpha = Math.min(1, (p.life - p.age) / 0.8);
            g.translate(p.x, p.y);
            g.rotate(p.rot);
            g.scale(1, Math.cos(p.tilt));
            g.fillStyle = p.color;
            const s = p.size;
            if (p.shape === 0) g.fillRect(-s / 2, -s / 3, s, s * 0.66);
            else if (p.shape === 1) { g.beginPath(); g.arc(0, 0, s * 0.35, 0, 6.283); g.fill(); }
            else if (p.shape === 2) heart(s * 1.1);
            else g.fillRect(-s * 0.12, -s * 0.9, s * 0.24, s * 1.8);
            g.restore();
        }
        if (parts.length || rainTimer) raf = requestAnimationFrame(frame);
        else { raf = 0; g.clearRect(0, 0, W, H); }
    }

    /* ---------------- Candle light ---------------- */
    // The dark overlay covers the whole screen and keeps a bright hole around the flame.
    const shade = $('.shade');
    const cakeEl = $('.cake');
    function placeShade() {
        const r = fire.getBoundingClientRect();
        const em = parseFloat(getComputedStyle(cakeEl).fontSize) || 9;
        shade.style.setProperty('--fx', Math.round(r.left) + 'px');
        shade.style.setProperty('--fy', Math.round(r.top - em * 1.6) + 'px');
    }
    addEventListener('resize', placeShade);
    addEventListener('load', placeShade);
    placeShade();

    setUI('idle');
})();