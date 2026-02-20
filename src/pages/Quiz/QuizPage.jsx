import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
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
  Clock,
  LogOut,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { motion, AnimatePresence } from "framer-motion";

const QUESTION_TIME_LIMIT = 180;
const SUBMIT_DIALOG_DELAY = 500;
const SUBMIT_SUCCESS_DELAY = 1500;
const TIME_WARNING_THRESHOLD = 60;

const SUBMISSION_TYPE = {
  MANUAL: "manual",
  AUTO: "auto",
  BACK_BUTTON: "back_button",
};

const STATUS_CONFIG = {
  [SUBMISSION_TYPE.MANUAL]: {
    label: "Completed",
    icon: CheckCircle2,
    iconColor: "text-green-500",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  [SUBMISSION_TYPE.AUTO]: {
    label: "Auto-Submitted",
    icon: Clock,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
  },
  [SUBMISSION_TYPE.BACK_BUTTON]: {
    label: "Navigation Submitted",
    icon: LogOut,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800",
  }
};

const QuizPage = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [quizState, setQuizState] = useState("start");
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [totalQuizTimeLimit, setTotalQuizTimeLimit] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);
  const [timeWarningShown, setTimeWarningShown] = useState(false);
  const [timeExtensionUsed, setTimeExtensionUsed] = useState({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [showRefreshDialog, setShowRefreshDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingForUnload, setIsSubmittingForUnload] = useState(false);
  const [submissionType, setSubmissionType] = useState(SUBMISSION_TYPE.MANUAL);

  const submitTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const beforeUnloadHandlerRef = useRef(null);
  const unloadSubmittedRef = useRef(false);
  
  const unansweredCount = useMemo(
    () => userAnswers.filter((a) => a == null).length,
    [userAnswers],
  );
  const answeredCount = useMemo(
    () => userAnswers.filter((a) => a != null).length,
    [userAnswers],
  );

  const reviewQuizId = searchParams.get("review");
  
  const prepareAnswersForSubmission = useCallback(
    (answers) => answers.map((answer) => (answer == null ? -1 : answer)),
    [],
  );

  const getSubmissionStatusBadge = useCallback(() => {
    if (!results) return null;
    
    const type = results.submissionType || submissionType;
    const config = STATUS_CONFIG[type] || STATUS_CONFIG[SUBMISSION_TYPE.MANUAL];
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${config.bgColor} ${config.textColor}`}>
        <Icon className={`h-3 w-3 ${config.iconColor}`} />
        {config.label}
      </span>
    );
  }, [results, submissionType]);

  useEffect(
    () => () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      if (beforeUnloadHandlerRef.current) {
        window.removeEventListener("beforeunload", beforeUnloadHandlerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (quizState !== "active") return;

    const handleBeforeUnload = (e) => {
      setSubmissionType(SUBMISSION_TYPE.MANUAL);
      e.preventDefault();
      e.returnValue = "You have an ongoing quiz. Are you sure you want to leave? Your quiz will be submitted automatically.";
      setIsSubmittingForUnload(true);
      return e.returnValue;
    };

    beforeUnloadHandlerRef.current = handleBeforeUnload;
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quizState]);

  useEffect(() => {
    if (quizState !== "active") return;

    const handleUnload = () => {
      if (isSubmittingForUnload && !unloadSubmittedRef.current && quizData?.quizId) {
        unloadSubmittedRef.current = true;
        
        const submitData = {
          quizId: quizData.quizId,
          answers: prepareAnswersForSubmission(userAnswers),
          timeSpent: timeSpent,
          submissionType: submissionType,
          isAutoSubmit: true,
        };
        
        const blob = new Blob([JSON.stringify(submitData)], {
          type: 'application/json'
        });
        
        navigator.sendBeacon(
          `${API_PATHS.QUIZ.SUBMIT(quizData.quizId)}`, 
          blob
        );
      }
    };

    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, [quizState, quizData, userAnswers, timeSpent, isSubmittingForUnload, prepareAnswersForSubmission, submissionType]);

  useEffect(() => {
    if (quizState !== "active") return;

    const handleKeyDown = (e) => {
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
        e.preventDefault();
        setIsTimerActive(false);
        setSubmissionType(SUBMISSION_TYPE.MANUAL);
        setShowRefreshDialog(true);
      }
    };

    const handlePopState = () => {
      setIsTimerActive(false);
      setSubmissionType(SUBMISSION_TYPE.BACK_BUTTON);
      setShowNavigationDialog(true);
      window.history.pushState(null, "", window.location.pathname);
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [quizState]);

  useEffect(() => {
    if (!showRefreshDialog && !showNavigationDialog) {
      setIsSubmittingForUnload(false);
    }
  }, [showRefreshDialog, showNavigationDialog]);

  useEffect(() => {
    if (reviewQuizId) {
      loadQuizForReview(reviewQuizId);
    }
  }, [reviewQuizId]);

  useEffect(() => {
    if (quizData?.totalQuestions && quizState === "active") {
      setTotalQuizTimeLimit(quizData.totalQuestions * QUESTION_TIME_LIMIT);
      setIsTimerActive(true);
    }
  }, [quizData, quizState]);

  useEffect(() => {
    if (
      quizState === "active" &&
      totalQuizTimeLimit > 0 &&
      timeSpent >= totalQuizTimeLimit &&
      !autoSubmitTriggered
    ) {
      setAutoSubmitTriggered(true);
      setSubmissionType(SUBMISSION_TYPE.AUTO);
      handleAutoSubmit();
    }

    if (
      totalQuizTimeLimit > 0 &&
      timeSpent >= totalQuizTimeLimit - TIME_WARNING_THRESHOLD &&
      !timeWarningShown &&
      !autoSubmitTriggered
    ) {
      setTimeWarningShown(true);
      toast.warning(
        "⚠️ Less than 1 minute remaining! Quiz will auto-submit soon.",
        {
          position: "bottom-right",
        },
      );
    }
  }, [
    timeSpent,
    totalQuizTimeLimit,
    quizState,
    autoSubmitTriggered,
    timeWarningShown,
  ]);

  useEffect(() => {
    if (showSubmitDialog && !autoSubmitTriggered && !isSubmitting) {
      submitTimeoutRef.current = setTimeout(() => {
        submitQuiz();
      }, SUBMIT_DIALOG_DELAY);

      return () => {
        if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
      };
    }
  }, [showSubmitDialog, autoSubmitTriggered, isSubmitting]);

  const loadQuizForReview = async (quizId) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.QUIZ.RESULTS(quizId));
      if (!response.data) return;

      const quiz = response.data;
      const questions = quiz.questions.map((q) => ({
        question: q.question,
        options: q.options,
      }));

      setQuizData({
        quizId: quiz._id,
        questions,
        totalQuestions: quiz.totalQuestions,
        timeLimitPerQuestion: quiz.timeLimitPerQuestion || QUESTION_TIME_LIMIT,
        totalTimeLimit:
          quiz.totalTimeLimit || quiz.totalQuestions * QUESTION_TIME_LIMIT,
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
        submissionType: quiz.submissionType || SUBMISSION_TYPE.MANUAL,
        totalTimeLimit: quiz.totalTimeLimit,
        timeLimitPerQuestion: quiz.timeLimitPerQuestion,
        timePerQuestion: quiz.timePerQuestion || [],
      });

      setQuizState("results");
      setTimeSpent(quiz.timeSpent || 0);
      setShowStartDialog(false);
    } catch (error) {
      toast.error("Failed to load quiz for review", {
        position: "bottom-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trackQuestionTime = useCallback(
    async (questionIndex) => {
      if (!quizData?.quizId) return;

      try {
        await axiosInstance.post(API_PATHS.QUIZ.TRACK_TIME(quizData.quizId), {
          questionIndex,
        });
      } catch (error) {}
    },
    [quizData?.quizId],
  );

  useEffect(() => {
    if (quizState === "active" && quizData) {
      trackQuestionTime(currentQuestion);
    }
  }, [currentQuestion, quizState, quizData, trackQuestionTime]);

  const startQuiz = useCallback(
    async (questionCount) => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.post(API_PATHS.QUIZ.GENERATE, {
          sessionId,
          numberOfQuestions: questionCount,
        });

        const totalTime = questionCount * QUESTION_TIME_LIMIT;

        setQuizData({
          ...response.data,
          quizId: response.data._id || response.data.quizId,
          totalTimeLimit: totalTime,
          timeLimitPerQuestion: QUESTION_TIME_LIMIT,
        });

        setUserAnswers(new Array(questionCount).fill(null));
        setQuizState("active");
        setShowStartDialog(false);
        setAutoSubmitTriggered(false);
        setTimeWarningShown(false);
        setTimeSpent(0);
        setTimeExtensionUsed({});
        setShowSubmitDialog(false);
        setShowConfirmDialog(false);
        setTotalQuizTimeLimit(totalTime);
        setSubmissionType(SUBMISSION_TYPE.MANUAL);

        toast.success(
          `Quiz started! You have ${questionCount * 3} minutes total.`,
          {
            position: "top-center",
          },
        );
      } catch (error) {
        toast.error(error.response?.data?.detail || "Failed to generate quiz", {
          position: "bottom-right",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const handleAnswerSelect = useCallback(
    (answerIndex) => {
      setUserAnswers((prev) => {
        if (prev[currentQuestion] === answerIndex) return prev;
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = answerIndex;
        return newAnswers;
      });
    },
    [currentQuestion],
  );

  const submitQuiz = useCallback(async () => {
    if (isSubmitting || !quizData?.quizId) return;

    setIsSubmitting(true);
    setIsTimerActive(false);

    try {
      const response = await axiosInstance.post(
        API_PATHS.QUIZ.SUBMIT(quizData.quizId),
        {
          quizId: quizData.quizId,
          answers: prepareAnswersForSubmission(userAnswers),
          timeSpent: autoSubmitTriggered ? totalQuizTimeLimit : timeSpent,
          submissionType: autoSubmitTriggered ? SUBMISSION_TYPE.AUTO : submissionType,
          isAutoSubmit: autoSubmitTriggered,
        },
      );

      setResults(response.data);
      setQuizState("results");

      successTimeoutRef.current = setTimeout(() => {
        setShowSubmitDialog(false);
        setIsSubmitting(false);

        let message = "";
        if (autoSubmitTriggered) {
          message = "⏰ Time's up! Quiz auto-submitted.";
        } else if (submissionType === SUBMISSION_TYPE.BACK_BUTTON) {
          message = "Quiz submitted due to navigation.";
        } else {
          message = "Quiz submitted! View your results.";
        }

        toast.success(message, { position: "top-center" });
      }, SUBMIT_SUCCESS_DELAY);
    } catch (error) {
      setShowSubmitDialog(false);
      setIsTimerActive(true);
      setIsSubmitting(false);
      toast.error(error.response?.data?.detail || "Failed to submit quiz", {
        position: "bottom-right",
      });
    }
  }, [
    quizData,
    userAnswers,
    timeSpent,
    totalQuizTimeLimit,
    autoSubmitTriggered,
    submissionType,
    prepareAnswersForSubmission,
    isSubmitting,
  ]);

  const handleAutoSubmit = useCallback(async () => {
    if (
      quizState !== "active" ||
      !quizData ||
      autoSubmitTriggered ||
      isSubmitting
    )
      return;

    setIsTimerActive(false);
    setAutoSubmitTriggered(true);
    setShowSubmitDialog(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.QUIZ.SUBMIT(quizData.quizId),
        {
          quizId: quizData.quizId,
          answers: prepareAnswersForSubmission(userAnswers),
          timeSpent: totalQuizTimeLimit,
          submissionType: SUBMISSION_TYPE.AUTO,
          isAutoSubmit: true,
        },
      );

      setResults(response.data);
      setQuizState("results");

      successTimeoutRef.current = setTimeout(() => {
        setShowSubmitDialog(false);
        setIsSubmitting(false);
        toast.info("⏰ Time's up! Quiz auto-submitted.", {
          position: "top-center",
        });
      }, SUBMIT_SUCCESS_DELAY);
    } catch (error) {
      setShowSubmitDialog(false);
      setAutoSubmitTriggered(false);
      setIsTimerActive(true);
      setIsSubmitting(false);
      toast.error("Failed to auto-submit quiz. Please submit manually.", {
        position: "bottom-right",
      });
    }
  }, [
    quizData,
    userAnswers,
    quizState,
    totalQuizTimeLimit,
    autoSubmitTriggered,
    prepareAnswersForSubmission,
    isSubmitting,
  ]);

  const handleLeaveAndSubmit = useCallback(async () => {
    if (isSubmitting || !quizData?.quizId) return;

    setIsSubmitting(true);
    setIsTimerActive(false);
    setShowSubmitDialog(true);

    try {
      const response = await axiosInstance.post(
        API_PATHS.QUIZ.SUBMIT(quizData.quizId),
        {
          quizId: quizData.quizId,
          answers: prepareAnswersForSubmission(userAnswers),
          timeSpent,
          submissionType: submissionType,
          isAutoSubmit: true,
        },
      );

      setResults(response.data);
      
      setShowSubmitDialog(false);
      setShowNavigationDialog(false);
      setIsSubmitting(false);
      
      if (submissionType === SUBMISSION_TYPE.BACK_BUTTON) {
        navigate(-1);
      } else {
        setQuizState("results");
      }

      let message = "";
      if (submissionType === SUBMISSION_TYPE.BACK_BUTTON) {
        message = "Quiz submitted due to navigation.";
      } else {
        message = "Quiz submitted successfully!";
      }

      toast.success(message, { position: "top-center" });
    } catch (error) {
      setShowSubmitDialog(false);
      setShowNavigationDialog(false);
      setIsTimerActive(true);
      setIsSubmitting(false);
      
      toast.error("Failed to submit quiz. Please try again or continue with your quiz.", { 
        position: "bottom-right",
        duration: 5000
      });
    }
  }, [
    quizData,
    userAnswers,
    timeSpent,
    submissionType,
    prepareAnswersForSubmission,
    isSubmitting,
    navigate
  ]);

  const handleRefreshConfirm = useCallback((action) => {
    if (action === "stay") {
      setShowRefreshDialog(false);
      setIsTimerActive(true);
      setIsSubmittingForUnload(false);
      setSubmissionType(SUBMISSION_TYPE.MANUAL);
    } else if (action === "submit") {
      setShowRefreshDialog(false);
      setSubmissionType(SUBMISSION_TYPE.MANUAL);
      setIsSubmittingForUnload(true);
      window.location.reload();
    }
  }, []);

  const handleNavigationConfirm = useCallback(async (action) => {
    if (action === "stay") {
      setShowNavigationDialog(false);
      setIsTimerActive(true);
      setSubmissionType(SUBMISSION_TYPE.MANUAL);
    } else if (action === "leave") {
      await handleLeaveAndSubmit();
    }
  }, [handleLeaveAndSubmit]);

  const initiateSubmit = useCallback(() => {
    setIsTimerActive(false);
    setSubmissionType(SUBMISSION_TYPE.MANUAL);

    if (unansweredCount > 0) {
      setShowConfirmDialog(true);
    } else {
      setShowSubmitDialog(true);
    }
  }, [unansweredCount]);

  const handleTimeUpdate = useCallback((newTime) => {
    setTimeSpent(newTime);
  }, []);

  const handleQuestionNavigation = useCallback(
    (direction) => {
      setCurrentQuestion((prev) => {
        if (direction === "next" && prev < quizData.totalQuestions - 1)
          return prev + 1;
        if (direction === "prev" && prev > 0) return prev - 1;
        return prev;
      });
    },
    [quizData?.totalQuestions],
  );

  const handleExtendQuestionTime = useCallback(
    (extraSeconds) => {
      if (timeExtensionUsed[currentQuestion]) return;

      setTotalQuizTimeLimit((prev) => prev + extraSeconds);
      setTimeExtensionUsed((prev) => ({ ...prev, [currentQuestion]: true }));

      toast.success(`Added ${extraSeconds} seconds to quiz time`, {
        position: "top-center",
      });
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
    setIsSubmitting(false);
    setIsSubmittingForUnload(false);
    setSubmissionType(SUBMISSION_TYPE.MANUAL);
    unloadSubmittedRef.current = false;
  }, []);

  const handleDownloadResults = useCallback(async () => {
    if (!results || !quizData?.quizId) return;

    try {
      toast.info("Preparing results for download...", {
        position: "bottom-right",
      });

      const downloadData = {
        session: sessionInfo?.role || "Interview Preparation",
        date: new Date().toLocaleDateString(),
        timeSpent,
        totalTimeLimit: totalQuizTimeLimit,
        score: results.score,
        total: results.total,
        percentage: results.percentage,
        feedback: results.feedback,
        submissionType: results.submissionType || submissionType,
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

      toast.success("Results downloaded as JSON!", {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Failed to download results", { position: "bottom-right" });
    }
  }, [results, quizData, sessionInfo, timeSpent, totalQuizTimeLimit, submissionType]);

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
    const isDisabled =
      autoSubmitTriggered ||
      showSubmitDialog ||
      showConfirmDialog ||
      isSubmitting;

    return (
      <DashboardLayout>
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
                  setIsTimerActive(true);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowConfirmDialog(false);
                  setShowSubmitDialog(true);
                }}
              >
                Yes, Submit Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

        <AlertDialog
          open={showNavigationDialog}
          onOpenChange={setShowNavigationDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave Quiz?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-medium text-orange-600">
                  ⚠️ You have answered {answeredCount} of{" "}
                  {quizData.totalQuestions} questions.
                </p>
                <p>If you leave now:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your quiz will be marked as "Navigation Submitted"</li>
                  <li>Unanswered questions will be marked as incorrect</li>
                  <li>You can view results in quiz history</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                onClick={() => handleNavigationConfirm("stay")}
              >
                Stay on Quiz
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleNavigationConfirm("leave")}
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Leave & Submit"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={showRefreshDialog}
          onOpenChange={setShowRefreshDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Refresh Page?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-medium text-orange-600">
                  ⚠️ You have answered {answeredCount} of {quizData?.totalQuestions || 0} questions.
                </p>
                <p>If you refresh now:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>A browser warning will appear</li>
                  <li>If you confirm, your quiz will be submitted</li>
                  <li>If you cancel, you'll stay on this page</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel
                onClick={() => handleRefreshConfirm("stay")}
              >
                Stay on Quiz
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleRefreshConfirm("submit")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Continue to Refresh
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="container mx-auto px-2 py-4 max-w-[1400px]">
          <div className="flex flex-col justify-between mb-4 gap-4">
            <div className="flex items-center gap-4 justify-center">
              <div>
                <h1 className="text-2xl font-bold">Practice Quiz</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <QuizTimer
              onTimeUpdate={handleTimeUpdate}
              isActive={isTimerActive && !isDisabled}
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

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Question {currentQuestion + 1} of {quizData.totalQuestions}
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  userAnswers[currentQuestion] != null
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {userAnswers[currentQuestion] != null ? (
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

            <div className="flex flex-wrap gap-2 mb-6">
              {quizData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isDisabled && setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index === currentQuestion
                      ? "bg-primary text-white scale-110"
                      : userAnswers[index] != null
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-gray-200"
                  } ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                  disabled={isDisabled}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

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
                disabled={isDisabled}
              />
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => handleQuestionNavigation("prev")}
                disabled={currentQuestion === 0 || isDisabled}
                className="gap-2 hover:bg-gray-100"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestion > 0 && (
                <Button
                  className="hidden md:block"
                  variant="ghost"
                  onClick={() => !isDisabled && setCurrentQuestion(0)}
                  disabled={isDisabled}
                >
                  First Question
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentQuestion < quizData.totalQuestions - 1 ? (
                <Button
                  onClick={() => handleQuestionNavigation("next")}
                  className="gap-2 hover:bg-gray-100"
                  variant="ghost"
                  disabled={isDisabled}
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={initiateSubmit}
                  disabled={isDisabled}
                  className="gap-2 hover:bg-green-700"
                >
                  {isSubmitting ? (
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
        <div className="container mx-auto px-2 py-4 max-w-[1400px]">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/interview-prep/${sessionId}`)}
              className="gap-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <p className="hidden md:block">Back to Session</p>
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate(`/quiz/${sessionId}/history`)}
                className="gap-2 text-orange-500 bg:orange-100 hover:bg-orange-200 hover:text-black"
              >
                <History className="h-4 w-4" />
                Quiz History
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

          <QuizResults
            results={results}
            onRetry={handleRetry}
            onDownload={handleDownloadResults}
            timeSpent={timeSpent}
            totalTimeLimit={results.totalTimeLimit}
            timePerQuestion={results.timePerQuestion}
          />

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Detailed Review</h2>
              <div className="flex items-center gap-4">
                {getSubmissionStatusBadge()}
                <div className="text-sm text-muted-foreground">
                  {results.score} correct out of {results.total}
                </div>
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