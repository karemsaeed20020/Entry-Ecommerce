// lib/compareStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/lib/types";

const MAX_COMPARE = 4;

interface CompareState {
  compareItems: Product[];
  isDrawerOpen: boolean;
  addToCompare: (product: Product) => boolean; // returns false if already full
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  toggleDrawer: (open?: boolean) => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareItems: [],
      isDrawerOpen: false,

      addToCompare: (product) => {
        const state = get();
        if (state.compareItems.length >= MAX_COMPARE) return false;
        if (state.compareItems.some((p) => p._id === product._id)) return false;
        set({ compareItems: [...state.compareItems, product] });
        return true;
      },

      removeFromCompare: (productId) =>
        set((state) => ({
          compareItems: state.compareItems.filter((p) => p._id !== productId),
        })),

      clearCompare: () => set({ compareItems: [] }),

      isInCompare: (productId) =>
        get().compareItems.some((p) => p._id === productId),

      toggleDrawer: (open) =>
        set((state) => ({
          isDrawerOpen: open !== undefined ? open : !state.isDrawerOpen,
        })),
    }),
    {
      name: "compare-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);