import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Skeleton } from "../../components/ui/skeleton";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Purchase = {
  _id: string;
  purchaseNumber: string;
  status: "requisition" | "approved" | "purchased" | "received" | "cancelled";
  totalAmount: number;
  supplier: { name: string };
  createdAt: string;
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine status filter based on path
  const path = location.pathname;
  let statusFilter = "";
  if (path.includes("/approved")) statusFilter = "approved";
  else if (path.includes("/purchased")) statusFilter = "purchased";

  useEffect(() => {
    fetchPurchases();
  }, [page, statusFilter]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get("/purchases", {
        params: { 
          page, 
          limit: 10, 
          status: statusFilter || undefined 
        },
      });
      setPurchases(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "requisition": return <FileText className="h-4 w-4 text-gray-500" />;
      case "approved": return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "purchased": return <Package className="h-4 w-4 text-purple-500" />;
      case "received": return <Truck className="h-4 w-4 text-green-500" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "requisition": return "bg-gray-100 text-gray-700";
      case "approved": return "bg-blue-100 text-blue-700";
      case "purchased": return "bg-purple-100 text-purple-700";
      case "received": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold capitalize">
            {statusFilter ? `${statusFilter} Purchases` : "All Purchases"}
          </h1>
          <p className="text-gray-500">Track and manage your inventory purchases</p>
        </div>
        <Button onClick={() => navigate("/dashboard/purchases/create")} className="bg-[#1a1a2c]">
          <Plus className="mr-2 h-4 w-4" /> New Requisition
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <Search className="text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search by PO number or supplier..."
          className="max-w-md border-none focus-visible:ring-0 shadow-none"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>PO Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : purchases.length > 0 ? (
              purchases.map((purchase) => (
                <TableRow key={purchase._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/dashboard/purchases/${purchase._id}`)}>
                  <TableCell className="font-bold text-primary">{purchase.purchaseNumber}</TableCell>
                  <TableCell className="font-medium">{purchase.supplier.name}</TableCell>
                  <TableCell className="font-semibold text-green-600">${purchase.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={cn("flex items-center gap-1 w-fit", getStatusColor(purchase.status))}>
                      {getStatusIcon(purchase.status)}
                      <span className="capitalize">{purchase.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-500">No purchases found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// Missing imports in first attempt
import { FileText } from "lucide-react";
import { cn } from "../../lib/utils";
