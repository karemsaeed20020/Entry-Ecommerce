"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useRef, useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [velocity, setVelocity] = useState(0);

  // Spring for smooth skew animation
  const skewSpring = useSpring(0, {
    stiffness: 150,
    damping: 20,
  });

  // Transform velocity to skew degree (limit to 5 degrees)
  const skew = useTransform(skewSpring, [-1000, 1000], [-5, 5]);

  useLenis((lenis) => {
    // Update velocity on scroll
    skewSpring.set(lenis.velocity);
  });

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <motion.div
        ref={contentRef}
        style={{ skewY: skew }}
        className="origin-center transition-transform duration-100"
      >
        {children}
      </motion.div>
    </ReactLenis>
  );
}
