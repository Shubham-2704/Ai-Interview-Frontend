import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Download,
  Calendar,
  Activity,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);

  const userGrowthData = [
    { date: "Jan 1", users: 1200 },
    { date: "Jan 8", users: 1350 },
    { date: "Jan 15", users: 1520 },
    { date: "Jan 22", users: 1680 },
    { date: "Jan 29", users: 1850 },
    { date: "Feb 5", users: 2100 },
    { date: "Feb 12", users: 2350 },
  ];

  const sessionData = [
    { hour: "9 AM", sessions: 45 },
    { hour: "10 AM", sessions: 89 },
    { hour: "11 AM", sessions: 120 },
    { hour: "12 PM", sessions: 156 },
    { hour: "1 PM", sessions: 142 },
    { hour: "2 PM", sessions: 178 },
    { hour: "3 PM", sessions: 195 },
    { hour: "4 PM", sessions: 167 },
    { hour: "5 PM", sessions: 134 },
  ];

  const topicDistribution = [
    { name: "React", value: 35 },
    { name: "JavaScript", value: 25 },
    { name: "Node.js", value: 15 },
    { name: "System Design", value: 12 },
    { name: "Database", value: 8 },
    { name: "DevOps", value: 5 },
  ];

  const performanceData = [
    { metric: "Page Load Time", value: 1.2, target: 2.0 },
    { metric: "API Response", value: 120, target: 200 },
    { metric: "Uptime", value: 99.8, target: 99.5 },
    { metric: "Error Rate", value: 0.2, target: 1.0 },
  ];

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <span
                  className={`ml-2 text-sm ${
                    change > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change}%
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg bg-${color}/10`}>
            <Icon className={`h-6 w-6 text-${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">
            Platform performance and usage analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Users"
          value="1,254"
          change={12.5}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Avg Session Time"
          value="24m"
          change={8.3}
          icon={Clock}
          color="green"
        />
        <StatCard
          title="Engagement Rate"
          value="68%"
          change={5.2}
          icon={Target}
          color="purple"
        />
        <StatCard
          title="Peak Load"
          value="2.4k"
          change={15.7}
          icon={Zap}
          color="yellow"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                  New user registrations over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Session Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Session Distribution</CardTitle>
                <CardDescription>Peak hours for user activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Topic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>Popular interview topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topicDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {topicDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.metric}</span>
                        <span className="font-medium">
                          {item.metric === "Uptime" ||
                          item.metric === "Error Rate"
                            ? `${item.value}%`
                            : item.metric === "Page Load Time"
                            ? `${item.value}s`
                            : `${item.value}ms`}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            item.value <= item.target
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${(item.value / item.target) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Target:{" "}
                        {item.metric === "Uptime" ||
                        item.metric === "Error Rate"
                          ? `${item.target}%`
                          : item.metric === "Page Load Time"
                          ? `${item.target}s`
                          : `${item.target}ms`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement Analysis</CardTitle>
              <CardDescription>
                Detailed user behavior and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
