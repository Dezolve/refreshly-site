(() => {
  const yearNodes = document.querySelectorAll(".js-year");
  const year = new Date().getFullYear();

  yearNodes.forEach((node) => {
    node.textContent = String(year);
  });

  const revealNodes = document.querySelectorAll(".reveal");
  const showNode = (node) => {
    node.classList.add("is-visible");
    node.style.opacity = "1";
    node.style.transform = "translateY(0)";
  };

  if (!revealNodes.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
