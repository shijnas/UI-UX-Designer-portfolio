/**
 * ============================================================
 * CINEMATIC INTRO — 2-Scene
 * Scene 1 (0–50%):  Phone rotates in, materialises centred
 * Scene 2 (50–100%): Phone slides into homepage position,
 *                    portfolio fades in
 * ============================================================
 */
(function () {
  'use strict';

  const CFG = {
    lerpSpeed:         0.07,
    scrollSensitivity: 0.00028,
    touchSensitivity:  0.00034,
  };

  const S = {
    phoneIn:    0.00,
    phoneFull:  0.50,
    slideStart: 0.50,
    slideEnd:   1.00,
  };

  let progress    = 0;
  let targetProg  = 0;
  let rafId       = null;
  let introDone   = false;
  let phoneTarget = null;
  let touchY      = 0;
  let isLooping   = false;            // prevent duplicate RAF chains

  const $ = id => document.getElementById(id);

  const lerp   = (a, b, t) => a + (b - a) * t;
  const clamp  = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
  const prog   = (t, s, e)  => clamp((t - s) / (e - s), 0, 1);
  const easeO4 = t => 1 - Math.pow(1 - t, 4);
  const easeIO = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

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

  function updateScenes(p) {
    const bar = $('cin-progress-bar');
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';

    // Title fade out & scale zoom based on progress
    const title = $('cin-intro-title');
    if (title) {
      const fade = prog(p, 0.0, 0.22);
      title.style.opacity = (1 - fade).toFixed(3);
      const scale = lerp(1.0, 0.85, fade);
      title.style.transform = `translate3d(-50%, -50%, 0) scale(${scale.toFixed(3)})`;
    }

    const phone = $('cin-phone');
    if (!phone) return;

      // ── SCENE 1 · Phone materialises ─────────────────────
    if (p <= S.phoneFull) {
      const s1p  = easeO4(prog(p, S.phoneIn, S.phoneFull));
      const rotY = lerp(38, 0, s1p);
      const rotX = lerp(5,  0, s1p);
      const sc   = lerp(0.55, 1.0, s1p);

      phone.style.opacity   = s1p.toFixed(3);
      // Pure transform — no left/top writes (compositor-only, zero layout cost)
      phone.style.transform =
        `translate3d(-50%,-50%,0) perspective(1200px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    }

    // Scroll hint
    const sh = $('cin-scroll-hint');
    if (sh) sh.style.opacity = p >= S.slideStart ? '0' : '1';

    // ── SCENE 2 · Phone slides to homepage ───────────────
        if (p >= S.slideStart) {
      const s2p = easeIO(prog(p, S.slideStart, S.slideEnd));

      if (!phoneTarget) phoneTarget = measurePhoneTarget();

      if (phoneTarget) {
        const phoneEl  = phone.querySelector('.cin-phone-body');
        const startW   = phoneEl ? phoneEl.offsetWidth  : 220;
        const startH   = phoneEl ? phoneEl.offsetHeight : 450;

        // Target center relative to viewport (phone is position:fixed)
        const targetCX = phoneTarget.left + phoneTarget.width  / 2;
        const targetCY = phoneTarget.top  + phoneTarget.height / 2;
        // Offset from the phone's fixed centre (50vw, 50vh)
        const originCX = window.innerWidth  * 0.5;
        const originCY = window.innerHeight * 0.5;
        const dx = lerp(0, targetCX - originCX, s2p);
        const dy = lerp(0, targetCY - originCY, s2p);
        const avgScale = ((phoneTarget.width / startW) + (phoneTarget.height / startH)) / 2;
        const curS = lerp(1.0, avgScale, s2p);

        phone.style.opacity   = '1';
        // Single transform — no left/top writes at all
        phone.style.transform =
          `translate3d(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px), 0) perspective(1200px) scale(${curS.toFixed(4)})`;
      } else {
        phone.style.opacity = (1 - s2p).toFixed(3);
      }

      const mw = $('main-wrapper');
      if (mw) {
        mw.style.visibility = 'visible';
        mw.style.opacity    = s2p.toFixed(3);
      }

      if (p >= 0.992 && !introDone) finishIntro();
    }
  }

  function finishIntro() {
    if (introDone) return;
    introDone = true;

    const phone = $('cin-phone');
    if (phone) {
      phone.style.willChange = 'auto';   // release GPU layer after done
      phone.style.opacity = '0';
      phone.style.pointerEvents = 'none';
    }

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
    cancelAnimationFrame(rafId);
  }

  function loop() {
    const delta = Math.abs(targetProg - progress);
    progress += (targetProg - progress) * CFG.lerpSpeed;

    // Only update DOM when something is actually changing
    if (delta > 0.0003) updateScenes(progress);

    // Stop the loop when fully settled (saves GPU on idle)
    if (delta > 0.00005 || progress < 0.9995) {
      rafId = requestAnimationFrame(loop);
    } else {
      isLooping = false;
    }
  }

  function scheduleLoop() {
    if (isLooping || introDone) return;
    isLooping = true;
    rafId = requestAnimationFrame(loop);
  }

  function onWheel(e) {
    if (introDone) return;
    e.preventDefault();
    targetProg = clamp(targetProg + e.deltaY * CFG.scrollSensitivity, 0, 1);
    scheduleLoop();
  }

  function onTouchStart(e) { if (!introDone) touchY = e.touches[0].clientY; }

  function onTouchMove(e) {
    if (introDone) return;
    e.preventDefault();
    const dy   = touchY - e.touches[0].clientY;
    touchY     = e.touches[0].clientY;
    targetProg = clamp(targetProg + dy * CFG.touchSensitivity, 0, 1);
    scheduleLoop();
  }

  function onKeyDown(e) {
    if (introDone) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
      e.preventDefault(); targetProg = clamp(targetProg + 0.07, 0, 1);
    }
    if (['ArrowUp', 'PageUp'].includes(e.key)) {
      e.preventDefault(); targetProg = clamp(targetProg - 0.07, 0, 1);
    }
    scheduleLoop();
  }

  function skipIntro() {
    progress = 0.96; targetProg = 1.0;
    scheduleLoop();
    setTimeout(finishIntro, 500);
  }

  function init() {
    const intro = $('cinematic-intro');
    if (!intro) return;

    document.body.classList.add('intro-active');
    document.body.style.overflow = 'hidden';

    const mw = $('main-wrapper');
    if (mw) { mw.style.opacity = '0'; mw.style.visibility = 'hidden'; }

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
    if (sh) sh.classList.add('visible');

    scheduleLoop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

})();
