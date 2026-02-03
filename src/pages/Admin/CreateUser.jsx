import React, { useState } from "react";
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
  Lock,
  Key,
  Shield,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  EyeOff,
  CalendarIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

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
    role: "",
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
        joinDate: formData.joinDate,
      };

      console.log("Sending payload:", payload); // Debug log

      const response = await axiosInstance.post(
        API_PATHS.ADMIN.CREATE_USER,
        payload,
      );

      console.log("API Response:", response.data); // Debug log

      // Check for success in different possible response structures
      const isSuccess =
        response.status === 200 ||
        response.status === 201 ||
        (response.data &&
          (response.data.success === true ||
            response.data.status === "success"));

      if (isSuccess) {
        const successMessage =
          response.data?.message ||
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
        const errorMsg =
          response.data?.message ||
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
    const config =
      role === "admin"
        ? {
            label: "Admin",
            color: "bg-red-100 text-red-800 text-xs sm:text-sm",
          }
        : {
            label: "User",
            color: "bg-blue-100 text-blue-800 text-xs sm:text-sm",
          };

    return (
      <Badge className={config.color}>
        <span className="truncate">{config.label}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="relative flex items-center min-h-12">
        {/* LEFT: Back button */}
        <div className="absolute left-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
            disabled={loading}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden md:inline">Back </span>
          </Button>
        </div>

        {/* CENTER: Title */}
        <div className="mx-auto text-center min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
            Create New User
          </h1>
          <p className="text-gray-500 text-sm sm:text-base hidden md:block truncate">
            Add a new user to the platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left Column - Profile & Role */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Profile Information
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Basic information about the user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-0">
                {/* Profile Image */}
                <div className="flex flex-col xs:flex-row items-center xs:items-center space-y-4 xs:space-y-0 xs:space-x-4 sm:space-x-6">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 shrink-0">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>
                      <User className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="w-full xs:w-auto">
                    <Label
                      htmlFor="avatar-upload"
                      className="cursor-pointer w-full"
                    >
                      <div className="flex items-center justify-center xs:justify-start space-x-2 p-2 border rounded-lg hover:bg-gray-50 w-full xs:w-auto">
                        <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">
                          Upload Profile Picture
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
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm sm:text-base">
                      <div className="flex items-center">
                        <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Full
                        Name *
                      </div>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      required
                      disabled={loading}
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Email
                        Address *
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
                      className="h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Password Fields with Eye Toggles */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm sm:text-base">
                      <div className="flex items-center">
                        <Lock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Password
                        *
                      </div>
                    </Label>

                    {/* ✅ Password Input with Eye Toggle */}
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="h-9 sm:h-10 text-sm sm:text-base pr-10"
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
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer" />
                        ) : (
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer" />
                        )}
                      </button>
                    </div>

                    {formData.password && (
                      <div className="text-xs text-gray-500 space-y-1 mt-1">
                        <div
                          className={`flex items-center ${formData.password.length >= 8 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formData.password.length >= 8 ? "✓" : "○"} At least 8
                          characters
                        </div>
                        <div
                          className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? "text-green-600" : "text-red-600"}`}
                        >
                          {/(?=.*[A-Z])/.test(formData.password) ? "✓" : "○"}{" "}
                          Uppercase letter
                        </div>
                        <div
                          className={`flex items-center ${/(?=.*[a-z])/.test(formData.password) ? "text-green-600" : "text-red-600"}`}
                        >
                          {/(?=.*[a-z])/.test(formData.password) ? "✓" : "○"}{" "}
                          Lowercase letter
                        </div>
                        <div
                          className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? "text-green-600" : "text-red-600"}`}
                        >
                          {/(?=.*\d)/.test(formData.password) ? "✓" : "○"}{" "}
                          Number
                        </div>
                        <div
                          className={`flex items-center ${/(?=.*[^A-Za-z0-9])/.test(formData.password) ? "text-green-600" : "text-red-600"}`}
                        >
                          {/(?=.*[^A-Za-z0-9])/.test(formData.password)
                            ? "✓"
                            : "○"}{" "}
                          Special character
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm sm:text-base"
                    >
                      <div className="flex items-center">
                        <Lock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Confirm
                        Password *
                      </div>
                    </Label>

                    {/* ✅ Confirm Password Input with Eye Toggle */}
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleChange("confirmPassword", e.target.value)
                        }
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        className="h-9 sm:h-10 text-sm sm:text-base pr-10"
                      />

                      {/* ✅ Eye Toggle Button for Confirm Password */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                        disabled={loading}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer" />
                        ) : (
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer" />
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
                    className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${
                      formData.password === formData.confirmPassword
                        ? "bg-green-50"
                        : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center">
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-2" />
                          <span className="text-green-600 truncate">
                            Passwords match
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 mr-2" />
                          <span className="text-red-600 truncate">
                            Passwords do not match
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Join Date */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="joinDate" className="text-sm sm:text-base">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Join Date
                      </div>
                    </Label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={loading}
                          className="h-9 sm:h-10 w-full justify-start text-left text-sm sm:text-base font-normal"
                        >
                          {formData.joinDate ? (
                            format(new Date(formData.joinDate), "PPP")
                          ) : (
                            <span className="text-muted-foreground">
                              Pick a date
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            formData.joinDate
                              ? new Date(formData.joinDate)
                              : undefined
                          }
                          onSelect={(date) =>
                            handleChange(
                              "joinDate",
                              date ? format(date, "yyyy-MM-dd") : "",
                            )
                          }
                          disabled={loading}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Role & Permissions
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Set user role and access permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-0">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm sm:text-base">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> User
                      Role
                    </div>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange("role", value)}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base cursor-pointer w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user" className="text-sm">
                        <div className="flex items-center">
                          <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <div className="min-w-0">
                            <div className="font-medium truncate cursor-pointer">
                              User
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="text-sm">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          <div className="min-w-0">
                            <div className="font-medium truncate cursor-pointer">
                              Admin
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Switches */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-4">
                      <Label className="text-sm sm:text-base truncate">
                        Send Welcome Email
                      </Label>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        Send account creation notification to user
                      </p>
                    </div>
                    <Switch
                      checked={formData.sendWelcomeEmail}
                      onCheckedChange={(checked) =>
                        handleChange("sendWelcomeEmail", checked)
                      }
                      disabled={loading}
                      className="shrink-0"
                    />
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
                      disabled={loading}
                      className="shrink-0"
                    />
                  </div>
                </div>

                {/* Notes */}
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
                    disabled={loading}
                    className="text-sm sm:text-base min-h-20"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - API Key & Preview */}
          <div className="space-y-4 sm:space-y-6">
            {/* API Key Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Gemini API Key
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Optional Gemini API configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Label
                    htmlFor="geminiApiKey"
                    className="text-sm sm:text-base"
                  >
                    <div className="flex items-center">
                      <Key className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> API Key
                      (Optional)
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
                      className="h-9 sm:h-10 text-sm sm:text-base pr-10"
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
                        <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer" />
                      ) : (
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer" />
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
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  User Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                <div className="flex items-center space-x-3">
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
                    <RoleBadge role={formData.role} />
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
                      variant={formData.geminiApiKey ? "default" : "secondary"}
                      className="text-xs sm:text-sm"
                    >
                      <span className="truncate">
                        {formData.geminiApiKey ? "Set" : "Not Set"}
                      </span>
                    </Badge>
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
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                      <span className="text-xs sm:text-sm">
                        Creating User...
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Create User</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 sm:h-11 md:h-12 text-xs sm:text-sm"
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
