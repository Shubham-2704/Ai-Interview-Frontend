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
import { Spinner } from "./ui/spinner";


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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);


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
  if (!inputKey) return;

  try {
    setSaving(true);

    const response = await axiosInstance.post(API_PATHS.AI.ADD_API_KEY, {
      apiKey: inputKey,
    });

    toast.success(response.data.message);
    updateApiKey(response.data?.geminiKeyMasked);
    closeApiKeyModal();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to save API key");
  } finally {
    setSaving(false);
  }
};



  const handleDeleteApiKey = async () => {
    try {
      setDeleting(true);
      await axiosInstance.delete(API_PATHS.AI.DELETE_API_KEY);


      updateApiKey(null);
      toast.success("API key removed successfully!");
      // setOpen(false);
      closeApiKeyModal();
    } catch {
      toast.error("Failed to delete API key");
    }
    finally {
      setDeleting(false);
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
            <Button variant="destructive" onClick={handleDeleteApiKey} disabled={deleting}>
              {deleting ? (
                <>
                  <Spinner />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          )}
          <Button
            onClick={handleSaveApiKey}
            disabled={saving || !inputKey || inputKey === user?.geminiKeyMasked}
          >
           {saving ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : (
            "Save"
          )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default ApiKeyModal;