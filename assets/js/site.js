(() => {
  const yearNodes = document.querySelectorAll(".js-year");
  const year = new Date().getFullYear();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  yearNodes.forEach((node) => {
    node.textContent = String(year);
  });

  const siteHeader = document.querySelector(".site-header");
  const navShell = document.querySelector(".nav-shell");
  const getHeaderOffset = () => {
    if (!siteHeader || !navShell) {
      return 0;
    }

    const headerStyle = window.getComputedStyle(siteHeader);
    if (headerStyle.position !== "sticky" && headerStyle.position !== "fixed") {
      return 0;
    }

    const navBox = navShell.getBoundingClientRect();
    const landingGap = 8;
    return Math.max(navBox.bottom + landingGap, 0);
  };

  const getDocumentTop = (node) => {
    let top = 0;
    let current = node;

    while (current) {
      top += current.offsetTop;
      current = current.offsetParent;
    }

    return top;
  };

  const scrollToAnchor = (hash, behavior) => {
    if (!hash || hash === "#") {
      return;
    }

    const anchorId = hash.startsWith("#") ? hash.slice(1) : hash;
    const target = document.getElementById(anchorId);
    if (!target) {
      return;
    }

    const offset = getHeaderOffset();
    const targetTop = getDocumentTop(target) - offset;
    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior,
    });
  };

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const link = event.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }

    const hash = link.getAttribute("href");
    if (!hash || hash === "#") {
      return;
    }

    const targetId = hash.slice(1);
    if (!document.getElementById(targetId)) {
      return;
    }

    event.preventDefault();
    if (window.location.hash !== hash) {
      history.pushState(null, "", hash);
    }
    scrollToAnchor(hash, prefersReducedMotion ? "auto" : "smooth");
  });

  window.addEventListener("hashchange", () => {
    scrollToAnchor(window.location.hash, prefersReducedMotion ? "auto" : "smooth");
  });

  if (window.location.hash) {
    window.requestAnimationFrame(() => {
      scrollToAnchor(window.location.hash, "auto");
    });
  }

  const revealNodes = document.querySelectorAll(".reveal");
  const showNode = (node) => {
    node.classList.add("is-visible");
    node.style.opacity = "1";
    node.style.transform = "translateY(0)";
  };

  if (!revealNodes.length) {
    return;
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach(showNode);
    return;
  }

  revealNodes.forEach((node) => {
    node.style.opacity = "0";
    node.style.transform = "translateY(20px)";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          showNode(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
})();
