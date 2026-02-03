import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
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
        API_PATHS.ADMIN.USER_DETAILS(userId),
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
      await axiosInstance.put(API_PATHS.ADMIN.UPDATE_USER(userId), payload);
      toast.success("User updated successfully!");
      navigate(`/admin/users/${userId}`);
    } catch (error) {
      console.error("Error updating user:", error);

      let errorMessage = "Failed to update user";
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage =
            error.response.data?.message || "Invalid data provided";
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
          "Failed to delete user",
      );
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
      {/* ✅ Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg rounded-lg">
          <AlertDialogHeader className="space-y-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
              <AlertDialogTitle className="text-base sm:text-xl">
                Delete User
              </AlertDialogTitle>
            </div>

            {/* IMPORTANT: asChild FIX */}
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-left">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {formData.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {formData.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {formData.email}
                    </p>
                  </div>
                </div>

                {/* Warning text */}
                <p className="text-sm sm:text-base font-medium text-red-600">
                  This action cannot be undone. This will permanently delete:
                </p>

                {/* LEFT-ALIGNED LIST (mobile safe) */}
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>User account and profile</li>
                  <li>All interview sessions</li>
                  <li>All questions and answers</li>
                  <li>All study materials</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Footer */}
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="h-9 sm:h-10 text-sm">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteUser}
              className="h-9 sm:h-10 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="relative flex items-center">
        {/* Left: Back button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/users/${userId}`)}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Back
          </Button>
        </div>

        {/* Center: Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
            Edit User
          </h1>
          <p className="text-gray-500 text-sm sm:text-base truncate hidden md:block">
            Update user information
          </p>
        </div>

        {/* Right: Spacer */}
        <div className="ml-auto w-[72px] sm:w-24" />
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left Column - Profile & Basic Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Profile Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Update basic user information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-0">
                <div className="flex flex-col xs:flex-row items-center xs:items-center space-y-4 xs:space-y-0 xs:space-x-4 sm:space-x-6">
                  <div className="shrink-0">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-lg sm:text-xl">
                        {formData.name ? (
                          formData.name.charAt(0).toUpperCase()
                        ) : (
                          <User className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 w-full xs:w-auto">
                    <Label
                      htmlFor="avatar-upload"
                      className="cursor-pointer w-full"
                    >
                      <div className="flex items-center justify-center xs:justify-start space-x-2 p-2 border rounded-lg hover:bg-gray-50 w-full">
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm truncate">
                          Change Profile Picture
                        </span>
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center xs:text-left">
                      Recommended: Square image, 400x400px or larger
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">
                      <div className="flex items-center">
                        <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Full Name *
                      </div>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      required
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Status Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Role & Status
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Set user role and account status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm sm:text-base">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      User Role *
                    </div>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                  >
                    <SelectTrigger className="h-9 w-full sm:h-10 text-sm sm:text-base">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user" className="text-sm">
                        User
                      </SelectItem>
                      <SelectItem value="admin" className="text-sm">
                        Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-4">
                    <Label className="text-sm sm:text-base truncate">
                      Account Active
                    </Label>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      User can login immediately
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      handleChange("isActive", checked)
                    }
                    className="shrink-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm sm:text-base">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any additional information about this user..."
                    rows={3}
                    className="text-sm sm:text-base min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gemini API Key Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Gemini API Configuration
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage Gemini API key for this user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                <div className="space-y-2">
                  <Label
                    htmlFor="geminiApiKey"
                    className="flex items-center text-sm sm:text-base"
                  >
                    <Key className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
                      className="h-9 sm:h-10 text-sm sm:text-base pr-10"
                    />

                    {/* Show / Hide Button INSIDE input */}
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showGeminiKey ? (
                        <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer" />
                      ) : (
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-500">
                    {formData.geminiApiKey
                      ? "Note: Updating will replace the existing key"
                      : "User will be able to generate AI content with this key"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview & Actions */}
          <div className="space-y-4 sm:space-y-6">
            {/* Preview Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Preview Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-xs sm:text-sm">
                        {formData.name
                          ? formData.name.charAt(0).toUpperCase()
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm sm:text-base truncate">
                        {formData.name || "No name provided"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">
                        {formData.email || "No email provided"}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base truncate mr-2">
                        Role:
                      </span>
                      <Badge
                        className={`text-xs sm:text-sm ${
                          formData.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : formData.role === "moderator"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <span className="truncate">
                          {formData.role?.toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base truncate mr-2">
                        Status:
                      </span>
                      <Badge
                        variant={formData.isActive ? "default" : "secondary"}
                        className="text-xs sm:text-sm"
                      >
                        <span className="truncate">
                          {formData.isActive ? "Active" : "Inactive"}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base truncate mr-2">
                        API Key:
                      </span>
                      <Badge
                        variant={
                          formData.geminiApiKey ? "default" : "secondary"
                        }
                        className="text-xs sm:text-sm"
                      >
                        <span className="truncate">
                          {formData.geminiApiKey ? "Set" : "Not Set"}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="w-full">
              <CardContent className="space-y-3 sm:space-y-4">
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 md:h-12"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="text-xs sm:text-sm">
                        Saving Changes...
                      </span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Save Changes</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 sm:h-11 md:h-12 text-xs sm:text-sm"
                  onClick={() => navigate(`/admin/users/${userId}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Separator />

                <div className="text-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete User Account
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    This will permanently delete the user and all their data
                  </p>
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
