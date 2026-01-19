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
        API_PATHS.ADMIN.SESSION_DETAILS(sessionId)
      );
      console.log("Session response:", sessionResponse.data);
      setSession(sessionResponse.data);

      console.log("Fetching session questions...");
      // Get questions for this session
      const questionsResponse = await axiosInstance.get(
        API_PATHS.ADMIN.SESSION_QUESTIONS(sessionId)
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
        { params: { session_id: sessionId } }
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
      await axiosInstance.patch(
        API_PATHS.QUESTIONS.PIN_QUESTION(questionId),
        { isPinned: !isCurrentlyPinned }
      );
      
      // Update local state
      setQuestions(prev => prev.map(q => 
        q._id === questionId ? { ...q, isPinned: !isCurrentlyPinned } : q
      ));
      
      toast.success(isCurrentlyPinned ? "Question unpinned" : "Question pinned");
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
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${session?.role || 'Interview'}-Questions.pdf`;
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
              <p className="text-gray-500 mt-2">Loading questions...</p>
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
            <h1 className="text-2xl font-bold">Session Questions</h1>
            <p className="text-gray-500">
              Viewing all questions for this session
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {questions.length > 0 && (
            <Button variant="outline" onClick={downloadQuestionsPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
          <Button onClick={() => navigate(`/admin/sessions/${sessionId}/resources`)}>
            <BookOpen className="h-4 w-4 mr-2" />
            View All Resources
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
              <p className="text-sm font-medium text-gray-500">Created</p>
              <div className="flex items-center">
                <Calendar className="mr-1 h-3 w-3 text-gray-500" />
                {session?.createdAt
                  ? format(new Date(session.createdAt), "MMM dd, yyyy")
                  : "N/A"}
              </div>
            </div>
          </div>
          
          {session?.description && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-sm text-gray-700 mt-1">{session.description}</p>
            </div>
          )}
          
          {session?.topicsToFocus && Array.isArray(session.topicsToFocus) && session.topicsToFocus.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Topics to Focus</p>
              <div className="flex flex-wrap gap-2">
                {session.topicsToFocus.map((topic, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions List in QuestionCard Format */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <MessageSquare className="inline mr-2 h-5 w-5" />
                Questions & Answers
              </CardTitle>
              <CardDescription>
                {questions.length} questions in this session
              </CardDescription>
            </div>
            <Badge variant="outline">
              {questions.length} Questions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions found in this session</p>
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
                  onTogglePin={() => handleTogglePin(question.id || question._id, question.isPinned)}
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
