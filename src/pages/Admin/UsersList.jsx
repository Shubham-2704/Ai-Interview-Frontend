import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    roleDistribution: { user: 0, admin: 0 },
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisWeek: 0,
    avgSessionsPerUser: 0,
    avgQuestionsPerUser: 0,
    avgMaterialsPerUser: 0,
    avgQuizzesPerUser: 0, // NEW
  });
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchUserStats();
    fetchUsers();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.ADMIN.USER_STATS);
      // Direct access to response data
      const data = response.data;
      setStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load user statistics",
      );
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USERS_LIST(
          pagination.page,
          pagination.limit,
          searchTerm,
          roleFilter,
          statusFilter,
        ),
      );

      // Direct access to response data
      const result = response.data;

      // Fetch quiz data for each user
      const usersWithQuizData = await Promise.all(
        (result.users || []).map(async (user) => {
          try {
            const quizResponse = await axiosInstance.get(
              API_PATHS.ADMIN.USER_QUIZ_STATS(user.id),
            );
            return {
              ...user,
              quizCount: quizResponse.data?.totalQuizzes || 0,
              avgQuizScore: quizResponse.data?.avgQuizScore || 0,
            };
          } catch (quizError) {
            console.error(
              `Error fetching quiz data for user ${user.id}:`,
              quizError,
            );
            return {
              ...user,
              quizCount: 0,
              avgQuizScore: 0,
            };
          }
        }),
      );

      setUsers(usersWithQuizData || []);
      setPagination(
        result.pagination || {
          page: 1,
          limit: 10,
          total: result.users?.length || 0,
          pages: 1,
        },
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load users",
      );

      // Fallback to mock data for development
      if (import.meta.env.DEV) {
        const mockUsers = Array.from({ length: 20 }, (_, i) => ({
          id: `user-${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: i % 3 === 0 ? "admin" : "user",
          sessions: Math.floor(Math.random() * 100),
          questions: Math.floor(Math.random() * 500),
          materials: Math.floor(Math.random() * 200),
          quizCount: Math.floor(Math.random() * 50), // NEW
          avgQuizScore: Math.floor(Math.random() * 100), // NEW
          isActive: i % 5 !== 0,
          createdAt: new Date(
            Date.now() - Math.random() * 31536000000,
          ).toISOString(),
          lastLogin: new Date(
            Date.now() - Math.random() * 86400000,
          ).toISOString(),
        }));
        setUsers(mockUsers);
        setPagination({
          page: 1,
          limit: 10,
          total: mockUsers.length,
          pages: Math.ceil(mockUsers.length / 10),
        });
      }
    } finally {
      setUsersLoading(false);
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      await axiosInstance.delete(API_PATHS.ADMIN.DELETE_USER(userId));
      toast.success("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete user",
      );
    }
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USERS_LIST(1, 1000), // Get all users for export
        {
          responseType: "blob", // Important for file download
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Users exported successfully");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users");
    }
  };

  const RoleBadge = ({ role }) => {
    const roleConfig = {
      admin: {
        label: "Admin",
        className: "bg-red-100 text-red-800 text-xs sm:text-sm",
      },
      user: {
        label: "User",
        className: "bg-blue-100 text-blue-800 text-xs sm:text-sm",
      },
    };
    const config = roleConfig[role] || roleConfig.user;

    return (
      <Badge className={config.className}>
        <Shield className="mr-1 h-3 w-3" />
        <span className="truncate">{config.label}</span>
      </Badge>
    );
  };

  const StatusBadge = ({ isActive }) => (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className="text-xs sm:text-sm"
    >
      {isActive ? (
        <>
          <CheckCircle className="mr-1 h-3 w-3" />
          <span className="truncate">Active</span>
        </>
      ) : (
        <>
          <XCircle className="mr-1 h-3 w-3" />
          <span className="truncate">Inactive</span>
        </>
      )}
    </Badge>
  );

  const QuizScoreBadge = ({ score }) => {
    let className = "bg-gray-100 text-gray-800 text-xs sm:text-sm";
    if (score >= 90)
      className = "bg-green-100 text-green-800 text-xs sm:text-sm";
    else if (score >= 80)
      className = "bg-blue-100 text-blue-800 text-xs sm:text-sm";
    else if (score >= 70)
      className = "bg-yellow-100 text-yellow-800 text-xs sm:text-sm";
    else if (score >= 60)
      className = "bg-orange-100 text-orange-800 text-xs sm:text-sm";
    else if (score > 0)
      className = "bg-red-100 text-red-800 text-xs sm:text-sm";

    return (
      <Badge className={className}>
        <span className="truncate">{score > 0 ? `${score}%` : "N/A"}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
            Users Management
          </h1>
          <p className="text-gray-500 text-sm sm:text-base truncate">
            Manage all users in the system
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">Export</span>
          </Button>
          <Button
            onClick={() => navigate("/admin/users/create")}
            className="flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm"
          >
            <UserPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">Add User</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="w-full">
        <CardContent className="pt-2 sm:pt-0">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-6 ">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchUsers();
                  }
                }}
                className="pl-8 h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="flex items-center justify-between lg:gap-4 lg:col-span-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 sm:h-10">
                  <Filter className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 sm:h-10">
                  <Filter className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center md:justify-end justify-center gap-2 lg:col-span-2">
              <Button
                onClick={fetchUsers}
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 text-xs sm:text-sm"
              >
                Apply Filters
              </Button>
              {/* <Badge variant="outline" className="text-xs sm:text-sm">
                {pagination.total} users
              </Badge> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Users</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Showing {users.length} of {pagination.total} users
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-0">
          {/* Scrollable container for mobile */}
          <div className="overflow-x-auto rounded-lg border">
            <div className="min-w-[800px] sm:min-w-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      User
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      Role
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      Sessions
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      Questions
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      Materials
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      Quizzes
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      Quiz Score
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      Status
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                      Joined
                    </TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                        <p className="mt-2 text-gray-500 text-sm">
                          Loading users...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <p className="text-gray-500 text-sm">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell className="py-2">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
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
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs sm:text-sm truncate">
                                {user.name || "Unknown User"}
                              </div>
                              <div className="text-xs text-gray-500 truncate hidden sm:block">
                                {user.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <RoleBadge role={user.role || "user"} />
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            {user.sessionCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            {user.questionCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className="text-xs sm:text-sm"
                          >
                            {user.materialCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className={`text-xs sm:text-sm ${
                              user.quizCount > 0
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            <Target className="mr-1 h-3 w-3" />
                            {user.quizCount || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <QuizScoreBadge score={user.avgQuizScore || 0} />
                        </TableCell>
                        <TableCell className="py-2">
                          <StatusBadge isActive={user.isActive !== false} />
                        </TableCell>
                        <TableCell className="py-2">
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
                        <TableCell className="py-2 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                              >
                                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                className="cursor-pointer text-xs sm:text-sm"
                                onClick={() =>
                                  navigate(`/admin/users/${user.id}`)
                                }
                              >
                                <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate">View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-xs sm:text-sm"
                                onClick={() =>
                                  navigate(`/admin/users/${user.id}/edit`)
                                }
                              >
                                <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate">Edit User</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer text-xs sm:text-sm"
                                onClick={() =>
                                  handleDeleteUser(user.id, user.name)
                                }
                              >
                                <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="truncate">Delete User</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination - Responsive */}
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
                      fetchUsers();
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
                      fetchUsers();
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
      </Card>

      {/* User Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              User Distribution
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Users by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Regular Users
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.roleDistribution.user || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Admins
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.roleDistribution.admin || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Activity Status
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              User activity overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Active Users
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.activeUsers || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Inactive Users
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.inactiveUsers || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  New This Week
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.newUsersThisWeek || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Engagement</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Average user metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Avg Sessions/User
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.avgSessionsPerUser || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Avg Questions/User
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.avgQuestionsPerUser || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Avg Materials/User
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.avgMaterialsPerUser || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm sm:text-base">
                  Avg Quizzes/User
                </span>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stats.avgQuizzesPerUser || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersList;
