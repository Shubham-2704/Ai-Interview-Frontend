import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Youtube,
  FileText,
  Code,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Trophy,
  Mail,
  Briefcase,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import StudyMaterialsDrawer from "@/components/StudyMaterialsDrawer";

const SessionResources = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for study materials drawer
  const [selectedResource, setSelectedResource] = useState(null);
  const [isStudyMaterialsOpen, setIsStudyMaterialsOpen] = useState(false);
  const [expandedResources, setExpandedResources] = useState({});
  const [expandedKeywords, setExpandedKeywords] = useState({});

  useEffect(() => {
    fetchSessionResources();
  }, [sessionId]);

  const fetchSessionResources = async () => {
    setLoading(true);
    try {
      console.log("Fetching session details...");
      // Get session details
      const sessionResponse = await axiosInstance.get(
        API_PATHS.ADMIN.SESSION_DETAILS(sessionId),
      );
      console.log("Session response:", sessionResponse.data);
      setSession(sessionResponse.data);

      console.log("Fetching session study materials...");
      // Get all study materials for this session
      const resourcesResponse = await axiosInstance.get(
        API_PATHS.ADMIN.SESSION_STUDY_MATERIALS(sessionId),
      );

      console.log("Resources response:", resourcesResponse.data);

      // Handle response format
      if (resourcesResponse.data?.materials) {
        setResources(resourcesResponse.data.materials);
      } else if (resourcesResponse.data?.data) {
        // Convert grouped data to array
        const resourcesArray = Object.values(resourcesResponse.data.data);
        setResources(resourcesArray);
      } else {
        setResources([]);
      }
    } catch (error) {
      console.error("Error fetching session resources:", error);
      if (error.response?.status === 404) {
        toast.error("Session not found");
      } else {
        toast.error("Failed to load session resources");
      }
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleResourceExpand = (resourceId) => {
    setExpandedResources((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }));
  };

  const toggleKeywordsExpand = (resourceId) => {
    setExpandedKeywords((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }));
  };

  const viewResourceDetails = (resource) => {
    setSelectedResource(resource);
    setIsStudyMaterialsOpen(true);
  };

  const getResourceStats = (resource) => {
    const stats = {
      total: 0,
      videos: 0,
      articles: 0,
      practice: 0,
      documentation: 0,
      books: 0,
      courses: 0,
    };

    if (resource.youtube_links) stats.videos = resource.youtube_links.length;
    if (resource.articles) stats.articles = resource.articles.length;
    if (resource.practice_links)
      stats.practice = resource.practice_links.length;
    if (resource.documentation)
      stats.documentation = resource.documentation.length;
    if (resource.books) stats.books = resource.books.length;
    if (resource.courses) stats.courses = resource.courses.length;

    stats.total = Object.values(stats).reduce((sum, val) => sum + val, 0);

    return stats;
  };

  const getIconForResourceType = () => {
    return <BookOpen className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
            onClick={() => navigate("/admin/sessions")}
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Back to Sessions</span>
            <span className="xs:hidden">Back</span>
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Loading resources...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 xs:p-4 sm:p-6 max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 items-center gap-3 sm:gap-4">
        {/* LEFT — Back */}
        <div className="col-span-1 flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/sessions")}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Back
          </Button>
        </div>

        {/* CENTER — Title */}
        <div className="col-span-2 sm:col-span-1 text-left sm:text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
            Session Resources
          </h1>
          <p className="text-gray-500 text-sm sm:text-base truncate hidden md:block">
            Viewing all study materials for this session
          </p>
        </div>

        {/* RIGHT — Actions */}
        <div className="col-span-3 sm:col-span-1 flex justify-end space-x-2 mt-2 sm:mt-0">
          <Button
            variant="outline"
            className="h-9 sm:h-10 text-xs sm:text-sm"
            onClick={() =>
              navigate(`/admin/sessions/${sessionId}/quiz-history`)
            }
          >
            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Quizzes
          </Button>

          <Button
            className="h-9 sm:h-10 text-xs sm:text-sm"
            onClick={() => navigate(`/admin/sessions/${sessionId}/questions`)}
          >
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Questions
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">
            Session Information
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Details about this interview session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* User Info */}
            <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg bg-gray-50/50">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage
                  src={
                    session?.user?.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id || sessionId}`
                  }
                />
                <AvatarFallback className="text-xs">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base truncate">
                  {session?.user?.name || "Unknown User"}
                </div>
                <div className="text-xs text-gray-500 truncate flex items-center">
                  <Mail className="h-3 w-3 mr-1 hidden xs:inline" />
                  {session?.user?.email || "No email"}
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="p-2 sm:p-3 border rounded-lg bg-gray-50/50">
              <p className="text-xs font-medium text-gray-500 flex items-center">
                <Briefcase className="h-3 w-3 mr-1" />
                Role
              </p>
              <p className="font-semibold text-sm sm:text-base mt-1 truncate">
                {session?.role || "Not specified"}
              </p>
            </div>

            {/* Experience */}
            <div className="p-2 sm:p-3 border rounded-lg bg-gray-50/50">
              <p className="text-xs font-medium text-gray-500">Experience</p>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 sm:px-3 sm:py-1"
                >
                  {session?.experience || "N/A"} Years
                </Badge>
              </div>
            </div>

            {/* Total Resources */}
            <div className="p-2 sm:p-3 border rounded-lg bg-gray-50/50">
              <p className="text-xs font-medium text-gray-500">
                Total Resources
              </p>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 sm:px-3 sm:py-1"
                >
                  {resources.length} {resources.length === 1 ? "item" : "items"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          {session?.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Description
              </p>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {session.description}
              </p>
            </div>
          )}

          {/* Created Date */}
          {session?.created_at && (
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              Created{" "}
              {format(new Date(session.created_at), "MMM dd, yyyy 'at' h:mm a")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources List */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <BookOpen className="inline mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Study Materials & Resources
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm truncate">
                {resources.length} resource{resources.length !== 1 ? "s" : ""}{" "}
                for this session
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5 sm:px-3 sm:py-1 self-start xs:self-auto"
            >
              {resources.length} Resource{resources.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {resources.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">
                  No resources found for this session
                </p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">
                  Study materials will appear here once generated
                </p>
              </div>
            ) : (
              resources.map((resource, index) => {
                const stats = getResourceStats(resource);
                const resourceId = resource._id || `resource-${index}`;
                const isExpanded = expandedResources[resourceId];
                const showAllKeywords = expandedKeywords[resourceId];

                return (
                  <div
                    key={resourceId}
                    className="border rounded-lg p-3 sm:p-4 hover:border-blue-200 transition-colors bg-white"
                  >
                    <div className="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-3 mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                            {getIconForResourceType()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-lg mb-1 truncate">
                              {resource.question_text ||
                                resource.question ||
                                `Resource ${index + 1}`}
                            </h3>
                            {resource.created_at && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Generated{" "}
                                {format(
                                  new Date(resource.created_at),
                                  "MMM dd, yyyy",
                                )}
                              </p>
                            )}

                            {/* Resource Stats */}
                            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                              {stats.videos > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200 text-xs px-1.5 py-0 sm:px-2"
                                >
                                  <Youtube className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                  <span className="hidden xs:inline">
                                    {stats.videos} Video
                                    {stats.videos !== 1 ? "s" : ""}
                                  </span>
                                  <span className="xs:hidden">
                                    {stats.videos}
                                  </span>
                                </Badge>
                              )}
                              {stats.articles > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5 py-0 sm:px-2"
                                >
                                  <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                  <span className="hidden xs:inline">
                                    {stats.articles} Article
                                    {stats.articles !== 1 ? "s" : ""}
                                  </span>
                                  <span className="xs:hidden">
                                    {stats.articles}
                                  </span>
                                </Badge>
                              )}
                              {stats.practice > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0 sm:px-2"
                                >
                                  <Code className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                  <span className="hidden xs:inline">
                                    {stats.practice} Practice
                                  </span>
                                  <span className="xs:hidden">
                                    {stats.practice}
                                  </span>
                                </Badge>
                              )}
                              {stats.documentation > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-1.5 py-0 sm:px-2"
                                >
                                  <BookOpen className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                  <span className="hidden xs:inline">
                                    {stats.documentation} Doc
                                    {stats.documentation !== 1 ? "s" : ""}
                                  </span>
                                  <span className="xs:hidden">
                                    {stats.documentation}
                                  </span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                          onClick={() => toggleResourceExpand(resourceId)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs sm:text-sm px-2 sm:px-4"
                          onClick={() => viewResourceDetails(resource)}
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Details</span>
                          <span className="xs:hidden">View</span>
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                        {/* Keywords */}
                        {resource.keywords && resource.keywords.length > 0 && (
                          <div className="mb-3 sm:mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">
                              Keywords
                            </p>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {showAllKeywords
                                ? resource.keywords.map((keyword, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-xs px-2 py-0.5"
                                    >
                                      {keyword}
                                    </Badge>
                                  ))
                                : resource.keywords
                                    .slice(0, 6)
                                    .map((keyword, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs px-2 py-0.5"
                                      >
                                        {keyword}
                                      </Badge>
                                    ))}

                              {resource.keywords.length > 6 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-2 py-0.5 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-1"
                                  onClick={() =>
                                    toggleKeywordsExpand(resourceId)
                                  }
                                >
                                  {showAllKeywords ? (
                                    <>
                                      Show less
                                      <ChevronLeft className="h-3 w-3" />
                                    </>
                                  ) : (
                                    <>
                                      +{resource.keywords.length - 6} more
                                      <ChevronRight className="h-3 w-3" />
                                    </>
                                  )}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quick Links Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {resource.youtube_links &&
                            resource.youtube_links
                              .slice(0, 2)
                              .map((video, idx) => (
                                <a
                                  key={idx}
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center p-2 sm:p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                  <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs sm:text-sm truncate">
                                      {video.title}
                                    </p>
                                    {video.duration && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {video.duration}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              ))}

                          {resource.articles &&
                            resource.articles
                              .slice(0, 2)
                              .map((article, idx) => (
                                <a
                                  key={idx}
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center p-2 sm:p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-xs sm:text-sm truncate">
                                      {article.title}
                                    </p>
                                    {article.source && (
                                      <p className="text-xs text-gray-500 mt-0.5">
                                        {article.source}
                                      </p>
                                    )}
                                  </div>
                                </a>
                              ))}
                        </div>

                        {/* Stats Summary */}
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                          <p className="text-xs font-medium text-gray-500 mb-2">
                            Resources Summary
                          </p>
                          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2">
                            {stats.videos > 0 && (
                              <div className="text-center p-2 bg-red-50 rounded">
                                <div className="text-red-700 font-bold">
                                  {stats.videos}
                                </div>
                                <div className="text-xs text-red-600">
                                  Videos
                                </div>
                              </div>
                            )}
                            {stats.articles > 0 && (
                              <div className="text-center p-2 bg-blue-50 rounded">
                                <div className="text-blue-700 font-bold">
                                  {stats.articles}
                                </div>
                                <div className="text-xs text-blue-600">
                                  Articles
                                </div>
                              </div>
                            )}
                            {stats.practice > 0 && (
                              <div className="text-center p-2 bg-green-50 rounded">
                                <div className="text-green-700 font-bold">
                                  {stats.practice}
                                </div>
                                <div className="text-xs text-green-600">
                                  Practice
                                </div>
                              </div>
                            )}
                            {stats.documentation > 0 && (
                              <div className="text-center p-2 bg-purple-50 rounded">
                                <div className="text-purple-700 font-bold">
                                  {stats.documentation}
                                </div>
                                <div className="text-xs text-purple-600">
                                  Docs
                                </div>
                              </div>
                            )}
                            {stats.books > 0 && (
                              <div className="text-center p-2 bg-yellow-50 rounded">
                                <div className="text-yellow-700 font-bold">
                                  {stats.books}
                                </div>
                                <div className="text-xs text-yellow-600">
                                  Books
                                </div>
                              </div>
                            )}
                            {stats.courses > 0 && (
                              <div className="text-center p-2 bg-indigo-50 rounded">
                                <div className="text-indigo-700 font-bold">
                                  {stats.courses}
                                </div>
                                <div className="text-xs text-indigo-600">
                                  Courses
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Materials Drawer */}
      <StudyMaterialsDrawer
        isOpen={isStudyMaterialsOpen}
        onClose={() => setIsStudyMaterialsOpen(false)}
        question={
          selectedResource?.question_text || selectedResource?.question || ""
        }
        materials={selectedResource}
        isLoading={false}
        materialId={null}
        onRefresh={() => {
          toast.info("Refresh functionality for admin");
        }}
        onDelete={() => {
          toast.info("Delete functionality for admin");
        }}
        onClearCache={() => {
          toast.info("Clear cache functionality");
        }}
      />
    </div>
  );
};

export default SessionResources;
