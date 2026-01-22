import React, { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Target, Clock, Brain, Trophy } from "lucide-react";
import { UserContext } from "@/context/UserContext";

const QuizStartDialog = ({ open, onOpenChange, onStartQuiz, isLoading }) => {
  const [questionCount, setQuestionCount] = useState(10);
  const { user, openApiKeyModal } = useContext(UserContext);

  const handleStart = () => {
    if (!user?.hasGeminiKey) {
      openApiKeyModal();
      return;
    }
    onStartQuiz(questionCount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Start Practice Quiz
          </DialogTitle>
          <DialogDescription>
            Generate a quiz based on your session questions. Test your
            knowledge!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question Count Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="questions" className="text-lg font-medium">
                Number of Questions
              </Label>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-primary">
                  {questionCount}
                </div>
                <span className="text-muted-foreground">questions</span>
              </div>
            </div>

            <Slider
              value={[questionCount]}
              onValueChange={(value) => setQuestionCount(value[0])}
              min={5}
              max={30}
              step={1}
              className="w-full cursor-pointer"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />5 (Quick)
              </span>
              <span className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                15 (Standard)
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                30 (Comprehensive)
              </span>
            </div>
          </div>

          {/* Quiz Features */}
          <div className="rounded-xl border p-4 space-y-3 bg-blue-50/50">
            <h4 className="font-medium text-lg">What you'll get:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <span>
                  <strong>AI-generated questions</strong> based on your session
                  topics
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <span>
                  <strong>Timer & progress tracking</strong> for realistic
                  practice
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <span>
                  <strong>Instant scoring</strong> with detailed explanations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <span>
                  <strong>Performance analytics</strong> to track improvement
                </span>
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="rounded-lg border p-3 bg-yellow-50/50">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Start with 10 questions to gauge your
              current level, then increase difficulty as you improve.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="gap-2 bg-blue-600 hover:bg-blue-700 min-w-32"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Start Quiz Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizStartDialog;
