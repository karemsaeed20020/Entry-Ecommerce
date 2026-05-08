import { useState, useEffect } from "react";
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock, 
  Search, 
  Filter, 
  MoreHorizontal,
  Store,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import { format } from "date-fns";

type Product = {
  _id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  seller: {
    _id: string;
    storeName: string;
  };
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        perPage: 10,
        seller: "seller-products",
      };
      
      if (statusFilter !== "all") {
        params.approvalStatus = statusFilter;
      }
      
      if (search) {
        params.search = search;
      }

      const response = await axiosPrivate.get("/products", { params });
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch seller products",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (productId: string, status: "approved" | "rejected") => {
    try {
      await axiosPrivate.put(`/products/${productId}/approve`, { approvalStatus: status });
      toast({
        title: "Success",
        description: `Product ${status} successfully`,
      });
      fetchProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update product status`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="text-indigo-600 h-8 w-8" />
            Seller Products
          </h1>
          <p className="text-slate-500 font-medium">Review and manage products submitted by marketplace sellers.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="text-amber-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Review</p>
              <h3 className="text-2xl font-black text-slate-900">
                {products.filter(p => p.approvalStatus === "pending").length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="text-emerald-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Approved Items</p>
              <h3 className="text-2xl font-black text-slate-900">
                {products.filter(p => p.approvalStatus === "approved").length}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Store className="text-indigo-600 h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Submissions</p>
              <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search products or stores..." 
                className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-indigo-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={statusFilter === "all" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-indigo-600" : ""}
              >
                All
              </Button>
              <Button 
                variant={statusFilter === "pending" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter("pending")}
                className={statusFilter === "pending" ? "bg-amber-600" : ""}
              >
                Pending
              </Button>
              <Button 
                variant={statusFilter === "approved" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setStatusFilter("approved")}
                className={statusFilter === "approved" ? "bg-emerald-600" : ""}
              >
                Approved
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none">
                <TableHead className="font-bold text-slate-900">Product</TableHead>
                <TableHead className="font-bold text-slate-900">Store</TableHead>
                <TableHead className="font-bold text-slate-900 text-right">Price</TableHead>
                <TableHead className="font-bold text-slate-900 text-center">Status</TableHead>
                <TableHead className="font-bold text-slate-900">Submitted</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-slate-50">
                    <TableCell colSpan={6} className="h-16 animate-pulse bg-slate-50/20"></TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-slate-400 font-medium">
                    No products found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                          {product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                          {product.seller?.storeName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-600 font-medium text-sm">{product.seller?.storeName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(product.approvalStatus)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs font-medium">
                      {format(new Date(product.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 shadow-xl">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2 focus:bg-indigo-50 focus:text-indigo-600">
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {product.approvalStatus !== "approved" && (
                            <DropdownMenuItem 
                              className="text-emerald-600 gap-2 focus:bg-emerald-50 focus:text-emerald-600"
                              onClick={() => handleStatusUpdate(product._id, "approved")}
                            >
                              <CheckCircle className="h-4 w-4" /> Approve Product
                            </DropdownMenuItem>
                          )}
                          {product.approvalStatus !== "rejected" && (
                            <DropdownMenuItem 
                              className="text-red-600 gap-2 focus:bg-red-50 focus:text-red-600"
                              onClick={() => handleStatusUpdate(product._id, "rejected")}
                            >
                              <XCircle className="h-4 w-4" /> Reject Product
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-50 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-lg"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
