"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export const RightScrollIndicator = () => {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 h-64 w-1 bg-gray-200 rounded-full z-[10000] hidden md:block">
      <motion.div
        className="w-full bg-accent rounded-full origin-top"
        style={{ scaleY, height: "100%" }}
      />
    </div>
  );
};
