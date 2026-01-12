import { useState, useCallback } from "react";
import { toast } from "sonner";
import axiosInstance from "@/utils/axiosInstance";
import { API_PATHS } from "@/utils/apiPaths";

export const useStudyMaterials = () => {
  const [studyMaterials, setStudyMaterials] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudyMaterials = useCallback(
    async (questionId, questionText, forceRefresh = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.post(
          API_PATHS.AI.GET_STUDY_MATERIALS(questionId),
          {
            question: questionText,
            force_refresh: forceRefresh,
          }
        );

        if (response.data) {
          setStudyMaterials(response.data);
          return response.data;
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch study materials"
        );
        toast.error("Failed to fetch study materials");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refreshStudyMaterials = useCallback(async (materialId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.STUDY_MATERIALS.REFRESH(materialId)
      );

      if (response.data) {
        setStudyMaterials(response.data);
        toast.success("Study materials refreshed!");
        return response.data;
      }
    } catch (err) {
      toast.error("Failed to refresh study materials");
      throw err;
    }
  }, []);

  const deleteStudyMaterials = useCallback(async (materialId) => {
    try {
      await axiosInstance.delete(API_PATHS.STUDY_MATERIALS.DELETE(materialId));

      setStudyMaterials(null);
      toast.success("Study materials deleted!");
    } catch (err) {
      toast.error("Failed to delete study materials");
      throw err;
    }
  }, []);

  const clearStudyMaterials = useCallback(() => {
    setStudyMaterials(null);
    setError(null);
  }, []);

  return {
    studyMaterials,
    isLoading,
    error,
    fetchStudyMaterials,
    refreshStudyMaterials,
    deleteStudyMaterials,
    clearStudyMaterials,
  };
};
