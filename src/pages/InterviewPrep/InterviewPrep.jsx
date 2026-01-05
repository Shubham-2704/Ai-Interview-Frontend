import React, { useCallback, useEffect, useState, useRef, memo } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import RoleInfoHeader from "./components/RoleInfoHeader";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuestionCard from "@/components/Cards/QuestionCard";
import { toast } from "sonner";
import InterviewPrepSkeleton from "./components/InterviewPrepSkeleton";
import Drawer from "@/components/Drawer";
import { CircleAlert, ListCollapse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Storage utility functions
const STORAGE_KEYS = {
  EXPLANATION_DATA: (explanationId) => `exp_${explanationId}_data`,
  TIMESTAMP: (explanationId) => `exp_${explanationId}_ts`,
};

const isStorageAvailable = () => {
  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

const saveExplanationToStorage = (explanationId, explanationData) => {
  if (!isStorageAvailable()) return false;

  try {
    const storageData = {
      data: explanationData,
      timestamp: Date.now(),
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    const dataKey = STORAGE_KEYS.EXPLANATION_DATA(explanationId);
    const tsKey = STORAGE_KEYS.TIMESTAMP(explanationId);

    localStorage.setItem(dataKey, JSON.stringify(storageData));
    localStorage.setItem(tsKey, JSON.stringify({ timestamp: Date.now() }));

    return true;
  } catch (error) {
    toast.error("Failed to save explanation to local storage");
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

const loadExplanationFromStorage = (explanationId) => {
  if (!isStorageAvailable()) return null;

  try {
    const key = STORAGE_KEYS.EXPLANATION_DATA(explanationId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const { data, timestamp, expiry } = JSON.parse(stored);

    // Check if expired
    if (Date.now() > expiry) {
      // Clear all related data
      localStorage.removeItem(key);
      localStorage.removeItem(STORAGE_KEYS.TIMESTAMP(explanationId));
      localStorage.removeItem(`exp_${explanationId}_chat`);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

// Create explanation ID from question
const createExplanationId = (question) => {
  return btoa(question).replace(/[^a-zA-Z0-9]/g, "_");
};

const InterviewPrep = memo(() => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [explanationId, setExplanationId] = useState(null);

  // Use refs for better performance
  const processingRef = useRef(false);
  const sessionDataRef = useRef(null);

  // Fetch session data by sessionId
  const fetchSessionDetailsById = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
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

  // Generate Concept Explanation with local storage check
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

      // Check localStorage
      const cachedExplanation = loadExplanationFromStorage(expId);

      if (cachedExplanation) {
        // Small delay for UX consistency
        await new Promise((resolve) => setTimeout(resolve, 100));
        setExplanation(cachedExplanation);
        setIsLoading(false);
        toast.success("Loaded explanation & chat from history!");
        return;
      }

      // If not in cache, call API
      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question }
      );

      if (response.data) {
        setExplanation(response.data);
        saveExplanationToStorage(expId, response.data);
        toast.success("Explanation generated successfully!");
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Server are too busy, Please try again later.");
      console.error("Error generating concept explanation:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    }
  }, []);

  // Pin Question
  const toggleQuestionPinStatus = useCallback(
    async (questionId) => {
      if (processingRef.current) return;

      processingRef.current = true;

      try {
        const response = await axiosInstance.post(
          API_PATHS.QUESTION.PIN(questionId)
        );

        if (response.data && response.data?.question) {
          fetchSessionDetailsById();
          toast.success(
            `Question ${
              response.data.question.isPinned ? "Pinned" : "Unpinned"
            } successfully!`
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
    [fetchSessionDetailsById]
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
        }
      );

      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
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

  const handleCloseDrawer = useCallback(() => {
    setOpenLearnMoreDrawer(false);
  }, []);

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
    [explanation?.explanation]
  );

  // Refresh cached explanation
  const refreshExplanation = useCallback(async () => {
    if (!lastQuestion || !explanationId || processingRef.current) return;

    processingRef.current = true;

    try {
      setIsLoading(true);
      setErrorMsg("");

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question: lastQuestion }
      );

      if (response.data) {
        setExplanation(response.data);
        saveExplanationToStorage(explanationId, response.data);
        toast.success("Explanation refreshed");
      }
    } catch (error) {
      setErrorMsg("Failed to refresh. Please try again.");
      console.error("Error refreshing explanation:", error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    }
  }, [lastQuestion, explanationId]);

  // Clear cached explanation (and all related data)
  const clearCachedExplanation = useCallback(() => {
    if (!explanationId || !isStorageAvailable()) return;

    try {
      // Clear ALL related data for this explanation
      localStorage.removeItem(STORAGE_KEYS.EXPLANATION_DATA(explanationId));
      localStorage.removeItem(STORAGE_KEYS.TIMESTAMP(explanationId));
      localStorage.removeItem(`exp_${explanationId}_chat`);

      // Clear state
      setExplanation(null);
      toast.success("Explanation & chat history cleared");
      handleCloseDrawer();
    } catch (error) {
      console.error("Error clearing explanation & chat history:", error);
      toast.error("Failed to clear explanation & chat history");
    }
  }, [explanationId, handleCloseDrawer]);

  // Clear only chat history
  const clearChatHistory = useCallback(() => {
    if (!explanationId || !isStorageAvailable()) return;

    try {
      // Clear only chat history
      localStorage.removeItem(`exp_${explanationId}_chat`);
      toast.success("Chat history cleared");
    } catch (error) {
      console.error("Error clearing chat history:", error);
      toast.error("Failed to clear chat history");
    }
  }, [explanationId]);

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
            <CardTitle className="text-lg">Interview Q & A</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-12 gap-4">
            <div
              className={`col-span-12 ${
                openLearnMoreDrawer ? "md:col-span-7" : "md:col-span-8"
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
                          isPinned={question?.isPinned}
                          onTogglePin={() =>
                            toggleQuestionPinStatus(question._id)
                          }
                          isLoading={isLoading}
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
              explanation={explanation}
              errorMsg={errorMsg}
              onAskFollowup={askFollowupQuestion}
              onRefresh={refreshExplanation}
              onClearExplanationCache={clearCachedExplanation}
              onClearChatHistory={clearChatHistory}
              explanationId={explanationId}
            />
          </div>
        </Card>
      </>
    </DashboardLayout>
  );
});

export default InterviewPrep;
