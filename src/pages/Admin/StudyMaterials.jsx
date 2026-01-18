import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const StudyMaterials = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Materials</h1>
        <p className="text-gray-500">Manage study materials and resources</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <BookOpen className="inline mr-2 h-5 w-5" />
            Study Materials Page
          </CardTitle>
          <CardDescription>This page is under construction</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Study materials management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyMaterials;
