import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { NameValidationPayload, NameValidationResponse } from "@/types";

export const useNameValidation = () => {
  return useMutation<NameValidationResponse, Error, NameValidationPayload>({
    mutationFn: async (payload: NameValidationPayload) => {
      const { data } = await apiClient.post("/api/moorle/validate", payload);
      return data;
    },
    onError: (error) => {
      console.error("Name validation failed:", error);
    },
    onSuccess: (data) => {
      console.log("Name validation successful:", data);
    },
  });
};
