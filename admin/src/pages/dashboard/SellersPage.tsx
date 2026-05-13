import { useState, useEffect, useCallback } from "react";
import {
  Store,
  Search,
  Check,
  X,
  Clock,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  User,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ArrowUpRight,
  Activity,
  Package,
} from "lucide-react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

// Types
interface SellerAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface SellerUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface Seller {
  _id: string;
  userId: SellerUser;
  storeName: string;
  description: string;
  logo?: string;
  status: "pending" | "approved" | "rejected";
  contactEmail: string;
  contactPhone?: string;
  address?: SellerAddress;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    variant: "warning" as const,
    icon: Clock,
  },
  approved: {
    label: "Approved",
    variant: "success" as const,
    icon: ShieldCheck,
  },
  rejected: {
    label: "Rejected",
    variant: "destructive" as const,
    icon: ShieldX,
  },
};



export default function SellersPage() {
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSellers = useCallback(async () => {
    if (!axiosPrivate) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      params.set("limit", "100");

      const response = await axiosPrivate.get(`/sellers?${params.toString()}`);
      setSellers(response.data.sellers || response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, filter]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleStatusUpdate = async (
    sellerId: string,
    newStatus: "approved" | "rejected"
  ) => {
    setActionLoading(sellerId);
    try {
      await axiosPrivate.put(`/sellers/${sellerId}/status`, {
        status: newStatus,
      });
      setSellers((prev) =>
        prev.map((s) => (s._id === sellerId ? { ...s, status: newStatus } : s))
      );
      if (selectedSeller?._id === sellerId) {
        setSelectedSeller((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
      toast({
        title: "Success",
        description: `Seller application has been ${newStatus}.`,
      });
    } catch (error: any) {
      console.error("Failed to update seller status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.response?.data?.message || "Could not update status.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch =
      !search ||
      seller.storeName.toLowerCase().includes(search.toLowerCase()) ||
      seller.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
      (seller.userId?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const counts = {
    all: sellers.length,
    pending: sellers.filter((s) => s.status === "pending").length,
    approved: sellers.filter((s) => s.status === "approved").length,
    rejected: sellers.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Seller Hub</h1>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                {counts.pending} applications awaiting review
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={fetchSellers}
            className="rounded-xl font-bold border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Applications", value: counts.all, icon: Store, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Pending Review", value: counts.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Active Partners", value: counts.approved, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Rejected", value: counts.rejected, icon: ShieldX, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col lg:flex-row items-center gap-4">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl w-full lg:w-auto">
            {(["all", "pending", "approved", "rejected"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 lg:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                  filter === key
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by store name, email, or user..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-900 h-14">Seller</TableHead>
              <TableHead className="font-bold text-slate-900 h-14">Store Details</TableHead>
              <TableHead className="font-bold text-slate-900 h-14">Contact Info</TableHead>
              <TableHead className="font-bold text-slate-900 h-14">Status</TableHead>
              <TableHead className="font-bold text-slate-900 h-14">Applied On</TableHead>
              <TableHead className="text-right font-bold text-slate-900 h-14 pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Records</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <ShieldAlert className="h-10 w-10 text-slate-200" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No entries found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSellers.map((seller) => (
                <TableRow key={seller._id} className="group hover:bg-slate-50/80 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-indigo-100 shadow-sm">
                        {seller.userId?.avatar ? (
                          <img src={seller.userId.avatar} alt={seller.userId.name} className="h-full w-full object-cover" />
                        ) : (
                          seller.userId?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{seller.userId?.name || "Anonymous"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{seller.userId?.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-900 text-sm">{seller.storeName}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-[180px]">{seller.description}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {seller.contactEmail}
                      </div>
                      {seller.contactPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {seller.contactPhone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[seller.status].variant} className="rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      {statusConfig[seller.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSeller(seller)}
                      className="rounded-lg hover:bg-white hover:shadow-sm transition-all group-hover:text-indigo-600"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Seller Detail Sheet */}
      <Sheet open={!!selectedSeller} onOpenChange={(open: boolean) => !open && setSelectedSeller(null)}>
        <SheetContent className="w-full sm:max-w-xl p-0 overflow-y-auto">
          {selectedSeller && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-8 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="space-y-4">
                    <Badge variant="outline" className="text-indigo-400 border-indigo-400/30 uppercase text-[10px] font-black tracking-[0.2em] bg-indigo-500/10">
                      Seller Application
                    </Badge>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl overflow-hidden ring-4 ring-white/10">
                        {selectedSeller.userId?.avatar ? (
                          <img src={selectedSeller.userId.avatar} className="h-full w-full object-cover" />
                        ) : (
                          selectedSeller.userId?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <SheetTitle className="text-3xl font-black text-white tracking-tight leading-none">
                          {selectedSeller.userId?.name}
                        </SheetTitle>
                        <p className="text-indigo-300 font-bold mt-2 text-sm">
                          {selectedSeller.userId?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-8 space-y-10 flex-1">
                {/* Store Status Banner */}
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Application Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        selectedSeller.status === 'approved' ? 'bg-emerald-500' :
                        selectedSeller.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      <span className="font-black text-lg text-slate-900 uppercase tracking-tight italic">
                        {selectedSeller.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied</p>
                    <p className="font-bold text-slate-900">{new Date(selectedSeller.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Details Sections */}
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Store className="h-3.5 w-3.5 text-indigo-600" /> Store Profile
                    </h4>
                    <Card className="border-none bg-slate-50/50 rounded-2xl">
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Business Name</p>
                          <p className="font-bold text-slate-900 text-lg leading-tight">{selectedSeller.storeName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Store Description</p>
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedSeller.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-indigo-600" /> Contact & Logistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50/50 rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Support Email</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{selectedSeller.contactEmail}</p>
                      </div>
                      <div className="p-4 bg-slate-50/50 rounded-2xl space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Line</p>
                        <p className="text-sm font-bold text-slate-900">{selectedSeller.contactPhone || "None"}</p>
                      </div>
                    </div>
                    {selectedSeller.address && (
                      <div className="p-5 bg-slate-50/50 rounded-2xl flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Physical Location</p>
                          <p className="text-sm font-medium text-slate-700 leading-snug">
                            {[selectedSeller.address.street, selectedSeller.address.city, selectedSeller.address.state, selectedSeller.address.country].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                {selectedSeller.status !== "rejected" && (
                  <Button
                    variant="outline"
                    className="flex-1 h-14 rounded-2xl border-2 border-red-100 text-red-600 font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-200 transition-all"
                    onClick={() => handleStatusUpdate(selectedSeller._id, "rejected")}
                    disabled={actionLoading === selectedSeller._id}
                  >
                    <X className="h-5 w-5 mr-2" />
                    Reject
                  </Button>
                )}
                {selectedSeller.status !== "approved" && (
                  <Button
                    className="flex-1 h-14 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all"
                    onClick={() => handleStatusUpdate(selectedSeller._id, "approved")}
                    disabled={actionLoading === selectedSeller._id}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Approve
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
