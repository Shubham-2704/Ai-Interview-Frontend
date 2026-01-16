import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  ExternalLink,
  Video,
  Key,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const SetupGuideModal = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("video");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      step: 1,
      title: "Go to Google AI Studio",
      description: "Visit makersuite.google.com/app/apikey",
      link: "https://aistudio.google.com/api-keys",
      buttonText: "Open Google AI Studio",
    },
    {
      step: 2,
      title: "Sign in with Google",
      description: "Use your Google account to sign in",
    },
    {
      step: 3,
      title: "Create API Key",
      description: "Click 'Create API Key' → 'Create API key in new project'",
    },
    {
      step: 4,
      title: "Copy & Paste",
      description:
        "Copy the key (starts with AIza...) and paste it in Add API Key modal",
    },
  ];

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
            >
              <HelpCircle />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>How to get Gemini API Key</TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] p-0 rounded-lg overflow-hidden">
        {/* Main container with custom scrollbar */}
        <div className="h-full max-h-[90vh] overflow-y-auto custom-scrollbar p-1">
          <div className="p-5 pb-4">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                How to Get Gemini API Key
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Follow this guide to get your free Gemini API key
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger
                  value="video"
                  className="cursor-pointer text-xs sm:text-sm"
                >
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Video Guide
                </TabsTrigger>
                <TabsTrigger
                  value="steps"
                  className="cursor-pointer text-xs sm:text-sm"
                >
                  <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Step-by-Step
                </TabsTrigger>
              </TabsList>

              {/* Video Guide Tab */}
              <TabsContent value="video" className="space-y-4 mt-4">
                <div className="aspect-video w-full overflow-hidden rounded-lg border">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/RVGbLSVFtIk?si=c1s7T7IcI-8rvSEg&amp;start=19"
                    title="How to Get Gemini API Key Tutorial"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="min-h-[180px] sm:min-h-[200px]"
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() =>
                      window.open(
                        "https://www.youtube.com/watch?v=RVGbLSVFtIk&t=19s",
                        "_blank"
                      )
                    }
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() =>
                      copyToClipboard("https://aistudio.google.com/api-keys")
                    }
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied Link
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Google AI Studio Link
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Step-by-Step Tab */}
              <TabsContent value="steps" className="space-y-4 mt-4">
                <div className="space-y-3">
                  {steps.map((step) => (
                    <div
                      key={step.step}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm sm:text-base">
                        {step.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base">
                          {step.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          {step.description}
                        </p>
                        {step.link && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded w-full overflow-x-auto">
                              {step.link}
                            </code>
                            <Button
                              size="sm"
                              onClick={() => window.open(step.link, "_blank")}
                              className="h-7 sm:h-8 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Key className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm sm:text-base text-blue-900">
                        Ready to Add Key?
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-800 mt-1">
                        Once you have your API key, click "Add API Key" button
                        and enter your key.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 mt-4 border-t">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                Need more help?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-xs sm:text-sm"
                  onClick={() =>
                    window.open(
                      "https://ai.google.dev/gemini-api/docs/quickstart",
                      "_blank"
                    )
                  }
                >
                  Visit official docs
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setActiveTab(activeTab === "video" ? "steps" : "video")
                }
                className="text-xs sm:text-sm"
              >
                {activeTab === "video" ? "View Steps" : "View Video"}
              </Button>
            </div>
          </div>
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
            margin: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #d1d5db;
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #9ca3af;
          }
          .custom-scrollbar::-webkit-scrollbar-corner {
            background: transparent;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};

export default SetupGuideModal;
