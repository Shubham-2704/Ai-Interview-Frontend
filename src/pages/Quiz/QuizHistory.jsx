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
  LogOut,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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

const SUBMISSION_TYPE = {
  MANUAL: "manual",
  AUTO: "auto",
  BACK_BUTTON: "back_button",
};

const STATUS_CONFIG = {
  [SUBMISSION_TYPE.MANUAL]: {
    label: "Completed",
    variant: "default",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-200"
  },
  [SUBMISSION_TYPE.AUTO]: {
    label: "Auto-Submitted",
    variant: "secondary",
    icon: Clock,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    borderColor: "border-orange-200"
  },
  [SUBMISSION_TYPE.BACK_BUTTON]: {
    label: "Navigation Submitted",
    variant: "outline",
    icon: LogOut,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
    borderColor: "border-purple-200"
  }
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchQuizHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.QUIZ.SESSION_QUIZZES(sessionId)}?page=${currentPage}&limit=${pageSize}`
      );
      setQuizzes(response.data.quizzes || []);
      setTotalItems(response.data.pagination.total);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error("Failed to load quiz history", { position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentPage, pageSize]);

  useEffect(() => {
    fetchQuizHistory();
  }, [fetchQuizHistory]);

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(API_PATHS.QUIZ.DELETE(quizToDelete));
      toast.success("Quiz deleted successfully", { position: "top-center" });
      fetchQuizHistory();
    } catch (error) {
      toast.error("Failed to delete quiz", { position: "bottom-right" });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1);
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

  const getStatusBadge = useCallback((quiz) => {
    let status = quiz.status || 'completed';
    let submissionType = quiz.submissionType || SUBMISSION_TYPE.MANUAL;
    
    const statusToType = {
      'completed': SUBMISSION_TYPE.MANUAL,
      'auto_submitted': SUBMISSION_TYPE.AUTO,
      'navigation_submitted': SUBMISSION_TYPE.BACK_BUTTON
    };
    
    if (status in statusToType) {
      submissionType = statusToType[status];
    }

    const config = STATUS_CONFIG[submissionType] || STATUS_CONFIG[SUBMISSION_TYPE.MANUAL];
    const Icon = config.icon;

    return (
      <Badge 
        variant={config.variant} 
        className={`${config.bgColor} ${config.textColor} border ${config.borderColor} flex items-center gap-1 px-3 py-1`}
      >
        <Icon className={`h-3 w-3 ${config.iconColor}`} />
        {config.label}
      </Badge>
    );
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

    const statusCount = quizzes.reduce((acc, quiz) => {
      const type = quiz.submissionType || SUBMISSION_TYPE.MANUAL;
      if (type === SUBMISSION_TYPE.MANUAL || type === SUBMISSION_TYPE.AUTO || type === SUBMISSION_TYPE.BACK_BUTTON) {
        acc[type] = (acc[type] || 0) + 1;
      } else {
        acc[SUBMISSION_TYPE.MANUAL] = (acc[SUBMISSION_TYPE.MANUAL] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      totalQuizzes,
      averageScore,
      bestScore,
      totalTime,
      statusCount,
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
        totalQuizzes: totalItems,
        exportDate: new Date().toISOString(),
        quizzes: quizzes.map(
          ({
            _id,
            createdAt,
            score,
            totalQuestions,
            percentage,
            timeSpent,
            submissionType,
            status,
          }) => ({
            id: _id,
            date: createdAt,
            score,
            total: totalQuestions,
            percentage,
            timeSpent,
            submissionType: submissionType || SUBMISSION_TYPE.MANUAL,
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
  }, [quizzes, sessionInfo, totalItems]);

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

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5" className="cursor-pointer">5</SelectItem>
              <SelectItem value="10" className="cursor-pointer">10</SelectItem>
              <SelectItem value="20" className="cursor-pointer">20</SelectItem>
              <SelectItem value="50" className="cursor-pointer">50</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 p-0 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {startPage > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  className="w-8 h-8 p-0 cursor-pointer"
                >
                  1
                </Button>
                {startPage > 2 && <span className="text-muted-foreground">...</span>}
              </>
            )}
            {pages}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="text-muted-foreground">...</span>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 p-0"
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-2 md:py-4 max-w-[1400px]">
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

        {stats && (
          <>
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

            {Object.keys(stats.statusCount).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(stats.statusCount).map(([type, count]) => {
                  const config = STATUS_CONFIG[type] || STATUS_CONFIG[SUBMISSION_TYPE.MANUAL];
                  const Icon = config.icon;
                  return (
                    <Card key={type} className="border-l-4" style={{ borderLeftColor: config.iconColor.replace('text-', '') }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">{config.label}</p>
                            <p className="text-2xl font-bold">{count}</p>
                          </div>
                          <Icon className={`h-8 w-8 ${config.iconColor} opacity-50`} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quiz Attempts</CardTitle>
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
              <>
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
                              {getStatusBadge(quiz)}
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
                {renderPagination()}
              </>
            )}
          </CardContent>
        </Card>

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
                <div className="h-64 flex items-end gap-2 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-muted-foreground">
                    <span>100%</span>
                    <span>80%</span>
                    <span>60%</span>
                    <span>40%</span>
                    <span>20%</span>
                    <span>0%</span>
                  </div>

                  <div className="ml-8 flex-1 flex items-end gap-2">
                    {quizzes.slice(0, 10).map((quiz, index) => {
                      const dateTime = formatDateTime(quiz.createdAt);
                      const percentage = quiz.percentage || 0;

                      return (
                        <div
                          key={quiz._id}
                          className="flex-1 flex flex-col items-center group relative"
                        >
                          <div
                            className="w-full rounded-t-lg transition-all duration-200 hover:opacity-90 relative"
                            style={{
                              height: `${percentage * 0.6}px`,
                              backgroundColor: getBarColor(percentage),
                            }}
                          >
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
                              <div className="text-gray-300 flex items-center gap-1 mt-1">
                                {getStatusBadge(quiz)}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground mt-2">
                            {dateTime.shortDate}
                          </div>

                          <div className="text-xs text-gray-500 mt-1">
                            #{quizzes.length - index}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span>Auto-Submitted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LogOut className="h-3 w-3 text-purple-500" />
                    <span>Navigation Submitted</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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