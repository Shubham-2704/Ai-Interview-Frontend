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
  User,
  Mail,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import AIResponsePreview from "../InterviewPrep/components/AIResponsePreview";

const QuizHistoryPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [quizDetailsOpen, setQuizDetailsOpen] = useState(false);
  const [quizDetails, setQuizDetails] = useState(null);
  const [quizDetailsLoading, setQuizDetailsLoading] = useState(false);
  const [expandedExplanations, setExpandedExplanations] = useState({});

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

  const toggleExplanation = (quizId, questionIndex) => {
    const key = `${quizId}-${questionIndex}`;
    setExpandedExplanations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const truncateText = (text, maxLength = 70) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
      setQuizDetailsOpen(false);
      return;
    }

    setQuizDetailsLoading(true);
    setSelectedQuiz(quizId);
    try {
      // Use the admin endpoint instead
      const response = await axiosInstance.get(`/admin/quizzes/${quizId}`);
      setQuizDetails(response.data);
      setExpandedQuiz(quizId);
      setQuizDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching quiz details:", error);

      // Fallback: Use the quiz from the list
      const quiz = quizzes.find((q) => q.id === quizId);
      if (quiz) {
        // Create quiz details with mock explanation data
        const quizDetails = {
          id: quiz.id,
          title: quiz.title,
          totalQuestions: quiz.totalQuestions,
          score: quiz.score,
          percentage: quiz.percentage,
          status: quiz.status,
          timeSpent: quiz.timeSpent,
          createdAt: quiz.createdAt,
          feedback:
            "Quiz completed successfully. The user demonstrated good understanding of core concepts but needs improvement in advanced topics.",
          results: Array.from({ length: quiz.totalQuestions || 5 }).map(
            (_, i) => ({
              question: `Sample question ${i + 1} about ${quiz.title.toLowerCase()}? This is a longer question text to demonstrate the responsive design and truncation features.`,
              isCorrect: i < quiz.score,
              options: [
                "Option A: Correct answer with detailed explanation",
                "Option B: Incorrect answer",
                "Option C: Another possible answer",
                "Option D: Distractor option",
              ],
              correctAnswer: 0,
              userAnswer: i < quiz.score ? 0 : 1,
              explanation: `This is a detailed explanation for question ${i + 1}. The correct answer is Option A because it aligns with the fundamental principles of the topic. This explanation provides additional context, examples, and reasoning to help understand why the answer is correct and why other options are incorrect. This text is intentionally long to demonstrate the expand/collapse functionality with truncation and "Read more" feature.`,
              timeSpentOnQuestion: Math.floor(Math.random() * 30) + 15,
            }),
          ),
        };
        setQuizDetails(quizDetails);
        setExpandedQuiz(quizId);
        setQuizDetailsOpen(true);
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
            <span className="hidden xs:inline">Completed</span>
            <span className="xs:hidden">Done</span>
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            <span className="hidden xs:inline">Active</span>
            <span className="xs:hidden">Active</span>
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
    <div className="space-y-4 sm:space-y-6 p-3 xs:p-4 sm:p-6 max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 items-center gap-3 sm:gap-4">
        {/* LEFT — Back */}
        <div className="col-span-1 flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-3"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Back
          </Button>
        </div>

        {/* CENTER — Title */}
        <div className="col-span-2 sm:col-span-1 text-left sm:text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
            Session Quiz History
          </h1>
          <p className="text-gray-500 text-sm sm:text-base truncate hidden md:block">
            View all quiz attempts for this session
          </p>
        </div>

        {/* RIGHT — Actions */}
        <div className="col-span-3 sm:col-span-1 flex justify-end space-x-2 mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="h-9 sm:h-10 text-xs sm:text-sm"
            onClick={() => navigate(`/admin/sessions/${sessionId}/resources`)}
          >
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Resources
          </Button>

          <Button
            size="sm"
            className="h-9 sm:h-10 text-xs sm:text-sm"
            onClick={() => navigate(`/admin/sessions/${sessionId}/questions`)}
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Questions
          </Button>
        </div>
      </div>

      {/* User Info */}
      {userInfo && (
        <Card className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage
                  src={
                    userInfo.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.id}`
                  }
                />
                <AvatarFallback className="text-sm">
                  {userInfo.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-base sm:text-lg truncate">
                  {userInfo.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 truncate flex items-center">
                  <Mail className="h-3 w-3 mr-1 hidden xs:inline" />
                  {userInfo.email}
                </div>
                <div className="text-xs text-gray-600 mt-1 flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
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
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Quiz Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-blue-700">
                  {quizzes.length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Total Quizzes
                </div>
              </div>

              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-green-700">
                  {Math.round(
                    quizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) /
                      quizzes.length,
                  ) || 0}
                  %
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Average Score
                </div>
              </div>

              <div className="text-center p-3 sm:p-4 bg-amber-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-amber-700">
                  {formatTimeSpent(
                    quizzes.reduce((sum, q) => sum + (q.timeSpent || 0), 0),
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Total Time
                </div>
              </div>

              <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-purple-700">
                  {Math.round(
                    (quizzes.filter((q) => q.status === "completed").length /
                      quizzes.length) *
                      100,
                  ) || 0}
                  %
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Completion Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quizzes Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Quiz Attempts</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Click on any quiz to view detailed results and performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500 text-sm sm:text-base">
                Loading quizzes...
              </p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                No quizzes found for this session
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                This user hasn't attempted any quizzes in this session yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 sm:-mx-2">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                      Quiz
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden xs:table-cell">
                      Questions
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                      Score
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">
                      Time Spent
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                      Date
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow
                      key={quiz.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <TableCell
                        className="py-3"
                        onClick={() => fetchQuizDetails(quiz.id)}
                      >
                        <div className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
                          {quiz.title || "Quiz"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {quiz.user?.name || "User"}
                        </div>
                      </TableCell>
                      <TableCell
                        className="py-3 hidden xs:table-cell"
                        onClick={() => fetchQuizDetails(quiz.id)}
                      >
                        <Badge variant="outline" className="text-xs">
                          {quiz.totalQuestions || 0}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="py-3"
                        onClick={() => fetchQuizDetails(quiz.id)}
                      >
                        <div
                          className={`font-bold text-sm sm:text-base ${getScoreColor(quiz.percentage || 0)}`}
                        >
                          {quiz.percentage || 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {quiz.score || 0}/{quiz.totalQuestions || 0}
                        </div>
                      </TableCell>
                      <TableCell
                        className="py-3 hidden sm:table-cell"
                        onClick={() => fetchQuizDetails(quiz.id)}
                      >
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-500" />
                          <span className="text-xs sm:text-sm">
                            {formatTimeSpent(quiz.timeSpent)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="py-3 hidden md:table-cell"
                        onClick={() => fetchQuizDetails(quiz.id)}
                      >
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-500 hidden sm:inline" />
                          <span className="text-xs sm:text-sm">
                            {quiz.createdAt
                              ? format(new Date(quiz.createdAt), "MMM dd, yyyy")
                              : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="py-3"
                        onClick={() => fetchQuizDetails(quiz.id)}
                      >
                        {getStatusBadge(quiz.status)}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 sm:h-9 px-2 sm:px-3"
                          onClick={() => fetchQuizDetails(quiz.id)}
                          disabled={
                            quizDetailsLoading && selectedQuiz === quiz.id
                          }
                        >
                          {quizDetailsLoading && selectedQuiz === quiz.id ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                          ) : (
                            <>
                              <BarChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden xs:inline">View</span>
                              <span className="xs:hidden">
                                <ChevronRight className="h-3.5 w-3.5" />
                              </span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Details Dialog */}
      <Dialog open={quizDetailsOpen} onOpenChange={setQuizDetailsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
          {quizDetailsLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500 text-sm sm:text-base">
                Loading quiz details...
              </p>
            </div>
          ) : quizDetails ? (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg sm:text-xl truncate">
                      {quizDetails.title || "Quiz Results"}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm truncate">
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
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div
                      className={`text-lg sm:text-2xl font-bold ${getScoreColor(quizDetails.percentage || 0)}`}
                    >
                      {quizDetails.percentage || 0}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Overall Score
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600">
                      {quizDetails.score || 0}/{quizDetails.totalQuestions || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Questions Correct
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">
                      {formatTimeSpent(quizDetails.timeSpent)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Time Spent
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg sm:text-2xl font-bold text-purple-600">
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
                        <div className="text-xs sm:text-sm text-gray-600">
                          Accuracy
                        </div>
                      </div>
                      {(quizDetails.percentage || 0) >= 70 ? (
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feedback */}
              {quizDetails.feedback && (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center">
                      <Brain className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                      AI Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm sm:text-base">
                      {quizDetails.feedback}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Question-by-Question Results */}
              {quizDetails.results && quizDetails.results.length > 0 && (
                <Card className="mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" />
                      Detailed Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      {quizDetails.results.map((result, index) => {
                        const key = `${quizDetails.id}-${index}`;
                        const isExpanded = expandedExplanations[key];
                        const explanationText =
                          result.explanation || "No explanation provided.";
                        const shouldTruncate = explanationText.length > 70;
                        const displayText = isExpanded
                          ? explanationText
                          : truncateText(explanationText, 70);

                        return (
                          <div
                            key={index}
                            className={`p-3 sm:p-4 rounded-lg border ${result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 min-w-0 mr-2">
                                <div className="font-medium text-sm sm:text-base flex items-center">
                                  <span className="truncate">
                                    Question {index + 1}
                                  </span>
                                  {result.isCorrect ? (
                                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2 text-green-600 shrink-0" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-2 text-red-600 shrink-0" />
                                  )}
                                </div>
                                {/* <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-2"> */}
                                <AIResponsePreview
                                  content={result.question}
                                  type
                                />
                                {/* </p> */}
                              </div>
                              <Badge
                                variant={
                                  result.isCorrect ? "default" : "destructive"
                                }
                                className="text-xs shrink-0"
                              >
                                {result.isCorrect ? "Correct" : "Incorrect"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                                  Options
                                </div>
                                <div className="space-y-1">
                                  {result.options &&
                                    result.options.map((option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className={`p-1.5 sm:p-2 text-xs sm:text-sm rounded ${
                                          optIndex === result.correctAnswer
                                            ? "bg-green-100 text-green-800 border border-green-200"
                                            : optIndex === result.userAnswer &&
                                                !result.isCorrect
                                              ? "bg-red-100 text-red-800 border border-red-200"
                                              : "bg-gray-50 text-gray-700"
                                        }`}
                                      >
                                        <div className="flex items-center">
                                          <span className="font-medium mr-2 shrink-0">
                                            {String.fromCharCode(65 + optIndex)}
                                            .
                                          </span>
                                          <span className="truncate">
                                            <AIResponsePreview
                                              content={option}
                                              type="inline"
                                            />
                                          </span>
                                          {optIndex ===
                                            result.correctAnswer && (
                                            <Award className="h-3 w-3 ml-2 text-green-600 shrink-0" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="text-xs sm:text-sm font-medium text-gray-500">
                                    Explanation
                                  </div>
                                  {shouldTruncate && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 text-xs px-2"
                                      onClick={() =>
                                        toggleExplanation(quizDetails.id, index)
                                      }
                                    >
                                      {isExpanded ? (
                                        <>
                                          <EyeOff className="h-3 w-3 mr-1" />
                                          Show Less
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="h-3 w-3 mr-1" />
                                          Read More
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <div className="relative">
                                  {/* <p className="text-xs sm:text-sm text-gray-700 p-2 bg-gray-50 rounded whitespace-pre-line"> */}
                                  <AIResponsePreview content={displayText} />
                                  {!isExpanded && shouldTruncate && (
                                    <span className="text-gray-400">...</span>
                                  )}
                                  {/* </p> */}
                                  {shouldTruncate && (
                                    <div className="absolute bottom-0 right-0 flex items-center">
                                      {!isExpanded && (
                                        <button
                                          onClick={() =>
                                            toggleExplanation(
                                              quizDetails.id,
                                              index,
                                            )
                                          }
                                          className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center ml-2 p-1"
                                        >
                                          <ChevronDown className="h-3 w-3" />
                                        </button>
                                      )}
                                      {isExpanded && (
                                        <button
                                          onClick={() =>
                                            toggleExplanation(
                                              quizDetails.id,
                                              index,
                                            )
                                          }
                                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center ml-2 p-1"
                                        >
                                          <ChevronUp className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="mt-3 text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1 shrink-0" />
                                  Time spent: {result.timeSpentOnQuestion ||
                                    0}{" "}
                                  seconds
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Analysis */}
              {quizDetails.results && quizDetails.results.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center">
                      <BarChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-500" />
                      Performance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
                      <div className="text-center p-2 sm:p-3 bg-blue-50 rounded">
                        <div className="text-base sm:text-lg font-bold">
                          {
                            quizDetails.results.filter((q) => q.isCorrect)
                              .length
                          }
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Correct Answers
                        </div>
                      </div>

                      <div className="text-center p-2 sm:p-3 bg-red-50 rounded">
                        <div className="text-base sm:text-lg font-bold">
                          {
                            quizDetails.results.filter((q) => !q.isCorrect)
                              .length
                          }
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Incorrect Answers
                        </div>
                      </div>

                      <div className="text-center p-2 sm:p-3 bg-green-50 rounded">
                        <div className="text-base sm:text-lg font-bold">
                          {Math.round(
                            (quizDetails.results.filter((q) => q.isCorrect)
                              .length /
                              quizDetails.results.length) *
                              100,
                          )}
                          %
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Accuracy Rate
                        </div>
                      </div>

                      <div className="text-center p-2 sm:p-3 bg-amber-50 rounded">
                        <div className="text-base sm:text-lg font-bold">
                          {Math.round(
                            quizDetails.results.reduce(
                              (sum, q) => sum + (q.timeSpentOnQuestion || 0),
                              0,
                            ) / quizDetails.results.length,
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
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
