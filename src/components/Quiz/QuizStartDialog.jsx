import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const QuizStartDialog = ({ open, onOpenChange, onStartQuiz, isLoading }) => {
  const [questionCount, setQuestionCount] = useState(5);

  const calculateTotalTime = (count) => {
    return Math.floor((count * 180) / 60); // 3 minutes per question
  };

  const handleStart = () => {
    if (questionCount < 1 || questionCount > 20) {
      alert("Please select between 1 and 20 questions");
      return;
    }
    onStartQuiz(questionCount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Quiz</DialogTitle>
          <DialogDescription>
            Choose the number of questions. Each question has a 3-minute time limit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="questionCount">Number of Questions</Label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 10].map((count) => (
                <Button
                  key={count}
                  type="button"
                  variant={questionCount === count ? "default" : "outline"}
                  onClick={() => setQuestionCount(count)}
                  className="flex flex-col items-center p-4"
                >
                  <span className="text-lg font-bold">{count}</span>
                  {/* <span className="text-xs text-muted-foreground">
                    {calculateTotalTime(count)} min total
                  </span> */}
                </Button>
              ))}
            </div>
            <div className="pt-2">
              <Label htmlFor="customCount">Custom (1-20)</Label>
              <Input
                id="customCount"
                type="number"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Time per question
              </span>
              <span className="font-bold">3:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total quiz time</span>
              <span className="font-bold">{calculateTotalTime(questionCount)}:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Questions</span>
              <span className="font-bold">{questionCount}</span>
            </div>
          </div>

          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Quiz will auto-submit when time expires. Each question has a 3-minute limit.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Quiz...
              </>
            ) : (
              `Start ${questionCount}-Question Quiz (${calculateTotalTime(questionCount)} min)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizStartDialog;