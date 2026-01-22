import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const QuizQuestionCard = ({
  question,
  index,
  selectedAnswer,
  onAnswerSelect,
  showResults = false,
  isCorrect = null,
  correctAnswer = null,
  explanation = null,
  disabled = false,
}) => {
  const options = ["A", "B", "C", "D"];

  const getOptionStyle = (optIndex) => {
    if (!showResults) return "";

    if (optIndex === correctAnswer) {
      return "border-2 border-green-500 bg-green-50 dark:bg-green-950/20";
    }

    if (optIndex === selectedAnswer && !isCorrect) {
      return "border-2 border-red-500 bg-red-50 dark:bg-red-950/20";
    }

    return "";
  };

  const getOptionStatus = (optIndex) => {
    if (!showResults) return null;

    if (optIndex === correctAnswer) {
      return (
        <div className="ml-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    }

    if (optIndex === selectedAnswer && !isCorrect) {
      return (
        <div className="ml-2 text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4" />
        </div>
      );
    }

    return null;
  };

  return (
    <Card
      className={cn(
        "mb-6 border-2 transition-all duration-200",
        showResults
          ? isCorrect
            ? "border-green-200 dark:border-green-800"
            : "border-red-200 dark:border-red-800"
          : "hover:border-primary/30 border-gray-200 dark:border-gray-800",
      )}
    >
      <CardContent className="pt-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="text-lg px-3 py-1 font-mono bg-primary/10"
            >
              Q{index + 1}
            </Badge>
            {showResults && (
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Correct</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">Incorrect</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {showResults && !isCorrect && (
            <Badge variant="destructive" className="text-sm font-mono">
              Correct: {options[correctAnswer]}
            </Badge>
          )}
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <div className="text-lg font-medium leading-relaxed whitespace-pre-wrap">
            {question.question}
          </div>
        </div>

        {/* Options */}
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => onAnswerSelect(parseInt(value))}
          disabled={disabled || showResults}
          className="space-y-3"
        >
          {question.options.map((option, optIndex) => (
            <div
              key={optIndex}
              className={cn(
                "flex items-center space-x-3 p-4 rounded-lg border transition-all",
                getOptionStyle(optIndex),
                !showResults && "hover:bg-accent cursor-pointer",
                selectedAnswer === optIndex &&
                  !showResults &&
                  "border-primary bg-primary/5",
              )}
            >
              <RadioGroupItem
                value={optIndex.toString()}
                id={`q${index}-opt${optIndex}`}
                className="h-5 w-5"
              />
              <Label
                htmlFor={`q${index}-opt${optIndex}`}
                className="flex-1 cursor-pointer text-base flex items-center justify-between"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Badge
                    variant="secondary"
                    className="font-mono w-8 h-8 flex items-center justify-center"
                  >
                    {options[optIndex]}
                  </Badge>
                  <span className="flex-1 whitespace-pre-wrap">{option}</span>
                </div>
                {getOptionStatus(optIndex)}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Explanation (only shown in review mode) */}
        {showResults && explanation && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                Explanation:
              </h4>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {explanation}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizQuestionCard;