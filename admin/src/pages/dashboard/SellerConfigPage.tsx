import { useState, useEffect } from "react";
import { Sliders, Save, Loader2, AlertTriangle, Undo2, Store, Percent, Package, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Skeleton } from "../../components/ui/skeleton";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isEqual } from "lodash";

interface SellerConfig {
  sellerEnabled: boolean;
  defaultCommissionRate: number;
  minOrderAmount: number;
  allowSellerRegistration: boolean;
  requireApproval: boolean;
  maxProductsPerSeller: number;
}

export default function SellerConfigPage() {
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();
  const [config, setConfig] = useState<SellerConfig>({
    sellerEnabled: true,
    defaultCommissionRate: 15,
    minOrderAmount: 0,
    allowSellerRegistration: true,
    requireApproval: true,
    maxProductsPerSeller: 50,
  });
  const [originalConfig, setOriginalConfig] = useState<SellerConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/sellers/config");
      if (response.data?.data) {
        const data = response.data.data;
        const normalizedConfig = {
          sellerEnabled: data.sellerEnabled ?? true,
          defaultCommissionRate: data.defaultCommissionRate ?? 15,
          minOrderAmount: data.minOrderAmount ?? 0,
          allowSellerRegistration: data.allowSellerRegistration ?? true,
          requireApproval: data.requireApproval ?? true,
          maxProductsPerSeller: data.maxProductsPerSeller ?? 50,
        };
        setConfig(normalizedConfig);
        setOriginalConfig(normalizedConfig);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch seller configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosPrivate.put("/sellers/config", config);
      setOriginalConfig(config);
      toast({
        title: "Success",
        description: "Seller configuration saved successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save seller configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalConfig) {
      setConfig(originalConfig);
    }
  };

  const handleToggle = (key: keyof SellerConfig) => {
    if (saving) return;
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNumberChange = (key: keyof SellerConfig, value: string) => {
    if (saving) return;
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setConfig((prev) => ({
        ...prev,
        [key]: num,
      }));
    }
  };

  const hasChanges = !isEqual(config, originalConfig);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sliders className="text-indigo-600" size={32} />
            Seller Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage global marketplace settings and seller permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-indigo-600" />
              General Seller System
            </CardTitle>
            <CardDescription>
              Control the core multi-vendor functionality and registration flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border rounded-lg p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                    <Skeleton className="h-6 w-10 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* System Enabled */}
                <div className="rounded-lg border p-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Multi-Vendor System</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable the entire seller system globally.
                      </p>
                    </div>
                    <Switch
                      checked={config.sellerEnabled}
                      onCheckedChange={() => handleToggle("sellerEnabled")}
                      disabled={saving}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                  {!config.sellerEnabled && (
                    <Alert className="mt-4 bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800">Critical Warning</AlertTitle>
                      <AlertDescription className="text-red-700">
                        Disabling the multi-vendor system will hide all seller dashboards and stop processing seller products across the site.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Registration Enabled */}
                <div className="rounded-lg border p-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Public Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to register as sellers from the storefront.
                      </p>
                    </div>
                    <Switch
                      checked={config.allowSellerRegistration}
                      onCheckedChange={() => handleToggle("allowSellerRegistration")}
                      disabled={saving}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                </div>

                {/* Manual Approval */}
                <div className="rounded-lg border p-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">Require Manual Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        All new seller applications must be reviewed by an administrator.
                      </p>
                    </div>
                    <Switch
                      checked={config.requireApproval}
                      onCheckedChange={() => handleToggle("requireApproval")}
                      disabled={saving}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Financial & Limits
            </CardTitle>
            <CardDescription>
              Set commission rates, order minimums, and inventory constraints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Commission Rate */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-slate-400" />
                    Default Commission (%)
                  </Label>
                  <Input
                    type="number"
                    value={config.defaultCommissionRate}
                    onChange={(e) => handleNumberChange("defaultCommissionRate", e.target.value)}
                    min={0}
                    max={100}
                    disabled={saving}
                    className="focus-visible:ring-indigo-600"
                  />
                  <p className="text-[10px] text-muted-foreground">Standard fee taken by the platform per sale.</p>
                </div>

                {/* Max Products */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-400" />
                    Max Products Per Seller
                  </Label>
                  <Input
                    type="number"
                    value={config.maxProductsPerSeller}
                    onChange={(e) => handleNumberChange("maxProductsPerSeller", e.target.value)}
                    min={0}
                    disabled={saving}
                    className="focus-visible:ring-indigo-600"
                  />
                  <p className="text-[10px] text-muted-foreground">Inventory limit for individual seller accounts.</p>
                </div>

                {/* Min Order Amount */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-400" />
                    Min. Order Amount ($)
                  </Label>
                  <Input
                    type="number"
                    value={config.minOrderAmount}
                    onChange={(e) => handleNumberChange("minOrderAmount", e.target.value)}
                    min={0}
                    disabled={saving}
                    className="focus-visible:ring-indigo-600"
                  />
                  <p className="text-[10px] text-muted-foreground">Minimum subtotal required for a seller order.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!hasChanges || saving}
            className="flex-1 md:flex-none"
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1 md:flex-none min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
