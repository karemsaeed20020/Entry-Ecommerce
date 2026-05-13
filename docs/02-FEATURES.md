# Entry: Comprehensive Features Manifest (Technical Deep-Dive)

## 🛍️ 1. Customer Storefront (High-Conversion Web App)
*   **Cinematic UI/UX:** Implemented with **Next.js 15** and **React 19**, featuring a high-contrast Navy/Red palette, strategic **Glassmorphism** (backdrop-blur), and scroll-reveal motion.
*   **Multi-Dimensional Filtering:** A sophisticated sidebar engine allowing users to cross-reference products by Categories, Brands, Price Range (Dynamic Sliders), and Customer Ratings.
*   **Instant Search Architecture:** High-performance search controller providing sub-second previews and categorized results as the user types.
*   **Persistence Engine:** LocalStorage-synchronized Cart and Wishlist systems ensuring the shopping state remains intact across sessions and page reloads.
*   **Hybrid Payment Gateway:** Dual-integration with **Stripe** (International) and **SSLCommerz** (Local) for global scalability and secure multi-currency transactions.

## 🏢 2. Seller Dashboard (Autonomous Business Suite)
*   **Automated Vendor Onboarding:** A self-service portal where sellers can register, verify their identities, and manage store profiles without admin intervention.
*   **Real-Time Analytics Suite:** Interactive widgets powered by backend aggregation pipelines showing **Sales Velocity**, **Total Revenue**, and **Stock Health** (Low-stock alerts).
*   **High-Density Inventory Manifest:** A professional-grade table interface designed for speed, supporting bulk product uploads, SKU tracking, and instant status toggles.
*   **Fulfillment Registry:** A dedicated module for tracking order lifecycles from "Pending" to "Delivered," including per-order earning breakdowns and performance metrics.

## 📊 3. Admin Command Center (Enterprise Governance)
*   **Vendor Quality Control:** Robust workflows for reviewing and approving/rejecting seller applications and product listings to maintain marketplace integrity.
*   **Purchase & Procurement Engine:** A complex logistics system managing the full procurement lifecycle:
    *   **Requisition:** Initial request for goods.
    *   **Approval:** Multi-level authorization for purchase orders.
    *   **Receiving Reports:** Final verification upon goods arrival.
*   **Smart Synchronization:** Upon receiving a shipment, the system automatically:
    1.  Increments product stock levels.
    2.  Updates the `purchasePrice`.
    3.  Recalculates the `sellingPrice` based on pre-defined `profitMargin`.
*   **Automation & Tracking:** Integrated **1D Barcode generation** logic and QR Code verification for physical warehouse management.

## 🔒 4. Enterprise Backend (API Infrastructure)
*   **Secure JWT Ecosystem:** Stateless authentication utilizing short-lived access tokens and secure, HTTP-only refresh tokens with a dedicated refresh-queue to prevent session hijacking.
*   **Advanced RBAC (Role-Based Access Control):** Granular middleware protecting every endpoint. The system enforces specialized access for:
    *   **Admins:** Full system control.
    *   **Sellers:** Access to their own store data.
    *   **Employee Specialized Roles:** Packer, Deliveryman, Accounts, and Call Center agents, each with restricted UI views.
*   **Optimized Data Pipeline:** Utilizing **Mongoose Aggregation Pipelines** for real-time statistical reporting and **Cloudinary** for automated on-the-fly image optimization and CDN delivery.
*   **Robust Error Handling:** Global middleware providing structured JSON error responses with detailed logging for development and clean feedback for production.

---
