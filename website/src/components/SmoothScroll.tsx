"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      autoResize: true,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
