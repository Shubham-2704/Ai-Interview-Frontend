import React, { useState, useEffect, useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  User as UserIcon,
  HelpCircle,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/adminService";
import { UserContext } from "@/context/UserContext";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user} = useContext(UserContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    database: 0,
    health: 0,
    status: 'loading',
    loading: true,
    timestamp: null,
    details: {
      active_connections: 0,
      uptime_hours: 0,
      total_docs: 0
    }
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
      active: location.pathname === "/admin/dashboard",
    },
    {
      title: "Users",
      icon: Users,
      path: "/admin/users",
      active: location.pathname.startsWith("/admin/users"),
      badge: totalUsers,
    },
    {
      title: "Sessions",
      icon: FileText,
      path: "/admin/sessions",
      active: location.pathname.startsWith("/admin/sessions"),
      badge: totalSessions,
    },
    {
      title: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
      active: location.pathname.startsWith("/admin/analytics"),
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/admin/settings",
      active: location.pathname.startsWith("/admin/settings"),
    },
  ];

  // Fetch initial data
  useEffect(() => {
     if (user) {
      fetchInitialData();
    }
    
    // Set up auto-refresh intervals
    const systemStatusInterval = setInterval(fetchSystemStatus, 30000); // Every 30 seconds
    const dashboardStatsInterval = setInterval(fetchDashboardStats, 120000); // Every 2 minutes
    
    return () => {
      clearInterval(systemStatusInterval);
      clearInterval(dashboardStatsInterval);
    };
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSystemStatus(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      setSystemStatus(prev => ({ ...prev, loading: true }));
      
      const response = await adminService.getSystemStatus();
      
      if (response.status === "success") {
        setSystemStatus({
          cpu: response.data?.cpu || 0,
          memory: response.data?.memory || 0,
          database: response.data?.database || 0,
          health: response.data?.health || 0,
          status: response.data?.status || 'unknown',
          loading: false,
          timestamp: response.data?.timestamp || null,
          details: response.data?.details || {
            active_connections: 0,
            uptime_hours: 0,
            total_docs: 0
          }
        });
      } else {
        // Fallback to default values if API returns error
        setSystemStatus({
          cpu: 0,
          memory: 0,
          database: 0,
          health: 0,
          status: 'error',
          loading: false,
          timestamp: new Date().toISOString(),
          details: {
            active_connections: 0,
            uptime_hours: 0,
            total_docs: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
      setSystemStatus(prev => ({ ...prev, loading: false, status: 'error' }));
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await adminService.getDashboardStats("7d");
      
      if (response.status === "success") {
        setTotalUsers(response.data?.totalUsers || 0);
        setTotalSessions(response.data?.totalSessions || 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusColor = (value, type = 'text') => {
    if (value > 80) {
      return type === 'text' ? 'text-red-600' : 'bg-red-500';
    } else if (value > 60) {
      return type === 'text' ? 'text-yellow-600' : 'bg-yellow-500';
    } else {
      return type === 'text' ? 'text-green-600' : 'bg-green-500';
    }
  };

  const getHealthBadgeVariant = (status) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? "w-full" : "w-64"} h-full flex flex-col`}>
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600" />
          <div>
            <span className="text-xl font-bold">InterviewPrep</span>
            <Badge variant="outline" className="ml-2">
              Admin
            </Badge>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Admin Control Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.title}
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start mb-1",
                  item.active && "bg-blue-50 text-blue-700"
                )}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileMenuOpen(false);
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
                {item.badge !== undefined && (
                  <Badge className="ml-auto" variant="secondary">
                    {item.badge.toLocaleString()}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Quick Stats */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">System Status</h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant={getHealthBadgeVariant(systemStatus.status)}
                className="text-xs"
              >
                {systemStatus.health ? `${systemStatus.health}%` : '--%'}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={fetchSystemStatus}
                className="h-6 w-6"
                disabled={systemStatus.loading}
              >
                <RefreshCw className={`h-3 w-3 ${systemStatus.loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {systemStatus.loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Loading...</span>
                    <span className="font-semibold">--%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-300 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : systemStatus.status === 'error' ? (
            <div className="text-center py-4">
              <p className="text-sm text-red-600">Failed to load system status</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchSystemStatus}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* CPU Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className={`font-semibold ${getStatusColor(systemStatus.cpu, 'text')}`}>
                    {systemStatus.cpu}%
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStatusColor(systemStatus.cpu, 'bg')}`}
                    style={{ width: `${systemStatus.cpu}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Memory Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Memory</span>
                  <span className={`font-semibold ${getStatusColor(systemStatus.memory, 'text')}`}>
                    {systemStatus.memory}%
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStatusColor(systemStatus.memory, 'bg')}`}
                    style={{ width: `${systemStatus.memory}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Database Usage */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Database</span>
                  <span className={`font-semibold ${getStatusColor(systemStatus.database, 'text')}`}>
                    {systemStatus.database}%
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStatusColor(systemStatus.database, 'bg')}`}
                    style={{ width: `${systemStatus.database}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Status Details */}
              <div className="pt-2 border-t text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-1">
                  <div className="truncate">Connections:</div>
                  <div className="text-right font-medium">
                    {systemStatus.details?.active_connections?.toLocaleString() || 0}
                  </div>
                  <div className="truncate">Uptime:</div>
                  <div className="text-right font-medium">
                    {systemStatus.details?.uptime_hours 
                      ? `${Math.round(systemStatus.details.uptime_hours)}h` 
                      : '0h'
                    }
                  </div>
                  <div className="truncate">Documents:</div>
                  <div className="text-right font-medium">
                    {systemStatus.details?.total_docs?.toLocaleString() || 0}
                  </div>
                </div>
                {systemStatus.timestamp && (
                  <div className="text-gray-500 text-right mt-1">
                    Updated: {new Date(systemStatus.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/admin/users/${user?.id}`)}>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-white">
        <div className="flex h-16 items-center px-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar isMobile />
            </SheetContent>
          </Sheet>
          <div className="ml-4 flex-1">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-lg bg-linear-to-br from-blue-500 to-purple-600" />
              <span className="text-lg font-bold">Admin Panel</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 border-r bg-white">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64 min-h-screen">
          {/* Desktop Header */}
          <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center gap-4 border-b bg-white px-6">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search users, sessions, questions, materials..."
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
                  3
                </span>
              </Button>
              <div className="hidden md:block">
                <div className="text-sm font-medium">Admin Dashboard</div>
                <div className="text-xs text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
