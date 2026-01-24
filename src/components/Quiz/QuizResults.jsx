import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  BarChart3,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
  HelpCircle,
  Zap,
  Timer,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const QuizResults = ({
  results,
  onRetry,
  onDownload,
  timeSpent,
  totalTimeLimit,
  timePerQuestion = [],
  timeExtensions = [], // Add timeExtensions prop to track added time
}) => {
  const { score, total, percentage, questions, feedback, submissionType } =
    results;

  // Calculate total extended time (time added through extensions)
  const totalExtendedTime = timeExtensions.reduce(
    (sum, ext) => sum + ext.seconds,
    0,
  );

  // Calculate actual time spent including extensions
  const actualTimeSpent = timeSpent + totalExtendedTime;

  // Get correct, wrong, and unanswered question numbers
  const correctQuestions = [];
  const wrongQuestions = [];
  const unansweredQuestions = [];

  questions.forEach((q, index) => {
    const questionNumber = q.number || index + 1;

    // Check if question was answered (userAnswer is not null/undefined and not -1)
    const isAnswered =
      q.userAnswer !== null &&
      q.userAnswer !== undefined &&
      q.userAnswer !== -1;

    if (!isAnswered) {
      unansweredQuestions.push(questionNumber);
    } else if (q.isCorrect) {
      correctQuestions.push(questionNumber);
    } else {
      wrongQuestions.push(questionNumber);
    }
  });

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 80) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90)
      return {
        level: "Excellent",
        emoji: "🎯",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      };
    if (percentage >= 80)
      return {
        level: "Great",
        emoji: "✨",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      };
    if (percentage >= 70)
      return {
        level: "Good",
        emoji: "👍",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
    if (percentage >= 60)
      return {
        level: "Fair",
        emoji: "💪",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      };
    return {
      level: "Needs Practice",
      emoji: "🔥",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
  };

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null || isNaN(seconds))
      return "0s";
    if (seconds === 0) return "0s";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0 && secs === 0) {
      return `${mins}m`;
    } else if (mins > 0) {
      return `${mins}m : ${secs.toString().padStart(2, "0")}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Calculate time usage percentage
  const timeUsagePercentage =
    totalTimeLimit > 0
      ? Math.min(100, Math.round((actualTimeSpent / totalTimeLimit) * 100))
      : 0;

  const performance = getPerformanceLevel(percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 shadow-xl dark:border-gray-800">
        {/* Header */}
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <Trophy className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge className={`text-lg py-1.5 px-4 ${performance.color}`}>
              {performance.emoji} {performance.level}
            </Badge>
            {submissionType === "auto" && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Auto-Submitted (Time Expired)
              </Badge>
            )}
            {totalExtendedTime > 0 && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
              >
                <Zap className="h-3 w-3" />
                Time Extended: +{totalExtendedTime}s
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-6 border-2">
              <div className="text-5xl font-bold mb-2">
                <span className={getPerformanceColor(percentage)}>
                  {score}/{total}
                </span>
              </div>
              <Progress value={percentage} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </Card>

            <Card className="text-center p-6 border-2">
              <div className="text-5xl font-bold mb-2">
                <span className={getPerformanceColor(percentage)}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Overall Score</span>
              </div>
            </Card>

            <Card className="text-center p-6 border-2">
              <div className="text-5xl font-bold mb-2 flex items-center justify-center gap-2">
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                {formatTime(actualTimeSpent)}
              </div>
              <p className="text-sm text-muted-foreground">
                Time Spent (Incl. Extensions)
              </p>
            </Card>

            <Card className="text-center p-6 border-2">
              <div className="text-5xl font-bold mb-2">
                {totalTimeLimit ? formatTime(totalTimeLimit) : "∞"}
              </div>
              <p className="text-sm text-muted-foreground">
                Original Time Limit
              </p>
            </Card>
          </div>

          {/* Enhanced Time Analysis Card */}
          <Card className="p-6 border-2">
            <div className="flex items-center gap-3 mb-4">
              <Timer className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-semibold">Detailed Time Analysis</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">
                  {formatTime(actualTimeSpent)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Time Spent
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">
                  {totalTimeLimit ? formatTime(totalTimeLimit) : "∞"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Original Limit
                </div>
              </div>
              {/* // In the Detailed Time Analysis section, change the 3rd card: */}
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">
                  {formatTime(Math.max(0, actualTimeSpent - totalTimeLimit))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Time Extended
                </div>
                {totalExtendedTime > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    {timeExtensions.length} extension(s) used
                  </div>
                )}
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold">
                  {totalTimeLimit ? `${timeUsagePercentage}%` : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">Time Used</div>
                <Progress
                  value={timeUsagePercentage}
                  className={`h-1.5 mt-2 ${
                    timeUsagePercentage > 90
                      ? "bg-red-500"
                      : timeUsagePercentage > 75
                        ? "bg-orange-500"
                        : timeUsagePercentage > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }`}
                />
              </div>
            </div>

            {/* Time extensions used */}
            {timeExtensions.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Time Extensions Used:</span>
                </div>
                <div className="space-y-2">
                  {timeExtensions.map((ext, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        Question {ext.questionNumber + 1}: +{ext.seconds}{" "}
                        seconds
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ext.timestamp
                          ? new Date(ext.timestamp).toLocaleTimeString()
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                  💡 You used time extensions to carefully consider your
                  answers!
                </div>
              </div>
            )}
          </Card>

          {/* Performance Stats - Now 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Correct Answers Card */}
            <Card className="p-4 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{score}</div>
                  <div className="text-sm text-muted-foreground">
                    Correct Answers
                  </div>
                </div>
              </div>

              {correctQuestions.length > 0 ? (
                <div>
                  <div className="text-sm font-medium mb-2">
                    Correct Questions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {correctQuestions.map((qNum) => (
                      <Badge
                        key={qNum}
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                      >
                        Q{qNum}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No correct answers
                </div>
              )}
            </Card>

            {/* Wrong Answers Card */}
            <Card className="p-4 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {wrongQuestions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Wrong Answers
                  </div>
                </div>
              </div>

              {wrongQuestions.length > 0 ? (
                <div>
                  <div className="text-sm font-medium mb-2">
                    Questions to Review:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wrongQuestions.map((qNum) => (
                      <Badge
                        key={qNum}
                        variant="secondary"
                        className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                      >
                        Q{qNum}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No wrong answers
                </div>
              )}
            </Card>

            {/* Unanswered Questions Card */}
            <Card className="p-4 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {unansweredQuestions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Unanswered
                  </div>
                </div>
              </div>

              {unansweredQuestions.length > 0 ? (
                <div>
                  <div className="text-sm font-medium mb-2">
                    Unanswered Questions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unansweredQuestions.map((qNum) => (
                      <Badge
                        key={qNum}
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
                      >
                        Q{qNum}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    ⏰ These questions were not answered before time expired
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  All questions answered
                </div>
              )}
            </Card>
          </div>

          {/* Feedback - Updated to include time management insights */}
          <Card className="p-6 border-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Performance Feedback</h3>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-medium">
                {performance.emoji}{" "}
                {feedback ||
                  `You scored ${percentage.toFixed(1)}% on this quiz.`}
              </p>

              <div className="space-y-2">
                {wrongQuestions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-500" />
                    <p className="text-sm">
                      <span className="font-medium">Focus on reviewing:</span>{" "}
                      Questions {wrongQuestions.join(", ")}
                    </p>
                  </div>
                )}

                {unansweredQuestions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <p className="text-sm">
                      <span className="font-medium">Unanswered questions:</span>{" "}
                      {unansweredQuestions.join(", ")} - Practice time
                      management
                    </p>
                  </div>
                )}

                {totalExtendedTime > 0 && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <p className="text-sm">
                      <span className="font-medium">Time extensions used:</span>{" "}
                      You added {totalExtendedTime} seconds total
                    </p>
                  </div>
                )}

                {wrongQuestions.length === 0 &&
                  unansweredQuestions.length === 0 && (
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <p className="text-sm text-muted-foreground">
                        Excellent work! You answered all questions correctly!
                      </p>
                    </div>
                  )}
              </div>

              {submissionType === "auto" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Time Management Tip:</span>
                    <span>
                      Try to pace yourself better next time. Each question has a
                      3-minute limit.
                    </span>
                  </div>
                </div>
              )}

              {unansweredQuestions.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Quick Tip:</span>
                    <span>
                      If you're running out of time, try to at least select an
                      answer for every question.
                    </span>
                  </div>
                </div>
              )}

              {totalExtendedTime > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Smart Strategy:</span>
                    <span>
                      Using time extensions wisely shows good time management
                      skills!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={onRetry}
              size="lg"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Another Quiz
            </Button>
            <Button
              onClick={onDownload}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Results
            </Button>
          </div>

          {/* Tips - Updated */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              📝 <strong>Pro Tip:</strong>{" "}
              {unansweredQuestions.length > 0
                ? "Always try to answer every question, even if you have to guess!"
                : "Great job answering all questions!"}
            </p>
            <p className="mt-1">
              ⏰ <strong>Time Management:</strong>{" "}
              {totalExtendedTime > 0
                ? `You wisely used ${totalExtendedTime} seconds of extra time to think carefully!`
                : "Practice with timers to improve your speed!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizResults;