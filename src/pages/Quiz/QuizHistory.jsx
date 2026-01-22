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
  RefreshCw,
  Download,
  Trash2,
  FileText,
  BarChart3,
  Eye,
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

    try {
      await axiosInstance.delete(API_PATHS.QUIZ.DELETE(quizToDelete));
      toast.success("Quiz deleted successfully");
      fetchQuizHistory();
    } catch (error) {
      toast.error("Failed to delete quiz");
    } finally {
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
            <h1 className="text-3xl font-bold">Quiz History</h1>
            {sessionInfo && (
              <p className="text-muted-foreground">
                {sessionInfo.role} • {sessionInfo.experience} years experience
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(`/quiz/${sessionId}`)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              New Quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/quiz/${sessionId}/analytics`)}
              className="gap-2"
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
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {quizzes.slice(0, 10).map((quiz, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80"
                      style={{
                        height: `${(quiz.percentage || 0) * 0.6}px`,
                        backgroundColor:
                          quiz.percentage >= 80
                            ? "#10b981"
                            : quiz.percentage >= 60
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                      title={`${quiz.percentage?.toFixed(1)}% on ${format(new Date(quiz.createdAt), "MMM dd")}`}
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      {format(new Date(quiz.createdAt), "MM/dd")}
                    </div>
                  </div>
                ))}
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
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteQuiz}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default QuizHistory;
