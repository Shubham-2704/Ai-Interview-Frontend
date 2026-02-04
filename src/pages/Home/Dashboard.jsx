import React, { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import SummaryCard from "@/components/Cards/SummaryCard";
import { CARD_BG } from "@/utils/data";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateSessionForm from "./CreateSessionForm";
import { toast } from "sonner";
import DashboardSkeleton from "./components/DashboardSkeleton";

const Dashboard = () => {
  const [openCreateModel, setOpenCreateModel] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const navigate = useNavigate();

  const fetchAllSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast.error("Failed to fetch sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = async (sessionId) => {
    try {
      const response = await axiosInstance.delete(
        API_PATHS.SESSION.DELETE(sessionId),
      );

      toast.success(response.data.message);

      setOpenDeleteAlert(false);
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, [fetchAllSessions]);

  return (
    <DashboardLayout>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="w-full min-h-screen px-4 md:px-8 py-4">
          {/* Content Area */}
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg text-gray-600 mb-2">No sessions found</p>
              <p className="text-base text-gray-500 mb-6 max-w-md">
                Create a new session to get started!
              </p>
              <Button
                onClick={() => setOpenCreateModel(true)}
                className="px-6"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Session
              </Button>
            </div>
          ) : (
            <div className="w-full">
              {/* Simple responsive grid - 1 column on mobile, 2 on tablet, 3 on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {sessions?.map((session, index) => (
                  <div key={session?._id} className="h-full">
                    <SummaryCard
                      colors={CARD_BG[index % CARD_BG.length]}
                      data={session}
                      onSelect={() =>
                        navigate(`/interview-prep/${session?._id}`)
                      }
                      onDelete={() => deleteSession(session?._id)}
                      openDeleteAlert={openDeleteAlert}
                      setOpenDeleteAlert={setOpenDeleteAlert}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floating Action Button */}
          <Dialog open={openCreateModel} onOpenChange={setOpenCreateModel}>
            <DialogTrigger asChild>
              {sessions.length !== 0 && (
                <Button
                  size="lg"
                  className="font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 fixed z-40 
                  bottom-6 right-6 
                  sm:bottom-8 sm:right-8"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New
                </Button>
              )}

            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Start a New Interview Journey
                </DialogTitle>
                <DialogDescription className="text-base">
                  Fill out a few quick details and unlock your personalized set
                  of interview questions!
                </DialogDescription>
              </DialogHeader>

              <div className="py-2">
                <CreateSessionForm
                  onSuccess={() => {
                    setOpenCreateModel(false);
                    fetchAllSessions();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
