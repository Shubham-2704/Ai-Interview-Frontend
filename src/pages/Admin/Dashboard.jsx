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
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-5 w-5 ${color}`} />
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
            <div className="text-2xl font-bold">
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
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
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
    <Badge variant={isActive ? "default" : "secondary"} className="ml-2">
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
      <Badge className={roleColors[role] || "bg-gray-100 text-gray-800"}>
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
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">
            {typeof value === "number" ? value.toLocaleString() : value}
            {unit}
          </span>
        </div>
        <Progress
          value={percentage}
          className="h-2"
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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back! Here's what's happening with your platform.
            {lastUpdated && !refreshing && (
              <span className="ml-2 text-sm text-green-600">
                • Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
            disabled={refreshing}
          >
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
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
            className="relative min-w-[100px]"
          >
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>

          <Button
            onClick={() => navigate("/admin/users/create")}
            disabled={refreshing}
            className={refreshing ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Sessions Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sessions Activity</CardTitle>
            <CardDescription>Last 7 days overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {stats.sessionsPerDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.sessionsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(label) => `Day: ${label}`}
                      formatter={(value) => [`${value} sessions`, "Sessions"]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
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
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
                      outerRadius={80}
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
                    />
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Performing Users - UPDATED with quiz data */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Users</CardTitle>
            <CardDescription>Users with highest engagement</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Quizzes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topUsers.map((user, index) => (
                      <TableRow key={user.id || index}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.profileImageUrl} />
                              <AvatarFallback>
                                {user.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.name || "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{user.sessions || 0}</span>
                            <Progress
                              value={((user.sessions || 0) / 50) * 100}
                              className="w-20"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{user.questions || 0}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
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
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/admin/users/${user.id || "1"}`)
                            }
                            disabled={refreshing}
                          >
                            <Eye className="h-4 w-4" />
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

        {/* Recent Users - UNCHANGED */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Newly registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentUsers.slice(0, 5).map((user, index) => (
                      <TableRow key={user.id || index}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.profileImageUrl} />
                              <AvatarFallback>
                                {user.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.name || "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role || "user"} />
                        </TableCell>
                        <TableCell>
                          <UserStatusBadge isActive={user.isActive || false} />
                        </TableCell>
                        <TableCell>
                          {user.joined || format(new Date(), "MMM dd")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            disabled={refreshing}
                          >
                            <Eye className="h-4 w-4" />
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current platform health metrics</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
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
          <div className="grid gap-6 md:grid-cols-3">
            {/* Performance Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Performance
              </h3>
              {refreshing ? (
                // Skeleton for Performance
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full w-full animate-pulse"></div>
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
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Resources</h3>
              {refreshing ? (
                // Skeleton for Resources
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full w-full animate-pulse"></div>
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
            <div className="space-y-4">
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
                      <div className="h-4 w-4 bg-gray-200 rounded mr-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin/users")}
                    disabled={refreshing}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin/sessions")}
                    disabled={refreshing}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Sessions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => navigate("/admin/analytics")}
                    disabled={refreshing}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    System Analytics
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
