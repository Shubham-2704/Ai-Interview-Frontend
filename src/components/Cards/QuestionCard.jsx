import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pin, PinOff, Sparkles } from "lucide-react";
import AIResponsePreview from "@/pages/InterviewPrep/components/AIResponsePreview";
import { Spinner } from "../ui/spinner";
import { Play, Pause } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { extractSpeakableText } from "@/utils/stripCodeFromMarkdown";

const QuestionCard = React.memo(
  ({ question, answer, onLearnMore, isPinned, onTogglePin, isLoading }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);

    // LOCAL loading state for immediate feedback
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    // Separate refs for each button
    const isProcessingLearnMore = useRef(false);

    // Animation frame refs
    const animationFrameLearnMoreRef = useRef(null);
    const animationFrameExpandRef = useRef(null);

    const speakableText = React.useMemo(
      () => extractSpeakableText(answer),
      [answer]
    );
    const {
      status: speechStatus,
      speak,
      pause,
      resume,
      stop,
      activeSentenceIndex,
      sentences,
    } = useSpeechSynthesis(speakableText);

    // Optimized click handlers
    const handleLearnMore = useCallback(() => {
      if (isProcessingLearnMore.current || isLoading) return;

      isProcessingLearnMore.current = true;

      // 1. Show loading IMMEDIATELY
      setIsLocalLoading(true);

      // 2. Expand the card
      setIsExpanded(true);

      // 3. Call the parent handler
      animationFrameLearnMoreRef.current = requestAnimationFrame(() => {
        onLearnMore();
      });

      // Reset after a short delay (fallback)
      setTimeout(() => {
        if (!isLoading) {
          setIsLocalLoading(false);
          isProcessingLearnMore.current = false;
        }
      }, 1000);
    }, [onLearnMore, isLoading]);

    // Effect to sync local loading with parent loading
    useEffect(() => {
      if (!isLoading && isLocalLoading) {
        setIsLocalLoading(false);
        isProcessingLearnMore.current = false;
      }
    }, [isLoading, isLocalLoading]);

    useEffect(() => {
      if (!isExpanded) {
        stop();
      }
    }, [isExpanded, stop]);

    const handleTogglePin = useCallback(() => {
      onTogglePin(); // Direct call
    }, [onTogglePin]);

    const toggleExpand = useCallback(() => {
      animationFrameExpandRef.current = requestAnimationFrame(() => {
        setIsExpanded((prev) => !prev);
      });
    }, []);

    // Optimized height calculation
    useEffect(() => {
      if (!isExpanded) {
        setHeight(0);
        return;
      }

      const timer = setTimeout(() => {
        if (contentRef.current) {
          const contentHeight = contentRef.current.scrollHeight;
          setHeight(contentHeight + 10);
        }
      }, 50);

      return () => clearTimeout(timer);
    }, [isExpanded, answer]);

    // Cleanup animation frames
    useEffect(() => {
      return () => {
        if (animationFrameLearnMoreRef.current) {
          cancelAnimationFrame(animationFrameLearnMoreRef.current);
        }
        if (animationFrameExpandRef.current) {
          cancelAnimationFrame(animationFrameExpandRef.current);
        }
      };
    }, []);

    // Memoize the AIResponsePreview props
    const previewProps = React.useMemo(() => ({ content: answer }), [answer]);

    // Determine button state - show loading immediately on click
    const showLoading = isLocalLoading || isLoading;

    return (
      <div className="bg-white rounded-lg mb-4 overflow-hidden py-4 px-5 shadow-xl shadow-gray-100/70 border border-gray-100/60 group">
        <Item className="flex-nowrap cursor-pointer p-0">
          <ItemHeader
            onClick={toggleExpand}
            className="justify-normal text-xs md:text-sm font-medium mr-0 md:mr-20"
          >
            <span className="text-xs md:text-[15px] font-semibold text-gray-400 leading-[18px]">
              Q
            </span>
            {question}
          </ItemHeader>
          <ItemContent className="flex flex-row items-center justify-end relative">
            <ItemActions
              className={`flex ${
                isExpanded ? "md:flex" : "md:hidden group-hover:flex"
              }`}
            >
              <Button
                variant={"ghost"}
                onClick={handleTogglePin}
                disabled={showLoading}
                className="text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-50 hover:border-indigo-200 transition-colors duration-150"
              >
                {isPinned ? (
                  <PinOff className="size-3.5" />
                ) : (
                  <Pin className="size-3.5" />
                )}
              </Button>

              <Button
                variant={"ghost"}
                onClick={handleLearnMore}
                disabled={showLoading || isProcessingLearnMore.current}
                className="text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-50 hover:border-cyan-200 text-xs text-nowrap transition-colors duration-150"
              >
                {showLoading ? (
                  <span className="flex items-center">
                    <Spinner className="mr-2 size-3.5" />
                    Loading...
                  </span>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    <span className="hidden md:block">Learn More</span>
                  </>
                )}
              </Button>
            </ItemActions>
            <Button
              variant={"ghost"}
              onClick={toggleExpand}
              disabled={showLoading} // Disable expand button when loading
              className="text-gray-400 hover:text-gray-500 transition-colors duration-150"
            >
              <ChevronDown
                className={`size-5 transform transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </ItemContent>
        </Item>
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: `${height}px` }}
        >
          <div
            ref={contentRef}
            className="mt-4 text-gray-700 bg-gray-50 px-5 py-5 rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              {/* Left: Listening */}
              {speechStatus === "playing" ? (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
                  </span>
                  <span className="hidden sm:inline text-xs text-green-600 font-medium">
                    Listening
                  </span>
                </div>
              ) : (
                <div />
              )}

              {/* Right: Buttons */}
              <div className="flex gap-2">
                {speechStatus === "idle" && (
                  <Button size="sm" variant="outline" onClick={speak}>
                    <Play className="size-4 sm:mr-1" />
                    <span className="hidden sm:inline">Listen</span>
                  </Button>
                )}

                {speechStatus === "playing" && (
                  <Button size="sm" variant="outline" onClick={pause}>
                    <Pause className="size-4 sm:mr-1" />
                    <span className="hidden sm:inline">Pause</span>
                  </Button>
                )}

                {speechStatus === "paused" && (
                  <Button size="sm" variant="outline" onClick={resume}>
                    <Play className="size-4 sm:mr-1" />
                    <span className="hidden sm:inline">Resume</span>
                  </Button>
                )}
              </div>
            </div>


            <AIResponsePreview {...previewProps} />
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom shallow comparison
    return (
      prevProps.question === nextProps.question &&
      prevProps.answer === nextProps.answer &&
      prevProps.isPinned === nextProps.isPinned &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);

export default QuestionCard;
