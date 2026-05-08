import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { 
  ArrowLeft, 
  CheckCircle, 
  Package, 
  Truck, 
  XCircle, 
  Clock,
  Printer,
  ChevronRight
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { cn } from "../../lib/utils";
import { QRCodeSVG } from "qrcode.react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

export default function PurchaseDetail() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const fetchPurchase = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(`/purchases/${id}`);
      setPurchase(response.data.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch purchase details",
        variant: "destructive",
      });
      navigate("/dashboard/purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setActionLoading(true);
      await axiosPrivate.put(`/purchases/${id}/status`, { status: newStatus });
      toast({ title: "Success", description: `Purchase status updated to ${newStatus}` });
      fetchPurchase();
      setPendingStatus(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Status update failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const StatusButton = ({ status, label, variant = "default", className }: any) => {
    const messages = {
      approved: { title: "Approve Purchase?", description: "This will approve the requisition for procurement." },
      purchased: { title: "Mark as Purchased?", description: "Confirm that funds have been committed and order placed." },
      received: { title: "Receive Inventory?", description: "This will increment product stock and update pricing. This action cannot be undone." },
      cancelled: { title: "Cancel Purchase?", description: "This will void the purchase order." }
    }[status] as any;

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant={variant} className={className} disabled={actionLoading}>{label}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{messages.title}</AlertDialogTitle>
            <AlertDialogDescription>{messages.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusUpdate(status)} className={status === "cancelled" ? "bg-red-600" : "bg-primary"}>
              Yes, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-6 p-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {purchase.purchaseNumber}
            <Badge className={cn("text-sm", 
              purchase.status === "received" ? "bg-green-100 text-green-700" : 
              purchase.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            )}>
              {purchase.status.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-gray-500 text-sm">Created on {new Date(purchase.createdAt).toLocaleString()}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center gap-2">
          <QRCodeSVG 
            value={window.location.href} 
            size={80}
            level="H"
            includeMargin={true}
          />
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Scan to Verify</span>
        </div>

        <div className="flex-1 flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print</Button>
          
          {purchase.status === "requisition" && (
            <>
              <StatusButton status="approved" label="Approve" className="bg-blue-600 hover:bg-blue-700" />
              <StatusButton status="cancelled" label="Cancel" variant="destructive" />
            </>
          )}
          {purchase.status === "approved" && (
            <StatusButton status="purchased" label="Mark as Purchased" className="bg-purple-600 hover:bg-purple-700" />
          )}
          {purchase.status === "purchased" && (
            <StatusButton status="received" label="Receive Stock" className="bg-green-600 hover:bg-green-700" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Items Summary</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items.map((item: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">${item.totalCost.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={3} className="text-right font-bold py-4">Grand Total</TableCell>
                  <TableCell className="text-right font-bold text-xl text-green-600 py-4">${purchase.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Workflow History</h2>
            <div className="space-y-4">
              {purchase.statusHistory.map((h: any, i: number) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold capitalize">{h.status} - <span className="font-normal text-gray-500">{h.changedBy.name}</span></p>
                    <p className="text-xs text-gray-400">{new Date(h.changedAt).toLocaleString()}</p>
                    {h.notes && <p className="text-sm bg-gray-50 p-2 rounded italic text-gray-600">"{h.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Supplier Info</h2>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-400">Name</p><p className="font-medium">{purchase.supplier.name}</p></div>
              {purchase.supplier.contact && <div><p className="text-gray-400">Contact</p><p className="font-medium">{purchase.supplier.contact}</p></div>}
              {purchase.supplier.email && <div><p className="text-gray-400">Email</p><p className="font-medium">{purchase.supplier.email}</p></div>}
              {purchase.supplier.address && <div><p className="text-gray-400">Address</p><p className="font-medium text-xs leading-tight">{purchase.supplier.address}</p></div>}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Dates</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-500"><Clock className="h-4 w-4" /> Requisition</span>
                <span className="font-medium text-xs">{new Date(purchase.createdAt).toLocaleDateString()}</span>
              </div>
              {purchase.actualDeliveryDate && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-500"><Truck className="h-4 w-4" /> Delivered</span>
                  <span className="font-medium text-xs text-green-600">{new Date(purchase.actualDeliveryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
