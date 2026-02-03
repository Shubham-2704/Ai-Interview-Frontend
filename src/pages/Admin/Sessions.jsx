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
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Brain,
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
  const [selectedSessionQuizzes, setSelectedSessionQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);

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

      // Format the data for the dialog
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
          accuracy: stats.avgQuizScore || 0, // Using avg score as accuracy for now
          quizCompletionRate: stats.quizCompletionRate || 0,
          performanceTrend:
            (stats.avgQuizScore || 0) >= 80 ? "improving" : "stable",
        },
        statusBreakdown: {
          completed: {
            count: stats.totalQuizzes || 0,
            avgScore: stats.avgQuizScore || 0,
          },
        },
        recentQuizzes: [], // We'll handle this separately
        sessionPerformance: [], // We'll handle this separately
        quizTypePerformance: [], // We'll handle this separately
        rawStats: stats, // Include raw stats for debugging
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

  const fetchSessionQuizzes = async (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setSelectedSessionQuizzes([]);
      return;
    }

    setQuizLoading(true);
    try {
      // Fetch session quizzes from API
      const response = await axiosInstance.get(
        `/admin/sessions/${sessionId}/quizzes`,
      );
      setSelectedSessionQuizzes(response.data.quizzes || []);
      setExpandedSession(sessionId);
    } catch (error) {
      console.error("Error fetching session quizzes:", error);

      // Mock data for demo
      const mockQuizzes = [
        {
          id: "quiz-1",
          title: "Technical Assessment",
          totalQuestions: 10,
          score: 8,
          percentage: 80,
          status: "completed",
          timeSpent: 25,
          createdAt: new Date().toISOString(),
        },
        {
          id: "quiz-2",
          title: "Concept Review",
          totalQuestions: 5,
          score: 4,
          percentage: 80,
          status: "completed",
          timeSpent: 15,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setSelectedSessionQuizzes(mockQuizzes);
      setExpandedSession(sessionId);
      toast.warning("Using sample quiz data");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setExpandedUser(null);
    setExpandedSession(null);
    setSelectedSessionQuizzes([]);

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
    if (expandedUser === user.id) {
      setExpandedUser(null);
      setUserSessions([]);
      setExpandedSession(null);
      setSelectedSessionQuizzes([]);
    } else {
      setExpandedUser(user.id);
      await fetchUserDetails(user.id);
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

  // Function to get performance trend icon
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions Management</h1>
          <p className="text-gray-500">
            View and manage user sessions, questions, quizzes, and resources
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
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
                className="pl-8"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end gap-2 col-span-2">
              <Button onClick={handleApplyFilters} variant="outline" size="sm">
                Apply Filters
              </Button>
              <Badge variant="outline">{users.length} users</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Stats Summary (when expanded) */}
      {expandedUser && selectedUser && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    selectedUser.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`
                  }
                />
                <AvatarFallback>
                  {selectedUser.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {selectedUser.name} - Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {userStats.totalSessions}
                </div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {userStats.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {userStats.totalResources}
                </div>
                <div className="text-sm text-gray-600">Resources</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {userStats.totalQuizzes}
                </div>
                <div className="text-sm text-gray-600">Quizzes</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">
                  {userStats.avgQuizScore}%
                </div>
                <div className="text-sm text-gray-600">Avg Quiz Score</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-700">
                  {userStats.quizCompletionRate}%
                </div>
                <div className="text-sm text-gray-600">Quiz Completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Select a user to view their session history, questions, and quizzes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Quizzes</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                      <p className="mt-2 text-gray-500">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-gray-500">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <React.Fragment key={user.id}>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage
                                src={
                                  user.profileImageUrl ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                                }
                              />
                              <AvatarFallback>
                                {user.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role || "user"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.sessionCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.questionCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.materialCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            <Trophy className="h-3 w-3 mr-1" />
                            {user.quizCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-gray-500" />
                            {user.createdAt
                              ? format(new Date(user.createdAt), "MMM dd, yyyy")
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleUserExpand(user)}
                              title={
                                expandedUser === user.id
                                  ? "Hide Details"
                                  : "View Details"
                              }
                            >
                              {expandedUser === user.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Session List for this User */}
                      {expandedUser === user.id && (
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={8} className="p-0">
                            <div className="p-4 border-t">
                              {userLoading ? (
                                <div className="text-center py-4">
                                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                                  <p className="mt-2 text-sm text-gray-500">
                                    Loading sessions...
                                  </p>
                                </div>
                              ) : userSessions.length === 0 ? (
                                <div className="text-center py-4">
                                  <p className="text-gray-500">
                                    No sessions found for this user
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                      {selectedUser?.name}'s Session History
                                    </h3>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-50"
                                      >
                                        {userSessions.length} sessions
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => fetchQuizStats(user.id)}
                                        className="h-8"
                                        disabled={quizStatsLoading}
                                      >
                                        {quizStatsLoading ? (
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                          <BarChart className="h-4 w-4 mr-2" />
                                        )}
                                        Quiz Analytics
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="grid gap-4">
                                    {userSessions.map((session) => {
                                      const topics = parseTopics(
                                        session.topicsToFocus,
                                      );
                                      const hasQuizzes = session.quizCount > 0;
                                      const sessionId = session.id;

                                      return (
                                        <Card
                                          key={sessionId}
                                          id={`session-${sessionId}`}
                                          className="border"
                                        >
                                          <CardContent className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">
                                                  Role
                                                </p>
                                                <p className="font-semibold">
                                                  {session.role ||
                                                    "Not specified"}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">
                                                  Experience
                                                </p>
                                                <Badge variant="outline">
                                                  {session.experience || "N/A"}
                                                </Badge>
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">
                                                  Performance Metrics
                                                </p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                  <Badge
                                                    variant="outline"
                                                    className="bg-blue-50"
                                                  >
                                                    <MessageSquare className="h-3 w-3 mr-1" />
                                                    {session.questionCount || 0}
                                                  </Badge>
                                                  {session.materialCount >
                                                    0 && (
                                                    <Badge
                                                      variant="outline"
                                                      className="bg-purple-50"
                                                    >
                                                      <BookOpen className="h-3 w-3 mr-1" />
                                                      {session.materialCount}
                                                    </Badge>
                                                  )}
                                                  {hasQuizzes && (
                                                    <Badge
                                                      variant="outline"
                                                      className="bg-amber-50"
                                                    >
                                                      <Trophy className="h-3 w-3 mr-1" />
                                                      {session.quizCount}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">
                                                  Quiz Score
                                                </p>
                                                <div className="flex items-center">
                                                  <Target className="h-4 w-4 mr-1 text-amber-600" />
                                                  <span
                                                    className={`font-semibold ${session.avgQuizScore >= 70 ? "text-green-600" : session.avgQuizScore >= 50 ? "text-amber-600" : "text-red-600"}`}
                                                  >
                                                    {session.avgQuizScore || 0}%
                                                  </span>
                                                </div>
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">
                                                  Created
                                                </p>
                                                <p className="text-sm">
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
                                              <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-500">
                                                  Description
                                                </p>
                                                <p className="text-sm text-gray-700 mt-1">
                                                  {session.description}
                                                </p>
                                              </div>
                                            )}

                                            {topics.length > 0 && (
                                              <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-500">
                                                  Topics Focus
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                  {topics.map(
                                                    (topic, index) => (
                                                      <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="bg-blue-50 text-blue-700 border-blue-200"
                                                      >
                                                        {topic}
                                                      </Badge>
                                                    ),
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            <div className="flex justify-between items-center mt-4">
                                              <div className="flex items-center space-x-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    navigate(
                                                      `/admin/sessions/${sessionId}/questions`,
                                                    )
                                                  }
                                                  className="h-8 px-3"
                                                  disabled={
                                                    session.questionCount === 0
                                                  }
                                                >
                                                  <MessageSquare className="mr-2 h-3 w-3" />
                                                  Questions (
                                                  {session.questionCount || 0})
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    navigate(
                                                      `/admin/sessions/${sessionId}/resources`,
                                                    )
                                                  }
                                                  className="h-8 px-3"
                                                  disabled={
                                                    session.materialCount === 0
                                                  }
                                                >
                                                  <BookOpen className="mr-2 h-3 w-3" />
                                                  Resources (
                                                  {session.materialCount || 0})
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
                                                    className="h-8 px-3 bg-amber-50 border-amber-200 hover:bg-amber-100"
                                                  >
                                                    <Trophy className="mr-2 h-3 w-3" />
                                                    Quizzes ({session.quizCount}
                                                    )
                                                  </Button>
                                                )}
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

                                            {/* Session Quizzes Details */}
                                            {expandedSession === sessionId && (
                                              <div className="mt-4 pt-4 border-t">
                                                <h4 className="text-sm font-semibold mb-3 flex items-center">
                                                  <Trophy className="h-4 w-4 mr-2 text-amber-600" />
                                                  Quiz Attempts (
                                                  {
                                                    selectedSessionQuizzes.length
                                                  }
                                                  )
                                                </h4>

                                                {quizLoading ? (
                                                  <div className="text-center py-3">
                                                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-amber-500" />
                                                    <p className="mt-1 text-sm text-gray-500">
                                                      Loading quizzes...
                                                    </p>
                                                  </div>
                                                ) : selectedSessionQuizzes.length ===
                                                  0 ? (
                                                  <p className="text-sm text-gray-500 text-center py-3">
                                                    No quiz attempts found for
                                                    this session
                                                  </p>
                                                ) : (
                                                  <div className="space-y-3">
                                                    {selectedSessionQuizzes.map(
                                                      (quiz) => (
                                                        <div
                                                          key={quiz.id}
                                                          className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                                                        >
                                                          <div>
                                                            <div className="font-medium text-sm">
                                                              {quiz.title}
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                              {
                                                                quiz.totalQuestions
                                                              }{" "}
                                                              questions •{" "}
                                                              {quiz.timeSpent}{" "}
                                                              mins
                                                            </div>
                                                          </div>
                                                          <div className="text-right">
                                                            <div
                                                              className={`font-bold ${quiz.percentage >= 70 ? "text-green-600" : quiz.percentage >= 50 ? "text-amber-600" : "text-red-600"}`}
                                                            >
                                                              {quiz.percentage}%
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                              Score:{" "}
                                                              {quiz.score}/
                                                              {
                                                                quiz.totalQuestions
                                                              }
                                                            </div>
                                                          </div>
                                                        </div>
                                                      ),
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )}
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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
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
                >
                  Previous
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
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            Showing {users.length} users
          </div>
        </CardFooter>
      </Card>

      {/* Quiz Statistics Dialog */}
      <Dialog open={quizStatsDialogOpen} onOpenChange={setQuizStatsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {quizStatsLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-2 text-gray-500">Loading quiz statistics...</p>
            </div>
          ) : quizStats ? (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={
                        quizStats.userInfo?.profileImageUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${quizStats.userInfo?.id}`
                      }
                    />
                    <AvatarFallback>
                      {quizStats.userInfo?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">
                      {quizStats.userInfo?.name}'s Quiz Performance
                    </DialogTitle>
                    <DialogDescription>
                      {quizStats.userInfo?.email}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {quizStats.overview?.totalQuizzes || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Quizzes</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {quizStats.overview?.avgQuizScore || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-amber-600">
                      {quizStats.overview?.accuracy || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {quizStats.overview?.quizCompletionRate || 0}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Completion Rate
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-semibold text-blue-700">
                          Total Questions Attempted
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {quizStats.rawStats?.totalQuestionsAttempted || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-semibold text-green-700">
                          Quiz Completion Rate
                        </div>
                        <div className="text-2xl font-bold mt-1">
                          {quizStats.overview?.quizCompletionRate || 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sessions;
