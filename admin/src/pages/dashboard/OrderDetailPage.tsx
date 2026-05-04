import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import useAuthStore from "../../store/useAuthStore";
import { getOrderStatusForRole, getStatusLabel } from "../../lib/rolePermissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  History,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { generateInvoicePDF } from "../../lib/invoiceGenerator";

interface OrderItem {
  productId?: string;
  name?: string;
  price: number;
  quantity: number;
  image?: string;
  product?: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
}

interface StatusHistoryEntry {
  status: string;
  changed_at: string;
  changed_by: {
    id: string;
    name: string;
  };
  notes?: string;
}

interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status:
    | "pending"
    | "address_confirmed"
    | "confirmed"
    | "packed"
    | "delivering"
    | "delivered"
    | "completed"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "cod_collected";
  paymentMethod?: "stripe" | "cod";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status_history?: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load order details",
      });
    } finally {
      setLoading(false);
    }
  }, [id, axiosPrivate, toast]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusChange = async (newStatus: Order["status"]) => {
    if (!order) return;
    setUpdating(true);
    try {
      await axiosPrivate.put(`/orders/${order._id}/status`, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      toast({
        title: "Success",
        description: `Order status updated to ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    // We need to transform the data for the invoice generator
    const invoiceData = {
      orderId: order.orderId,
      date: new Date(order.createdAt).toLocaleDateString(),
      customerName: order.user.name,
      customerEmail: order.user.email,
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        name: item.product?.name || item.name || "Unknown Product",
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      total: order.totalAmount,
      paymentMethod: order.paymentMethod || "cod",
      status: order.status,
    };
    generateInvoicePDF(invoiceData as any);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "address_confirmed": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-indigo-100 text-indigo-800";
      case "packed": return "bg-orange-100 text-orange-800";
      case "delivering": return "bg-cyan-100 text-cyan-800";
      case "delivered": return "bg-emerald-100 text-emerald-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "cod_collected": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "refunded": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const rolePermissions = getOrderStatusForRole(user?.role || "", user?.employee_role);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="h-16 w-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
        <Button onClick={() => navigate("/dashboard/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Order #{order.orderId}
              <Badge className={cn("ml-2 capitalize", getStatusColor(order.status))}>
                {getStatusLabel(order.status)}
              </Badge>
            </h1>
            <p className="text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/dashboard/invoices/${order._id}`)}>
            <FileText className="mr-2 h-4 w-4" /> View Invoice
          </Button>
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="mr-2 h-4 w-4" /> Invoice PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Items and Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="overflow-hidden border-none shadow-sm bg-white">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="h-16 w-16 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0">
                      <img
                        src={item.product?.image || item.image || "/placeholder.png"}
                        alt={item.product?.name || item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/placeholder.png"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.product?.name || item.name || "Unknown Product"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50/50 flex justify-between items-center">
                <span className="text-gray-600 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <p className="font-medium">{order.user.name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="font-medium">{order.user.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-medium">{order.shippingAddress.street}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="text-gray-600">{order.shippingAddress.country}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Status and History */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Manage Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Order Status</Label>
                <Select
                  value={order.status}
                  onValueChange={(val) => handleStatusChange(val as Order["status"])}
                  disabled={updating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolePermissions.availableStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Status</Label>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50">
                  <span className="text-sm font-medium capitalize">{order.paymentStatus}</span>
                  <Badge className={cn("capitalize", getPaymentStatusColor(order.paymentStatus))}>
                    {order.paymentStatus === "cod_collected" ? "Paid (COD)" : order.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                  <CreditCard className="h-4 w-4" />
                  Payment Method
                </div>
                <p className="text-blue-700 text-sm capitalize">{order.paymentMethod || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {order.status_history && order.status_history.length > 0 ? (
                  order.status_history.map((entry, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[1.625rem] top-1.5 h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-900">{getStatusLabel(entry.status)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.changed_at).toLocaleString()} by {entry.changed_by.name}
                        </p>
                        {entry.notes && (
                          <p className="text-xs italic text-gray-600 mt-1">"{entry.notes}"</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No status history recorded.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
