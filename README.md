# Entry E-commerce Platform

Welcome to the **Entry E-commerce Platform** – a robust, production-ready full-stack e-commerce solution built with modern technologies. Whether you are aiming to launch a complete store setup or learn enterprise-grade architecture using Turborepo, this repository has everything you need.


![Preview](https://github.com/noorjsdivs/entry-ecommerce-app-free/blob/main/public/preview.png?raw=true)

## 🚀 Key Features

### 🛍️ Customer Storefront (Next.js)

- **High Performance**: Built with Next.js 16+ (App Router) to ensure lightning-fast render speeds and SEO dominance.
- **Beautiful & Modern UI**: Tailored with Tailwind CSS and Shadcn UI components for an engaging shopping experience.
- **Responsive Design**: Flawlessly adapts across mobile, tablet, and desktop devices screens.
- **SEO Optimized**: Advanced Meta tags, OpenGraph support, structured JSON-LD data.

### ⚡ Power Admin Dashboard (Vite + React)

- **Product Management**: Intuitive interface to create, edit, classify and manage complete inventory.
- **Order Processing**: Real-time status tracking, bulk processing, invoice generation, and shipment management.
- **Comprehensive Analytics**: Dashboard visualizations of sales metrics, revenue, and customer behaviors.

### 🔒 Secure Backend (Node.js/Express)

- **Role-Based Access Control**: Fully secured JWT authentication paths separating Customers from Admins.
- **Scalable Architecture**: Flexible and heavily optimized MongoDB schemas tailored exclusively for modern storefront needs.
- **Payment & Security**: Pre-integrated with providers like Stripe, handling seamless transactions.

## 🛠️ Tech Stack & Tooling

| Ecosystem        | Technologies                                                  |
| ---------------- | ------------------------------------------------------------- |
| **Frontend**     | Next.js 16+, React 19, Tailwind CSS, Shadcn UI, Framer Motion |
| **Admin**        | Vite, React 19, Recharts, Tailwind CSS                        |
| **Backend**      | Node.js, Express, Mongoose                                    |
| **Database**     | MongoDB (Atlas / Local)                                       |
| **Integrations** | Stripe Auth, Cloudinary                                       |


## 🧱 Project Structure

This project uses a highly efficient [Turborepo](https://turbo.build/) monorepo structure.

```txt
entry-ecommerce/
│   ├── web/          # Next.js 16+ Customer Storefront
│   ├── admin/        # Vite + React Admin Dashboard
│   └── api/          # Express Backend API Server
```
## 🔐 Environment Setup

Each application module (`apps/web`, `apps/admin`, `apps/api`) has its own `.env.example` file.

You must copy these into local `.env` files for execution. For example:

- `apps/api/.env` needs MongoDB URIs, JWT Secrets, Stripe Secret Keys.
- `apps/web/.env` needs API endpoint URLs and Public Stripe Keys.
- Reference `docs/SETUP.md` for a master list of required keys.
