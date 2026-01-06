import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Loader2, Maximize2, BotMessageSquare } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserContext } from "@/context/UserContext";
import { format } from "date-fns";
import { toast } from "sonner";
import AIResponsePreview from "@/pages/InterviewPrep/components/AIResponsePreview";

const MaximizeChatModal = ({
  isOpen,
  onClose,
  chatHistory: initialChatHistory = [],
  onSendMessage,
  explanationTitle = "",
  isLoading: parentLoading = false,
}) => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState(initialChatHistory);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(UserContext);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [skeletonText, setSkeletonText] = useState("");

  // Sync with parent chatHistory
  useEffect(() => {
    setChatHistory(initialChatHistory);
  }, [initialChatHistory, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: input,
      timestamp: Date.now(),
    };

    // Add user message locally
    const updatedChats = [...chatHistory, userMessage];
    setChatHistory(updatedChats);
    setInput("");
    setIsLoading(true);

    try {
      // Call parent's onSendMessage
      const response = await onSendMessage(input);

      // Add AI response
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        text: response,
        timestamp: Date.now(),
      };

      setChatHistory((prev) => [...prev, aiResponse]);
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
      // Remove the user message if error
      setChatHistory((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const fixGrammar = useCallback(
    async (text) => {
        if (!text.trim() || isEnhancing) return;

        setIsEnhancing(true);
        setSkeletonText(text);
        setInput(""); // hide old text visually

        try {
        const response = await axiosInstance.post(
            API_PATHS.AI.CORRECT_GRAMMAR,
            { text }
        );

        setInput(response.data.correctedText || text);
        } catch (e) {
        setInput(skeletonText); // restore on failure
        } finally {
        setIsEnhancing(false);
        }
    },
    [isEnhancing, skeletonText]
    );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BotMessageSquare className="h-5 w-5 text-primary" />
              </div>

              <div className="space-y-2">
                <DialogTitle>{explanationTitle || "AI Chat"}</DialogTitle>
                <DialogDescription>
                  Continue your conversation in full screen
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 pb-0 space-y-2 bg-linear-to-b from-background to-muted/30">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto mb-0 flex items-center justify-center">
                  <BotMessageSquare className="h-10 w-10 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No questions yet.
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Ask something about the explanation!
                </p>
              </div>
            ) : (
              chatHistory.map((message) => (
                <div
                  key={message.id || message.timestamp}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI Assistant Avatar */}
                  {message.role === "assistant" && (
                    <Avatar className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      <BotMessageSquare size={18} />
                    </Avatar>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-muted-foreground rounded-bl-none"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold">
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </span>
                      <span className="text-xs font-bold opacity-90">
                        {format(new Date(message.timestamp), "h:mm a")}
                      </span>
                    </div>
                    <div className="text-sm">
                      {message.role === "assistant" ? (
                        <AIResponsePreview content={message.text} />
                      ) : (
                        <div className="whitespace-pre-wrap">
                          {message.text}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {message.role === "user" && (
                    <Avatar className="h-10 w-10 bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-semibold overflow-hidden">
                      <AvatarImage
                        src={user?.profileImageUrl}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                      />
                      <AvatarFallback>
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  <BotMessageSquare size={18} />
                </Avatar>
                <div className="bg-muted text-muted-foreground rounded-lg rounded-bl-none px-4 py-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold opacity-90 ">
                      AI Assistant
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse"></div>
                    <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse delay-150"></div>
                    <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className=" bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-2">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type your message here..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading || parentLoading}
                  className="flex-1"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60">
                  ⏎
                </div>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || parentLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2 mb-2">
              Chat history will be saved and synced with the sidebar
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaximizeChatModal;
