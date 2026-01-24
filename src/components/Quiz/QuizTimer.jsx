import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertCircle, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const QuizTimer = ({
  onTimeUpdate,
  isActive = true,
  timeLimit = 0,
  onTimeUp,
  currentQuestion,
  totalQuestions,
  initialTimeSpent = 0,
  onExtendTime,
  timeExtensionUsed = false,
}) => {
  const [timeSpent, setTimeSpent] = useState(initialTimeSpent);
  const [isCritical, setIsCritical] = useState(false);

  const formatTimeDisplay = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeSpent((prev) => {
        const newTime = prev + 1;

        if (timeLimit > 0) {
          const timeLeft = timeLimit - newTime;

          // Show red when timeLeft <= 60 seconds
          if (timeLeft <= 60 && timeLeft > 0) {
            setIsCritical(true);
          } else if (timeLeft > 60) {
            setIsCritical(false);
          }

          if (timeLeft <= 0) {
            clearInterval(interval);
            onTimeUp?.();
            return timeLimit;
          }
        }

        onTimeUpdate?.(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUpdate, onTimeUp, timeLimit]);

  const handleExtendTime = () => {
    if (onExtendTime && !timeExtensionUsed) {
      const newTimeLeft = timeLimit - timeSpent + 30;
      if (newTimeLeft > 60) {
        setIsCritical(false);
      }
      onExtendTime(30);
    }
  };

  const progressPercentage = timeLimit > 0 ? (timeSpent / timeLimit) * 100 : 0;
  const timeLeft = Math.max(0, timeLimit - timeSpent);

  const getProgressColor = () => {
    if (timeLimit <= 0) return "bg-blue-500";
    if (progressPercentage > 90) return "bg-red-500";
    if (progressPercentage > 75) return "bg-orange-500";
    if (progressPercentage > 50) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card
      className={cn(
        "border-2 transition-all duration-300 p-0",
        isCritical && timeLeft > 0
          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
          : "border-primary/20",
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCritical && timeLeft > 0 ? (
                <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
              ) : (
                <Clock className="h-5 w-5 text-primary" />
              )}
              <span className="font-semibold">Quiz Timer</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "text-xl font-bold font-mono",
                  isCritical && timeLeft > 0
                    ? "text-red-600 animate-pulse"
                    : "text-primary",
                )}
              >
                {formatTimeDisplay(timeSpent)}
                {timeLimit > 0 && ` / ${formatTimeDisplay(timeLimit)}`}
              </div>
            </div>
          </div>

          {/* Question Info */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestion} of {totalQuestions}
            </span>
            <span>3:00 per question</span>
          </div>

          {timeLimit > 0 && (
            <div className="space-y-2">
              <Progress
                value={progressPercentage}
                className={cn("h-2", getProgressColor())}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {timeLeft > 0
                    ? `${formatTimeDisplay(timeLeft)} remaining`
                    : "Time's up!"}
                </span>
              </div>
            </div>
          )}

          {/* 30 Second Extension Button - Only show when timeLeft < 120 (2 minutes) */}
          {onExtendTime && !timeExtensionUsed && timeLeft < 120 && (
            <Button
              onClick={handleExtendTime}
              variant="outline"
              className={cn(
                "gap-2 mt-2 border-green-300 hover:bg-green-50",
                timeLeft <= 60
                  ? "text-red-600 border-red-300 hover:bg-red-50"
                  : "text-green-600",
              )}
            >
              <Plus className="h-3 w-3" />
              Add 30 seconds
              {timeLeft <= 60 && " ⚡"}
            </Button>
          )}

          {timeExtensionUsed && (
            <div className="text-xs text-gray-500 text-center mt-2">
              ⏰ 30 seconds already added to this question
            </div>
          )}

          {isCritical && timeLeft > 0 && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded animate-pulse">
              ⚡ Less than 1 minute remaining!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizTimer;
