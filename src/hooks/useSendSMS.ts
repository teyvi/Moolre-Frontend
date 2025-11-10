import { useMutation } from "@tanstack/react-query";
import { apiClient } from '@/lib/api';
import type { SMSPayload, SMSResponse } from "@/types";

export const useSendSMS = () => {
  return useMutation<SMSResponse, any, SMSPayload>({
    mutationFn: async (payload: SMSPayload) => {
      try {
        const { data } = await apiClient.post('/api/moorle/sms/send', payload);
        return data;
      } catch (error: any) {
        // Enhanced error extraction for SMS
        console.error('Raw SMS error:', error);
        
        let enhancedError = {
          message: 'SMS sending failed',
          originalError: error
        };

        if (error.response?.data) {
          // Backend returned structured error
          const backendError = error.response.data;
          enhancedError = {
            message: backendError.message || backendError.error || 'SMS sending failed',
            originalError: error
          };
        } else if (error.message) {
          // Network or client-side error
          enhancedError.message = error.message;
        }

        console.error('Enhanced SMS error:', enhancedError);
        throw enhancedError;
      }
    },
    onError: (error: any) => {
      console.error('SMS sending failed with details:', {
        message: error.message,
        originalError: error.originalError
      });
    },
    onSuccess: (data) => {
      console.log('SMS sent successfully:', data);
      // Log if this is actually a backend error disguised as success
      if (data.status === 0 || data.status === "0") {
        console.error('SMS succeeded but backend returned error status:', data);
      }
    }
  });
};