import React, { useEffect, useState } from "react";
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
  Settings as SettingsIcon,
  Server,
  Lock,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  User,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { API_PATHS } from "@/utils/apiPaths";

const Settings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "InterviewPrep Pro",
    siteDescription: "AI-powered interview preparation platform",
    siteUrl: "https://interviewprep.com",
    contactEmail: "support@interviewprep.com",
    timezone: "UTC",
    language: "en",
    theme: "light",

    // Session Settings
    maxSessionsPerUser: 1, // Default to 1 if not set
    numberOfQuestions: 10,

    // Resources Settings
    maxStudyMaterialsPerSession: 10,
    studyMaterialsRefreshHours: 24,

    // API Settings
    geminiApiKey: "",
    openaiApiKey: "",
    youtubeApiKey: "",
    tavilyApiKey: "",
    serperApiKey: "",

    // Storage Settings
    maxFileSize: 10,
    allowedFileTypes: ["jpg", "png", "pdf", "docx", "mp4", "mp3"],
    backupFrequency: "daily",
    storageProvider: "local",
    s3Bucket: "",
    s3Region: "",

    // Maintenance Settings
    maintenanceMode: false,
    allowedIPs: ["192.168.1.1", "10.0.0.1"],
    maintenanceMessage: "Site is under maintenance. Please check back later.",
    estimatedDowntime: "2 hours",

    // User Settings
    allowRegistration: true,
    requireInvitation: false,
    defaultUserRole: "user",
    maxUsers: 1000,

    // Performance Settings
    cacheEnabled: true,
    cacheDuration: 3600,
    cdnEnabled: false,
    cdnUrl: "",
    compressionEnabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKeys, setShowApiKeys] = useState({
    gemini: false,
    openai: false,
    youtube: false,
    tavily: false,
    serper: false,
  });
  const [tabsScrollPosition, setTabsScrollPosition] = useState(0);

  const [loadingSettings, setLoadingSettings] = useState(true);

  const handleSave = async (section) => {
    setSaving(true);
    try {
      if (section === "session") {
        console.log("Saving session settings:", settings);

        // Send all session settings to backend
        const response = await axiosInstance.put(API_PATHS.SETTINGS.UPDATE, {
          settings: {
            max_sessions_per_user: settings.maxSessionsPerUser,
            number_of_questions: settings.numberOfQuestions,
            load_more_questions: settings.loadMoreQuestions,
            max_load_more_clicks: settings.maxLoadMoreClicks,
          },
        });

        console.log("Save response:", response.data);

        setSaveStatus({ section, success: true });
        setTimeout(() => setSaveStatus(null), 3000);

        toast.success(`Session settings updated!`);
      }

      // ADD THIS NEW SECTION FOR RESOURCES
      else if (section === "resources") {
        console.log("Saving resources settings:", {
          maxStudyMaterials: settings.maxStudyMaterialsPerSession,
          refreshHours: settings.studyMaterialsRefreshHours,
        });

        // Send resources settings to backend
        const response = await axiosInstance.put(API_PATHS.SETTINGS.UPDATE, {
          settings: {
            max_study_materials_per_session:
              settings.maxStudyMaterialsPerSession,
            study_materials_refresh_hours: settings.studyMaterialsRefreshHours,
          },
        });

        console.log("Save response:", response.data);

        setSaveStatus({ section, success: true });
        setTimeout(() => setSaveStatus(null), 3000);

        toast.success("Resources settings updated successfully!");
      } else {
        // For other sections
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaveStatus({ section, success: true });
        setTimeout(() => setSaveStatus(null), 3000);
        toast.success("Settings saved!");
      }
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      setSaveStatus({ section, success: false });
      toast.error(error.response?.data?.detail || "Failed to save");
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

  const toggleApiKeyVisibility = (key) => {
    setShowApiKeys({
      ...showApiKeys,
      [key]: !showApiKeys[key],
    });
  };

  const addAllowedIP = () => {
    const newIP = prompt("Enter new IP address:");
    if (newIP && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(newIP)) {
      handleChange("allowedIPs", [...settings.allowedIPs, newIP]);
    } else {
      alert("Please enter a valid IP address");
    }
  };

  const loadSettingsFromDatabase = async () => {
    try {
      setLoadingSettings(true);
      console.log("Fetching settings from:", "/settings/");

      const response = await axiosInstance.get(API_PATHS.SETTINGS.GET);
      console.log("Settings API response:", response.data);

      if (response.data.success && response.data.settings) {
        const settingsData = response.data.settings;

        console.log("Setting resources settings:", {
          maxStudyMaterials: settingsData.max_study_materials_per_session,
          refreshHours: settingsData.study_materials_refresh_hours,
        });

        setSettings((prev) => ({
          ...prev,
          // Session settings
          maxSessionsPerUser: settingsData.max_sessions_per_user || 1,
          numberOfQuestions: settingsData.number_of_questions || 10,
          loadMoreQuestions: settingsData.load_more_questions || 5,
          maxLoadMoreClicks: settingsData.max_load_more_clicks || 3,
          // Resources settings (ONLY THESE TWO)
          maxStudyMaterialsPerSession:
            settingsData.max_study_materials_per_session || 10,
          studyMaterialsRefreshHours:
            settingsData.study_materials_refresh_hours || 24,
        }));
      } else {
        console.warn("No settings found in response, using default");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to load settings from server");
    } finally {
      setLoadingSettings(false);
    }
  };

  const removeAllowedIP = (index) => {
    const newIPs = [...settings.allowedIPs];
    newIPs.splice(index, 1);
    handleChange("allowedIPs", newIPs);
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
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="text-xs sm:text-sm">Saved successfully</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="text-xs sm:text-sm">Failed to save</span>
          </>
        )}
      </div>
    );
  };

  // Add this useEffect hook at the end of your component function (before the return statement)
  useEffect(() => {
    console.log("Settings component mounted, loading settings...");
    loadSettingsFromDatabase();
  }, []); // Empty dependency array = run once on mount

  const getTabIcon = (tab) => {
    switch (tab) {
      case "general":
        return (
          <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
        );
      case "session":
        return (
          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
        );
      case "resources":
        return (
          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
        );
      case "api":
        return <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />;
      case "storage":
        return (
          <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
        );
      case "maintenance":
        return (
          <Server className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
        );
      case "users":
        return <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />;
      case "performance":
        return (
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
        );
      default:
        return (
          <SettingsIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
        );
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: getTabIcon("general") },
    { id: "session", label: "Session", icon: getTabIcon("session") },
    {
      id: "resources",
      label: "Resources",
      icon: getTabIcon("resources"),
    },
    { id: "api", label: "API Keys", icon: getTabIcon("api") },
    { id: "storage", label: "Storage", icon: getTabIcon("storage") },
    {
      id: "maintenance",
      label: "Maintenance",
      icon: getTabIcon("maintenance"),
    },
    { id: "users", label: "Users", icon: getTabIcon("users") },
    {
      id: "performance",
      label: "Performance",
      icon: getTabIcon("performance"),
    },
  ];

  // Scroll tabs left/right
  const scrollTabs = (direction) => {
    const tabsContainer = document.querySelector(".tabs-scroll-container");
    if (tabsContainer) {
      const scrollAmount = 200;
      const newPosition =
        direction === "left"
          ? tabsScrollPosition - scrollAmount
          : tabsScrollPosition + scrollAmount;

      tabsContainer.scrollTo({ left: newPosition, behavior: "smooth" });
      setTabsScrollPosition(newPosition);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 xs:p-4 sm:p-6 max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
            Settings
          </h1>
          <p className="text-gray-500 text-sm sm:text-base truncate">
            Configure platform settings and preferences
          </p>
        </div>
      </div>

      {/* Tabs Navigation with Scroll Controls */}
      <div className="relative">
        <div className="flex items-center">
          {/* Scroll Left Button (mobile only) */}
          {/* <button
            onClick={() => scrollTabs("left")}
            className="lg:hidden mr-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 shrink-0"
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button> */}

          {/* Tabs Container */}
          <div className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="relative">
                <div className=" overflow-x-auto overflow-y-hidden">
                  <TabsList className="inline-flex w-auto min-w-full px-1 py-2">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="cursor-pointer text-xs sm:text-sm px-3 py-2 sm:px-4 whitespace-nowrap shrink-0 h-auto"
                      >
                        <div className="flex items-center">
                          {tab.icon}
                          <span className="truncate max-w-20 sm:max-w-none">
                            {tab.label}
                          </span>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>
              {/* General Settings Tab */}
              <TabsContent value="general" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      General Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Basic platform configuration and appearance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="siteName"
                          className="text-xs sm:text-sm"
                        >
                          Site Name
                        </Label>
                        <Input
                          id="siteName"
                          value={settings.siteName}
                          onChange={(e) =>
                            handleChange("siteName", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteUrl" className="text-xs sm:text-sm">
                          Site URL
                        </Label>
                        <Input
                          id="siteUrl"
                          value={settings.siteUrl}
                          onChange={(e) =>
                            handleChange("siteUrl", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="siteDescription"
                        className="text-xs sm:text-sm"
                      >
                        Site Description
                      </Label>
                      <Textarea
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) =>
                          handleChange("siteDescription", e.target.value)
                        }
                        rows={3}
                        className="text-sm"
                      />
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="contactEmail"
                          className="text-xs sm:text-sm"
                        >
                          Contact Email
                        </Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={settings.contactEmail}
                          onChange={(e) =>
                            handleChange("contactEmail", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="timezone"
                          className="text-xs sm:text-sm"
                        >
                          Timezone
                        </Label>
                        <Select
                          value={settings.timezone}
                          onValueChange={(value) =>
                            handleChange("timezone", value)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">
                              Eastern Time (EST)
                            </SelectItem>
                            <SelectItem value="PST">
                              Pacific Time (PST)
                            </SelectItem>
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

                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="language"
                          className="text-xs sm:text-sm"
                        >
                          Language
                        </Label>
                        <Select
                          value={settings.language}
                          onValueChange={(value) =>
                            handleChange("language", value)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="theme" className="text-xs sm:text-sm">
                          Theme
                        </Label>
                        <Select
                          value={settings.theme}
                          onValueChange={(value) =>
                            handleChange("theme", value)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                      <SaveStatus section="general" />
                      <Button
                        onClick={() => handleSave("general")}
                        disabled={saving}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                            <span className="text-xs sm:text-sm">
                              Saving...
                            </span>
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">
                              Save Changes
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Session Settings Tab */}
              <TabsContent value="session" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      Session Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Configure session limits and question generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    {loadingSettings ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 sm:space-y-4">
                          {/* Maximum Sessions Per User */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="maxSessionsPerUser"
                              className="text-xs sm:text-sm"
                            >
                              Maximum Sessions Per User
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="maxSessionsPerUser"
                                type="number"
                                value={settings.maxSessionsPerUser}
                                onChange={(e) =>
                                  handleChange(
                                    "maxSessionsPerUser",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                min={0}
                                max={100}
                                className="text-sm"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              sessions (0 = unlimited)
                            </p>
                          </div>

                          <Separator />

                          {/* Number of Questions Per Session */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="numberOfQuestions"
                              className="text-xs sm:text-sm"
                            >
                              Number of Questions Per Session
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="numberOfQuestions"
                                type="number"
                                value={settings.numberOfQuestions || 10}
                                onChange={(e) =>
                                  handleChange(
                                    "numberOfQuestions",
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                min={1}
                                max={50}
                                className="text-sm"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Number of questions to generate for each session
                              (1-50)
                            </p>
                          </div>

                          {/* LOAD MORE SETTINGS */}
                          <div className="space-y-4">
                            {/* Questions per Load More Click */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="loadMoreQuestions"
                                className="text-xs sm:text-sm"
                              >
                                Questions per "Load More" Click
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="loadMoreQuestions"
                                  type="number"
                                  value={settings.loadMoreQuestions || 5}
                                  onChange={(e) =>
                                    handleChange(
                                      "loadMoreQuestions",
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  min={1}
                                  max={20}
                                  className="text-sm"
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                How many questions to add when user clicks "Load
                                More"
                              </p>
                            </div>

                            {/* Maximum Load More Clicks */}
                            <div className="space-y-2">
                              <Label
                                htmlFor="maxLoadMoreClicks"
                                className="text-xs sm:text-sm"
                              >
                                Maximum "Load More" Clicks Allowed
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="maxLoadMoreClicks"
                                  type="number"
                                  value={settings.maxLoadMoreClicks || 3}
                                  onChange={(e) =>
                                    handleChange(
                                      "maxLoadMoreClicks",
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  min={0}
                                  max={10}
                                  className="text-sm"
                                />
                              </div>
                              <p className="text-xs text-gray-500">
                                Maximum times user can click "Load More" (0 =
                                disabled)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                          <SaveStatus section="session" />
                          <Button
                            onClick={() => handleSave("session")}
                            disabled={saving}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                                <span className="text-xs sm:text-sm">
                                  Saving...
                                </span>
                              </>
                            ) : (
                              <>
                                <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">
                                  Save changes
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Notifications Settings Tab */}
              <TabsContent value="resources" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      Study Materials & Resources Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Configure limits for study materials generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    {loadingSettings ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 sm:space-y-4">
                          {/* Maximum Study Materials Per Session */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="maxStudyMaterialsPerSession"
                              className="text-xs sm:text-sm"
                            >
                              Maximum Study Materials Per Session
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="maxStudyMaterialsPerSession"
                                type="number"
                                value={
                                  settings.maxStudyMaterialsPerSession || 10
                                }
                                onChange={(e) =>
                                  handleChange(
                                    "maxStudyMaterialsPerSession",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                min={0}
                                max={50}
                                className="text-sm"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Maximum number of study material packs a user can
                              generate per session (0 = unlimited)
                            </p>
                          </div>

                          <Separator />

                          {/* Study Materials Refresh Cooldown */}
                          <div className="space-y-2">
                            <Label
                              htmlFor="studyMaterialsRefreshHours"
                              className="text-xs sm:text-sm"
                            >
                              Study Materials Refresh Cooldown (Hours)
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="studyMaterialsRefreshHours"
                                type="number"
                                value={
                                  settings.studyMaterialsRefreshHours || 24
                                }
                                onChange={(e) =>
                                  handleChange(
                                    "studyMaterialsRefreshHours",
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                min={1}
                                max={168}
                                className="text-sm"
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              Hours before users can refresh/regenerate study
                              materials for the same question
                            </p>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                          <SaveStatus section="resources" />
                          <Button
                            onClick={() => handleSave("resources")}
                            disabled={saving}
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                                <span className="text-xs sm:text-sm">
                                  Saving...
                                </span>
                              </>
                            ) : (
                              <>
                                <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="text-xs sm:text-sm">
                                  Save changes
                                </span>
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              {/* API Keys Settings Tab */}
              <TabsContent value="api" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      API Keys Configuration
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Manage external API integrations and keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Gemini API Key */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="geminiApiKey"
                          className="text-xs sm:text-sm"
                        >
                          <div className="flex items-center">
                            <Key className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Gemini API Key
                          </div>
                        </Label>
                        <div className="relative">
                          <Input
                            id="geminiApiKey"
                            type={showApiKeys.gemini ? "text" : "password"}
                            value={settings.geminiApiKey}
                            onChange={(e) =>
                              handleChange("geminiApiKey", e.target.value)
                            }
                            placeholder="Enter your Gemini API key"
                            className="text-sm pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => toggleApiKeyVisibility("gemini")}
                          >
                            {showApiKeys.gemini ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Used for AI question generation and explanations
                        </p>
                      </div>

                      <Separator />

                      {/* OpenAI API Key */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="openaiApiKey"
                          className="text-xs sm:text-sm"
                        >
                          OpenAI API Key (Optional)
                        </Label>
                        <div className="relative">
                          <Input
                            id="openaiApiKey"
                            type={showApiKeys.openai ? "text" : "password"}
                            value={settings.openaiApiKey}
                            onChange={(e) =>
                              handleChange("openaiApiKey", e.target.value)
                            }
                            placeholder="Enter your OpenAI API key"
                            className="text-sm pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => toggleApiKeyVisibility("openai")}
                          >
                            {showApiKeys.openai ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* YouTube API Key */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="youtubeApiKey"
                          className="text-xs sm:text-sm"
                        >
                          YouTube API Key
                        </Label>
                        <div className="relative">
                          <Input
                            id="youtubeApiKey"
                            type={showApiKeys.youtube ? "text" : "password"}
                            value={settings.youtubeApiKey}
                            onChange={(e) =>
                              handleChange("youtubeApiKey", e.target.value)
                            }
                            placeholder="Enter your YouTube API key"
                            className="text-sm pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => toggleApiKeyVisibility("youtube")}
                          >
                            {showApiKeys.youtube ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Used for fetching video metadata and content
                        </p>
                      </div>

                      <Separator />

                      {/* Tavily API Key */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="tavilyApiKey"
                          className="text-xs sm:text-sm"
                        >
                          Tavily API Key
                        </Label>
                        <div className="relative">
                          <Input
                            id="tavilyApiKey"
                            type={showApiKeys.tavily ? "text" : "password"}
                            value={settings.tavilyApiKey}
                            onChange={(e) =>
                              handleChange("tavilyApiKey", e.target.value)
                            }
                            placeholder="Enter your Tavily API key"
                            className="text-sm pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => toggleApiKeyVisibility("tavily")}
                          >
                            {showApiKeys.tavily ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Used for web search and research functionality
                        </p>
                      </div>

                      <Separator />

                      {/* Serper API Key */}
                      <div className="space-y-2">
                        <Label
                          htmlFor="serperApiKey"
                          className="text-xs sm:text-sm"
                        >
                          Serper API Key (Optional)
                        </Label>
                        <div className="relative">
                          <Input
                            id="serperApiKey"
                            type={showApiKeys.serper ? "text" : "password"}
                            value={settings.serperApiKey}
                            onChange={(e) =>
                              handleChange("serperApiKey", e.target.value)
                            }
                            placeholder="Enter your Serper API key"
                            className="text-sm pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => toggleApiKeyVisibility("serper")}
                          >
                            {showApiKeys.serper ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Alternative search API for web content
                        </p>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-2 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium text-yellow-800 text-sm sm:text-base">
                            Important Security Notice
                          </h4>
                          <ul className="text-xs sm:text-sm text-yellow-700 mt-1 space-y-1">
                            <li>
                              • API keys are encrypted and stored securely
                            </li>
                            <li>• Never share your API keys publicly</li>
                            <li>• Rotate keys regularly for security</li>
                            <li>• Use environment variables in production</li>
                            <li>• Monitor API usage for anomalies</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          // Reset all API keys
                          handleChange("geminiApiKey", "");
                          handleChange("openaiApiKey", "");
                          handleChange("youtubeApiKey", "");
                          handleChange("tavilyApiKey", "");
                          handleChange("serperApiKey", "");
                        }}
                      >
                        <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Clear All Keys
                      </Button>
                      <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3">
                        <SaveStatus section="api" />
                        <Button
                          onClick={() => handleSave("api")}
                          disabled={saving}
                          size="sm"
                          className="w-full sm:w-auto"
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                              <span className="text-xs sm:text-sm">
                                Saving...
                              </span>
                            </>
                          ) : (
                            <>
                              <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">
                                Save Changes
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Storage Settings Tab */}
              <TabsContent value="storage" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      Storage Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Configure file storage, upload limits, and backup settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="maxFileSize"
                          className="text-xs sm:text-sm"
                        >
                          Max File Size (MB)
                        </Label>
                        <Input
                          id="maxFileSize"
                          type="number"
                          value={settings.maxFileSize}
                          onChange={(e) =>
                            handleChange(
                              "maxFileSize",
                              parseInt(e.target.value),
                            )
                          }
                          min={1}
                          max={100}
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Maximum size for user uploads (1-100 MB)
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm">
                          Allowed File Types
                        </Label>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {settings.allowedFileTypes.map((type, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs px-2 py-0.5"
                            >
                              .{type}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Supported file formats for uploads
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm">
                          Storage Provider
                        </Label>
                        <Select
                          value={settings.storageProvider}
                          onValueChange={(value) =>
                            handleChange("storageProvider", value)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local Storage</SelectItem>
                            <SelectItem value="s3">Amazon S3</SelectItem>
                            <SelectItem value="gcs">
                              Google Cloud Storage
                            </SelectItem>
                            <SelectItem value="azure">
                              Azure Blob Storage
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Where to store uploaded files
                        </p>
                      </div>

                      {settings.storageProvider === "s3" && (
                        <>
                          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label
                                htmlFor="s3Bucket"
                                className="text-xs sm:text-sm"
                              >
                                S3 Bucket Name
                              </Label>
                              <Input
                                id="s3Bucket"
                                value={settings.s3Bucket}
                                onChange={(e) =>
                                  handleChange("s3Bucket", e.target.value)
                                }
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label
                                htmlFor="s3Region"
                                className="text-xs sm:text-sm"
                              >
                                S3 Region
                              </Label>
                              <Input
                                id="s3Region"
                                value={settings.s3Region}
                                onChange={(e) =>
                                  handleChange("s3Region", e.target.value)
                                }
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm">
                          Backup Frequency
                        </Label>
                        <Select
                          value={settings.backupFrequency}
                          onValueChange={(value) =>
                            handleChange("backupFrequency", value)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="manual">Manual Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          How often to backup database and files
                        </p>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start">
                        <Database className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium text-green-800 text-sm sm:text-base">
                            Storage Tips
                          </h4>
                          <ul className="text-xs sm:text-sm text-green-700 mt-1 space-y-1">
                            <li>• Regular backups prevent data loss</li>
                            <li>• Cloud storage offers better scalability</li>
                            <li>• Monitor storage usage regularly</li>
                            <li>• Implement file retention policies</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                      <SaveStatus section="storage" />
                      <Button
                        onClick={() => handleSave("storage")}
                        disabled={saving}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                            <span className="text-xs sm:text-sm">
                              Saving...
                            </span>
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">
                              Save Changes
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Maintenance Settings Tab */}
              <TabsContent value="maintenance" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      Maintenance Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Configure system maintenance and access control
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-xs sm:text-sm">
                            Maintenance Mode
                          </Label>
                          <p className="text-xs text-gray-500">
                            Put the site in maintenance mode
                          </p>
                        </div>
                        <Switch
                          checked={settings.maintenanceMode}
                          onCheckedChange={(checked) =>
                            handleChange("maintenanceMode", checked)
                          }
                        />
                      </div>

                      {settings.maintenanceMode && (
                        <>
                          <Separator />

                          <div className="space-y-2">
                            <Label
                              htmlFor="maintenanceMessage"
                              className="text-xs sm:text-sm"
                            >
                              Maintenance Message
                            </Label>
                            <Textarea
                              id="maintenanceMessage"
                              value={settings.maintenanceMessage}
                              onChange={(e) =>
                                handleChange(
                                  "maintenanceMessage",
                                  e.target.value,
                                )
                              }
                              rows={3}
                              className="text-sm"
                            />
                            <p className="text-xs text-gray-500">
                              Message shown to users during maintenance
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="estimatedDowntime"
                              className="text-xs sm:text-sm"
                            >
                              Estimated Downtime
                            </Label>
                            <Input
                              id="estimatedDowntime"
                              value={settings.estimatedDowntime}
                              onChange={(e) =>
                                handleChange(
                                  "estimatedDowntime",
                                  e.target.value,
                                )
                              }
                              className="text-sm"
                            />
                            <p className="text-xs text-gray-500">
                              Estimated time for maintenance completion
                            </p>
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs sm:text-sm">
                            Allowed IP Addresses
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addAllowedIP}
                            className="h-6 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add IP
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {settings.allowedIPs.map((ip, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div className="flex items-center">
                                <Server className="h-3 w-3 mr-2 text-gray-400" />
                                <span className="text-sm font-mono">{ip}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:text-red-600"
                                onClick={() => removeAllowedIP(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          IP addresses allowed during maintenance mode
                        </p>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-800 text-sm sm:text-base">
                            Maintenance Best Practices
                          </h4>
                          <ul className="text-xs sm:text-sm text-blue-700 mt-1 space-y-1">
                            <li>
                              • Schedule maintenance during low-traffic hours
                            </li>
                            <li>• Notify users in advance</li>
                            <li>• Test changes in staging environment first</li>
                            <li>• Keep backup of current version</li>
                            <li>• Monitor system after maintenance</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                      <SaveStatus section="maintenance" />
                      <Button
                        onClick={() => handleSave("maintenance")}
                        disabled={saving}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                            <span className="text-xs sm:text-sm">
                              Saving...
                            </span>
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">
                              Save Changes
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* User Settings Tab */}
              <TabsContent value="users" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      User Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Configure user registration, roles, and limits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-xs sm:text-sm">
                            Allow Registration
                          </Label>
                          <p className="text-xs text-gray-500">
                            Allow new users to register accounts
                          </p>
                        </div>
                        <Switch
                          checked={settings.allowRegistration}
                          onCheckedChange={(checked) =>
                            handleChange("allowRegistration", checked)
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-xs sm:text-sm">
                            Require Invitation
                          </Label>
                          <p className="text-xs text-gray-500">
                            Require invitation code for registration
                          </p>
                        </div>
                        <Switch
                          checked={settings.requireInvitation}
                          onCheckedChange={(checked) =>
                            handleChange("requireInvitation", checked)
                          }
                        />
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label
                          htmlFor="defaultUserRole"
                          className="text-xs sm:text-sm"
                        >
                          Default User Role
                        </Label>
                        <Select
                          value={settings.defaultUserRole}
                          onValueChange={(value) =>
                            handleChange("defaultUserRole", value)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select default role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="premium">
                              Premium User
                            </SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Default role for newly registered users
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label
                          htmlFor="maxUsers"
                          className="text-xs sm:text-sm"
                        >
                          Maximum Users
                        </Label>
                        <Input
                          id="maxUsers"
                          type="number"
                          value={settings.maxUsers}
                          onChange={(e) =>
                            handleChange("maxUsers", parseInt(e.target.value))
                          }
                          min={1}
                          max={100000}
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Maximum number of users allowed (0 = unlimited)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                      <SaveStatus section="users" />
                      <Button
                        onClick={() => handleSave("users")}
                        disabled={saving}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                            <span className="text-xs sm:text-sm">
                              Saving...
                            </span>
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">
                              Save Changes
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Performance Settings Tab */}
              <TabsContent value="performance" className="space-y-4 mt-4">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">
                      Performance Settings
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Optimize platform performance and caching
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-xs sm:text-sm">
                            Enable Caching
                          </Label>
                          <p className="text-xs text-gray-500">
                            Cache responses for better performance
                          </p>
                        </div>
                        <Switch
                          checked={settings.cacheEnabled}
                          onCheckedChange={(checked) =>
                            handleChange("cacheEnabled", checked)
                          }
                        />
                      </div>

                      {settings.cacheEnabled && (
                        <>
                          <div className="space-y-2">
                            <Label
                              htmlFor="cacheDuration"
                              className="text-xs sm:text-sm"
                            >
                              Cache Duration (seconds)
                            </Label>
                            <Input
                              id="cacheDuration"
                              type="number"
                              value={settings.cacheDuration}
                              onChange={(e) =>
                                handleChange(
                                  "cacheDuration",
                                  parseInt(e.target.value),
                                )
                              }
                              min={60}
                              max={86400}
                              className="text-sm"
                            />
                            <p className="text-xs text-gray-500">
                              How long to cache responses (60-86400 seconds)
                            </p>
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-xs sm:text-sm">
                            Enable CDN
                          </Label>
                          <p className="text-xs text-gray-500">
                            Use Content Delivery Network for static assets
                          </p>
                        </div>
                        <Switch
                          checked={settings.cdnEnabled}
                          onCheckedChange={(checked) =>
                            handleChange("cdnEnabled", checked)
                          }
                        />
                      </div>

                      {settings.cdnEnabled && (
                        <div className="space-y-2">
                          <Label
                            htmlFor="cdnUrl"
                            className="text-xs sm:text-sm"
                          >
                            CDN URL
                          </Label>
                          <Input
                            id="cdnUrl"
                            value={settings.cdnUrl}
                            onChange={(e) =>
                              handleChange("cdnUrl", e.target.value)
                            }
                            placeholder="https://cdn.yourdomain.com"
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Base URL for CDN assets
                          </p>
                        </div>
                      )}

                      <Separator />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-xs sm:text-sm">
                            Enable Compression
                          </Label>
                          <p className="text-xs text-gray-500">
                            Compress responses for faster loading
                          </p>
                        </div>
                        <Switch
                          checked={settings.compressionEnabled}
                          onCheckedChange={(checked) =>
                            handleChange("compressionEnabled", checked)
                          }
                        />
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start">
                        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="font-medium text-purple-800 text-sm sm:text-base">
                            Performance Tips
                          </h4>
                          <ul className="text-xs sm:text-sm text-purple-700 mt-1 space-y-1">
                            <li>
                              • Enable caching for frequently accessed data
                            </li>
                            <li>• Use CDN for global content delivery</li>
                            <li>• Enable compression to reduce bandwidth</li>
                            <li>• Monitor performance metrics regularly</li>
                            <li>• Optimize database queries</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
                      <SaveStatus section="performance" />
                      <Button
                        onClick={() => handleSave("performance")}
                        disabled={saving}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                            <span className="text-xs sm:text-sm">
                              Saving...
                            </span>
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">
                              Save Changes
                            </span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Scroll Right Button (mobile only) */}
        {/* <button
          onClick={() => scrollTabs("right")}
          className="lg:hidden ml-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 shrink-0"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="h-4 w-4" />
        </button> */}
      </div>
    </div>
  );
};

export default Settings;

