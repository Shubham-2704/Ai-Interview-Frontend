import React, { useCallback, useEffect, useState, useRef, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import RoleInfoHeader from "./components/RoleInfoHeader";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import QuestionCard from "@/components/Cards/QuestionCard";
import { toast } from "sonner";
import InterviewPrepSkeleton from "./components/InterviewPrepSkeleton";
import Drawer from "@/components/Drawer";
import StudyMaterialsDrawer from "@/components/StudyMaterialsDrawer";
import { CircleAlert, FileQuestion, ListCollapse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DownloadIcon } from "@/components/ui/DownloadIcon";
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";

// ============================================
// STORAGE UTILITY FUNCTIONS
// ============================================

// LocalStorage Keys (Persistent across sessions)
const LOCAL_STORAGE_KEYS = {
  EXPLANATION_DATA: (explanationId) => `persistent_exp_${explanationId}`,
  USER_ID: "user_id", // Optional: If you want to separate by user
};

// Session Storage Keys (Current tab only)
const SESSION_STORAGE_KEYS = {
  STUDY_MATERIALS: (questionId) => `session_study_${questionId}`,
  SESSION_ID: "app_session_id",
};

// Initialize session on app load (session storage only)
const initializeAppSession = () => {
  if (typeof window === "undefined") return;

  // Create unique session ID for this tab if not exists
  if (!sessionStorage.getItem(SESSION_STORAGE_KEYS.SESSION_ID)) {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEYS.SESSION_ID, sessionId);
    console.log("🆕 New session created:", sessionId);
  }

  // Clear any expired session data (optional)
  const sessionStart = Date.now();
  sessionStorage.setItem("session_start_time", sessionStart.toString());
};

// ============================================
// LOCAL STORAGE FUNCTIONS (PERSISTENT)
// ============================================

// Save to Local Storage (Persistent across sessions)
const saveToLocalStorage = (key, data) => {
  if (typeof window === "undefined") return false;

  try {
    const storageData = {
      data,
      timestamp: Date.now(),
      // Optionally store user ID if you have multi-user app
      userId: localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ID) || "default",
    };

    localStorage.setItem(key, JSON.stringify(storageData));
    console.log("💾 Saved to localStorage:", key);
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);

    // Handle quota exceeded error
    if (error.name === "QuotaExceededError") {
      console.warn("LocalStorage quota exceeded, clearing old items...");
      clearOldLocalStorageItems();
      // Retry once
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ data, timestamp: Date.now() }),
        );
        return true;
      } catch (retryError) {
        console.error("Failed after retry:", retryError);
      }
    }

    return false;
  }
};

// Load from Local Storage
const loadFromLocalStorage = (key) => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const { data, timestamp } = JSON.parse(stored);

    // Optional: Add expiration check (e.g., 7 days)
    const EXPIRATION_DAYS = 7;
    const expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // 7 days in ms
    const now = Date.now();

    if (now - timestamp > expirationTime) {
      console.log("🗑️ LocalStorage item expired, removing:", key);
      localStorage.removeItem(key);
      return null;
    }

    console.log("📦 Loaded from localStorage:", key);
    return data;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

// Clear specific item from localStorage
const clearLocalStorageItem = (key) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
    console.log("🗑️ Removed from localStorage:", key);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// Clear old items from localStorage to free space
const clearOldLocalStorageItems = () => {
  if (typeof window === "undefined") return;

  try {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const itemsToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("persistent_exp_")) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.timestamp && item.timestamp < oneWeekAgo) {
            itemsToRemove.push(key);
          }
        } catch (e) {
          // Invalid JSON, remove it
          itemsToRemove.push(key);
        }
      }
    }

    itemsToRemove.forEach((key) => {
      localStorage.removeItem(key);
      console.log("🗑️ Cleared old item:", key);
    });
  } catch (error) {
    console.error("Error clearing old localStorage items:", error);
  }
};

// ============================================
// SESSION STORAGE FUNCTIONS (CURRENT TAB ONLY)
// ============================================

// Save to Session Storage
const saveToSessionStorage = (key, data) => {
  if (typeof window === "undefined") return false;

  try {
    const sessionData = {
      data,
      timestamp: Date.now(),
      sessionId: sessionStorage.getItem(SESSION_STORAGE_KEYS.SESSION_ID),
    };

    sessionStorage.setItem(key, JSON.stringify(sessionData));
    console.log("💾 Saved to sessionStorage:", key);
    return true;
  } catch (error) {
    console.error("Error saving to sessionStorage:", error);
    return false;
  }
};

// Load from Session Storage
const loadFromSessionStorage = (key) => {
  if (typeof window === "undefined") return null;

  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;

    const { data, timestamp, sessionId } = JSON.parse(stored);

    // Verify it's from current session
    const currentSessionId = sessionStorage.getItem(
      SESSION_STORAGE_KEYS.SESSION_ID,
    );
    if (sessionId !== currentSessionId) {
      // Clear data from old session
      sessionStorage.removeItem(key);
      return null;
    }

    console.log("📦 Loaded from sessionStorage:", key);
    return data;
  } catch (error) {
    console.error("Error loading from sessionStorage:", error);
    return null;
  }
};

// Clear specific item from session storage
const clearSessionStorageItem = (key) => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(key);
    console.log("🗑️ Removed from sessionStorage:", key);
  } catch (error) {
    console.error("Error clearing session storage:", error);
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

// Create explanation ID from question
const createExplanationId = (question) => {
  // Use a more robust hash function for better keys
  const hash = btoa(encodeURIComponent(question)).replace(/[^a-zA-Z0-9]/g, "_");
  return `exp_${hash.substring(0, 50)}`; // Limit length
};

const InterviewPrep = memo(() => {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [openStudyMaterialsDrawer, setOpenStudyMaterialsDrawer] =
    useState(false);
  const [studyMaterials, setStudyMaterials] = useState(null);
  const [selectedQuestionForMaterials, setSelectedQuestionForMaterials] =
    useState(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [studyMaterialId, setStudyMaterialId] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [isMaterialsRefreshing, setIsMaterialsRefreshing] = useState(false);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [explanationId, setExplanationId] = useState(null);

  // Use refs for better performance
  const processingRef = useRef(false);
  const sessionDataRef = useRef(null);

  // Initialize session on component mount
  useEffect(() => {
    initializeAppSession();
  }, []);

  // Fetch session data by sessionId
  const fetchSessionDetailsById = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId),
      );

      if (response.data?.session) {
        const newSessionData = response.data.session;
        setSessionData(newSessionData);
        sessionDataRef.current = newSessionData;
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  }, [sessionId]);

  // Drawer close handlers - DEFINED FIRST
  const handleCloseDrawer = useCallback(() => {
    setOpenLearnMoreDrawer(false);
  }, []);

  const handleCloseStudyMaterialsDrawer = useCallback(() => {
    setOpenStudyMaterialsDrawer(false);
  }, []);

  // ============================================
  // LEARN MORE - WITH LOCALSTORAGE (PERSISTENT)
  // ============================================
  const generateConceptExplanation = useCallback(async (question) => {
    if (processingRef.current) return;

    processingRef.current = true;

    try {
      setErrorMsg("");
      setExplanation(null);
      setLastQuestion(question);

      // Set loading IMMEDIATELY
      setIsLoading(true);

      const expId = createExplanationId(question);
      setExplanationId(expId);

      // Open drawer after setting loading
      setOpenLearnMoreDrawer(true);

      // Check LocalStorage FIRST (Persistent across sessions)
      const cachedExplanation = loadFromLocalStorage(
        LOCAL_STORAGE_KEYS.EXPLANATION_DATA(expId),
      );

      if (cachedExplanation) {
        console.log("💾 Loaded explanation from localStorage (persistent)");
        // Small delay for UX consistency
        await new Promise((resolve) => setTimeout(resolve, 100));
        setExplanation(cachedExplanation);
        setIsLoading(false);
        toast.success("Loaded from saved explanations!");
        return;
      }

      console.log("🔄 No cached explanation found, calling API...");

      // If not in localStorage, call API
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question },
      );

      if (response.data) {
        setExplanation(response.data);

        // Save to localStorage for persistence across sessions
        const saved = saveToLocalStorage(
          LOCAL_STORAGE_KEYS.EXPLANATION_DATA(expId),
          response.data,
        );

        if (saved) {
          console.log("✅ Explanation saved to localStorage");
          toast.success("Explanation generated and saved!");
        } else {
          console.warn("⚠️ Could not save to localStorage");
          toast.success("Explanation generated!");
        }
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg(
        error.response?.data?.message ||
          "Server are too busy, Please try again later.",
      );
      console.error("Error generating concept explanation:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    }
  }, []);

  // ============================================
  // STUDY MATERIALS - WITH SESSIONSTORAGE (CURRENT TAB)
  // ============================================
  const fetchStudyMaterials = useCallback(
    async (question, questionId, forceRefresh = false) => {
      console.log("🔍 fetchStudyMaterials called with:", {
        question: question?.substring(0, 50),
        questionId,
        forceRefresh,
      });

      // 1. Check if questionId is valid
      if (!questionId) {
        console.error("❌ ERROR: questionId is required");
        toast.error("Cannot fetch resources: Question ID missing");
        return;
      }

      // 2. Check if already processing
      if (processingRef.current) {
        console.log("⚠️ Already processing, skipping");
        return;
      }

      // 3. Set loading state IMMEDIATELY (shows spinner on button)
      setIsMaterialsLoading(true);
      processingRef.current = true;

      // Store question info for drawer
      setSelectedQuestionForMaterials(question);
      setSelectedQuestionId(questionId);

      try {
        setErrorMsg("");

        // 4. Small delay to show button spinner (UX - matches Learn More)
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 5. NOW open drawer (after spinner shows on button)
        console.log("🚪 Opening drawer...");
        setOpenStudyMaterialsDrawer(true);

        // ============================================
        // CACHING STRATEGY - SESSION STORAGE ONLY
        // ============================================

        // OPTION 1: Force Refresh - Skip all caches
        if (forceRefresh) {
          console.log("🔄 Force refresh requested, skipping caches");
        }
        // OPTION 2: Check Session Storage (Current Tab Only)
        else {
          const sessionCached = loadFromSessionStorage(
            SESSION_STORAGE_KEYS.STUDY_MATERIALS(questionId),
          );

          if (sessionCached) {
            console.log(
              "📦 Found in session storage (current tab only):",
              sessionCached,
            );

            // Small delay for better UX (shows skeleton briefly)
            await new Promise((resolve) => setTimeout(resolve, 200));

            setStudyMaterials(sessionCached);
            setStudyMaterialId(sessionCached.id || sessionCached._id);
            toast.success("Loaded from current session!");
            return;
          }

          console.log("❌ Not found in session storage");
        }

        // OPTION 3: Check Database via GET endpoint
        console.log("🔄 Checking database for existing materials...");
        try {
          // Try to GET existing materials from database
          const getResponse = await axiosInstance.get(
            API_PATHS.STUDY_MATERIALS.GET_BY_QUESTION(questionId),
          );

          if (getResponse.data && !forceRefresh) {
            console.log("✅ Found in database:", getResponse.data);

            // Save to session storage for current tab (NOT localStorage)
            saveToSessionStorage(
              SESSION_STORAGE_KEYS.STUDY_MATERIALS(questionId),
              getResponse.data,
            );

            setStudyMaterials(getResponse.data);
            setStudyMaterialId(getResponse.data.id || getResponse.data._id);
            toast.success("Loaded study materials from database!");
            return;
          }
        } catch (dbError) {
          // 404 means no materials in DB yet, which is OK
          if (dbError.response?.status !== 404) {
            console.error("⚠️ Database check error:", dbError.message);
          }
          console.log(
            "📝 No existing materials in database, will generate new",
          );
        }

        // OPTION 4: Generate NEW materials via POST API
        console.log("🚀 Generating new study materials...");
        const apiUrl = API_PATHS.STUDY_MATERIALS.GENERATE(questionId);
        console.log("📡 API URL:", apiUrl);

        const response = await axiosInstance.post(apiUrl, {
          question: question,
          force_refresh: forceRefresh,
        });

        console.log("✅ API Response:", response.data);

        if (response.data) {
          // Save to session storage for current tab (NOT localStorage)
          saveToSessionStorage(
            SESSION_STORAGE_KEYS.STUDY_MATERIALS(questionId),
            response.data,
          );

          setStudyMaterials(response.data);
          setStudyMaterialId(response.data.id || response.data._id);

          toast.success(
            forceRefresh
              ? "Study materials refreshed!"
              : "Study materials generated!",
          );
        }
      } catch (error) {
        console.error("❌ Error fetching study materials:", error);
        console.error("🔍 Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        setStudyMaterials(null);

        // Better error messages
        if (error.response?.status === 404) {
          setErrorMsg(
            "Endpoint not found. Please check backend configuration.",
          );
        } else if (error.response?.status === 401) {
          setErrorMsg("Authentication required. Please login again.");
        } else if (error.response?.status === 400) {
          setErrorMsg("Invalid request. Please check the question format.");
        } else {
          setErrorMsg(
            error.response?.data?.message ||
              error.message ||
              "Failed to fetch study materials. Please try again.",
          );
        }

        toast.error("Failed to fetch study materials");
      } finally {
        setIsMaterialsLoading(false);
        setTimeout(() => {
          processingRef.current = false;
        }, 500);
      }
    },
    [],
  );

  // Refresh Study Materials
  const refreshStudyMaterials = useCallback(async () => {
    if (!studyMaterialId) {
      toast.error("No study material ID found");
      return;
    }

    setIsMaterialsRefreshing(true);
    try {
      console.log("🔄 Refreshing study materials with ID:", studyMaterialId);

      const response = await axiosInstance.post(
        API_PATHS.STUDY_MATERIALS.REFRESH(studyMaterialId),
      );

      console.log("✅ Refresh response:", response.data);

      if (response.data) {
        // Update session storage with refreshed data (NOT localStorage)
        if (selectedQuestionId) {
          saveToSessionStorage(
            SESSION_STORAGE_KEYS.STUDY_MATERIALS(selectedQuestionId),
            response.data,
          );
        }

        setStudyMaterials(response.data);
        toast.success("Study materials refreshed!");
      }
    } catch (error) {
      console.error("❌ Error refreshing study materials:", error);
      toast.error("Failed to refresh study materials");
    } finally {
      setIsMaterialsRefreshing(false);
    }
  }, [studyMaterialId, selectedQuestionId]);

  // Delete Study Materials
  const deleteStudyMaterials = useCallback(async () => {
    if (!studyMaterialId) {
      toast.error("No study material ID found");
      return;
    }

    try {
      console.log("🗑️ Deleting study materials with ID:", studyMaterialId);

      await axiosInstance.delete(
        API_PATHS.STUDY_MATERIALS.DELETE(studyMaterialId),
      );

      // Clear from session storage (NOT localStorage)
      if (selectedQuestionId) {
        clearSessionStorageItem(
          SESSION_STORAGE_KEYS.STUDY_MATERIALS(selectedQuestionId),
        );
      }

      setStudyMaterials(null);
      setOpenStudyMaterialsDrawer(false);
      toast.success("Study materials deleted!");
    } catch (error) {
      console.error("❌ Error deleting study materials:", error);
      toast.error("Failed to delete study materials");
    }
  }, [studyMaterialId, selectedQuestionId]);

  // Clear Study Materials Cache (Session Storage only)
  const clearStudyMaterialsCache = useCallback(() => {
    if (!selectedQuestionId) {
      toast.error("No question selected");
      return;
    }

    clearSessionStorageItem(
      SESSION_STORAGE_KEYS.STUDY_MATERIALS(selectedQuestionId),
    );
    toast.success("Session cache cleared!");
    setOpenStudyMaterialsDrawer(false);
  }, [selectedQuestionId]);

  // ============================================
  // LEARN MORE FUNCTIONS - WITH LOCALSTORAGE
  // ============================================

  // Refresh cached explanation
  const refreshExplanation = useCallback(async () => {
    if (!lastQuestion || !explanationId) return;

    setIsRefreshing(true);
    setErrorMsg("");

    try {
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question: lastQuestion },
      );

      if (response.data) {
        setExplanation(response.data);
        // Update localStorage (persistent)
        saveToLocalStorage(
          LOCAL_STORAGE_KEYS.EXPLANATION_DATA(explanationId),
          response.data,
        );
        toast.success("Explanation refreshed and saved!");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Server are too busy, Please try again later.",
      );
      setErrorMsg("Failed to refresh. Please try again.");
      console.error("Error refreshing explanation:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [lastQuestion, explanationId]);

  // Clear cached explanation (LocalStorage only)
  const clearCachedExplanation = useCallback(() => {
    if (!explanationId) return;

    try {
      // Clear from localStorage (persistent storage)
      clearLocalStorageItem(LOCAL_STORAGE_KEYS.EXPLANATION_DATA(explanationId));

      // Clear state
      setExplanation(null);
      toast.success("Explanation & chat history cleared");
      handleCloseDrawer();
    } catch (error) {
      console.error("Error clearing explanation:", error);
      toast.error("Failed to clear explanation");
    }
  }, [explanationId, handleCloseDrawer]); // FIXED: Now handleCloseDrawer is defined

  // Clear only chat history (if you have chat storage)
  const clearChatHistory = useCallback(() => {
    if (!explanationId) return;

    try {
      // If you have chat storage in localStorage, clear it
      const chatKey = `chat_${explanationId}`;
      clearLocalStorageItem(chatKey);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Error clearing chat history:", error);
      toast.error("Failed to clear chat history");
    }
  }, [explanationId]);

  // Clear ALL saved explanations (for current user)
  const clearAllSavedExplanations = useCallback(() => {
    try {
      let clearedCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("persistent_exp_")) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      }

      toast.success(`Cleared ${clearedCount} saved explanations`);
    } catch (error) {
      console.error("Error clearing all explanations:", error);
      toast.error("Failed to clear explanations");
    }
  }, []);

  // Pin Question
  const toggleQuestionPinStatus = useCallback(
    async (questionId) => {
      if (processingRef.current) return;

      processingRef.current = true;

      try {
        const response = await axiosInstance.post(
          API_PATHS.QUESTION.PIN(questionId),
        );

        if (response.data && response.data?.question) {
          fetchSessionDetailsById();
          toast.success(
            `Question ${
              response.data.question.isPinned ? "Pinned" : "Unpinned"
            } successfully!`,
          );
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      } finally {
        setTimeout(() => {
          processingRef.current = false;
        }, 300);
      }
    },
    [fetchSessionDetailsById],
  );

  // Add more questions to a session
  const uploadMoreQuestions = useCallback(async () => {
    if (processingRef.current || !sessionDataRef.current) return;

    processingRef.current = true;
    setIsUpdateLoader(true);

    try {
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionDataRef.current.role,
          experience: sessionDataRef.current.experience,
          topicsToFocus: sessionDataRef.current.topicsToFocus,
          numberOfQuestions: 10,
        },
      );

      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        },
      );

      if (response.data) {
        toast.success("Added more Q&A!!");
        fetchSessionDetailsById();
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsUpdateLoader(false);
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    }
  }, [sessionId, fetchSessionDetailsById]);

  const askFollowupQuestion = useCallback(
    async ({ question, history }) => {
      try {
        const response = await axiosInstance.post(API_PATHS.AI.FOLLOWUP_CHAT, {
          context: explanation?.explanation,
          question,
        });

        return response.data?.answer;
      } catch (error) {
        console.error("Error asking followup:", error);
        throw error;
      }
    },
    [explanation?.explanation],
  );

  // Download PDF of session Q&A
  const downloadSessionPdf = useCallback(async () => {
    try {
      toast.info("Downloading PDF of Q&A Session...");

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

      let filename = `${sessionData?.role || "Interview"}-Q&A.pdf`;

      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) filename = match[1];
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error(
        error.response?.data?.detail ||
          "Failed to export PDF. Please try after some time.",
      );
    }
  }, [sessionId, sessionData?.role]);

  useEffect(() => {
    fetchSessionDetailsById();
  }, [fetchSessionDetailsById, sessionId]);

  useEffect(() => {
    return () => {
      processingRef.current = false;
    };
  }, []);

  if (!sessionData) {
    return <InterviewPrepSkeleton />;
  }

  return (
    <DashboardLayout>
      <>
        <RoleInfoHeader
          role={sessionData?.role || ""}
          topicsToFocus={sessionData?.topicsToFocus || ""}
          experience={sessionData?.experience || "-"}
          questions={sessionData?.questions?.length || "-"}
          description={sessionData?.description || ""}
          lastUpdated={
            sessionData?.updatedAt
              ? format(sessionData.updatedAt, "do MMM yyyy")
              : ""
          }
        />

        <Card className="shadow-none border-none container mx-auto px-4 md:px-0">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg">Interview Q & A</CardTitle>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => navigate(`/quiz/${sessionId}`)}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <FileQuestion className="h-4 w-4" />
                      <span className="hidden sm:inline">Practice Quiz</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Take a quiz based on these questions
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={downloadSessionPdf}
                      className="flex items-center gap-2 ml-auto"
                    >
                      <DownloadIcon />
                      <span className="hidden sm:inline">Download Q&A</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download PDF of Q&A Session</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-12 gap-4">
            <div
              className={`col-span-12 ${
                openLearnMoreDrawer || openStudyMaterialsDrawer
                  ? "md:col-span-7"
                  : "md:col-span-8"
              }`}
            >
              <AnimatePresence>
                {sessionData?.questions?.map((question, index) => {
                  return (
                    <motion.div
                      layout="position"
                      key={question._id || index}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      layoutId={`question-${question._id || index}`}
                    >
                      <>
                        <QuestionCard
                          question={question?.question}
                          answer={question?.answer}
                          onLearnMore={() =>
                            generateConceptExplanation(question?.question)
                          }
                          onStudyMaterials={() => {
                            console.log(
                              "📞 Calling fetchStudyMaterials from QuestionCard",
                            );
                            if (!question?._id) {
                              console.error("❌ Question ID is undefined");
                              toast.error("Question ID not found");
                              return;
                            }
                            fetchStudyMaterials(
                              question?.question,
                              question._id,
                            );
                          }}
                          isPinned={question?.isPinned}
                          onTogglePin={() =>
                            toggleQuestionPinStatus(question._id)
                          }
                          isLoading={isLoading}
                          studyMaterialsLoading={isMaterialsLoading}
                          questionId={question?._id}
                        />

                        {!isLoading &&
                          sessionData?.questions?.length === index + 1 && (
                            <div className="flex items-center justify-center">
                              <Button
                                className="bg-black hover:bg-primary transition-colors duration-150"
                                disabled={isUpdateLoader || isLoading}
                                onClick={uploadMoreQuestions}
                              >
                                <>
                                  {isUpdateLoader ? (
                                    <Spinner />
                                  ) : (
                                    <ListCollapse />
                                  )}
                                  Load More
                                </>
                              </Button>
                            </div>
                          )}
                      </>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
          <div>
            <Drawer
              isOpen={openLearnMoreDrawer}
              onClose={handleCloseDrawer}
              title={!isLoading && explanation?.title}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              explanation={explanation}
              errorMsg={errorMsg}
              onAskFollowup={askFollowupQuestion}
              onRefresh={refreshExplanation}
              onClearExplanationCache={clearCachedExplanation}
              onClearChatHistory={clearChatHistory}
              explanationId={explanationId}
            />

            <StudyMaterialsDrawer
              isOpen={openStudyMaterialsDrawer}
              onClose={handleCloseStudyMaterialsDrawer}
              question={selectedQuestionForMaterials}
              materials={studyMaterials}
              isLoading={isMaterialsLoading || isMaterialsRefreshing}
              materialId={studyMaterialId}
              onRefresh={refreshStudyMaterials}
              onDelete={deleteStudyMaterials}
              onClearCache={clearStudyMaterialsCache}
            />
          </div>
        </Card>
      </>
    </DashboardLayout>
  );
});

export default InterviewPrep;