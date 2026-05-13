# Entry: Customer Storefront & Seller Hub (Web)

This is the primary user-facing application for the **Entry E-commerce Platform**, serving both as a cinematic storefront for customers and a high-performance dashboard for independent sellers.

## 🚀 Key Features

### 🛍️ Cinematic Storefront
- **Next.js 15 Power:** Optimized for performance, SEO, and sub-second page loads using the App Router.
- **Advanced Product Discovery:** Multi-dimensional filtering (category, brand, rating, price) with real-time search.
- **Premium UX:** High-contrast Navy & Red design system with smooth animations (Framer Motion).
- **Checkout Logistics:** Secure, multi-step checkout integrated with Stripe and SSLCommerz.

### 🏢 Seller Dashboard
- **Autonomous Management:** Self-service registration and store profile customization.
- **Performance Analytics:** Real-time tracking of revenue, sales velocity, and inventory health.
- **Inventory Manifest:** Professional table interface for managing product listings with file-based image uploads.
- **Order Registry:** Dedicated tracking for marketplace fulfillment.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS & Shadcn UI
- **State Management:** Zustand
- **Data Fetching:** SWR & Axios
- **Animations:** Framer Motion & Lucide Icons

## 🔐 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment Setup:**
   Copy `.env.example` to `.env` and configure your API URLs and public keys.
3. **Run development server:**
   ```bash
   npm run dev
   ```
   Access the storefront at `http://localhost:3000` and the seller hub at `http://localhost:3000/seller`.

---
