import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Download,
  Calendar,
  MessageSquare,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trophy,
  BarChart,
  Target,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

const Sessions = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [userStats, setUserStats] = useState({
    totalSessions: 0,
    totalQuestions: 0,
    totalResources: 0,
    totalQuizzes: 0,
    avgQuizScore: 0,
    quizCompletionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  // Quiz Statistics States
  const [quizStatsDialogOpen, setQuizStatsDialogOpen] = useState(false);
  const [quizStats, setQuizStats] = useState(null);
  const [quizStatsLoading, setQuizStatsLoading] = useState(false);

  // State for mobile view
  const [mobileExpandedUser, setMobileExpandedUser] = useState(null);
  const [showMobileSessions, setShowMobileSessions] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USERS_LIST(
          pagination.page,
          pagination.limit,
          searchTerm,
          roleFilter,
          "all",
        ),
      );
      const data = response.data;
      setUsers(data.users || []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 20,
          total: data.users?.length || 0,
          pages: 1,
        },
      );
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Error fetching users:", error);

      // Mock data for testing
      const mockUsers = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: "user",
        sessionCount: Math.floor(Math.random() * 20) + 1,
        questionCount: Math.floor(Math.random() * 100) + 10,
        materialCount: Math.floor(Math.random() * 50) + 5,
        quizCount: Math.floor(Math.random() * 15) + 1,
        createdAt: new Date(
          Date.now() - Math.random() * 2592000000,
        ).toISOString(),
      }));
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setUserLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USER_DETAILS(userId),
      );
      const data = response.data;

      setSelectedUser(data.user);
      setUserSessions(data.sessions || []);

      // Set user stats including quiz data
      setUserStats({
        totalSessions: data.stats?.totalSessions || 0,
        totalQuestions: data.stats?.totalQuestions || 0,
        totalResources: data.stats?.totalMaterials || 0,
        totalQuizzes: data.stats?.totalQuizzes || 0,
        avgQuizScore: data.stats?.avgQuizScore || 0,
        quizCompletionRate: data.stats?.quizCompletionRate || 0,
      });
    } catch (error) {
      toast.error("Failed to load user details");
      console.error("Error fetching user details:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchQuizStats = async (userId) => {
    setQuizStatsLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USER_QUIZ_STATS(userId),
      );

      const stats = response.data;

      // Get user info
      const userResponse = await axiosInstance.get(
        API_PATHS.ADMIN.USER_DETAILS(userId),
      );
      const userInfo = userResponse.data.user;

      // Format quiz stats for the dialog
      const formattedStats = {
        userInfo: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          profileImageUrl: userInfo.profileImageUrl,
        },
        overview: {
          totalQuizzes: stats.totalQuizzes || 0,
          avgQuizScore: stats.avgQuizScore || 0,
          accuracy: stats.avgQuizScore || 0,
          quizCompletionRate: stats.quizCompletionRate || 0,
        },
        rawStats: stats,
      };

      setQuizStats(formattedStats);
      setQuizStatsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching quiz analytics:", error);
      toast.error("Failed to load quiz analytics");
    } finally {
      setQuizStatsLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setExpandedUser(null);
    setMobileExpandedUser(null);
    setShowMobileSessions(false);

    if (userId && userId !== "all") {
      fetchUserDetails(userId);
      setSelectedUser(null);
    } else {
      setSelectedUser(null);
      setUserSessions([]);
      setUserStats({
        totalSessions: 0,
        totalQuestions: 0,
        totalResources: 0,
        totalQuizzes: 0,
        avgQuizScore: 0,
        quizCompletionRate: 0,
      });
    }
  };

  const toggleUserExpand = async (user) => {
    if (window.innerWidth < 768) {
      // Mobile behavior
      if (mobileExpandedUser === user.id) {
        setMobileExpandedUser(null);
        setShowMobileSessions(false);
      } else {
        setMobileExpandedUser(user.id);
        await fetchUserDetails(user.id);
        setShowMobileSessions(true);
      }
    } else {
      // Desktop behavior
      if (expandedUser === user.id) {
        setExpandedUser(null);
        setUserSessions([]);
      } else {
        setExpandedUser(user.id);
        await fetchUserDetails(user.id);
      }
    }
  };

  const handleApplyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  // Helper function to parse comma-separated topics into array
  const parseTopics = (topics) => {
    if (!topics) return [];

    if (Array.isArray(topics)) {
      return topics;
    }

    if (typeof topics === "string") {
      try {
        const parsed = JSON.parse(topics);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        return topics
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
      }
    }

    return String(topics)
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  };

  // User Stats Card Component
  const UserStatsCard = ({ user }) => (
    <Card className="w-full mb-4">
      <CardContent>
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                user.profileImageUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
              }
            />
            <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold w-60 runcate">{user.name}</h3>
            <p className="text-sm text-gray-500 w-60 truncate">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-700">
              {user.sessionCount || 0}
            </div>
            <div className="text-xs text-gray-600">Sessions</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-bold text-green-700">
              {user.questionCount || 0}
            </div>
            <div className="text-xs text-gray-600">Questions</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-bold text-purple-700">
              {user.materialCount || 0}
            </div>
            <div className="text-xs text-gray-600">Resources</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded">
            <div className="font-bold text-amber-700">
              {user.quizCount || 0}
            </div>
            <div className="text-xs text-gray-600">Quizzes</div>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => toggleUserExpand(user)}
        >
          {mobileExpandedUser === user.id ? "Hide Sessions" : "View Sessions"}
        </Button>
      </CardContent>
    </Card>
  );

  // Mobile Sessions View Component
  const MobileSessionsView = () => (
    <div className="md:hidden fixed inset-0 bg-white bottom-10 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              (setShowMobileSessions(false), setMobileExpandedUser(null));
            }}
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-lg font-semibold">
            {selectedUser?.name}'s Sessions
          </h2>
          <div className="w-9"></div> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="p-4">
        {userLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-sm text-gray-500">Loading sessions...</p>
          </div>
        ) : userSessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No sessions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userSessions.map((session) => {
              const topics = parseTopics(session.topicsToFocus);
              const hasQuizzes = session.quizCount > 0;
              const sessionId = session.id;

              return (
                <Card key={sessionId} className="border">
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Role
                        </p>
                        <p className="font-semibold">
                          {session.role || "Not specified"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {session.questionCount || 0} Q
                        </Badge>
                        {session.materialCount > 0 && (
                          <Badge variant="outline" className="bg-purple-50">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {session.materialCount} R
                          </Badge>
                        )}
                        {hasQuizzes && (
                          <Badge variant="outline" className="bg-amber-50">
                            <Trophy className="h-3 w-3 mr-1" />
                            {session.quizCount} Qz
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {session.experience || "N/A"} Year Exp
                        </Badge>
                      </div>

                      {session.description && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Description
                          </p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {session.description}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-sm">
                            {session.createdAt
                              ? format(
                                  new Date(session.createdAt),
                                  "MMM dd, yyyy",
                                )
                              : "N/A"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            session.status === "completed"
                              ? "default"
                              : "outline"
                          }
                        >
                          {session.status || "active"}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/sessions/${sessionId}/questions`)
                          }
                          className="flex-1"
                          disabled={session.questionCount === 0}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Question
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/sessions/${sessionId}/resources`)
                          }
                          className="flex-1"
                          disabled={session.materialCount === 0}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Resource
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/admin/sessions/${sessionId}/quiz-history`,
                            )
                          }
                          className="flex-1"
                          disabled={!hasQuizzes}
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Quiz
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
      {/* Mobile Sessions Overlay */}
      {showMobileSessions && <MobileSessionsView />}

      {/* Quiz Statistics Dialog */}
      <Dialog open={quizStatsDialogOpen} onOpenChange={setQuizStatsDialogOpen}>
        <DialogContent className="w-[95%] sm:w-full max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          {quizStatsLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500 text-sm sm:text-base">
                Loading quiz statistics...
              </p>
            </div>
          ) : quizStats ? (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage
                      src={
                        quizStats.userInfo?.profileImageUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${quizStats.userInfo?.id}`
                      }
                    />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {quizStats.userInfo?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <DialogTitle className="text-lg sm:text-xl truncate">
                      {quizStats.userInfo?.name}'s Quiz Performance
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm truncate">
                      {quizStats.userInfo?.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                      {quizStats.overview?.totalQuizzes || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Total Quizzes
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                      {quizStats.overview?.avgQuizScore || 0}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Average Score
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-amber-600">
                      {quizStats.overview?.accuracy || 0}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Accuracy
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
                          {quizStats.overview?.quizCompletionRate || 0}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          Completion Rate
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
            Sessions Management
          </h1>
          <p className="text-gray-500 text-sm sm:text-base truncate">
            View and manage user sessions, questions, quizzes, and resources
          </p>
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          <Button variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm">
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">Export</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="w-full">
        <CardContent>
          {/* ================= MOBILE ONLY ================= */}
          <div className="space-y-3 sm:hidden">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
                className="pl-8 h-10 text-sm"
              />
            </div>

            {/* Filters row */}
            <div className="flex items-center justify-between gap-2">
              {/* All Roles - smaller width */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Apply */}
              <Button
                onClick={handleApplyFilters}
                variant="outline"
                size="sm"
                className="h-9 whitespace-nowrap"
              >
                Apply Filter
              </Button>

              {/* Users count */}
              <Badge
                variant="outline"
                className="h-9 flex items-center whitespace-nowrap"
              >
                {users.length} users
              </Badge>
            </div>
          </div>

          {/* ================= DESKTOP (UNCHANGED) ================= */}
          <div className="hidden sm:grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
                className="pl-8 h-9 sm:h-10 text-sm"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 sm:h-10">
                <Filter className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end gap-2 col-span-1 sm:col-span-2">
              <Button
                onClick={handleApplyFilters}
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 text-xs sm:text-sm"
              >
                Apply Filters
              </Button>
              <Badge variant="outline" className="text-xs sm:text-sm">
                {users.length} users
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Users List (Cards) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <p className="mt-2 text-gray-500 text-sm">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          users.map((user) => <UserStatsCard key={user.id} user={user} />)
        )}
      </div>

      {/* Desktop Users Table */}
      <Card className="hidden md:block w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Users</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Select a user to view their session history, questions, and quizzes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[800px] sm:min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">User</TableHead>
                    <TableHead className="text-xs sm:text-sm">Role</TableHead>
                    <TableHead className="text-xs sm:text-sm">
                      Sessions
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm">
                      Questions
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm">
                      Resources
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm">
                      Quizzes
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm">Joined</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                        <p className="mt-2 text-gray-500 text-sm">
                          Loading users...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-gray-500 text-sm">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <React.Fragment key={user.id}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                                <AvatarImage
                                  src={
                                    user.profileImageUrl ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                                  }
                                />
                                <AvatarFallback className="text-xs">
                                  {user.name?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium text-xs sm:text-sm truncate">
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate hidden sm:block">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              <span className="truncate">
                                {user.role || "user"}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              {user.sessionCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              {user.questionCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              {user.materialCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-700 border-amber-200 text-xs sm:text-sm"
                            >
                              <Trophy className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                              {user.quizCount || 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3 w-3 text-gray-500 shrink-0" />
                              <span className="text-xs sm:text-sm truncate">
                                {user.createdAt
                                  ? format(
                                      new Date(user.createdAt),
                                      "MMM dd, yyyy",
                                    )
                                  : "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleUserExpand(user)}
                                title={
                                  expandedUser === user.id
                                    ? "Hide Details"
                                    : "View Details"
                                }
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                {expandedUser === user.id ? (
                                  <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Session List for this User (Desktop only) */}
                        {expandedUser === user.id && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={8} className="p-0">
                              <div className="p-3 sm:p-4 border-t">
                                {userLoading ? (
                                  <div className="text-center py-3 sm:py-4">
                                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mx-auto text-blue-500" />
                                    <p className="mt-2 text-xs sm:text-sm text-gray-500">
                                      Loading sessions...
                                    </p>
                                  </div>
                                ) : userSessions.length === 0 ? (
                                  <div className="text-center py-3 sm:py-4">
                                    <p className="text-gray-500 text-sm">
                                      No sessions found for this user
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-3 sm:space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                      <h3 className="text-base sm:text-lg font-semibold truncate">
                                        {selectedUser?.name}'s Session History
                                      </h3>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className="bg-blue-50 text-xs sm:text-sm"
                                        >
                                          {userSessions.length} sessions
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            fetchQuizStats(user.id)
                                          }
                                          className="h-7 sm:h-8 text-xs sm:text-sm"
                                          disabled={quizStatsLoading}
                                        >
                                          {quizStatsLoading ? (
                                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                                          ) : (
                                            <BarChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                          )}
                                          <span className="truncate">
                                            Quiz Analytics
                                          </span>
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="grid gap-3 sm:gap-4">
                                      {userSessions.map((session) => {
                                        const topics = parseTopics(
                                          session.topicsToFocus,
                                        );
                                        const hasQuizzes =
                                          session.quizCount > 0;
                                        const sessionId = session.id;

                                        return (
                                          <Card
                                            key={sessionId}
                                            id={`session-${sessionId}`}
                                            className="border w-full"
                                          >
                                            <CardContent>
                                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
                                                <div>
                                                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Role
                                                  </p>
                                                  <p className="font-semibold text-xs sm:text-sm truncate">
                                                    {session.role ||
                                                      "Not specified"}
                                                  </p>
                                                </div>
                                                <div>
                                                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Experience
                                                  </p>
                                                  <Badge
                                                    variant="outline"
                                                    className="text-xs sm:text-sm"
                                                  >
                                                    <span className="truncate">
                                                      {session.experience ||
                                                        "N/A"}
                                                    </span>
                                                  </Badge>
                                                </div>
                                                <div className="sm:col-span-1 lg:col-span-1">
                                                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Performance Metrics
                                                  </p>
                                                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                                                    <Badge
                                                      variant="outline"
                                                      className="bg-blue-50 text-xs sm:text-sm"
                                                    >
                                                      <MessageSquare className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                                      {session.questionCount ||
                                                        0}
                                                    </Badge>
                                                    {session.materialCount >
                                                      0 && (
                                                      <Badge
                                                        variant="outline"
                                                        className="bg-purple-50 text-xs sm:text-sm"
                                                      >
                                                        <BookOpen className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                                        {session.materialCount}
                                                      </Badge>
                                                    )}
                                                    {hasQuizzes && (
                                                      <Badge
                                                        variant="outline"
                                                        className="bg-amber-50 text-xs sm:text-sm"
                                                      >
                                                        <Trophy className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                                                        {session.quizCount}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                </div>
                                                <div>
                                                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Quiz Score
                                                  </p>
                                                  <div className="flex items-center">
                                                    <Target className="h-3 w-3 mr-1 text-amber-600" />
                                                    <span
                                                      className={`font-semibold text-xs sm:text-sm ${session.avgQuizScore >= 70 ? "text-green-600" : session.avgQuizScore >= 50 ? "text-amber-600" : "text-red-600"}`}
                                                    >
                                                      {session.avgQuizScore ||
                                                        0}
                                                      %
                                                    </span>
                                                  </div>
                                                </div>
                                                <div>
                                                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Created
                                                  </p>
                                                  <p className="text-xs sm:text-sm truncate">
                                                    {session.createdAt
                                                      ? format(
                                                          new Date(
                                                            session.createdAt,
                                                          ),
                                                          "MMM dd, yyyy",
                                                        )
                                                      : "N/A"}
                                                  </p>
                                                </div>
                                              </div>

                                              {session.description && (
                                                <div className="mt-2 sm:mt-3">
                                                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Description
                                                  </p>
                                                  <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-2">
                                                    {session.description}
                                                  </p>
                                                </div>
                                              )}

                                              {topics.length > 0 && (
                                                <div className="mt-2 sm:mt-3">
                                                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Topics Focus
                                                  </p>
                                                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                                                    {topics.map(
                                                      (topic, index) => (
                                                        <Badge
                                                          key={index}
                                                          variant="outline"
                                                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm"
                                                        >
                                                          <span className="truncate max-w-[100px]">
                                                            {topic}
                                                          </span>
                                                        </Badge>
                                                      ),
                                                    )}
                                                  </div>
                                                </div>
                                              )}

                                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
                                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                      navigate(
                                                        `/admin/sessions/${sessionId}/questions`,
                                                      )
                                                    }
                                                    className="h-7 sm:h-8 px-2 text-xs sm:text-sm"
                                                    disabled={
                                                      session.questionCount ===
                                                      0
                                                    }
                                                  >
                                                    <MessageSquare className="mr-1 h-3 w-3" />
                                                    <span>
                                                      Q (
                                                      {session.questionCount ||
                                                        0}
                                                      )
                                                    </span>
                                                  </Button>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                      navigate(
                                                        `/admin/sessions/${sessionId}/resources`,
                                                      )
                                                    }
                                                    className="h-7 sm:h-8 px-2 text-xs sm:text-sm"
                                                    disabled={
                                                      session.materialCount ===
                                                      0
                                                    }
                                                  >
                                                    <BookOpen className="mr-1 h-3 w-3" />
                                                    <span>
                                                      R (
                                                      {session.materialCount ||
                                                        0}
                                                      )
                                                    </span>
                                                  </Button>

                                                  {hasQuizzes && (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() =>
                                                        navigate(
                                                          `/admin/sessions/${sessionId}/quiz-history`,
                                                        )
                                                      }
                                                      className="h-7 sm:h-8 px-2 text-xs sm:text-sm bg-amber-50 border-amber-200 hover:bg-amber-100"
                                                    >
                                                      <Trophy className="mr-1 h-3 w-3" />
                                                      <span>
                                                        Qz ({session.quizCount})
                                                      </span>
                                                    </Button>
                                                  )}
                                                </div>

                                                <Badge
                                                  variant={
                                                    session.status ===
                                                    "completed"
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  className="text-xs sm:text-sm mt-2 sm:mt-0"
                                                >
                                                  <span className="truncate">
                                                    {session.status || "active"}
                                                  </span>
                                                </Badge>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (pagination.page > 1) {
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }));
                    }
                  }}
                  disabled={pagination.page === 1}
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (pagination.page < pagination.pages) {
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }));
                    }
                  }}
                  disabled={pagination.page === pagination.pages}
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          <div className="text-xs sm:text-sm text-gray-500">
            Showing {users.length} users
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Sessions;