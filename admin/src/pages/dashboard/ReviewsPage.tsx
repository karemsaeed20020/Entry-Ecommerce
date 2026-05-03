import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import useAuthStore from "../../store/useAuthStore";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Skeleton } from "../../components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { format } from "date-fns";

type Review = {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
    slug: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  isApproved: boolean;
  verifiedPurchase: boolean;
  createdAt: string;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const { checkIsAdmin } = useAuthStore();
  const isAdmin = checkIsAdmin();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/reviews/all", {
        params: {
          page,
          limit: perPage,
        },
      });

      if (response.data.success) {
        setReviews(response.data.reviews);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, perPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Reviews list updated",
    });
  };

  const handleToggleStatus = async (review: Review) => {
    setStatusLoading(review._id);
    try {
      const newStatus = !review.isApproved;
      await axiosPrivate.put(`/reviews/${review._id}/status`, {
        isApproved: newStatus,
      });

      setReviews((prev) =>
        prev.map((r) =>
          r._id === review._id ? { ...r, isApproved: newStatus } : r
        )
      );

      toast({
        title: "Success",
        description: `Review ${newStatus ? "approved" : "rejected"}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update review status",
      });
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      await axiosPrivate.delete(`/reviews/${selectedReview._id}`);
      setReviews((prev) => prev.filter((r) => r._id !== selectedReview._id));
      setTotal((prev) => prev - 1);
      toast({
        title: "Deleted",
        description: "Review has been removed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete review",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedReview(null);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ? true :
      statusFilter === "approved" ? review.isApproved :
      !review.isApproved;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-600 mt-1">Monitor and moderate product reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-lg shadow-sm border space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by user, product or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[150px]">User</TableHead>
                <TableHead className="w-[200px]">Product</TableHead>
                <TableHead className="w-[100px]">Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <TableRow key={review._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold overflow-hidden">
                          {review.user.avatar ? (
                            <img src={review.user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            review.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{review.user.name}</span>
                          <span className="text-xs text-gray-500 truncate">{review.user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         {review.product.images?.[0] && (
                            <img src={review.product.images[0]} alt="" className="h-8 w-8 rounded object-cover border" />
                         )}
                         <div className="flex flex-col min-w-0">
                            <span className="text-sm truncate font-medium">{review.product.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono truncate">{review.product._id}</span>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{review.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        {review.title && <p className="text-xs font-bold truncate mb-1">{review.title}</p>}
                        <p className="text-xs text-gray-600 line-clamp-2" title={review.comment}>
                          {review.comment}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                           {format(new Date(review.createdAt), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[10px] px-2 py-0.5",
                        review.isApproved ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                      )}>
                        {review.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                             "h-8 w-8",
                             review.isApproved ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          )}
                          onClick={() => handleToggleStatus(review)}
                          disabled={statusLoading === review._id}
                        >
                          {statusLoading === review._id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : review.isApproved ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedReview(review);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    No reviews found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} reviews
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <div className="flex items-center gap-1">
                 {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && page > 3) pageNum = page - 3 + i;
                    if (pageNum > totalPages) return null;
                    return (
                       <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPage(pageNum)}
                       >
                          {pageNum}
                       </Button>
                    )
                 })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the review from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
