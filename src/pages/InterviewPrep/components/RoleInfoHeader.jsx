import React from "react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  lastUpdated,
}) => {
  return (
    <div className="container mx-auto px-4 md:px-8 bg-white relative">
      <Item className="h-[200px] md:flex-col items-start relative z-10">
        <ItemContent>
          <ItemTitle className="text-2xl">{role}</ItemTitle>
          <ItemDescription className="text-primary-foreground/105">
            {topicsToFocus}
          </ItemDescription>
        </ItemContent>

        <ItemContent className="flex-row gap-3">
          <ItemTitle className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
            Experience: {experience} {experience == "1" ? "Year" : "Years"}
          </ItemTitle>
          <ItemTitle className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
            {questions} Q&A
          </ItemTitle>
          <ItemTitle className="text-[10px] font-semibold text-white bg-black px-3 py-1 rounded-full">
            Last Updated: {lastUpdated}
          </ItemTitle>
        </ItemContent>

        <ItemContent>
          <ItemDescription>{description}</ItemDescription>
        </ItemContent>
      </Item>

      <div className="w-[40vw] md:w-[30vw] h-[200px] flex items-center justify-center bg-white overflow-hidden absolute top-0 right-0">
        <div className="w-16 h-16 bg-lime-400 blur-[65px] animate-blob1" />
        <div className="w-16 h-16 bg-teal-400 blur-[65px] animate-blob2" />
        <div className="w-16 h-16 bg-cyan-300 blur-[45px] animate-blob3" />
        <div className="w-16 h-16 bg-fuchsia-200 blur-[45px] animate-blob1" />
      </div>
    </div>
  );
};

export default RoleInfoHeader;
