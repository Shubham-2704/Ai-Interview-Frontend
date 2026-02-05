import React from "react";
import { format } from "date-fns";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getInitials } from "@/utils/helper";

const SummaryCard = ({
  colors,
  data,
  onSelect,
  onDelete,
  // openDeleteAlert,
  setOpenDeleteAlert,
}) => {
  const { role, topicsToFocus, experience, questions, description } = data;
  const lastUpdated = data?.updatedAt
    ? format(data.updatedAt, "do MMM yyyy")
    : "";

  return (
    <Card
      className="border-gray-300/40 p-2 cursor-pointer hover:shadow-xl relative group"
      onClick={onSelect}
    >
      <CardHeader
        className="p-4 rounded-lg cursor-pointer relative"
        style={{ background: colors.bgcolor }}
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 bg-white rounded-md flex items-center justify-center">
            <span className="text-lg font-semibold text-black">
              {getInitials(role)}
            </span>
          </div>
          <div className="grow space-y-1">
            <CardTitle>{role}</CardTitle>
            <CardDescription className="font-medium text-xs text-muted-foreground/110">
              {topicsToFocus}
            </CardDescription>

            <CardAction>
              <AlertDialog
              // open={openDeleteAlert}
              // onOpenChange={setOpenDeleteAlert}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDeleteAlert(true);
                    }}
                    className="md:hidden md:group-hover:flex items-center gap-2 text-destructive bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200  px-3 py-1 absolute top-0 right-0"
                  >
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete this session detail?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDeleteAlert(false);
                      }}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="bg-primary"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardAction>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            Experience: {experience || "-"}{" "}
            {experience == "1" ? "Year" : "Years"}
          </div>

          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            {questions.length || "-"} Q&A
          </div>

          <div className="text-[10px] font-medium text-black px-3 py-1 border-[0.5px] border-gray-900 rounded-full">
            Last Updated: {lastUpdated}
          </div>
        </div>

        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
      {/* <CardFooter>
        <p>Card Footer</p>
      </CardFooter> */}
    </Card>
  );
};

export default SummaryCard;