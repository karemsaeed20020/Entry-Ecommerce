# Entry: System Architecture & Technical Design

## 🏗️ Monorepo Strategy (Turborepo)
Entry is architected as a high-performance monorepo managed by **Turborepo**. This structure facilitates a unified development experience while maintaining strict separation of concerns.

### **Service Breakdown:**
*   **`/web` (Next.js 15 + React 19):** A unified frontend serving both the high-conversion Customer Storefront and the Seller Portal. It utilizes the App Router for optimized server-side rendering and layouts.
*   **`/admin` (Vite + React 19):** A decoupled, high-speed administrative dashboard built for marketplace governance.
*   **`/api` (Node.js + Express):** The central business logic layer, serving as a RESTful microservice for all applications.
*   **`Shared Types:`** All modules consume a central TypeScript definition layer, ensuring total type safety across the network boundary.

## 🔒 Security & Identity Architecture
*   **Stateless Auth Flow:** Implements a robust JWT ecosystem. Access tokens are kept short-lived (15m) to minimize risk, while **Refresh Tokens** are stored in `HttpOnly`, `SameSite=Strict` cookies.
*   **Session Hijack Prevention:** A backend refresh-queue prevents race conditions and reuse of stale tokens.
*   **Granular RBAC:** Middleware layers verify roles (`customer`, `seller`, `admin`, `employee`) and specific employee sub-roles (e.g., `packer`, `deliveryman`) before reaching the controller.
*   **Secure Communications:** A custom Axios instance with **interceptors** automatically injects Bearer tokens and handles `401 Unauthorized` responses globally to trigger silent re-authentication.

## 💾 Data Persistence & Optimization
*   **Database:** **MongoDB** provides a flexible schema for varied product types and attributes.
*   **High-Speed Indexing:** Strategic compound indexes on product `slug`, `category`, and `price` ensure filtering operations remain sub-100ms even with large datasets.
*   **Aggregation Framework:** Heavily utilizes Mongoose `$aggregate` pipelines for complex data tasks like calculating seller revenue, product popularity trends, and stock-value summaries.

## ☁️ Cloud & Frontend State
*   **Media Management:** **Cloudinary** handles image uploads, providing automatic WebP conversion and on-the-fly resizing to reduce payload sizes for mobile users.
*   **State Management:** **Zustand** is used for global frontend state (Cart, Auth, UI toggles) due to its minimal boilerplate and extreme performance.
*   **Optimistic UI:** **SWR (Stale-While-Revalidate)** manages data fetching, providing instant UI updates through caching and background revalidation.

---
