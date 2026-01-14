import React, { useState, useEffect, memo, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ExternalLink,
  Youtube,
  BookOpen,
  FileText,
  Code,
  Book,
  GraduationCap,
  RefreshCw,
  Trash2,
  Download,
  Play,
  Clock,
  BarChart,
  AlertCircle,
  X,
  Loader2,
  Maximize2,
  Minimize2,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StudyMaterialsSkeleton from "./Loader/StudyMaterialsSkeleton";

const StudyMaterialsDrawer = memo(
  ({
    isOpen,
    onClose,
    question,
    materials,
    isLoading,
    materialId,
    onRefresh,
    onDelete,
    onClearCache,
  }) => {
    const [activeTab, setActiveTab] = useState("all");
    const [expandedVideoId, setExpandedVideoId] = useState(null);
    const [isPlayingVideo, setIsPlayingVideo] = useState(null);

    const categories = useMemo(
      () => [
        {
          id: "youtube_links",
          name: "Video Tutorials",
          icon: Youtube,
          color: "bg-red-50 text-red-700",
          badgeColor: "bg-red-100 text-red-800",
        },
        {
          id: "articles",
          name: "Articles & Blogs",
          icon: FileText,
          color: "bg-blue-50 text-blue-700",
          badgeColor: "bg-blue-100 text-blue-800",
        },
        {
          id: "documentation",
          name: "Documentation",
          icon: BookOpen,
          color: "bg-purple-50 text-purple-700",
          badgeColor: "bg-purple-100 text-purple-800",
        },
        {
          id: "practice_links",
          name: "Practice Problems",
          icon: Code,
          color: "bg-green-50 text-green-700",
          badgeColor: "bg-green-100 text-green-800",
        },
        {
          id: "books",
          name: "Books",
          icon: Book,
          color: "bg-amber-50 text-amber-700",
          badgeColor: "bg-amber-100 text-amber-800",
        },
        {
          id: "courses",
          name: "Courses",
          icon: GraduationCap,
          color: "bg-indigo-50 text-indigo-700",
          badgeColor: "bg-indigo-100 text-indigo-800",
        },
      ],
      []
    );

    // Function to extract YouTube video ID from URL
    const extractYouTubeId = useCallback((url) => {
      if (!url) return null;

      // Handle different YouTube URL formats
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /(?:youtube\.com\/v\/)([^&\n?#]+)/,
        /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    }, []);

    // Function to get YouTube embed URL
    const getYouTubeEmbedUrl = useCallback((videoId) => {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
    }, []);

    // Function to extract video details from content/description
    const extractVideoDetails = useCallback((material) => {
      const details = {
        channel: null,
        publishedDate: null,
        originalDuration: material.duration || null,
      };

      // Try to extract channel from content or title
      if (material.content) {
        // Look for channel patterns
        const channelPatterns = [
          /by\s+([^\n\.]+)/i,
          /channel:\s*([^\n\.]+)/i,
          /from\s+([^\n\.]+)/i,
          /\|.*?([^\|\n]+)$/i,
        ];

        for (const pattern of channelPatterns) {
          const match = material.content.match(pattern);
          if (match && match[1]) {
            details.channel = match[1].trim();
            break;
          }
        }

        // Try to extract published date
        const datePatterns = [
          /(\d{1,2}\s+\w+\s+\d{4})/i,
          /(\w+\s+\d{1,2},\s+\d{4})/i,
          /(\d{4}-\d{2}-\d{2})/i,
          /(\d{1,2}\/\d{1,2}\/\d{4})/i,
        ];

        for (const pattern of datePatterns) {
          const match = material.content.match(pattern);
          if (match && match[1]) {
            details.publishedDate = match[1];
            break;
          }
        }
      }

      // If no channel found in content, try to extract from source
      if (!details.channel && material.source) {
        details.channel = material.source;
      }

      return details;
    }, []);

    const handleClose = useCallback(() => {
      setExpandedVideoId(null);
      setIsPlayingVideo(null);
      onClose?.();
    }, [onClose]);

    const toggleVideoExpanded = useCallback(
      (videoId) => {
        if (expandedVideoId === videoId) {
          setExpandedVideoId(null);
          setIsPlayingVideo(null);
        } else {
          setExpandedVideoId(videoId);
        }
      },
      [expandedVideoId]
    );

    const handleVideoPlay = useCallback((videoId) => {
      setIsPlayingVideo(videoId);
    }, []);

    const handleVideoPause = useCallback(
      (videoId) => {
        if (isPlayingVideo === videoId) {
          setIsPlayingVideo(null);
        }
      },
      [isPlayingVideo]
    );

    // Clean up video state when drawer closes
    useEffect(() => {
      if (!isOpen) {
        setExpandedVideoId(null);
        setIsPlayingVideo(null);
      }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        className={`fixed top-16 right-0 z-40 h-[calc(100dvh-64px)]
        p-4 overflow-y-auto transition-transform bg-background
        w-full md:w-[40vw] shadow-2xl border-l border-border
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex flex-col">
            <h5 className="text-base font-semibold text-foreground">
              Study Resources
            </h5>
            <div className="mt-1">
              <div className="text-sm text-muted-foreground line-clamp-2">
                {question}
              </div>
            </div>
            {materialId && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  💾 Loaded from current session
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && materialId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRefresh()}
                    disabled={isLoading}
                    className="h-7 w-8 p-0 hover:text-primary"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh resources</TooltipContent>
              </Tooltip>
            )}
            {onDelete && materialId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete()}
                    disabled={isLoading}
                    className="h-7 w-8 text-xs hover:text-destructive flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete resources</TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="outline"
              onClick={handleClose}
              className="h-7 w-8 p-0 hover:bg-muted hover:text-destructive"
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="text-sm mx-1 mb-6">
          {isLoading ? (
            <div className="mb-6">
              <StudyMaterialsSkeleton />
            </div>
          ) : materials ? (
            <>
              {/* Keywords Section */}
              {materials.keywords && materials.keywords.length > 0 && (
                <div className="mb-6 p-4 bg-card rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-semibold text-muted-foreground">
                      📍 Keywords
                    </div>
                    <div className="text-xs text-muted-foreground">
                      🔍 Search terms used
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {materials.keywords.slice(0, 10).map((keyword, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs hover:bg-secondary/80 cursor-default"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  {materials.search_query && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">Search query:</span> "
                      {materials.search_query}"
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-card rounded-lg border border-border p-3 text-center">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="font-bold text-foreground text-lg">
                    {materials.total_sources || 0}
                  </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-3 text-center">
                  <div className="text-xs text-muted-foreground">Videos</div>
                  <div className="font-bold text-red-600 text-lg">
                    {materials.youtube_links?.length || 0}
                  </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-3 text-center">
                  <div className="text-xs text-muted-foreground">Articles</div>
                  <div className="font-bold text-blue-600 text-lg">
                    {materials.articles?.length || 0}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="all" className="text-xs cursor-pointer">
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="videos"
                    className="text-xs cursor-pointer"
                  >
                    Videos
                  </TabsTrigger>
                  <TabsTrigger
                    value="articles"
                    className="text-xs cursor-pointer"
                  >
                    Articles
                  </TabsTrigger>
                  <TabsTrigger
                    value="practice"
                    className="text-xs cursor-pointer"
                  >
                    Practice
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  {categories.map((category) => {
                    const categoryMaterials = materials[category.id] || [];
                    if (categoryMaterials.length === 0) return null;

                    return (
                      <div key={category.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded ${
                                category.color.split(" ")[0]
                              }`}
                            >
                              <category.icon className="h-3.5 w-3.5" />
                            </div>
                            <h3 className="font-medium text-foreground text-sm">
                              {category.name}
                            </h3>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {categoryMaterials.length}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          {categoryMaterials.map((material, idx) => {
                            const isYouTube = category.id === "youtube_links";
                            const videoId = isYouTube
                              ? extractYouTubeId(material.url)
                              : null;
                            const isExpanded =
                              expandedVideoId === `${category.id}-${idx}`;
                            const isPlaying =
                              isPlayingVideo === `${category.id}-${idx}`;
                            const videoDetails = isYouTube
                              ? extractVideoDetails(material)
                              : {};

                            return (
                              <div
                                key={idx}
                                className="bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 overflow-hidden"
                              >
                                <div className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`p-2 rounded-lg ${
                                          category.color.split(" ")[0]
                                        }`}
                                      >
                                        <category.icon className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                                          {material.title}
                                        </h4>
                                        {/* Channel and Duration Info for YouTube */}
                                        {isYouTube && (
                                          <div className="flex items-center gap-3 mt-1">
                                            {material.channel && (
                                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                <span className="truncate max-w-[120px]">
                                                  {material.channel}
                                                </span>
                                              </div>
                                            )}
                                            {material.duration && (
                                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                <span>{material.duration}</span>
                                              </div>
                                            )}
                                            {material.views && (
                                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Eye className="h-3 w-3" />{" "}
                                                <span>{material.views}</span>
                                              </div>
                                            )}
                                            {material.published_date && (
                                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                  {material.published_date}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                        {!isYouTube && material.source && (
                                          <p className="text-xs text-muted-foreground mt-1 truncate">
                                            {material.source}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {isYouTube && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="h-7 w-7 shrink-0 hover:text-primary"
                                              onClick={() =>
                                                toggleVideoExpanded(
                                                  `${category.id}-${idx}`
                                                )
                                              }
                                            >
                                              {isExpanded ? (
                                                <Minimize2 className="h-3.5 w-3.5" />
                                              ) : (
                                                <Maximize2 className="h-3.5 w-3.5" />
                                              )}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {isExpanded
                                              ? "Minimize video"
                                              : "Expand video"}
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 shrink-0 hover:text-primary"
                                        onClick={() => {
                                          toast.info(
                                            "Opening resource in new tab..."
                                          );
                                          window.open(
                                            material.url,
                                            "_blank",
                                            "noopener,noreferrer"
                                          );
                                        }}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* YouTube Video Embed */}
                                  {isYouTube && videoId && isExpanded && (
                                    <div className="mb-4 rounded-lg overflow-hidden border border-border">
                                      <div className="relative pt-[56.25%]">
                                        {" "}
                                        {/* 16:9 aspect ratio */}
                                        <iframe
                                          src={getYouTubeEmbedUrl(videoId)}
                                          title={material.title}
                                          className="absolute top-0 left-0 w-full h-full"
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          onPlay={() =>
                                            handleVideoPlay(
                                              `${category.id}-${idx}`
                                            )
                                          }
                                          onPause={() =>
                                            handleVideoPause(
                                              `${category.id}-${idx}`
                                            )
                                          }
                                        />
                                      </div>
                                      {isPlaying && (
                                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                          Playing
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Show content for non-YouTube items */}
                                  {!isYouTube && material.content && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                      {material.content}
                                    </p>
                                  )}

                                  {/* Action buttons - removed for YouTube, kept for others */}
                                  {!isYouTube && (
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-7 px-2"
                                        onClick={() =>
                                          window.open(
                                            material.url,
                                            "_blank",
                                            "noopener,noreferrer"
                                          )
                                        }
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Open
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-7 px-2"
                                        onClick={() => {
                                          window.open(
                                            material.url,
                                            "_blank",
                                            "noopener,noreferrer"
                                          );
                                        }}
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Save
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <Separator />
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="videos" className="space-y-3">
                  {(materials.youtube_links || []).length > 0 ? (
                    materials.youtube_links.map((material, idx) => {
                      const videoId = extractYouTubeId(material.url);
                      const isExpanded = expandedVideoId === `youtube-${idx}`;
                      const isPlaying = isPlayingVideo === `youtube-${idx}`;
                      const videoDetails = extractVideoDetails(material);

                      return (
                        <div
                          key={idx}
                          className="bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-red-50 text-red-700">
                                  <Youtube className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                                    {material.title}
                                  </h4>
                                  {/* Channel and Duration Info */}
                                  <div className="flex items-center gap-3 mt-1">
                                    {material.channel && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        <span className="truncate max-w-[120px]">
                                          {material.channel}
                                        </span>
                                      </div>
                                    )}
                                    {material.duration && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{material.duration}</span>
                                      </div>
                                    )}
                                    {material.views && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Eye className="h-3 w-3" />{" "}
                                        <span>{material.views}</span>
                                      </div>
                                    )}
                                    {material.published_date && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{material.published_date}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 shrink-0 hover:text-primary"
                                      onClick={() =>
                                        toggleVideoExpanded(`youtube-${idx}`)
                                      }
                                    >
                                      {isExpanded ? (
                                        <Minimize2 className="h-3.5 w-3.5" />
                                      ) : (
                                        <Maximize2 className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isExpanded
                                      ? "Minimize video"
                                      : "Expand video"}
                                  </TooltipContent>
                                </Tooltip>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 shrink-0 hover:text-primary"
                                  onClick={() => {
                                    toast.info(
                                      "Redirecting to Youtube video..."
                                    );
                                    window.open(
                                      material.url,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* YouTube Video Embed */}
                            {videoId && isExpanded && (
                              <div className="mb-4 rounded-lg overflow-hidden border border-border relative">
                                <div className="relative pt-[56.25%]">
                                  <iframe
                                    src={getYouTubeEmbedUrl(videoId)}
                                    title={material.title}
                                    className="absolute top-0 left-0 w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    onPlay={() =>
                                      handleVideoPlay(`youtube-${idx}`)
                                    }
                                    onPause={() =>
                                      handleVideoPause(`youtube-${idx}`)
                                    }
                                  />
                                </div>
                                {isPlaying && (
                                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    Playing
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                      <div className="mb-2">📹</div>
                      <p>No video tutorials found</p>
                    </div>
                  )}
                </TabsContent>

                {/* Other tabs remain exactly the same */}
                <TabsContent value="articles">
                  {(materials.articles || []).length > 0 ? (
                    <div className="space-y-3">
                      {materials.articles.map((material, idx) => (
                        <div
                          key={idx}
                          className="bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                                    {material.title}
                                  </h4>
                                  {material.source && (
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                      {material.source}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 shrink-0 hover:text-primary"
                                onClick={() => {
                                  toast.info(
                                    "Opening Articles & Blogs in new tab..."
                                  );
                                  window.open(
                                    material.url,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            {material.content && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {material.content}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 px-2"
                                onClick={() =>
                                  window.open(
                                    material.url,
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                                }
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Open
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 px-2"
                                onClick={() => {
                                  window.open(
                                    material.url,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                      <div className="mb-2">📝</div>
                      <p>No articles found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="practice">
                  <div className="space-y-4">
                    {(materials.practice_links || []).length > 0 && (
                      <>
                        <div className="space-y-3">
                          <h3 className="font-medium text-foreground text-sm mb-2">
                            Practice Problems
                          </h3>
                          {materials.practice_links.map((material, idx) => (
                            <div
                              key={idx}
                              className="bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 overflow-hidden"
                            >
                              <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-green-50 text-green-700">
                                      <Code className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                                        {material.title}
                                      </h4>
                                      {material.source && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                          {material.source}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 shrink-0 hover:text-primary"
                                    onClick={() =>
                                      window.open(
                                        material.url,
                                        "_blank",
                                        "noopener,noreferrer"
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </Button>
                                </div>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {material.difficulty && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs h-5"
                                    >
                                      <BarChart className="h-2.5 w-2.5 mr-1" />
                                      {material.difficulty}
                                    </Badge>
                                  )}
                                  {material.platform && (
                                    <Badge className="text-xs h-5 bg-green-100 text-green-800">
                                      {material.platform}
                                    </Badge>
                                  )}
                                </div>

                                {material.content && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                    {material.content}
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7 px-2"
                                    onClick={() =>
                                      window.open(
                                        material.url,
                                        "_blank",
                                        "noopener,noreferrer"
                                      )
                                    }
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Open
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7 px-2"
                                    onClick={() => {
                                      window.open(
                                        material.url,
                                        "_blank",
                                        "noopener,noreferrer"
                                      );
                                    }}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator />
                      </>
                    )}

                    {(materials.documentation || []).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-medium text-foreground text-sm mb-2">
                          Documentation
                        </h3>
                        {materials.documentation.map((material, idx) => (
                          <div
                            key={idx}
                            className="bg-card rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all duration-200 overflow-hidden"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                                      {material.title}
                                    </h4>
                                    {material.source && (
                                      <p className="text-xs text-muted-foreground mt-1 truncate">
                                        {material.source}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 shrink-0 hover:text-primary"
                                  onClick={() => {
                                    toast.info(
                                      "Opening Documentation in new tab..."
                                    );
                                    window.open(
                                      material.url,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              {material.content && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                  {material.content}
                                </p>
                              )}

                              <div className="flex items-center justify-between pt-3 border-t border-border">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-7 px-2"
                                  onClick={() =>
                                    window.open(
                                      material.url,
                                      "_blank",
                                      "noopener,noreferrer"
                                    )
                                  }
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Open
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-7 px-2"
                                  onClick={() => {
                                    window.open(
                                      material.url,
                                      "_blank",
                                      "noopener,noreferrer"
                                    );
                                  }}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer */}
              <div className="pt-4 border-t border-border mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {materials.updated_at ? (
                      <>
                        Updated{" "}
                        {new Date(materials.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </>
                    ) : (
                      "Loaded from current session"
                    )}
                  </div>
                </div>
                {materials.ai_model_used && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Generated with Intervia AI - Your AI Interview Companion
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No study materials found
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We couldn't find any resources for this question. Try clicking
                the Resources button to generate them.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default StudyMaterialsDrawer;
