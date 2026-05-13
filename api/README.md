# Entry: Enterprise API Microservice (Backend)

This is the high-performance backend engine for the **Entry E-commerce Platform**, providing secure, scalable RESTful services for the storefront, seller hub, and admin dashboards.

## 🚀 Key Features

### 🛡️ Security & Authentication
- **Advanced Auth:** JWT-based authentication with decoupled refresh-token queues to ensure zero-interruption user sessions.
- **Granular RBAC:** Role-Based Access Control (RBAC) ensuring strict data isolation between Customers, Sellers, and Admins.
- **Hardened Middleware:** Comprehensive request validation, rate limiting, and error handling.

### 📦 Marketplace Engine
- **Multi-Vendor Logic:** Complex schemas for managing independent seller inventories, approval statuses, and earnings.
- **Logistics Integration:** Procurement lifecycles, automated stock management, and barcode/QR verification logic.
- **Analytics Engine:** Aggregation pipelines for real-time sales metrics and platform-wide performance tracking.

### ☁️ Infrastructure & Integrity
- **Media Pipeline:** Automated image processing and optimization via Cloudinary.
- **Scalable DB:** Heavily indexed MongoDB schemas for high-speed product queries and relational data integrity.
- **Global Config:** Dynamic management of currencies, platform settings, and regional configurations.

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Security:** JSON Web Tokens (JWT) & bcrypt
- **Validation:** Joi / Express-validator
- **Tooling:** TypeScript

## 🔐 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment Setup:**
   Copy `.env.example` to `.env` and configure your MongoDB URI, JWT Secrets, Cloudinary keys, and Stripe secrets.
3. **Run development server:**
   ```bash
   npm run dev
   ```
   The API will be accessible at `http://localhost:5000` (default) or your configured port.

---
