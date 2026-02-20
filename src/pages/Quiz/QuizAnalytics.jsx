import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  Loader2,
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

// Constants
const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"];

const PERFORMANCE_MESSAGES = {
  EXCEPTIONAL: "Exceptional! You're mastering the material.",
  GREAT: "Great work! You're performing very well.",
  GOOD: "Good progress! Keep practicing.",
  FAIR: "You're getting there! Focus on weak areas.",
  NEEDS_IMPROVEMENT: "Keep going! Review the basics and practice regularly.",
};

const PERFORMANCE_THRESHOLDS = {
  EXCEPTIONAL: 90,
  GREAT: 80,
  GOOD: 70,
  FAIR: 60,
};

const TIME_RANGES = {
  WEEK: "week",
  MONTH: "month",
  ALL: "all",
};

const PIE_CHART_SLICES = [
  { name: "90-100%", index: 0 },
  { name: "80-89%", index: 1 },
  { name: "70-79%", index: 2 },
  { name: "60-69%", index: 3 },
  { name: "Below 60%", index: 4 },
];

const RECOMMENDATIONS = [
  "Focus on topics with scores below 70%",
  "Take quizzes regularly to maintain progress",
  "Review explanations for incorrect answers",
];

const TIME_RANGE_OPTIONS = [
  { value: TIME_RANGES.WEEK, label: "This Week" },
  { value: TIME_RANGES.MONTH, label: "This Month" },
  { value: TIME_RANGES.ALL, label: "All Time" },
];

const QuizAnalytics = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [timeRange, setTimeRange] = useState(TIME_RANGES.ALL);
  const [hasRealData, setHasRealData] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.QUIZ.SESSION_ANALYTICS(sessionId, timeRange),
      );

      if (response.data) {
        const data = response.data;

        // Check if we have real data
        const hasData = Boolean(
          (data.totalQuizzes && data.totalQuizzes > 0) ||
          data.dailyPerformance?.length > 0 ||
          data.topicPerformance?.length > 0,
        );

        setHasRealData(hasData);
        setAnalytics(data);

        if (!hasData) {
          toast.info(
            "No analytics data available yet. Take quizzes to see your performance.",
            { position: "bottom-right" },
          );
        }

        // Fetch topic performance separately
        try {
          const topicResponse = await axiosInstance.get(
            API_PATHS.QUIZ.SESSION_TOPICS(sessionId),
          );

          if (topicResponse.data?.topicPerformance?.length > 0) {
            setAnalytics((prev) => ({
              ...prev,
              topicPerformance: topicResponse.data.topicPerformance,
            }));
            setHasRealData(true);
          }
        } catch (topicError) {
          // Silently fail - optional data
        }
      }
    } catch (error) {
      setHasRealData(false);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatTime = useCallback((seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const getPerformanceMessage = useCallback((score) => {
    if (score >= PERFORMANCE_THRESHOLDS.EXCEPTIONAL)
      return PERFORMANCE_MESSAGES.EXCEPTIONAL;
    if (score >= PERFORMANCE_THRESHOLDS.GREAT)
      return PERFORMANCE_MESSAGES.GREAT;
    if (score >= PERFORMANCE_THRESHOLDS.GOOD) return PERFORMANCE_MESSAGES.GOOD;
    if (score >= PERFORMANCE_THRESHOLDS.FAIR) return PERFORMANCE_MESSAGES.FAIR;
    return PERFORMANCE_MESSAGES.NEEDS_IMPROVEMENT;
  }, []);

  const handleExportAnalytics = useCallback(() => {
    if (!analytics || !hasRealData) {
      toast.info("No analytics data to export", { position: "bottom-right" });
      return;
    }

    try {
      const exportData = {
        session: sessionInfo?.role || "Interview Preparation",
        exportDate: new Date().toISOString(),
        timeRange,
        analytics,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-analytics-${sessionInfo?.role?.replace(/\s+/g, "-") || "interview"}-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Analytics exported successfully!", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Failed to export analytics", { position: "bottom-right" });
    }
  }, [analytics, sessionInfo, timeRange, hasRealData]);

  const pieChartData = useMemo(() => {
    if (!analytics?.scoreDistribution || !hasRealData) return [];

    return PIE_CHART_SLICES.map(({ name, index }) => ({
      name,
      value: analytics.scoreDistribution[index] || 0,
    }));
  }, [analytics, hasRealData]);

  const hasPieChartData = useMemo(
    () => pieChartData.some((item) => item.value > 0),
    [pieChartData],
  );

  const hasChartData = useMemo(
    () =>
      hasRealData &&
      Boolean(
        analytics?.dailyPerformance?.length > 0 ||
        analytics?.topicPerformance?.length > 0 ||
        hasPieChartData,
      ),
    [analytics, hasRealData, hasPieChartData],
  );

  const currentTimeRangeLabel = useMemo(
    () =>
      TIME_RANGE_OPTIONS.find((opt) => opt.value === timeRange)?.label ||
      "All Time",
    [timeRange],
  );

  const pieChartTotal = useMemo(
    () => pieChartData.reduce((sum, item) => sum + item.value, 0),
    [pieChartData],
  );

  const renderPieChartLabel = useCallback(
    ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
    },
    [],
  );

  const renderPieChartTooltip = useCallback(
    ({ payload }) => {
      if (!payload?.length) return null;
      const item = payload[0].payload;
      const percentage =
        pieChartTotal > 0 ? ((item.value / pieChartTotal) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm">
            {item.value} quizzes ({percentage}%)
          </p>
        </div>
      );
    },
    [pieChartTotal],
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">
            Loading Analytics...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-[1400px]">
        {/* Header */}
        <div className="flex justify-between mb-8 gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/interview-prep/${sessionId}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <p className="hidden md:block">Back to Session</p>
          </Button>

          <div className="flex gap-2">
            <h1 className="text-3xl font-bold hidden md:block">
              Quiz Analytics
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop: Tabs */}
            {hasRealData && (
              <div className="hidden md:block">
                <Tabs
                  value={timeRange}
                  onValueChange={setTimeRange}
                  className="w-auto"
                >
                  <TabsList>
                    {TIME_RANGE_OPTIONS.map(({ value, label }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="cursor-pointer"
                      >
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Mobile: Dropdown */}
            {hasRealData && (
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[120px] justify-between"
                    >
                      {currentTimeRangeLabel}
                      <ChevronDown className="ml-2 h-4 w-4 cursor-pointer" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[120px]">
                    {TIME_RANGE_OPTIONS.map(({ value, label }) => (
                      <DropdownMenuItem
                        key={value}
                        className="cursor-pointer"
                        onClick={() => setTimeRange(value)}
                      >
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {hasRealData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Average Score Card */}
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

              {/* Best Score Card */}
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

              {/* Total Quizzes Card */}
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

              {/* Total Time Card */}
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
                {analytics.dailyPerformance?.length > 0 && (
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
                {analytics.topicPerformance?.length > 0 && (
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
                      Complete more quizzes to generate performance charts and
                      trends.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score Distribution */}
            {hasPieChartData && (
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
                          label={renderPieChartLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={renderPieChartTooltip} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

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
                        {RECOMMENDATIONS.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                            <span>{rec}</span>
                          </li>
                        ))}
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