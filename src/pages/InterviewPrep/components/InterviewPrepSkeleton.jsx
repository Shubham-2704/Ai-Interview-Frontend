import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InterviewPrepSkeleton = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Role Info Header Skeleton */}
      <div className="p-4 bg-white h-[200px] rounded-lg shadow-md md:flex justify-between items-center relative">
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-3 w-80" />

          <div className="flex items-center gap-3 mt-12">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>
        {/* <div className="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div> */}
        <div className="hidden w-[40vw] md:w-[30vw] h-[200px] sm:flex items-center justify-center bg-white overflow-hidden absolute top-0 right-0">
          <div className="w-16 h-16 bg-lime-400 blur-[65px] animate-blob1" />
          <div className="w-16 h-16 bg-teal-400 blur-[65px] animate-blob2" />
          <div className="w-16 h-16 bg-cyan-300 blur-[45px] animate-blob3" />
          <div className="w-16 h-16 bg-fuchsia-200 blur-[45px] animate-blob1" />
        </div>
      </div>

      {/* Interview Q & A Section Skeleton */}
      <Card className="shadow-none border-none container mx-auto px-4 md:px-0">
        <CardHeader>
          <CardTitle className="text-lg">
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-12 gap-4">
          {/* Question Card Skeletons */}
          {[...Array(3)].map((_, index) => (
            <div key={index} className="col-span-12">
              <Card className="mb-4 p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex justify-end space-x-2 mt-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </Card>
            </div>
          ))}

          {/* Load More Button Skeleton */}
          <div className="col-span-12 flex items-center justify-center mt-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewPrepSkeleton;
