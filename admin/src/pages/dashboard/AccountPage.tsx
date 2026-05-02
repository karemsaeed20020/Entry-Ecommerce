import { useState, useEffect } from "react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useToast } from "../../hooks/use-toast";
import useAuthStore from "../../store/useAuthStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  User, 
  Lock, 
  Shield, 
  Mail, 
  Camera, 
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function AccountPage() {
  const { user, setUser } = useAuthStore();
  const axiosPrivate = useAxiosPrivate();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setLoading(true);
    try {
      const response = await axiosPrivate.put(`/users/${user._id}`, profileData);
      if (response.data) {
        setUser(response.data);
        toast({
          title: "Profile Updated",
          description: "Your account information has been successfully updated.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Mismatch",
        description: "New password and confirmation do not match.",
      });
      return;
    }

    setLoading(true);
    try {
      await axiosPrivate.put(`/users/${user._id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to change password",
        description: error.response?.data?.message || "Incorrect current password",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "AU";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile and security preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />
            <CardContent className="pt-0 -mt-12 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 overflow-hidden shadow-md">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <div className="mt-6 w-full pt-6 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500 flex items-center gap-2"><Shield className="w-4 h-4" /> Role</span>
                  <span className="font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs uppercase tracking-wider">{user?.role}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Tabbed Forms */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100/50 p-1">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <User className="w-4 h-4 mr-2" /> Profile
              </TabsTrigger>
              <TabsTrigger value="password" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
                <Lock className="w-4 h-4 mr-2" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your name and contact details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          className="pl-10"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          type="email"
                          className="pl-10"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 gap-2">
                        {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Ensure your account stays secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Password</label>
                      <Input 
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <Input 
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input 
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      />
                    </div>
                    {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                      </p>
                    )}
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={loading || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword} 
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 gap-2"
                      >
                        {loading ? "Updating..." : <><Lock className="w-4 h-4" /> Update Password</>}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
