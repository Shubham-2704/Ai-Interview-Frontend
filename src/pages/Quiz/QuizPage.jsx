import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import QuizStartDialog from "@/components/Quiz/QuizStartDialog";
import QuizQuestionCard from "@/components/Quiz/QuizQuestionCard";
import QuizResults from "@/components/Quiz/QuizResults";
import QuizTimer from "@/components/Quiz/QuizTimer";
import QuizProgress from "@/components/Quiz/QuizProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Send,
  Loader2,
  BarChart3,
  History,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { motion, AnimatePresence } from "framer-motion";

const QuizPage = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [quizState, setQuizState] = useState("start"); // 'start', 'active', 'results'
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  const reviewQuizId = searchParams.get("review");

  // Fetch session info
  //   useEffect(() => {
  //     const fetchSessionInfo = async () => {
  //       try {
  //         const response = await axiosInstance.get(`/api/sessions/${sessionId}`);
  //         if (response.data?.session) {
  //           setSessionInfo(response.data.session);
  //         }
  //       } catch (error) {
  //         console.error("Failed to fetch session info:", error);
  //       }
  //     };
  //     fetchSessionInfo();
  //   }, [sessionId]);

  // Load quiz for review
  useEffect(() => {
    if (reviewQuizId) {
      loadQuizForReview(reviewQuizId);
    }
  }, [reviewQuizId]);

  const loadQuizForReview = async (quizId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.QUIZ.RESULTS(quizId));
      if (response.data) {
        const quiz = response.data;
        setQuizData({
          quizId: quiz._id,
          questions: quiz.questions.map((q) => ({
            question: q.question,
            options: q.options,
          })),
          totalQuestions: quiz.totalQuestions,
        });
        setUserAnswers(quiz.userAnswers || []);
        setResults({
          score: quiz.score,
          total: quiz.totalQuestions,
          percentage: quiz.percentage,
          questions:
            quiz.results ||
            quiz.questions.map((q, i) => ({
              question: q.question,
              options: q.options,
              userAnswer: quiz.userAnswers?.[i],
              correctAnswer: q.correctAnswer,
              isCorrect: quiz.userAnswers?.[i] === q.correctAnswer,
              explanation: q.explanation,
            })),
          feedback: quiz.feedback || "",
        });
        setQuizState("results");
        setTimeSpent(quiz.timeSpent || 0);
        setShowStartDialog(false);
      }
    } catch (error) {
      toast.error("Failed to load quiz for review");
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = useCallback(
    async (questionCount) => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post(API_PATHS.QUIZ.GENERATE, {
          sessionId,
          numberOfQuestions: questionCount,
        });

        setQuizData(response.data);
        setUserAnswers(new Array(response.data.totalQuestions).fill(null));
        setQuizState("active");
        setShowStartDialog(false);
        toast.success("Quiz generated successfully!");
      } catch (error) {
        toast.error(error.response?.data?.detail || "Failed to generate quiz");
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const handleAnswerSelect = useCallback(
    (answerIndex) => {
      setUserAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = answerIndex;
        return newAnswers;
      });
    },
    [currentQuestion],
  );

  const handleSubmitQuiz = useCallback(async () => {
    if (userAnswers.some((answer) => answer === null)) {
      const unanswered = userAnswers.filter((a) => a === null).length;
      toast.warning(
        `You have ${unanswered} unanswered question(s). Please answer all questions.`,
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUIZ.SUBMIT(quizData.quizId),
        {
          quizId: quizData.quizId,
          answers: userAnswers,
          timeSpent,
        },
      );

      setResults(response.data);
      setQuizState("results");
      toast.success("Quiz submitted! View your results.");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit quiz");
    } finally {
      setIsLoading(false);
    }
  }, [quizData, userAnswers, timeSpent]);

  const handleRetry = useCallback(() => {
    setQuizState("start");
    setShowStartDialog(true);
    setQuizData(null);
    setUserAnswers([]);
    setResults(null);
    setCurrentQuestion(0);
    setTimeSpent(0);
  }, []);

  const handleDownloadResults = useCallback(async () => {
    if (!results || !quizData?.quizId) return;

    try {
      toast.info("Preparing results for download...");

      // Create a nicely formatted JSON
      const downloadData = {
        session: sessionInfo?.role || "Interview Preparation",
        date: new Date().toLocaleDateString(),
        timeSpent: timeSpent,
        score: results.score,
        total: results.total,
        percentage: results.percentage,
        feedback: results.feedback,
        questions: results.questions.map((q, i) => ({
          number: i + 1,
          question: q.question,
          yourAnswer: q.options?.[q.userAnswer] || "Not answered",
          correctAnswer: q.options?.[q.correctAnswer],
          status: q.isCorrect ? "Correct" : "Incorrect",
          explanation: q.explanation,
        })),
      };

      const dataStr = JSON.stringify(downloadData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-results-${sessionInfo?.role?.replace(/\s+/g, "-") || "interview"}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Results downloaded as JSON!");
    } catch (error) {
      toast.error("Failed to download results");
    }
  }, [results, quizData, sessionInfo, timeSpent]);

  const handleTimeUpdate = useCallback((newTime) => {
    setTimeSpent(newTime);
  }, []);

  const handleQuestionNavigation = useCallback(
    (direction) => {
      if (
        direction === "next" &&
        currentQuestion < quizData.totalQuestions - 1
      ) {
        setCurrentQuestion((prev) => prev + 1);
      } else if (direction === "prev" && currentQuestion > 0) {
        setCurrentQuestion((prev) => prev - 1);
      }
    },
    [currentQuestion, quizData?.totalQuestions],
  );

  // Show loading state
  if (isLoading && !quizData) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="mt-6 text-2xl font-semibold">Preparing Your Quiz</h2>
          <p className="mt-2 text-muted-foreground">
            Generating questions based on your session...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (quizState === "active" && quizData) {
    const currentQ = quizData.questions[currentQuestion];
    const totalQuestions = quizData.totalQuestions;
    const answeredCount = userAnswers.filter((a) => a !== null).length;

    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(`/interview-prep/${sessionId}`)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Session
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Practice Quiz</h1>
                {sessionInfo && (
                  <p className="text-muted-foreground text-sm">
                    {sessionInfo.role} • {sessionInfo.experience} years
                    experience
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/quiz/${sessionId}/history`)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                History
              </Button>
            </div>
          </div>

          {/* Quiz Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <QuizTimer
              onTimeUpdate={handleTimeUpdate}
              isActive={quizState === "active"}
            />
            <QuizProgress
              current={currentQuestion + 1}
              total={quizData.totalQuestions}
              answers={userAnswers}
            />
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Answered</p>
                    <p className="text-2xl font-bold">
                      {answeredCount}/{totalQuestions}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold">
                      {Math.round((answeredCount / totalQuestions) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigation */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Question {currentQuestion + 1} of {totalQuestions}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${userAnswers[currentQuestion] !== null ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {userAnswers[currentQuestion] !== null ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Answered
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Unanswered
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Question Dots Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {quizData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index === currentQuestion
                      ? "bg-primary text-white scale-110"
                      : userAnswers[index] !== null
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Current Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <QuizQuestionCard
                question={currentQ}
                index={currentQuestion}
                selectedAnswer={userAnswers[currentQuestion]}
                onAnswerSelect={handleAnswerSelect}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleQuestionNavigation("prev")}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestion > 0 && (
                <Button variant="ghost" onClick={() => setCurrentQuestion(0)}>
                  First Question
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentQuestion < totalQuestions - 1 ? (
                <Button
                  onClick={() => handleQuestionNavigation("next")}
                  className="gap-2"
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isLoading}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Quick Submit Section */}
          {answeredCount === totalQuestions &&
            currentQuestion === totalQuestions - 1 && (
              <Card className="mt-8 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">All questions answered!</p>
                        <p className="text-sm text-muted-foreground">
                          You've answered all {totalQuestions} questions. Ready
                          to submit?
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Submit Now"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </DashboardLayout>
    );
  }

  if (quizState === "results" && results) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(`/interview-prep/${sessionId}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Session
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/quiz/${sessionId}/history`)}
                className="gap-2"
              >
                <History className="h-4 w-4" />
                Quiz History
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

          {/* Results Summary */}
          <QuizResults
            results={results}
            onRetry={handleRetry}
            onDownload={handleDownloadResults}
            timeSpent={timeSpent}
          />

          {/* Detailed Review */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Detailed Review</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {results.score} correct out of {results.total}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {results.questions.map((question, index) => (
                <QuizQuestionCard
                  key={index}
                  question={{
                    question: question.question,
                    options: question.options || [],
                  }}
                  index={index}
                  selectedAnswer={question.userAnswer}
                  showResults={true}
                  isCorrect={question.isCorrect}
                  correctAnswer={question.correctAnswer}
                  explanation={question.explanation}
                />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Start Screen
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="text-center p-8 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mb-2">
              Practice Quiz
            </CardTitle>
            {sessionInfo && (
              <p className="text-muted-foreground text-lg">
                Test your knowledge for:{" "}
                <span className="font-semibold">{sessionInfo.role}</span>
                {sessionInfo.topicsToFocus && (
                  <span className="block text-sm mt-1">
                    Topics: {sessionInfo.topicsToFocus}
                  </span>
                )}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-3 p-4 rounded-lg border">
                <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold">AI-Generated</h3>
                <p className="text-sm text-muted-foreground">
                  Questions tailored to your experience level and topics
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-lg border">
                <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto">
                  <History className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Review past attempts and monitor improvement over time
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-lg border">
                <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto">
                  <Send className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold">Instant Feedback</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed explanations for every answer
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                onClick={() => setShowStartDialog(true)}
                className="w-full max-w-md mx-auto"
              >
                Start New Quiz
              </Button>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/quiz/${sessionId}/history`)}
                  className="gap-2"
                >
                  <History className="h-4 w-4" />
                  View Quiz History
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/interview-prep/${sessionId}`)}
                >
                  Back to Session Questions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <QuizStartDialog
          open={showStartDialog}
          onOpenChange={setShowStartDialog}
          onStartQuiz={startQuiz}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default QuizPage;