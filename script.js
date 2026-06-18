/* =============================================
   VARUN BADIREDDI — PORTFOLIO v2
   script.js
   ============================================= */

/* ── NAVBAR SCROLL ─────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

/* ── HAMBURGER ──────────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
  }
});

/* ── ACTIVE NAV HIGHLIGHT ───────────────────── */
const sections  = Array.from(document.querySelectorAll('section[id]'));
const navAnchors = document.querySelectorAll('.nav-links a');

function updateNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navAnchors.forEach(a => {
    const active = a.getAttribute('href') === `#${current}`;
    a.classList.toggle('active', active);
  });
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ── SCROLL-TRIGGERED FADE-INS ──────────────── */
const fadeEls = document.querySelectorAll(
  '.tl-item, .project-featured, .proj-card, .sk-group, ' +
  '.about-body, .about-card, .about-headline, .cl-item, .contact-form, ' +
  '.sec-title, .sec-desc, .sec-label'
);

fadeEls.forEach(el => el.classList.add('fade-in'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => io.observe(el));

/* ── TERMINAL TYPEWRITER ───────────────────── */
const termBody = document.getElementById('terminalBody');

const termLines = [
  { kind: 'prompt', text: 'whoami' },
  { kind: 'out',    text: 'Satya Sai Varun Badireddi', hl: true },
  { kind: 'prompt', text: 'cat role.txt' },
  { kind: 'out',    text: 'Backend & Full-Stack Engineer' },
  { kind: 'prompt', text: 'ls skills/ | head -6' },
  { kind: 'out',    text: 'Java  SpringBoot  TypeScript' },
  { kind: 'out',    text: 'Kafka  Redis  Docker  K8s' },
  { kind: 'prompt', text: 'git log --oneline -3' },
  { kind: 'out',    text: 'a3f9c1  Anime Rec Platform', hl: true },
  { kind: 'out',    text: 'b72de4  Graph Analytics Pipeline', hl: true },
  { kind: 'out',    text: 'c18fa0  Depression Risk ML Model', hl: true },
  { kind: 'prompt', text: 'echo $AVAILABILITY' },
  { kind: 'out',    text: '● Open to roles · June 2026', hl: true },
];

const DELAYS = { prompt: 650, out: 280 };
let idx = 0;
let cursorNode = null;

function removeCursor() {
  if (cursorNode && cursorNode.parentNode) cursorNode.remove();
  cursorNode = null;
}

function addCursor() {
  removeCursor();
  cursorNode = document.createElement('span');
  cursorNode.className = 't-cursor';
  termBody.appendChild(cursorNode);
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function nextLine() {
  if (idx >= termLines.length) { addCursor(); return; }
  const l = termLines[idx++];

  const div = document.createElement('span');
  div.className = 't-line';

  if (l.kind === 'prompt') {
    div.innerHTML = `<span class="t-prompt">❯ </span><span class="t-cmd">${esc(l.text)}</span>`;
  } else {
    const cls = l.hl ? 't-hl' : '';
    div.innerHTML = `<span class="t-out ${cls}">${esc(l.text)}</span>`;
  }

  termBody.appendChild(div);
  termBody.scrollTop = termBody.scrollHeight;

  setTimeout(nextLine, DELAYS[l.kind]);
}

setTimeout(nextLine, 800);

/* ── CONTACT FORM — EmailJS ────────────────*/
const EMAILJS_SERVICE_ID  = 'service_sjdaeeo';
const EMAILJS_TEMPLATE_ID = 'template_7fz71f3';

function handleFormSubmit(e) {
  e.preventDefault();

  const form   = e.target;
  const status = document.getElementById('formStatus');
  const btn    = form.querySelector('.cf-submit');

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const subject = form.subject ? form.subject.value.trim() : '';
  const message = form.message.value.trim();

  /* ── Validation ── */
  if (!name || !email || !message) {
    showStatus('⚠ Please fill in your name, email, and message.', 'error', status);
    return;
  }
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    showStatus('⚠ Please enter a valid email address.', 'error', status);
    return;
  }

  /* ── Sending state ── */
  btn.disabled = true;
  btn.innerHTML = `
    <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
    Sending…`;
  showStatus('', '', status);

  /* ── EmailJS send ── */
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name:  name,
    from_email: email,
    subject:    subject || 'Portfolio Contact',
    message:    message,
    reply_to:   email,
  })
  .then(() => {
    showStatus('✓ Message sent! I\'ll get back to you soon.', 'success', status);
    form.reset();
  })
  .catch((err) => {
    console.error('EmailJS error:', err);
    showStatus('✗ Something went wrong. Please email me directly at sbadired@asu.edu', 'error', status);
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = `Send Message
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12,5 19,12 12,19"/>
      </svg>`;
  });
}

function showStatus(msg, type, el) {
  el.textContent = msg;
  el.className   = type ? `cf-status ${type}` : 'cf-status';
}

/* ── SUBTLE MOUSE GLOW (desktop only) ──────── */
if (window.matchMedia('(min-width: 900px) and (hover: hover)').matches) {
  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position:       'fixed',
    width:          '500px',
    height:         '500px',
    borderRadius:   '50%',
    background:     'radial-gradient(circle, rgba(108,92,231,0.04) 0%, transparent 65%)',
    pointerEvents:  'none',
    transform:      'translate(-50%,-50%)',
    zIndex:         '0',
    top:            '-999px',
    left:           '-999px',
    transition:     'top 0.08s linear, left 0.08s linear',
  });
  document.body.appendChild(glow);

  document.addEventListener('mousemove', ({ clientX, clientY }) => {
    glow.style.left = clientX + 'px';
    glow.style.top  = clientY + 'px';
  }, { passive: true });
}

/* ── CONSOLE EASTER EGG ─────────────────────── */
console.log(
  '%c👋 Hey curious dev!',
  'color:#7c6fff;font-family:monospace;font-size:15px;font-weight:bold;'
);
console.log(
  '%cBuilt with HTML · CSS · Vanilla JS\nLet\'s connect → sbadired@asu.edu',
  'color:#9898b8;font-family:monospace;font-size:12px;'
);


const SOCIAL_LINKS = {
  github: "https://github.com/badireddisatyasaivarun",
  linkedin: "https://www.linkedin.com/in/badireddi-satya-sai-varun-a59921169/",
  substack: "https://substack.com/@sbadired"
};

document.querySelectorAll("[data-social]").forEach(link => {
  const key = link.dataset.social;

  if (SOCIAL_LINKS[key]) {
    link.href = SOCIAL_LINKS[key];
  }
});