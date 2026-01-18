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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Globe,
  Mail,
  Shield,
  Bell,
  Database,
  Key,
  Users,
  FileText,
  Cloud,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "InterviewPrep Pro",
    siteDescription: "AI-powered interview preparation platform",
    siteUrl: "https://interviewprep.com",
    contactEmail: "support@interviewprep.com",
    timezone: "UTC",
    language: "en",

    // Security Settings
    requireEmailVerification: true,
    enable2FA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    marketingEmails: false,

    // API Settings
    geminiApiKey: "",
    openaiApiKey: "",
    youtubeApiKey: "",
    tavilyApiKey: "",

    // Storage Settings
    maxFileSize: 10,
    allowedFileTypes: ["jpg", "png", "pdf", "docx"],
    backupFrequency: "daily",

    // Maintenance Settings
    maintenanceMode: false,
    allowedIPs: ["192.168.1.1", "10.0.0.1"],
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async (section) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus({ section, success: true });
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ section, success: false });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const SaveStatus = ({ section }) => {
    if (!saveStatus || saveStatus.section !== section) return null;

    return (
      <div
        className={`flex items-center ${
          saveStatus.success ? "text-green-600" : "text-red-600"
        }`}
      >
        {saveStatus.success ? (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">Saved successfully</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-sm">Failed to save</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Configure platform settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Globe className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Database className="mr-2 h-4 w-4" />
            Storage
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Cloud className="mr-2 h-4 w-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleChange("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => handleChange("siteUrl", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    handleChange("siteDescription", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) =>
                      handleChange("contactEmail", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => handleChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                      <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      <SelectItem value="CET">
                        Central European Time (CET)
                      </SelectItem>
                      <SelectItem value="IST">
                        Indian Standard Time (IST)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Language</Label>
                  <p className="text-sm text-gray-500">
                    Default platform language
                  </p>
                </div>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleChange("language", value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <SaveStatus section="general" />
                <Button onClick={() => handleSave("general")} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Verification</Label>
                    <p className="text-sm text-gray-500">
                      Require users to verify their email address
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      handleChange("requireEmailVerification", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">
                      Enable 2FA for admin accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.enable2FA}
                    onCheckedChange={(checked) =>
                      handleChange("enable2FA", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      handleChange("sessionTimeout", parseInt(e.target.value))
                    }
                    min={5}
                    max={1440}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) =>
                      handleChange("maxLoginAttempts", parseInt(e.target.value))
                    }
                    min={1}
                    max={20}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <SaveStatus section="security" />
                <Button
                  onClick={() => handleSave("security")}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Settings */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys Configuration</CardTitle>
              <CardDescription>
                Manage external API integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="geminiApiKey">
                    <div className="flex items-center">
                      <Key className="mr-2 h-4 w-4" />
                      Gemini API Key
                    </div>
                  </Label>
                  <Input
                    id="geminiApiKey"
                    type="password"
                    value={settings.geminiApiKey}
                    onChange={(e) =>
                      handleChange("geminiApiKey", e.target.value)
                    }
                    placeholder="Enter your Gemini API key"
                  />
                  <p className="text-sm text-gray-500">
                    Used for AI question generation and explanations
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">
                    OpenAI API Key (Optional)
                  </Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) =>
                      handleChange("openaiApiKey", e.target.value)
                    }
                    placeholder="Enter your OpenAI API key"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="youtubeApiKey">YouTube API Key</Label>
                  <Input
                    id="youtubeApiKey"
                    type="password"
                    value={settings.youtubeApiKey}
                    onChange={(e) =>
                      handleChange("youtubeApiKey", e.target.value)
                    }
                    placeholder="Enter your YouTube API key"
                  />
                  <p className="text-sm text-gray-500">
                    Used for fetching video metadata
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="tavilyApiKey">Tavily API Key</Label>
                  <Input
                    id="tavilyApiKey"
                    type="password"
                    value={settings.tavilyApiKey}
                    onChange={(e) =>
                      handleChange("tavilyApiKey", e.target.value)
                    }
                    placeholder="Enter your Tavily API key"
                  />
                  <p className="text-sm text-gray-500">
                    Used for web search functionality
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Important</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      API keys are encrypted and stored securely. Never share
                      your API keys publicly. Rotate keys regularly for
                      security.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <SaveStatus section="api" />
                <Button onClick={() => handleSave("api")} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>
                Configure file storage and upload limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.maxFileSize}
                    onChange={(e) =>
                      handleChange("maxFileSize", parseInt(e.target.value))
                    }
                    min={1}
                    max={100}
                  />
                  <p className="text-sm text-gray-500">
                    Maximum size for user uploads
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Allowed File Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.allowedFileTypes.map((type, index) => (
                      <Badge key={index} variant="secondary">
                        .{type}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Supported file formats for uploads
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) =>
                      handleChange("backupFrequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    How often to backup database
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <SaveStatus section="storage" />
                <Button onClick={() => handleSave("storage")} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
