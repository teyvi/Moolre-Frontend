import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea} from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, MessageSquare, Smartphone, Building2, Globe2, CheckCircle2 } from 'lucide-react';

type Screen = 'home' | 'payment-type' | 'bank-type' | 'momo-form' | 'summary' | 'success';

interface MomoFormData {
  number: string;
  network: string;
  amount: string;
  description: string;
}

const PaymentApp = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [bankType, setBankType] = useState<string>('');
  const [formData, setFormData] = useState<MomoFormData>({
    number: '',
    network: '',
    amount: '',
    description: ''
  });
  const [errors, setErrors] = useState<Partial<MomoFormData>>({});

  const resetApp = () => {
    setCurrentScreen('home');
    setPaymentMethod('');
    setBankType('');
    setFormData({ number: '', network: '', amount: '', description: '' });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MomoFormData> = {};
    
    if (!formData.number || !/^\d{10}$/.test(formData.number)) {
      newErrors.number = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.network) {
      newErrors.network = 'Please select a network';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMomoSubmit = () => {
    if (validateForm()) {
      setCurrentScreen('summary');
    }
  };

  const handleFinalSubmit = () => {
    setCurrentScreen('success');
  };

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Choose an action to get started</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setCurrentScreen('payment-type')}
              className="h-32 flex flex-col gap-3"
              variant="outline"
            >
              <CreditCard className="w-12 h-12" />
              <span className="text-lg">Make Payment</span>
            </Button>
            <Button
              onClick={() => alert('SMS feature coming soon!')}
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
  if (currentScreen === 'payment-type') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Select Payment Method</CardTitle>
            <CardDescription>Choose how you want to make your payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setPaymentMethod('momo');
                setCurrentScreen('momo-form');
              }}
              className="w-full h-24 flex items-center justify-center gap-4 text-lg"
              variant="outline"
            >
              <Smartphone className="w-10 h-10" />
              Mobile Money
            </Button>
            <Button
              onClick={() => {
                setPaymentMethod('bank');
                setCurrentScreen('bank-type');
              }}
              className="w-full h-24 flex items-center justify-center gap-4 text-lg"
              variant="outline"
            >
              <Building2 className="w-10 h-10" />
              Bank Transfer
            </Button>
            <Button onClick={resetApp} variant="ghost" className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bank Type Selection
  if (currentScreen === 'bank-type') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Select Bank Transfer Type</CardTitle>
            <CardDescription>Choose local or international transfer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setBankType('local');
                alert('Local bank transfer feature coming soon!');
              }}
              className="w-full h-24 flex items-center justify-center gap-4 text-lg"
              variant="outline"
            >
              <Building2 className="w-10 h-10" />
              Local Transfer
            </Button>
            <Button
              onClick={() => {
                setBankType('international');
                alert('International bank transfer feature coming soon!');
              }}
              className="w-full h-24 flex items-center justify-center gap-4 text-lg"
              variant="outline"
            >
              <Globe2 className="w-10 h-10" />
              International Transfer
            </Button>
            <Button onClick={() => setCurrentScreen('payment-type')} variant="ghost" className="w-full">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mobile Money Form
  if (currentScreen === 'momo-form') {
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
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
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
              <Select value={formData.network} onValueChange={(value) => setFormData({ ...formData, network: value })}>
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              {errors.description && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.description}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setCurrentScreen('payment-type')} variant="outline" className="flex-1">
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

  // Summary Screen
  if (currentScreen === 'summary') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Summary</CardTitle>
            <CardDescription>Please review your payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Transfer Amount</p>
                <p className="text-3xl font-bold text-blue-600">GHS {parseFloat(formData.amount).toFixed(2)}</p>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <span className="font-semibold">{formData.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-semibold capitalize">{formData.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-semibold text-right max-w-[200px]">{formData.description}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setCurrentScreen('momo-form')} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleFinalSubmit} className="flex-1">
                Submit Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success Screen
  if (currentScreen === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600">
                Your payment of GHS {parseFloat(formData.amount).toFixed(2)} has been sent to {formData.number}
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

  return null;
};

export default PaymentApp;