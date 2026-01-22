import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const QuizProgress = ({ current, total, answers = [] }) => {
  const answeredCount = answers.filter((a) => a !== null).length;
  const progressPercentage = (answeredCount / total) * 100;

  const getAnswerStatus = (index) => {
    if (index < answeredCount) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (index === current) {
      return <AlertCircle className="h-4 w-4 text-blue-600 animate-pulse" />;
    } else {
      return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-bold text-primary">
                {answeredCount}/{total} answered
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Question Dots (for smaller screens) */}
          <div className="md:hidden">
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: Math.min(total, 10) }).map((_, index) => (
                <div key={index} className="flex items-center">
                  {getAnswerStatus(index)}
                  {index < Math.min(total, 10) - 1 && (
                    <div className="h-px w-4 bg-gray-200 mx-1"></div>
                  )}
                </div>
              ))}
              {total > 10 && (
                <span className="text-sm text-muted-foreground ml-2">
                  +{total - 10} more
                </span>
              )}
            </div>
          </div>

          {/* Current Question Info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Question</p>
              <p className="text-xl font-bold">
                {current + 1} of {total}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-xl font-bold text-orange-600">
                {total - answeredCount}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizProgress;