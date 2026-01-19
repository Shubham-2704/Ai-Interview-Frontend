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
  Download,
  Calendar,
  MessageSquare,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
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
          "all"
        )
      );
      const data = response.data;
      setUsers(data.users || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: data.users?.length || 0,
        pages: 1,
      });
    } catch (error) {
      toast.error("Failed to load users");
      
      // Mock data for testing
      const mockUsers = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: "user",
        sessionCount: Math.floor(Math.random() * 20) + 1,
        questionCount: Math.floor(Math.random() * 100) + 10,
        materialCount: Math.floor(Math.random() * 50) + 5,
        createdAt: new Date(Date.now() - Math.random() * 2592000000).toISOString(),
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
        API_PATHS.ADMIN.USER_DETAILS(userId)
      );
      const data = response.data;
      
      setSelectedUser(data.user);
      setUserSessions(data.sessions || []);
      
      // Calculate user stats
      const totalQuestions = data.stats?.totalQuestions || 0;
      const totalSessions = data.stats?.totalSessions || 0;
      const totalMaterials = data.stats?.totalMaterials || 0;
      
      setUserStats({
        totalSessions,
        totalQuestions,
        totalResources: totalMaterials,
      });
    } catch (error) {
      toast.error("Failed to load user details");
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setExpandedUser(null);
    
    if (userId && userId !== "all") {
      fetchUserDetails(userId);
      setSelectedUser(null); // Clear previous selection first
    } else {
      setSelectedUser(null);
      setUserSessions([]);
      setUserStats({
        totalSessions: 0,
        totalQuestions: 0,
        totalResources: 0,
      });
    }
  };

  const toggleUserExpand = async (user) => {
    if (expandedUser === user.id) {
      setExpandedUser(null);
      setUserSessions([]);
    } else {
      setExpandedUser(user.id);
      await fetchUserDetails(user.id);
    }
  };

  const handleApplyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const navigateToSessionQuestions = (sessionId) => {
    navigate(`/admin/sessions/${sessionId}/questions`);
  };

  const navigateToSessionResources = (sessionId) => {
    navigate(`/admin/sessions/${sessionId}/resources`);
  };

  // Helper function to parse comma-separated topics into array
  const parseTopics = (topics) => {
    if (!topics) return [];
    
    if (Array.isArray(topics)) {
      // If it's already an array, return it
      return topics;
    }
    
    if (typeof topics === 'string') {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(topics);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // If not JSON, split by comma
        return topics.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
    }
    
    // If it's something else, convert to string and split
    return String(topics).split(',').map(t => t.trim()).filter(t => t.length > 0);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions Management</h1>
          <p className="text-gray-500">
            View and manage user sessions, questions, and resources
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
              <Badge variant="outline">
                {users.length} users
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Select a user to view their session history
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
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                      <p className="mt-2 text-gray-500">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
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
                              <div className="font-medium">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.role || "user"}
                          </Badge>
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
                              title={expandedUser === user.id ? "Hide Sessions" : "View Sessions"}
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
                          <TableCell colSpan={7} className="p-0">
                            <div className="p-4 border-t">
                              {userLoading ? (
                                <div className="text-center py-4">
                                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                                  <p className="mt-2 text-sm text-gray-500">Loading sessions...</p>
                                </div>
                              ) : userSessions.length === 0 ? (
                                <div className="text-center py-4">
                                  <p className="text-gray-500">No sessions found for this user</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">
                                      {user.name}'s Session History
                                    </h3>
                                    <div className="text-sm text-gray-500">
                                      {userSessions.length} sessions
                                    </div>
                                  </div>
                                  
                                  <div className="grid gap-4">
                                    {userSessions.map((session) => {
                                      // Parse topics from comma-separated string
                                      const topics = parseTopics(session.topicsToFocus);
                                      
                                      return (
                                        <Card key={session.id} className="border">
                                          <CardContent className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">Role</p>
                                                <p className="font-semibold">{session.role || "Not specified"}</p>
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">Experience</p>
                                                <Badge variant="outline">
                                                  {session.experience || "N/A"}
                                                </Badge>
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">Questions</p>
                                                <div className="flex items-center space-x-2">
                                                  <Badge variant="outline">
                                                    {session.questionCount || 0}
                                                  </Badge>
                                                  {session.materialCount > 0 && (
                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                      <BookOpen className="h-3 w-3 mr-1" />
                                                      {session.materialCount}
                                                    </Badge>
                                                  )}
                                                </div>
                                              </div>
                                              <div>
                                                <p className="text-sm font-medium text-gray-500">Created</p>
                                                <p className="text-sm">
                                                  {session.createdAt
                                                    ? format(new Date(session.createdAt), "MMM dd, yyyy")
                                                    : "N/A"}
                                                </p>
                                              </div>
                                            </div>
                                            
                                            {session.description && (
                                              <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-500">Description</p>
                                                <p className="text-sm text-gray-700 mt-1">{session.description}</p>
                                              </div>
                                            )}
                                            
                                            {topics.length > 0 && (
                                              <div className="mt-3">
                                                <p className="text-sm font-medium text-gray-500">Topics Focus</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                  {topics.map((topic, index) => (
                                                    <Badge 
                                                      key={index} 
                                                      variant="outline" 
                                                      className="bg-blue-50 text-blue-700 border-blue-200"
                                                    >
                                                      {topic}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            
                                            <div className="flex justify-end mt-4 space-x-2">
                                              
                                            <div className="flex items-center space-x-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/admin/sessions/${session.id}/questions`)}
                                                className="h-8 px-3"
                                                disabled={session.questionCount === 0}
                                              >
                                                <MessageSquare className="mr-2 h-3 w-3" />
                                                Questions ({session.questionCount || 0})
                                              </Button>
                                              
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/admin/sessions/${session.id}/resources`)}
                                                className="h-8 px-3"
                                                disabled={session.materialCount === 0}
                                              >
                                                <BookOpen className="mr-2 h-3 w-3" />
                                                Resources ({session.materialCount || 0})
                                              </Button>
                                            </div>
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
    </div>
  );
};

export default Sessions;
