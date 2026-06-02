(function () {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  const header = document.querySelector("[data-header]");
  const toast = document.querySelector("[data-toast]");

  function closeMenu() {
    if (!navToggle || !navLinks) return;
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
    document.body.classList.remove("menu-open");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      document.body.classList.toggle("menu-open", isOpen);
    });

    navLinks.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
  }

  const sectionLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-45% 0px -48% 0px", threshold: 0.01 }
    );
    sections.forEach((section) => observer.observe(section));
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    const label = button.querySelector("[data-copy-label]");
    const email = button.getAttribute("data-copy-email");

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
        if (label) label.textContent = "Copied";
        showToast("Email copied to clipboard");
        window.setTimeout(() => {
          if (label) label.textContent = "Copy Email";
        }, 1600);
      } catch (error) {
        window.location.href = `mailto:${email}`;
      }
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  const canvas = document.getElementById("system-canvas");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palette = {
    lines: "rgba(190, 210, 226, 0.18)",
    text: "rgba(255, 255, 255, 0.8)",
    node: "rgba(110, 231, 216, 0.92)",
    nodeAlt: "rgba(255, 184, 107, 0.92)",
    nodeThird: "rgba(129, 140, 248, 0.92)"
  };

  const nodes = [
    { label: "Angular", x: 0.68, y: 0.19, color: palette.nodeAlt },
    { label: "NestJS", x: 0.82, y: 0.28, color: palette.node },
    { label: "Spring Boot", x: 0.61, y: 0.42, color: palette.nodeThird },
    { label: "Kafka", x: 0.78, y: 0.52, color: palette.nodeAlt },
    { label: "Redis", x: 0.55, y: 0.62, color: palette.node },
    { label: "AWS SQS", x: 0.9, y: 0.68, color: palette.nodeThird },
    { label: "Kubernetes", x: 0.7, y: 0.79, color: palette.node },
    { label: "PostgreSQL", x: 0.48, y: 0.32, color: palette.nodeAlt },
    { label: "CI/CD", x: 0.88, y: 0.12, color: palette.nodeThird }
  ];

  const edges = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 6],
    [5, 6],
    [2, 7],
    [8, 1],
    [8, 6]
  ];

  const pointer = { x: 0, y: 0 };
  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let frame = 0;

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function pointFor(node, index, time) {
    const sway = prefersReducedMotion ? 0 : Math.sin(time / 1100 + index) * 8;
    const drift = prefersReducedMotion ? 0 : Math.cos(time / 1400 + index * 0.6) * 6;
    return {
      x: node.x * width + pointer.x * (index % 2 ? 10 : -8) + drift,
      y: node.y * height + pointer.y * (index % 2 ? -8 : 10) + sway
    };
  }

  function drawGrid(time) {
    context.save();
    context.strokeStyle = "rgba(255, 255, 255, 0.06)";
    context.lineWidth = 1;
    const gap = 56;
    const offset = prefersReducedMotion ? 0 : (time / 80) % gap;

    for (let x = width * 0.42 + offset; x < width + gap; x += gap) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x - width * 0.26, height);
      context.stroke();
    }

    for (let y = -gap + offset; y < height + gap; y += gap) {
      context.beginPath();
      context.moveTo(width * 0.38, y);
      context.lineTo(width, y + height * 0.16);
      context.stroke();
    }

    context.restore();
  }

  function render(time) {
    frame = time || 0;
    context.clearRect(0, 0, width, height);
    drawGrid(frame);

    const points = nodes.map((node, index) => pointFor(node, index, frame));

    edges.forEach(([from, to]) => {
      const a = points[from];
      const b = points[to];
      const gradient = context.createLinearGradient(a.x, a.y, b.x, b.y);
      gradient.addColorStop(0, "rgba(110, 231, 216, 0.22)");
      gradient.addColorStop(1, "rgba(129, 140, 248, 0.16)");
      context.strokeStyle = gradient;
      context.lineWidth = 1.4;
      context.beginPath();
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    });

    points.forEach((point, index) => {
      const node = nodes[index];
      const pulse = prefersReducedMotion ? 0 : Math.sin(frame / 520 + index) * 2;
      context.beginPath();
      context.fillStyle = "rgba(255, 255, 255, 0.08)";
      context.arc(point.x, point.y, 31 + pulse, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.fillStyle = node.color;
      context.arc(point.x, point.y, 7, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = palette.text;
      context.font = "600 13px Inter, system-ui, sans-serif";
      context.fillText(node.label, point.x + 14, point.y + 5);
    });

    if (!prefersReducedMotion) requestAnimationFrame(render);
  }

  resizeCanvas();
  render(0);

  window.addEventListener("resize", () => {
    resizeCanvas();
    render(frame);
  }, { passive: true });

  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
})();
