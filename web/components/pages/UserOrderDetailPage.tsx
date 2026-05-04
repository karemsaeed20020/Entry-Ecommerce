"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Truck,
  Package,
  ArrowLeft,
  Clock,
  CreditCard,
  RefreshCw,
  XCircle,
  AlertCircle,
  Download,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import { getOrderById, Order } from "@/lib/orderApi";
import { generateInvoicePDF, type InvoiceData } from "@/lib/invoiceGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: <Clock className="w-3 h-3" />,
  },
  address_confirmed: {
    label: "Address Confirmed",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <MapPin className="w-3 h-3" />,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    icon: <Package className="w-3 h-3" />,
  },
  processing: {
    label: "Processing",
    bg: "bg-purple-100",
    text: "text-purple-700",
    icon: <RefreshCw className="w-3 h-3" />,
  },
  packed: {
    label: "Packed",
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: <Package className="w-3 h-3" />,
  },
  shipped: {
    label: "Shipped",
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    icon: <Truck className="w-3 h-3" />,
  },
  delivering: {
    label: "Delivering",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  completed: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  paid: { label: "Paid", bg: "bg-green-100", text: "text-green-700" },
  pending: { label: "Unpaid", bg: "bg-yellow-100", text: "text-yellow-700" },
  failed: { label: "Failed", bg: "bg-red-100", text: "text-red-700" },
  refunded: { label: "Refunded", bg: "bg-blue-100", text: "text-blue-700" },
};

const formatPrice = (p: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    p,
  );

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function UserOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { authUser, auth_token, isAuthenticated } = useUserStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!auth_token || !id) return;
    try {
      setLoading(true);
      const result = await getOrderById(id as string, auth_token);
      setOrder(result);
    } catch (error) {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [id, auth_token]);

  useEffect(() => {
    if (isAuthenticated) fetchOrder();
  }, [fetchOrder, isAuthenticated]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    const subtotal = order.items.reduce((a, i) => a + i.price * i.quantity, 0);
    const invoiceData: InvoiceData = {
      orderId: order._id,
      date: new Date(order.createdAt).toLocaleDateString(),
      customerName: authUser?.name || "Customer",
      customerEmail: authUser?.email || "",
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      subtotal,
      shipping: order.total - subtotal, // Simple estimation
      tax: 0,
      total: order.total,
      paymentMethod: order.paymentMethod || "COD",
      status: order.status,
    };

    await generateInvoicePDF(invoiceData);
    toast.success("Invoice downloading...");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
            <div className="h-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-96 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <Button onClick={() => router.push("/user/orders")} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["pending"];
  const paymentStatus = PAYMENT_STATUS_CONFIG[order.paymentStatus ?? "pending"] ?? PAYMENT_STATUS_CONFIG["pending"];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-sm text-muted-foreground">ID: #{order._id.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadInvoice} className="gap-2">
            <Download className="w-4 h-4" />
            Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Track Order
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative flex justify-between items-center w-full px-2 sm:px-6">
                {/* Horizontal line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
                
                {/* Status Nodes */}
                {["pending", "confirmed", "shipped", "delivered"].map((s, i) => {
                  const isActive = order.status === s || (
                    (order.status === "delivered" || order.status === "completed") && (s === "pending" || s === "confirmed" || s === "shipped")
                  ) || (
                    order.status === "shipped" && (s === "pending" || s === "confirmed")
                  ) || (
                    order.status === "confirmed" && s === "pending"
                  );
                  
                  return (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2",
                        isActive ? "bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "bg-background border-muted text-muted-foreground"
                      )}>
                        {isActive ? <CheckCircle className="w-5 h-5" /> : <span>{i + 1}</span>}
                      </div>
                      <span className={cn("text-[10px] sm:text-xs font-medium capitalize", isActive ? "text-primary" : "text-muted-foreground")}>
                        {s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y border-t">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Payment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium text-foreground">{order.shippingAddress.street}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod || "COD"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={cn("border-0", paymentStatus.bg, paymentStatus.text)}>
                    {paymentStatus.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-primary text-primary-foreground overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary-foreground/80 text-sm font-medium">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.items.reduce((a, i) => a + i.price * i.quantity, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(order.total - order.items.reduce((a, i) => a + i.price * i.quantity, 0))}</span>
                </div>
                <div className="border-t border-primary-foreground/20 pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              {order.paymentStatus !== "paid" && order.paymentMethod !== "cod" && (
                <Button className="w-full bg-white text-primary hover:bg-white/90">
                  Pay Now
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">
                If you have any questions about your order, please contact our support team.
              </p>
              <Button variant="outline" className="w-full text-xs" size="sm">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
