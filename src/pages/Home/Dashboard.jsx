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
  const [loading, setLoading] = useState(true); // Add loading state

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const navigate = useNavigate();

  const fetchAllSessions = useCallback(async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
      toast.error("Failed to fetch sessions.");
    } finally {
      setLoading(false); // Set loading to false after fetching (success or error)
    }
  }, []);

  const deleteSession = async (sessionId) => {
    try {
      const response = await axiosInstance.delete(
        API_PATHS.SESSION.DELETE(sessionId)
      );

      toast.success(response.data.message);

      setOpenDeleteAlert(false);
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAllSessions();
  }, [fetchAllSessions]);

  return (
    <DashboardLayout>
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="container mx-auto py-4 px-4 md:px-4">
          {sessions.length === 0 ? (
            <p className="text-lg text-gray-600 flex items-center justify-center h-[50vh]">
              No sessions found. Create a new one to get started!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-7 pt-1 pb-6 px-4 md:px-0">
              {sessions?.map((session, index) => (
                <SummaryCard
                  key={session?._id}
                  colors={CARD_BG[index % CARD_BG.length]}
                  data={session}
                  onSelect={() => navigate(`/interview-prep/${session?._id}`)}
                  onDelete={() => deleteSession(session?._id)}
                  openDeleteAlert={openDeleteAlert}
                  setOpenDeleteAlert={setOpenDeleteAlert}
                />
              ))}
            </div>
          )}

          <Dialog open={openCreateModel} onOpenChange={setOpenCreateModel}>
            <DialogTrigger asChild>
              <Button
                size={"lg"}
                className="font-semibold rounded-full hover:bg-black transition-colors hover:shadow-2xl hover:shadow-primary/90 fixed bottom-10 md:bottom-20 right-10 md:right-20"
              >
                <Plus className="size-6" />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a New Interview Journey</DialogTitle>
                <DialogDescription>
                  Fill out a few quick details and unlock your personalized set
                  of interview questions!
                </DialogDescription>
              </DialogHeader>

              <CreateSessionForm />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;

//   return !loading ? (
//     <DashboardSkeleton />
//   ) : (
//     <DashboardLayout>
//       <div className="container mx-auto py-4 px-4 md:px-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-7 pt-1 pb-6 px-4 md:px-0">
//           {sessions.length === 0 ? (
//             <div className="container mx-auto py-4 px-4 md:px-6">
//               <div className="flex flex-col items-center justify-center h-[50vh]">
//                 <p className="text-lg text-gray-600">
//                   No sessions found. Create a new one to get started!
//                 </p>
//                 {/* The create session button is already available via DialogTrigger */}
//               </div>
//             </div>
//           ) : (
//             sessions?.map((session, index) => (
//               <SummaryCard
//                 key={session?._id}
//                 colors={CARD_BG[index % CARD_BG.length]}
//                 data={session}
//                 onSelect={() => navigate(`/interview-prep/${session?._id}`)}
//                 onDelete={() => deleteSession(session?._id)}
//                 openDeleteAlert={openDeleteAlert}
//                 setOpenDeleteAlert={setOpenDeleteAlert}
//               />
//             ))
//           )}
//         </div>

//         <Dialog open={openCreateModel} onOpenChange={setOpenCreateModel}>
//           <DialogTrigger asChild>
//             <Button
//               size={"lg"}
//               className="font-semibold rounded-full hover:bg-black transition-colors hover:shadow-2xl hover:shadow-primary/90 fixed bottom-10 md:bottom-20 right-10 md:right-20"
//             >
//               <Plus className="size-6" />
//               Add New
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Start a New Interview Journey</DialogTitle>
//               <DialogDescription>
//                 Fill out a few quick details and unlock your personalized set of
//                 interview questions!
//               </DialogDescription>
//             </DialogHeader>

//             <CreateSessionForm />
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   );
// };
