# Entry: Visual Identity & UI Design System

## 🎨 Premium Brand Palette
Entry employs a "High-Contrast Luxury" design language, carefully curated to project authority, speed, and reliability.

*   **Primary Navy (`#1a1a2c`):** The foundation of the platform. Used for deep-backgrounds and primary navigation to create a sense of stability.
*   **Accent Red (`#d52245`):** A high-energy, premium red used strategically for **Call-to-Actions (CTAs)**, stock alerts, and brand highlights. It creates a striking contrast against the Navy background.
*   **Neutral Slate Spectrum:** Utilizing a range from `slate-50` (soft whites) to `slate-900` (deep charcoals) to provide subtle hierarchy in typography and surface layers.

## 📐 Advanced Design Patterns
*   **Glassmorphism (Layered Depth):** We utilize `backdrop-blur-xl` combined with semi-transparent background overlays (`bg-white/10` or `bg-navy/80`). This creates a modern "frosted glass" effect that adds depth without cluttering the UI.
*   **The "Entry Card" System:** All data is encapsulated in specialized cards featuring a distinct `rounded-[2rem]` radius and subtle `shadow-2xl`. This softens the enterprise nature of the data, making it more approachable.
*   **High-Density Enterprise Tables:** For the Admin and Seller portals, we use condensed layouts that maximize "Data-per-Pixel," allowing professionals to scan hundreds of inventory items or orders without excessive scrolling.

## 🎬 Motion & Cinematic Transitions
*   **Scroll Reveal Engine:** Components are orchestrated to fade-in and slide-up using Framer Motion or CSS Intersection Observers, ensuring the user feels the interface is "assembling" itself as they scroll.
*   **Micro-Interactions:** 
    *   **Scale Feedback:** Buttons scale to `0.98` on click to simulate physical tactile feedback.
    *   **Rotation:** UI icons (like settings or arrows) rotate slightly on hover to indicate interactivity.
    *   **Pulse Indicators:** Real-time elements (like "Live" orders) feature a soft pulse animation.
*   **NextTopLoader:** A custom-branded loading bar (`#d52245`) provides immediate visual confirmation of route changes, eliminating the "dead air" during navigation.

## 🔡 Typography: The Geist Identity
*   **Font Family:** We exclusively use **Geist**, a typeface designed for developers and designers who value precision.
*   **Hierarchy:**
    *   **Hero Headings:** Set to `font-black` (900 weight) with tight tracking to project strength.
    *   **Body Copy:** Optimized at `font-normal` (400 weight) with increased line-height for maximum readability during long browsing sessions.

---
