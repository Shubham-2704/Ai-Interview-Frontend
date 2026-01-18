import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Upload,
  User,
  Mail,
  Shield,
  Save,
  Calendar,
  Key,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

// ✅ Import shadcn dialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    isActive: true,
    geminiApiKey: "",
    notes: "",
    experience: "beginner",
  });
  
  // ✅ State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    console.log("EditUser mounted with userId:", userId);
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    console.log("Fetching user data for ID:", userId);
    setFetching(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USER_DETAILS(userId)
      );
      console.log("User data response:", response.data);

      const userData = response.data?.user;

      if (userData) {
        console.log("Setting form data:", userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role || "user",
          isActive: userData.isActive !== false,
          geminiApiKey: userData.geminiApiKey || "",
          notes: userData.notes || "",
          experience: userData.experience || "beginner",
        });

        if (userData.profileImageUrl) {
          setAvatar(userData.profileImageUrl);
        }
      } else {
        toast.error("User data not found");
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.response?.data?.detail || "Failed to load user data");
      navigate("/admin/users");
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        geminiApiKey: formData.geminiApiKey,
        notes: formData.notes,
        experience: formData.experience,
      };

      // Add profile image if it's a new base64 image
      if (avatar && avatar.startsWith("data:image")) {
        payload.profileImageUrl = avatar;
      } else if (avatar && !avatar.startsWith("data:image")) {
        // Keep existing URL
        payload.profileImageUrl = avatar;
      }

      console.log("Sending update payload:", payload);

      // Make the API call
      await axiosInstance.put(
        API_PATHS.ADMIN.UPDATE_USER(userId),
        payload
      );
      toast.success("User updated successfully!");
      navigate(`/admin/users/${userId}`);
    } catch (error) {
      console.error("Error updating user:", error);

      let errorMessage = "Failed to update user";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Invalid data provided";
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
          navigate("/login");
        } else if (error.response.status === 403) {
          errorMessage = "Admin access required";
        } else if (error.response.status === 404) {
          errorMessage = "User not found";
        } else {
          errorMessage =
            error.response.data?.message || `Error ${error.response.status}`;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDeleteUser = async () => {
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_USER(userId));
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      navigate("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to delete user"
      );
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ✅ Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <AlertDialogTitle>Delete User</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>
                    {formData.name ? formData.name.charAt(0) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{formData.name}</p>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                </div>
              </div>
              <p className="mt-4 text-red-600 font-medium">
                This action cannot be undone. This will permanently delete:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
                <li>User account and profile</li>
                <li>All interview sessions</li>
                <li>All questions and answers</li>
                <li>All study materials</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/users/${userId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User Details
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit User</h1>
            <p className="text-gray-500">Update user information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile & Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update basic user information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div>
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>
                        {formData.name ? (
                          formData.name.charAt(0)
                        ) : (
                          <User className="h-12 w-12" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                        <Upload className="h-4 w-4" />
                        <span>Change Profile Picture</span>
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: Square image, 400x400px or larger
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Full Name *
                      </div>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Address *
                      </div>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Status</CardTitle>
                <CardDescription>
                  Set user role and account status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      User Role *
                    </div>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Account Active</Label>
                    <p className="text-sm text-gray-500">
                      User can login immediately
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleChange("isActive", checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any additional information about this user..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gemini API Key Card */}
            <Card>
              <CardHeader>
                <CardTitle>Gemini API Configuration</CardTitle>
                <CardDescription>
                  Manage Gemini API key for this user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="geminiApiKey" className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    Gemini API Key
                    </Label>

                    <div className="relative">
                    <Input
                        id="geminiApiKey"
                        type={showGeminiKey ? "text" : "password"}
                        value={formData.geminiApiKey}
                        onChange={(e) =>
                        handleChange("geminiApiKey", e.target.value)
                        }
                        placeholder="Enter or update Gemini API key"
                        className="pr-10"
                    />

                    {/* Show / Hide Button INSIDE input */}
                    <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                    >
                        {showGeminiKey ? (
                        <EyeOff className="h-4 w-4 cursor-pointer" />
                        ) : (
                        <Eye className="h-4 w-4 cursor-pointer" />
                        )}
                    </button>
                    </div>

                    <p className="text-sm text-gray-500">
                    {formData.geminiApiKey
                        ? "Note: Updating will replace the existing key"
                        : "User will be able to generate AI content with this key"}
                    </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Preview Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={avatar} />
                      <AvatarFallback>
                        {formData.name ? formData.name.charAt(0) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {formData.name || "No name provided"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formData.email || "No email provided"}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <Badge
                        className={
                          formData.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : formData.role === "moderator"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {formData.role?.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge
                        variant={formData.isActive ? "default" : "secondary"}
                      >
                        {formData.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">API Key:</span>
                      <Badge
                        variant={
                          formData.geminiApiKey ? "default" : "secondary"
                        }
                      >
                        {formData.geminiApiKey ? "Set" : "Not Set"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/admin/users/${userId}`)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>

                  <Separator />

                  <div className="text-center">
                    {/* ✅ Updated Delete Button - NO AlertDialogTrigger needed */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete User Account
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      This will permanently delete the user and all their data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUser;