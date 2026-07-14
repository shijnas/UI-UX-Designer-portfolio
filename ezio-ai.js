/* ==========================================================================
   EZIO AI — Portfolio Assistant Brain
   Knowledge base, intent matching, response engine, streaming, and UI.
   Author: Built for Shijnas Yunus Portfolio
   ========================================================================== */

(function () {
  'use strict';

  // ============================================================
  // 1. KNOWLEDGE BASE
  // ============================================================
  const KB = {
    identity: {
      name: 'Shijnas Yunus',
      role: ['UI/UX Designer', 'Frontend Developer', 'Game Tester'],
      location: 'Kannur, Kerala, India',
      tagline: 'I design intuitive digital experiences that are visually appealing, user-friendly, and built to achieve results.',
      availability: 'Open for freelance and full-time opportunities.',
      summary: `I'm a passionate UI/UX Designer and Frontend Developer with hands-on experience creating clean, modern, and user-centered digital products. I combine design thinking with front-end development skills to deliver complete, production-ready digital experiences. I'm also experienced in game testing and QA.`,
    },
    contact: {
      email: 'yshijnas@gmail.com',
      linkedin: 'https://www.linkedin.com/in/shijnas-yunus-911192332/',
      instagram: 'https://www.instagram.com/shij_nas_07',
      github: 'https://github.com/shijnas',
      resume: 'assets/resume.pdf',
    },
    education: [
      {
        degree: 'Bachelor of Computer Applications (BCA)',
        institution: 'De Paul Institute of Science and Technology',
        location: 'Kerala, India',
        period: '2021 – 2024',
        details: 'Studied core computer applications, UI design, web development, and software engineering fundamentals.',
      },
    ],
    experience: [
      {
        role: 'UI/UX Designer',
        type: 'Freelance',
        period: '2022 – Present',
        highlights: [
          'Designed 20+ UI/UX projects covering mobile apps, dashboards, and web platforms.',
          'Delivered end-to-end design including user research, wireframes, UI design, and interactive prototypes.',
          'Specialized in SaaS dashboards, food delivery, travel, banking, and healthcare products.',
          'Collaborated with developers to ensure pixel-perfect implementation.',
        ],
      },
      {
        role: 'Frontend Developer',
        type: 'Project-based',
        period: '2023 – Present',
        highlights: [
          'Built responsive, modern websites using HTML5, CSS3, and vanilla JavaScript.',
          'Implemented glassmorphism, dark-mode, and animation-heavy portfolio sites.',
          'Developed interactive iOS-style UI mockups for presentation purposes.',
        ],
      },
      {
        role: 'Game Tester / QA',
        type: 'Project-based',
        period: '2022 – Present',
        highlights: [
          'Tested mobile and PC games for UI bugs, gameplay issues, and performance inconsistencies.',
          'Reported bugs through structured QA documents and issue trackers.',
          'Verified game builds across multiple device configurations.',
        ],
      },
    ],
    skills: {
      design: ['Figma', 'Adobe XD', 'Adobe Photoshop', 'Adobe Illustrator', 'Framer', 'Miro', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping', 'Design Systems'],
      frontend: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Glassmorphism', 'CSS Animations', 'DOM Manipulation'],
      tools: ['Notion', 'Jira', 'GitHub', 'Miro', 'Framer'],
      qa: ['Game Testing', 'QA Documentation', 'Bug Reporting', 'Test Cases', 'Device Testing', 'Regression Testing'],
    },
    projects: [
      {
        name: 'GourmetGo Food Delivery App',
        category: 'Mobile App',
        tags: ['UI/UX', 'Mobile', 'Figma'],
        description: 'Complete end-to-end UI/UX design for GourmetGo, a modern food delivery app with intuitive ordering flow, real-time tracking screen, restaurant listing, and checkout experience.',
        image: 'assets/project-food.png',
        link: 'https://food-delivery-opal-two.vercel.app/',
      },
      {
        name: 'Banking Dashboard',
        category: 'Dashboard',
        tags: ['UI/UX', 'Dashboard', 'SaaS', 'Figma'],
        description: 'A financial analytics dashboard for managing accounts, tracking transactions, and visualizing spending trends — designed with a clean dark theme.',
        image: 'assets/project-banking.jpg',
        link: '#projects',
      },
      {
        name: 'Travel Booking Website',
        category: 'Web Design',
        tags: ['UI/UX', 'Web', 'Figma'],
        description: 'End-to-end UI design for a travel booking platform covering homepage, destination search, hotel listing, and booking confirmation screens.',
        image: 'assets/project-travel.jpg',
        link: '#projects',
      },
      {
        name: 'Healthcare Dashboard',
        category: 'Dashboard',
        tags: ['UI/UX', 'Dashboard', 'SaaS', 'Healthcare', 'Figma'],
        description: 'A comprehensive healthcare management system dashboard designed for doctors and clinic managers to track patient data, appointments, and medical records.',
        image: 'assets/project-healthcare.jpg',
        link: '#projects',
      },
    ],
    process: [
      { step: 1, name: 'Research', detail: 'I start by deeply understanding user needs, business goals, and competitors through surveys, interviews, and competitive analysis.' },
      { step: 2, name: 'Ideation', detail: 'I brainstorm solutions using mind-maps, mood boards, and sketches to explore multiple design directions.' },
      { step: 3, name: 'Wireframing', detail: 'I create low-fidelity wireframes to define layout, information architecture, and user flows before any visual design.' },
      { step: 4, name: 'UI Design', detail: 'High-fidelity, pixel-perfect designs in Figma with proper typography, color systems, and component libraries.' },
      { step: 5, name: 'Prototyping', detail: 'Interactive Figma prototypes are created to simulate real user interactions and test the experience.' },
      { step: 6, name: 'Testing & Handoff', detail: 'User testing sessions, feedback loops, and final developer handoff with design specs and assets.' },
    ],
    certifications: [
      { name: 'UI/UX Design Fundamentals', issuer: 'Self-study & online platforms', year: '2022' },
      { name: 'Figma Advanced Design', issuer: 'Figma Community & Courses', year: '2022' },
      { name: 'Frontend Development', issuer: 'Self-taught / Project-based learning', year: '2023' },
    ],
    services: [
      'UI Design — Modern and clean user interfaces',
      'UX Research — User research and competitive analysis',
      'Mobile App Design — Android & iOS app designs',
      'Web Design — Responsive and modern website design',
      'Dashboard Design — SaaS dashboards and admin panels',
      'Prototyping — Interactive prototypes and animations',
      'Web Development — HTML5, CSS3, and JS development',
      'Web Application Development — Complex web app builds',
    ],
  };

  // ============================================================
  // 2. INTENT MATCHER
  // ============================================================
  const intents = [
    {
      id: 'greeting',
      patterns: [/\b(hi|hello|hey|good (morning|evening|afternoon)|howdy|what's up|sup)\b/i],
      respond: () => `Hey there! 👋 I'm **Ezio**, Shijnas' personal AI assistant. I know everything about his work, skills, and projects.\n\nAsk me anything — like *"Tell me about Shijnas"*, *"What projects has he done?"*, or *"Can I hire him?"*`,
    },
    {
      id: 'who',
      patterns: [/\b(who are you|who is shijnas|tell me about (yourself|him|shijnas)|about me|introduce yourself|your story|his story)\b/i],
      respond: () =>
        `I'm **Ezio**, representing **Shijnas Yunus** — a passionate UI/UX Designer, Frontend Developer, and Game Tester based in **Kannur, Kerala, India**. 🇮🇳\n\n${KB.identity.summary}\n\nHe's completed **20+ projects** across mobile apps, dashboards, and web platforms — always aiming for clean, user-centered design.`,
    },
    {
      id: 'experience',
      patterns: [/\b(experience|background|work history|career|worked|working)\b/i],
      respond: () => {
        const exp = KB.experience;
        let res = `Here's a summary of Shijnas' experience:\n\n`;
        exp.forEach(e => {
          res += `**${e.role}** (${e.type} · ${e.period})\n`;
          e.highlights.slice(0, 2).forEach(h => (res += `• ${h}\n`));
          res += '\n';
        });
        return res.trim();
      },
    },
    {
      id: 'projects',
      patterns: [/\b(projects?|portfolio|work|case stud(y|ies)|show me|what (have|has) (you|he) (built|made|designed|done)|best project)\b/i],
      respond: () => ({ type: 'projects', message: `Here are Shijnas' featured projects 🎨 — tap any card to explore:` }),
    },
    {
      id: 'skills',
      patterns: [/\b(skills?|know|expertise|proficient|good at|strongest|technologies|tech stack|what (can|do) (you|he) (do|know|use))\b/i],
      respond: () =>
        `Shijnas' skill set spans **design**, **frontend development**, and **QA**:\n\n**Design Tools:** ${KB.skills.design.slice(0, 7).join(', ')}\n**Frontend:** ${KB.skills.frontend.join(', ')}\n**QA / Testing:** ${KB.skills.qa.slice(0, 4).join(', ')}\n**Productivity:** ${KB.skills.tools.join(', ')}`,
    },
    {
      id: 'figma',
      patterns: [/\b(figma|adobe xd|xd|illustrator|photoshop|framer|design tool)\b/i],
      respond: () =>
        `Absolutely! Shijnas is proficient in **Figma** as his primary design tool — he uses it for wireframing, UI design, prototyping, and design system creation. He also works with **Adobe XD**, **Photoshop**, **Illustrator**, and **Framer**. ✏️`,
    },
    {
      id: 'frontend',
      patterns: [/\b(react|html|css|javascript|js|frontend|front-end|web dev|web development|code|coding|developer)\b/i],
      respond: () =>
        `Shijnas has solid **frontend development** experience:\n\n• **HTML5, CSS3, JavaScript** — building pixel-perfect, responsive websites\n• Advanced CSS techniques — animations, glassmorphism, custom cursors, dark/light modes\n• DOM manipulation and interactive UI without frameworks\n\nNote: He currently focuses on **vanilla JS/HTML/CSS** and is actively expanding into modern frameworks.`,
    },
    {
      id: 'qa',
      patterns: [/\b(game (test(ing|er)|qa|quality)|qa|test(ing)?|bugs?|tester)\b/i],
      respond: () =>
        `Shijnas has **Game Testing / QA** experience:\n\n• Mobile and PC game testing for UI bugs and gameplay issues\n• Structured bug reporting and test case documentation\n• Regression testing and cross-device verification\n\nThis QA mindset directly informs his approach to UI/UX — he thinks like a user *and* a tester. 🎮`,
    },
    {
      id: 'education',
      patterns: [/\b(education|degree|university|college|study|studied|qualification|academic)\b/i],
      respond: () => {
        const edu = KB.education[0];
        return `Shijnas holds a **${edu.degree}** from **${edu.institution}**, Kerala, India (${edu.period}).\n\n${edu.details}`;
      },
    },
    {
      id: 'certifications',
      patterns: [/\b(certif(icate|ication)|credential|course|training)\b/i],
      respond: () => {
        let res = `Here are Shijnas' certifications and learning milestones:\n\n`;
        KB.certifications.forEach(c => (res += `• **${c.name}** — ${c.issuer} (${c.year})\n`));
        return res.trim();
      },
    },
    {
      id: 'process',
      patterns: [/\b(process|approach|workflow|how (do|does) (you|he) (design|work)|methodology|design process|ux process)\b/i],
      respond: () => {
        let res = `Shijnas follows a structured, user-centered design process:\n\n`;
        KB.process.forEach(p => (res += `**${p.step}. ${p.name}** — ${p.detail}\n\n`));
        return res.trim();
      },
    },
    {
      id: 'hire',
      patterns: [/\b(hire|hiring|work with|collaborate|freelance|available|opportunity|recruit|job|contract|engagement|why (should|hire))\b/i],
      respond: () =>
        `Shijnas is **currently available** for freelance and full-time opportunities! 🚀\n\nHere's why you should work with him:\n\n• **20+ completed projects** across mobile, web, and dashboard design\n• Full-cycle capability — research → wireframe → UI design → prototype → frontend build\n• QA mindset ensures bug-free, polished deliverables\n• Proficient in Figma, Adobe Suite, and modern frontend tools\n• Fast turnaround, strong communication, and client-first approach\n\n*I'm currently available for freelance and full-time opportunities. Feel free to download my resume or contact me directly.*`,
      isHiring: true,
    },
    {
      id: 'contact',
      patterns: [/\b(contact|email|reach|message|get in touch|connect|social|linkedin|instagram|github)\b/i],
      respond: () =>
        `You can reach Shijnas through:\n\n📧 **Email:** [${KB.contact.email}](mailto:${KB.contact.email})\n💼 **LinkedIn:** [Shijnas Yunus](${KB.contact.linkedin})\n📸 **Instagram:** [@shij_nas_07](${KB.contact.instagram})\n💻 **GitHub:** [github.com/shijnas](${KB.contact.github})`,
    },
    {
      id: 'resume',
      patterns: [/\b(resume|cv|download|pdf)\b/i],
      respond: () => ({ type: 'resume', message: `You can download Shijnas' latest resume right here 📄 — it includes his full work history, skills, education, and contact details.` }),
    },
    {
      id: 'services',
      patterns: [/\b(services?|offer|what (do|can) (you|he) (offer|provide)|capabilities)\b/i],
      respond: () => {
        let res = `Shijnas offers the following services:\n\n`;
        KB.services.forEach(s => (res += `• ${s}\n`));
        return res.trim();
      },
    },
    {
      id: 'dashboard',
      patterns: [/\b(dashboard|admin|saas|panel|analytics)\b/i],
      respond: () => `Yes! Dashboard design is one of Shijnas' specialties. He's designed SaaS dashboards for **banking**, **healthcare**, and financial analytics platforms — focusing on data clarity, information hierarchy, and clean visual design. 📊`,
    },
    {
      id: 'mobile',
      patterns: [/\b(mobile|ios|android|app design|application)\b/i],
      respond: () => `Shijnas has extensive experience designing **mobile apps** for both iOS and Android — including food delivery, travel, and lifestyle apps. He designs in Figma with iOS/Android design guidelines in mind and delivers Handoff-ready assets. 📱`,
    },
    {
      id: 'location',
      patterns: [/\b(location|where|based|city|country|region|india)\b/i],
      respond: () => `Shijnas is based in **Kannur, Kerala, India** 🇮🇳 and works remotely with clients worldwide.`,
    },
    {
      id: 'tools_list',
      patterns: [/\b(tools?|software|app(s|lication)?|use|what (tools|software))\b/i],
      respond: () =>
        `Shijnas' toolkit:\n\n**Design:** Figma · Adobe XD · Photoshop · Illustrator · Framer\n**Collaboration:** Miro · Notion · Jira\n**Version Control:** GitHub\n**Frontend:** VS Code · HTML/CSS/JS`,
    },
  ];

  // ============================================================
  // 3. RESPONSE ENGINE
  // ============================================================
  function matchIntent(input) {
    const txt = input.trim().toLowerCase();
    for (const intent of intents) {
      for (const pat of intent.patterns) {
        if (pat.test(txt)) return intent;
      }
    }
    return null;
  }

  function getFallback() {
    return `I don't have that information yet. Feel free to ask Shijnas directly — you can reach him at **[${KB.contact.email}](mailto:${KB.contact.email})** or on **[LinkedIn](${KB.contact.linkedin})**. 🙂`;
  }

  // ============================================================
  // 4. MARKDOWN RENDERER (lightweight)
  // ============================================================
  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p>$1</p>');
  }

  // ============================================================
  // 5. UI BUILDER
  // ============================================================
  function buildUI() {
    // Trigger Button
    const trigger = document.createElement('button');
    trigger.className = 'ezio-trigger';
    trigger.id = 'ezioChatTrigger';
    trigger.setAttribute('aria-label', 'Open Ezio AI Chat');
    trigger.innerHTML = `
      <svg class="icon-chat" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <circle cx="8.5" cy="10.5" r="1" fill="white"/>
        <circle cx="12" cy="10.5" r="1" fill="white"/>
        <circle cx="15.5" cy="10.5" r="1" fill="white"/>
      </svg>
      <svg class="icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>`;

    // Chat Window
    const win = document.createElement('div');
    win.className = 'ezio-window';
    win.id = 'ezioChatWindow';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Ezio AI Portfolio Assistant');
    win.innerHTML = `
      <div class="ezio-header">
        <div class="ezio-avatar">🤖</div>
        <div class="ezio-header-info">
          <p class="ezio-name">Ezio AI · Shijnas' Assistant</p>
          <p class="ezio-status">Online · Knows everything about Shijnas</p>
        </div>
        <button class="ezio-clear-btn" id="ezioClearBtn">Clear</button>
      </div>
      <div class="ezio-messages" id="ezioMessages"></div>
      <div class="ezio-suggestions" id="ezioSuggestions">
        <button class="ezio-chip" data-q="Tell me about Shijnas">About him</button>
        <button class="ezio-chip" data-q="Show me his projects">Projects</button>
        <button class="ezio-chip" data-q="What are his skills?">Skills</button>
        <button class="ezio-chip" data-q="Can I hire him?">Hire?</button>
        <button class="ezio-chip" data-q="Download resume">Resume</button>
      </div>
      <div class="ezio-input-row">
        <textarea class="ezio-input" id="ezioInput" placeholder="Ask me anything about Shijnas…" rows="1"></textarea>
        <button class="ezio-send-btn" id="ezioSendBtn" aria-label="Send message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white"/>
          </svg>
        </button>
      </div>`;

    document.body.appendChild(trigger);
    document.body.appendChild(win);
    return { trigger, win };
  }

  // ============================================================
  // 6. MESSAGE RENDERING
  // ============================================================
  function appendMsg(role, contentOrNode, messagesEl) {
    const msg = document.createElement('div');
    msg.className = `ezio-msg ${role}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'ezio-msg-avatar';
    avatarDiv.textContent = role === 'bot' ? '🤖' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'ezio-bubble';

    if (typeof contentOrNode === 'string') {
      bubble.innerHTML = renderMarkdown(contentOrNode);
    } else {
      bubble.appendChild(contentOrNode);
    }

    msg.appendChild(avatarDiv);
    msg.appendChild(bubble);
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function appendProjectCards(messagesEl) {
    const wrapper = document.createElement('div');
    KB.projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'ezio-project-card';
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="ezio-project-card-body">
          <div class="ezio-project-tag">${p.category}</div>
          <h4>${p.name}</h4>
          <p>${p.description.slice(0, 80)}…</p>
          <a href="${p.link}" class="ezio-project-card-link" onclick="document.getElementById('ezioChatWindow').classList.remove('visible'); document.getElementById('ezioChatTrigger').classList.remove('open');">
            View Project ↗
          </a>
        </div>`;
      wrapper.appendChild(card);
    });
    return wrapper;
  }

  function appendTyping(messagesEl) {
    const msg = document.createElement('div');
    msg.className = 'ezio-msg bot';
    msg.id = 'ezioTypingMsg';
    msg.innerHTML = `<div class="ezio-msg-avatar">🤖</div><div class="ezio-typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  function removeTyping() {
    const t = document.getElementById('ezioTypingMsg');
    if (t) t.remove();
  }

  // ============================================================
  // 7. STREAMING EFFECT
  // ============================================================
  function streamText(text, bubble, onDone) {
    bubble.innerHTML = '';
    const words = text.split(' ');
    let i = 0;
    function nextWord() {
      if (i < words.length) {
        bubble.innerHTML = renderMarkdown(words.slice(0, i + 1).join(' '));
        i++;
        const delay = 18 + Math.random() * 22;
        setTimeout(nextWord, delay);
      } else {
        if (onDone) onDone();
      }
    }
    nextWord();
  }

  // ============================================================
  // 8. CHAT CONTROLLER
  // ============================================================
  function initChat() {
    const { trigger, win } = buildUI();
    const messagesEl = document.getElementById('ezioMessages');
    const inputEl = document.getElementById('ezioInput');
    const sendBtn = document.getElementById('ezioSendBtn');
    const clearBtn = document.getElementById('ezioClearBtn');
    const chips = document.querySelectorAll('.ezio-chip');

    let isOpen = false;
    let isTyping = false;

    // --- Welcome message ---
    setTimeout(() => {
      appendMsg('bot',
        `Hey! I'm **Ezio** 👋 — Shijnas' personal AI assistant.\n\nI know everything about his work, skills, projects, and how to contact him. What would you like to know?`,
        messagesEl
      );
    }, 400);

    // --- Toggle window ---
    function toggleChat() {
      isOpen = !isOpen;
      win.classList.toggle('visible', isOpen);
      trigger.classList.toggle('open', isOpen);
      if (isOpen) inputEl.focus();
    }

    trigger.addEventListener('click', toggleChat);

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (isOpen && !win.contains(e.target) && !trigger.contains(e.target)) {
        isOpen = false;
        win.classList.remove('visible');
        trigger.classList.remove('open');
      }
    });

    // --- Send message ---
    function sendMessage(text) {
      if (!text.trim() || isTyping) return;
      inputEl.value = '';
      inputEl.style.height = 'auto';

      // Show user bubble
      appendMsg('user', text, messagesEl);

      // Show typing indicator
      const typingMsg = appendTyping(messagesEl);
      isTyping = true;

      // Simulate network delay
      const thinkDelay = 600 + Math.random() * 600;
      setTimeout(() => {
        typingMsg.remove();

        const intent = matchIntent(text);

        if (!intent) {
          const bubble = appendMsg('bot', '', messagesEl);
          streamText(getFallback(), bubble, () => { isTyping = false; });
          return;
        }

        const result = intent.respond();

        if (typeof result === 'object' && result.type === 'projects') {
          // Text + cards
          const bubble = appendMsg('bot', result.message, messagesEl);
          const cardWrapper = appendProjectCards(messagesEl);
          const cardMsg = document.createElement('div');
          cardMsg.className = 'ezio-msg bot';
          const cardAvatar = document.createElement('div');
          cardAvatar.className = 'ezio-msg-avatar';
          cardAvatar.textContent = '🤖';
          cardMsg.appendChild(cardAvatar);
          cardMsg.appendChild(cardWrapper);
          messagesEl.appendChild(cardMsg);
          messagesEl.scrollTop = messagesEl.scrollHeight;
          isTyping = false;

          if (intent.isHiring) appendHiringFooter(messagesEl);

        } else if (typeof result === 'object' && result.type === 'resume') {
          // Resume download
          const bubble = appendMsg('bot', result.message, messagesEl);
          const dlBtn = document.createElement('a');
          dlBtn.href = KB.contact.resume;
          dlBtn.download = 'Shijnas_Yunus_Resume.pdf';
          dlBtn.className = 'ezio-project-card-link';
          dlBtn.style.display = 'inline-flex';
          dlBtn.style.alignItems = 'center';
          dlBtn.style.gap = '6px';
          dlBtn.style.marginTop = '10px';
          dlBtn.style.padding = '8px 16px';
          dlBtn.style.background = 'linear-gradient(135deg, #a855f7, #7c3aed)';
          dlBtn.style.color = '#fff';
          dlBtn.style.borderRadius = '10px';
          dlBtn.style.textDecoration = 'none';
          dlBtn.style.fontSize = '13px';
          dlBtn.style.fontWeight = '600';
          dlBtn.innerHTML = `📄 Download Resume`;
          bubble.appendChild(document.createElement('br'));
          bubble.appendChild(dlBtn);
          isTyping = false;

        } else if (typeof result === 'string') {
          const bubble = appendMsg('bot', '', messagesEl);
          streamText(result, bubble, () => {
            isTyping = false;
            if (intent.isHiring) appendHiringFooter(messagesEl);
          });
        }
      }, thinkDelay);
    }

    function appendHiringFooter(messagesEl) {
      setTimeout(() => {
        appendMsg('bot', `*I'm currently available for freelance and full-time opportunities. Feel free to [download my resume](${KB.contact.resume}) or [contact me directly](mailto:${KB.contact.email}).*`, messagesEl);
      }, 400);
    }

    // --- Events ---
    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputEl.value);
      }
    });

    // Auto resize textarea
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    });

    // Chips
    chips.forEach(chip => {
      chip.addEventListener('click', () => sendMessage(chip.dataset.q));
    });

    // Clear history
    clearBtn.addEventListener('click', () => {
      messagesEl.innerHTML = '';
      appendMsg('bot', `Chat cleared! I'm **Ezio**, ready to help. What would you like to know about Shijnas? 😊`, messagesEl);
    });
  }

  // ============================================================
  // 9. INIT
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChat);
  } else {
    initChat();
  }

})();
