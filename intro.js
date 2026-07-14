/**
 * ============================================================
 * CINEMATIC INTRO — 3-Scene Storyboard
 *
 * Scene 1 (0–35%):  Phone rotates in, materialises centred
 * Scene 2 (35–65%): Phone screen shows portfolio scrolling
 * Scene 3 (65–100%): Phone slides into homepage position,
 *                    portfolio fades in around it
 * ============================================================
 */
(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────
  // CONFIG
  // ──────────────────────────────────────────────────────────
  const CFG = {
    lerpSpeed:         0.07,
    scrollSensitivity: 0.00028,
    touchSensitivity:  0.00034,
  };

  // Scene breakpoints (scroll progress 0.0 → 1.0)
  const S = {
    phoneIn:     0.00,  // Phone starts fading in
    phoneFull:   0.35,  // Phone fully upright, centred
    scrollIn:    0.35,  // Scroll screen crossfades in
    scrollFull:  0.45,  // Scroll screen fully visible + playing
    scrollOut:   0.60,  // Scroll screen fades back out
    lockIn:      0.60,  // Lock screen wallpaper comes back
    slideStart:  0.65,  // Phone begins moving to homepage
    slideEnd:    1.00,  // Portfolio fully visible
  };

  // ──────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────
  let progress    = 0;
  let targetProg  = 0;
  let rafId       = null;
  let introDone   = false;
  let phoneTarget = null;
  let touchY      = 0;

  // ──────────────────────────────────────────────────────────
  // DOM
  // ──────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // ──────────────────────────────────────────────────────────
  // MATH
  // ──────────────────────────────────────────────────────────
  const lerp   = (a, b, t) => a + (b - a) * t;
  const clamp  = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
  const prog   = (t, s, e)  => clamp((t - s) / (e - s), 0, 1);
  const easeO3 = t => 1 - Math.pow(1 - t, 3);
  const easeO4 = t => 1 - Math.pow(1 - t, 4);
  const easeIO = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // ──────────────────────────────────────────────────────────
  // MEASURE portfolio phone
  // ──────────────────────────────────────────────────────────
  function measurePhoneTarget() {
    const mw = $('main-wrapper');
    const pp = $('iphoneContainer');
    if (!pp || !mw) return null;
    mw.style.visibility = 'visible';
    mw.style.opacity    = '0.0001';
    const rect = pp.getBoundingClientRect();
    mw.style.opacity    = '0';
    mw.style.visibility = 'hidden';
    return rect;
  }

  // ──────────────────────────────────────────────────────────
  // SCENE UPDATE — called every frame
  // ──────────────────────────────────────────────────────────
  function updateScenes(p) {
    const intro = $('cinematic-intro');
    if (!intro) return;

    // Progress bar
    const bar = $('cin-progress-bar');
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';

    const phone      = $('cin-phone');
    const lockScreen = $('cin-phone-lock');
    const scrollScr  = $('cin-phone-scroll');
    if (!phone) return;

    // ── SCENE 1 · Phone materialises ─────────────────────
    if (p <= S.phoneFull) {
      const s1p  = easeO4(prog(p, S.phoneIn, S.phoneFull));
      const rotY = lerp(38, 0, s1p);
      const rotX = lerp(5,  0, s1p);
      const sc   = lerp(0.55, 1.0, s1p);

      phone.style.opacity   = s1p.toFixed(3);
      phone.style.left      = '50%';
      phone.style.top       = '50%';
      phone.style.transform =
        `translate(-50%,-50%) perspective(1200px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    }

    // Scroll hint — visible immediately, hides when phone slides away
    const sh = $('cin-scroll-hint');
    if (sh) {
      const hideHint = p >= S.slideStart;
      sh.style.opacity = hideHint ? '0' : '1';
    }

    // ── SCENE 2 · Scrolling portfolio preview ────────────
    if (scrollScr && lockScreen) {

      // Crossfade lock → scroll → lock
      const scrollShowP = prog(p, S.scrollIn,  S.scrollFull);  // 0→1 fade in
      const scrollHideP = prog(p, S.scrollOut, S.lockIn);      // 0→1 fade out

      const scrollOpacity = easeO3(scrollShowP) * (1 - easeO3(scrollHideP));
      const lockOpacity   = 1 - easeO3(scrollShowP) + easeO3(scrollHideP) * easeO3(scrollShowP);

      scrollScr.style.opacity  = Math.min(1, scrollOpacity).toFixed(3);
      lockScreen.style.opacity = Math.max(0, Math.min(1, lockOpacity)).toFixed(3);

      // Start/stop CSS scroll animation
      if (scrollOpacity > 0.05) {
        scrollScr.classList.add('playing');
      } else {
        scrollScr.classList.remove('playing');
      }

      // Keep phone stationary and straight during scene 2
      if (p > S.phoneFull && p < S.slideStart) {
        phone.style.opacity   = '1';
        phone.style.left      = '50%';
        phone.style.top       = '50%';
        phone.style.transform = 'translate(-50%,-50%) perspective(1200px) scale(1)';
      }
    }

    // ── SCENE 3 · Phone slides to homepage ───────────────
    if (p >= S.slideStart) {
      // Reset scroll screen
      if (scrollScr) scrollScr.style.opacity = '0';
      if (lockScreen) lockScreen.style.opacity = '1';

      const s3p = easeIO(prog(p, S.slideStart, S.slideEnd));

      if (!phoneTarget) phoneTarget = measurePhoneTarget();

      if (phoneTarget) {
        const startCX  = window.innerWidth  * 0.50;
        const startCY  = window.innerHeight * 0.50;
        const phoneEl  = phone.querySelector('.cin-phone-body');
        const startW   = phoneEl ? phoneEl.offsetWidth  : 220;
        const startH   = phoneEl ? phoneEl.offsetHeight : 450;

        const targetCX = phoneTarget.left + phoneTarget.width  / 2;
        const targetCY = phoneTarget.top  + phoneTarget.height / 2;
        const scaleX   = phoneTarget.width  / startW;
        const scaleY   = phoneTarget.height / startH;
        const avgScale = (scaleX + scaleY) / 2;

        const curL = lerp(startCX, targetCX, s3p);
        const curT = lerp(startCY, targetCY, s3p);
        const curS = lerp(1.0, avgScale, s3p);

        phone.style.opacity   = '1';
        phone.style.left      = curL + 'px';
        phone.style.top       = curT + 'px';
        phone.style.transform =
          `translate(-50%,-50%) perspective(1200px) scale(${curS.toFixed(4)})`;
      } else {
        phone.style.opacity = (1 - s3p).toFixed(3);
      }

      // Portfolio fades in
      const mw = $('main-wrapper');
      if (mw) {
        mw.style.visibility = 'visible';
        mw.style.opacity    = s3p.toFixed(3);
      }

      if (p >= 0.992 && !introDone) finishIntro();
    }
  }

  // ──────────────────────────────────────────────────────────
  // FINISH
  // ──────────────────────────────────────────────────────────
  function finishIntro() {
    if (introDone) return;
    introDone = true;

    const phone = $('cin-phone');
    if (phone) { phone.style.opacity = '0'; phone.style.pointerEvents = 'none'; }

    const mw = $('main-wrapper');
    if (mw) {
      mw.style.opacity       = '1';
      mw.style.visibility    = 'visible';
      mw.style.pointerEvents = 'all';
      mw.classList.add('intro-done');
    }

    const intro = $('cinematic-intro');
    if (intro) {
      intro.style.transition = 'opacity 0.5s ease';
      intro.style.opacity    = '0';
      setTimeout(() => intro.remove(), 550);
    }

    const sb = $('intro-skip-btn');
    if (sb) { sb.style.opacity = '0'; setTimeout(() => sb.remove(), 400); }

    document.body.classList.remove('intro-active');
    document.body.style.overflow = '';
    document.body.style.height   = '';

    cancelAnimationFrame(rafId);
  }

  // ──────────────────────────────────────────────────────────
  // MAIN LOOP
  // ──────────────────────────────────────────────────────────
  function loop() {
    progress  += (targetProg - progress) * CFG.lerpSpeed;
    updateScenes(progress);
    rafId = requestAnimationFrame(loop);
  }

  // ──────────────────────────────────────────────────────────
  // INPUT
  // ──────────────────────────────────────────────────────────
  function onWheel(e) {
    if (introDone) return;
    e.preventDefault();
    targetProg = clamp(targetProg + e.deltaY * CFG.scrollSensitivity, 0, 1);
  }

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

  function onKeyDown(e) {
    if (introDone) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault();
      targetProg = clamp(targetProg + 0.07, 0, 1);
    }
    if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      targetProg = clamp(targetProg - 0.07, 0, 1);
    }
  }

  function skipIntro() {
    progress   = 0.96;
    targetProg = 1.0;
    setTimeout(finishIntro, 500);
  }

  // ──────────────────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────────────────
  function init() {
    const intro = $('cinematic-intro');
    if (!intro) return;

    document.body.classList.add('intro-active');
    document.body.style.overflow = 'hidden';

    const mw = $('main-wrapper');
    if (mw) {
      mw.style.opacity    = '0';
      mw.style.visibility = 'hidden';
    }

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('keydown',    onKeyDown);
    window.addEventListener('resize',     () => { phoneTarget = null; });

    const sb = $('intro-skip-btn');
    if (sb) {
      sb.addEventListener('click', skipIntro);
      setTimeout(() => sb.classList.add('visible'), 2000);
    }

    const sh = $('cin-scroll-hint');
    if (sh) sh.classList.add('visible'); // Show immediately on black screen

    loop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

})();
