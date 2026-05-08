"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

interface ParallaxTextProps {
  children: string;
  baseVelocity?: number;
}

export function ParallaxText({ children, baseVelocity = 100 }: ParallaxTextProps) {
  const { scrollYProgress } = useScroll();
  
  // Use spring for smoother parallax
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const x = useTransform(smoothProgress, [0, 1], [0, baseVelocity]);

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap py-10 pointer-events-none select-none">
      <motion.div style={{ x }} className="flex flex-nowrap gap-10">
        <span className="text-6xl md:text-9xl font-black uppercase tracking-tighter block text-primary/5">
          {children}
        </span>
        <span className="text-6xl md:text-9xl font-black uppercase tracking-tighter block text-primary/5">
          {children}
        </span>
        <span className="text-6xl md:text-9xl font-black uppercase tracking-tighter block text-primary/5">
          {children}
        </span>
        <span className="text-6xl md:text-9xl font-black uppercase tracking-tighter block text-primary/5">
          {children}
        </span>
      </motion.div>
    </div>
  );
}
