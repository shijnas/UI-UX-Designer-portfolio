document.addEventListener('DOMContentLoaded', () => {
  // Prevent recursive iframe loading (iframe inception)
  if (window.self !== window.top) {
    return;
  }
  // ==========================================================================
  // 1. Theme Toggle (Dark / Light Mode)
  // ==========================================================================
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const isMobile = window.innerWidth <= 1024;

  const updateWallpapers = (isLight) => {
    const cinPhoneLock = document.getElementById('cin-phone-lock');
    const lockscreenWallpaper = document.getElementById('lockscreenWallpaper');

    const lightPic = isMobile ? 'assets/mobile/wallpaper-light-m.webp' : 'assets/wallpaper-light.jpg';
    const darkPic  = isMobile ? 'assets/mobile/wallpaper-m.webp'       : 'assets/wallpaper.jpg';
    const currentPic = isLight ? lightPic : darkPic;

    if (cinPhoneLock) {
      cinPhoneLock.src = currentPic;
    }
    if (lockscreenWallpaper) {
      lockscreenWallpaper.style.backgroundImage = `url('${currentPic}')`;
    }
  };

  if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    body.classList.add('light-theme');
    body.classList.remove('dark-theme');
    updateWallpapers(true);
  } else {
    body.classList.add('dark-theme');
    body.classList.remove('light-theme');
    updateWallpapers(false);
  }

  themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
      body.classList.replace('dark-theme', 'light-theme');
      localStorage.setItem('theme', 'light');
      updateWallpapers(true);
    } else {
      body.classList.replace('light-theme', 'dark-theme');
      localStorage.setItem('theme', 'dark');
      updateWallpapers(false);
    }
  });

  // ==========================================================================
  // 2. Sticky Header & Scroll Top Button Visibility
  // ==========================================================================
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Header sticky styling
    if (scrollPos > 50) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }

    // Scroll to top button visibility
    if (scrollPos > 400) {
      scrollTopBtn.style.opacity = '1';
      scrollTopBtn.style.pointerEvents = 'auto';
      scrollTopBtn.style.transform = 'translateY(0)';
    } else {
      scrollTopBtn.style.opacity = '0';
      scrollTopBtn.style.pointerEvents = 'none';
      scrollTopBtn.style.transform = 'translateY(10px)';
    }
  });

  // ==========================================================================
  // 3. Mobile Menu Toggle
  // ==========================================================================
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('mobile-active');
    // Change menu icon representation if toggle is active
    if (navMenu.classList.contains('mobile-active')) {
      mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    } else {
      mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    }
  });

  // Close menu when links are clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('mobile-active');
      mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    });
  });

  // --- Liquid Glass Nav Highlight Slider ---
  const navHighlight = document.getElementById('navHighlight');
  let isMouseOverNav = false;
  
  function updateHighlight(targetEl) {
    if (!targetEl || !navHighlight) return;
    
    // Don't show highlight on mobile expanded nav lists where links stack vertically
    if (window.innerWidth <= 868 || navMenu.classList.contains('mobile-active')) {
      navHighlight.style.opacity = '0';
      return;
    }
    
    navHighlight.style.width = `${targetEl.offsetWidth}px`;
    navHighlight.style.height = `${targetEl.offsetHeight}px`;
    navHighlight.style.transform = `translate3d(${targetEl.offsetLeft}px, ${targetEl.offsetTop}px, 0)`;
    navHighlight.style.opacity = '1';
  }

  // Find active link initially and update
  const activeLink = document.querySelector('.nav-link.active');
  if (activeLink) {
    window.addEventListener('load', () => {
      updateHighlight(activeLink);
    });
    setTimeout(() => {
      updateHighlight(activeLink);
    }, 150);
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      updateHighlight(link);
    });
    
    link.addEventListener('click', () => {
      navLinks.forEach(nl => nl.classList.remove('active'));
      link.classList.add('active');
      updateHighlight(link);
    });
  });

  if (navMenu) {
    navMenu.addEventListener('mouseenter', () => {
      isMouseOverNav = true;
    });
    navMenu.addEventListener('mouseleave', () => {
      isMouseOverNav = false;
      const currentActive = document.querySelector('.nav-link.active');
      if (currentActive) {
        updateHighlight(currentActive);
      } else {
        navHighlight.style.opacity = '0';
      }
    });
  }

  // Adjust highlight layout on resize
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.nav-link.active');
    if (currentActive) {
      updateHighlight(currentActive);
    }
  });

  // ==========================================================================
  // 4. Scroll Reveal Animations (Intersection Observer)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.scroll-reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // If it's the skills section, animate skill bars
        if (entry.target.id === 'process') {
          const skillsSection = entry.target.querySelector('.skills-col');
          if (skillsSection) {
            skillsSection.classList.add('active');
          }
        }
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.02, // Lower threshold so tall stacked grids on mobile trigger reveal instantly (2% of element height)
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ==========================================================================
  // 5. Active Link Highlighting on Scroll (Scrollspy)
  // ==========================================================================
  const sections = document.querySelectorAll('section, footer');
  
  function highlightNavigation() {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 160; // Offset for sticky header
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const id = section.getAttribute('id');
      if (id && scrollPosition >= sectionTop) {
        currentSectionId = id;
      }
    });
    
    if (currentSectionId) {
      let newlyActive = null;
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
          newlyActive = link;
        } else {
          link.classList.remove('active');
        }
      });
      // Move the sliding highlight to the newly active link if user is not hovering
      if (newlyActive && !isMouseOverNav) {
        updateHighlight(newlyActive);
      }
    }
  }

  window.addEventListener('scroll', highlightNavigation);
  highlightNavigation(); // Run on load

  // Initialize scroll-reveal active state for Hero section on load
  const heroElements = document.querySelectorAll('.hero-section .fade-in');
  heroElements.forEach((el, index) => {
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }, 150 * index);
  });

  // ==========================================================================
  // 6. Interactive iPhone 15 Pro Controller
  // ==========================================================================
  const iphoneContainer = document.getElementById('iphoneContainer');
  const iphone3DWrapper = document.getElementById('iphone3DWrapper');
  const iphoneScreen = document.getElementById('iphoneScreen');
  const iphoneReflection = document.getElementById('iphoneReflection');
  const iphoneShadow = document.getElementById('iphoneShadow');
  const lockscreenWallpaper = document.getElementById('lockscreenWallpaper');
  const powerBtn = document.getElementById('iphonePowerBtn');

  // Clock elements
  const lockscreenTime = document.getElementById('lockscreenTime');
  const lockscreenDate = document.getElementById('lockscreenDate');
  const statusTime = document.getElementById('statusTime');
  const unlockedTime = document.getElementById('unlockedTime');

  // Slide to unlock elements
  const sliderThumb = document.getElementById('sliderThumb');
  const sliderContainer = document.getElementById('sliderContainer');
  const sliderBgGlow = document.querySelector('.slider-bg-glow');
  const sliderText = document.getElementById('sliderText');

  // Face ID elements
  const lockIcon = document.getElementById('lockIcon');
  const faceidScanner = document.getElementById('faceidScanner');
  const faceidCheckmark = document.getElementById('faceidCheckmark');

  // Dynamic Island elements
  const dynamicIsland = document.getElementById('dynamicIsland');
  const menuBtnResume = document.getElementById('menuBtnResume');
  const menuBtnContact = document.getElementById('menuBtnContact');
  const menuBtnLock = document.getElementById('menuBtnLock');

  // Start phone idle floating
  if (iphoneContainer) {
    iphoneContainer.classList.add('float-idle');
  }

  // --- 6a. Live iOS Clock & Date ---
  function updateIosTime() {
    const now = new Date();
    
    // Time (HH:MM)
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const timeStr = `${hours}:${minutes}`;
    
    if (lockscreenTime) lockscreenTime.textContent = timeStr;
    if (statusTime) statusTime.textContent = timeStr;
    if (unlockedTime) unlockedTime.textContent = timeStr;

    // Date
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const dateNum = now.getDate();
    
    if (lockscreenDate) {
      lockscreenDate.textContent = `${dayName}, ${monthName} ${dateNum}`;
    }
  }
  updateIosTime();
  setInterval(updateIosTime, 60000); // Update every minute

  // --- 6b. 3D Interaction & Spring Animation (LERP) ---
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;
  let isHovered = false;
  let animationFrameId = null;

  function update3DRotation() {
    // Spring LERP effect
    currentRotateX += (targetRotateX - currentRotateX) * 0.15;
    currentRotateY += (targetRotateY - currentRotateY) * 0.15;

    // Apply 3D transform to phone wrapper
    if (iphone3DWrapper) {
      iphone3DWrapper.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;
    }

    // Dynamic Reflection movement
    if (iphoneReflection) {
      const reflectX = 50 + (currentRotateY * 3);
      const reflectY = 50 - (currentRotateX * 3);
      iphoneReflection.style.background = `linear-gradient(${135 + currentRotateY * 2}deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0.05) 100%)`;
    }

    // Parallax wallpaper shift
    if (lockscreenWallpaper) {
      const px = currentRotateY * 0.8;
      const py = -currentRotateX * 0.8;
      lockscreenWallpaper.style.transform = `scale(1.1) translate(${px}px, ${py}px)`;
    }

    // Shift phone shadow in opposite direction of tilt
    if (iphoneShadow) {
      const sx = -currentRotateY * 1.5;
      const sy = currentRotateX * 1.5;
      iphoneShadow.style.transform = `translate3d(${sx}px, ${sy}px, -30px)`;
    }

    // Continue loop if hovered or still transitioning back to neutral
    const deltaX = Math.abs(targetRotateX - currentRotateX);
    const deltaY = Math.abs(targetRotateY - currentRotateY);
    
    if (isHovered || deltaX > 0.05 || deltaY > 0.05) {
      animationFrameId = requestAnimationFrame(update3DRotation);
    } else {
      // Loop finished, snap to exact target and re-enable idle floating
      currentRotateX = 0;
      currentRotateY = 0;
      if (iphone3DWrapper) iphone3DWrapper.style.transform = '';
      if (iphoneContainer) iphoneContainer.classList.add('float-idle');
      animationFrameId = null;
    }
  }

  if (iphoneContainer) {
    iphoneContainer.addEventListener('mousemove', (e) => {
      isHovered = true;
      iphoneContainer.classList.remove('float-idle');
      
      const rect = iphoneContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles (max ±12 degrees)
      targetRotateY = ((x - centerX) / centerX) * 12;
      targetRotateX = -((y - centerY) / centerY) * 12;

      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(update3DRotation);
      }
    });

    iphoneContainer.addEventListener('mouseleave', () => {
      isHovered = false;
      targetRotateX = 0;
      targetRotateY = 0;
    });
  }

  // --- 6c. Slider: Slide to Open Portfolio ---
  let isDragging = false;
  let startX = 0;
  let maxDrag = 0;

  if (sliderThumb) {
    const startDrag = (e) => {
      isDragging = true;
      startX = (e.type === 'touchstart') ? e.touches[0].clientX : e.clientX;
      const trackWidth = sliderContainer.clientWidth;
      const thumbWidth = sliderThumb.clientWidth;
      maxDrag = trackWidth - thumbWidth - 6;
      sliderThumb.style.transition = 'none';
      if (sliderBgGlow) sliderBgGlow.style.transition = 'none';
      
      document.addEventListener('mousemove', doDrag);
      document.addEventListener('mouseup', endDrag);
      document.addEventListener('touchmove', doDrag, { passive: false });
      document.addEventListener('touchend', endDrag);
    };

    const doDrag = (e) => {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();
      
      const currentX = (e.type === 'touchmove') ? e.touches[0].clientX : e.clientX;
      let deltaX = currentX - startX;
      
      if (deltaX < 0) deltaX = 0;
      if (deltaX > maxDrag) deltaX = maxDrag;

      sliderThumb.style.transform = `translateX(${deltaX}px)`;
      
      // Glow and fade slider text based on drag progress
      const percent = deltaX / maxDrag;
      if (sliderBgGlow) sliderBgGlow.style.width = `${percent * 100}%`;
      if (sliderText) sliderText.style.opacity = `${1 - percent * 1.5}`;
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('touchmove', doDrag);
      document.removeEventListener('touchend', endDrag);

      const currentTransform = window.getComputedStyle(sliderThumb).transform;
      let currentX = 0;
      if (currentTransform !== 'none') {
        const matrix = new WebKitCSSMatrix(currentTransform);
        currentX = matrix.m41;
      }

      // Check unlock threshold (75%)
      if (currentX >= maxDrag * 0.75) {
        sliderThumb.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
        sliderThumb.style.transform = `translateX(${maxDrag}px)`;
        if (sliderBgGlow) {
          sliderBgGlow.style.transition = 'width 0.2s';
          sliderBgGlow.style.width = '100%';
        }
        triggerFaceIDUnlock();
      } else {
        sliderThumb.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
        sliderThumb.style.transform = 'translateX(0)';
        if (sliderBgGlow) {
          sliderBgGlow.style.transition = 'width 0.3s';
          sliderBgGlow.style.width = '0';
        }
        if (sliderText) {
          sliderText.style.transition = 'opacity 0.3s';
          sliderText.style.opacity = '1';
        }
      }
    };

    sliderThumb.addEventListener('mousedown', startDrag);
    sliderThumb.addEventListener('touchstart', startDrag, { passive: true });
  }

  // --- 6d. Face ID & Screen Unlock Transition ---
  function triggerFaceIDUnlock() {
    if (lockIcon) lockIcon.style.display = 'none';
    if (faceidScanner) faceidScanner.style.display = 'flex';

    if (dynamicIsland) {
      dynamicIsland.style.width = '110px';
      setTimeout(() => {
        dynamicIsland.style.width = '';
      }, 1000);
    }

    setTimeout(() => {
      if (faceidCheckmark) {
        faceidCheckmark.style.display = 'block';
        faceidCheckmark.style.transform = 'scale(1.1)';
        faceidCheckmark.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      }
      
      const rings = document.querySelectorAll('.faceid-scanner .ring');
      rings.forEach(r => r.style.display = 'none');

      setTimeout(() => {
        if (iphoneScreen) iphoneScreen.classList.add('unlocked');
        
        if (dynamicIsland) {
          dynamicIsland.style.transform = 'scale(1.05)';
          setTimeout(() => {
            dynamicIsland.style.transform = 'scale(1)';
          }, 300);
        }
      }, 400);

    }, 900);
  }

  // --- 6e. Lock Again Mechanisms (Power Button / Menu Lock) ---
  function lockIPhone() {
    if (!iphoneScreen.classList.contains('unlocked') && !iphoneScreen.classList.contains('blackout')) return;

    iphoneScreen.classList.add('blackout');
    
    if (dynamicIsland) {
      dynamicIsland.classList.remove('expanded');
    }

    setTimeout(() => {
      iphoneScreen.classList.remove('unlocked');
      
      if (sliderThumb) sliderThumb.style.transform = 'translateX(0)';
      if (sliderBgGlow) sliderBgGlow.style.width = '0';
      if (sliderText) sliderText.style.opacity = '1';

      if (lockIcon) lockIcon.style.display = 'block';
      if (faceidScanner) faceidScanner.style.display = 'none';
      if (faceidCheckmark) faceidCheckmark.style.display = 'none';
      const rings = document.querySelectorAll('.faceid-scanner .ring');
      rings.forEach(r => r.style.display = 'block');

      setTimeout(() => {
        iphoneScreen.classList.remove('blackout');
      }, 150);
    }, 300);
  }

  if (powerBtn) {
    powerBtn.addEventListener('click', lockIPhone);
  }

  // Flashlight and Camera Shortcuts
  const btnFlashlight = document.querySelector('.btn-flashlight');
  if (btnFlashlight) {
    btnFlashlight.addEventListener('click', () => {
      btnFlashlight.classList.toggle('active');
    });
  }

  const btnCamera = document.querySelector('.btn-camera');
  if (btnCamera && iphoneScreen) {
    btnCamera.addEventListener('click', () => {
      // Simulate camera snapshot flash
      const flash = document.createElement('div');
      flash.style.position = 'absolute';
      flash.style.top = '0';
      flash.style.left = '0';
      flash.style.width = '100%';
      flash.style.height = '100%';
      flash.style.backgroundColor = '#ffffff';
      flash.style.zIndex = '99';
      flash.style.opacity = '1';
      flash.style.transition = 'opacity 0.3s ease';
      iphoneScreen.appendChild(flash);
      
      setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
          flash.remove();
        }, 300);
      }, 50);
    });
  }

  // --- 6f. Dynamic Island Expansion & Interactions ---
  if (dynamicIsland) {
    dynamicIsland.addEventListener('click', (e) => {
      if (e.target.closest('.dynamic-menu-item')) return;
      dynamicIsland.classList.toggle('expanded');
    });

    document.addEventListener('click', (e) => {
      if (!dynamicIsland.contains(e.target)) {
        dynamicIsland.classList.remove('expanded');
      }
    });
  }

  if (menuBtnLock) {
    menuBtnLock.addEventListener('click', lockIPhone);
  }

  if (menuBtnResume) {
    menuBtnResume.addEventListener('click', (e) => {
      dynamicIsland.classList.remove('expanded');
      if (!iphoneScreen.classList.contains('unlocked')) {
        e.preventDefault();
        triggerFaceIDUnlock();
      }
    });
  }

  if (menuBtnContact) {
    menuBtnContact.addEventListener('click', (e) => {
      dynamicIsland.classList.remove('expanded');
      if (!iphoneScreen.classList.contains('unlocked')) {
        triggerFaceIDUnlock();
      }
    });
  }

  // Back button in iOS app locks phone
  const iosBackArrow = document.querySelector('.ios-back-arrow');
  if (iosBackArrow) {
    iosBackArrow.addEventListener('click', lockIPhone);
  }

  // Resume Nav link in header scrolls to hero and unlocks phone
  const navLinkResume = document.getElementById('navLinkResume');
  if (navLinkResume) {
    navLinkResume.addEventListener('click', (e) => {
      const heroSec = document.getElementById('hero');
      if (heroSec) {
        e.preventDefault();
        heroSec.scrollIntoView({ behavior: 'smooth' });
      }
      
      if (!iphoneScreen.classList.contains('unlocked')) {
        setTimeout(() => {
          triggerFaceIDUnlock();
        }, 600);
      }
    });
  }

  // ==========================================================================
  // Custom Liquid Glass Cursor Logic (Arrow Pointer + Trail)
  // ==========================================================================
  const cursorArrow = document.getElementById('cursorArrow');
  const cursorTrail = document.getElementById('cursorTrail');
  
  if (cursorArrow && cursorTrail) {
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    let isLoopActive = false;
    let isMoving = false;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Make visible on first move
      if (!isMoving) {
        cursorArrow.style.opacity = '1';
        cursorTrail.style.opacity = '1';
        isMoving = true;
      }
      
      // Position the main glass arrow instantly so clicking feels fast and accurate
      const isHover = cursorArrow.classList.contains('hover');
      const offsetX = isHover ? 12 : 4.5;
      const offsetY = isHover ? 1.5 : 3;
      cursorArrow.style.transform = `translate3d(${mouseX - offsetX}px, ${mouseY - offsetY}px, 0)`;
      
      // Trigger smooth trail LERP loop only if not currently running
      if (!isLoopActive) {
        isLoopActive = true;
        animateCursor();
      }
    });
    
    // Smooth LERP loop for lagging trail glass arrow
    function animateCursor() {
      const lerpFactor = 0.15; // Smooth trailing lag
      const diffX = mouseX - trailX;
      const diffY = mouseY - trailY;
      
      const isHover = cursorArrow.classList.contains('hover');
      const offsetX = isHover ? 12 : 4.5;
      const offsetY = isHover ? 1.5 : 3;

      // Exit loop and save CPU/GPU resources if trail caught up and mouse is idle
      if (Math.abs(diffX) < 0.08 && Math.abs(diffY) < 0.08) {
        trailX = mouseX;
        trailY = mouseY;
        cursorTrail.style.transform = `translate3d(${trailX - offsetX}px, ${trailY - offsetY}px, 0)`;
        isLoopActive = false;
        return;
      }
      
      trailX += diffX * lerpFactor;
      trailY += diffY * lerpFactor;
      
      cursorTrail.style.transform = `translate3d(${trailX - offsetX}px, ${trailY - offsetY}px, 0)`;
      
      requestAnimationFrame(animateCursor);
    }
    
    // Hover effects on interactive elements
    function addHoverListeners() {
      const clickables = document.querySelectorAll('a, button, .clickable, [role="button"], input, select, textarea, .contact-pill, .nav-link, .btn-contact-me, .social-icon-btn, .toolbar-btn, .scroll-top-btn');
      
      clickables.forEach(item => {
        item.addEventListener('mouseenter', () => {
          cursorArrow.classList.add('hover');
          cursorTrail.classList.add('hover');
        });
        item.addEventListener('mouseleave', () => {
          cursorArrow.classList.remove('hover');
          cursorTrail.classList.remove('hover');
        });
      });
    }
    addHoverListeners();
    
    // Dynamic selector observer to bind dynamically added elements
    const observer = new MutationObserver(() => {
      addHoverListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Hide cursor when it leaves the page window
    document.addEventListener('mouseleave', () => {
      cursorArrow.style.opacity = '0';
      cursorTrail.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
      cursorArrow.style.opacity = '1';
      cursorTrail.style.opacity = '1';
    });
  }

  // ==========================================================================
  // Testimonial Feedback Form and List Logic
  // ==========================================================================
  const starRatingSelector = document.getElementById('starRatingSelector');
  const feedbackRatingValue = document.getElementById('feedbackRatingValue');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackList = document.getElementById('feedbackList');

  if (starRatingSelector && feedbackRatingValue && feedbackForm && feedbackList) {
    const stars = starRatingSelector.querySelectorAll('.star-select');
    let selectedRating = 5;

    // Handle Star Selection Click and Hover
    stars.forEach(star => {
      // Click event
      star.addEventListener('click', () => {
        selectedRating = parseInt(star.getAttribute('data-rating'));
        feedbackRatingValue.value = selectedRating;
        updateStars(selectedRating);
      });

      // Mouse enter hover preview
      star.addEventListener('mouseenter', () => {
        const hoverRating = parseInt(star.getAttribute('data-rating'));
        highlightStars(hoverRating);
      });
    });

    starRatingSelector.addEventListener('mouseleave', () => {
      updateStars(selectedRating);
    });

    function highlightStars(rating) {
      stars.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-rating'));
        if (starVal <= rating) {
          star.classList.add('hovered');
        } else {
          star.classList.remove('hovered');
        }
      });
    }

    function updateStars(rating) {
      stars.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-rating'));
        star.classList.remove('hovered');
        if (starVal <= rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
    }

    // Default Initial Reviews
    const defaultReviews = [
      {
        name: "James Carter",
        role: "CEO, Finova",
        rating: 5,
        comment: "Shijnas is a fantastic designer! He delivered high-quality work on time and understood our requirements perfectly."
      },
      {
        name: "Sarah Williams",
        role: "Product Manager, TechFlow",
        rating: 5,
        comment: "Great communication, amazing designs, and very professional. Highly recommended for any UI/UX project!"
      }
    ];

    // Load from LocalStorage
    let reviews = JSON.parse(localStorage.getItem('shijnas_portfolio_reviews'));
    if (!reviews || reviews.length === 0) {
      reviews = defaultReviews;
      localStorage.setItem('shijnas_portfolio_reviews', JSON.stringify(reviews));
    }

    // Render Review Cards
    function renderReviews() {
      feedbackList.innerHTML = '';
      reviews.forEach(review => {
        const starStr = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'feedback-item';
        reviewItem.innerHTML = `
          <div class="feedback-item-rating">
            <span class="stars">${starStr}</span>
          </div>
          <p class="feedback-item-text">
            "${review.comment}"
          </p>
          <div class="feedback-item-client">
            <span class="client-name">${review.name}</span>
            ${review.role ? `<span class="client-role">${review.role}</span>` : ''}
          </div>
        `;
        feedbackList.appendChild(reviewItem);
      });
    }
    renderReviews();

    // Form Submission
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameVal = document.getElementById('feedbackName').value.trim();
      const roleVal = document.getElementById('feedbackRole').value.trim();
      const commentVal = document.getElementById('feedbackComment').value.trim();
      const ratingVal = parseInt(feedbackRatingValue.value);

      if (!nameVal || !commentVal) return;

      const newReview = {
        name: nameVal,
        role: roleVal,
        rating: ratingVal,
        comment: commentVal
      };

      // Add to beginning of list
      reviews.unshift(newReview);
      localStorage.setItem('shijnas_portfolio_reviews', JSON.stringify(reviews));

      // Reset Form
      feedbackForm.reset();
      selectedRating = 5;
      feedbackRatingValue.value = 5;
      updateStars(5);

      renderReviews();
    });

    // --- Typewriter Hero Subtitle Rotation ---
    const typedRole = document.getElementById('typedRole');
    if (typedRole) {
      const roles = [
        'UI/UX Designer',
        'Web Developer',
        'WebApplication Developer',
        'Game Tester'
      ];
      let roleIndex = 0;
      let charIndex = roles[roleIndex].length;
      let isDeleting = true; // Start with deleting the pre-rendered text
      let typingSpeed = 100;

      function typeEffect() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
          // Remove character
          typedRole.textContent = currentRole.substring(0, charIndex - 1);
          charIndex--;
          typingSpeed = 50; // Deleting is faster
        } else {
          // Add character
          typedRole.textContent = currentRole.substring(0, charIndex + 1);
          charIndex++;
          typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentRole.length) {
          // Pause at the end of the word
          typingSpeed = 2000;
          isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
          isDeleting = false;
          // Move to the next role
          roleIndex = (roleIndex + 1) % roles.length;
          typingSpeed = 500; // Small pause before typing next word
        }

        setTimeout(typeEffect, typingSpeed);
      }
      
      // Start typing loop after 2 seconds
      setTimeout(typeEffect, 2000);
    }

    // --- 6g. Dynamic 3-Phones Iframe Scaling System ---
    function scaleIframes() {
      const phones = document.querySelectorAll('.mock-phone');
      phones.forEach(phone => {
        const iframe = phone.querySelector('.phone-screen-iframe');
        if (!iframe) return;
        
        // Get actual dimensions of the mock-phone frame (excluding border)
        const borderW = parseFloat(window.getComputedStyle(phone).borderLeftWidth) || 6;
        const phoneW = phone.clientWidth - (borderW * 2);
        const phoneH = phone.clientHeight - (borderW * 2);
        
        // Base viewport size we want to render inside the iframe (standard mobile viewport)
        const baseW = 375;
        const baseH = 760;
        
        // Calculate required scale factor
        const scaleX = phoneW / baseW;
        const scaleY = phoneH / baseH;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply styling to iframe
        iframe.style.width = baseW + 'px';
        iframe.style.height = baseH + 'px';
        iframe.style.transform = `scale(${scale.toFixed(4)})`;
        iframe.style.transformOrigin = 'top left';
        iframe.style.position = 'absolute';
        
        // Center the scaled iframe inside the phone screen
        const offsetLeft = (phoneW - baseW * scale) / 2;
        const offsetTop = (phoneH - baseH * scale) / 2;
        iframe.style.left = offsetLeft.toFixed(1) + 'px';
        iframe.style.top = offsetTop.toFixed(1) + 'px';
      });

      // Scale Mac Studio Display screen iframe to fit desktop layout edge-to-edge
      const macContainer = document.querySelector('.mac-screen-container');
      if (macContainer) {
        const iframe = macContainer.querySelector('.mac-screen-iframe');
        if (iframe) {
          const containerW = macContainer.clientWidth;
          const containerH = macContainer.clientHeight;
          if (containerW > 0 && containerH > 0) {
            // Render natively at widescreen desktop width (1280px) and match container aspect ratio
            const baseW = 1280;
            const baseH = Math.round(baseW * (containerH / containerW)) || 745;
            const scale = containerW / baseW;

            // Apply size and transform scale
            iframe.style.width = baseW + 'px';
            iframe.style.height = baseH + 'px';
            iframe.style.transform = `scale(${scale.toFixed(4)})`;
            iframe.style.transformOrigin = 'top left';
            iframe.style.position = 'absolute';
            iframe.style.left = '0';
            iframe.style.top = '0';
          }
        }
      }

      // Scale Travel Display screen iframe to fit desktop layout edge-to-edge
      const travelContainer = document.querySelector('.travel-screen-container');
      if (travelContainer) {
        const iframe = travelContainer.querySelector('.travel-screen-iframe');
        if (iframe) {
          const containerW = travelContainer.clientWidth;
          const containerH = travelContainer.clientHeight;
          if (containerW > 0 && containerH > 0) {
            // Render natively at widescreen desktop width (1280px) and match container aspect ratio
            const baseW = 1280;
            const baseH = Math.round(baseW * (containerH / containerW)) || 745;
            const scale = containerW / baseW;

            // Apply size and transform scale
            iframe.style.width = baseW + 'px';
            iframe.style.height = baseH + 'px';
            iframe.style.transform = `scale(${scale.toFixed(4)})`;
            iframe.style.transformOrigin = 'top left';
            iframe.style.position = 'absolute';
            iframe.style.left = '0';
            iframe.style.top = '0';
          }
        }
      }

      // Scale Health Display screen iframe to fit desktop layout edge-to-edge
      const healthContainer = document.querySelector('.health-screen-container');
      if (healthContainer) {
        const iframe = healthContainer.querySelector('.health-screen-iframe');
        if (iframe) {
          const containerW = healthContainer.clientWidth;
          const containerH = healthContainer.clientHeight;
          if (containerW > 0 && containerH > 0) {
            const baseW = 1280;
            const baseH = Math.round(baseW * (containerH / containerW)) || 745;
            const scale = containerW / baseW;

            iframe.style.width = baseW + 'px';
            iframe.style.height = baseH + 'px';
            iframe.style.transform = `scale(${scale.toFixed(4)})`;
            iframe.style.transformOrigin = 'top left';
            iframe.style.position = 'absolute';
            iframe.style.left = '0';
            iframe.style.top = '0';
          }
        }
      }

      // Scale EZIO Display screen iframe to fit desktop layout edge-to-edge
      const ezioContainer = document.querySelector('.ezio-screen-container');
      if (ezioContainer) {
        const iframe = ezioContainer.querySelector('.ezio-screen-iframe');
        if (iframe) {
          const containerW = ezioContainer.clientWidth;
          const containerH = ezioContainer.clientHeight;
          if (containerW > 0 && containerH > 0) {
            const baseW = 1280;
            const baseH = Math.round(baseW * (containerH / containerW)) || 745;
            const scale = containerW / baseW;

            iframe.style.width = baseW + 'px';
            iframe.style.height = baseH + 'px';
            iframe.style.transform = `scale(${scale.toFixed(4)})`;
            iframe.style.transformOrigin = 'top left';
            iframe.style.position = 'absolute';
            iframe.style.left = '0';
            iframe.style.top = '0';
          }
        }
      }

      // Scale Game Testing Display screen iframe to fit desktop layout edge-to-edge
      const gametestingContainer = document.querySelector('.gametesting-screen-container');
      if (gametestingContainer) {
        const iframe = gametestingContainer.querySelector('.gametesting-screen-iframe');
        if (iframe) {
          const containerW = gametestingContainer.clientWidth;
          const containerH = gametestingContainer.clientHeight;
          if (containerW > 0 && containerH > 0) {
            const baseW = 1280;
            const baseH = Math.round(baseW * (containerH / containerW)) || 745;
            const scale = containerW / baseW;

            iframe.style.width = baseW + 'px';
            iframe.style.height = baseH + 'px';
            iframe.style.transform = `scale(${scale.toFixed(4)})`;
            iframe.style.transformOrigin = 'top left';
            iframe.style.position = 'absolute';
            iframe.style.left = '0';
            iframe.style.top = '0';
          }
        }
      }
    }

    // Run scaling on load, resize, and orientation change (debounced to save CPU/GPU cycles)
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(scaleIframes, 150);
    });
    window.addEventListener('load', scaleIframes);
    window.scaleIframes = scaleIframes; // Expose globally to trigger on lazy load
    scaleIframes();
    
    // Fallback trigger after short delays to ensure final dimensions are computed after dynamic contents load
    setTimeout(scaleIframes, 500);
    setTimeout(scaleIframes, 1500);
    setTimeout(scaleIframes, 3000);

    // ==========================================================================
    // GPU Optimization: Pause CSS animations when offscreen
    // ==========================================================================
    if ('IntersectionObserver' in window) {
      // 1. Observe Hero Section to pause floating widgets and background glows
      const heroSection = document.getElementById('hero');
      const glowBgs = document.querySelectorAll('.glow-bg');
      if (heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              heroSection.classList.remove('pause-animations');
              glowBgs.forEach(el => el.classList.remove('pause-animations'));
            } else {
              heroSection.classList.add('pause-animations');
              glowBgs.forEach(el => el.classList.add('pause-animations'));
            }
          });
        }, { threshold: 0 });
        heroObserver.observe(heroSection);
      }

      // 2. Observe Game Testing Card to pause rotating fans and flickering neon
      const gameTestingInteractive = document.querySelector('.project-gametesting-interactive');
      if (gameTestingInteractive) {
        const gameTestingCard = gameTestingInteractive.closest('.project-card');
        if (gameTestingCard) {
          const gameTestingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                gameTestingCard.classList.remove('pause-animations');
              } else {
                gameTestingCard.classList.add('pause-animations');
              }
            });
          }, { threshold: 0 });
          gameTestingObserver.observe(gameTestingCard);
        }
      }
    }
  }
});
