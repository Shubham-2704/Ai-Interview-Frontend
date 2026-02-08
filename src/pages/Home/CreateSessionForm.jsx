import React, { useContext, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sessionSchema } from "@/lib/schema";
import { toast as hotToast } from "react-hot-toast";
import { UserContext } from "@/context/UserContext";

const CreateSessionForm = () => {
  const [loading, setLoading] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(10); // State for questions count
  const [loadingQuestionsCount, setLoadingQuestionsCount] = useState(false); // Loading state for fetching count

  const { user, openApiKeyModal } = useContext(UserContext);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      role: "",
      experience: "",
      topicsToFocus: "",
      description: "",
    },
  });

  // Fetch questions count from settings when component mounts
  useEffect(() => {
    const fetchQuestionsCount = async () => {
      setLoadingQuestionsCount(true);
      try {
        const response = await axiosInstance.get(
          API_PATHS.SETTINGS.PUBLIC_QUESTIONS_COUNT,
        );
        if (response.data.success) {
          setQuestionsCount(response.data.number_of_questions);
        }
      } catch (error) {
        // Keep default 10 if fetch fails
        hotToast.error("Failed to load session", { position: "bottom-right" });
      } finally {
        setLoadingQuestionsCount(false);
      }
    };

    fetchQuestionsCount();
  }, []);

  async function onSubmit(data) {
    if (!user?.hasGeminiKey) {
      openApiKeyModal();
      return;
    }

    setLoading(true);
    try {
      // Call AI API to generate questions using the count from settings
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: data.role,
          experience: data.experience,
          topicsToFocus: data.topicsToFocus,
          numberOfQuestions: questionsCount, // Use dynamic count from settings
        },
      );

      // Should be an array like [{question, answer}, ...]
      const generatedQuestions = aiResponse.data;

      const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
        ...data,
        questions: generatedQuestions,
      });

      if (response.data?.session?._id) {
        navigate(`/interview-prep/${response.data.session._id}`);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        hotToast.error(error.response.data.message, { position: "bottom-right" });
      } else {
        hotToast.error("Something went wrong. Please try again.", { position: "bottom-right" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="role"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Target Role *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="(e.g., Frontend Developer, UI/UX Designer, etc.)"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="experience"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Years of Experience *
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="(e.g., 1 year, 2 years, 5+ years)"
                  type={"number"}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="topicsToFocus"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Topics to Focus On *
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="(Comma-separated, e.g, React, Node.js, MongoDB)"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  placeholder="(Any specific goals or notes for this session)"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            className="bg-black hover:bg-primary hover:text-primary-foreground transition-colors"
            disabled={loading || loadingQuestionsCount} // Disable if loading questions count
          >
            {loading ? (
              <>
                <Spinner />
                Creating Session...
              </>
            ) : loadingQuestionsCount ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading Settings...
              </>
            ) : (
              "Create Session"
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
};

export default CreateSessionForm;