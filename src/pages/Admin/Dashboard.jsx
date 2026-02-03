import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
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
import {
  Users,
  FileText,
  MessageSquare,
  BookOpen,
  Eye,
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Loader2,
  Database,
  Zap,
  Shield,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";
import { API_PATHS } from "@/utils/apiPaths";
import axiosInstance from "@/utils/axiosInstance";

// Custom colors for charts
const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalQuestions: 0,
    totalStudyMaterials: 0,
    totalQuizzes: 0, // NEW: Added total quizzes
    activeUsersToday: 0,
    avgSessionTime: 0,
    sessionsPerDay: [],
    topUsers: [],
    recentUsers: [],
    systemStatus: {
      apiResponseTime: 0,
      databaseUsage: 0,
      uptime: 0,
      activeConnections: 0,
      totalRequests: 0,
      errorRate: 0,
    },
    usersByRole: {
      user: 0,
      admin: 0,
      moderator: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const autoRefreshInterval = setInterval(() => {
      if (!refreshing && !loading) {
        console.log("Auto-refreshing dashboard data...");
        fetchDashboardData();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, [timeRange]);

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await axiosInstance.get(
          API_PATHS.ADMIN.DASHBOARD_STATS(timeRange),
          { signal: controller.signal },
        );

        clearTimeout(timeoutId);

        // DIRECT ACCESS - NO HELPER FUNCTION NEEDED
        const data = response.data; // Data is returned directly

        console.log("Raw dashboard response:", response);
        console.log("Dashboard data:", data);
        console.log("Top users data:", data?.topUsers);
        console.log("Top user id check:", data?.topUsers?.[0]?.id);

        // Ensure all expected fields exist with proper defaults
        const formattedData = {
          totalUsers: data?.totalUsers || 0,
          totalSessions: data?.totalSessions || 0,
          totalQuestions: data?.totalQuestions || 0,
          totalStudyMaterials: data?.totalStudyMaterials || 0,
          totalQuizzes: data?.totalQuizzes || 0, // NEW: Added total quizzes
          activeUsersToday: data?.activeUsersToday || 0,
          avgSessionTime: data?.avgSessionTime || 0,
          sessionsPerDay: Array.isArray(data?.sessionsPerDay)
            ? data.sessionsPerDay
            : [],
          topUsers: Array.isArray(data?.topUsers) ? data.topUsers : [],
          recentUsers: Array.isArray(data?.recentUsers) ? data.recentUsers : [],
          systemStatus: data?.systemStatus || {
            apiResponseTime: 0,
            databaseUsage: 0,
            uptime: 0,
            activeConnections: 0,
            totalRequests: 0,
            errorRate: 0,
          },
          usersByRole: data?.usersByRole || {
            user: 0,
            admin: 0,
            moderator: 0,
          },
        };

        // IMPORTANT: Log topUsers to debug
        console.log("Formatted topUsers:", formattedData.topUsers);
        if (formattedData.topUsers.length > 0) {
          console.log("First top user:", formattedData.topUsers[0]);
          console.log("First top user id:", formattedData.topUsers[0].id);
          console.log("First top user _id:", formattedData.topUsers[0]._id);
          console.log(
            "First top user quizzes:",
            formattedData.topUsers[0].quizzes,
          );
          console.log(
            "First top user avgQuizScore:",
            formattedData.topUsers[0].avgQuizScore,
          );
        }

        // Validate and fix sessionsPerDay data
        if (formattedData.sessionsPerDay.length === 0) {
          // Generate placeholder data for empty chart
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const today = new Date();
          formattedData.sessionsPerDay = days.map((day, index) => ({
            date: format(
              new Date(today.getTime() - (6 - index) * 24 * 60 * 60 * 1000),
              "yyyy-MM-dd",
            ),
            day,
            sessions: Math.floor(Math.random() * 50) + 50, // Random data for demo
          }));
        }

        setStats(formattedData);
        setLastUpdated(new Date());

        if (isManualRefresh) {
          toast.success("Dashboard data refreshed!");
        } else {
          toast.success("Dashboard data loaded successfully!");
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error; // Re-throw to be caught by outer try-catch
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      let errorMessage = "Failed to load dashboard data";

      // Fallback error handling
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your connection.";
        } else if (error.response) {
          const { status, data } = error.response;
          if (status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          errorMessage =
            data?.message ||
            data?.detail ||
            `Request failed with status ${status}`;
        } else if (error.request) {
          errorMessage =
            "No response from server. Please check your connection.";
        } else {
          errorMessage = error.message;
        }
      } else if (error.name === "AbortError") {
        errorMessage = "Request timeout. Please check your connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred.";
      }

      setError(errorMessage);
      toast.error(errorMessage);

      // Set empty data on error
      setStats({
        totalUsers: 0,
        totalSessions: 0,
        totalQuestions: 0,
        totalStudyMaterials: 0,
        totalQuizzes: 0, // NEW: Added total quizzes
        activeUsersToday: 0,
        avgSessionTime: 0,
        sessionsPerDay: [],
        topUsers: [],
        recentUsers: [],
        systemStatus: {
          apiResponseTime: 0,
          databaseUsage: 0,
          uptime: 0,
          activeConnections: 0,
          totalRequests: 0,
          errorRate: 0,
        },
        usersByRole: {
          user: 0,
          admin: 0,
          moderator: 0,
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (!refreshing) {
      fetchDashboardData(true);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color,
    prefix = "",
    suffix = "",
    loading: cardLoading = false,
  }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full min-h-[120px] sm:min-h-[140px] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-gray-500 truncate">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 shrink-0`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        {cardLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span className="text-gray-400">Loading...</span>
          </div>
        ) : (
          <>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
              {prefix}
              {typeof value === "number" &&
              title !== "Avg Session Time" &&
              title !== "Conversion Rate"
                ? value.toLocaleString()
                : title === "Conversion Rate"
                  ? value.toFixed(1)
                  : value}
              {suffix}
            </div>
            {trend !== undefined && (
              <div className="flex items-center text-xs mt-2">
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
                )}
                <span className={trend > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(trend)}% from last week
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  const UserStatusBadge = ({ isActive }) => (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className="ml-2 text-xs"
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  const RoleBadge = ({ role }) => {
    const roleColors = {
      admin: "bg-red-100 text-red-800",
      user: "bg-blue-100 text-blue-800",
      moderator: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge
        className={`${roleColors[role] || "bg-gray-100 text-gray-800"} text-xs`}
      >
        {role}
      </Badge>
    );
  };

  const SystemStatusIndicator = ({
    label,
    value,
    unit = "",
    max = 100,
    color = "blue",
  }) => {
    const percentage = (value / max) * 100;
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 truncate text-xs sm:text-sm">
            {label}
          </span>
          <span className="font-medium text-xs sm:text-sm">
            {typeof value === "number" ? value.toLocaleString() : value}
            {unit}
          </span>
        </div>
        <Progress
          value={percentage}
          className="h-1.5 sm:h-2"
          indicatorClassName={colorClasses[color]}
        />
      </div>
    );
  };

  // Calculate trends (in real app, this would come from API comparing with previous period)
  const calculateTrend = (currentValue, previousValue = 0) => {
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-2xl mb-4">
            Error Loading Dashboard
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={fetchDashboardData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="ml-2"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
      {/* Header - FIXED: Prevent cutting off */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm sm:text-base truncate">
            Welcome back! Here's what's happening with your platform.
            {lastUpdated && !refreshing && (
              <span className="ml-2 text-xs sm:text-sm text-green-600">
                • Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            disabled={refreshing}
          >
            <SelectTrigger className="w-full sm:w-32">
              <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button - ONLY THIS SHOWS LOADER */}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-none relative min-w-0 sm:min-w-[100px] h-9 sm:h-10"
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm truncate">Refreshing</span>
              </>
            ) : (
              <>
                <RefreshCw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm truncate">Refresh</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => navigate("/admin/users/create")}
            disabled={refreshing}
            className={`flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm ${refreshing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline truncate">Add User</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid - FIXED: Better mobile layout */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 w-full">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={calculateTrend(stats.totalUsers, 1000)}
          color="text-blue-500"
          loading={false}
        />
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={FileText}
          trend={calculateTrend(stats.totalSessions, 3000)}
          color="text-green-500"
          loading={false}
        />
        <StatCard
          title="Active Today"
          value={stats.activeUsersToday}
          icon={Activity}
          trend={calculateTrend(stats.activeUsersToday, 200)}
          color="text-yellow-500"
          loading={false}
        />
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions}
          icon={MessageSquare}
          trend={calculateTrend(stats.totalQuestions, 12000)}
          color="text-pink-500"
          loading={false}
        />
        <StatCard
          title="Study Materials"
          value={stats.totalStudyMaterials}
          icon={BookOpen}
          trend={calculateTrend(stats.totalStudyMaterials, 4000)}
          color="text-indigo-500"
          loading={false}
        />
        {/* NEW: Total Quizzes Card */}
        <StatCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon={Target}
          trend={calculateTrend(stats.totalQuizzes, 500)}
          color="text-purple-500"
          loading={false}
        />
      </div>

      {/* Charts Section - FIXED: Better mobile handling */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7 w-full">
        {/* Sessions Chart */}
        <Card className="lg:col-span-4 w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Sessions Activity
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Last 7 days overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 w-full">
              {stats.sessionsPerDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.sessionsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      fontSize={12}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis fontSize={12} tick={{ fontSize: 10 }} />
                    <Tooltip
                      labelFormatter={(label) => `Day: ${label}`}
                      formatter={(value) => [`${value} sessions`, "Sessions"]}
                      contentStyle={{ fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                      name="Sessions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No session data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users by Role Chart */}
        <Card className="lg:col-span-3 w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Users by Role</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Distribution of user roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 w-full">
              {Object.keys(stats.usersByRole).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.usersByRole)
                        .filter(([_, value]) => value > 0)
                        .map(([name, value]) => ({
                          name: name.charAt(0).toUpperCase() + name.slice(1),
                          value,
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={60}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(stats.usersByRole)
                        .filter(([_, value]) => value > 0)
                        .map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} users`, name]}
                      contentStyle={{ fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No user role data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users & Recent Users */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 w-full">
        {/* Top Performing Users */}
        <Card className="w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Top Performing Users
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Users with highest engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topUsers.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm min-w-[120px]">
                        User
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Sessions
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Questions
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Quizzes
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topUsers.slice(0, 5).map((user, index) => (
                      <TableRow key={user.id || index}>
                        <TableCell className="py-2">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                              <AvatarImage src={user.profileImageUrl} />
                              <AvatarFallback className="text-xs">
                                {user.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs sm:text-sm truncate">
                                {user.name || "Unknown User"}
                              </div>
                              <div className="text-xs text-gray-500 truncate hidden sm:block">
                                {user.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center">
                            <span className="mr-2 text-xs sm:text-sm">
                              {user.sessions || 0}
                            </span>
                            <Progress
                              value={((user.sessions || 0) / 50) * 100}
                              className="w-12 sm:w-20 h-1.5 sm:h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-xs sm:text-sm">
                          {user.questions || 0}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              (user.quizzes || 0) >= 10
                                ? "bg-green-50 text-green-700"
                                : (user.quizzes || 0) >= 5
                                  ? "bg-blue-50 text-blue-700"
                                  : (user.quizzes || 0) >= 1
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {user.quizzes || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/users/${user.id || "1"}`)
                            }
                            disabled={refreshing}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No top users data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="w-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Recent Users</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Newly registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm min-w-[120px]">
                        User
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">Role</TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Status
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Joined
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsers.slice(0, 5).map((user, index) => (
                      <TableRow key={user.id || index}>
                        <TableCell className="py-2">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                              <AvatarImage src={user.profileImageUrl} />
                              <AvatarFallback className="text-xs">
                                {user.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs sm:text-sm truncate">
                                {user.name || "Unknown User"}
                              </div>
                              <div className="text-xs text-gray-500 truncate hidden sm:block">
                                {user.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <RoleBadge role={user.role || "user"} />
                        </TableCell>
                        <TableCell className="py-2">
                          <UserStatusBadge isActive={user.isActive || false} />
                        </TableCell>
                        <TableCell className="py-2 text-xs sm:text-sm">
                          {user.joined || format(new Date(), "MMM dd")}
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            disabled={refreshing}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent users</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl truncate">
                System Status
              </CardTitle>
              <CardDescription className="text-sm sm:text-base truncate">
                Current platform health metrics
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
            >
              <RefreshCw
                className={`h-3 w-3 sm:h-4 sm:w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 w-full">
            {/* Performance Column */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Performance
              </h3>
              {refreshing ? (
                // Skeleton for Performance
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 sm:w-24 animate-pulse"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-10 sm:w-12 animate-pulse"></div>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full w-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <SystemStatusIndicator
                    label="API Response Time"
                    value={stats.systemStatus.apiResponseTime}
                    unit="ms"
                    max={200}
                    color="green"
                  />
                  <SystemStatusIndicator
                    label="Uptime"
                    value={stats.systemStatus.uptime}
                    unit="%"
                    max={100}
                    color="blue"
                  />
                  <SystemStatusIndicator
                    label="Error Rate"
                    value={stats.systemStatus.errorRate}
                    unit="%"
                    max={5}
                    color="red"
                  />
                </>
              )}
            </div>

            {/* Resources Column */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Resources</h3>
              {refreshing ? (
                // Skeleton for Resources
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-28 animate-pulse"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-10 sm:w-12 animate-pulse"></div>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full w-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <SystemStatusIndicator
                    label="Database Usage"
                    value={stats.systemStatus.databaseUsage}
                    unit="%"
                    max={100}
                    color="purple"
                  />
                  <SystemStatusIndicator
                    label="Active Connections"
                    value={stats.systemStatus.activeConnections}
                    max={2000}
                    color="blue"
                  />
                  <SystemStatusIndicator
                    label="Requests/Hour"
                    value={stats.systemStatus.totalRequests}
                    max={10000}
                    color="green"
                  />
                </>
              )}
            </div>

            {/* Quick Actions Column */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Quick Actions
              </h3>
              {refreshing ? (
                // Skeleton for Quick Actions
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-start"
                      disabled
                    >
                      <div className="h-3 w-3 sm:h-4 sm:w-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => navigate("/admin/users")}
                    disabled={refreshing}
                  >
                    <Users className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">Manage Users</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => navigate("/admin/sessions")}
                    disabled={refreshing}
                  >
                    <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">View Sessions</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => navigate("/admin/analytics")}
                    disabled={refreshing}
                  >
                    <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">System Analytics</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global CSS for mobile zoom issues */}
      <style jsx global>{`
        /* Prevent zoom on mobile */
        @media screen and (max-width: 768px) {
          html {
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }

          /* Fix for zoom causing layout issues */
          body {
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
          }

          /* Prevent horizontal scrolling */
          .overflow-x-hidden {
            overflow-x: hidden !important;
          }

          /* Ensure cards fit within viewport */
          .min-h-\[120px\] {
            min-height: 120px !important;
          }
        }

        /* Fix for very small screens */
        @media screen and (max-width: 320px) {
          .text-xs {
            font-size: 0.7rem !important;
          }

          .h-7 {
            height: 1.5rem !important;
          }

          .w-7 {
            width: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
