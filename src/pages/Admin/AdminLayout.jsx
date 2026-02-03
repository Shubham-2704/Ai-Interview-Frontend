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
  X,
  Home,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/adminService";
import { UserContext } from "@/context/UserContext";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 640) return "xs";
      if (width < 768) return "sm";
      if (width < 1024) return "md";
      if (width < 1280) return "lg";
      return "xl";
    }
    return "lg";
  });

  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    database: 0,
    health: 0,
    status: "loading",
    loading: true,
    timestamp: null,
    details: {
      active_connections: 0,
      uptime_hours: 0,
      total_docs: 0,
    },
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize("xs");
      else if (width < 768) setScreenSize("sm");
      else if (width < 1024) setScreenSize("md");
      else if (width < 1280) setScreenSize("lg");
      else setScreenSize("xl");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

    const systemStatusInterval = setInterval(fetchSystemStatus, 30000);
    const dashboardStatsInterval = setInterval(fetchDashboardStats, 120000);

    return () => {
      clearInterval(systemStatusInterval);
      clearInterval(dashboardStatsInterval);
    };
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSystemStatus(), fetchDashboardStats()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      setSystemStatus((prev) => ({ ...prev, loading: true }));
      const response = await adminService.getSystemStatus();

      if (response.status === "success") {
        setSystemStatus({
          cpu: response.data?.cpu || 0,
          memory: response.data?.memory || 0,
          database: response.data?.database || 0,
          health: response.data?.health || 0,
          status: response.data?.status || "unknown",
          loading: false,
          timestamp: response.data?.timestamp || null,
          details: response.data?.details || {
            active_connections: 0,
            uptime_hours: 0,
            total_docs: 0,
          },
        });
      } else {
        setSystemStatus({
          cpu: 0,
          memory: 0,
          database: 0,
          health: 0,
          status: "error",
          loading: false,
          timestamp: new Date().toISOString(),
          details: {
            active_connections: 0,
            uptime_hours: 0,
            total_docs: 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching system status:", error);
      setSystemStatus((prev) => ({ ...prev, loading: false, status: "error" }));
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await adminService.getDashboardStats("7d");
      setTotalUsers(response?.totalUsers || 0);
      setTotalSessions(response?.totalSessions || 0);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusColor = (value, type = "text") => {
    if (value > 80) {
      return type === "text" ? "text-red-600" : "bg-red-500";
    } else if (value > 60) {
      return type === "text" ? "text-yellow-600" : "bg-yellow-500";
    } else {
      return type === "text" ? "text-green-600" : "bg-green-500";
    }
  };

  const getHealthBadgeVariant = (status) => {
    switch (status) {
      case "healthy":
        return "default";
      case "warning":
        return "secondary";
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  };

  const Sidebar = ({ isMobile = false }) => (
    <div
      className={`${isMobile ? "w-full max-w-xs" : "w-64 lg:w-72 xl:w-80"} h-full flex flex-col`}
    >
      {/* Logo */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold whitespace-nowrap">
              InterviewPrep
            </span>
            <Badge
              variant="outline"
              className="ml-2 text-xs hidden sm:inline-flex"
            >
              Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 md:p-4 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.title}
                variant={item.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start mb-1 px-3 py-2 h-auto rounded-lg",
                  item.active && "bg-blue-50 text-blue-700 border-blue-200",
                )}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileMenuOpen(false);
                }}
              >
                <Icon className="mr-3 h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate text-sm">
                  {item.title}
                </span>
                {item.badge !== undefined && (
                  <Badge className="ml-2 shrink-0 text-xs" variant="secondary">
                    {item.badge > 999
                      ? `${(item.badge / 1000).toFixed(1)}k`
                      : item.badge}
                  </Badge>
                )}
                {screenSize === "xs" && !isMobile && item.active && (
                  <ChevronRight className="h-4 w-4 ml-2" />
                )}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* System Status */}
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">System Status</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant={getHealthBadgeVariant(systemStatus.status)}
                className="text-xs"
              >
                {systemStatus.health ? `${systemStatus.health}%` : "--%"}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchSystemStatus}
                className="h-6 w-6"
                disabled={systemStatus.loading}
              >
                <RefreshCw
                  className={`h-3 w-3 ${systemStatus.loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {systemStatus.loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Loading...</span>
                    <span className="font-semibold">--%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-300 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : systemStatus.status === "error" ? (
            <div className="text-center py-2">
              <p className="text-xs text-red-600">Failed to load</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSystemStatus}
                className="mt-1 text-xs h-6 px-2"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* CPU Usage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate">CPU</span>
                  <span
                    className={`font-semibold ${getStatusColor(systemStatus.cpu, "text")}`}
                  >
                    {systemStatus.cpu}%
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(systemStatus.cpu, "bg")}`}
                    style={{ width: `${Math.min(systemStatus.cpu, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Memory Usage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate">Memory</span>
                  <span
                    className={`font-semibold ${getStatusColor(systemStatus.memory, "text")}`}
                  >
                    {systemStatus.memory}%
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(systemStatus.memory, "bg")}`}
                    style={{ width: `${Math.min(systemStatus.memory, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Database Usage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 truncate">Database</span>
                  <span
                    className={`font-semibold ${getStatusColor(systemStatus.database, "text")}`}
                  >
                    {systemStatus.database}%
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(systemStatus.database, "bg")}`}
                    style={{
                      width: `${Math.min(systemStatus.database, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Status Details */}
              <div className="pt-2 border-t text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-1">
                  <div className="truncate">Connections:</div>
                  <div className="text-right font-medium">
                    {systemStatus.details?.active_connections?.toLocaleString() ||
                      0}
                  </div>
                  <div className="truncate">Uptime:</div>
                  <div className="text-right font-medium">
                    {systemStatus.details?.uptime_hours
                      ? `${Math.round(systemStatus.details.uptime_hours)}h`
                      : "0h"}
                  </div>
                  <div className="truncate">Docs:</div>
                  <div className="text-right font-medium">
                    {systemStatus.details?.total_docs?.toLocaleString() || 0}
                  </div>
                </div>
                {systemStatus.timestamp && (
                  <div className="text-gray-500 text-right mt-1 text-xs">
                    {new Date(systemStatus.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-2 shrink-0">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="text-xs">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold ">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "admin@example.com"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 cursor-pointer shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                navigate(`/admin/users/${user?.id}`);
                if (isMobile) setMobileMenuOpen(false);
              }}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                navigate("/admin/settings");
                if (isMobile) setMobileMenuOpen(false);
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Header - FIXED: Prevent cutting off */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-white shadow-sm overflow-visible">
        <div className="flex h-14 items-center px-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-full max-w-xs overflow-y-auto"
            >
              <Sidebar isMobile />
            </SheetContent>
          </Sheet>

          {/* Logo/Title */}
          <div className="ml-1 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <Home className="h-3 w-3 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-base font-bold truncate">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Right Actions */}
          <div className="flex items-center space-x-1">
            {searchOpen ? (
              <div className="absolute inset-x-0 top-14 z-50 bg-white border-b p-2 shadow-md">
                <div className="relative">
                  {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" /> */}
                  <Input
                    type="search"
                    placeholder="Search..."
                    // className="pl-9 text-sm"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="h-9 w-9"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
                    3
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen border-r bg-white shadow-lg z-30">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 xl:ml-72 2xl:ml-80 min-h-screen w-full overflow-x-hidden">
          {/* Desktop Header */}
          <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center gap-4 border-b bg-white px-4 xl:px-6 shadow-sm">
            <div className="flex flex-1 items-center">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search users, sessions, questions, materials..."
                  className="pl-10 pr-4 h-10 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs flex items-center justify-center text-white">
                  3
                </span>
              </Button>

              {/* User Info */}
              <div className="hidden md:block min-w-0">
                <div className="text-sm font-medium truncate">
                  {user?.name || "Admin"}'s Dashboard
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </header>

          {/* Content Area - IMPORTANT FIX: Added overflow control */}
          <div className="p-3 sm:p-4 lg:p-6 w-full max-w-full box-border">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
        <div className="flex items-center justify-around h-14 px-2">
          {navigationItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.title}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-lg flex flex-col items-center justify-center",
                  item.active && "bg-blue-50 text-blue-600",
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                <span className="text-xs">{item.title.slice(0, 3)}</span>
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-lg flex flex-col items-center justify-center"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="h-5 w-5 mb-0.5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </nav>

      {/* Adjust padding for mobile bottom nav */}
      <style jsx global>{`
        /* Prevent zoom issues on mobile */
        @media screen and (max-width: 768px) {
          html {
            touch-action: manipulation;
          }

          body {
            overflow-x: hidden;
            width: 100%;
            position: relative;
          }
        }

        /* Main content padding adjustment */
        main {
          padding-bottom: 3.5rem;
        }

        @media (min-width: 1024px) {
          main {
            padding-bottom: 0;
          }
        }

        /* Prevent horizontal overflow */
        .max-w-full {
          max-width: 100vw;
        }

        /* Fix for zoom issues */
        @media screen and (max-width: 640px) {
          .container-padding {
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
