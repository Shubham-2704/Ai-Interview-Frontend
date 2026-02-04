// src/pages/Admin/SessionQuestions.jsx
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
  MessageSquare,
  Calendar,
  ArrowLeft,
  Download,
  BookOpen,
  Loader2,
  User,
  Briefcase,
  Target,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import QuestionCard from "@/components/Cards/QuestionCard";
import StudyMaterialsDrawer from "@/components/StudyMaterialsDrawer";

const SessionQuestions = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for study materials drawer
  const [studyMaterials, setStudyMaterials] = useState(null);
  const [isStudyMaterialsOpen, setIsStudyMaterialsOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    fetchSessionQuestions();
  }, [sessionId]);

  const fetchSessionQuestions = async () => {
    setLoading(true);
    try {
      console.log("Fetching session details...");
      // Get session details
      const sessionResponse = await axiosInstance.get(
        API_PATHS.ADMIN.SESSION_DETAILS(sessionId),
      );
      console.log("Session response:", sessionResponse.data);
      setSession(sessionResponse.data);

      console.log("Fetching session questions...");
      // Get questions for this session
      const questionsResponse = await axiosInstance.get(
        API_PATHS.ADMIN.SESSION_QUESTIONS(sessionId),
      );

      console.log("Questions response:", questionsResponse.data);

      if (questionsResponse.data?.questions) {
        setQuestions(questionsResponse.data.questions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching session questions:", error);
      if (error.response?.status === 404) {
        toast.error("Session not found");
      } else {
        toast.error("Failed to load session questions");
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyMaterials = async (question) => {
    setSelectedQuestion(question);
    setMaterialsLoading(true);
    setIsStudyMaterialsOpen(true);

    try {
      console.log("Fetching study materials for question:", question._id);
      // Get study materials for this specific question
      const response = await axiosInstance.get(
        API_PATHS.ADMIN.STUDY_MATERIALS_BY_QUESTION(question._id),
        { params: { session_id: sessionId } },
      );

      console.log("Study materials response:", response.data);

      if (response.data) {
        setStudyMaterials(response.data);
      } else {
        setStudyMaterials(null);
      }
    } catch (error) {
      console.error("Error fetching study materials:", error);
      toast.error("Failed to load study materials");
      setStudyMaterials(null);
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleLearnMore = async (question) => {
    // For admin, this could expand to show more details or generate content
    toast.info("Learn more feature would generate additional content");
  };

  const handleTogglePin = async (questionId, isCurrentlyPinned) => {
    try {
      await axiosInstance.patch(API_PATHS.QUESTIONS.PIN_QUESTION(questionId), {
        isPinned: !isCurrentlyPinned,
      });

      // Update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === questionId ? { ...q, isPinned: !isCurrentlyPinned } : q,
        ),
      );

      toast.success(
        isCurrentlyPinned ? "Question unpinned" : "Question pinned",
      );
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to update pin status");
    }
  };

  const downloadQuestionsPDF = async () => {
    try {
      toast.info("Generating PDF...");
      const response = await axiosInstance.get(
        API_PATHS.PDF.EXPORT_SESSION_QNA(sessionId),
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${session?.role || "Interview"}-Questions.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Failed to download PDF");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/sessions")}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="truncate">Back to Sessions</span>
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Loading questions...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
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
            Session Questions
          </h1>
          <p className="text-gray-500 text-sm sm:text-base truncate hidden md:block">
            Viewing all questions for this session
          </p>
        </div>

        {/* RIGHT — Actions */}
        <div className="col-span-3 sm:col-span-1 flex justify-end sm:justify-end space-x-2 mt-2 sm:mt-0">
          {questions.length > 0 && (
            <Button
              variant="outline"
              onClick={downloadQuestionsPDF}
              className="h-9 sm:h-10 text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Download PDF
            </Button>
          )}
          <Button
            onClick={() => navigate(`/admin/sessions/${sessionId}/resources`)}
            className="h-9 sm:h-10 text-xs sm:text-sm"
          >
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            View Resources
          </Button>
        </div>
      </div>

      {/* Session Info */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Session Information
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Details about this interview session
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile: Stacked layout */}
          <div className="md:hidden space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage
                  src={
                    session?.user?.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id || sessionId}`
                  }
                />
                <AvatarFallback className="text-sm">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base truncate">
                  {session?.user?.name || "Unknown User"}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">
                  {session?.user?.email || "No email"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
                  <Briefcase className="h-3 w-3 mr-1" /> Role
                </p>
                <p className="font-semibold text-sm truncate">
                  {session?.role || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
                  <Target className="h-3 w-3 mr-1" /> Experience
                </p>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <span className="truncate">
                    {session?.experience || "N/A"} Year
                  </span>
                </Badge>
              </div>

              <div className="col-span-2">
                <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> Created
                </p>
                <div className="flex items-center">
                  <span className="text-sm truncate">
                    {session?.createdAt
                      ? format(new Date(session.createdAt), "MMM dd, yyyy")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    session?.user?.profileImageUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.id || sessionId}`
                  }
                />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="font-medium truncate">
                  {session?.user?.name || "Unknown User"}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {session?.user?.email || "No email"}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Role</p>
              <p className="font-semibold truncate">
                {session?.role || "Not specified"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Experience</p>
              <Badge variant="outline">
                <span className="truncate">{session?.experience || "N/A"}</span>
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">Created</p>
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3 text-gray-500 shrink-0" />
                <span className="truncate">
                  {session?.createdAt
                    ? format(new Date(session.createdAt), "MMM dd, yyyy")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {session?.description && (
            <div className="mt-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Description
              </p>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-3">
                {session.description}
              </p>
            </div>
          )}

          {session?.topicsToFocus &&
            Array.isArray(session.topicsToFocus) &&
            session.topicsToFocus.length > 0 && (
              <div className="mt-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                  Topics to Focus
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {session.topicsToFocus.map((topic, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 text-xs sm:text-sm"
                    >
                      <span className="truncate max-w-[100px]">{topic}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Questions List in QuestionCard Format */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <MessageSquare className="inline mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">Questions & Answers</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                {questions.length} questions in this session
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="text-xs sm:text-sm mt-2 sm:mt-0"
            >
              {questions.length} Questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm sm:text-base">
                  No questions found in this session
                </p>
              </div>
            ) : (
              questions.map((question, index) => (
                <QuestionCard
                  key={question.id || question._id || index}
                  question={question.question}
                  answer={question.answer || "No answer provided"}
                  questionId={question.id || question._id}
                  isPinned={question.isPinned || false}
                  isLoading={false}
                  studyMaterialsLoading={false}
                  onLearnMore={() => handleLearnMore(question)}
                  onStudyMaterials={() => fetchStudyMaterials(question)}
                  onTogglePin={() =>
                    handleTogglePin(
                      question.id || question._id,
                      question.isPinned,
                    )
                  }
                  // Add responsive props if QuestionCard supports them
                  className="w-full"
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Study Materials Drawer */}
      <StudyMaterialsDrawer
        isOpen={isStudyMaterialsOpen}
        onClose={() => setIsStudyMaterialsOpen(false)}
        question={selectedQuestion?.question || ""}
        materials={studyMaterials}
        isLoading={materialsLoading}
        materialId={null} // Admin view doesn't need materialId for refresh/delete
        onRefresh={() => fetchStudyMaterials(selectedQuestion)}
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

export default SessionQuestions;