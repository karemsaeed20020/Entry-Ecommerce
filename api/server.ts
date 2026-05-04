import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { specs } from "./config/swagger.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import productTypeRoutes from "./routes/productTypeRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adsBannerRoutes from "./routes/adsBannerRoutes.js";
import productBannerRoutes from "./routes/productBannerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import addressRoutes from './routes/addressRoutes.js';
import baseConfigRoutes from './routes/baseConfigRoutes.js';
import componentTypeRoutes from './routes/componentTypeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import userRoleRoutes from './routes/userRoleRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import orderWorkflowRoutes from './routes/orderWorkflowRoutes.js';
import cashCollectionRoutes from './routes/cashCollectionRoutes.js';
import websiteIconRoutes from './routes/websiteIconRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Application = express();

// Enhanced CORS configuration
const allowedOrigins: (string | undefined)[] = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  "https://admin-entry.vercel.app",
  "https://entry.vercel.app",
  "https://entry.reactbd.com",
  "https://admin.entry.reactbd.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://10.0.2.2:8081",
  "http://10.0.2.2:8000",
].filter(Boolean);

app.use(
  cors({
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      // Check against allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // Allow Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Increase body size limit for JSON and URL-encoded payloads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Additional headers for Swagger UI in production
app.use("/api/docs", (req: Request, res: Response, next) => {
  res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/ads-banners", adsBannerRoutes);
app.use("/api/product-banners", productBannerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/orders/workflow", orderWorkflowRoutes);
app.use("/api/cash-collections", cashCollectionRoutes);
app.use("/api/users/roles", userRoleRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/component-types", componentTypeRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/website-icons", websiteIconRoutes);
app.use("/api/base-config", baseConfigRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/wishlist", wishlistRoutes);

// API Documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .scheme-container { background: #fafafa; padding: 30px 0 }
    `,
    customSiteTitle: "Entry Ecommerce API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  }),
);

// Home route
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Entry API is running...",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    docs: `${req.protocol}://${req.get("host")}/api/docs`,
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      products: "/api/products",
      categories: "/api/categories",
      brands: "/api/brands",
      upload: "/api/upload",
      docs: "/api/docs",
    },
  });
});

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});

// Swagger docs redirect and info
app.get("/docs", (req: Request, res: Response) => {
  res.redirect("/api/docs");
});

app.get("/api/docs/info", (req: Request, res: Response) => {
  res.json({
    swagger: "Available",
    url: `${req.protocol}://${req.get("host")}/api/docs`,
    specs: specs ? "Loaded" : "Not loaded",
    environment: process.env.NODE_ENV,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});