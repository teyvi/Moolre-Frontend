# Moorle Frontend - Send Money Integration

## Overview
The frontend has been successfully integrated with the backend APIs:
- **Name Validation**: `http://localhost:3000/api/moorle/validate` 
- **Send Money**: `http://localhost:3000/api/moorle/sendmoney`

## Features Implemented

### 1. API Integration
- **Validation Endpoint**: `http://localhost:3000/api/moorle/validate`
- **Send Money Endpoint**: `http://localhost:3000/api/moorle/sendmoney`
- **Configuration**: Located in `/src/lib/api.ts`
- **Hooks**: 
  - `useNameValidation` hook in `/src/hooks/useNameValidation.ts`
  - `useTransfer` hook in `/src/hooks/useTransfer.ts`

### 2. Payment Flow
1. **Home Screen**: Choose "Make Payment"
2. **Payment Type**: Select "Mobile Money"
3. **Form Entry**: Fill payment details
   - Phone Number (10 digits)
   - Network (MTN, Vodafone, AirtelTigo)
   - Amount (GHS)
   - Description
4. **Name Validation**: API call to validate account
   - Loading screen during validation
   - Error handling if validation fails
5. **Summary**: Review payment details with validated account name
   - Shows verified account holder name
   - Green verification badge
6. **Payment Processing**: API call to send money
7. **Success/Error**: Result feedback

### 3. API Payload Mappings

#### Name Validation Payload:
```typescript
{
  type: 1, // Mobile money type
  receiver: '0241234567', // Phone number
  channel: 1|2|3, // Network specific (MTN=1, Vodafone=2, AirtelTigo=3)
  currency: 'GHS',
  accountnumber: '0241234567' // Same as receiver for mobile money
}
```

#### Send Money Payload:
```typescript
{
  type: 1, // Mobile money type
  channel: 1|2|3, // Network specific (MTN=1, Vodafone=2, AirtelTigo=3)
  currency: 'GHS',
  receiver: '0241234567', // Phone number
  amount: 50.00,
  externalref: 'MOORLE_timestamp_random', // Auto-generated
  reference: 'Payment description',
  accountnumber: '0241234567' // Same as receiver for mobile money
}
```
```

### 4. Error Handling
- Network timeouts (30s)
- Server errors (404, 500)
- Connection issues
- Account validation failures
- Payment processing errors
- Custom error messages
- Retry functionality

## Usage

### Starting the Application
```bash
npm run dev
```

### Backend Requirements
Ensure your backend is running on `http://localhost:3000` with both endpoints available:
- `/api/moorle/validate` - For account name validation
- `/api/moorle/sendmoney` - For processing payments

### Testing the Integration
1. Fill out the mobile money form with valid data
2. Submit form → Name validation screen appears
3. If validation succeeds → Summary page with account holder name
4. Click "Submit Payment" → Payment processing
5. Check browser console for API request/response logs
6. Verify both validation and payment were processed successfully

## Files Modified
- `/src/hooks/useNameValidation.ts` - Name validation API hook
- `/src/hooks/useTransfer.ts` - Payment API hook  
- `/src/pages/Home/HomePage.tsx` - UI integration with both APIs
- `/src/lib/api.ts` - API configuration and error handling

## Network Channel Mapping
- MTN: channel = 1
- Vodafone: channel = 2
- AirtelTigo: channel = 3

## Flow Sequence
1. **Form Submission** → Triggers name validation
2. **Name Validation** → Shows loading, validates account
3. **Validation Success** → Summary with verified account name  
4. **Payment Submission** → Processes actual money transfer
5. **Success/Error** → Final result

The integration now includes proper account verification before payment processing!