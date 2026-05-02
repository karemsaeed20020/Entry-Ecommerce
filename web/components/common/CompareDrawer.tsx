"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, GitCompareArrows, ArrowRight, Plus } from "lucide-react";
import { useCompareStore } from "@/lib/compareStore";
import { useIsHydrated } from "@/hooks/useHydration";
import { Button } from "@/components/ui/button";

const SLOTS = [0, 1, 2, 3];

const CompareDrawer = () => {
  const isHydrated = useIsHydrated();
  const router = useRouter();
  const { compareItems, removeFromCompare, clearCompare, isDrawerOpen, toggleDrawer } =
    useCompareStore();

  if (!isHydrated || compareItems.length === 0) return null;

  return (
    <>
      {/* Overlay (subtle) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
          onClick={() => toggleDrawer(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-y-0" : "translate-y-[calc(100%-52px)]"
        }`}
      >
        {/* Toggle tab */}
        <button
          onClick={() => toggleDrawer()}
          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black text-white text-xs font-semibold px-4 py-2 rounded-t-xl shadow-lg hover:bg-gray-900 transition-colors"
        >
          <GitCompareArrows className="w-3.5 h-3.5" />
          Compare ({compareItems.length}/4)
          <span className={`transition-transform duration-300 ${isDrawerOpen ? "rotate-180" : ""}`}>▲</span>
        </button>

        {/* Panel */}
        <div className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-2xl">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              {/* Product slots */}
              <div className="flex-1 grid grid-cols-4 gap-3">
                {SLOTS.map((i) => {
                  const product = compareItems[i];
                  return (
                    <div
                      key={i}
                      className={`relative flex items-center gap-2 rounded-xl border ${
                        product
                          ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2"
                          : "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-2"
                      }`}
                    >
                      {product ? (
                        <>
                          {/* Remove btn */}
                          <button
                            onClick={() => removeFromCompare(product._id)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors z-10"
                            aria-label="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {/* Image */}
                          <div className="w-10 h-10 relative flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-100">
                            <Image
                              src={product.images?.[0] || product.image || ""}
                              alt={product.name}
                              fill
                              className="object-contain p-0.5"
                              sizes="40px"
                            />
                          </div>
                          {/* Name + price */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
                              {product.name}
                            </p>
                            <p className="text-xs font-bold text-blue-600 mt-0.5">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs w-full justify-center">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add product</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button
                  onClick={() => {
                    toggleDrawer(false);
                    router.push("/compare");
                  }}
                  disabled={compareItems.length < 2}
                  className="bg-black hover:bg-gray-800 text-white text-xs rounded-lg px-4 h-9 gap-1.5"
                >
                  Compare
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
                <button
                  onClick={clearCompare}
                  className="text-xs text-red-500 hover:text-red-600 font-medium text-center transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompareDrawer;