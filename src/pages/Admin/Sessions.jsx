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
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Loader2,
  Users,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

const Sessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    avgDuration: 0,
    avgQuestions: 0,
    dailyAvg: 0,
  });
  const [loading, setLoading] = useState(true);
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
    fetchSessions();
    fetchSessionStats();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.SESSIONS_LIST(
          pagination.page,
          pagination.limit,
          searchTerm,
          statusFilter
        )
      );

      const data = response.data;
      setSessions(data.sessions || []);
      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          total: data.sessions?.length || 0,
          pages: 1,
        }
      );
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load sessions"
      );

      // Fallback to mock data if API fails
      const roles = [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack",
        "DevOps",
        "Data Scientist",
      ];
      const users = [
        "John Doe",
        "Jane Smith",
        "Bob Johnson",
        "Alice Brown",
        "Charlie Wilson",
      ];

      const mockSessions = Array.from({ length: 10 }, (_, i) => ({
        id: `session-${i + 1}`,
        user: {
          id: `user-${Math.floor(Math.random() * 10) + 1}`,
          name: users[Math.floor(Math.random() * users.length)],
          email: `user${Math.floor(Math.random() * 10) + 1}@example.com`,
        },
        role: roles[Math.floor(Math.random() * roles.length)],
        experience: `${Math.floor(Math.random() * 10) + 1} years`,
        questions: Math.floor(Math.random() * 50) + 1,
        duration: Math.floor(Math.random() * 120) + 30,
        createdAt: new Date(
          Date.now() - Math.random() * 2592000000
        ).toISOString(),
        status: Math.random() > 0.3 ? "completed" : "in-progress",
        description: "Mock session for testing",
        questionCount: Math.floor(Math.random() * 50) + 1,
      }));
      setSessions(mockSessions);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionStats = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.SESSIONS_STATS()
      );
      const data = response.data;
      setStats({
        total: data.totalSessions || 0,
        completed: data.completedSessions || 0,
        inProgress: data.inProgressSessions || 0,
        avgDuration: data.avgDuration || 0,
        avgQuestions: data.avgQuestions || 0,
        dailyAvg: 0, // You might need to calculate this separately
      });
    } catch (error) {
      console.error("Error fetching session stats:", error);
      // Fallback stats
      setStats({
        total: 3421,
        completed: 2987,
        inProgress: 434,
        avgDuration: 45,
        avgQuestions: 24,
        dailyAvg: 28,
      });
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (roleFilter !== "all" && session.role !== roleFilter) return false;
    if (statusFilter !== "all" && session.status !== statusFilter) return false;
    if (
      searchTerm &&
      !session.role?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !session.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      "in-progress": {
        label: "In Progress",
        className: "bg-blue-100 text-blue-800",
        icon: Clock,
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
    };
    const config = statusConfig[status] || {
      label: "Unknown",
      className: "bg-gray-100 text-gray-800",
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions Management</h1>
          <p className="text-gray-500">
            View and manage all interview sessions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sessions</p>
                <p className="text-2xl font-bold">
                  {stats.total.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {stats.total > 0
                ? ((stats.completed / stats.total) * 100).toFixed(1)
                : 0}
              % completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">
                  {stats.completed.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">
                  {stats.inProgress.toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Questions</p>
                <p className="text-2xl font-bold">
                  {stats.avgQuestions.toFixed(1)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchSessions();
                  }
                }}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center justify-end gap-2">
              <Button onClick={fetchSessions} variant="outline" size="sm">
                Apply Filters
              </Button>
              <Badge variant="outline">
                {filteredSessions.length} sessions
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>
            Showing {filteredSessions.length} of {pagination.total} sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                      <p className="mt-2 text-gray-500">Loading sessions...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <p className="text-gray-500">No sessions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={
                                session.user?.profileImageUrl ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                                  session.user?.id || session.id
                                }`
                              }
                            />
                            <AvatarFallback>
                              {session.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {session.user?.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {session.role || "Not specified"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {session.experience || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {session.questionCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.duration || 0} minutes</TableCell>
                      <TableCell>
                        <StatusBadge status={session.status || "pending"} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3 text-gray-500" />
                          {session.createdAt
                            ? format(
                                new Date(session.createdAt),
                                "MMM dd, yyyy"
                              )
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/sessions/${session.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                      fetchSessions();
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
                      fetchSessions();
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
            Showing {filteredSessions.length} sessions
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/sessions/all")}
          >
            View All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Sessions;

