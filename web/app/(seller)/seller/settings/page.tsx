"use client";

import { useState, useEffect } from "react";
import { Settings, User, Lock, Bell, Shield, Save, Eye, EyeOff } from "lucide-react";
import { useUserStore } from "@/lib/store";
import { fetchWithConfig } from "@/lib/config";
import { toast } from "sonner";

export default function SellerSettingsPage() {
  const { authUser } = useUserStore();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (authUser) {
      setAccountForm({ name: authUser.name || "", email: authUser.email || "" });
    }
  }, [authUser]);

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetchWithConfig("/users/profile", { method: "PUT", body: JSON.stringify(accountForm) });
      toast.success("Account updated successfully");
    } catch (err: any) { toast.error(err.message || "Failed to update"); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await fetchWithConfig("/users/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) { toast.error(err.message || "Failed to change password"); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2"><Settings className="h-5 w-5 text-emerald-600" /> Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "account" && (
        <form onSubmit={handleAccountUpdate} className="space-y-5">
          <div className="bg-background rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Account Details</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" required value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input type="email" required value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
              <Shield className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">Your account role is <span className="font-semibold text-emerald-600">Seller</span>. Contact an administrator to change your role.</p>
            </div>
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      {activeTab === "security" && (
        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div className="bg-background rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Change Password</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-3 py-2 pr-10 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" required minLength={6} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input type="password" required minLength={6} value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-background" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50">
            <Lock className="h-4 w-4" /> {saving ? "Changing..." : "Change Password"}
          </button>
        </form>
      )}
    </div>
  );
}
