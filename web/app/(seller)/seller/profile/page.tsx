"use client";

import { useState, useEffect } from "react";
import { Store, Save, Mail, Phone, MapPin, RefreshCw } from "lucide-react";
import { fetchWithConfig } from "@/lib/config";
import { toast } from "sonner";

export default function SellerProfilePage() {
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: "", description: "", contactEmail: "", contactPhone: "", logo: "",
    street: "", city: "", state: "", country: "", postalCode: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithConfig<any>("/sellers/me");
        const d = res.data;
        if (d) {
          setSeller(d);
          setForm({
            storeName: d.storeName || "", description: d.description || "",
            contactEmail: d.contactEmail || "", contactPhone: d.contactPhone || "",
            logo: d.logo || "", street: d.address?.street || "", city: d.address?.city || "",
            state: d.address?.state || "", country: d.address?.country || "", postalCode: d.address?.postalCode || "",
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        storeName: form.storeName, description: form.description,
        contactEmail: form.contactEmail, contactPhone: form.contactPhone, logo: form.logo,
        address: { street: form.street, city: form.city, state: form.state, country: form.country, postalCode: form.postalCode },
      };
      await fetchWithConfig("/sellers/profile", { method: "PUT", body: JSON.stringify(payload) });
      toast.success("Store profile updated successfully");
    } catch (err: any) { toast.error(err.message || "Failed to update profile"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 space-y-4 animate-pulse"><div className="h-8 w-48 bg-muted rounded-lg" />{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg" />)}</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Store className="h-5 w-5 text-emerald-600" /> Store Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your store information</p>
      </div>

      {/* Status Card */}
      {seller && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {seller.storeName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-emerald-900">{seller.storeName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`h-2 w-2 rounded-full ${seller.status === "approved" ? "bg-emerald-500" : seller.status === "pending" ? "bg-amber-500" : "bg-red-500"}`} />
              <span className="text-xs font-medium text-emerald-700 capitalize">{seller.status}</span>
              <span className="text-xs text-emerald-600/60">• Member since {new Date(seller.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Store Info */}
        <div className="bg-background rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">Store Information</h2>
          <div><label className="block text-sm font-medium mb-1">Store Name</label><input type="text" required value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
          <div><label className="block text-sm font-medium mb-1">Logo URL</label><input type="url" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
        </div>

        {/* Contact Info */}
        <div className="bg-background rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1 flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email</label><input type="email" required value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1 flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone</label><input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-background rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Address</h2>
          <div><label className="block text-sm font-medium mb-1">Street</label><input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">City</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">State</label><input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Country</label><input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
            <div><label className="block text-sm font-medium mb-1">Postal Code</label><input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" /></div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 shadow-sm">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
