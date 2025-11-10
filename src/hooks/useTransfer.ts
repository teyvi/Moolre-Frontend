import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { TransferPayload } from "@/types";

export const useTransfer = () => {
  return useMutation({
    mutationFn: async (payload: TransferPayload) => {
      const { data } = await apiClient.post("/api/moorle/sendmoney", payload);
      return data;
    },
    onError: (error: any) => {
      console.error("Transfer failed:", error);
      // Also log the full error
      if (error?.response?.data) {
        console.error("Backend error response:", error.response.data);
      }
    },
    onSuccess: (data) => {
      console.log("Transfer successful:", data);
      // Log if this is actually a backend error disguised as success
      if (data.status === 0 || data.code?.includes("AIN")) {
        console.error(
          "Transfer succeeded but backend returned error status:",
          data
        );
      }
    },
  });
};
