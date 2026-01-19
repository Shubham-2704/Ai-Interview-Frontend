import React, { useState } from "react";
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
  MessageSquare,
  BookOpen,
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  User as UserIcon,
  HelpCircle,
  BarChart3,
  FileBarChart,
  Activity,
  Shield,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      badge: 1254,
    },
    {
      title: "Sessions",
      icon: FileText,
      path: "/admin/sessions",
      active: location.pathname.startsWith("/admin/sessions"),
      badge: 3421,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
                {item.badge && (
                  <Badge className="ml-auto" variant="secondary">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4" />

        {/* Quick Stats */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-3">System Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">CPU Usage</span>
                <span className="font-semibold">42%</span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: "42%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memory</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: "78%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Database</span>
                <span className="font-semibold">64%</span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{ width: "64%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-gray-500">admin@interviewprep.com</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/admin/profile")}>
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

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
