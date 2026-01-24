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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  AlertCircle,
  Clock,
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

  // Timer states
  const [questionTimeLimit] = useState(180); // 3 minutes per question
  const [totalQuizTimeLimit, setTotalQuizTimeLimit] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);
  const [timeWarningShown, setTimeWarningShown] = useState(false);
  const [timeExtensionUsed, setTimeExtensionUsed] = useState({});

  // Submission states
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);

  const reviewQuizId = searchParams.get("review");

  // Load quiz for review
  useEffect(() => {
    if (reviewQuizId) {
      loadQuizForReview(reviewQuizId);
    }
  }, [reviewQuizId]);

  // Setup timers when quiz starts
  useEffect(() => {
    if (quizData && quizState === "active") {
      const totalTime = quizData.totalQuestions * questionTimeLimit;
      setTotalQuizTimeLimit(totalTime);
      setIsTimerActive(true);

      // Track initial question time
      trackQuestionTime(currentQuestion);
    }
  }, [quizData, quizState, questionTimeLimit, currentQuestion]);

  // Track question changes
  useEffect(() => {
    if (quizState === "active" && quizData) {
      trackQuestionTime(currentQuestion);
    }
  }, [currentQuestion, quizState, quizData]);

  // Auto-submit check
  useEffect(() => {
    if (
      quizState === "active" &&
      totalQuizTimeLimit > 0 &&
      timeSpent >= totalQuizTimeLimit
    ) {
      if (!autoSubmitTriggered) {
        setAutoSubmitTriggered(true);
        handleAutoSubmit();
      }
    }

    // Show warning when 1 minute remaining
    if (
      totalQuizTimeLimit > 0 &&
      timeSpent >= totalQuizTimeLimit - 60 &&
      !timeWarningShown
    ) {
      setTimeWarningShown(true);
      toast.warning(
        "⚠️ Less than 1 minute remaining! Quiz will auto-submit soon.",
      );
    }
  }, [timeSpent, totalQuizTimeLimit, quizState, autoSubmitTriggered]);

  // Handle submission when dialog is shown
  useEffect(() => {
    if (showSubmitDialog && !autoSubmitTriggered) {
      // Add a small delay to show the dialog before starting submission
      const timer = setTimeout(() => {
        submitQuiz();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showSubmitDialog, autoSubmitTriggered]);

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
          timeLimitPerQuestion: quiz.timeLimitPerQuestion || 180,
          totalTimeLimit: quiz.totalTimeLimit || quiz.totalQuestions * 180,
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
              timeSpentOnQuestion: q.timeSpentOnQuestion || 0,
            })),
          feedback: quiz.feedback || "",
          submissionType: quiz.submissionType || "manual",
          totalTimeLimit: quiz.totalTimeLimit,
          timeLimitPerQuestion: quiz.timeLimitPerQuestion,
          timePerQuestion: quiz.timePerQuestion || [],
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

  const trackQuestionTime = async (questionIndex) => {
    if (!quizData?.quizId) return;

    try {
      await axiosInstance.post(API_PATHS.QUIZ.TRACK_TIME(quizData.quizId), {
        questionIndex,
      });
    } catch (error) {
      console.error("Failed to track question time:", error);
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

        setQuizData({
          ...response.data,
          totalTimeLimit: response.data.totalTimeLimit || questionCount * 180,
          timeLimitPerQuestion: response.data.timeLimitPerQuestion || 180,
        });
        setUserAnswers(new Array(response.data.totalQuestions).fill(null));
        setQuizState("active");
        setShowStartDialog(false);
        setAutoSubmitTriggered(false);
        setTimeWarningShown(false);
        setTimeSpent(0);
        setTimeExtensionUsed({});
        setShowSubmitDialog(false);
        setShowConfirmDialog(false);

        toast.success(
          `Quiz started! You have ${questionCount * 3} minutes total.`,
        );
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

  const initiateSubmit = useCallback(() => {
    // Count unanswered questions
    const unanswered = userAnswers.filter(
      (a) => a === null || a === undefined,
    ).length;
    setUnansweredCount(unanswered);

    // Always stop timer first
    setIsTimerActive(false);

    if (unanswered > 0) {
      // Show confirmation dialog for unanswered questions
      setShowConfirmDialog(true);
    } else {
      // Show submit dialog for all answered questions too
      setShowSubmitDialog(true);
    }
  }, [userAnswers]);

  const submitQuiz = useCallback(async () => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUIZ.SUBMIT(quizData.quizId),
        {
          quizId: quizData.quizId,
          answers: userAnswers,
          timeSpent,
          isAutoSubmit: autoSubmitTriggered, // Include auto-submit flag
        },
      );

      setResults(response.data);
      setQuizState("results");

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        setShowSubmitDialog(false);
        if (autoSubmitTriggered) {
          toast.info("⏰ Time's up! Quiz auto-submitted.");
        } else {
          toast.success("Quiz submitted! View your results.");
        }
      }, 1500);
    } catch (error) {
      setShowSubmitDialog(false);
      setIsTimerActive(true); // Restart timer if submit fails
      toast.error(error.response?.data?.detail || "Failed to submit quiz");
    }
  }, [quizData, userAnswers, timeSpent, autoSubmitTriggered]);

  const handleAutoSubmit = useCallback(async () => {
    if (quizState !== "active" || !quizData || autoSubmitTriggered) return;

    setIsTimerActive(false); // Stop timer
    setAutoSubmitTriggered(true);
    setShowSubmitDialog(true);

    // Fill unanswered questions with -1
    const finalAnswers = userAnswers.map((answer) =>
      answer === null || answer === undefined ? -1 : answer,
    );

    try {
      const response = await axiosInstance.post(
        API_PATHS.QUIZ.SUBMIT(quizData.quizId),
        {
          quizId: quizData.quizId,
          answers: finalAnswers,
          timeSpent: totalQuizTimeLimit,
          isAutoSubmit: true,
        },
      );

      setResults(response.data);
      setQuizState("results");

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        setShowSubmitDialog(false);
        toast.info("⏰ Time's up! Quiz auto-submitted.");
      }, 1500);
    } catch (error) {
      setShowSubmitDialog(false);
      toast.error("Failed to auto-submit quiz. Please submit manually.");
    }
  }, [
    quizData,
    userAnswers,
    quizState,
    totalQuizTimeLimit,
    autoSubmitTriggered,
  ]);

  const handleQuestionTimeUp = useCallback(() => {
    toast.warning(
      `Time's up for question ${currentQuestion + 1}! Moving to next question.`,
    );

    // Auto-select first option if not answered
    if (
      userAnswers[currentQuestion] === null ||
      userAnswers[currentQuestion] === undefined
    ) {
      setUserAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = 0;
        return newAnswers;
      });
    }

    // Move to next question only (don't submit)
    if (currentQuestion < quizData.totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
      }, 500);
    }
    // Don't auto-submit when last question time's up - let total timer handle it
  }, [currentQuestion, userAnswers, quizData]);

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

  const handleExtendQuestionTime = useCallback(
    (extraSeconds) => {
      if (!timeExtensionUsed[currentQuestion]) {
        // Add time to total quiz time
        setTotalQuizTimeLimit((prev) => {
          const newLimit = prev + extraSeconds;
          return newLimit;
        });

        // Mark as used for this question
        setTimeExtensionUsed((prev) => ({
          ...prev,
          [currentQuestion]: true,
        }));

        toast.success(`Added ${extraSeconds} seconds to quiz time`);

        // Force update to trigger re-evaluation of critical state
        setTimeSpent((prev) => prev);
      }
    },
    [currentQuestion, timeExtensionUsed],
  );

  const handleRetry = useCallback(() => {
    setQuizState("start");
    setShowStartDialog(true);
    setQuizData(null);
    setUserAnswers([]);
    setResults(null);
    setCurrentQuestion(0);
    setTimeSpent(0);
    setTotalQuizTimeLimit(0);
    setIsTimerActive(false);
    setAutoSubmitTriggered(false);
    setTimeWarningShown(false);
    setTimeExtensionUsed({});
    setShowSubmitDialog(false);
    setShowConfirmDialog(false);
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
        totalTimeLimit: totalQuizTimeLimit,
        score: results.score,
        total: results.total,
        percentage: results.percentage,
        feedback: results.feedback,
        submissionType: results.submissionType || "manual",
        questions: results.questions.map((q, i) => ({
          number: i + 1,
          question: q.question,
          yourAnswer: q.options?.[q.userAnswer] || "Not answered",
          correctAnswer: q.options?.[q.correctAnswer],
          status: q.isCorrect ? "Correct" : "Incorrect",
          explanation: q.explanation,
          timeSpent: q.timeSpentOnQuestion || 0,
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
  }, [results, quizData, sessionInfo, timeSpent, totalQuizTimeLimit]);

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
    const answeredCount = userAnswers.filter(
      (a) => a !== null && a !== undefined,
    ).length;

    return (
      <DashboardLayout>
        {/* Confirmation Dialog - Shows when unanswered questions exist */}
        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unanswered Questions</AlertDialogTitle>
              <AlertDialogDescription>
                You have{" "}
                <span className="font-bold text-red-600">
                  {unansweredCount} unanswered question(s)
                </span>
                . Are you sure you want to submit the quiz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowConfirmDialog(false);
                  setIsTimerActive(true); // Resume timer
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowConfirmDialog(false);
                  setShowSubmitDialog(true); // Show submit dialog first
                }}
              >
                Yes, Submit Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Submit Dialog - Shows loader for both manual and auto submit */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                {autoSubmitTriggered
                  ? "Auto-Submitting Quiz"
                  : "Submitting Quiz"}
              </DialogTitle>
              <DialogDescription className="text-center">
                Please wait while we process your answers...
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-lg font-semibold">
                {autoSubmitTriggered
                  ? "⏰ Time's up! Auto-submitting..."
                  : "Processing your answers..."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This may take a few seconds
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
          {/* Header */}
          <div className="flex flex-col justify-between mb-8 gap-4">
            <div className="flex items-center gap-4 justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate(`/interview-prep/${sessionId}`)}
                className="gap-2"
                disabled={showSubmitDialog || showConfirmDialog}
              >
                <ArrowLeft className="h-4 w-4" />
                <p className="hidden md:block">Back to Session</p>
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
              <Button
                variant="outline"
                onClick={() => navigate(`/quiz/${sessionId}/history`)}
                className="gap-2"
                disabled={showSubmitDialog || showConfirmDialog}
              >
                <History className="h-4 w-4" />
                <p className="hidden md:block">History</p>
              </Button>
            </div>
          </div>

          {/* Quiz Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <QuizTimer
              onTimeUpdate={handleTimeUpdate}
              isActive={
                isTimerActive &&
                !autoSubmitTriggered &&
                !showSubmitDialog &&
                !showConfirmDialog
              }
              timeLimit={totalQuizTimeLimit}
              onTimeUp={handleAutoSubmit}
              currentQuestion={currentQuestion + 1}
              totalQuestions={quizData.totalQuestions}
              initialTimeSpent={timeSpent}
              onExtendTime={handleExtendQuestionTime}
              timeExtensionUsed={timeExtensionUsed[currentQuestion] || false}
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
                    <p className="text-sm text-muted-foreground">Time Stats</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        Total: {Math.floor(totalQuizTimeLimit / 60)}:00
                      </p>
                      <p className="text-sm">Per Q: 3:00</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Answered</p>
                    <p className="text-2xl font-bold">
                      {answeredCount}/{quizData.totalQuestions}
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
                  className={`px-3 py-1 rounded-full text-sm ${userAnswers[currentQuestion] !== null && userAnswers[currentQuestion] !== undefined ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {userAnswers[currentQuestion] !== null &&
                  userAnswers[currentQuestion] !== undefined ? (
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
                  onClick={() =>
                    !autoSubmitTriggered &&
                    !showSubmitDialog &&
                    !showConfirmDialog &&
                    setCurrentQuestion(index)
                  }
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index === currentQuestion
                      ? "bg-primary text-white scale-110"
                      : userAnswers[index] !== null &&
                          userAnswers[index] !== undefined
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-gray-200"
                  } ${autoSubmitTriggered || showSubmitDialog || showConfirmDialog ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  disabled={
                    autoSubmitTriggered || showSubmitDialog || showConfirmDialog
                  }
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
                disabled={
                  autoSubmitTriggered || showSubmitDialog || showConfirmDialog
                }
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => handleQuestionNavigation("prev")}
                disabled={
                  currentQuestion === 0 ||
                  autoSubmitTriggered ||
                  showSubmitDialog ||
                  showConfirmDialog
                }
                className="gap-2 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestion > 0 && (
                <Button
                  className="hidden md:block"
                  variant="ghost"
                  onClick={() =>
                    !autoSubmitTriggered &&
                    !showSubmitDialog &&
                    !showConfirmDialog &&
                    setCurrentQuestion(0)
                  }
                  disabled={
                    autoSubmitTriggered || showSubmitDialog || showConfirmDialog
                  }
                >
                  First Question
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentQuestion < totalQuestions - 1 ? (
                <Button
                  onClick={() => handleQuestionNavigation("next")}
                  className="gap-2 hover:bg-gray-100"
                  variant="ghost"
                  disabled={
                    autoSubmitTriggered || showSubmitDialog || showConfirmDialog
                  }
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={initiateSubmit}
                  disabled={
                    autoSubmitTriggered || showSubmitDialog || showConfirmDialog
                  }
                  className="gap-2 hover:bg-green-700"
                >
                  {showSubmitDialog ? (
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

          {/* Auto-submit warning */}
          {autoSubmitTriggered && !showSubmitDialog && (
            <div className="mt-6 p-4 bg-orange-100 border border-orange-300 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <p className="text-orange-700 font-semibold">
                  Time's up! Quiz will auto-submit...
                </p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  if (quizState === "results" && results) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 max-w-[1400px]">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => navigate(`/interview-prep/${sessionId}`)}
              className="gap-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <p className="hidden md:block">Back to Session</p>
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/quiz/${sessionId}/history`)}
                className="gap-2 text-orange-500 bg:orange-100 hover:bg-orange-200 hover:text-orange-500"
              >
                <History className="h-4 w-4" />
                Quiz History
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/quiz/${sessionId}/analytics`)}
                className="gap-2 text-blue-500 bg:blue-100 hover:bg-blue-200 hover:text-blue-500"
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
            totalTimeLimit={results.totalTimeLimit}
            timePerQuestion={results.timePerQuestion}
          />

          {/* Detailed Review with Explanation */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Detailed Review</h2>
              <div className="flex items-center gap-4">
                {results.submissionType === "auto" && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Auto-Submitted
                  </span>
                )}
                <div className="text-sm text-muted-foreground">
                  {results.score} correct out of {results.total}
                </div>
              </div>
            </div>

            {/* Questions Review */}
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
                  timeSpent={question.timeSpentOnQuestion}
                  timeLimit={results.timeLimitPerQuestion}
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
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold">Timed Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Each question has a 3-minute limit. Quiz auto-submits when
                  time expires.
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-lg border">
                <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto">
                  <History className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold">Track Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Review past attempts with detailed time analysis
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-lg border">
                <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold">Time Management</h3>
                <p className="text-sm text-muted-foreground">
                  Learn to manage your time effectively with per-question timers
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
