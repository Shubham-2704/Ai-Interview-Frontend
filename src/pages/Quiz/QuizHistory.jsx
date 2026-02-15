import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trophy,
  TrendingUp,
  Download,
  Trash2,
  FileText,
  BarChart3,
  Eye,
  Plus,
  Loader2,
  Info,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Constants
const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  EXCELLENT_LABEL: "Excellent",
  GREAT_LABEL: "Great",
  GOOD_LABEL: "Good",
  FAIR_LABEL: "Fair",
  NEEDS_PRACTICE_LABEL: "Needs Practice",
};

const PERFORMANCE_COLORS = {
  EXCELLENT: "bg-green-100 text-green-800",
  GREAT: "bg-blue-100 text-blue-800",
  GOOD: "bg-yellow-100 text-yellow-800",
  FAIR: "bg-orange-100 text-orange-800",
  NEEDS_PRACTICE: "bg-red-100 text-red-800",
};

const BAR_CHART_COLORS = {
  HIGH: "#10b981",
  MEDIUM: "#f59e0b",
  LOW: "#ef4444",
};

const QuizHistory = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuizHistory = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.QUIZ.SESSION_QUIZZES(sessionId),
      );
      setQuizzes(response.data || []);
    } catch (error) {
      toast.error("Failed to load quiz history", { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    setDeleting(true); // Start loading
    try {
      await axiosInstance.delete(API_PATHS.QUIZ.DELETE(quizToDelete));
      toast.success("Quiz deleted successfully", { position: "top-center" });
      fetchQuizHistory();
    } catch (error) {
      toast.error("Failed to delete quiz", { position: "bottom-right" });
    } finally {
      setDeleting(false); // Stop loading
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const getPerformanceColor = useCallback((percentage) => {
    if (percentage >= PERFORMANCE_THRESHOLDS.EXCELLENT) return "text-green-600";
    if (percentage >= PERFORMANCE_THRESHOLDS.GOOD) return "text-yellow-600";
    return "text-red-600";
  }, []);

  const getPerformanceBadge = useCallback((percentage) => {
    if (percentage >= 90) {
      return {
        label: PERFORMANCE_THRESHOLDS.EXCELLENT_LABEL,
        variant: "default",
        color: PERFORMANCE_COLORS.EXCELLENT,
      };
    }
    if (percentage >= 80) {
      return {
        label: PERFORMANCE_THRESHOLDS.GREAT_LABEL,
        variant: "default",
        color: PERFORMANCE_COLORS.GREAT,
      };
    }
    if (percentage >= 70) {
      return {
        label: PERFORMANCE_THRESHOLDS.GOOD_LABEL,
        variant: "secondary",
        color: PERFORMANCE_COLORS.GOOD,
      };
    }
    if (percentage >= 60) {
      return {
        label: PERFORMANCE_THRESHOLDS.FAIR_LABEL,
        variant: "outline",
        color: PERFORMANCE_COLORS.FAIR,
      };
    }
    return {
      label: PERFORMANCE_THRESHOLDS.NEEDS_PRACTICE_LABEL,
      variant: "destructive",
      color: PERFORMANCE_COLORS.NEEDS_PRACTICE,
    };
  }, []);

  const formatTimeSpent = useCallback((seconds) => {
    if (!seconds || seconds === 0) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }, []);

  const formatDateTime = useCallback(
    (date) => ({
      date: format(new Date(date), "MMM dd, yyyy"),
      time: format(new Date(date), "hh:mm a"),
      shortDate: format(new Date(date), "MM/dd"),
    }),
    [],
  );

  const stats = useMemo(() => {
    if (quizzes.length === 0) return null;

    const totalQuizzes = quizzes.length;
    const percentages = quizzes.map((q) => q.percentage || 0);
    const totalScore = percentages.reduce((sum, p) => sum + p, 0);
    const averageScore = totalScore / totalQuizzes;
    const bestScore = Math.max(...percentages);
    const totalTime = quizzes.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

    return {
      totalQuizzes,
      averageScore,
      bestScore,
      totalTime,
    };
  }, [quizzes]);

  const recentStats = useMemo(() => {
    if (quizzes.length === 0) return null;

    const recentQuizzes = quizzes.slice(0, Math.min(quizzes.length, 5));
    const percentages = recentQuizzes.map((q) => q.percentage || 0);
    const avgScore =
      percentages.reduce((sum, p) => sum + p, 0) / recentQuizzes.length;
    const highestScore = Math.max(...percentages);
    const lowestScore = Math.min(...percentages);

    return { avgScore, highestScore, lowestScore };
  }, [quizzes]);

  const handleExportAll = useCallback(async () => {
    if (quizzes.length === 0) {
      toast.info("No quizzes to export", { position: "bottom-right" });
      return;
    }

    try {
      const exportData = {
        session: sessionInfo?.role || "Interview Preparation",
        totalQuizzes: quizzes.length,
        exportDate: new Date().toISOString(),
        quizzes: quizzes.map(
          ({
            _id,
            createdAt,
            score,
            totalQuestions,
            percentage,
            timeSpent,
            status,
          }) => ({
            id: _id,
            date: createdAt,
            score,
            total: totalQuestions,
            percentage,
            timeSpent,
            status,
          }),
        ),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-history-${sessionInfo?.role?.replace(/\s+/g, "-") || "interview"}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${quizzes.length} quiz attempts!`, {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Failed to export quiz history", {
        position: "bottom-right",
      });
    }
  }, [quizzes, sessionInfo]);

  const handleExportSingle = useCallback(async (quiz) => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.QUIZ.RESULTS(quiz._id),
      );
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-${quiz._id}-${new Date(quiz.createdAt).toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Quiz exported!", { position: "top-center" });
    } catch (error) {
      toast.error("Failed to export quiz", { position: "bottom-right" });
    }
  }, []);

  const handleDeleteClick = useCallback((quizId) => {
    setQuizToDelete(quizId);
    setDeleteDialogOpen(true);
  }, []);

  const getBarColor = useCallback((percentage) => {
    if (percentage >= PERFORMANCE_THRESHOLDS.EXCELLENT)
      return BAR_CHART_COLORS.HIGH;
    if (percentage >= PERFORMANCE_THRESHOLDS.GOOD)
      return BAR_CHART_COLORS.MEDIUM;
    return BAR_CHART_COLORS.LOW;
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-2 md:py-4 max-w-[1400px]">
        {/* Header */}
        <div className="flex justify-between mb-4 md:mb-4 gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/interview-prep/${sessionId}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <p className="hidden md:block">Back to Session</p>
          </Button>

          <div className="flex gap-2">
            <h1 className="text-3xl font-bold hidden md:block">Quiz</h1>
            <h1 className="text-2xl md:text-3xl font-bold hidden md:block">
              History
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(`/quiz/${sessionId}`)}
              className="gap-2 text-orange-500 bg:orange-100 hover:bg-orange-200 hover:text-black"
            >
              <Plus className="h-4 w-4" />
              New Quiz
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/quiz/${sessionId}/analytics`)}
              className="gap-2 text-blue-500 bg:blue-100 hover:bg-blue-200 hover:text-black"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Attempts
                    </p>
                    <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Average Score
                      </p>
                      <p className="text-3xl font-bold">
                        {stats.averageScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={stats.averageScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Best Score</p>
                    <p className="text-3xl font-bold">
                      {stats.bestScore.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                    <p className="text-3xl font-bold">
                      {Math.floor(stats.totalTime / 60)}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quiz History Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quiz Attempts</CardTitle>
              {quizzes.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAll}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">
                  Loading quiz history...
                </p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Quiz History Yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Take your first quiz to start tracking your progress and
                  improvement over time.
                </p>
                <Button onClick={() => navigate(`/quiz/${sessionId}`)}>
                  Start Your First Quiz
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes.map((quiz) => {
                      const performance = getPerformanceBadge(
                        quiz.percentage || 0,
                      );
                      const dateTime = formatDateTime(quiz.createdAt);
                      return (
                        <TableRow key={quiz._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{dateTime.date}</span>
                              <span className="text-muted-foreground text-sm">
                                {dateTime.time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span
                                className={`text-xl font-bold ${getPerformanceColor(quiz.percentage || 0)}`}
                              >
                                {quiz.score || 0}/{quiz.totalQuestions || 0}
                              </span>
                              <div className="text-sm text-muted-foreground">
                                {quiz.percentage?.toFixed(1) || 0}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={performance.variant}
                              className={performance.color}
                            >
                              {performance.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {formatTimeSpent(quiz.timeSpent)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                quiz.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {quiz.status || "active"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/quiz/${sessionId}?review=${quiz._id}`,
                                  )
                                }
                                className="gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Review
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExportSingle(quiz)}
                                className="gap-1"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(quiz._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Trends Section */}
        {quizzes.length > 1 && recentStats && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Performance Trends
                  <div className="relative group">
                    <Info className="h-4 w-4 text-gray-400 cursor-help hidden md:block" />
                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 w-64">
                      <p className="font-semibold mb-1">📊 Performance Chart</p>
                      <ul className="space-y-1">
                        <li>• Bar height = Your score percentage</li>
                        <li>• Green: 80%+ (Excellent)</li>
                        <li>• Yellow: 60-79% (Good)</li>
                        <li>• Red: Below 60% (Needs Practice)</li>
                        <li>• Hover over bars for details</li>
                      </ul>
                    </div>
                  </div>
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  Last {Math.min(quizzes.length, 10)} attempts
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Bar Chart with Enhanced Tooltips */}
                <div className="h-64 flex items-end gap-2 relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-muted-foreground">
                    <span>100%</span>
                    <span>80%</span>
                    <span>60%</span>
                    <span>40%</span>
                    <span>20%</span>
                    <span>0%</span>
                  </div>

                  {/* Bars */}
                  <div className="ml-8 flex-1 flex items-end gap-2">
                    {quizzes.slice(0, 10).map((quiz, index) => {
                      const dateTime = formatDateTime(quiz.createdAt);
                      const percentage = quiz.percentage || 0;

                      return (
                        <div
                          key={quiz._id}
                          className="flex-1 flex flex-col items-center group relative"
                        >
                          {/* Bar */}
                          <div
                            className="w-full rounded-t-lg transition-all duration-200 hover:opacity-90 relative"
                            style={{
                              height: `${percentage * 0.6}px`,
                              backgroundColor: getBarColor(percentage),
                            }}
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                              <div className="font-semibold">
                                {percentage.toFixed(1)}%
                              </div>
                              <div className="text-gray-300">
                                {dateTime.date}
                              </div>
                              <div className="text-gray-300">
                                Score: {quiz.score || 0}/
                                {quiz.totalQuestions || 0}
                              </div>
                              <div className="text-gray-300">
                                Time: {formatTimeSpent(quiz.timeSpent)}
                              </div>
                            </div>
                          </div>

                          {/* Date Label */}
                          <div className="text-xs text-muted-foreground mt-2">
                            {dateTime.shortDate}
                          </div>

                          {/* Attempt Number */}
                          <div className="text-xs text-gray-500 mt-1">
                            #{quizzes.length - index}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Performance Zones Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-gray-700">Excellent (80-100%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-700">Good (60-79%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-700">
                      Needs Practice (0-59%)
                    </span>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {recentStats.avgScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg Score (Last 5)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {recentStats.highestScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Best Score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {recentStats.lowestScore.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Lowest Score
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Quiz Attempt</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this quiz attempt? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteQuiz}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default QuizHistory;