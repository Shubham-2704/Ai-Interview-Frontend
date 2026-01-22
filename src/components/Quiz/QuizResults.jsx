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
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const QuizResults = ({ results, onRetry, onDownload, timeSpent }) => {
  const { score, total, percentage, questions, feedback } = results;

  // Get correct and wrong question numbers
  const correctQuestions = [];
  const wrongQuestions = [];

  questions.forEach((q, index) => {
    const questionNumber = q.number || index + 1;
    if (q.isCorrect) {
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

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
          <Badge className={`text-lg py-1.5 px-4 ${performance.color}`}>
            {performance.emoji} {performance.level}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {formatTime(timeSpent)}
              </div>
              <p className="text-sm text-muted-foreground">Time Spent</p>
            </Card>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="text-2xl font-bold">{total - score}</div>
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
                  Perfect! All answers correct 🎉
                </div>
              )}
            </Card>
          </div>

          {/* Feedback */}
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
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {wrongQuestions.length > 0
                    ? `Focus on reviewing questions: ${wrongQuestions.join(", ")}`
                    : "Excellent work! You answered all questions correctly!"}
                </p>
              </div>
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

          {/* Tips */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              💡 <strong>Tip:</strong> Consistent practice leads to better
              retention. Try to take quizzes regularly!
            </p>
            <p className="mt-1">Each mistake is a learning opportunity! 📚</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizResults;
