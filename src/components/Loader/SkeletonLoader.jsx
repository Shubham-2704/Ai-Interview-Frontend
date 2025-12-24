import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonLoader = () => {
  return (
    <>
      <div role="status" className="space-y-4 max-w-3xl">
        <Skeleton className="h-6 bg-gray-200 dark:bg-gray-700 w-1/2" />

        <div className="space-y-2">
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-11/12" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10/12" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-9/12" />
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 space-y-2">
          <Skeleton className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <Skeleton className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
          <Skeleton className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
        </div>
      </div>

      <div className="space-y-4 max-w-3xl mt-10">
        <Skeleton className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2" />

        <div className="space-y-2">
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-11/12" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10/12" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-9/12" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-11/12" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10/12" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-9/12" />
        </div>

        <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 space-y-2">
          <Skeleton className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
          <Skeleton className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
        </div>

        <Skeleton className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2 mt-8" />

        <div className="space-y-2">
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-11/12" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10/12" />
          <Skeleton className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-9/12" />
        </div>
      </div>
    </>
  );
};

export default SkeletonLoader;
