import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Shield,
  Clock,
  FileText,
  MessageSquare,
  BookOpen,
  Edit,
  Trash2,
  Activity,
  Loader2,
  AlertTriangle,
  Target,
  Trophy,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

// ✅ Import shadcn dialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserDetails = () => {
  const { userId: id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ State for quiz data
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    avgQuizScore: 0,
    totalQuestionsAttempted: 0,
    quizCompletionRate: 0,
  });

  // ✅ State for session-wise quiz data
  const [sessionQuizzes, setSessionQuizzes] = useState({});

  // ✅ State for delete dialogs
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deleteSessionDialog, setDeleteSessionDialog] = useState({
    open: false,
    sessionId: null,
    sessionTitle: "",
  });

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      // Fetch basic user details
      const userResponse = await axiosInstance.get(
        API_PATHS.ADMIN.USER_DETAILS(id),
      );

      const data = userResponse.data;

      setUser(data.user);
      setStats(data.stats);
      setSessions(data.sessions || []);

      // ✅ Fetch quiz statistics separately
      try {
        const quizResponse = await axiosInstance.get(
          API_PATHS.ADMIN.USER_QUIZ_STATS(id),
        );

        if (quizResponse.data) {
          setQuizStats({
            totalQuizzes: quizResponse.data.totalQuizzes || 0,
            avgQuizScore: quizResponse.data.avgQuizScore || 0,
            totalQuestionsAttempted:
              quizResponse.data.totalQuestionsAttempted || 0,
            quizCompletionRate: quizResponse.data.quizCompletionRate || 0,
          });

          // Set session-wise quiz data
          if (quizResponse.data.sessionQuizzes) {
            setSessionQuizzes(quizResponse.data.sessionQuizzes);
          }
        }
      } catch (quizError) {
        console.error("Error fetching quiz stats:", quizError);
        // Set default values if quiz API fails
        setQuizStats({
          totalQuizzes: 0,
          avgQuizScore: 0,
          totalQuestionsAttempted: 0,
          quizCompletionRate: 0,
        });
        setSessionQuizzes({});
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to fetch user details",
      );
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get quiz count for a specific session
  const getSessionQuizCount = (sessionId) => {
    return sessionQuizzes[sessionId]?.quizCount || 0;
  };

  // ✅ Get average quiz score for a specific session
  const getSessionAvgScore = (sessionId) => {
    return sessionQuizzes[sessionId]?.avgScore || 0;
  };

  const handleDeleteUser = async () => {
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_USER(id));
      toast.success("User deleted successfully");
      setDeleteUserDialogOpen(false);
      navigate("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete user",
      );
    }
  };

  const handleDeleteSession = async () => {
    const { sessionId, sessionTitle } = deleteSessionDialog;

    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_SESSION(sessionId));
      toast.success("Session deleted successfully");
      setDeleteSessionDialog({
        open: false,
        sessionId: null,
        sessionTitle: "",
      });

      // Refresh user details to update the session list
      fetchUserDetails();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete session",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            Loading user details...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-6">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/users")}
          className="h-9 sm:h-10 text-xs sm:text-sm"
        >
          <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="truncate">Back to Users</span>
        </Button>
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm sm:text-base">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
      {/* ✅ Delete User Dialog */}
      <AlertDialog
        open={deleteUserDialogOpen}
        onOpenChange={setDeleteUserDialogOpen}
      >
        <AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg rounded-lg">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
              <AlertDialogTitle className="text-base sm:text-xl">
                Delete User
              </AlertDialogTitle>
            </div>

            {/* ✅ FIX */}
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-left">
                {/* User info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {user.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <p className="text-sm sm:text-base font-medium text-red-600">
                  This action cannot be undone. This will permanently delete:
                </p>

                {/* ✅ LEFT-ALIGNED BULLETS */}
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>User account and profile</li>
                  <li>All interview sessions ({stats?.totalSessions || 0})</li>
                  <li>All questions ({stats?.totalQuestions || 0})</li>
                  <li>All study materials ({stats?.totalMaterials || 0})</li>
                  <li>All quizzes ({quizStats?.totalQuizzes || 0})</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="h-9 sm:h-10 text-sm">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteUser}
              className="h-9 sm:h-10 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Delete Session Dialog */}
      <AlertDialog
        open={deleteSessionDialog.open}
        onOpenChange={(open) => {
          if (!open)
            setDeleteSessionDialog({
              open: false,
              sessionId: null,
              sessionTitle: "",
            });
        }}
      >
        <AlertDialogContent className="w-[95vw] max-w-md sm:max-w-lg rounded-lg">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0" />
              <AlertDialogTitle className="text-base sm:text-xl">
                Delete Session
              </AlertDialogTitle>
            </div>

            {/* ✅ FIX */}
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left">
                <p className="font-medium text-sm sm:text-base">
                  Are you sure you want to delete{" "}
                  <span className="text-blue-600 font-semibold">
                    “{deleteSessionDialog.sessionTitle}”
                  </span>{" "}
                  session?
                </p>

                <p className="text-xs sm:text-sm text-muted-foreground">
                  This will delete all questions, materials, and quizzes
                  associated with this session.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="h-9 sm:h-10 text-sm">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDeleteSession}
              className="h-9 sm:h-10 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="space-y-3">
        {/* HEADER */}
        <div className="grid grid-cols-3 items-center gap-2">
          {/* LEFT: Back */}
          <div className="flex justify-start">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/users")}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Back
            </Button>
          </div>

          {/* CENTER: Title */}
          <div className="text-center">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold truncate">
              User Details
            </h1>
            <p className="hidden sm:block text-gray-500 text-sm">
              View and manage user information
            </p>
          </div>

          {/* RIGHT: ACTIONS (DESKTOP ONLY) */}
          <div className="hidden sm:flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/users/${id}/edit`)}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Edit User
            </Button>

            <Button
              variant="destructive"
              onClick={() => setDeleteUserDialogOpen(true)}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Trash2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Delete User
            </Button>
          </div>
        </div>

        {/* ACTION BUTTONS (MOBILE ONLY – UNCHANGED) */}
        <div className="flex gap-2 sm:hidden">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            className="h-9 text-xs flex-1"
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit User
          </Button>

          <Button
            variant="destructive"
            onClick={() => setDeleteUserDialogOpen(true)}
            className="h-9 text-xs flex-1"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete User
          </Button>
        </div>
      </div>

      {/* User Info and Stats */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* User Info Card */}
        <Card className="lg:col-span-1 w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              User Information
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Basic user details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24">
                <AvatarImage
                  src={
                    user.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                  }
                />
                <AvatarFallback className="text-lg sm:text-xl">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center w-full">
                <h3 className="text-lg sm:text-xl font-semibold truncate">
                  {user.name}
                </h3>
                <div className="flex justify-center items-center mt-1">
                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500 shrink-0" />
                  <span className="text-gray-600 text-xs sm:text-sm truncate w-full text-center">
                    {user.email}
                  </span>
                </div>
                <div className="mt-2">
                  <Badge
                    className={`text-xs sm:text-sm ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "moderator"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <Shield className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">
                      {user.role?.toUpperCase() || "USER"}
                    </span>
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base truncate">
                    Joined
                  </span>
                  <div className="flex items-center">
                    <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="text-xs sm:text-sm truncate">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base truncate">
                    Last Active
                  </span>
                  <div className="flex items-center">
                    <Clock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="text-xs sm:text-sm truncate">
                      {user.updatedAt
                        ? format(new Date(user.updatedAt), "MMM dd, yyyy")
                        : "Never"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base truncate">
                    Status
                  </span>
                  <Badge
                    variant={user.isActive !== false ? "default" : "secondary"}
                    className="text-xs sm:text-sm"
                  >
                    <span className="truncate">
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card - UPDATED with quiz stats */}
        <Card className="lg:col-span-2 w-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              User Statistics
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Performance and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
              <Card className="h-full">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-center">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto text-blue-500" />
                    <div className="mt-2 text-lg sm:text-xl md:text-2xl font-bold">
                      {stats?.totalSessions || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Total Sessions
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-center">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto text-green-500" />
                    <div className="mt-2 text-lg sm:text-xl md:text-2xl font-bold">
                      {stats?.totalQuestions || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Total Questions
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="h-full">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-center">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto text-purple-500" />
                    <div className="mt-2 text-lg sm:text-xl md:text-2xl font-bold">
                      {stats?.totalMaterials || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Study Materials
                    </p>
                  </div>
                </CardContent>
              </Card>
              {/* ✅ New Quiz Stats Card */}
              <Card className="h-full">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="text-center">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 mx-auto text-red-500" />
                    <div className="mt-2 text-lg sm:text-xl md:text-2xl font-bold">
                      {quizStats?.totalQuizzes || 0}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Total Quizzes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 text-center">
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">
                  Avg Questions/Session
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">
                  {stats?.avgQuestionsPerSession || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-500">Last Login</p>
                <p className="text-base sm:text-lg md:text-xl font-medium truncate">
                  {stats?.lastLogin
                    ? format(new Date(stats.lastLogin), "MMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
              {/* ✅ New Quiz Average Score */}
              <div className="space-y-1 md:col-span-1">
                <p className="text-xs sm:text-sm text-gray-500">
                  Avg Quiz Score
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">
                  {quizStats?.avgQuizScore || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Quiz Statistics Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quiz Performance</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            User's quiz statistics and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-blue-100 mb-2">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-blue-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                {quizStats?.totalQuizzes || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Total Quizzes Taken
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-green-100 mb-2">
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-green-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                {quizStats?.avgQuizScore || 0}%
              </p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Average Score
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-purple-100 mb-2">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-purple-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                {quizStats?.totalQuestionsAttempted || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Questions Attempted
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-yellow-100 mb-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-yellow-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                {quizStats?.quizCompletionRate || 0}%
              </p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Completion Rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions - UPDATED with quiz data */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Sessions</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            User's recent interview sessions with quiz data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500 text-sm sm:text-base">
                No sessions found
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {sessions.slice(0, 5).map((session) => {
                const sessionQuizCount = getSessionQuizCount(session.id);
                const sessionAvgScore = getSessionAvgScore(session.id);

                return (
                  <Card key={session.id} className="w-full">
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm sm:text-base truncate">
                            {session.role} Interview
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            {format(
                              new Date(session.createdAt),
                              "MMM dd, yyyy",
                            )}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            {session.questionCount || 0} Q
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            {session.materialCount || 0} M
                          </Badge>
                          {/* ✅ Session Quiz Count Badge */}
                          <Badge
                            variant="outline"
                            className={`text-xs sm:text-sm ${
                              sessionQuizCount > 0
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            <Target className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                            {sessionQuizCount} Qz
                            {sessionAvgScore > 0 && ` (${sessionAvgScore}%)`}
                          </Badge>
                          <div className="flex items-center">
                            {/* ✅ Delete Session Button */}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteSessionDialog({
                                  open: true,
                                  sessionId: session.id,
                                  sessionTitle: session.role,
                                })
                              }
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;
