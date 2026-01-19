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

  useEffect(() => {
    fetchSessionResources();
  }, [sessionId]);

  const fetchSessionResources = async () => {
    setLoading(true);
    try {
      console.log("Fetching session details...");
      // Get session details
      const sessionResponse = await axiosInstance.get(
        API_PATHS.ADMIN.SESSION_DETAILS(sessionId)
      );
      console.log("Session response:", sessionResponse.data);
      setSession(sessionResponse.data);

      console.log("Fetching session study materials...");
      // Get all study materials for this session
      const resourcesResponse = await axiosInstance.get(
        API_PATHS.ADMIN.SESSION_STUDY_MATERIALS(sessionId)
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
    setExpandedResources(prev => ({
      ...prev,
      [resourceId]: !prev[resourceId]
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
    if (resource.practice_links) stats.practice = resource.practice_links.length;
    if (resource.documentation) stats.documentation = resource.documentation.length;
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
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/sessions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-500 mt-2">Loading resources...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/sessions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Session Resources</h1>
            <p className="text-gray-500">
              Viewing all study materials for this session
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate(`/admin/sessions/${sessionId}/questions`)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            View Questions
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
          <CardDescription>
            Details about this interview session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={session?.user?.profileImageUrl || 
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id || sessionId}`}
                />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{session?.user?.name || "Unknown User"}</div>
                <div className="text-sm text-gray-500">{session?.user?.email || "No email"}</div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="font-semibold">{session?.role || "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Experience</p>
              <Badge variant="outline">
                {session?.experience || "N/A"}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Total Resources</p>
              <Badge variant="outline">
                {resources.length} items
              </Badge>
            </div>
          </div>
          
          {session?.description && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-sm text-gray-700 mt-1">{session.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <BookOpen className="inline mr-2 h-5 w-5" />
                Study Materials & Resources
              </CardTitle>
              <CardDescription>
                {resources.length} resources for this session
              </CardDescription>
            </div>
            <Badge variant="outline">
              {resources.length} Resources
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No resources found for this session</p>
              </div>
            ) : (
              resources.map((resource, index) => {
                const stats = getResourceStats(resource);
                const resourceId = resource._id || `resource-${index}`;
                const isExpanded = expandedResources[resourceId];
                
                return (
                  <div key={resourceId} className="border rounded-lg p-4 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                            {getIconForResourceType()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">
                              {resource.question_text || resource.question || `Resource ${index + 1}`}
                            </h3>
                            {resource.created_at && (
                              <p className="text-sm text-gray-500">
                                Generated {format(new Date(resource.created_at), "MMM dd, yyyy")}
                              </p>
                            )}
                            
                            {/* Resource Stats */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {stats.videos > 0 && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  <Youtube className="h-3 w-3 mr-1" />
                                  {stats.videos} Videos
                                </Badge>
                              )}
                              {stats.articles > 0 && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {stats.articles} Articles
                                </Badge>
                              )}
                              {stats.practice > 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Code className="h-3 w-3 mr-1" />
                                  {stats.practice} Practice
                                </Badge>
                              )}
                              {stats.documentation > 0 && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {stats.documentation} Docs
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleResourceExpand(resourceId)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => viewResourceDetails(resource)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        {/* Keywords */}
                        {resource.keywords && resource.keywords.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">Keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {resource.keywords.slice(0, 8).map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Quick Links Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {resource.youtube_links && resource.youtube_links.slice(0, 2).map((video, idx) => (
                            <a
                              key={idx}
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Youtube className="h-5 w-5 text-red-600 mr-3" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{video.title}</p>
                                {video.duration && (
                                  <p className="text-xs text-gray-500">{video.duration}</p>
                                )}
                              </div>
                            </a>
                          ))}
                          
                          {resource.articles && resource.articles.slice(0, 2).map((article, idx) => (
                            <a
                              key={idx}
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <FileText className="h-5 w-5 text-blue-600 mr-3" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{article.title}</p>
                                {article.source && (
                                  <p className="text-xs text-gray-500">{article.source}</p>
                                )}
                              </div>
                            </a>
                          ))}
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
        question={selectedResource?.question_text || selectedResource?.question || ""}
        materials={selectedResource}
        isLoading={false}
        materialId={null}
        onRefresh={() => {
          // You could implement refresh for admin if needed
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
