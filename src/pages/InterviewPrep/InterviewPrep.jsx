import React, { useCallback, useEffect, useState } from "react";
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
import AIResponsePreview from "./components/AIResponsePreview";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import SkeletonLoader from "@/components/Loader/SkeletonLoader";

const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  // const [isPageLoading, setIsPageLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  // Fetch session data by sessionId
  const fetchSessionDetailsById = useCallback(async () => {
    try {
      // setIsPageLoading(true);
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if (response.data?.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
    // finally {
    //   setIsPageLoading(false);
    // }
  }, [sessionId]);

  // Generate Concept Explanation
  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        {
          question,
        }
      );

      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation, Try again later.");
      // toast.error("Failed to generate explanation, Try again later.");
      console.error("Error generating concept explanation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pin Question
  const toggleQuestionPinStatus = async (questionId) => {
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
    }
  };

  // Add more questions to a session
  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);

      // Call AI API to generate questions
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData.role,
          experience: sessionData.experience,
          topicsToFocus: sessionData.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      // Should be an array like ({question, answer}, ...)
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
    }
  };

  useEffect(() => {
    fetchSessionDetailsById();
  }, [fetchSessionDetailsById, sessionId]);

  return !sessionData ? (
    <InterviewPrepSkeleton />
  ) : (
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
                      key={question._id || index}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{
                        duration: 0.4,
                        type: "spring",
                        stiffness: 100,
                        delay: index * 0.1,
                        damping: 15,
                      }}
                      layout // This is the key prop that animates position changes
                      layoutId={`question-${question._id || index}`} // Helps framer track specific items
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
                        />

                        {!isLoading &&
                          sessionData?.questions?.length === index + 1 && (
                            <div className="flex items-center justify-center">
                              <Button
                                className="bg-black hover:bg-primary"
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
              onClose={() => setOpenLearnMoreDrawer(false)}
              title={!isLoading && explanation?.title}
            >
              {errorMsg && (
                <p className="flex items-center gap-2 text-sm text-primary font-medium">
                  <CircleAlert />
                  {errorMsg}
                </p>
              )}
              {isLoading && <SkeletonLoader />}
              {!isLoading && explanation && (
                <AIResponsePreview content={explanation?.explanation} />
              )}
            </Drawer>
          </div>
        </Card>
      </>
    </DashboardLayout>
  );
};

export default InterviewPrep;
