import React, { useState, useEffect, useCallback } from "react";
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
  TrendingDown,
  Users,
  Award,
  Zap,
  Brain,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const QuizAnalytics = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [timeRange, setTimeRange] = useState("all"); // 'week', 'month', 'all'

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/quiz/session/${sessionId}/analytics?range=${timeRange}`,
      );

      if (response.data) {
        setAnalytics(response.data);

        // Fetch topic performance separately
        const topicResponse = await axiosInstance.get(
          `/quiz/session/${sessionId}/topics`,
        );

        if (topicResponse.data?.topicPerformance) {
          setAnalytics((prev) => ({
            ...prev,
            topicPerformance: topicResponse.data.topicPerformance,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);

      // Fallback mock data
      setAnalytics({
        averageScore: 75.5,
        bestScore: 92.3,
        totalQuizzes: 8,
        totalTimeSpent: 4567,
        completionRate: 87.5,
        improvementRate: 15.2,
        scoreDistribution: [20, 30, 25, 15, 10],
        dailyPerformance: [
          { date: "2024-01-01", score: 70 },
          { date: "2024-01-08", score: 75 },
          { date: "2024-01-15", score: 80 },
          { date: "2024-01-22", score: 85 },
          { date: "2024-01-29", score: 90 },
        ],
        topicPerformance: [
          { topic: "Algorithms", score: 85 },
          { topic: "Data Structures", score: 78 },
          { topic: "System Design", score: 92 },
          { topic: "JavaScript", score: 88 },
          { topic: "React", score: 95 },
        ],
      });

      toast.error("Using demo data. Backend analytics not configured.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, timeRange]);

  //   const fetchSessionInfo = useCallback(async () => {
  //     try {
  //       const response = await axiosInstance.get(`/sessions/${sessionId}`);
  //       if (response.data?.session) {
  //         setSessionInfo(response.data.session);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch session info:", error);
  //     }
  //   }, [sessionId]);

  useEffect(() => {
    fetchAnalytics();
    // fetchSessionInfo();
  }, [fetchAnalytics]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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
    if (!analytics) return;

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

      toast.success("Analytics exported successfully!");
    } catch (error) {
      toast.error("Failed to export analytics");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(`/interview-prep/${sessionId}`)}
              className="gap-2 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Session
            </Button>
            <h1 className="text-3xl font-bold">Quiz Analytics</h1>
            {sessionInfo && (
              <p className="text-muted-foreground">
                {sessionInfo.role} • {sessionInfo.experience} years experience
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Tabs
              value={timeRange}
              onValueChange={setTimeRange}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="month">This Month</TabsTrigger>
                <TabsTrigger value="all">All Time</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              onClick={handleExportAnalytics}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics...</p>
          </div>
        ) : analytics ? (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Score Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Score Trend Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.dailyPerformance || []}>
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

              {/* Topic Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Topic Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topicPerformance || []}>
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
            </div>

            {/* Score Distribution */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "90-100%",
                            value: analytics.scoreDistribution?.[0] || 0,
                          },
                          {
                            name: "80-89%",
                            value: analytics.scoreDistribution?.[1] || 0,
                          },
                          {
                            name: "70-79%",
                            value: analytics.scoreDistribution?.[2] || 0,
                          },
                          {
                            name: "60-69%",
                            value: analytics.scoreDistribution?.[3] || 0,
                          },
                          {
                            name: "Below 60%",
                            value: analytics.scoreDistribution?.[4] || 0,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Percentage"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

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
              <Button onClick={() => navigate(`/quiz/${sessionId}`)}>
                Start Your First Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizAnalytics;
