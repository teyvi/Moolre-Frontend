export interface MomoFormData {
  number: string;
  network: string;
  amount: string;
  description: string;
}

export interface ValidatedAccountInfo {
  accountName: string;
  accountNumber: string;
}

export interface TransferPayload {
  type: number;
  channel: number;
  currency: string;
  receiver: string;
  sublistid?: string;
  amount: number;
  externalref: string;
  reference: string;
  accountnumber: string; 
}

export interface NameValidationPayload {
  type: number;
  receiver: string;
  channel: number;
  currency: string;
 }

export interface NameValidationResponse {
  status: number | string;
  code?: string;
  message?: string;
  data?: string | { 
    accountName?: string;
    account_name?: string;
    accountNumber?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// SMS Types
export interface SMSMessage {
  recipient: string;
  message: string;
  ref?: string; // Optional unique ID for delivery tracking
}

export interface SMSPayload {
  type: number; // Always 1 for SMS
  senderid: string; // Sender ID (must be registered and approved)
  messages: SMSMessage[];
}

export interface SMSFormData {
  recipient: string;
  message: string;
  senderid: string;
}

export interface SMSResponse {
  status: number | string;
  code?: string;
  message?: string;
  data?: any;
  [key: string]: any;
}