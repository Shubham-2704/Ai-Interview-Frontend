import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Pin,
  PinOff,
  Sparkles,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Eye } from "lucide-react";
import AIResponsePreview from "@/pages/InterviewPrep/components/AIResponsePreview";
import { Spinner } from "../ui/spinner";
import { Play, Pause } from "lucide-react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { extractSpeakableText } from "@/utils/stripCodeFromMarkdown";

const QuestionCard = memo(
  ({
    question,
    answer,
    onLearnMore,
    onStudyMaterials,
    isPinned,
    onTogglePin,
    isLoading,
    studyMaterialsLoading,
    questionId,
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);

    // LOCAL loading states
    const [isLocalLoading, setIsLocalLoading] = useState(false);
    const [isLocalMaterialsLoading, setIsLocalMaterialsLoading] =
      useState(false);

    // Separate refs for each button
    const isProcessingLearnMore = useRef(false);
    const isProcessingStudyMaterials = useRef(false);

    // Animation frame refs
    const animationFrameLearnMoreRef = useRef(null);
    const animationFrameExpandRef = useRef(null);
    const animationFrameStudyMaterialsRef = useRef(null);

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
      setIsLocalLoading(true);

      setIsExpanded(true);

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

    const handleStudyMaterials = useCallback(() => {
      // Prevent multiple clicks while processing
      if (isProcessingStudyMaterials.current) return;

      console.log("📞 Study Materials clicked, calling parent function...");

      // 1️⃣ IMMEDIATELY set local loading state
      setIsLocalMaterialsLoading(true);
      isProcessingStudyMaterials.current = true;

      // 2️⃣ Expand card if not expanded
      if (!isExpanded) {
        setIsExpanded(true);
      }

      // 3️⃣ Call parent function on the next tick
      requestAnimationFrame(() => {
        console.log("📞 Calling onStudyMaterials from parent...");
        onStudyMaterials();
      });

      // Fallback reset - but parent should handle clearing via useEffect
      setTimeout(() => {
        if (!studyMaterialsLoading && isLocalMaterialsLoading) {
          setIsLocalMaterialsLoading(false);
          isProcessingStudyMaterials.current = false;
        }
      }, 2000);
    }, [onStudyMaterials, isExpanded, studyMaterialsLoading]);

    // Effect to sync local loading states with parent
    useEffect(() => {
      console.log("🔄 Parent loading states changed:", {
        isLoading,
        studyMaterialsLoading,
        isLocalLoading,
        isLocalMaterialsLoading,
      });

      if (!isLoading && isLocalLoading) {
        setIsLocalLoading(false);
        isProcessingLearnMore.current = false;
      }

      if (!studyMaterialsLoading && isLocalMaterialsLoading) {
        console.log("✅ Parent finished loading, clearing local loading...");
        setIsLocalMaterialsLoading(false);
        isProcessingStudyMaterials.current = false;
      }
    }, [
      isLoading,
      studyMaterialsLoading,
      isLocalLoading,
      isLocalMaterialsLoading,
    ]);

    useEffect(() => {
      if (!isExpanded) {
        stop();
      }
    }, [isExpanded, stop]);

    const handleTogglePin = useCallback(() => {
      onTogglePin();
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
        if (animationFrameStudyMaterialsRef.current) {
          cancelAnimationFrame(animationFrameStudyMaterialsRef.current);
        }
      };
    }, []);

    // Memoize the AIResponsePreview props
    const previewProps = React.useMemo(() => ({ content: answer }), [answer]);

    // Determine button states - USE PARENT'S LOADING STATE DIRECTLY
    const showLearnMoreLoading = isLocalLoading || isLoading;
    const showStudyMaterialsLoading =
      isLocalMaterialsLoading || studyMaterialsLoading;

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
              {/* Pin Button */}
              <Button
                variant={"ghost"}
                onClick={handleTogglePin}
                disabled={showLearnMoreLoading || showStudyMaterialsLoading}
                className="text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border transition-colors duration-150"
              >
                {isPinned ? (
                  <PinOff className="size-3.5" />
                ) : (
                  <Pin className="size-3.5" />
                )}
              </Button>

              {/* Study Materials Button */}
              <Button
                variant="ghost"
                onClick={handleStudyMaterials}
                disabled={showStudyMaterialsLoading}
                className="text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border"
              >
                {showStudyMaterialsLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    <p className="hidden md:block">Loading...</p>
                  </span>
                ) : (
                  <>
                    <BookOpen className="size-3.5" />
                    <span className="hidden md:block">Resources</span>
                  </>
                )}
              </Button>

              {/* Learn More Button */}
              <Button
                variant={"ghost"}
                onClick={handleLearnMore}
                disabled={showLearnMoreLoading}
                className="text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border text-xs text-nowrap transition-colors duration-150"
              >
                {showLearnMoreLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    <p className="hidden md:block">Loading...</p>
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
              disabled={showLearnMoreLoading || showStudyMaterialsLoading}
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
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.studyMaterialsLoading === nextProps.studyMaterialsLoading &&
      prevProps.questionId === nextProps.questionId
    );
  }
);

export default QuestionCard;

