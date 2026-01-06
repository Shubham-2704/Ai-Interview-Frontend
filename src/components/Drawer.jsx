import React, {
  useState,
  useCallback,
  memo,
  useEffect,
  useRef,
  useContext,
  useMemo,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  CircleAlert,
  X,
  Send,
  BotMessageSquare,
  RefreshCw,
  Loader2,
  Sparkles,
} from "lucide-react";
import AIResponsePreview from "@/pages/InterviewPrep/components/AIResponsePreview";
import { Input } from "./ui/input";
import SkeletonLoader from "./Loader/SkeletonLoader";
import { Avatar } from "./ui/avatar";
import { UserContext } from "@/context/UserContext";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { toast } from "sonner";
import { Trash2Icon } from "./ui/Trash2Icon";
import MaximizeButton from "@/components/MaximizeButton";
// import { fixGrammar } from "@/utils/helper";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { set } from "zod";
import { is } from "zod/v4/locales";

// ---- Storage Utility Functions ----
const STORAGE_KEYS = {
  CHAT_HISTORY: (explanationId) => `exp_${explanationId}_chat`,
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

const saveToStorage = (key, data) => {
  if (!isStorageAvailable()) return false;

  try {
    const storageData = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    };
    localStorage.setItem(key, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

const loadFromStorage = (key) => {
  if (!isStorageAvailable()) return null;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const { data, timestamp, expiry } = JSON.parse(stored);

    // Check if expired
    if (Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    localStorage.removeItem(key); // Clear corrupted data
    return null;
  }
};

// ---- Heavy explanation preview is memoized here ----
const ExplanationView = memo(({ content }) => {
  return <AIResponsePreview content={content} />;
});

// ---- Optimized Chat Message Component ----
const ChatMessage = memo(
  ({ role, text, userProfileImage, userName }) => {
    return (
      <div
        className={`flex gap-3 mb-4 ${
          role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        {role === "assistant" && (
          <Avatar className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
            <BotMessageSquare size={16} />
          </Avatar>
        )}

        <div
          className={`max-w-[80%] rounded-lg px-4 py-3 ${
            role === "user"
              ? "bg-primary text-primary-foreground rounded-br-none"
              : "bg-muted text-muted-foreground rounded-bl-none"
          }`}
        >
          <div className="font-semibold text-xs mb-1 opacity-90">
            {role === "user" ? "You" : "AI Assistant"}
          </div>
          <div className="text-sm">
            {role === "assistant" ? (
              <AIResponsePreview content={text} />
            ) : (
              <div className="whitespace-pre-wrap">{text}</div>
            )}
          </div>
        </div>

        {role === "user" && (
          <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold overflow-hidden">
            <AvatarImage
              src={userProfileImage}
              alt="User Avatar"
              className="h-full w-full object-cover"
            />
            <AvatarFallback>
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom shallow comparison to prevent unnecessary re-renders
    return (
      prevProps.role === nextProps.role &&
      prevProps.text === nextProps.text &&
      prevProps.userProfileImage === nextProps.userProfileImage &&
      prevProps.userName === nextProps.userName
    );
  }
);

// ---- Optimized ChatInput Component ----
const ChatInput = memo(({ onAskQuestion, isChatLoading }) => {
  const [localInput, setLocalInput] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = useCallback(() => {
    if (!localInput.trim() || isChatLoading) return;
    onAskQuestion(localInput);
    setLocalInput("");
  }, [localInput, onAskQuestion, isChatLoading]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [skeletonText, setSkeletonText] = useState("");

  const fixGrammar = useCallback(async (text) => {
    if (!localInput.trim() || isEnhancing) return;

    setIsEnhancing(true);
    setSkeletonText(localInput); // preserve for skeleton shimmer
    setLocalInput(""); // hide old text

    try {
      const response = await axiosInstance.post(API_PATHS.AI.CORRECT_GRAMMAR, {
        text,
      });
      setLocalInput(response.data.correctedText || text);
    } catch (e) {
      // on failure restore original text
      setLocalInput(skeletonText);
    } finally {
      setIsEnhancing(false);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, []);

  return (
    <div className="flex gap-2 mt-3">
      <div className="relative w-full">
        <Input
          ref={inputRef}
          placeholder="Ask something about this explanation…"
          value={isEnhancing ? "" : localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isChatLoading || isEnhancing}
          className="pr-24"
        />

        {/* Skeleton overlay while enhancing */}
        {isEnhancing && (
          <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
            <div className="w-full h-4 rounded-md animate-pulse bg-muted mr-4" />
          </div>
        )}

        {/* Grammar Fix inside input */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="none"
              disabled={isEnhancing || !localInput.trim()}
              className="absolute right-0 top-1/2 -translate-y-1/2"
              onClick={() => fixGrammar(localInput)}
            >
              {isEnhancing ? (
                <Loader2 className="animate-spin text-black" />
              ) : (
                <Sparkles className="text-black" />
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent>Enhanced Grammar</TooltipContent>
        </Tooltip>
      </div>

      <Button
        disabled={isChatLoading || !localInput}
        onClick={handleSubmit}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isChatLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
});

const Drawer = ({
  isOpen,
  onClose,
  title,
  isLoading,
  explanation,
  errorMsg,
  onAskFollowup,
  onRefresh,
  onClearExplanationCache,
  onClearChatHistory,
  explanationId,
}) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const chatContainerRef = useRef(null);
  const { user } = useContext(UserContext);
  const saveTimeoutRef = useRef(null);

  // Use refs to avoid stale closures
  const chatHistoryRef = useRef(chatHistory);
  const onAskFollowupRef = useRef(onAskFollowup);
  const userRef = useRef(user);

  // Update refs when dependencies change
  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  useEffect(() => {
    onAskFollowupRef.current = onAskFollowup;
  }, [onAskFollowup]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Memoize explanation to prevent unnecessary re-renders
  const explanationContent = explanation?.explanation ?? "";
  const memoizedExplanation = useMemo(
    () => ({
      explanation: explanationContent,
    }),
    [explanationContent]
  );

  // Load chat history from storage when explanationId changes
  useEffect(() => {
    if (!explanationId) {
      setChatHistory([]); // Reset if no explanationId
      return;
    }

    setIsLoadingChat(true);

    // Load chat history for THIS specific explanation
    const savedChatHistory = loadFromStorage(
      STORAGE_KEYS.CHAT_HISTORY(explanationId)
    );

    // Small delay for better UX
    const loadTimer = setTimeout(() => {
      if (savedChatHistory && Array.isArray(savedChatHistory)) {
        setChatHistory(savedChatHistory);
      } else {
        setChatHistory([]); // Reset if no saved chat
      }
      setIsLoadingChat(false);
    }, 300);

    return () => clearTimeout(loadTimer);
  }, [explanationId]);

  // Save chat history to storage whenever it changes (with debounce)
  useEffect(() => {
    if (!explanationId || chatHistory.length === 0) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saving to prevent rapid saves
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(STORAGE_KEYS.CHAT_HISTORY(explanationId), chatHistory);
    }, 500); // 500ms debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [chatHistory, explanationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && !isLoadingChat) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [chatHistory, isChatLoading, isLoadingChat]);

  // ---- Optimized ask followup ----
  const handleAskQuestion = useCallback(async (questionText) => {
    if (!questionText.trim()) return;

    // Add user message immediately (functional update)
    const newUserMessage = {
      role: "user",
      text: questionText,
      timestamp: Date.now(),
      userId: userRef.current?.id || "anonymous",
    };

    setChatHistory((prev) => [...prev, newUserMessage]);
    setIsChatLoading(true);

    try {
      // Use ref to get latest chatHistory (avoid stale closure)
      const answer = await onAskFollowupRef.current({
        question: questionText,
        history: chatHistoryRef.current,
      });

      // Add AI response (functional update)
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          text: answer,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      toast.error("Failed to get response. Please try again.");
      console.error("Error asking followup:", error);
    } finally {
      setIsChatLoading(false);
    }
  }, []); // No dependencies needed due to refs

  // Clear only chat history
  const clearChatHistoryLocal = useCallback(() => {
    if (!explanationId) return;

    // Small delay for UX (optional but recommended)
    setTimeout(() => {
      if (isStorageAvailable()) {
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY(explanationId));
      }

      setChatHistory([]);

      if (onClearChatHistory) {
        onClearChatHistory();
      }
    }, 100); // Reduced from 400ms for faster response
  }, [explanationId, onClearChatHistory]);

  // Clear explanation cache (and chat history)
  const clearExplanationCacheLocal = useCallback(() => {
    if (!explanationId) return;

    // Optional UX delay
    setTimeout(() => {
      if (onClearExplanationCache) {
        onClearExplanationCache();
      }

      setChatHistory([]);
    }, 100); // Reduced from 500ms for faster response
  }, [explanationId, onClearExplanationCache]);

  // ---- FIXED: Only clean up timeouts on close, NOT chat history ----
  const handleClose = useCallback(() => {
    // Cleanup timeouts only - DO NOT clear chat history!
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onClose();
  }, [onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Memoize user data to prevent re-renders
  const userData = useMemo(
    () => ({
      profileImageUrl: user?.profileImageUrl,
      name: user?.name,
    }),
    [user?.profileImageUrl, user?.name]
  );

  // Memoize chat history display
  const chatMessages = useMemo(() => {
    return chatHistory.map((message, index) => (
      <ChatMessage
        key={`${message.timestamp}-${index}`}
        role={message.role}
        text={message.text}
        userProfileImage={userData.profileImageUrl}
        userName={userData.name}
      />
    ));
  }, [chatHistory, userData]);

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
          <h5 className="text-base font-semibold text-foreground">{title}</h5>
          {explanationId && explanation && (
            <div className="flex items-center gap-2 mt-1">
              {isLoadingChat ? (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Loading chat...
                </span>
              ) : chatHistory.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  💾 Chat saved ({chatHistory.length} messages)
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  💡 Explanation history chat saved for 7 days
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {explanationId && explanation && (
            <>
              {onRefresh && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRefresh}
                      disabled={isLoading || isLoadingChat}
                      className="h-7 w-7 p-0 hover:text-primary"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh explanation</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearExplanationCacheLocal}
                    disabled={isLoadingChat || isLoading}
                    className="h-7 text-xs hover:text-destructive flex items-center gap-1"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Clear explanation and chat history
                </TooltipContent>
              </Tooltip>
            </>
          )}
          <Button
            variant="outline"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-muted hover:text-destructive"
            disabled={isLoadingChat}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="text-sm mx-1 mb-6">
        {isLoading ? (
          <div className="mb-6">
            <SkeletonLoader />
          </div>
        ) : explanation ? (
          <>
            <div className="mb-6 p-4 bg-card rounded-lg border border-border">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-semibold text-muted-foreground">
                  Concept Explanation
                </div>
                {explanationId && (
                  <div className="text-xs text-muted-foreground">
                    ⏱️ Saved for 7 days
                  </div>
                )}
              </div>
              <ExplanationView content={memoizedExplanation.explanation} />
            </div>

            {/* Chat Section */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-foreground">
                  Ask a question about this concept
                </h4>
                <div className="flex items-center gap-2">
                  <MaximizeButton
                    chatHistory={chatHistory}
                    onSendMessage={handleAskQuestion}
                    explanationTitle={title}
                    isLoading={isChatLoading || isLoadingChat}
                  />
                  {chatHistory.length > 0 && !isLoadingChat && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearChatHistoryLocal}
                          className="h-7 text-xs flex items-center gap-1 hover:text-destructive"
                          disabled={isLoadingChat || chatHistory.length === 0}
                        >
                          <Trash2Icon className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Clear Chat History</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Chat Messages Container */}
              <div
                ref={chatContainerRef}
                className="mb-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar"
              >
                {isLoadingChat ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    <p>Loading chat history...</p>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8 border border-dashed border-border rounded-lg">
                    <div className="mb-2">💬</div>
                    <p>No questions yet.</p>
                    <p className="text-xs mt-1">
                      Ask something about the explanation above!
                    </p>
                    {explanationId && (
                      <p className="text-xs mt-2 text-muted-foreground/70">
                        Your chat will be auto-saved for 7 days
                      </p>
                    )}
                  </div>
                ) : (
                  chatMessages
                )}

                {/* Loading indicator when AI is thinking */}
                {isChatLoading && (
                  <div className="flex gap-3 mb-4">
                    <Avatar className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      <BotMessageSquare size={14} />
                    </Avatar>
                    <div className="bg-muted text-muted-foreground rounded-lg rounded-bl-none px-4 py-3">
                      <div className="font-semibold text-xs mb-1 opacity-90">
                        AI Assistant
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse"></div>
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse delay-150"></div>
                        <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <ChatInput
                onAskQuestion={handleAskQuestion}
                isChatLoading={isChatLoading || isLoadingChat}
              />
            </div>
          </>
        ) : errorMsg ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="flex items-center gap-2 text-sm text-destructive font-medium">
              <CircleAlert className="h-4 w-4" />
              {errorMsg}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default memo(Drawer);
