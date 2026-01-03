import React, {
  useState,
  useCallback,
  memo,
  useDeferredValue,
  useEffect,
  useRef,
  useContext,
} from "react";

import { Button } from "@/components/ui/button";
import {
  CircleAlert,
  X,
  Send,
  BotMessageSquare,
  RefreshCw,
} from "lucide-react";
import AIResponsePreview from "@/pages/InterviewPrep/components/AIResponsePreview";
import { Input } from "./ui/input";
import SkeletonLoader from "./Loader/SkeletonLoader";
import { Avatar } from "./ui/avatar";
import { UserContext } from "@/context/UserContext";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { toast } from "sonner";

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

// ---- Chat Message Component ----
const ChatMessage = memo(({ role, text }) => {
  const { user } = useContext(UserContext);
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
        <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold">
          <AvatarImage src={user?.profileImageUrl} alt="User Avatar" />
          <AvatarFallback>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});

// ---- ChatInput Component ----
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

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, []);

  return (
    <div className="flex gap-2 mt-3">
      <Input
        ref={inputRef}
        placeholder="Ask something about this explanation…"
        value={localInput}
        onChange={(e) => setLocalInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isChatLoading}
        className="flex-1"
      />
      <Button
        disabled={isChatLoading || !localInput.trim()}
        onClick={handleSubmit}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isChatLoading ? (
          <span className="flex items-center gap-2">
            <div className="h-2 w-2 bg-current rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-current rounded-full animate-pulse delay-150"></div>
            <div className="h-2 w-2 bg-current rounded-full animate-pulse delay-300"></div>
          </span>
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
  const chatContainerRef = useRef(null);
  const { user } = useContext(UserContext);

  const explanationContent = explanation?.explanation ?? "";
  const deferredExplanation = useDeferredValue(explanationContent);

  // Load chat history from storage when explanationId changes
  useEffect(() => {
    if (!explanationId) return;

    // Load chat history
    const savedChatHistory = loadFromStorage(
      STORAGE_KEYS.CHAT_HISTORY(explanationId)
    );

    if (savedChatHistory && Array.isArray(savedChatHistory)) {
      setChatHistory(savedChatHistory);
    }
  }, [explanationId]);

  // Save chat history to storage whenever it changes
  useEffect(() => {
    if (!explanationId || chatHistory.length === 0) return;

    // Save chat history
    saveToStorage(STORAGE_KEYS.CHAT_HISTORY(explanationId), chatHistory);
  }, [chatHistory, explanationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [chatHistory, isChatLoading]);

  // ---- ask followup ----
  const handleAskQuestion = useCallback(
    async (questionText) => {
      if (!questionText.trim()) return;

      // Add user message immediately
      const newUserMessage = {
        role: "user",
        text: questionText,
        timestamp: Date.now(),
        userId: user?.id || "anonymous",
      };
      setChatHistory((prev) => [...prev, newUserMessage]);
      setIsChatLoading(true);

      try {
        const answer = await onAskFollowup({
          question: questionText,
          history: chatHistory,
        });

        // Add AI response
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            text: answer,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsChatLoading(false);
      }
    },
    [chatHistory, onAskFollowup, user]
  );

  // Clear only chat history
  const clearChatHistoryLocal = useCallback(() => {
    if (!explanationId) return;

    // Clear from local storage
    if (isStorageAvailable()) {
      localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY(explanationId));
    }

    // Clear local state
    setChatHistory([]);

    // Call parent function if provided
    if (onClearChatHistory) {
      onClearChatHistory();
    }

    toast.success("Chat history cleared");
  }, [explanationId, onClearChatHistory]);

  // Clear explanation cache (and chat history)
  const clearExplanationCacheLocal = useCallback(() => {
    if (!explanationId) return;

    // Call parent function to clear everything
    if (onClearExplanationCache) {
      onClearExplanationCache();
    }

    // Also clear local chat history state
    setChatHistory([]);
  }, [explanationId, onClearExplanationCache]);

  // ---- reset drawer on close ----
  const handleClose = () => {
    onClose();
  };

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
              {chatHistory.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  💾 Chat saved ({chatHistory.length} messages)
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  💡 Explanation cached for 7 days
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {explanationId && explanation && (
            <>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-7 w-7 p-0"
                  title="Refresh explanation"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={clearChatHistoryLocal}
                disabled={chatHistory.length === 0}
                className="h-7 text-xs"
                title="Clear only chat history"
              >
                🗑️ Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearExplanationCacheLocal}
                className="h-7 text-xs text-destructive"
                title="Clear explanation cache and chat history"
              >
                🗑️ All
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="text-sm mx-1 mb-6">
        {isLoading && <SkeletonLoader />}

        {!isLoading && explanation && (
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
              <ExplanationView content={deferredExplanation} />
            </div>

            {/* Chat Section */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-foreground">
                  Ask a question about this concept
                </h4>
                {chatHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearChatHistoryLocal}
                    className="h-7 text-xs"
                  >
                    Clear Chat
                  </Button>
                )}
              </div>

              {/* Chat Messages Container */}
              <div
                ref={chatContainerRef}
                className="mb-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar"
              >
                {chatHistory.length === 0 ? (
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
                  chatHistory.map((message, index) => (
                    <ChatMessage
                      key={index}
                      role={message.role}
                      text={message.text}
                    />
                  ))
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
                isChatLoading={isChatLoading}
              />
            </div>
          </>
        )}

        {!isLoading && !explanation && errorMsg && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="flex items-center gap-2 text-sm text-destructive font-medium">
              <CircleAlert className="h-4 w-4" />
              {errorMsg}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
