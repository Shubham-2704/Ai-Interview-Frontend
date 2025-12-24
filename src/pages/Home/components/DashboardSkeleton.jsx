import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const DashboardSkeleton = () => {
  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-7 pt-1 pb-6 px-4 md:px-0">
        {[...Array(6)].map((_, index) => (
          <Card
            key={index}
            className="w-full rounded-lg shadow-md overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="h-32 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4 mt-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
