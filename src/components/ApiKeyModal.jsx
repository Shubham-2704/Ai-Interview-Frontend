import React, { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { UserContext } from "@/context/UserContext";
import { toast } from "sonner";


// { open, onClose, onApiKeySubmit, className }


const ApiKeyModal = () => {
  // const [open, setOpen] = useState(false);
  const {
    user,
    updateApiKey,
    showApiKeyModal,
    closeApiKeyModal,
    setShowApiKeyModal,
  } = useContext(UserContext);


  // only for input field
  const [inputKey, setInputKey] = useState("");


  useEffect(() => {
    // console.log("useEffect triggered");


    if (showApiKeyModal) {
      // console.log("open is true");
      setTimeout(() => {
        setInputKey(user?.geminiKeyMasked || ""); // Initialize with an empty string if masked key is null or undefined
      }, 0);
    }
  }, [showApiKeyModal, user?.geminiKeyMasked]);


  const handleSaveApiKey = async () => {
    // console.log("handleSaveApiKey triggered with key:", inputKey);


    try {
      const response = await axiosInstance.post(API_PATHS.AI.ADD_API_KEY, {
        apiKey: inputKey,
      });


      toast.success(response.data.message);
      updateApiKey(response.data?.geminiKeyMasked);
      // setOpen(false);
      closeApiKeyModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save API key");
    }
  };


  const handleDeleteApiKey = async () => {
    try {
      await axiosInstance.delete(API_PATHS.AI.DELETE_API_KEY);


      updateApiKey(null);
      toast.success("API key removed successfully!");
      // setOpen(false);
      closeApiKeyModal();
    } catch {
      toast.error("Failed to delete API key");
    }
  };


  // console.log("Rendering ApiKeyModal with user:", user);


  return (
    <Dialog open={showApiKeyModal} onOpenChange={setShowApiKeyModal}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {user?.hasGeminiKey ? "Edit API Key" : "Add API Key"}
        </Button>
      </DialogTrigger>


      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user?.hasGeminiKey ? "Update API Key" : "Add API Key"}
          </DialogTitle>
          <DialogDescription>
            Your API key is stored securely and never shown again.
          </DialogDescription>
        </DialogHeader>


        <Input
          placeholder="Enter new API key"
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
        />


        <div className="flex justify-end gap-2">
          {user?.hasGeminiKey && (
            <Button variant="destructive" onClick={handleDeleteApiKey}>
              Remove
            </Button>
          )}
          <Button
            onClick={handleSaveApiKey}
            disabled={!inputKey || inputKey === user?.geminiKeyMasked}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default ApiKeyModal;