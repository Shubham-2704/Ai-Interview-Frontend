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
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USER_DETAILS(id)
      );

      const data = response.data;

      setUser(data.user);
      setStats(data.stats);
      setSessions(data.sessions || []);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to fetch user details"
      );
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
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
          "Failed to delete user"
      );
    }
  };

  const handleDeleteSession = async () => {
    const { sessionId, sessionTitle } = deleteSessionDialog;
    
    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_SESSION(sessionId));
      toast.success("Session deleted successfully");
      setDeleteSessionDialog({ open: false, sessionId: null, sessionTitle: "" });
      
      // Refresh user details to update the session list
      fetchUserDetails();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete session"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="mt-6 text-center">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* ✅ Delete User Dialog */}
      <AlertDialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <AlertDialogTitle>Delete User</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <p className="mt-4 text-red-600 font-medium">
                This action cannot be undone. This will permanently delete:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600">
                <li>User account and profile</li>
                <li>All interview sessions ({stats?.totalSessions || 0})</li>
                <li>All questions ({stats?.totalQuestions || 0})</li>
                <li>All study materials ({stats?.totalMaterials || 0})</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ Delete Session Dialog */}
      <AlertDialog open={deleteSessionDialog.open} onOpenChange={(open) => {
        if (!open) setDeleteSessionDialog({ open: false, sessionId: null, sessionTitle: "" });
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <AlertDialogTitle>Delete Session</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-4">
              <p className="font-medium text-gray-800">
                Are you sure you want to delete <span className="text-blue-600">"{deleteSessionDialog.sessionTitle}"</span> session?
              </p>
              <p className="mt-2 text-sm text-gray-600">
                This will delete all questions and materials associated with this session.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Details</h1>
            <p className="text-gray-500">View and manage user information</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/users/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
          
          {/* ✅ Updated Delete Button - NO AlertDialogTrigger needed */}
          <Button 
            variant="destructive"
            onClick={() => setDeleteUserDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </Button>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    user.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                  }
                />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <div className="flex items-center justify-center mt-1">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                <div className="mt-2">
                  <Badge
                    className={
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "moderator"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role?.toUpperCase() || "USER"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="w-full space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Joined</span>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Active</span>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {user.updatedAt
                        ? format(new Date(user.updatedAt), "MMM dd, yyyy")
                        : "Never"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant={user.isActive !== false ? "default" : "secondary"}
                  >
                    {user.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>
              Performance and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto text-blue-500" />
                    <div className="mt-2 text-2xl font-bold">
                      {stats?.totalSessions || 0}
                    </div>
                    <p className="text-sm text-gray-500">Total Sessions</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 mx-auto text-green-500" />
                    <div className="mt-2 text-2xl font-bold">
                      {stats?.totalQuestions || 0}
                    </div>
                    <p className="text-sm text-gray-500">Total Questions</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 mx-auto text-purple-500" />
                    <div className="mt-2 text-2xl font-bold">
                      {stats?.totalMaterials || 0}
                    </div>
                    <p className="text-sm text-gray-500">
                      Total Study Materials
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {stats?.completionRate || 0}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Avg Questions/Session</p>
                <p className="text-2xl font-bold">
                  {stats?.avgQuestionsPerSession || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Last Login</p>
                <p className="text-lg font-medium">
                  {stats?.lastLogin
                    ? format(new Date(stats.lastLogin), "MMM dd, yyyy")
                    : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>User's recent interview sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                <Card key={session.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {session.role} Interview
                        </h4>
                        <p className="text-sm text-gray-500">
                          {format(new Date(session.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {session.questionCount || 0} Questions
                        </Badge>
                        <Badge variant="outline">
                          {session.materialCount || 0} Materials
                        </Badge>
                        <div className="flex items-center space-x-2">
                          {/* ✅ Updated Delete Session Button */}
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetails;