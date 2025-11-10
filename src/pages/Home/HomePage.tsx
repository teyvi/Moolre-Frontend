import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useTransfer } from "@/hooks/useTransfer";
import { useNameValidation } from "@/hooks/useNameValidation";
import { useSendSMS } from "@/hooks/useSendSMS";
import { generateExternalRef, getChannelFromNetwork } from "@/lib/utils";
import type { MomoFormData, ValidatedAccountInfo, SMSFormData } from "@/types";

type Screen =
  | "home"
  | "payment-type"
  | "bank-type"
  | "momo-form"
  | "validation"
  | "summary"
  | "success"
  | "error"
  | "sms-form"
  | "sms-success"
  | "sms-error";

const PaymentApp = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [bankType, setBankType] = useState<string>("");
  const [formData, setFormData] = useState<MomoFormData>({
    number: "",
    network: "",
    amount: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<MomoFormData>>({});
  const [transferError, setTransferError] = useState<string>("");
  const [validatedAccount, setValidatedAccount] =
    useState<ValidatedAccountInfo | null>(null);

  // SMS state
  const [smsFormData, setSmsFormData] = useState<SMSFormData>({
    recipient: "",
    message: "",
    senderid: "Moolre", // Default sender ID
  });


  const [smsErrors, setSmsErrors] = useState<Partial<SMSFormData>>({});
  const [smsError, setSmsError] = useState<string>("");

  const transferMutation = useTransfer();
  const nameValidationMutation = useNameValidation();
  const smsMutation = useSendSMS();

  const resetApp = () => {
    setCurrentScreen("home");
    setPaymentMethod("");
    setBankType("");
    setFormData({ number: "", network: "", amount: "", description: "" });
    setErrors({});
    setTransferError("");
    setValidatedAccount(null);
    transferMutation.reset();
    nameValidationMutation.reset();
    
    // Reset SMS state
    setSmsFormData({ recipient: "", message: "", senderid: "Moolre" });
    setSmsErrors({});
    setSmsError("");
    smsMutation.reset();
  };

  //input validations
  const validateForm = (): boolean => {
    const newErrors: Partial<MomoFormData> = {};

    if (!formData.number || !/^\d{10}$/.test(formData.number)) {
      newErrors.number = "Please enter a valid 10-digit phone number";
    }

    if (!formData.network) {
      newErrors.network = "Please select a network";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please enter a description";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMomoSubmit = async () => {
    if (validateForm()) {
      try {
        setTransferError("");

        // Prepare validation payload
        const validationPayload = {
          type: 1,
          receiver: formData.number,
          channel: getChannelFromNetwork(formData.network),
          currency: "GHS",
          accountnumber: import.meta.env.VITE_ACCOUNTNUMBER,
        };

        // Show validation screen while validating
        setCurrentScreen("validation");
        // Call name validation API
        const validationResult = await nameValidationMutation.mutateAsync(
          validationPayload
        );
 
        // Check for successful validation - backend returns status: 1 for success
        if (validationResult.status === 1 || validationResult.status === "1") {
          // Extract account name from the response data
          let accountName = "Account Holder";
          
          if (validationResult.data) {
            if (typeof validationResult.data === "string") {
              // If data is a string, it contains the account name directly
              accountName = validationResult.data;
            } else if (typeof validationResult.data === "object") {
              // If data is an object, extract accountName property
              accountName = validationResult.data.accountName || validationResult.data.account_name || "Account Holder";
            }
          }

          // Store validated account info
          setValidatedAccount({
            accountName: accountName,
            accountNumber: formData.number,
          });

          // Proceed to summary
          setCurrentScreen("summary");
        } else {
          setTransferError(
            validationResult.message || "Account validation failed"
          );
          setCurrentScreen("error");
        }
      } catch (error) {
        console.error("Validation failed:", error);
        setTransferError(
          "Failed to validate account. Please check the details and try again."
        );
        setCurrentScreen("error");
      }
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setTransferError("");
      const payload = {
        type: 1,
        channel: getChannelFromNetwork(formData.network),
        currency: "GHS",
        receiver: formData.number,
        amount: parseFloat(formData.amount),
        externalref: generateExternalRef(),
        reference: formData.description,
        accountnumber: import.meta.env.VITE_ACCOUNTNUMBER,
      };

       const result = await transferMutation.mutateAsync(payload);
      
      // Check if the transfer was actually successful
      if (result.status === 1 || result.status === "1") {
        setCurrentScreen("success");
      } else {
         setTransferError(
          result.message || `Transfer failed with code: ${result.code || 'unknown'}`
        );
        setCurrentScreen("error");
      }
    } catch (error) {
      console.error("Transfer failed:", error);
      setTransferError("Payment failed. Please try again.");
      setCurrentScreen("error");
    }
  };

  const handleSMSSend = async () => {
    // Reset errors
    setSmsErrors({});
    setSmsError("");

    // Validate form
    const newErrors: Partial<SMSFormData> = {};

    if (!smsFormData.senderid.trim()) {
      newErrors.senderid = "Sender ID is required";
    }

    if (!smsFormData.recipient.trim()) {
      newErrors.recipient = "Recipient phone number is required";
    } else if (!/^\d{10,15}$/.test(smsFormData.recipient.replace(/[^0-9]/g, ''))) {
      newErrors.recipient = "Please enter a valid phone number";
    }

    if (!smsFormData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (smsFormData.message.length > 160) {
      newErrors.message = "Message must not exceed 160 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setSmsErrors(newErrors);
      return;
    }

    try {
      const payload = {
        type: 1,
        senderid: smsFormData.senderid,
        messages: [
          {
            recipient: smsFormData.recipient,
            message: smsFormData.message,
            ref: `sms-${Date.now()}`, // Unique reference
          },
        ],
      };

       const result = await smsMutation.mutateAsync(payload);

      // Check if SMS was sent successfully
      if (result.status === 1 || result.status === "1") {
        setCurrentScreen("sms-success");
      } else {
        // Backend returned an error status
        setSmsError(
          result.message || `SMS failed with code: ${result.code || 'unknown'}`
        );
        setCurrentScreen("sms-error");
      }
    } catch (error) {
      console.error("SMS send failed:", error);
      setSmsError("Failed to send SMS. Please try again.");
      setCurrentScreen("sms-error");
    }
  };

   // Home Screen
  if (currentScreen === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Choose an action to get started</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setCurrentScreen("payment-type")}
              className="h-32 flex flex-col gap-3"
              variant="outline"
            >
              <CreditCard className="w-12 h-12" />
              <span className="text-lg">Make Payment</span>
            </Button>
            <Button
              onClick={() => setCurrentScreen("sms-form")}
              className="h-32 flex flex-col gap-3"
              variant="outline"
            >
              <MessageSquare className="w-12 h-12" />
              <span className="text-lg">Send SMS</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment Type Selection
  if (currentScreen === "payment-type") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Select Payment Method</CardTitle>
            <CardDescription>
              Choose how you want to make your payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setPaymentMethod("momo");
                setCurrentScreen("momo-form");
              }}
              className="w-full h-24 flex items-center justify-center gap-4 text-lg"
              variant="outline"
            >
              <Smartphone className="w-10 h-10" />
              Mobile Money
            </Button>
            <Button onClick={resetApp} variant="ghost" className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile Money Form
  if (currentScreen === "momo-form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Mobile Money Payment</CardTitle>
            <CardDescription>Enter payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="number">Phone Number</Label>
              <Input
                id="number"
                placeholder="0241234567"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                maxLength={10}
              />
              {errors.number && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.number}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select
                value={formData.network}
                onValueChange={(value) =>
                  setFormData({ ...formData, network: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN</SelectItem>
                  <SelectItem value="vodafone">Vodafone</SelectItem>
                  <SelectItem value="airteltigo">AirtelTigo</SelectItem>
                </SelectContent>
              </Select>
              {errors.network && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.network}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (GHS)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                min="0"
                step="0.01"
              />
              {errors.amount && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.amount}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Payment for..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
              {errors.description && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.description}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setCurrentScreen("payment-type")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handleMomoSubmit} className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validation Screen
  if (currentScreen === "validation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Validating Account
              </h2>
              <p className="text-gray-600">
                Please wait while we verify the account details for{" "}
                {formData.number}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Summary Screen
  if (currentScreen === "summary") {
    // Debug log to see what data we have
     
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Summary</CardTitle>
            <CardDescription>
              Please review your payment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {validatedAccount && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Account Verified
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Sending to:{" "}
                  <span className="font-semibold">
                    {validatedAccount.accountName}
                  </span>
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-6 rounded-lg space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Transfer Amount</p>
                <p className="text-3xl font-bold text-blue-600">
                  GHS {parseFloat(formData.amount).toFixed(2)}
                </p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-semibold">{formData.number}</span>
                </div>
                {validatedAccount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-semibold text-green-600">
                      {validatedAccount.accountName}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-semibold capitalize">
                    {formData.network}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-semibold text-right max-w-[200px]">
                    {formData.description}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentScreen("momo-form")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleFinalSubmit}
                className="flex-1"
                disabled={transferMutation.isPending}
              >
                {transferMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Payment"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success Screen
  if (currentScreen === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600">
                Your payment of GHS {parseFloat(formData.amount).toFixed(2)} has
                been sent to {formData.number}
              </p>
            </div>
            <Button onClick={resetApp} className="w-full">
              Make Another Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error Screen
  if (currentScreen === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-4xl">✕</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600">
                {transferError ||
                  "Something went wrong with your payment. Please try again."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentScreen("momo-form")}
                variant="outline"
                className="flex-1"
                disabled={nameValidationMutation.isPending}
              >
                Edit Details
              </Button>
              <Button onClick={resetApp} className="flex-1">
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SMS Form Screen
  if (currentScreen === "sms-form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Send SMS
            </CardTitle>
            <CardDescription>Send a message to any phone number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="senderid">Sender ID</Label>
              <Input
                id="senderid"
                type="text"
                placeholder="Your registered sender ID"
                value={smsFormData.senderid}
                onChange={(e) =>
                  setSmsFormData({ ...smsFormData, senderid: e.target.value })
                }
                className={smsErrors.senderid ? "border-red-500" : ""}
              />
              {smsErrors.senderid && (
                <p className="text-sm text-red-500 mt-1">{smsErrors.senderid}</p>
              )}
            </div>

            <div>
              <Label htmlFor="recipient">Recipient Phone Number</Label>
              <Input
                id="recipient"
                type="tel"
                placeholder="e.g., 233501234567"
                value={smsFormData.recipient}
                onChange={(e) =>
                  setSmsFormData({ ...smsFormData, recipient: e.target.value })
                }
                className={smsErrors.recipient ? "border-red-500" : ""}
              />
              {smsErrors.recipient && (
                <p className="text-sm text-red-500 mt-1">{smsErrors.recipient}</p>
              )}
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                rows={4}
                maxLength={160}
                placeholder="Enter your message (max 160 characters)"
                value={smsFormData.message}
                onChange={(e) =>
                  setSmsFormData({ ...smsFormData, message: e.target.value })
                }
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  smsErrors.message ? "border-red-500" : ""
                }`}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                {smsErrors.message && (
                  <span className="text-red-500">{smsErrors.message}</span>
                )}
                <span className="ml-auto">
                  {smsFormData.message.length}/160
                </span>
              </div>
            </div>

            {smsError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{smsError}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentScreen("home")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSMSSend}
                className="flex-1"
                disabled={smsMutation.isPending}
              >
                {smsMutation.isPending ? "Sending..." : "Send SMS"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SMS Success Screen
  if (currentScreen === "sms-success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-500 text-4xl">✓</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                SMS Sent Successfully!
              </h2>
              <p className="text-gray-600">
                Your message has been sent to {smsFormData.recipient}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentScreen("sms-form")}
                variant="outline"
                className="flex-1"
              >
                Send Another
              </Button>
              <Button onClick={resetApp} className="flex-1">
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SMS Error Screen
  if (currentScreen === "sms-error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-4xl">✕</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                SMS Failed
              </h2>
              <p className="text-gray-600">
                {smsError ||
                  "Something went wrong while sending your SMS. Please try again."}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentScreen("sms-form")}
                variant="outline"
                className="flex-1"
                disabled={smsMutation.isPending}
              >
                Edit Message
              </Button>
              <Button onClick={resetApp} className="flex-1">
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default PaymentApp;
