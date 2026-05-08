"use client";

import React, { useState, useEffect } from "react";
import { useUserStore } from "@/lib/store";
import authApi from "@/lib/authApi";
import Cookies from "js-cookie";
import { 
  RotateCcw, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink,
  MessageCircle,
  MoreVertical
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Container from "@/components/common/Container";

export default function SellerReturnsPage() {
  const { auth_token } = useUserStore();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await authApi.get<any>("/returns/seller");
      if (response.success && response.data) {
        // The API returns { success: true, data: [...] }
        setReturns(response.data.data || []);
      } else {
        toast.error(response.error?.message || "Failed to fetch returns");
      }
    } catch (error) {
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth_token) fetchReturns();
  }, [auth_token]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await authApi.put(`/returns/${id}`, { status });
      if (response.success) {
        toast.success(`Return request ${status}`);
        fetchReturns();
      } else {
        toast.error(response.error?.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case "approved": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "refunded": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"><CheckCircle className="w-3 h-3 mr-1" /> Refunded</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-[#d52245]" />
            Return Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage product returns and refund requests from customers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by Order ID or Customer..." 
              className="pl-9 bg-slate-50 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="font-bold text-slate-700">Order ID</TableHead>
              <TableHead className="font-bold text-slate-700">Customer</TableHead>
              <TableHead className="font-bold text-slate-700">Items</TableHead>
              <TableHead className="font-bold text-slate-700">Reason</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">Loading...</TableCell>
              </TableRow>
            ) : returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">No return requests found</TableCell>
              </TableRow>
            ) : (
              returns.map((req: any) => (
                <TableRow key={req._id}>
                  <TableCell className="font-mono text-xs">#{req.orderId?._id?.slice(-8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{req.customerId?.name}</span>
                      <span className="text-[10px] text-slate-400">{req.customerId?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {req.items.map((item: any, i: number) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                          <img src={item.productId?.image} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 line-clamp-1">{req.reason}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {req.status === "pending" && (
                          <>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(req._id, "approved")}>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(req._id, "rejected")}>
                              <XCircle className="w-4 h-4 mr-2 text-red-500" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {req.status === "approved" && (
                          <DropdownMenuItem onClick={() => handleUpdateStatus(req._id, "refunded")}>
                            <RotateCcw className="w-4 h-4 mr-2 text-blue-500" /> Mark as Refunded
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <MessageCircle className="w-4 h-4 mr-2" /> Chat with Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
