import React, { useState } from "react";
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
  Lock,
  Key,
  Shield,
  CheckCircle,
  XCircle,
  Send,
  Calendar,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
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
    experience: "beginner",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
      }

      // Prepare payload
      const payload = {
        ...formData,
        profileImageUrl: avatar,
      };

      // API call would go here
      console.log("Creating user:", payload);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success - navigate back to dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
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

  const RoleBadge = ({ role }) => {
    const roleConfig = {
      admin: { label: "Admin", color: "bg-red-100 text-red-800" },
      user: { label: "User", color: "bg-blue-100 text-blue-800" },
      moderator: { label: "Moderator", color: "bg-purple-100 text-purple-800" },
    };

    const config = roleConfig[role] || roleConfig.user;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const ExperienceBadge = ({ experience }) => {
    const expConfig = {
      beginner: { label: "Beginner", color: "bg-green-100 text-green-800" },
      intermediate: {
        label: "Intermediate",
        color: "bg-yellow-100 text-yellow-800",
      },
      advanced: { label: "Advanced", color: "bg-red-100 text-red-800" },
      expert: { label: "Expert", color: "bg-purple-100 text-purple-800" },
    };

    const config = expConfig[experience] || expConfig.beginner;

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New User</h1>
            <p className="text-gray-500">Add a new user to the platform</p>
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
                <CardDescription>
                  Basic information about the user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div>
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                        <Upload className="h-4 w-4" />
                        <span>Upload Profile Picture</span>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      <div className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        Password *
                      </div>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      <div className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        Confirm Password *
                      </div>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

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
                          <span className="text-green-600">
                            Passwords match
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600 mr-2" />
                          <span className="text-red-600">
                            Passwords do not match
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="experience">
                      <div className="flex items-center">
                        <Activity className="mr-2 h-4 w-4" />
                        Experience Level
                      </div>
                    </Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) =>
                        handleChange("experience", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">
                          Beginner (0-2 years)
                        </SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate (2-5 years)
                        </SelectItem>
                        <SelectItem value="advanced">
                          Advanced (5-8 years)
                        </SelectItem>
                        <SelectItem value="expert">
                          Expert (8+ years)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joinDate">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Join Date
                      </div>
                    </Label>
                    <Input
                      id="joinDate"
                      type="date"
                      value={formData.joinDate}
                      onChange={(e) => handleChange("joinDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Permissions</CardTitle>
                <CardDescription>
                  Set user role and access permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    <div className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      User Role
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
                      <SelectItem value="user">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          User - Can create and manage own sessions
                        </div>
                      </SelectItem>
                      <SelectItem value="moderator">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Moderator - Can manage user content
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="mr-2 h-4 w-4 text-red-600" />
                          Admin - Full system access
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    />
                  </div>
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
          </div>

          {/* Right Column - API Key & Actions */}
          <div className="space-y-6">
            {/* API Key Card */}
            <Card>
              <CardHeader>
                <CardTitle>Gemini API Key</CardTitle>
                <CardDescription>
                  Optional Gemini API configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="geminiApiKey">
                    <div className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      API Key (Optional)
                    </div>
                  </Label>
                  <Input
                    id="geminiApiKey"
                    type="password"
                    value={formData.geminiApiKey}
                    onChange={(e) =>
                      handleChange("geminiApiKey", e.target.value)
                    }
                    placeholder="Enter Gemini API key"
                  />
                  <p className="text-sm text-gray-500">
                    User will be able to generate AI content with this key
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Preview</CardTitle>
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
                      <RoleBadge role={formData.role} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <ExperienceBadge experience={formData.experience} />
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Welcome Email:</span>
                      <Badge
                        variant={
                          formData.sendWelcomeEmail ? "default" : "secondary"
                        }
                      >
                        {formData.sendWelcomeEmail ? "Yes" : "No"}
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating User...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Create User
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
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>System overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-medium">1,254</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Today:</span>
                    <span className="font-medium">243</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">New This Week:</span>
                    <span className="font-medium">187</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Sessions/User:</span>
                    <span className="font-medium">24</span>
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

export default CreateUser;
