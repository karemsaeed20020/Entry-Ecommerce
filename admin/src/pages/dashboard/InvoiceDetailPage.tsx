import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import { generateInvoicePDF } from "../../lib/invoiceGenerator";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  product?: {
    name: string;
    image: string;
  };
}

interface Order {
  _id: string;
  orderId: string;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

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
        description: "Failed to load invoice details",
      });
    } finally {
      setLoading(false);
    }
  }, [id, axiosPrivate, toast]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!order) return;
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
      subtotal: order.totalAmount,
      shipping: 0,
      tax: 0,
      total: order.totalAmount,
      paymentMethod: order.paymentMethod || "cod",
      status: order.status,
    };
    generateInvoicePDF(invoiceData as any);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <FileText className="h-16 w-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900">Invoice Not Found</h2>
        <Button onClick={() => navigate("/dashboard/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/invoices")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button size="sm" onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <Card className="border shadow-lg overflow-hidden bg-white print:shadow-none print:border-none" ref={invoiceRef}>
        <CardContent className="p-8 md:p-12 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-8 border-b pb-12">
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-blue-600 tracking-tighter">ENTRY E-COMMERCE</h1>
              <div className="space-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> 123 Business Street, Tech City</div>
                <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> +1 (234) 567-890</div>
                <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> billing@entry-ecommerce.com</div>
                <div className="flex items-center gap-2"><Globe className="w-3 h-3" /> www.entry-ecommerce.com</div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <h2 className="text-4xl font-light text-gray-400 uppercase tracking-widest">Invoice</h2>
              <div className="space-y-1">
                <p className="text-sm font-bold"># {order.orderId}</p>
                <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bill To</h3>
              <div className="space-y-1">
                <p className="font-bold text-gray-900 text-lg">{order.user.name}</p>
                <p className="text-gray-600">{order.user.email}</p>
                <div className="pt-2 text-sm text-gray-500">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 text-right">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Info</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Payment Status:</span> <span className="font-bold uppercase text-blue-600">{order.paymentStatus}</span></p>
                <p><span className="text-gray-500">Payment Method:</span> <span className="font-bold uppercase">{order.paymentMethod || "cod"}</span></p>
                <p><span className="text-gray-500">Order Status:</span> <span className="font-bold uppercase">{order.status}</span></p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="py-4 font-bold text-sm uppercase tracking-wider">Item Description</th>
                  <th className="py-4 font-bold text-sm uppercase tracking-wider text-right">Price</th>
                  <th className="py-4 font-bold text-sm uppercase tracking-wider text-right">Qty</th>
                  <th className="py-4 font-bold text-sm uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-6">
                      <p className="font-bold text-gray-900">{item.product?.name || item.name}</p>
                    </td>
                    <td className="py-6 text-right text-gray-600">${item.price.toFixed(2)}</td>
                    <td className="py-6 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-6 text-right font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end pt-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-gray-900">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-blue-600">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-12 text-center space-y-2">
            <p className="text-gray-900 font-bold">Thank you for your business!</p>
            <p className="text-xs text-gray-400">Please contact us if you have any questions about this invoice.</p>
          </div>
        </CardContent>
      </Card>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .no-print { display: none !important; }
          ref.current, [ref] { visibility: visible; }
          div[ref] { position: absolute; left: 0; top: 0; width: 100%; }
          .Card { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
          main, div { visibility: visible !important; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
}
