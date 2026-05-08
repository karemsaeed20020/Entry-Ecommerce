"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import authApi from "@/lib/authApi";
import { Camera, Loader2, Package } from "lucide-react";

interface ReturnRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  items: any[];
}

const RETURN_REASONS = [
  { value: "defective", label: "Defective/Damaged" },
  { value: "wrong_item", label: "Wrong Item Received" },
  { value: "changed_mind", label: "Changed My Mind" },
  { value: "not_as_described", label: "Not as Described" },
  { value: "other", label: "Other" },
];

export default function ReturnRequestDialog({
  isOpen,
  onClose,
  orderId,
  items,
}: ReturnRequestDialogProps) {
  const { auth_token } = useUserStore();
  const [reason, setReason] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason for return");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.post("/returns", {
        orderId,
        reason,
        explanation,
        items: items.map((item) => ({
          productId: item.product?._id || item.productId,
          quantity: item.quantity,
          reason,
        })),
      });

      if (response.success) {
        toast.success("Return request submitted successfully");
        onClose();
      } else {
        toast.error(response.error?.message || "Failed to submit return request");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Request Return
            </DialogTitle>
            <DialogDescription>
              Submit a request to return items from order #{orderId.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Return</Label>
              <Select onValueChange={setReason} required>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="explanation">Additional Details (Optional)</Label>
              <Textarea
                id="explanation"
                placeholder="Tell us more about why you want to return this item..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Photos (Optional)</Label>
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-xl hover:bg-muted/50 transition-all cursor-pointer">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Camera className="h-8 w-8" />
                  <span className="text-xs font-medium">Add Photos</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Providing photos helps us process your request faster.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
