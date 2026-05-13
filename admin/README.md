# Entry: Admin Governance & Logistics Hub

This is the centralized management application for the **Entry E-commerce Platform**, designed for administrators to oversee marketplace operations, moderate vendors, and manage warehouse logistics.

## 🚀 Key Features

### 🛡️ Marketplace Moderation
- **Seller Governance:** Full lifecycle management of vendor applications (Approval/Rejection).
- **Product Review:** Ensure marketplace quality by moderating seller product submissions.
- **Role-Based Access:** Secure environment with granular permissions for administrative staff.

### 📦 Logistics & Warehouse
- **Procurement Workflow:** Professional requisitioning and purchasing management (PO Lifecycle).
- **Inventory Automation:** Automated stock updates and price margin recalculations upon goods reception.
- **Asset Verification:** Automated **Barcode generation** for products and **QR Code validation** for purchase orders.

### 📊 Business Intelligence
- **Platform Analytics:** Real-time visualization of global sales, revenue trends, and vendor performance.
- **Inventory Health:** Comprehensive tracking of stock levels, low-stock alerts, and category distribution.

## 🛠️ Tech Stack
- **Framework:** Vite + React 19
- **UI Architecture:** Tailwind CSS & Shadcn UI
- **Data Visualization:** Recharts
- **State Management:** Zustand
- **Utility:** Lucide Icons & Date-fns

## 🔐 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment Setup:**
   Copy `.env.example` to `.env` and configure your private API keys and admin endpoints.
3. **Run development server:**
   ```bash
   npm run dev
   ```
   Access the admin command center at `http://localhost:5173` (default Vite port).

---
