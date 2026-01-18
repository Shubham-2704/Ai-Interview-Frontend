import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Lock, 
  Key, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Send, 
  Calendar,
  Eye,
  EyeOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  
  // ✅ Add states to show/hide passwords and Gemini API key
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    sendWelcomeEmail: true,
    geminiApiKey: "",
    notes: "",
    isActive: true,
    joinDate: new Date().toISOString().split("T")[0],
  });

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

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      toast.error("Password must contain an uppercase letter");
      return false;
    }
    
    if (!/(?=.*[a-z])/.test(formData.password)) {
      toast.error("Password must contain a lowercase letter");
      return false;
    }
    
    if (!/(?=.*\d)/.test(formData.password)) {
      toast.error("Password must contain a number");
      return false;
    }
    
    if (!/(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      toast.error("Password must contain a special character");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profileImageUrl: avatar || "",
        isActive: formData.isActive,
        sendWelcomeEmail: formData.sendWelcomeEmail,
        geminiApiKey: formData.geminiApiKey || "",
        notes: formData.notes || "",
        joinDate: formData.joinDate
      };

      console.log("Sending payload:", payload); // Debug log

      const response = await axiosInstance.post(
        API_PATHS.ADMIN.CREATE_USER,
        payload
      );

      console.log("API Response:", response.data); // Debug log

      // Check for success in different possible response structures
      const isSuccess = 
        response.status === 200 || 
        response.status === 201 ||
        (response.data && (response.data.success === true || response.data.status === "success"));

      if (isSuccess) {
        const successMessage = response.data?.message || 
                              response.data?.detail || 
                              "User created successfully!";
        
        toast.success(successMessage);

        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "user",
          sendWelcomeEmail: true,
          geminiApiKey: "",
          notes: "",
          isActive: true,
          joinDate: new Date().toISOString().split("T")[0],
        });
        setAvatar(null);
        setShowPassword(false); // ✅ Reset show password state
        setShowConfirmPassword(false); // ✅ Reset show confirm password state
        setShowGeminiKey(false); // ✅ Reset show key state

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      } else {
        const errorMsg = response.data?.message || 
                        response.data?.detail || 
                        response.data?.error || 
                        "Failed to create user";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("API Error:", error); // Debug log
      
      // Handle different error response formats
      let errorMessage = "Failed to create user";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = 
          error.response.data?.message ||
          error.response.data?.detail ||
          error.response.data?.error ||
          error.response.statusText ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response received from server";
      } else {
        // Something happened in setting up the request
        errorMessage = error.message || "Request setup failed";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const RoleBadge = ({ role }) => {
    const config = role === "admin" 
      ? { label: "Admin", color: "bg-red-100 text-red-800" }
      : { label: "User", color: "bg-blue-100 text-blue-800" };
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/dashboard")}
          disabled={loading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New User</h1>
          <p className="text-gray-500">Add a new user to the platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Basic information about the user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Image */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar} />
                    <AvatarFallback><User className="h-12 w-12" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                        <Upload className="h-4 w-4" /> Upload Profile Picture
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" /> Full Name *
                      </div>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" /> Email Address *
                      </div>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="john@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Fields with Eye Toggles */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      <div className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" /> Password *
                      </div>
                    </Label>
                    
                    {/* ✅ Password Input with Eye Toggle */}
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      
                      {/* ✅ Eye Toggle Button for Password */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        disabled={loading}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 cursor-pointer" />
                        ) : (
                          <Eye className="h-4 w-4 cursor-pointer" />
                        )}
                      </button>
                    </div>
                    
                    {formData.password && (
                      <div className="text-xs text-gray-500 space-y-1 mt-1">
                        <div className={`flex items-center ${formData.password.length >= 8 ? "text-green-600" : "text-red-600"}`}>
                          {formData.password.length >= 8 ? "✓" : "○"} At least 8 characters
                        </div>
                        <div className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? "text-green-600" : "text-red-600"}`}>
                          {/(?=.*[A-Z])/.test(formData.password) ? "✓" : "○"} Uppercase letter
                        </div>
                        <div className={`flex items-center ${/(?=.*[a-z])/.test(formData.password) ? "text-green-600" : "text-red-600"}`}>
                          {/(?=.*[a-z])/.test(formData.password) ? "✓" : "○"} Lowercase letter
                        </div>
                        <div className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? "text-green-600" : "text-red-600"}`}>
                          {/(?=.*\d)/.test(formData.password) ? "✓" : "○"} Number
                        </div>
                        <div className={`flex items-center ${/(?=.*[^A-Za-z0-9])/.test(formData.password) ? "text-green-600" : "text-red-600"}`}>
                          {/(?=.*[^A-Za-z0-9])/.test(formData.password) ? "✓" : "○"} Special character
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      <div className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" /> Confirm Password *
                      </div>
                    </Label>
                    
                    {/* ✅ Confirm Password Input with Eye Toggle */}
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="pr-10"
                      />
                      
                      {/* ✅ Eye Toggle Button for Confirm Password */}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        disabled={loading}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 cursor-pointer" />
                        ) : (
                          <Eye className="h-4 w-4 cursor-pointer" />
                        )}
                      </button>
                    </div>
                    
                    {formData.confirmPassword && (
                      <p className="text-xs text-gray-500 mt-1">
                        Re-enter the password to confirm
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Match Indicator */}
                {formData.password && formData.confirmPassword && (
                  <div
                    className={`p-3 rounded-lg ${
                      formData.password === formData.confirmPassword
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-green-600">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-red-600">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Join Date */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="joinDate">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" /> Join Date
                      </div>
                    </Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleChange("joinDate", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Permissions</CardTitle>
                <CardDescription>Set user role and access permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" /> User Role
                    </div>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" /> User - Can create and manage own sessions
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4 text-red-600" /> Admin - Full system access
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Switches */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Send Welcome Email</Label>
                      <p className="text-sm text-gray-500">
                        Send account creation notification to user
                      </p>
                    </div>
                    <Switch
                      checked={formData.sendWelcomeEmail}
                      onCheckedChange={(checked) =>
                        handleChange("sendWelcomeEmail", checked)
                      }
                      disabled={loading}
                    />
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
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Any additional information about this user..."
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* API Key Card */}
            <Card>
              <CardHeader>
                <CardTitle>Gemini API Key</CardTitle>
                <CardDescription>
                  Optional Gemini API configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="geminiApiKey">
                    <div className="flex items-center">
                      <Key className="mr-2 h-4 w-4" /> API Key (Optional)
                    </div>
                  </Label>
                  
                  {/* ✅ Gemini API Key Input with Eye Toggle */}
                  <div className="relative">
                    <Input
                      id="geminiApiKey"
                      type={showGeminiKey ? "text" : "password"}
                      value={formData.geminiApiKey}
                      onChange={(e) =>
                        handleChange("geminiApiKey", e.target.value)
                      }
                      placeholder="Enter Gemini API key"
                      disabled={loading}
                      className="pr-10"
                    />
                    
                    {/* ✅ Eye Toggle Button for Gemini API Key */}
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                      disabled={loading}
                      tabIndex={-1}
                    >
                      {showGeminiKey ? (
                        <EyeOff className="h-4 w-4 cursor-pointer" />
                      ) : (
                        <Eye className="h-4 w-4 cursor-pointer" />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.geminiApiKey 
                      ? "User will be able to generate AI content with this key"
                      : "Leave empty if you don't want to set an API key now"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <RoleBadge role={formData.role} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={formData.isActive ? "default" : "secondary"}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Key:</span>
                    <Badge variant={formData.geminiApiKey ? "default" : "secondary"}>
                      {formData.geminiApiKey ? "Set" : "Not Set"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating User...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Create User
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/admin/dashboard")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;