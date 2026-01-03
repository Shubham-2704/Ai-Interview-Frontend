import React, { useEffect, useRef, useState } from "react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { ChevronDown, Pin, PinOff, Sparkles } from "lucide-react";
import AIResponsePreview from "@/pages/InterviewPrep/components/AIResponsePreview";

const QuestionCard = ({
  question,
  answer,
  onLearnMore,
  isPinned,
  onTogglePin,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isExpanded) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight + 10);
    } else {
      setHeight(0);
    }
  }, [isExpanded]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

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
              onClick={onTogglePin}
              className="text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-50 hover:border-indigo-200"
            >
              {isPinned ? (
                <PinOff className="size-3.5" />
              ) : (
                <Pin className="size-3.5" />
              )}
            </Button>

            <Button
              variant={"ghost"}
              onClick={() => {
                setIsExpanded(true);
                onLearnMore();
              }}
              className="text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-50 hover:border-cyan-200 text-xs text-nowrap"
            >
              <Sparkles className="size-3.5" />
              <span className="hidden md:block">Learn More</span>
            </Button>
          </ItemActions>
          <Button
            variant={"ghost"}
            onClick={toggleExpand}
            className="text-gray-400 hover:text-gray-500"
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
          <AIResponsePreview content={answer} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuestionCard);
