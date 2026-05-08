"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ImpressiveScrollIndicator() {
  const { scrollYProgress } = useScroll();
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[3px] bg-black/5 z-[10000] pointer-events-none">
      <motion.div
        className="w-full bg-gradient-to-b from-[#1a1a2c] via-[#d52245] to-[#1a1a2c] origin-top"
        style={{ 
          scaleY, 
          height: "100%",
          boxShadow: "0 0 10px rgba(213, 34, 69, 0.4)"
        }}
      />
    </div>
  );
}
