import React, { useState, useEffect, useCallback } from "react";
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
  Info, // Added Loader2 for loading spinner
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

const QuizHistory = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false); // Added deleting state

  const fetchQuizHistory = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.QUIZ.SESSION_QUIZZES(sessionId),
      );
      setQuizzes(response.data || []);
    } catch (error) {
      toast.error("Failed to load quiz history");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  //   const fetchSessionInfo = useCallback(async () => {
  //     try {
  //       const response = await axiosInstance.get(`/api/sessions/${sessionId}`);
  //       if (response.data?.session) {
  //         setSessionInfo(response.data.session);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch session info:", error);
  //     }
  //   }, [sessionId]);

  useEffect(() => {
    fetchQuizHistory();
    // fetchSessionInfo();
  }, [fetchQuizHistory]);

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    setDeleting(true); // Start loading
    try {
      await axiosInstance.delete(API_PATHS.QUIZ.DELETE(quizToDelete));
      toast.success("Quiz deleted successfully");
      fetchQuizHistory();
    } catch (error) {
      toast.error("Failed to delete quiz");
    } finally {
      setDeleting(false); // Stop loading
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (percentage) => {
    if (percentage >= 90)
      return {
        label: "Excellent",
        variant: "default",
        color: "bg-green-100 text-green-800",
      };
    if (percentage >= 80)
      return {
        label: "Great",
        variant: "default",
        color: "bg-blue-100 text-blue-800",
      };
    if (percentage >= 70)
      return {
        label: "Good",
        variant: "secondary",
        color: "bg-yellow-100 text-yellow-800",
      };
    if (percentage >= 60)
      return {
        label: "Fair",
        variant: "outline",
        color: "bg-orange-100 text-orange-800",
      };
    return {
      label: "Needs Practice",
      variant: "destructive",
      color: "bg-red-100 text-red-800",
    };
  };

  const formatTimeSpent = (seconds) => {
    if (!seconds || seconds === 0) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateStats = () => {
    if (quizzes.length === 0) return null;

    const totalQuizzes = quizzes.length;
    const totalScore = quizzes.reduce(
      (sum, quiz) => sum + (quiz.percentage || 0),
      0,
    );
    const averageScore = totalScore / totalQuizzes;
    const bestScore = Math.max(...quizzes.map((q) => q.percentage || 0));
    const totalTime = quizzes.reduce(
      (sum, quiz) => sum + (quiz.timeSpent || 0),
      0,
    );

    return {
      totalQuizzes,
      averageScore,
      bestScore,
      totalTime,
    };
  };

  const stats = calculateStats();

  const handleExportAll = async () => {
    if (quizzes.length === 0) {
      toast.info("No quizzes to export");
      return;
    }

    try {
      const exportData = {
        session: sessionInfo?.role || "Interview Preparation",
        totalQuizzes: quizzes.length,
        exportDate: new Date().toISOString(),
        quizzes: quizzes.map((quiz) => ({
          id: quiz._id,
          date: quiz.createdAt,
          score: quiz.score,
          total: quiz.totalQuestions,
          percentage: quiz.percentage,
          timeSpent: quiz.timeSpent,
          status: quiz.status,
        })),
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

      toast.success(`Exported ${quizzes.length} quiz attempts`);
    } catch (error) {
      toast.error("Failed to export quiz history");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-[1400px]">
        {/* Header */}
        <div className="flex justify-between mb-4 md:mb-8 gap-4">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate(`/interview-prep/${sessionId}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <p className="hidden md:block">Back to Session</p>
            </Button>
          </div>
          <div className="flex gap-2">
            <h1 className="text-3xl font-bold hidden md:block">Quiz</h1>
            <h1 className="text-2xl md:text-3xl font-bold hidden md:block">
              History
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/quiz/${sessionId}`)}
              className="gap-2 text-orange-500 bg:orange-100 hover:bg-orange-200 hover:text-orange-500"
            >
              <Plus className="h-4 w-4" />
              New Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/quiz/${sessionId}/analytics`)}
              className="gap-2  text-blue-500 bg:blue-100 hover:bg-blue-200 hover:text-blue-500"
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
                <div className="space-y-3">
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
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Best Score
                      </p>
                      <p className="text-3xl font-bold">
                        {stats.bestScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Time
                      </p>
                      <p className="text-3xl font-bold">
                        {Math.floor(stats.totalTime / 60)}m
                      </p>
                    </div>
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
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
                      return (
                        <TableRow key={quiz._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(quiz.createdAt),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                {format(new Date(quiz.createdAt), "hh:mm a")}
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
                                onClick={async () => {
                                  try {
                                    const response = await axiosInstance.get(
                                      API_PATHS.QUIZ.RESULTS(quiz._id),
                                    );
                                    const dataStr = JSON.stringify(
                                      response.data,
                                      null,
                                      2,
                                    );
                                    const dataBlob = new Blob([dataStr], {
                                      type: "application/json",
                                    });
                                    const url = URL.createObjectURL(dataBlob);
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = `quiz-${quiz._id}-${new Date(quiz.createdAt).toISOString().split("T")[0]}.json`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                    toast.success("Quiz exported!");
                                  } catch (error) {
                                    toast.error("Failed to export quiz");
                                  }
                                }}
                                className="gap-1"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setQuizToDelete(quiz._id);
                                  setDeleteDialogOpen(true);
                                }}
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
        {quizzes.length > 1 && (
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
                    {quizzes.slice(0, 10).map((quiz, index) => (
                      <div
                        key={index}
                        className="flex-1 flex flex-col items-center group relative"
                      >
                        {/* Bar */}
                        <div
                          className="w-full rounded-t-lg transition-all duration-200 hover:opacity-90 relative"
                          style={{
                            height: `${(quiz.percentage || 0) * 0.6}px`,
                            backgroundColor:
                              quiz.percentage >= 80
                                ? "#10b981"
                                : quiz.percentage >= 60
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        >
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                            <div className="font-semibold">
                              {quiz.percentage?.toFixed(1) || 0}%
                            </div>
                            <div className="text-gray-300">
                              {format(new Date(quiz.createdAt), "MMM dd, yyyy")}
                            </div>
                            <div className="text-gray-300">
                              Score: {quiz.score || 0}/
                              {quiz.totalQuestions || 0}
                            </div>
                            <div className="text-gray-300">
                              Time:{" "}
                              {quiz.timeSpent
                                ? `${Math.floor(quiz.timeSpent / 60)}m ${quiz.timeSpent % 60}s`
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        {/* Date Label */}
                        <div className="text-xs text-muted-foreground mt-2">
                          {format(new Date(quiz.createdAt), "MM/dd")}
                        </div>

                        {/* Attempt Number */}
                        <div className="text-xs text-gray-500 mt-1">
                          #{quizzes.length - index}
                        </div>
                      </div>
                    ))}
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
                  {(() => {
                    const recentQuizzes = quizzes.slice(
                      0,
                      Math.min(quizzes.length, 5),
                    );
                    const avgScore =
                      recentQuizzes.reduce(
                        (sum, q) => sum + (q.percentage || 0),
                        0,
                      ) / recentQuizzes.length;
                    const highestScore = Math.max(
                      ...recentQuizzes.map((q) => q.percentage || 0),
                    );
                    const lowestScore = Math.min(
                      ...recentQuizzes.map((q) => q.percentage || 0),
                    );

                    return (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {avgScore.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Score (Last 5)
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {highestScore.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Best Score
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {lowestScore.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Lowest Score
                          </div>
                        </div>
                      </>
                    );
                  })()}
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
                disabled={deleting} // Disable cancel button during delete
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteQuiz}
                disabled={deleting} // Disable delete button during delete
              >
                {deleting ? ( // Show loading spinner when deleting
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
