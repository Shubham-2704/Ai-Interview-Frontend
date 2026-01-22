import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const QuizTimer = ({ onTimeUpdate, isActive = true, timeLimit = null }) => {
  const [seconds, setSeconds] = useState(0);
  const [isTimeWarning, setIsTimeWarning] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newTime = prev + 1;
          onTimeUpdate(newTime);

          // Check for time warnings if timeLimit is set
          if (timeLimit && newTime >= timeLimit * 0.8) {
            setIsTimeWarning(true);
          }

          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, onTimeUpdate, timeLimit]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTimeColor = () => {
    if (timeLimit) {
      const timeLeft = timeLimit - seconds;
      if (timeLeft < 60) return "text-red-600"; // Less than 1 minute
      if (timeLeft < timeLimit * 0.3) return "text-orange-600"; // Less than 30% time left
    }
    return "text-primary";
  };

  const getTimeMessage = () => {
    if (!timeLimit) return null;

    const timeLeft = timeLimit - seconds;
    if (timeLeft <= 0) return "Time's up!";
    if (timeLeft < 60) return "Less than 1 minute left!";
    if (timeLeft < 300) return "5 minutes remaining";
    return null;
  };

  return (
    <Card
      className={cn(
        "border-2 transition-all",
        isTimeWarning
          ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20"
          : "border-primary/20",
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Timer Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isTimeWarning ? (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              ) : (
                <Clock className="h-5 w-5 text-primary" />
              )}
              <span className="font-medium">Time</span>
            </div>
            <div
              className={cn(
                "font-mono text-2xl font-bold transition-colors",
                getTimeColor(),
              )}
            >
              {formatTime(seconds)}
            </div>
          </div>

          {/* Time Limit Info */}
          {timeLimit && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Limit</span>
                <span className="font-medium">{formatTime(timeLimit)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Time Left</span>
                <span className={cn("font-medium", getTimeColor())}>
                  {formatTime(Math.max(0, timeLimit - seconds))}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-1000",
                      seconds / timeLimit > 0.8
                        ? "bg-red-500"
                        : seconds / timeLimit > 0.6
                          ? "bg-orange-500"
                          : "bg-green-500",
                    )}
                    style={{
                      width: `${Math.min(100, (seconds / timeLimit) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Time Warning Message */}
          {getTimeMessage() && (
            <div
              className={cn(
                "text-sm font-medium px-3 py-2 rounded-lg",
                seconds >= timeLimit
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
              )}
            >
              ⏰ {getTimeMessage()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizTimer;