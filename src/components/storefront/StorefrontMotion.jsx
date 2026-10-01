"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const REVEAL_SELECTOR = "main section, .section-t-space, .section-b-space, .container-fluid > .row";

const StorefrontMotion = ({ children }) => {
  const pathname = usePathname();
  const rootRef = useRef(null);
  const [routeReady, setRouteReady] = useState(true);

  useEffect(() => {
    setRouteReady(false);
    const frame = window.requestAnimationFrame(() => setRouteReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return undefined;

    const elements = Array.from(root.querySelectorAll(REVEAL_SELECTOR));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("nk-in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.06 }
    );

    elements.forEach((element, index) => {
      if (element.closest(".modal, .offcanvas")) return;
      element.classList.add("nk-scroll-reveal");
      element.style.setProperty("--nk-reveal-delay", `${Math.min(index % 4, 3) * 35}ms`);
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div ref={rootRef} className={`nk-storefront-motion ${routeReady ? "nk-route-ready" : ""}`}>
      {children}
    </div>
  );
};

export default StorefrontMotion;
