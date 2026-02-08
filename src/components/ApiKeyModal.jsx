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
import {
  AlertCircle,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";
import { UserContext } from "@/context/UserContext";
import { toast as hotToast } from "react-hot-toast";
import { Spinner } from "./ui/spinner";

const ApiKeyModal = () => {
  const {
    user,
    updateApiKey,
    showApiKeyModal,
    closeApiKeyModal,
    setShowApiKeyModal,
  } = useContext(UserContext);

  const [inputKey, setInputKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (showApiKeyModal) {
      setTimeout(() => {
        setInputKey(user?.geminiKeyMasked || "");
      }, 0);
    }
  }, [showApiKeyModal, user?.geminiKeyMasked]);

  const handleSaveApiKey = async () => {
    if (!inputKey) return;

    try {
      setSaving(true);{ position: "bottom-right" }
      const response = await axiosInstance.post(API_PATHS.AI.ADD_API_KEY, {
        apiKey: inputKey,
      });
      hotToast.success(response.data.message, { position: "top-center" });
      updateApiKey(response.data?.geminiKeyMasked);
      closeApiKeyModal();
    } catch (error) {
      hotToast.error(error.response?.data?.message || "Failed to save API key", { position: "bottom-center" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    try {
      setDeleting(true);
      const response = await axiosInstance.delete(API_PATHS.AI.DELETE_API_KEY);
      updateApiKey(null);
      hotToast.success(response.data?.message, { position: "top-center" });
      closeApiKeyModal();
    } catch {
      hotToast.error("Failed to delete API key", { position: "bottom-center" });
    } finally {
      setDeleting(false);
    }
  };

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
          <DialogDescription className="flex items-center gap-1">
            <span>Your API key is stored securely and never shown again.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="api-key" className="text-sm">
              Enter your API key (starts with AIza...)
            </Label>
            <Input
              id="api-key"
              placeholder="Paste your Gemini API key here"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the API key you copied from Google AI Studio
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Don't have a key?</p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs"
                  onClick={() => window.open("https://aistudio.google.com/api-keys", '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Get your free Gemini API key
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {user?.hasGeminiKey && (
            <Button
              variant="destructive"
              onClick={handleDeleteApiKey}
              disabled={deleting}
            >
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