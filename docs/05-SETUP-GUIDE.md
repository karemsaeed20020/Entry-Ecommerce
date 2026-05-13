# Entry: Full-Stack Setup & Deployment Guide

## ⚙️ Engineering Prerequisites
To ensure the high-performance features of Entry operate correctly, your environment must meet the following specifications:
*   **Node.js:** v18.17.0 or higher (LTS recommended).
*   **Database:** MongoDB v6.0+ (Local instance or MongoDB Atlas URI).
*   **Cloud Assets:** A **Cloudinary** account for automated image processing.
*   **Payments:** **Stripe** and/or **SSLCommerz** developer API keys.

---

## 🛠️ Rapid Installation Workflow

### 1. Initialize the Monorepo
Clone the repository and enter the workspace root:
```bash
git clone https://github.com/karemsaeed20020/Entry-Ecommerce.git
cd Entry
```

### 2. Dependency Resolution
Entry utilizes **Turborepo** to manage dependencies. Run the following from the root to install all package requirements:
```bash
npm install
```

### 3. Environment Orchestration
You must configure the `.env` files for each service. Create a `.env` file in the following locations:

#### **Backend (`/api/.env`)**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_ultra_secure_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
STRIPE_SECRET_KEY=sk_test_...
```

#### **Storefront (`/web/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### **Admin Dashboard (`/admin/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Launching the Ecosystem

### Development Mode
To launch the API, Web Storefront, and Admin Dashboard simultaneously with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Production Build
To generate optimized, tree-shaken production bundles for the entire stack:
```bash
npm run build
```

---

## 🧪 Advanced Maintenance & Automation
*   **Data Seeding:** Populate the database with sample products and categories.
    ```bash
    cd api && npm run seed
    ```
*   **Barcode Generation:** Batch generate 1D barcodes for inventory management.
    ```bash
    node api/generateBarcodes.js
    ```
*   **Cleanup Operations:** Purge orphan images from Cloudinary or clear test products.
    ```bash
    node api/scripts/clear-products.js
    ```

---
