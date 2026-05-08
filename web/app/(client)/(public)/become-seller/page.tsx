"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { fetchWithConfig } from "@/lib/config";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  FileText,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface SellerStatus {
  success: boolean;
  data: {
    _id: string;
    storeName: string;
    description: string;
    status: "pending" | "approved" | "rejected";
    contactEmail: string;
    contactPhone?: string;
    createdAt: string;
  } | null;
  isSeller: boolean;
  isApproved?: boolean;
}

export default function BecomeSellerPage() {
  const router = useRouter();
  const { isAuthenticated, authUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  // Check existing seller status
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin?redirect=/become-seller");
      return;
    }

    const checkStatus = async () => {
      try {
        const data = await fetchWithConfig<SellerStatus>("/sellers/me");
        setSellerStatus(data);
        if (data.data) {
          setFormData({
            storeName: data.data.storeName,
            description: data.data.description,
            contactEmail: data.data.contactEmail,
            contactPhone: data.data.contactPhone || "",
            address: { street: "", city: "", state: "", country: "", postalCode: "" },
          });
        } else {
          // Pre-fill email
          setFormData((prev) => ({
            ...prev,
            contactEmail: authUser?.email || "",
          }));
        }
      } catch (err) {
        console.error("Failed to check seller status:", err);
        // Pre-fill email even on error
        setFormData((prev) => ({
          ...prev,
          contactEmail: authUser?.email || "",
        }));
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, router, authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await fetchWithConfig("/sellers", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Already has seller status
  if (sellerStatus?.isSeller && sellerStatus.data) {
    const status = sellerStatus.data.status;
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div
            className={`p-8 text-center ${
              status === "approved"
                ? "bg-gradient-to-br from-emerald-50 to-green-50"
                : status === "pending"
                ? "bg-gradient-to-br from-amber-50 to-yellow-50"
                : "bg-gradient-to-br from-red-50 to-rose-50"
            }`}
          >
            {status === "approved" && (
              <>
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-emerald-900">
                  You&apos;re an Approved Seller! 🎉
                </h1>
                <p className="text-emerald-700 mt-2">
                  Your store <strong>{sellerStatus.data.storeName}</strong> is live.
                  You can now manage your products.
                </p>
              </>
            )}
            {status === "pending" && (
              <>
                <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-amber-900">
                  Application Under Review
                </h1>
                <p className="text-amber-700 mt-2">
                  Your store <strong>{sellerStatus.data.storeName}</strong> is
                  pending admin approval. We&apos;ll notify you once it&apos;s reviewed.
                </p>
              </>
            )}
            {status === "rejected" && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-900">
                  Application Rejected
                </h1>
                <p className="text-red-700 mt-2">
                  Unfortunately, your seller application was not approved. Please
                  contact support for more information.
                </p>
              </>
            )}
          </div>

          <div className="p-6 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Store Name</span>
                <p className="font-medium text-slate-900">
                  {sellerStatus.data.storeName}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Contact</span>
                <p className="font-medium text-slate-900">
                  {sellerStatus.data.contactEmail}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Applied</span>
                <p className="font-medium text-slate-900">
                  {new Date(sellerStatus.data.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Status</span>
                <p className="font-medium capitalize text-slate-900">
                  {sellerStatus.data.status}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state after submitting
  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden text-center">
          <div className="p-12 bg-gradient-to-br from-emerald-50 to-green-50">
            <CheckCircle className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-emerald-900">
              Application Submitted! 🎉
            </h1>
            <p className="text-emerald-700 mt-3 text-lg">
              Your seller application has been submitted successfully. An admin
              will review your application and you&apos;ll be notified once
              it&apos;s approved.
            </p>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Application form
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4">
          <Store className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Become a Seller</h1>
        <p className="text-slate-500 mt-2 max-w-md mx-auto">
          Join our marketplace and start selling your products to millions of
          customers worldwide.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          {
            icon: ShieldCheck,
            title: "Trusted Platform",
            desc: "Secure transactions and buyer protection",
          },
          {
            icon: Store,
            title: "Your Own Store",
            desc: "Customize and manage your store page",
          },
          {
            icon: Send,
            title: "Quick Setup",
            desc: "Get started selling in minutes",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
          >
            <item.icon className="h-5 w-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                {item.title}
              </p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Store Information
          </h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Store Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                required
                placeholder="e.g. My Awesome Store"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Store Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Tell us about your store and what you sell..."
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  required
                  placeholder="seller@example.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-slate-400" />
              Address (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                placeholder="Street"
                className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="City"
                className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="State / Province"
                className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                placeholder="Country"
                className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </form>
    </div>
  );
}
