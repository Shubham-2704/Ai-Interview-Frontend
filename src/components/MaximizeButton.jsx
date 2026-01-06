import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import MaximizeChatModal from "./MaximizeChatModal";
import { UserContext } from "@/context/UserContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MaximizeButton = ({
  chatHistory = [],
  onSendMessage,
  explanationTitle = "",
  isLoading = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useContext(UserContext);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSendMessage = async (message) => {
    if (onSendMessage) {
      return await onSendMessage(message);
    }
    // Fallback if no onSendMessage provided
    return `Response to: "${message}"`;
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenModal}
            className="h-7 text-xs flex items-center gap-1 hover:text-primary"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Open chat in full screen</p>
        </TooltipContent>
      </Tooltip>

      <MaximizeChatModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        chatHistory={chatHistory}
        onSendMessage={handleSendMessage}
        explanationTitle={explanationTitle}
        isLoading={isLoading}
      />
    </>
  );
};

export default MaximizeButton;
