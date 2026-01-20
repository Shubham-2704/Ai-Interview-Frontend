import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  Download,
  Calendar,
  Activity,
  Zap,
  Globe,
  Eye,
  MousePointer,
  FileText,
  Wifi,
  Shield,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [userBehavior, setUserBehavior] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // ADD THIS for refresh button loader
  const [lastUpdated, setLastUpdated] = useState(null); // ADD THIS to show last update time

  // Update in your Analytics.jsx component
  const fetchAnalyticsData = async (isManualRefresh = false) => {
    // Add parameter
    if (isManualRefresh) {
      setRefreshing(true); // Set refreshing state for button
    } else {
      setLoading(true); // Set main loading state
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        setAnalyticsData(getFallbackData());
        setSystemMetrics(getFallbackSystemMetrics());
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log("Fetching dashboard data...");

      // Fetch GA4 analytics data
      const analyticsResponse = await fetch(
        `http://localhost:8000/api/analytics/dashboard?time_range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!analyticsResponse.ok) {
        const errorText = await analyticsResponse.text();
        console.error("Analytics API error:", errorText);
        throw new Error(
          `Failed to fetch analytics: ${analyticsResponse.status}`,
        );
      }

      const analyticsResult = await analyticsResponse.json();
      console.log("Analytics response:", analyticsResult);

      // Store analytics data
      setAnalyticsData(analyticsResult.data || analyticsResult);
      setLastUpdated(new Date()); // Update last updated timestamp

      // Fetch system metrics
      try {
        const systemResponse = await fetch(
          "http://localhost:8000/api/admin/system/status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (systemResponse.ok) {
          const systemResult = await systemResponse.json();
          console.log("System response:", systemResult);
          setSystemMetrics(systemResult.data || systemResult);
        } else {
          console.warn("System metrics fetch failed, using fallback");
          setSystemMetrics(getFallbackSystemMetrics());
        }
      } catch (systemError) {
        console.warn("Error fetching system metrics:", systemError);
        setSystemMetrics(getFallbackSystemMetrics());
      }
    } catch (error) {
      console.error("Error in fetchAnalyticsData:", error);

      // Use fallback data
      setAnalyticsData(getFallbackData());
      setSystemMetrics(getFallbackSystemMetrics());

      // Show error to user
      if (error.message.includes("401") || error.message.includes("403")) {
        alert("Please login again. Your session may have expired.");
      } else if (error.message.includes("404")) {
        alert("Analytics endpoint not found. Please check backend server.");
      } else {
        alert(`Failed to load analytics: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false); // Reset refreshing state
    }
  };

  // Update in your Analytics.jsx component
  const fetchTabData = async (tab) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return null;
      }

      let endpoint = "";
      let isDashboard = false;

      switch (tab) {
        case "overview":
          endpoint = `http://localhost:8000/api/analytics/overview?time_range=${timeRange}`;
          break;
        case "realtime":
          endpoint = `http://localhost:8000/api/analytics/realtime`;
          break;
        case "acquisition":
          endpoint = `http://localhost:8000/api/analytics/acquisition?time_range=${timeRange}`;
          break;
        case "pages":
          endpoint = `http://localhost:8000/api/analytics/pages?time_range=${timeRange}`;
          break;
        case "geographic":
          endpoint = `http://localhost:8000/api/analytics/geographic?time_range=${timeRange}`;
          break;
        case "devices":
          endpoint = `http://localhost:8000/api/analytics/devices?time_range=${timeRange}`;
          break;
        case "events":
          endpoint = `http://localhost:8000/api/analytics/events?time_range=${timeRange}`;
          break;
        case "system":
          endpoint = `http://localhost:8000/api/admin/system/status`;
          break;
        case "behavior":
          endpoint = `http://localhost:8000/api/track/user/behavior?time_range=${timeRange}`;
          break;
        default:
          endpoint = `http://localhost:8000/api/analytics/dashboard?time_range=${timeRange}`;
          isDashboard = true;
      }

      console.log(`Fetching ${tab} data from: ${endpoint}`);

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`Received ${tab} data:`, result);

      // Handle response based on endpoint
      if (tab === "behavior") {
        setUserBehavior(result.data || result);
        return result.data || result;
      } else if (tab === "system") {
        setSystemMetrics(result.data || result);
        return result.data || result;
      } else if (isDashboard) {
        // Dashboard endpoint returns full structure
        setAnalyticsData(result.data || result);
        return result.data || result;
      } else {
        // Other analytics endpoints return {status, data}
        const data = result.data || result;
        setAnalyticsData((prev) => ({
          ...prev,
          [tab]: data,
        }));
        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);

      // Show user-friendly error
      if (tab === "dashboard") {
        alert(`Failed to load analytics data: ${error.message}`);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Track custom event
  const trackEvent = async (
    eventName,
    eventCategory,
    eventLabel,
    eventValue,
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:8000/api/track/event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            event_name: eventName,
            event_category: eventCategory,
            event_label: eventLabel,
            event_value: eventValue,
          }),
        });
      }
    } catch (error) {
      console.error("Event tracking error:", error);
    }
  };

  // Track page view
  const trackPageView = async (pagePath, pageTitle) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:8000/api/track/pageview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            page_path: pagePath,
            page_title: pageTitle,
          }),
        });
      }
    } catch (error) {
      console.error("Page view tracking error:", error);
    }
  };
  useEffect(() => {
    fetchAnalyticsData();
    // Track initial page view
    trackPageView(window.location.pathname, document.title);
  }, [timeRange]);

  const handleTabChange = async (value) => {
    setActiveTab(value);

    // Track tab change
    trackEvent("tab_change", "navigation", value, 1);

    if (!analyticsData?.[value] && value !== "system" && value !== "behavior") {
      await fetchTabData(value);
    } else if (value === "system" && !systemMetrics) {
      await fetchTabData(value);
    } else if (value === "behavior" && !userBehavior) {
      await fetchTabData(value);
    }
  };

  const handleExport = () => {
    trackEvent("export_data", "engagement", "analytics_export", 1);
    // Add export functionality here
    alert("Export functionality would be implemented here");
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    description,
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-bold">{value}</p>
              {change !== undefined && (
                <span
                  className={`ml-2 text-sm ${
                    change > 0
                      ? "text-green-500"
                      : change < 0
                        ? "text-red-500"
                        : "text-gray-500"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-400 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SystemStatCard = ({
    title,
    value,
    icon: Icon,
    color,
    unit = "",
    status = "normal",
  }) => {
    const getStatusColor = () => {
      switch (status) {
        case "good":
          return "text-green-500";
        case "warning":
          return "text-yellow-500";
        case "critical":
          return "text-red-500";
        default:
          return "text-blue-500";
      }
    };

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <div className="flex items-baseline mt-1">
                <p className={`text-2xl font-bold ${getStatusColor()}`}>
                  {value}
                </p>
                {unit && (
                  <span className="ml-1 text-sm text-gray-500">{unit}</span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Format data for charts
  const formatDailyData = (data) => {
    if (!data?.overview?.dailyData) return [];
    return data.overview.dailyData
      .map((item) => ({
        date: item.date.slice(4, 6) + "/" + item.date.slice(6, 8),
        users: item.users,
        sessions: item.sessions,
        pageviews: item.pageviews,
      }))
      .slice(-15); // Last 15 days
  };

  const formatAcquisitionData = (data) => {
    if (!data?.acquisition?.channels) return [];
    return data.acquisition.channels.map((channel) => ({
      name: channel.channel,
      users: channel.users,
      sessions: channel.sessions,
    }));
  };

  const formatDeviceData = (data) => {
    if (!data?.devices?.devices) return [];
    return data.devices.devices.map((device) => ({
      name: device.device,
      value: device.users,
    }));
  };

  const formatGeoData = (data) => {
    if (!data?.geographic?.countries) return [];
    return data.geographic.countries.slice(0, 8).map((country) => ({
      name: country.country,
      users: country.users,
    }));
  };

  const formatSystemMetrics = (metrics) => {
    if (!metrics) return [];
    return [
      { name: "CPU", value: metrics.cpu || 0 },
      { name: "Memory", value: metrics.memory || 0 },
      { name: "Disk", value: metrics.disk || 0 },
      { name: "Database", value: metrics.databaseUsage || 0 },
    ];
  };

  const formatHealthMetrics = (metrics) => {
    if (!metrics) return [];
    return [
      {
        name: "API Response",
        value: metrics.apiResponseTime || 0,
        target: 200,
      },
      { name: "Error Rate", value: metrics.errorRate || 0, target: 1 },
      { name: "Uptime", value: metrics.uptime || 0, target: 99.5 },
      {
        name: "Active Connections",
        value: metrics.activeConnections || 0,
        target: 100,
      },
    ];
  };

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#14b8a6",
  ];

  // Fallback data
  const getFallbackData = () => ({
    overview: {
      totals: {
        totalUsers: 1250,
        sessions: 2100,
        pageviews: 5400,
        engagedSessions: 1450,
        averageDuration: 145.5,
        bounceRate: 32.8,
        newUsers: 450,
        events: 2450,
      },
      dailyData: Array.from({ length: 15 }, (_, i) => ({
        date: `202401${String(i + 1).padStart(2, "0")}`,
        users: 1200 + i * 50,
        sessions: 1500 + i * 80,
        pageviews: 3000 + i * 200,
        engagedSessions: 1000 + i * 60,
      })),
    },
    realtime: {
      activeUsers: 42,
      countries: [
        { country: "United States", users: 25 },
        { country: "India", users: 10 },
        { country: "United Kingdom", users: 7 },
      ],
      devices: [
        { device: "desktop", platform: "Windows", users: 25 },
        { device: "mobile", platform: "iOS", users: 12 },
        { device: "tablet", platform: "Android", users: 5 },
      ],
    },
    acquisition: {
      channels: [
        {
          channel: "Organic Search",
          users: 1560,
          newUsers: 450,
          sessions: 2100,
          engagedSessions: 1450,
        },
        {
          channel: "Direct",
          users: 890,
          newUsers: 120,
          sessions: 1100,
          engagedSessions: 780,
        },
        {
          channel: "Social",
          users: 450,
          newUsers: 320,
          sessions: 620,
          engagedSessions: 410,
        },
      ],
    },
    devices: {
      devices: [
        { device: "desktop", users: 1850, sessions: 2450, avgDuration: 210.5 },
        { device: "mobile", users: 1250, sessions: 1650, avgDuration: 145.8 },
        { device: "tablet", users: 320, sessions: 450, avgDuration: 180.2 },
      ],
      browsers: [
        { browser: "Chrome", users: 2450 },
        { browser: "Safari", users: 1250 },
        { browser: "Firefox", users: 450 },
        { browser: "Edge", users: 320 },
      ],
    },
    geographic: {
      countries: [
        {
          country: "United States",
          users: 1250,
          sessions: 1800,
          pageviews: 5400,
        },
        { country: "India", users: 890, sessions: 1250, pageviews: 3750 },
        {
          country: "United Kingdom",
          users: 450,
          sessions: 680,
          pageviews: 2040,
        },
        { country: "Canada", users: 320, sessions: 450, pageviews: 1350 },
        { country: "Australia", users: 210, sessions: 320, pageviews: 960 },
      ],
    },
    pages: {
      pages: [
        {
          title: "Home Page",
          path: "/",
          country: "United States",
          views: 1250,
          users: 890,
          avgDuration: 145.5,
          bounceRate: 32.8,
          events: 450,
        },
        {
          title: "Dashboard",
          path: "/dashboard",
          country: "United States",
          views: 980,
          users: 650,
          avgDuration: 210.2,
          bounceRate: 18.5,
          events: 320,
        },
        {
          title: "Analytics",
          path: "/analytics",
          country: "India",
          views: 750,
          users: 520,
          avgDuration: 180.5,
          bounceRate: 25.3,
          events: 280,
        },
      ],
    },
    events: {
      events: [
        { name: "page_view", page: "/", count: 1250, users: 890 },
        { name: "button_click", page: "/dashboard", count: 850, users: 650 },
        { name: "form_submit", page: "/contact", count: 320, users: 280 },
      ],
    },
  });

  const getFallbackSystemMetrics = () => ({
    apiResponseTime: 145,
    databaseUsage: 42.5,
    uptime: 99.8,
    activeConnections: 24,
    totalRequests: 1250,
    errorRate: 0.3,
    cpu: 35.2,
    memory: 62.8,
    disk: 45.3,
    health: 92.5,
    healthStatus: "healthy",
  });

  const getFallbackUserBehavior = () => ({
    user_id: "current_user",
    time_range: "7d",
    total_sessions: 12,
    total_page_views: 48,
    total_events: 25,
    popular_pages: [
      { page: "/dashboard", views: 15 },
      { page: "/analytics", views: 12 },
      { page: "/profile", views: 8 },
      { page: "/settings", views: 6 },
      { page: "/help", views: 4 },
    ],
    event_distribution: [
      { event: "button_click", count: 12 },
      { event: "page_view", count: 8 },
      { event: "form_submit", count: 3 },
      { event: "file_download", count: 2 },
    ],
    sessions: Array.from({ length: 5 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      action: i === 0 ? "login" : "visit",
      data: { path: "/dashboard" },
    })),
    recent_page_views: Array.from({ length: 5 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      page_path: ["/dashboard", "/analytics", "/profile", "/settings", "/help"][
        i
      ],
      page_title: ["Dashboard", "Analytics", "Profile", "Settings", "Help"][i],
    })),
    recent_events: Array.from({ length: 5 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 1800000).toISOString(),
      event_name: [
        "button_click",
        "form_submit",
        "page_view",
        "file_download",
        "tab_change",
      ][i],
      event_category: [
        "engagement",
        "form",
        "navigation",
        "download",
        "navigation",
      ][i],
    })),
  });

  if (loading && !analyticsData && !systemMetrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const data = analyticsData || getFallbackData();
  const system = systemMetrics || getFallbackSystemMetrics();
  const user = userBehavior || getFallbackUserBehavior();

  // Calculate change percentages based on time range
  const calculateChange = (current) => {
    const base = current * 0.8; // Simulate 20% growth
    return Math.round(((current - base) / base) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">
            Google Analytics 4 & System Performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              fetchAnalyticsData(true); // Pass true for manual refresh
              trackEvent("refresh_data", "engagement", "manual_refresh", 1);
            }}
            disabled={refreshing} // Disable button when refreshing
          >
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Google Analytics Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Users"
          value={data.realtime?.activeUsers || 0}
          icon={Users}
          color="bg-blue-500"
          description="Currently online"
        />
        <StatCard
          title="Total Users"
          value={data.overview?.totals?.totalUsers?.toLocaleString() || "0"}
          change={calculateChange(data.overview?.totals?.totalUsers || 1250)}
          icon={TrendingUp}
          color="bg-green-500"
          description={`${timeRange} period`}
        />
        <StatCard
          title="Sessions"
          value={data.overview?.totals?.sessions?.toLocaleString() || "0"}
          change={calculateChange(data.overview?.totals?.sessions || 2100)}
          icon={Activity}
          color="bg-purple-500"
          description={`${timeRange} period`}
        />
        <StatCard
          title="Pageviews"
          value={data.overview?.totals?.pageviews?.toLocaleString() || "0"}
          change={calculateChange(data.overview?.totals?.pageviews || 5400)}
          icon={Eye}
          color="bg-yellow-500"
          description={`${timeRange} period`}
        />
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Avg. Session"
          value={`${Math.round(data.overview?.totals?.averageDuration || 0)}s`}
          change={5.2}
          icon={Clock}
          color="bg-indigo-500"
          description="Average duration"
        />
        <StatCard
          title="Bounce Rate"
          value={`${Math.round(data.overview?.totals?.bounceRate || 0)}%`}
          change={-3.2}
          icon={Target}
          color="bg-red-500"
          description="Lower is better"
        />
        <StatCard
          title="New Users"
          value={data.overview?.totals?.newUsers?.toLocaleString() || "0"}
          change={calculateChange(data.overview?.totals?.newUsers || 450)}
          icon={Zap}
          color="bg-pink-500"
          description="First-time visitors"
        />
        <StatCard
          title="Engaged Sessions"
          value={
            data.overview?.totals?.engagedSessions?.toLocaleString() || "0"
          }
          change={calculateChange(
            data.overview?.totals?.engagedSessions || 1450,
          )}
          icon={MousePointer}
          color="bg-teal-500"
          description="10+ seconds"
        />
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList className="flex flex-wrap w-full">
          <TabsTrigger className="cursor-pointer" value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="realtime">
            Real-time
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="acquisition">
            Acquisition
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="pages">
            Pages
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="geographic">
            Geographic
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="devices">
            Devices
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="events">
            Events
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="system">
            System
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="behavior">
            My Activity
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New users and sessions over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatDailyData(data)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Acquisition Channels */}
            <Card>
              <CardHeader>
                <CardTitle>Acquisition Channels</CardTitle>
                <CardDescription>Where your users come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatAcquisitionData(data)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#8b5cf6" />
                      <Bar dataKey="sessions" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Device Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>Users by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatDeviceData(data)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formatDeviceData(data).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>Users by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatGeoData(data)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Active Users by Country */}
            <Card>
              <CardHeader>
                <CardTitle>Active Users by Country</CardTitle>
                <CardDescription>
                  Real-time geographic distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.realtime?.countries || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Active Devices */}
            <Card>
              <CardHeader>
                <CardTitle>Active Devices</CardTitle>
                <CardDescription>Current device usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.realtime?.devices || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ device, users }) => `${device}: ${users}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="users"
                      >
                        {(data.realtime?.devices || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Acquisition Tab */}
        <TabsContent value="acquisition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Acquisition</CardTitle>
              <CardDescription>Detailed channel performance</CardDescription>
            </CardHeader>
            <CardContent>
              {data.acquisition?.channels && (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold">Channel</div>
                    <div className="font-semibold text-right">Users</div>
                    <div className="font-semibold text-right">New Users</div>
                    <div className="font-semibold text-right">Sessions</div>
                    <div className="font-semibold text-right">Engaged</div>
                  </div>
                  {data.acquisition.channels.map((channel, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-5 gap-4 p-4 border-b"
                    >
                      <div>{channel.channel}</div>
                      <div className="text-right font-medium">
                        {channel.users?.toLocaleString()}
                      </div>
                      <div className="text-right">
                        {channel.newUsers?.toLocaleString()}
                      </div>
                      <div className="text-right">
                        {channel.sessions?.toLocaleString()}
                      </div>
                      <div className="text-right">
                        {channel.engagedSessions?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
              <CardDescription>Top performing pages</CardDescription>
            </CardHeader>
            <CardContent>
              {data.pages?.pages && (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold col-span-2">Page Title</div>
                    <div className="font-semibold text-right">Views</div>
                    <div className="font-semibold text-right">Users</div>
                    <div className="font-semibold text-right">Avg. Time</div>
                    <div className="font-semibold text-right">Bounce Rate</div>
                    <div className="font-semibold text-right">Events</div>
                  </div>
                  {data.pages.pages.slice(0, 10).map((page, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-4 p-4 border-b"
                    >
                      <div className="col-span-2 truncate" title={page.title}>
                        <div className="font-medium truncate">{page.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {page.path}
                        </div>
                      </div>
                      <div className="text-right font-medium">
                        {page.views?.toLocaleString()}
                      </div>
                      <div className="text-right">
                        {page.users?.toLocaleString()}
                      </div>
                      <div className="text-right">{page.avgDuration}s</div>
                      <div className="text-right">{page.bounceRate}%</div>
                      <div className="text-right">{page.events}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Users by location</CardDescription>
            </CardHeader>
            <CardContent>
              {data.geographic?.countries && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold">Country</div>
                    <div className="font-semibold text-right">Users</div>
                    <div className="font-semibold text-right">Sessions</div>
                    <div className="font-semibold text-right">Pageviews</div>
                  </div>
                  {data.geographic.countries
                    .slice(0, 15)
                    .map((country, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-4 p-4 border-b"
                      >
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          {country.country}
                        </div>
                        <div className="text-right font-medium">
                          {country.users?.toLocaleString()}
                        </div>
                        <div className="text-right">
                          {country.sessions?.toLocaleString()}
                        </div>
                        <div className="text-right">
                          {country.pageviews?.toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Device Categories */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Device Categories</CardTitle>
                <CardDescription>Usage by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.devices?.devices || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="device" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#3b82f6" />
                      <Bar dataKey="sessions" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Browsers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Browsers</CardTitle>
                <CardDescription>Browser usage distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.devices?.browsers?.slice(0, 8).map((browser, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span>{browser.browser}</span>
                      </div>
                      <span className="font-medium">
                        {browser.users?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Tracking</CardTitle>
              <CardDescription>User interaction events</CardDescription>
            </CardHeader>
            <CardContent>
              {data.events?.events && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="font-semibold">Event Name</div>
                    <div className="font-semibold">Page</div>
                    <div className="font-semibold text-right">Count</div>
                    <div className="font-semibold text-right">Users</div>
                  </div>
                  {data.events.events.slice(0, 15).map((event, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-4 gap-4 p-4 border-b"
                    >
                      <div className="font-medium">{event.name}</div>
                      <div className="truncate" title={event.page}>
                        {event.page}
                      </div>
                      <div className="text-right font-medium">
                        {event.count?.toLocaleString()}
                      </div>
                      <div className="text-right">
                        {event.users?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          {/* System Health Score */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Overall system performance</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchAnalyticsData(true)}
                  disabled={refreshing}
                  className="h-8 w-8"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-4xl font-bold"
                    style={{
                      color:
                        system.health >= 90
                          ? "#10b981"
                          : system.health >= 70
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  >
                    {Math.round(system.health)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Status:{" "}
                    <span className="font-medium capitalize">
                      {system.healthStatus}
                    </span>
                  </div>
                </div>
                <Shield className="h-16 w-16 text-gray-200" />
              </div>
            </CardContent>
          </Card>

          {/* System Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SystemStatCard
              title="API Response"
              value={system.apiResponseTime}
              unit="ms"
              icon={Activity}
              color="bg-blue-500"
              status={
                system.apiResponseTime < 200
                  ? "good"
                  : system.apiResponseTime < 500
                    ? "warning"
                    : "critical"
              }
            />
            <SystemStatCard
              title="Error Rate"
              value={system.errorRate}
              unit="%"
              icon={Target}
              color="bg-red-500"
              status={
                system.errorRate < 1
                  ? "good"
                  : system.errorRate < 5
                    ? "warning"
                    : "critical"
              }
            />
            <SystemStatCard
              title="Uptime"
              value={system.uptime}
              unit="%"
              icon={Zap}
              color="bg-green-500"
              status={
                system.uptime >= 99.5
                  ? "good"
                  : system.uptime >= 99
                    ? "warning"
                    : "critical"
              }
            />
            <SystemStatCard
              title="Active Connections"
              value={system.activeConnections}
              icon={Wifi}
              color="bg-purple-500"
              status={
                system.activeConnections < 50
                  ? "good"
                  : system.activeConnections < 100
                    ? "warning"
                    : "critical"
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>System resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatSystemMetrics(system)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formatHealthMetrics(system).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">
                          {item.name === "Uptime" || item.name === "Error Rate"
                            ? `${item.value}%`
                            : item.name === "API Response"
                              ? `${item.value}ms`
                              : item.value}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.value <= item.target
                              ? "bg-green-500"
                              : item.name === "Uptime"
                                ? item.value >= item.target
                                  ? "bg-green-500"
                                  : "bg-red-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min((item.value / item.target) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Target:{" "}
                        {item.name === "Uptime" || item.name === "Error Rate"
                          ? `${item.target}%`
                          : item.name === "API Response"
                            ? `${item.target}ms`
                            : item.target}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Activity Tab */}
        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Activity</CardTitle>
              <CardDescription>Your behavior on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard
                  title="My Sessions"
                  value={user.total_sessions}
                  icon={Users}
                  color="bg-blue-100"
                />
                <StatCard
                  title="Page Views"
                  value={user.total_page_views}
                  icon={Eye}
                  color="bg-green-100"
                />
                <StatCard
                  title="Events"
                  value={user.total_events}
                  icon={Activity}
                  color="bg-purple-100"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-3">Popular Pages</h3>
                  <div className="space-y-2">
                    {user.popular_pages.map((page, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate max-w-[200px]">
                            {page.page}
                          </span>
                        </div>
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                          {page.views}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Event Distribution</h3>
                  <div className="space-y-2">
                    {user.event_distribution.map((event, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          ></div>
                          <span>{event.event}</span>
                        </div>
                        <span className="font-medium">{event.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {user.recent_events.slice(0, 10).map((event, index) => (
                    <div key={index} className="py-2 border-b">
                      <div className="flex justify-between">
                        <span className="font-medium">{event.event_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Category: {event.event_category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;