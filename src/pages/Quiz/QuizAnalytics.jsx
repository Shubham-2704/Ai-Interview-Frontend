import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast as hotToast } from "react-hot-toast";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  Calendar,
  Download,
  Users,
  Award,
  Zap,
  Brain,
  ChevronDown,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QuizAnalytics = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [timeRange, setTimeRange] = useState("all");
  const [hasRealData, setHasRealData] = useState(false);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"];

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/quiz/session/${sessionId}/analytics?range=${timeRange}`,
      );

      if (response.data) {
        // Check if we have real data (not empty arrays or zeros)
        const hasData = 
          (response.data.totalQuizzes && response.data.totalQuizzes > 0) ||
          (response.data.dailyPerformance && response.data.dailyPerformance.length > 0) ||
          (response.data.topicPerformance && response.data.topicPerformance.length > 0);
        
        setHasRealData(hasData);
        setAnalytics(response.data);

        if (!hasData) {
          // Show info toast if no data
          hotToast.success("No analytics data available yet. Take quizzes to see your performance.", { position: "bottom-right", icon: "ℹ️", style: {border: "1px solid #3b82f6", background: "#eff6ff", color: "#1e40af",},});
        }

        // Fetch topic performance separately
        try {
          const topicResponse = await axiosInstance.get(
            `/quiz/session/${sessionId}/topics`,
          );

          if (topicResponse.data?.topicPerformance && topicResponse.data.topicPerformance.length > 0) {
            setAnalytics((prev) => ({
              ...prev,
              topicPerformance: topicResponse.data.topicPerformance,
            }));
            setHasRealData(true);
          }
        } catch (topicError) {
        }
      }
    } catch (error) {
      
      // Don't set dummy data - just show empty state
      setHasRealData(false);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatTime = (seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Exceptional! You're mastering the material.";
    if (score >= 80) return "Great work! You're performing very well.";
    if (score >= 70) return "Good progress! Keep practicing.";
    if (score >= 60) return "You're getting there! Focus on weak areas.";
    return "Keep going! Review the basics and practice regularly.";
  };

  const handleExportAnalytics = () => {
    if (!analytics || !hasRealData) {
      hotToast.success("No analytics data to export", { position: "bottom-right", icon: "ℹ️", style: {border: "1px solid #3b82f6", background: "#eff6ff", color: "#1e40af",},});
      return;
    }

    try {
      const exportData = {
        session: sessionInfo?.role || "Interview Preparation",
        exportDate: new Date().toISOString(),
        timeRange: timeRange,
        analytics: analytics,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-analytics-${sessionInfo?.role?.replace(/\s+/g, "-") || "interview"}-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      hotToast.success("Analytics exported successfully!", { position: "top-center" });
    } catch (error) {
      hotToast.error("Failed to export analytics", { position: "bottom-right" });
    }
  };

  // Prepare pie chart data
  const getPieChartData = () => {
    if (!analytics?.scoreDistribution || !hasRealData) return [];

    return [
      { name: "90-100%", value: analytics.scoreDistribution[0] || 0 },
      { name: "80-89%", value: analytics.scoreDistribution[1] || 0 },
      { name: "70-79%", value: analytics.scoreDistribution[2] || 0 },
      { name: "60-69%", value: analytics.scoreDistribution[3] || 0 },
      { name: "Below 60%", value: analytics.scoreDistribution[4] || 0 },
    ];
  };

  const pieChartData = getPieChartData();
  const hasPieChartData = pieChartData.some((item) => item.value > 0);

  // Check if there's any data to show in charts
  const hasChartData = hasRealData && (
    (analytics.dailyPerformance && analytics.dailyPerformance.length > 0) ||
    (analytics.topicPerformance && analytics.topicPerformance.length > 0) ||
    hasPieChartData
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        {/* Header */}
        <div className="flex justify-between mb-8 gap-4">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate(`/interview-prep/${sessionId}`)}
              className="gap-2 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <p className="hidden md:block">Back to Session</p>
            </Button>
          </div>
          <div className="flex gap-2">
            <h1 className="text-3xl font-bold hidden md:block">Quiz </h1>
            <h1 className="text-3xl font-bold hidden md:block"> Analytics</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop: Tabs (hidden on mobile) - only show if we have data */}
            {hasRealData && (
              <div className="hidden md:block">
                <Tabs
                  value={timeRange}
                  onValueChange={setTimeRange}
                  className="w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="week" className="cursor-pointer">
                      This Week
                    </TabsTrigger>
                    <TabsTrigger value="month" className="cursor-pointer">
                      This Month
                    </TabsTrigger>
                    <TabsTrigger value="all" className="cursor-pointer">
                      All Time
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Mobile: Dropdown (visible on mobile) - only show if we have data */}
            {hasRealData && (
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[120px] justify-between"
                    >
                      {timeRange === "week" && "This Week"}
                      {timeRange === "month" && "This Month"}
                      {timeRange === "all" && "All Time"}
                      <ChevronDown className="ml-2 h-4 w-4 cursor-pointer" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[120px]">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setTimeRange("week")}
                    >
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setTimeRange("month")}
                    >
                      This Month
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setTimeRange("all")}
                    >
                      All Time
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {hasRealData && (
              <Button
                variant="outline"
                onClick={handleExportAnalytics}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        ) : hasRealData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Average Score
                      </p>
                      <p className="text-3xl font-bold">
                        {analytics.averageScore?.toFixed(1) || "0"}%
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          {analytics.improvementRate?.toFixed(1) || 0}%
                          improvement
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <Progress
                    value={analytics.averageScore || 0}
                    className="mt-4 h-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Best Score
                      </p>
                      <p className="text-3xl font-bold">
                        {analytics.bestScore?.toFixed(1) || "0"}%
                      </p>
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">
                          Personal Record
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Award className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Quizzes
                      </p>
                      <p className="text-3xl font-bold">
                        {analytics.totalQuizzes || 0}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-muted-foreground">
                          {timeRange} period
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Time
                      </p>
                      <p className="text-3xl font-bold">
                        {formatTime(analytics.totalTimeSpent || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-muted-foreground">
                          Practice time
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Zap className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            {hasChartData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Score Trend Chart */}
                {analytics.dailyPerformance && analytics.dailyPerformance.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Score Trend Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 w-full min-w-0">
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                          minHeight={200}
                        >
                          <LineChart data={analytics.dailyPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              domain={[0, 100]}
                              tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                              formatter={(value) => [`${value}%`, "Score"]}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Score %"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Topic Performance */}
                {analytics.topicPerformance && analytics.topicPerformance.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Topic Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 w-full min-w-0">
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                          minHeight={200}
                        >
                          <BarChart data={analytics.topicPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="topic"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              domain={[0, 100]}
                              tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                              formatter={(value) => [`${value}%`, "Score"]}
                            />
                            <Legend />
                            <Bar
                              dataKey="score"
                              fill="#82ca9d"
                              name="Score %"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Chart Data Yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Complete more quizzes to generate performance charts and trends.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score Distribution */}
            {hasPieChartData ? (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full min-w-0">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                      minHeight={200}
                    >
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            
                            return (
                              <text
                                x={x}
                                y={y}
                                fill="white"
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                fontSize={12}
                                fontWeight="bold"
                              >
                                {`${(percent * 100).toFixed(0)}%`}
                              </text>
                            );
                          }}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            const total = pieChartData.reduce(
                              (sum, item) => sum + item.value,
                              0,
                            );
                            const percentage =
                              total > 0
                                ? ((value / total) * 100).toFixed(1)
                                : 0;
                            return [
                              `${value} quizzes (${percentage}%)`,
                              props.payload.name,
                            ];
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Overall Performance
                    </h4>
                    <p className="text-muted-foreground">
                      {getPerformanceMessage(analytics.averageScore || 0)}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Completion Rate
                        </p>
                        <p className="text-2xl font-bold">
                          {analytics.completionRate?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Improvement Rate
                        </p>
                        <p className="text-2xl font-bold">
                          {analytics.improvementRate?.toFixed(1) || 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Recommendations</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                          <span>Focus on topics with scores below 70%</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                          <span>
                            Take quizzes regularly to maintain progress
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                          <span>Review explanations for incorrect answers</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Next Steps</h4>
                      <div className="space-y-3">
                        <Button
                          onClick={() => navigate(`/quiz/${sessionId}`)}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          Take Another Quiz
                        </Button>
                        <Button
                          onClick={() => navigate(`/quiz/${sessionId}/history`)}
                          className="w-full justify-start"
                          variant="outline"
                        >
                          Review Quiz History
                        </Button>
                        <Button
                          onClick={() =>
                            navigate(`/interview-prep/${sessionId}`)
                          }
                          className="w-full justify-start"
                          variant="outline"
                        >
                          Study Session Questions
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Analytics Available
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Take some quizzes to see detailed performance analytics and
                track your progress over time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate(`/quiz/${sessionId}`)}
                  size="lg"
                >
                  Start Your First Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/quiz/${sessionId}/history`)}
                  size="lg"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Quiz History
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizAnalytics;