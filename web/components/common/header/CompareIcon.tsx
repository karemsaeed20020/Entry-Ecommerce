// components/compare/CompareIcon.tsx
"use client";

import { Shuffle } from "lucide-react";
import Link from "next/link";
import { useCompareStore } from "@/lib/compareStore";
import { useIsHydrated } from "@/hooks/useHydration";

const CompareIcon = () => {
  const isHydrated = useIsHydrated();
  const { compareItems } = useCompareStore();
  const compareCount = compareItems.length;

  if (!isHydrated) {
    return (
      <div className="relative group hover:text-accent hoverEffect">
        <Shuffle size={24} />
        <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
          0
        </span>
      </div>
    );
  }

  return (
    <Link
      href="/compare"
      className="relative group hover:text-accent hoverEffect"
    >
      <Shuffle size={24} />
      {compareCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
          {compareCount}
        </span>
      )}
    </Link>
  );
};

export default CompareIcon;