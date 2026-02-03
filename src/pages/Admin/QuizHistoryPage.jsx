import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  BarChart,
  ArrowLeft,
  Calendar,
  Target,
  Brain,
  Award,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";

const QuizHistoryPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null); // ADDED THIS LINE
  const [quizDetailsOpen, setQuizDetailsOpen] = useState(false);
  const [quizDetails, setQuizDetails] = useState(null);
  const [quizDetailsLoading, setQuizDetailsLoading] = useState(false);

  useEffect(() => {
    fetchQuizHistory();
    fetchSessionInfo();
  }, [sessionId]);

  const formatTimeSpent = (seconds) => {
    if (!seconds) return "0 min";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${seconds} sec`;
    } else if (remainingSeconds === 0) {
      return `${minutes} min`;
    } else {
      return `${minutes} min ${remainingSeconds} sec`;
    }
  };

  const fetchQuizHistory = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/admin/sessions/${sessionId}/quizzes`,
      );
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      toast.error("Failed to load quiz history");

      // Mock data for testing
      const mockQuizzes = [
        {
          id: "quiz-1",
          title: "Technical Assessment",
          totalQuestions: 10,
          score: 8,
          percentage: 80,
          status: "completed",
          timeSpent: 25,
          createdAt: new Date().toISOString(),
          user: {
            name: "John Doe",
            email: "john@example.com",
            profileImageUrl: "",
          },
        },
        {
          id: "quiz-2",
          title: "Concept Review",
          totalQuestions: 5,
          score: 4,
          percentage: 80,
          status: "completed",
          timeSpent: 15,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          user: {
            name: "John Doe",
            email: "john@example.com",
            profileImageUrl: "",
          },
        },
        {
          id: "quiz-3",
          title: "Advanced Topics",
          totalQuestions: 15,
          score: 12,
          percentage: 80,
          status: "completed",
          timeSpent: 35,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          user: {
            name: "John Doe",
            email: "john@example.com",
            profileImageUrl: "",
          },
        },
      ];
      setQuizzes(mockQuizzes);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionInfo = async () => {
    try {
      const response = await axiosInstance.get(`/admin/sessions/${sessionId}`);
      setSessionInfo(response.data);
      setUserInfo(response.data.user);
    } catch (error) {
      console.error("Error fetching session info:", error);
    }
  };

  const fetchQuizDetails = async (quizId) => {
    if (expandedQuiz === quizId) {
      setExpandedQuiz(null);
      setQuizDetailsOpen(false); // ADDED THIS LINE
      return;
    }

    setQuizDetailsLoading(true);
    setSelectedQuiz(quizId);
    try {
      // Use the admin endpoint instead
      const response = await axiosInstance.get(`/admin/quizzes/${quizId}`);
      setQuizDetails(response.data);
      setExpandedQuiz(quizId);
      setQuizDetailsOpen(true); // ADDED THIS LINE
    } catch (error) {
      console.error("Error fetching quiz details:", error);

      // Fallback: Use the quiz from the list
      const quiz = quizzes.find((q) => q.id === quizId);
      if (quiz) {
        // Create quiz details from the data we have
        const quizDetails = {
          id: quiz.id,
          title: quiz.title,
          totalQuestions: quiz.totalQuestions,
          score: quiz.score,
          percentage: quiz.percentage,
          status: quiz.status,
          timeSpent: quiz.timeSpent,
          createdAt: quiz.createdAt,
          feedback: "Quiz completed successfully.",
        };
        setQuizDetails(quizDetails);
        setExpandedQuiz(quizId);
        setQuizDetailsOpen(true); // ADDED THIS LINE
      } else {
        toast.error("Failed to load quiz details");
      }
    } finally {
      setQuizDetailsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      default:
        return <Badge variant="outline">{status || "unknown"}</Badge>;
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quiz History</h1>
            <p className="text-gray-500">
              View all quiz attempts for this session
            </p>
          </div>
        </div>

        {sessionInfo && (
          <Badge variant="outline" className="text-sm">
            {sessionInfo.role || "Session"} •{" "}
            {sessionInfo.experience || "Level"}
          </Badge>
        )}
      </div>

      {/* User Info */}
      {userInfo && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={
                    userInfo.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.id}`
                  }
                />
                <AvatarFallback>
                  {userInfo.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-lg">{userInfo.name}</div>
                <div className="text-sm text-gray-500">{userInfo.email}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {quizzes.length} quiz{quizzes.length !== 1 ? "es" : ""}{" "}
                  attempted
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Statistics Summary */}
      {quizzes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quiz Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {quizzes.length}
                </div>
                <div className="text-sm text-gray-600">Total Quizzes</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {Math.round(
                    quizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) /
                      quizzes.length,
                  ) || 0}
                  %
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>

              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">
                  {Math.round(
                    quizzes.reduce(
                      (sum, q) => sum + (q.timeSpent || 0) / 60,
                      0,
                    ),
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Minutes</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {Math.round(
                    (quizzes.filter((q) => q.status === "completed").length /
                      quizzes.length) *
                      100,
                  ) || 0}
                  %
                </div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Attempts</CardTitle>
          <CardDescription>
            Click on any quiz to view detailed results and performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                      <p className="mt-2 text-gray-500">Loading quizzes...</p>
                    </TableCell>
                  </TableRow>
                ) : quizzes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Trophy className="h-12 w-12 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">
                        No quizzes found for this session
                      </p>
                      <p className="text-sm text-gray-400">
                        This user hasn't attempted any quizzes in this session
                        yet.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  quizzes.map((quiz) => (
                    <TableRow
                      key={quiz.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <TableCell onClick={() => fetchQuizDetails(quiz.id)}>
                        <div className="font-medium">
                          {quiz.title || "Quiz"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {quiz.user?.name || "User"}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => fetchQuizDetails(quiz.id)}>
                        <Badge variant="outline">
                          {quiz.totalQuestions || 0}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={() => fetchQuizDetails(quiz.id)}>
                        <div
                          className={`font-bold ${getScoreColor(quiz.percentage || 0)}`}
                        >
                          {quiz.percentage || 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {quiz.score || 0}/{quiz.totalQuestions || 0} correct
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-500" />
                          {formatTimeSpent(quiz.timeSpent)}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => fetchQuizDetails(quiz.id)}>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                          {quiz.createdAt
                            ? format(new Date(quiz.createdAt), "MMM dd, yyyy")
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell onClick={() => fetchQuizDetails(quiz.id)}>
                        {getStatusBadge(quiz.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fetchQuizDetails(quiz.id)}
                          disabled={
                            quizDetailsLoading && selectedQuiz === quiz.id
                          }
                        >
                          {quizDetailsLoading && selectedQuiz === quiz.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <BarChart className="h-4 w-4 mr-2" />
                              View Details
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Details Dialog */}
      <Dialog open={quizDetailsOpen} onOpenChange={setQuizDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {quizDetailsLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500">Loading quiz details...</p>
            </div>
          ) : quizDetails ? (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {quizDetails.title || "Quiz Results"}
                    </DialogTitle>
                    <DialogDescription>
                      {userInfo?.name} •{" "}
                      {format(
                        new Date(quizDetails.createdAt || new Date()),
                        "MMM dd, yyyy HH:mm",
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Performance Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div
                      className={`text-2xl font-bold ${getScoreColor(quizDetails.percentage || 0)}`}
                    >
                      {quizDetails.percentage || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {quizDetails.score || 0}/{quizDetails.totalQuestions || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Questions Correct
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {quizDetails.timeSpent || 0} min
                    </div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {quizDetails.results
                            ? Math.round(
                                (quizDetails.results.filter((q) => q.isCorrect)
                                  .length /
                                  quizDetails.results.length) *
                                  100,
                              )
                            : 0}
                          %
                        </div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                      {(quizDetails.percentage || 0) >= 70 ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback */}
              {quizDetails.feedback && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-blue-500" />
                      AI Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{quizDetails.feedback}</p>
                  </CardContent>
                </Card>
              )}

              {/* Question-by-Question Results */}
              {quizDetails.results && quizDetails.results.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Target className="h-5 w-5 mr-2 text-red-500" />
                      Detailed Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quizDetails.results.map((result, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-medium flex items-center">
                                Question {index + 1}
                                {result.isCorrect ? (
                                  <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 ml-2 text-red-600" />
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mt-1">
                                {result.question}
                              </p>
                            </div>
                            <Badge
                              variant={
                                result.isCorrect ? "default" : "destructive"
                              }
                            >
                              {result.isCorrect ? "Correct" : "Incorrect"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">
                                Options
                              </div>
                              <div className="space-y-1">
                                {result.options &&
                                  result.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`p-2 text-sm rounded ${
                                        optIndex === result.correctAnswer
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : optIndex === result.userAnswer &&
                                              !result.isCorrect
                                            ? "bg-red-100 text-red-800 border border-red-200"
                                            : "bg-gray-50 text-gray-700"
                                      }`}
                                    >
                                      <div className="flex items-center">
                                        <span className="font-medium mr-2">
                                          {String.fromCharCode(65 + optIndex)}.
                                        </span>
                                        <span>{option}</span>
                                        {optIndex === result.correctAnswer && (
                                          <Award className="h-3 w-3 ml-2 text-green-600" />
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-500 mb-1">
                                Explanation
                              </div>
                              <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                                {result.explanation ||
                                  "No explanation provided."}
                              </p>
                              <div className="mt-3 text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Time spent: {result.timeSpentOnQuestion ||
                                  0}{" "}
                                seconds
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Analysis */}
              {quizDetails.results && quizDetails.results.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-purple-500" />
                      Performance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-lg font-bold">
                          {
                            quizDetails.results.filter((q) => q.isCorrect)
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          Correct Answers
                        </div>
                      </div>

                      <div className="text-center p-3 bg-red-50 rounded">
                        <div className="text-lg font-bold">
                          {
                            quizDetails.results.filter((q) => !q.isCorrect)
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          Incorrect Answers
                        </div>
                      </div>

                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-lg font-bold">
                          {Math.round(
                            (quizDetails.results.filter((q) => q.isCorrect)
                              .length /
                              quizDetails.results.length) *
                              100,
                          )}
                          %
                        </div>
                        <div className="text-sm text-gray-600">
                          Accuracy Rate
                        </div>
                      </div>

                      <div className="text-center p-3 bg-amber-50 rounded">
                        <div className="text-lg font-bold">
                          {Math.round(
                            quizDetails.results.reduce(
                              (sum, q) => sum + (q.timeSpentOnQuestion || 0),
                              0,
                            ) / quizDetails.results.length,
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Avg Time/Question (s)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizHistoryPage;
