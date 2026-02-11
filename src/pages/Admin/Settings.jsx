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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  Globe,
  Key,
  FileText,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon,
  RefreshCw,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "sonner";
import { API_PATHS } from "@/utils/apiPaths";

const Settings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    sendWelcomeEmail: true,
    allowRegistration: true,
    maxPasswordResetAttempts: 3,
    passwordResetBlockDurationHours: 1,
    passwordResetOtpExpiryMinutes: 5,

    // Session Settings
    maxSessionsPerUser: 1, // Default to 1 if not set
    numberOfQuestions: 10,

    // Resources Settings
    maxStudyMaterialsPerSession: 10,
    studyMaterialsRefreshHours: 24,

    // API Settings
    geminiApiKey: "",
    tavilyApiKey: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKeys, setShowApiKeys] = useState({
    gemini: false,
    tavily: false,
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [tavilyUsage, setTavilyUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const handleSave = async (section) => {
    setSaving(true);
    try {
      if (section === "general") {
        const response = await axiosInstance.put(API_PATHS.SETTINGS.UPDATE, {
          settings: {
            send_welcome_email: settings.sendWelcomeEmail,
            allow_registration: settings.allowRegistration,
            max_password_reset_attempts: settings.maxPasswordResetAttempts,
            password_reset_block_duration_hours:
              settings.passwordResetBlockDurationHours,
            password_reset_otp_expiry_minutes:
              settings.passwordResetOtpExpiryMinutes,
          },
        });

        setSaveStatus({ section, success: true });
        setTimeout(() => setSaveStatus(null), 3000);

        toast.success("General settings updated!");
      } else if (section === "session") {
        const response = await axiosInstance.put(API_PATHS.SETTINGS.UPDATE, {
          settings: {
            max_sessions_per_user: settings.maxSessionsPerUser,
            number_of_questions: settings.numberOfQuestions,
            load_more_questions: settings.loadMoreQuestions,
            max_load_more_clicks: settings.maxLoadMoreClicks,
          },
        });

        setSaveStatus({ section, success: true });
        setTimeout(() => setSaveStatus(null), 3000);

        toast.success(`Session settings updated!`);
      } else if (section === "resources") {
        const response = await axiosInstance.put(API_PATHS.SETTINGS.UPDATE, {
          settings: {
            max_study_materials_per_session:
              settings.maxStudyMaterialsPerSession,
            study_materials_refresh_hours: settings.studyMaterialsRefreshHours,
          },
        });

        setSaveStatus({ section, success: true });
        setTimeout(() => setSaveStatus(null), 3000);

        toast.success("Resources settings updated successfully!");
      } else if (section === "api") {
        const response = await axiosInstance.put(API_PATHS.SETTINGS.UPDATE, {
          settings: {
            gemini_api_key: settings.geminiApiKey,
            tavily_api_key: settings.tavilyApiKey,
          },
        });

        setSaveStatus({ section, success: true });
        setTimeout(() => setSaveStatus(null), 3000);

        toast.success("API settings updated successfully!");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaveStatus({ section, success: true });
        setTimeout(() => setSaveStatus(null), 3000);
        toast.success("Settings saved!");
      }
    } catch (error) {
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

  const loadSettingsFromDatabase = async () => {
    try {
      setLoadingSettings(true);

      const response = await axiosInstance.get(API_PATHS.SETTINGS.GET);

      if (response.data.success && response.data.settings) {
        const settingsData = response.data.settings;

        setSettings((prev) => ({
          ...prev,

          // General settings
          sendWelcomeEmail:
            settingsData.send_welcome_email !== undefined
              ? settingsData.send_welcome_email
              : true, // Default to true if not set
          allowRegistration:
            settingsData.allow_registration !== undefined
              ? settingsData.allow_registration
              : true, // Default to true if not set

          maxPasswordResetAttempts:
            settingsData.max_password_reset_attempts || 3,
          passwordResetBlockDurationHours:
            settingsData.password_reset_block_duration_hours || 1,
          passwordResetOtpExpiryMinutes:
            settingsData.password_reset_otp_expiry_minutes || 5,

          // Session settings
          maxSessionsPerUser: settingsData.max_sessions_per_user || 1,
          numberOfQuestions: settingsData.number_of_questions || 10,
          loadMoreQuestions: settingsData.load_more_questions || 5,
          maxLoadMoreClicks: settingsData.max_load_more_clicks || 3,

          // Resources settings
          maxStudyMaterialsPerSession:
            settingsData.max_study_materials_per_session || 10,
          studyMaterialsRefreshHours:
            settingsData.study_materials_refresh_hours || 24,

          // API settings - ADD TAVILY
          geminiApiKey: settingsData.gemini_api_key || "",
          youtubeApiKey: settingsData.youtube_api_key || "",
          tavilyApiKey: settingsData.tavily_api_key || "",
        }));
      } else {
        toast.error("Failed to load settings from server");
      }
    } catch (error) {
      toast.error("Failed to load settings from server");
    } finally {
      setLoadingSettings(false);
    }
  };

  // Function to fetch Tavily usage
  const fetchTavilyUsage = async () => {
    if (!settings.tavilyApiKey) {
      toast.error("Please enter a Tavily API key first");
      return;
    }

    try {
      setLoadingUsage(true);
      const response = await axiosInstance.get(
        API_PATHS.SETTINGS.TAVILY_KEY_USAGE,
      );

      if (response.data.success) {
        setTavilyUsage(response.data.data);
        toast.success("Tavily usage data fetched successfully");
      } else {
        toast.error("Failed to fetch Tavily usage data");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to fetch Tavily usage",
      );
      setTavilyUsage({
        available: false,
        error: error.response?.data?.detail || "Failed to fetch usage data",
      });
    } finally {
      setLoadingUsage(false);
    }
  };

  // Clear Tavily usage when key changes
  useEffect(() => {
    if (!settings.tavilyApiKey) {
      setTavilyUsage(null);
    }
  }, [settings.tavilyApiKey]);

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

  useEffect(() => {
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
  ];

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
                    {loadingSettings ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <>
                        {/* Send Welcome Email Setting */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5 flex-1">
                            <Label className="text-xs sm:text-sm">
                              Send Welcome Email
                            </Label>
                            <p className="text-xs text-gray-500">
                              Send welcome email to new users upon registration
                            </p>
                          </div>
                          <Switch
                            className="cursor-pointer"
                            checked={settings.sendWelcomeEmail}
                            onCheckedChange={(checked) =>
                              handleChange("sendWelcomeEmail", checked)
                            }
                          />
                        </div>

                        {/* Allow Registration Setting */}
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
                            className="cursor-pointer"
                            checked={settings.allowRegistration}
                            onCheckedChange={(checked) =>
                              handleChange("allowRegistration", checked)
                            }
                          />
                        </div>

                        {/* ✅ ADD THIS SEPARATOR AND NEW SECURITY SETTINGS SECTION */}
                        <Separator />

                        {/* Password Reset Security Settings */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-gray-900">
                            Password Reset Security
                          </h3>

                          {/* Max Password Reset Attempts */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5 flex-1">
                              <Label className="text-xs sm:text-sm">
                                Max Password Reset Attempts
                              </Label>
                              <p className="text-xs text-gray-500">
                                Maximum wrong OTP attempts before blocking user
                              </p>
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                value={settings.maxPasswordResetAttempts}
                                onChange={(e) =>
                                  handleChange(
                                    "maxPasswordResetAttempts",
                                    parseInt(e.target.value) || 3,
                                  )
                                }
                                min={1}
                                max={10}
                                className="text-sm text-center"
                              />
                            </div>
                          </div>

                          {/* Block Duration */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5 flex-1">
                              <Label className="text-xs sm:text-sm">
                                Block Duration (Hours)
                              </Label>
                              <p className="text-xs text-gray-500">
                                Hours user is blocked after max attempts
                              </p>
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                value={settings.passwordResetBlockDurationHours}
                                onChange={(e) =>
                                  handleChange(
                                    "passwordResetBlockDurationHours",
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                                min={1}
                                max={72}
                                className="text-sm text-center"
                              />
                            </div>
                          </div>

                          {/* OTP Expiry */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-0.5 flex-1">
                              <Label className="text-xs sm:text-sm">
                                OTP Expiry (Minutes)
                              </Label>
                              <p className="text-xs text-gray-500">
                                Minutes before OTP expires
                              </p>
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                value={settings.passwordResetOtpExpiryMinutes}
                                onChange={(e) =>
                                  handleChange(
                                    "passwordResetOtpExpiryMinutes",
                                    parseInt(e.target.value) || 5,
                                  )
                                }
                                min={1}
                                max={60}
                                className="text-sm text-center"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
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
                      </>
                    )}
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

              {/* Resources Settings Tab */}
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

              {/* API Keys Settings Tab - UPDATED WITH TAVILY */}
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

                      {/* Tavily API Key - ADDED SECTION */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="tavilyApiKey"
                            className="text-xs sm:text-sm"
                          >
                            <div className="flex items-center">
                              <Key className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Tavily API Key
                            </div>
                          </Label>
                          {settings.tavilyApiKey && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={fetchTavilyUsage}
                              disabled={loadingUsage}
                              className="h-6 text-xs"
                            >
                              {loadingUsage ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                  Checking...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Check Usage
                                </>
                              )}
                            </Button>
                          )}
                        </div>
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

                      {/* Tavily Usage Display */}
                      {tavilyUsage && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-800 text-sm mb-3">
                            Tavily API Credits
                          </h4>

                          {tavilyUsage.available ? (
                            <div className="space-y-3">
                              {/* Only 3 boxes: Total, Used, Remaining */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Total Credits */}
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500">
                                    Total Credits
                                  </div>
                                  <div className="text-lg font-bold">
                                    {tavilyUsage.total_credits?.toLocaleString() ||
                                      1000}
                                  </div>
                                </div>

                                {/* Used Credits */}
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500">
                                    Used Credits
                                  </div>
                                  <div className="text-lg font-bold">
                                    {tavilyUsage.used_credits?.toLocaleString() ||
                                      0}
                                  </div>
                                </div>

                                {/* Remaining Credits */}
                                <div className="bg-white p-3 rounded border">
                                  <div className="text-xs text-gray-500">
                                    Remaining Credits
                                  </div>
                                  <div className="text-lg font-bold text-green-600">
                                    {tavilyUsage.remaining_credits?.toLocaleString() ||
                                      0}
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              {tavilyUsage.total_credits > 0 && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Usage</span>
                                    <span>
                                      {Math.round(
                                        (tavilyUsage.used_credits /
                                          tavilyUsage.total_credits) *
                                          100,
                                      )}
                                      % used
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${Math.min(100, (tavilyUsage.used_credits / tavilyUsage.total_credits) * 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              <div className="text-xs text-blue-600 mt-2">
                                Last checked:{" "}
                                {new Date(
                                  tavilyUsage.last_checked,
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-red-50 border border-red-200 p-2 rounded">
                              <p className="text-xs text-red-700">
                                {tavilyUsage.error ||
                                  "Unable to fetch Tavily credits"}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t">
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
                              Save changes
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
      </div>
    </div>
  );
};

export default Settings;
