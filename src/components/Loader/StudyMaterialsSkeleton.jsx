import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const StudyMaterialsSkeleton = () => {
  return (
    <>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 bg-gray-200 dark:bg-gray-700 w-40" />
          <Skeleton className="h-4 bg-gray-200 dark:bg-gray-700 w-60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded" />
          <Skeleton className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Keywords Skeleton */}
      <div className="mb-6 p-4 bg-card rounded-lg border border-border">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-24" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-32" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"
            />
          ))}
        </div>
        <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-48 mt-2" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-3">
            <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-12 mx-auto mb-2" />
            <Skeleton className="h-6 bg-gray-200 dark:bg-gray-700 w-8 mx-auto" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {["All", "Videos", "Articles", "Practice"].map((tab) => (
            <Skeleton
              key={tab}
              className="h-8 bg-gray-200 dark:bg-gray-700 w-full rounded-md"
            />
          ))}
        </div>
      </div>

      {/* Content Skeleton - Mimics actual material cards */}
      <div className="space-y-6">
        {/* Video Tutorials Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-4 bg-gray-200 dark:bg-gray-700 w-32" />
            </div>
            <Skeleton className="h-5 bg-gray-200 dark:bg-gray-700 w-8" />
          </div>

          <div className="space-y-3">
            {[1, 2].map((card) => (
              <div
                key={card}
                className="bg-card rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 bg-gray-200 dark:bg-gray-700 w-48 mb-2" />
                      <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-md" />
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Skeleton className="h-5 bg-gray-200 dark:bg-gray-700 w-16 rounded-full" />
                  <Skeleton className="h-5 bg-gray-200 dark:bg-gray-700 w-20 rounded-full" />
                </div>

                <div className="space-y-2 mb-3">
                  <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-full rounded" />
                  <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-11/12 rounded" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Skeleton className="h-7 bg-gray-200 dark:bg-gray-700 w-16 rounded-md" />
                  <Skeleton className="h-7 bg-gray-200 dark:bg-gray-700 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          <Skeleton className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
        </div>

        {/* Articles Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <Skeleton className="h-4 bg-gray-200 dark:bg-gray-700 w-32" />
            </div>
            <Skeleton className="h-5 bg-gray-200 dark:bg-gray-700 w-8" />
          </div>

          <div className="space-y-3">
            {[1].map((card) => (
              <div
                key={card}
                className="bg-card rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 bg-gray-200 dark:bg-gray-700 w-48 mb-2" />
                      <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-md" />
                </div>

                <div className="space-y-2 mb-3">
                  <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-full rounded" />
                  <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-10/12 rounded" />
                  <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-9/12 rounded" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Skeleton className="h-7 bg-gray-200 dark:bg-gray-700 w-16 rounded-md" />
                  <Skeleton className="h-7 bg-gray-200 dark:bg-gray-700 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          <Skeleton className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="pt-4 border-t border-border mt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-32" />
          <Skeleton className="h-7 bg-gray-200 dark:bg-gray-700 w-24 rounded-md" />
        </div>
        <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 w-48 mt-2" />
      </div>
    </>
  );
};

export default StudyMaterialsSkeleton;
