import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const Questions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Questions Management</h1>
        <p className="text-gray-500">Manage interview questions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <MessageSquare className="inline mr-2 h-5 w-5" />
            Questions Page
          </CardTitle>
          <CardDescription>This page is under construction</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Questions management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Questions;
