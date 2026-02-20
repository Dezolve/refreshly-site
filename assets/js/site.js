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

  const autoPlayVideos = document.querySelectorAll("video[data-autoplay-inview]");
  if (autoPlayVideos.length) {
    const minVisibleRatio = 0.35;

    autoPlayVideos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.playsInline = true;
      video.autoplay = true;
      video.setAttribute("autoplay", "");
    });

    const playWhenPossible = (video) => {
      if (video.ended) {
        video.currentTime = 0;
      }
      const playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(() => {});
      }
    };

    const pauseIfPlaying = (video) => {
      if (!video.paused) {
        video.pause();
      }
    };

    const visibleEnough = (element, minVisibleRatio) => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return false;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, viewportHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      return visibleHeight / rect.height >= minVisibleRatio;
    };

    const syncVideoPlayback = (video) => {
      if (visibleEnough(video, minVisibleRatio)) {
        playWhenPossible(video);
        return;
      }

      pauseIfPlaying(video);
    };

    const syncAllVideoPlayback = () => {
      autoPlayVideos.forEach((video) => syncVideoPlayback(video));
    };

    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!(entry.target instanceof HTMLVideoElement)) {
              return;
            }

            const video = entry.target;
            if (entry.isIntersecting && entry.intersectionRatio >= minVisibleRatio) {
              playWhenPossible(video);
              return;
            }

            pauseIfPlaying(video);
          });
        },
        {
          threshold: [0, 0.2, 0.35, 0.6, 0.85],
        }
      );

      autoPlayVideos.forEach((video) => videoObserver.observe(video));
    } else {
      let framePending = false;
      const onViewportChange = () => {
        if (framePending) {
          return;
        }
        framePending = true;
        window.requestAnimationFrame(() => {
          syncAllVideoPlayback();
          framePending = false;
        });
      };

      window.addEventListener("scroll", onViewportChange, { passive: true });
      window.addEventListener("resize", onViewportChange);
      onViewportChange();
    }

    autoPlayVideos.forEach((video) => {
      video.addEventListener("loadeddata", () => {
        syncVideoPlayback(video);
      });

      video.addEventListener("canplay", () => {
        syncVideoPlayback(video);
      });
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        autoPlayVideos.forEach((video) => pauseIfPlaying(video));
        return;
      }

      syncAllVideoPlayback();
    });

    window.addEventListener("pageshow", () => {
      syncAllVideoPlayback();
    });

    window.requestAnimationFrame(() => {
      syncAllVideoPlayback();
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
