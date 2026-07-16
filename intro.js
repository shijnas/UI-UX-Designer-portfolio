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

  // Prevent recursive iframe loading (iframe inception)
  if (window.self !== window.top) {
    return;
  }

  const CFG = {
    lerpSpeed:         0.048,         // Decreased for silkier, smoother inertia glide
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
    if (introDone) return;
    const bar = $('cin-progress-bar');
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';

    // Title watermark transition (fades to backdrop background, then fades out at slide)
    const title = $('cin-intro-title');
    if (title) {
      let opacity = 1;
      let scale = 1;
      
      if (p <= 0.3) {
        const tP = prog(p, 0.0, 0.3);
        opacity = lerp(1.0, 0.12, easeIO(tP));
        scale = lerp(1.0, 0.88, easeIO(tP));
      } else if (p > 0.3 && p <= 0.80) {
        opacity = 0.12;
        scale = 0.88;
      } else {
        const tP = prog(p, 0.80, 1.0);
        opacity = lerp(0.12, 0.0, easeIO(tP));
        scale = lerp(0.88, 0.80, easeIO(tP));
      }
      
      title.style.opacity = opacity.toFixed(3);
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

      if (p >= 0.40) {
        lazyLoadProjectIframes();
      }

      if (p >= 0.992 && !introDone) triggerFinishIntro();
    }
  }

  let iframesInitialized = false;
  function lazyLoadProjectIframes() {
    if (iframesInitialized) return;
    iframesInitialized = true;
    
    const isDesktop = window.innerWidth > 1024;
    
    // On mobile/tablet: remove all iframes from DOM and skip loading entirely.
    // Background images remain visible. This completely prevents Safari/Chrome OOM crashes.
    if (!isDesktop) {
      const allIframes = document.querySelectorAll('.phone-screen-iframe, .mac-screen-iframe, .travel-screen-iframe, .health-screen-iframe, .ezio-screen-iframe, .gametesting-screen-iframe');
      allIframes.forEach(iframe => iframe.remove());
      return;
    }
    
    // Desktop only: preload all iframes for interactive hover experience
    const iframes = document.querySelectorAll('.phone-screen-iframe, .mac-screen-iframe, .travel-screen-iframe, .health-screen-iframe, .ezio-screen-iframe, .gametesting-screen-iframe');
    iframes.forEach(iframe => {
      const realSrc = iframe.getAttribute('data-src');
      if (realSrc) {
        iframe.setAttribute('src', realSrc);
        iframe.onload = () => {
          if (window.scaleIframes) window.scaleIframes();
        };
      }
    });
  }

  let finishTriggered = false;
  function triggerFinishIntro() {
    if (finishTriggered) return;
    finishTriggered = true;
    
    // Freeze progress coordinates at final state
    progress = 1.0;
    targetProg = 1.0;
    
    // Scroll to the very top (Hero section) immediately to prevent landing on any other page
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Delay homepage entry by 1 second
    setTimeout(() => {
      // Enforce top position one more time before unlocking
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      finishIntro();
    }, 1000);
  }

  function onResize() {
    phoneTarget = null;
  }

  function finishIntro() {
    if (introDone) return;
    lazyLoadProjectIframes(); // Fallback to load if skipped
    introDone = true;

    // Force top alignment
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

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

    // Clean up event listeners to prevent loop overrun and unnecessary CPU usage
    window.removeEventListener('wheel',      onWheel);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove',  onTouchMove);
    window.removeEventListener('keydown',    onKeyDown);
    window.removeEventListener('resize',     onResize);
  }

  function loop() {
    if (introDone) return;
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
    if (introDone || finishTriggered) return;
    e.preventDefault();
    targetProg = clamp(targetProg + e.deltaY * CFG.scrollSensitivity, 0, 1);
    scheduleLoop();
  }

  function onTouchStart(e) { 
    if (introDone || finishTriggered) return;
    touchY = e.touches[0].clientY; 
  }

  function onTouchMove(e) {
    if (introDone || finishTriggered) return;
    e.preventDefault();
    const dy   = touchY - e.touches[0].clientY;
    touchY     = e.touches[0].clientY;
    targetProg = clamp(targetProg + dy * CFG.touchSensitivity, 0, 1);
    scheduleLoop();
  }

  function onKeyDown(e) {
    if (introDone || finishTriggered) return;
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
    // Execute the top scroll and delay transition
    setTimeout(triggerFinishIntro, 400);
  }

  function init() {
    const intro = $('cinematic-intro');
    if (!intro) return;

    // Optimize sensitivity for mobile/touch screens to make scrolling much faster and snappier
    if (window.innerWidth <= 768) {
      CFG.touchSensitivity = 0.0012; // Balanced fast scroll progression on swipes (~3.5x faster)
      CFG.lerpSpeed = 0.075;        // Silky, responsive inertia tracking
    }

    document.body.classList.add('intro-active');
    document.body.style.overflow = 'hidden';

    const mw = $('main-wrapper');
    if (mw) { mw.style.opacity = '0'; mw.style.visibility = 'hidden'; }

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('keydown',    onKeyDown);
    window.addEventListener('resize',     onResize);

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
