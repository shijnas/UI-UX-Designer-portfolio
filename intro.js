/**
 * ============================================================
 * CINEMATIC INTRO — Scroll-Driven Storyboard Engine
 * Shijnas Yunus Portfolio
 *
 * 6 Scenes, scroll-controlled, seamless portfolio transition
 * ============================================================
 */
(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────
  // CONFIG
  // ──────────────────────────────────────────────────────────
  const CFG = {
    lerpSpeed:      0.065,   // Smoothing factor (lower = smoother/slower)
    scrollSensitivity: 0.00022, // Wheel delta → progress rate
    touchSensitivity:  0.00028,
    tileColumns:    11,
    tileRows:       15,
    floatParticles: 55,
  };

  // Scene breakpoints (scroll progress 0.0 → 1.0)
  const S = {
    s1Appear:  0.00,  // Hero front starts fading in
    s1Full:    0.14,  // Hero front fully visible
    s2Start:   0.18,  // Orbit crossfade begins
    s2End:     0.38,  // Side profile fully revealed
    s3Start:   0.35,  // Energy transformation
    s3Peak:    0.50,  // Max energy glow / press emblem
    s3End:     0.56,  // Pulse ring sequence ends
    s4Start:   0.53,  // Armor dissolve starts
    s4End:     0.72,  // Dissolve done, real portrait visible
    s5Start:   0.70,  // Phone materialises
    s5Full:    0.83,  // Phone fully upright
    s6Start:   0.86,  // Phone slides to homepage position
    s6End:     1.00,  // Portfolio fully revealed, intro ends
  };

  // ──────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────
  let progress      = 0;
  let targetProg    = 0;
  let rafId         = null;
  let introDone     = false;
  let dissolveReady = false;
  let tiles         = [];
  let floatParts    = [];
  let pulseRings    = [];
  let touchY        = 0;
  let phoneTarget   = null;   // Cached DOMRect of the real portfolio phone
  let tick          = 0;

  // ──────────────────────────────────────────────────────────
  // DOM
  // ──────────────────────────────────────────────────────────
  const dom = {
    intro:       () => document.getElementById('cinematic-intro'),
    heroFront:   () => document.getElementById('cin-hero-front'),
    heroSide:    () => document.getElementById('cin-hero-side'),
    heroReal:    () => document.getElementById('cin-hero-real'),
    energy:      () => document.getElementById('cin-energy'),
    ambient:     () => document.getElementById('cin-ambient-particles'),
    tileGrid:    () => document.getElementById('cin-tile-grid'),
    pulseCont:   () => document.getElementById('cin-pulse-container'),
    phone:       () => document.getElementById('cin-phone'),
    scrollHint:  () => document.getElementById('cin-scroll-hint'),
    skipBtn:     () => document.getElementById('intro-skip-btn'),
    progressBar: () => document.getElementById('cin-progress-bar'),
    mainWrapper: () => document.getElementById('main-wrapper'),
    portPhone:   () => document.getElementById('iphoneContainer'),
  };

  // ──────────────────────────────────────────────────────────
  // MATH HELPERS
  // ──────────────────────────────────────────────────────────
  const lerp    = (a, b, t)         => a + (b - a) * t;
  const clamp   = (v, mn, mx)       => Math.max(mn, Math.min(mx, v));
  const prog    = (t, s, e)         => clamp((t - s) / (e - s), 0, 1);
  const easeO3  = t                 => 1 - Math.pow(1 - t, 3);
  const easeO4  = t                 => 1 - Math.pow(1 - t, 4);
  const easeIO  = t                 => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const easeI2  = t                 => t * t;

  // ──────────────────────────────────────────────────────────
  // INIT: Floating Ambient Particles
  // ──────────────────────────────────────────────────────────
  function buildFloatParticles() {
    const container = dom.ambient();
    if (!container) return;
    container.innerHTML = '';
    floatParts = [];

    for (let i = 0; i < CFG.floatParticles; i++) {
      const el   = document.createElement('div');
      el.className = 'cin-float-particle';
      const size = Math.random() * 4 + 1.2;
      const x    = 15 + Math.random() * 70;
      const y    = 5  + Math.random() * 90;

      el.style.cssText = `
        width:${size}px; height:${size}px;
        left:${x}%; top:${y}%;
        opacity:${(Math.random() * 0.7 + 0.2).toFixed(2)};
      `;
      container.appendChild(el);
      floatParts.push({
        el, x, y,
        vx: (Math.random() - 0.5) * 0.06,
        vy: -(Math.random() * 0.05 + 0.015),
        phase: Math.random() * Math.PI * 2,
        freq:  Math.random() * 0.018 + 0.008,
      });
    }
  }

  // ──────────────────────────────────────────────────────────
  // INIT: Tile Dissolve Grid
  // ──────────────────────────────────────────────────────────
  function buildTileGrid() {
    const container = dom.tileGrid();
    if (!container) return;
    container.innerHTML = '';
    tiles = [];

    const cols  = CFG.tileColumns;
    const rows  = CFG.tileRows;
    const tw    = window.innerWidth  / cols;
    const th    = window.innerHeight / rows;

    // Dissolve the hero-side image (end of orbit state)
    const img   = 'assets/hero-suit-side.jpg';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const el = document.createElement('div');
        el.className = 'cin-tile';
        el.style.cssText = `
          left:${c * tw}px; top:${r * th}px;
          width:${tw + 1}px; height:${th + 1}px;
          background-image:url('${img}');
          background-size:${window.innerWidth}px ${window.innerHeight}px;
          background-position:${-(c * tw)}px ${-(r * th)}px;
        `;
        container.appendChild(el);

        // Row-based delay so chest disintegrates first (rows in middle first)
        const centreRow  = rows / 2;
        const distCentre = Math.abs(r - centreRow) / centreRow;
        const delay      = (1 - distCentre) * 0.35 + Math.random() * 0.25;

        tiles.push({
          el, c, r,
          vx:    (Math.random() - 0.5) * 280,
          vy:    (Math.random() - 0.5) * 180 - 40,
          vr:    (Math.random() - 0.5) * 28,
          delay,
        });
      }
    }
  }

  // ──────────────────────────────────────────────────────────
  // INIT: Pulse Rings (emblem press effect)
  // ──────────────────────────────────────────────────────────
  function buildPulseRings() {
    const container = dom.pulseCont();
    if (!container) return;
    container.innerHTML = '';
    pulseRings = [];

    const cx = window.innerWidth  * 0.50;
    const cy = window.innerHeight * 0.41;

    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.className = 'cin-pulse-ring';
      el.style.left = cx + 'px';
      el.style.top  = cy + 'px';
      container.appendChild(el);
      pulseRings.push({ el, delay: i * 0.13, maxSize: 90 + i * 55 });
    }
  }

  // ──────────────────────────────────────────────────────────
  // GET Portfolio Phone Target Rect
  // ──────────────────────────────────────────────────────────
  function measurePhoneTarget() {
    const mw = dom.mainWrapper();
    const pp = dom.portPhone();
    if (!pp || !mw) return null;

    // Briefly flash opacity to measure
    mw.style.visibility = 'visible';
    mw.style.opacity    = '0.0001';
    const rect = pp.getBoundingClientRect();
    mw.style.opacity    = '0';
    mw.style.visibility = 'hidden';
    return rect;
  }

  // ──────────────────────────────────────────────────────────
  // UPDATE: Float Particles (called per frame)
  // ──────────────────────────────────────────────────────────
  function tickFloatParticles() {
    tick += 0.016;
    for (const p of floatParts) {
      p.x += p.vx + Math.sin(tick * p.freq + p.phase) * 0.04;
      p.y += p.vy;
      if (p.y < -3)  { p.y = 103; p.x = 15 + Math.random() * 70; }
      if (p.x <  8)  p.x = 92;
      if (p.x > 92)  p.x = 8;
      p.el.style.left = p.x + '%';
      p.el.style.top  = p.y + '%';
    }
  }

  // ──────────────────────────────────────────────────────────
  // UPDATE: Tile Dissolve
  // ──────────────────────────────────────────────────────────
  function tickTiles(globalP) {
    for (const t of tiles) {
      const tp     = clamp((globalP - t.delay) / 0.7, 0, 1);
      const eased  = easeO4(tp);
      t.el.style.opacity   = (1 - eased).toFixed(3);
      t.el.style.transform = `translate(${t.vx * eased}px,${t.vy * eased}px) rotate(${t.vr * eased}deg) scale(${lerp(1, 0.25, eased)})`;
    }
  }

  // ──────────────────────────────────────────────────────────
  // UPDATE: Scene logic (called per frame with smoothed progress)
  // ──────────────────────────────────────────────────────────
  function updateScenes(p) {
    const intro = dom.intro();
    if (!intro) return;

    // Progress bar
    const bar = dom.progressBar();
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';

    // ─ SCENE 1 · Hero Front ──────────────────────────────
    const s1In  = easeO3(prog(p, S.s1Appear, S.s1Full));
    const s1Out = easeIO(prog(p, S.s2Start,  S.s2End));
    const heroFront = dom.heroFront();
    if (heroFront) {
      heroFront.style.opacity   = (s1In * (1 - s1Out)).toFixed(3);
      heroFront.style.transform = `scale(${lerp(0.82, 1.01, s1In)})`;
      heroFront.style.filter    = `brightness(${lerp(0.5, 1.0, s1In)})`;
    }

    // Scroll hint
    const sh = dom.scrollHint();
    if (sh) {
      const show = s1In > 0.75 && p < 0.16;
      sh.style.opacity = show ? '1' : '0';
    }

    // ─ SCENE 2 · Camera Orbit (Cross-fade to side) ───────
    const s2p     = easeIO(prog(p, S.s2Start, S.s2End));
    const heroSide = dom.heroSide();
    if (heroSide && p < S.s4Start + 0.04) {
      heroSide.style.opacity   = s2p.toFixed(3);
      heroSide.style.transform = `scale(${lerp(1.0, 1.07, s2p)}) translateX(${lerp(4, 0, s2p)}%)`;
      heroSide.style.filter    = `brightness(${lerp(0.5, 1.0, s2p)})`;
    }

    // ─ SCENE 3 · Transformation (Energy + Pulse) ─────────
    const s3p   = easeO3(prog(p, S.s3Start, S.s3Peak));
    const enrgy = dom.energy();
    if (enrgy && p < S.s4End) {
      const fade  = p < S.s4Start ? 1 : easeO3(1 - prog(p, S.s4Start, S.s4End));
      const a1    = lerp(0, 0.55, s3p) * fade;
      const a2    = lerp(0, 0.28, s3p) * fade;
      enrgy.style.background = `
        radial-gradient(ellipse 28% 30% at 50% 40%,
          rgba(168,85,247,${a1.toFixed(3)}) 0%,
          rgba(139,92,246,${a2.toFixed(3)}) 40%,
          transparent 70%)
      `;
    } else if (enrgy && p >= S.s4End) {
      enrgy.style.background = 'none';
    }

    // Pulse rings
    const ringP = prog(p, S.s3Start, S.s3End + 0.04);
    pulseRings.forEach((r, i) => {
      const rp    = clamp((ringP - r.delay * 0.9) / 0.5, 0, 1);
      const eased = easeO3(rp);
      const size  = r.maxSize * eased;
      r.el.style.opacity   = rp > 0 ? ((1 - eased) * 0.85).toFixed(3) : '0';
      r.el.style.width     = size + 'px';
      r.el.style.height    = size + 'px';
      r.el.style.marginLeft = (-size / 2).toFixed(1) + 'px';
      r.el.style.marginTop  = (-size / 2).toFixed(1) + 'px';
    });

    // Ambient particles
    const ambEl = dom.ambient();
    if (ambEl) {
      const pA = clamp(prog(p, S.s1Full * 0.4, S.s4Start) * 2, 0, 1);
      const pB = 1 - prog(p, S.s4Start, S.s4End);
      ambEl.style.opacity = (pA * pB).toFixed(3);
    }

    // ─ SCENE 4 · Armor Dissolve ──────────────────────────
    const s4p      = prog(p, S.s4Start, S.s4End);
    const tileGrid = dom.tileGrid();

    if (p >= S.s4Start && p <= S.s4End + 0.06) {
      if (tileGrid) tileGrid.style.opacity = '1';
      if (!dissolveReady) { dissolveReady = true; buildTileGrid(); }
      tickTiles(easeO4(s4p));
    } else if (p > S.s4End + 0.06) {
      if (tileGrid) tileGrid.style.opacity = '0';
    }

    // Hide heroSide behind tile dissolve
    if (heroSide && p >= S.s4Start) {
      heroSide.style.opacity = Math.max(0, 1 - prog(p, S.s4Start, S.s4Start + 0.06) / 0.06 * 1).toFixed(3);
    }

    // Reveal real portrait under the dissolving tiles
    const heroReal = dom.heroReal();
    if (heroReal) {
      const realIn = easeO3(prog(p, S.s4Start + 0.07, S.s4End));
      heroReal.style.opacity = realIn.toFixed(3);

      let scaleR = lerp(1.05, 1.0, realIn);
      let transX = 0;
      if (p > S.s5Start) {
        const zp   = easeO3(prog(p, S.s5Start, S.s5Full));
        scaleR     = lerp(1.0, 1.07, zp);
        transX     = lerp(0, -6, zp);
      }
      if (p >= S.s6Start) {
        heroReal.style.opacity = Math.max(0, 1 - prog(p, S.s6Start, S.s6Start + 0.12) / 0.12).toFixed(3);
      }
      heroReal.style.transform = `scale(${scaleR}) translateX(${transX}%)`;
    }

    // ─ SCENE 5 · Phone Materialises ──────────────────────
    const phone = dom.phone();
    if (phone && p >= S.s5Start && p < S.s6Start) {
      const s5p  = easeO3(prog(p, S.s5Start, S.s5Full));
      const rotY = lerp(42, 0, s5p);
      const rotX = lerp(6, 0, s5p);
      const sc   = lerp(0.65, 1.0, s5p);

      phone.style.opacity   = s5p.toFixed(3);
      phone.style.left      = '58%';
      phone.style.top       = '50%';
      phone.style.transform = `translate(-50%,-50%) perspective(1200px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    }

    // ─ SCENE 6 · Seamless Transition to Portfolio ────────
    if (p >= S.s6Start) {
      const s6p = easeIO(prog(p, S.s6Start, S.s6End));

      // Measure portfolio phone on first enter
      if (!phoneTarget) {
        phoneTarget = measurePhoneTarget();
      }

      if (phone && phoneTarget) {
        // Source: phone at 58% left, 50% top
        const startCX  = window.innerWidth  * 0.58;
        const startCY  = window.innerHeight * 0.50;
        const phoneEl  = phone.querySelector('.cin-phone-body');
        const startW   = phoneEl ? phoneEl.offsetWidth  : 220;
        const startH   = phoneEl ? phoneEl.offsetHeight : 450;

        const targetCX = phoneTarget.left + phoneTarget.width  / 2;
        const targetCY = phoneTarget.top  + phoneTarget.height / 2;
        const scaleX   = phoneTarget.width  / startW;
        const scaleY   = phoneTarget.height / startH;
        const avgScale = (scaleX + scaleY) / 2;

        const curL = lerp(startCX,    targetCX,  s6p);
        const curT = lerp(startCY,    targetCY,  s6p);
        const curS = lerp(1.0,        avgScale,  s6p);

        phone.style.opacity   = '1';
        phone.style.left      = curL + 'px';
        phone.style.top       = curT + 'px';
        phone.style.transform = `translate(-50%,-50%) perspective(1200px) scale(${curS.toFixed(4)})`;
      } else if (phone) {
        // Fallback: just fade phone out
        phone.style.opacity = (1 - s6p).toFixed(3);
      }

      // Portfolio fades in
      const mw = dom.mainWrapper();
      if (mw) {
        mw.style.visibility = 'visible';
        mw.style.opacity    = s6p.toFixed(3);
      }

      // Done
      if (p >= 0.992 && !introDone) finishIntro();
    }
  }

  // ──────────────────────────────────────────────────────────
  // FINISH INTRO
  // ──────────────────────────────────────────────────────────
  function finishIntro() {
    if (introDone) return;
    introDone = true;

    // Hide cloned phone
    const phone = dom.phone();
    if (phone) { phone.style.opacity = '0'; phone.style.pointerEvents = 'none'; }

    // Reveal portfolio fully
    const mw = dom.mainWrapper();
    if (mw) {
      mw.style.opacity      = '1';
      mw.style.visibility   = 'visible';
      mw.style.pointerEvents = 'all';
      mw.classList.add('intro-done');
    }

    // Fade out & remove intro
    const intro = dom.intro();
    if (intro) {
      intro.style.transition = 'opacity 0.5s ease';
      intro.style.opacity    = '0';
      setTimeout(() => {
        intro.remove();
      }, 550);
    }

    // Remove skip btn
    const sb = dom.skipBtn();
    if (sb) { sb.style.opacity = '0'; setTimeout(() => sb.remove(), 400); }

    // Re-enable scroll
    document.body.classList.remove('intro-active');
    document.body.style.overflow = '';
    document.body.style.height   = '';

    cancelAnimationFrame(rafId);
  }

  // ──────────────────────────────────────────────────────────
  // MAIN ANIMATION LOOP
  // ──────────────────────────────────────────────────────────
  function loop() {
    progress  += (targetProg - progress) * CFG.lerpSpeed;
    updateScenes(progress);
    tickFloatParticles();
    rafId = requestAnimationFrame(loop);
  }

  // ──────────────────────────────────────────────────────────
  // INPUT — Wheel
  // ──────────────────────────────────────────────────────────
  function onWheel(e) {
    if (introDone) return;
    e.preventDefault();
    const delta = e.deltaY * CFG.scrollSensitivity;
    targetProg  = clamp(targetProg + delta, 0, 1);
  }

  // ──────────────────────────────────────────────────────────
  // INPUT — Touch
  // ──────────────────────────────────────────────────────────
  function onTouchStart(e) {
    if (introDone) return;
    touchY = e.touches[0].clientY;
  }

  function onTouchMove(e) {
    if (introDone) return;
    e.preventDefault();
    const dy   = touchY - e.touches[0].clientY;
    touchY     = e.touches[0].clientY;
    targetProg = clamp(targetProg + dy * CFG.touchSensitivity, 0, 1);
  }

  // ──────────────────────────────────────────────────────────
  // INPUT — Keyboard
  // ──────────────────────────────────────────────────────────
  function onKeyDown(e) {
    if (introDone) return;
    const keys = { ArrowDown:1, PageDown:1, ' ':1 };
    const back  = { ArrowUp:1,  PageUp:1 };
    if (keys[e.key])  { e.preventDefault(); targetProg = clamp(targetProg + 0.07, 0, 1); }
    if (back[e.key])  { e.preventDefault(); targetProg = clamp(targetProg - 0.07, 0, 1); }
  }

  // ──────────────────────────────────────────────────────────
  // SKIP HANDLER
  // ──────────────────────────────────────────────────────────
  function skipIntro() {
    progress   = 0.96;
    targetProg = 1.0;
    setTimeout(finishIntro, 600);
  }

  // ──────────────────────────────────────────────────────────
  // RESIZE
  // ──────────────────────────────────────────────────────────
  function onResize() {
    buildPulseRings();
    if (dissolveReady) buildTileGrid();
    phoneTarget = null; // remeasure
  }

  // ──────────────────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────────────────
  function init() {
    const intro = dom.intro();
    if (!intro) return;   // No intro element → skip everything

    document.body.classList.add('intro-active');
    document.body.style.overflow = 'hidden';

    // Hide main content
    const mw = dom.mainWrapper();
    if (mw) {
      mw.style.opacity    = '0';
      mw.style.visibility = 'hidden';
    }

    buildFloatParticles();
    buildPulseRings();
    // tiles built lazily at S.s4Start to save memory

    // Input listeners
    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('keydown',    onKeyDown);
    window.addEventListener('resize',     onResize);

    // Skip button
    const sb = dom.skipBtn();
    if (sb) {
      sb.addEventListener('click', skipIntro);
      setTimeout(() => sb.classList.add('visible'), 2200);
    }

    // Scroll hint
    const sh = dom.scrollHint();
    if (sh) setTimeout(() => sh.classList.add('visible'), 1700);

    // Begin loop
    loop();
  }

  // ──────────────────────────────────────────────────────────
  // BOOT
  // ──────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay so page paint completes first
    setTimeout(init, 50);
  }

})();
