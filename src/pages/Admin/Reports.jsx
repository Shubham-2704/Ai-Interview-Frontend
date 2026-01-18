import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  BarChart3,
  RefreshCw,
  Eye,
  Printer,
  Share2,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  const reports = [
    {
      id: "1",
      title: "Monthly User Activity",
      type: "user",
      period: "January 2024",
      status: "completed",
      generatedAt: "2024-01-31T10:30:00Z",
      size: "2.4 MB",
      downloads: 45,
    },
    {
      id: "2",
      title: "Session Performance",
      type: "session",
      period: "Q4 2023",
      status: "completed",
      generatedAt: "2024-01-15T14:20:00Z",
      size: "1.8 MB",
      downloads: 32,
    },
    {
      id: "3",
      title: "Revenue Analytics",
      type: "revenue",
      period: "Year 2023",
      status: "pending",
      generatedAt: "2024-01-01T09:15:00Z",
      size: "3.2 MB",
      downloads: 28,
    },
    {
      id: "4",
      title: "System Performance",
      type: "system",
      period: "December 2023",
      status: "completed",
      generatedAt: "2024-01-05T11:45:00Z",
      size: "1.5 MB",
      downloads: 19,
    },
    {
      id: "5",
      title: "Content Engagement",
      type: "content",
      period: "Last 90 Days",
      status: "failed",
      generatedAt: "2024-01-10T16:30:00Z",
      size: "N/A",
      downloads: 0,
    },
  ];

  const reportTypes = [
    { value: "user", label: "User Analytics" },
    { value: "session", label: "Session Reports" },
    { value: "revenue", label: "Revenue Reports" },
    { value: "system", label: "System Reports" },
    { value: "content", label: "Content Reports" },
  ];

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-800",
      },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      failed: { label: "Failed", className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.completed;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const TypeBadge = ({ type }) => {
    const typeConfig = {
      user: { label: "User", className: "bg-blue-100 text-blue-800" },
      session: { label: "Session", className: "bg-purple-100 text-purple-800" },
      revenue: { label: "Revenue", className: "bg-green-100 text-green-800" },
      system: { label: "System", className: "bg-yellow-100 text-yellow-800" },
      content: { label: "Content", className: "bg-pink-100 text-pink-800" },
    };
    const config = typeConfig[type] || typeConfig.user;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false);
      // Add new report to list
      reports.unshift({
        id: Date.now().toString(),
        title: "New Custom Report",
        type: "user",
        period: "Custom Range",
        status: "completed",
        generatedAt: new Date().toISOString(),
        size: "1.2 MB",
        downloads: 0,
      });
      setSelectedReport(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500">Generate and manage platform reports</p>
        </div>
        <Dialog
          open={selectedReport !== null}
          onOpenChange={() => setSelectedReport(null)}
        >
          <DialogTrigger asChild>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Configure and generate a custom report
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Notification (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateReport} disabled={generating}>
                {generating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Downloads</p>
                <p className="text-2xl font-bold">124</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100">
                <Download className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Size</p>
                <p className="text-2xl font-bold">2.1 MB</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-100">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select>
                <SelectTrigger>
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            All reports generated for the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{report.title}</h3>
                      <TypeBadge type={report.type} />
                      <StatusBadge status={report.status} />
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {report.period}
                      </span>
                      <span>
                        Generated:{" "}
                        {format(new Date(report.generatedAt), "MMM dd, yyyy")}
                      </span>
                      <span>Size: {report.size}</span>
                      <span className="flex items-center">
                        <Download className="mr-1 h-3 w-3" />
                        {report.downloads} downloads
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>
            Pre-configured report templates for quick generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">User Activity Summary</h4>
                      <p className="text-sm text-gray-500">
                        Monthly user engagement
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-sm text-gray-600">
                    <p>• New user registrations</p>
                    <p>• Active user count</p>
                    <p>• Session statistics</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-green-100">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Performance Report</h4>
                      <p className="text-sm text-gray-500">
                        System performance metrics
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-sm text-gray-600">
                    <p>• API response times</p>
                    <p>• Server uptime</p>
                    <p>• Error rates</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Content Analysis</h4>
                      <p className="text-sm text-gray-500">
                        Study material usage
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-sm text-gray-600">
                    <p>• Popular topics</p>
                    <p>• Material downloads</p>
                    <p>• User feedback</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
