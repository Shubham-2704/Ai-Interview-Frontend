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
    roleDistribution: { user: 0, admin: 0, moderator: 0 },
    activeUsers: 0,
    inactiveUsers: 0,
    newUsersThisWeek: 0,
    avgSessionsPerUser: 0,
    avgQuestionsPerUser: 0,
    avgMaterialsPerUser: 0,
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
          "Failed to load user statistics"
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
          statusFilter
        )
      );

      // Direct access to response data
      const result = response.data;

      setUsers(result.users || []);
      setPagination(
        result.pagination || {
          page: 1,
          limit: 10,
          total: result.users?.length || 0,
          pages: 1,
        }
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load users"
      );

      // Fallback to mock data for development
      if (import.meta.env.DEV) {
        const mockUsers = Array.from({ length: 20 }, (_, i) => ({
          id: `user-${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "moderator" : "user",
          sessions: Math.floor(Math.random() * 100),
          questions: Math.floor(Math.random() * 500),
          materials: Math.floor(Math.random() * 200),
          isActive: i % 5 !== 0,
          createdAt: new Date(
            Date.now() - Math.random() * 31536000000
          ).toISOString(),
          lastLogin: new Date(
            Date.now() - Math.random() * 86400000
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
          "Failed to delete user"
      );
    }
  };

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.USERS_LIST(1, 1000), // Get all users for export
        {
          responseType: "blob", // Important for file download
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`
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
      admin: { label: "Admin", className: "bg-red-100 text-red-800" },
      moderator: {
        label: "Moderator",
        className: "bg-purple-100 text-purple-800",
      },
      user: { label: "User", className: "bg-blue-100 text-blue-800" },
    };
    const config = roleConfig[role] || roleConfig.user;

    return (
      <Badge className={config.className}>
        <Shield className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const StatusBadge = ({ isActive }) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? (
        <>
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </>
      ) : (
        <>
          <XCircle className="mr-1 h-3 w-3" />
          Inactive
        </>
      )}
    </Badge>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Users Management</h1>
          <p className="text-gray-500">Manage all users in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate("/admin/users/create")}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
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
                    fetchUsers();
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
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end gap-2">
              <Button onClick={fetchUsers} variant="outline" size="sm">
                Apply Filters
              </Button>
              <Badge variant="outline">{pagination.total} users found</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Showing {users.length} of {pagination.total} users
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
                  <TableHead>Materials</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
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
                    <TableRow key={user.id} className="hover:bg-gray-50">
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
                            <div className="font-medium">
                              {user.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="mr-1 h-3 w-3" />
                              {user.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role || "user"} />
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
                        <StatusBadge isActive={user.isActive !== false} />
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/users/${user.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/users/${user.id}/edit`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleDeleteUser(user.id, user.name)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
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
                      fetchUsers();
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
                      fetchUsers();
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
      </Card>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Regular Users</span>
                <Badge variant="outline">
                  {stats.roleDistribution.user || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admins</span>
                <Badge variant="outline">
                  {stats.roleDistribution.admin || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Moderators</span>
                <Badge variant="outline">
                  {stats.roleDistribution.moderator || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Status</CardTitle>
            <CardDescription>User activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <Badge variant="outline">{stats.activeUsers || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inactive Users</span>
                <Badge variant="outline">{stats.inactiveUsers || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New This Week</span>
                <Badge variant="outline">{stats.newUsersThisWeek || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
            <CardDescription>Average user metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Sessions/User</span>
                <Badge variant="outline">{stats.avgSessionsPerUser || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Questions/User</span>
                <Badge variant="outline">
                  {stats.avgQuestionsPerUser || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Materials/User</span>
                <Badge variant="outline">
                  {stats.avgMaterialsPerUser || 0}
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
