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
import { toast as hotToast } from "react-hot-toast";
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


// STORAGE UTILITY FUNCTIONS
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
  }

  // Clear any expired session data (optional)
  const sessionStart = Date.now();
  sessionStorage.setItem("session_start_time", sessionStart.toString());
};

// LOCAL STORAGE FUNCTIONS (PERSISTENT)
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
    return true;
  } catch (error) {

    // Handle quota exceeded error
    if (error.name === "QuotaExceededError") {
      clearOldLocalStorageItems();
      // Retry once
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ data, timestamp: Date.now() }),
        );
        return true;
      } catch (retryError) {
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
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (error) {
    return null;
  }
};

// Clear specific item from localStorage
const clearLocalStorageItem = (key) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
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
    });
  } catch (error) {
  }
};

// SESSION STORAGE FUNCTIONS (CURRENT TAB ONLY)
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
  } catch (error) {
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
    return data;
  } catch (error) {
    return null;
  }
};

// Clear specific item from session storage
const clearSessionStorageItem = (key) => {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
  }
};

// MAIN COMPONENT
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

  // Load more settings
  const [loadMoreSettings, setLoadMoreSettings] = useState({
    questionsPerClick: 5,
    maxClicks: 3,
  });

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
    }
  }, [sessionId]);

  // Drawer close handlers - DEFINED FIRST
  const handleCloseDrawer = useCallback(() => {
    setOpenLearnMoreDrawer(false);
  }, []);

  const handleCloseStudyMaterialsDrawer = useCallback(() => {
    setOpenStudyMaterialsDrawer(false);
    setErrorMsg("");
  }, []);

  // LEARN MORE - WITH LOCALSTORAGE (PERSISTENT)
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
        // Small delay for UX consistency
        await new Promise((resolve) => setTimeout(resolve, 100));
        setExplanation(cachedExplanation);
        setIsLoading(false);
        hotToast.success("Explanation loaded from cache!", { position: "top-center" });
        return;
      }

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
          hotToast.success("Explanation generated and saved!", { position: "top-center" });
        } else {
          hotToast.success("Explanation generated!" ,{ position: "top-center" });
        }
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg(
        error.response?.data?.message ||
          "Server are too busy, Please try again later.",
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    }
  }, []);

  // STUDY MATERIALS - WITH SESSIONSTORAGE (CURRENT TAB)
  const fetchStudyMaterials = useCallback(
    async (question, questionId, forceRefresh = false) => {

      // 1. Check if questionId is valid
      if (!questionId) {
        hotToast.error("Cannot fetch resources", { position: "bottom-right" });
        return;
      }

      // 2. Check if already processing
      if (processingRef.current) {
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
        setOpenStudyMaterialsDrawer(true);

        // CACHING STRATEGY - SESSION STORAGE ONLY
        // OPTION 1: Force Refresh - Skip all caches
        if (forceRefresh) {
        }
        // OPTION 2: Check Session Storage (Current Tab Only)
        else {
          const sessionCached = loadFromSessionStorage(
            SESSION_STORAGE_KEYS.STUDY_MATERIALS(questionId),
          );

          if (sessionCached) {

            // Small delay for better UX (shows skeleton briefly)
            await new Promise((resolve) => setTimeout(resolve, 200));

            setStudyMaterials(sessionCached);
            setStudyMaterialId(sessionCached.id || sessionCached._id);
            hotToast.success("Study materials loaded from cache!", { position: "top-center" });
            return;
          }
        }

        // OPTION 3: Check Database via GET endpoint
        try {
          // Try to GET existing materials from database
          const getResponse = await axiosInstance.get(
            API_PATHS.STUDY_MATERIALS.GET_BY_QUESTION(questionId),
          );

          if (getResponse.data && !forceRefresh) {

            // Save to session storage for current tab (NOT localStorage)
            saveToSessionStorage(
              SESSION_STORAGE_KEYS.STUDY_MATERIALS(questionId),
              getResponse.data,
            );

            setStudyMaterials(getResponse.data);
            setStudyMaterialId(getResponse.data.id || getResponse.data._id);
            hotToast.success("Study materials loaded from history!", { position: "top-center" });
            return;
          }
        } catch (dbError) {
          // 404 means no materials in DB yet, which is OK
          if (dbError.response?.status !== 404) {
          }
        }

        // OPTION 4: Generate NEW materials via POST API
        const apiUrl = API_PATHS.STUDY_MATERIALS.GENERATE(questionId);

        const response = await axiosInstance.post(apiUrl, {
          question: question,
          force_refresh: forceRefresh,
        });

        if (response.data && response.data.success) {
          const materialsData = response.data.data || response.data;

          // Save to session storage for current tab (NOT localStorage)
          saveToSessionStorage(
            SESSION_STORAGE_KEYS.STUDY_MATERIALS(questionId),
            materialsData,
          );

          setStudyMaterials(materialsData);
          setStudyMaterialId(materialsData.id || materialsData._id);

          hotToast.success(
            response.data.message ||
              (forceRefresh
                ? "Study materials refreshed!"
                : "Study materials generated!"),
                { position: "top-center" }
          );
        } else {
          hotToast.error(response.data?.message || "Failed to generate materials", { position: "bottom-right" });
        }
      } catch (error) {
        setStudyMaterials(null);

        // SHOW ERROR IN DRAWER
        if (error.response?.data?.detail) {
          setErrorMsg(error.response.data.detail);
          // hotToast.error(error.response.data.detail, { position: "bottom-right" });
        } else if (error.response?.data?.message) {
          setErrorMsg(error.response.data.message);
          // hotToast.error(error.response.data.message, { position: "bottom-right" });
        } else {
          setErrorMsg(
            error.message ||
              "Failed to fetch study materials. Please try again.",
          );
          hotToast.error("Failed to fetch study materials", { position: "bottom-right" });
        }

        // Keep drawer open to show error
        setOpenStudyMaterialsDrawer(true);
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
    if (
      !studyMaterialId ||
      !selectedQuestionForMaterials ||
      !selectedQuestionId
    ) {
      hotToast.error("No study material found to refresh", { position: "bottom-right" });
      return;
    }

    setIsMaterialsRefreshing(true);
    setErrorMsg(""); // Clear previous errors

    try {

      // Call fetchStudyMaterials with forceRefresh flag
      await fetchStudyMaterials(
        selectedQuestionForMaterials,
        selectedQuestionId,
        true, // Force refresh
      );

      // The fetchStudyMaterials function will handle the toast
    } catch (error) {
      hotToast.error("Failed to refresh study materials", { position: "bottom-right" });
    } finally {
      setIsMaterialsRefreshing(false);
    }
  }, [studyMaterialId, selectedQuestionForMaterials, selectedQuestionId]);

  // Delete Study Materials
  const deleteStudyMaterials = useCallback(async () => {
    if (!studyMaterialId) {
      hotToast.error("No study material found", { position: "bottom-right" });
      return;
    }

    try {

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
      hotToast.success("Study materials deleted!", { position: "bottom-right" });
    } catch (error) {
      hotToast.error("Failed to delete study materials", { position: "bottom-right" });
    }
  }, [studyMaterialId, selectedQuestionId]);

  // Clear Study Materials Cache (Session Storage only)
  const clearStudyMaterialsCache = useCallback(() => {
    if (!selectedQuestionId) {
      hotToast.error("No question selected", { position: "bottom-right" });
      return;
    }

    clearSessionStorageItem(
      SESSION_STORAGE_KEYS.STUDY_MATERIALS(selectedQuestionId),
    );
    hotToast.success("Session cache cleared!", { position: "top-right" });
    setOpenStudyMaterialsDrawer(false);
  }, [selectedQuestionId]);

  // LEARN MORE FUNCTIONS - WITH LOCALSTORAGE
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
        hotToast.success("Explanation refreshed and saved!", { position: "top-right" });
      }
    } catch (error) {
      hotToast.error(
        error.response?.data?.message ||
          "Server are too busy, Please try again later.",{ position: "bottom-right" }
      );
      setErrorMsg("Failed to refresh. Please try again.");
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
      hotToast.success("Explanation & chat history cleared", { position: "bottom-right" });
      handleCloseDrawer();
    } catch (error) {
      hotToast.error("Failed to clear explanation", { position: "bottom-right" });
    }
  }, [explanationId, handleCloseDrawer]); // FIXED: Now handleCloseDrawer is defined

  // Clear only chat history (if you have chat storage)
  const clearChatHistory = useCallback(() => {
    if (!explanationId) return;

    try {
      // If you have chat storage in localStorage, clear it
      const chatKey = `chat_${explanationId}`;
      clearLocalStorageItem(chatKey);
      hotToast.success("Chat history cleared", { position: "top-right" });
    } catch (error) {
      hotToast.error("Failed to clear chat history", { position: "bottom-right" });
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

      hotToast.success(`Cleared ${clearedCount} saved explanations`, { position: "top-right" });
    } catch (error) {
      hotToast.error("Failed to clear explanations", { position: "bottom-right" });
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
          hotToast.success(
            `Question ${
              response.data.question.isPinned ? "Pinned" : "Unpinned"
            } successfully!`,
            { position: "top-center" }
          );
        }
      } catch (error) {
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

    // Wait for settings to load if they haven't
    if (!loadMoreSettings.questionsPerClick) {
      hotToast.error("Loading settings, please wait...", { position: "bottom-right" });
      return;
    }

    // Check if user has reached max clicks
    const currentClicks = sessionDataRef.current.load_more_clicked || 0;
    const maxAllowed = loadMoreSettings.maxClicks;

    if (maxAllowed > 0 && currentClicks >= maxAllowed) {
      hotToast.error(
        `Questions limit reached, start a new session to get more questions.`,
        { position: "bottom-right", icon: "ℹ️", style: {border: "1px solid #3b82f6", background: "#eff6ff", color: "#1e40af",},}, );
      return;
    }

    processingRef.current = true;
    setIsUpdateLoader(true);

    try {
      // Use admin setting for number of questions
      const questionsToGenerate = loadMoreSettings.questionsPerClick;

      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionDataRef.current.role,
          experience: sessionDataRef.current.experience,
          topicsToFocus: sessionDataRef.current.topicsToFocus,
          numberOfQuestions: questionsToGenerate,
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
        // Update session to increment load more count
        await axiosInstance.post(
          API_PATHS.SESSION.INCREMENT_LOAD_MORE(sessionId),
        );

        hotToast.success(`Added ${questionsToGenerate} more questions!`, { position: "top-center" });
        fetchSessionDetailsById();
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        hotToast.error(error.response.data.message, { position: "bottom-center" });
      } else {
        hotToast.error("Something went wrong. Please try again.", { position: "bottom-center" });
      }
    } finally {
      setIsUpdateLoader(false);
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    }
  }, [sessionId, fetchSessionDetailsById, loadMoreSettings]);

  const askFollowupQuestion = useCallback(
    async ({ question, history }) => {
      try {
        const response = await axiosInstance.post(API_PATHS.AI.FOLLOWUP_CHAT, {
          context: explanation?.explanation,
          question,
        });

        return response.data?.answer;
      } catch (error) {
        throw error;
      }
    },
    [explanation?.explanation],
  );

  // Download PDF of session Q&A
  const downloadSessionPdf = useCallback(async () => {
    try {
      hotToast.success("Downloading PDF of Q&A Session...", { position: "bottom-right", icon: "ℹ️", style: {border: "1px solid #3b82f6", background: "#eff6ff", color: "#1e40af",}, });
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

      hotToast.success("PDF downloaded successfully!", { position: "bottom-right" });
    } catch (error) {
      hotToast.error(
        error.response?.data?.detail ||
          "Failed to export PDF. Please try after some time.", { position: "bottom-right" }
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

  // With this improved version:
  useEffect(() => {
    const fetchLoadMoreSettings = async () => {
      try {

        // FIRST: Clear the wrong cache
        sessionStorage.removeItem("load_more_settings");

        // Use the CORRECT endpoint - /api/settings/public/questions-count
        const response = await axiosInstance.get(
          API_PATHS.SETTINGS.PUBLIC_QUESTIONS_COUNT,
        );

        if (response.data && response.data.success) {

          // DEFAULT values if data is missing
          const defaultSettings = {
            questionsPerClick: 5,
            maxClicks: 3,
          };

          let settings = { ...defaultSettings };

          // Check if load_more_questions exists
          if (response.data.load_more_questions !== undefined) {
            settings.questionsPerClick = response.data.load_more_questions;
          }
          // If not, check if number_of_questions exists (use for both)
          else if (response.data.number_of_questions !== undefined) {
            settings.questionsPerClick = response.data.number_of_questions;
          }

          // Check if max_load_more_clicks exists
          if (response.data.max_load_more_clicks !== undefined) {
            settings.maxClicks = response.data.max_load_more_clicks;
          }
          setLoadMoreSettings(settings);

          // Save CORRECT settings to sessionStorage
          saveToSessionStorage("load_more_settings", settings);
        } else {
          setLoadMoreSettings({
            questionsPerClick: 5,
            maxClicks: 3,
          });
        }
      } catch (error) {

        // Try to load from localStorage as backup
        const cached = loadFromSessionStorage("load_more_settings");
        if (cached) {
          setLoadMoreSettings(cached);
        } else {
          // Default fallback
          setLoadMoreSettings({
            questionsPerClick: 5,
            maxClicks: 3,
          });
        }
      }
    };

    fetchLoadMoreSettings();
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
                            if (!question?._id) {
                              hotToast.error("Question not found", { position: "bottom-right" });
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
              errorMsg={errorMsg} // ADD THIS
            />
          </div>
        </Card>
      </>
    </DashboardLayout>
  );
});

export default InterviewPrep;