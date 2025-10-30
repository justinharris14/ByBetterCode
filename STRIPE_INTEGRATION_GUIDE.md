
# Stripe API Integration Guide

## Overview

The CrècheConnect app now integrates with Stripe API to provide comprehensive payment receipt management and payment history tracking. This integration allows parents to:

- View payment receipts directly from Stripe
- Download receipts for their records
- Access complete payment history from Stripe
- Track payment status in real-time

## Features Implemented

### 1. **Stripe Edge Function** (`stripe-receipts`)

A Supabase Edge Function that interfaces with the Stripe API to:

- **Get Receipt**: Retrieve receipt details for a specific charge or payment intent
- **List Payments**: Get all payments for a customer
- **Get Payment History**: Retrieve complete payment history with receipt information

#### Edge Function Actions:

```typescript
// Get a specific receipt
{
  action: 'get_receipt',
  charge_id: 'ch_xxxxx' // or payment_intent_id
}

// List all payments for a customer
{
  action: 'list_payments',
  customer_id: 'cus_xxxxx',
  limit: 10
}

// Get complete payment history
{
  action: 'get_payment_history',
  customer_id: 'cus_xxxxx',
  limit: 20
}
```

### 2. **Database Schema Updates**

Added Stripe-related fields to the `payments` table:

- `stripe_payment_intent_id`: Stripe Payment Intent ID
- `stripe_charge_id`: Stripe Charge ID for receipt retrieval
- `stripe_customer_id`: Stripe Customer ID for the parent
- `receipt_number`: Stripe receipt number

### 3. **Parent Payment Screen Enhancements**

#### View Receipts
- Parents can view receipts in-app using an in-app browser
- Automatically fetches receipt from Stripe if not cached locally
- Updates local database with receipt URL for faster future access

#### Download Receipts
- **Mobile**: Downloads receipt PDF to device's document directory
- **Web**: Opens receipt in a new browser tab
- Provides option to open downloaded file immediately

#### Stripe Payment History
- Toggle button to view complete Stripe payment history
- Shows all payments from Stripe with:
  - Payment amount and currency
  - Payment status (succeeded, processing, failed)
  - Payment date
  - Receipt number
  - Payment Intent ID
- Each payment has view and download receipt buttons

### 4. **Admin Payment Management**

Admins can now:
- Add Stripe Payment Intent ID when creating/editing payments
- Add Stripe Charge ID for receipt tracking
- Add Stripe Customer ID for payment history
- Add receipt numbers for better tracking
- View Stripe-related information on payment cards

## Setup Instructions

### 1. Configure Stripe API Key

You need to set the `STRIPE_API_KEY` environment variable in your Supabase project:

```bash
# Using Supabase CLI
supabase secrets set STRIPE_API_KEY=sk_test_xxxxxxxxxxxxx

# Or via Supabase Dashboard
# Go to Project Settings > Edge Functions > Secrets
# Add: STRIPE_API_KEY = sk_test_xxxxxxxxxxxxx
```

### 2. Get Stripe Customer ID

When a parent makes their first payment through Stripe:

1. Stripe creates a Customer object
2. Store the Customer ID in your database
3. Link it to the parent's user record

Example webhook handler (to be implemented):

```typescript
// Handle Stripe webhook for successful payment
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object;
  
  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'paid',
      payment_date: new Date().toISOString(),
      stripe_payment_intent_id: paymentIntent.id,
      stripe_charge_id: paymentIntent.latest_charge,
      stripe_customer_id: paymentIntent.customer,
      receipt_url: charge.receipt_url,
      receipt_number: charge.receipt_number,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);
}
```

### 3. Link Payments to Stripe

When creating a payment record after a Stripe checkout:

```typescript
const payment = {
  parent_id: user.user_id,
  amount: 1500,
  payment_type: 'Tuition Fee',
  status: 'paid',
  payment_date: new Date().toISOString(),
  stripe_payment_intent_id: 'pi_xxxxx',
  stripe_charge_id: 'ch_xxxxx',
  stripe_customer_id: 'cus_xxxxx',
};

await supabase.from('payments').insert([payment]);
```

## Usage Examples

### Parent: View Receipt

1. Navigate to Payments screen
2. Find a paid payment
3. Tap "View Receipt" button
4. Receipt opens in in-app browser

### Parent: Download Receipt

1. Navigate to Payments screen
2. Find a paid payment
3. Tap "Download" button
4. Receipt downloads to device
5. Option to open immediately

### Parent: View Stripe Payment History

1. Navigate to Payments screen
2. Tap "View Stripe Payment History" button
3. Complete payment history loads from Stripe
4. View/download any receipt

### Admin: Add Stripe Information

1. Navigate to Admin Payments
2. Create or edit a payment
3. Scroll to "Stripe Integration" section
4. Add:
   - Stripe Payment Intent ID
   - Stripe Charge ID
   - Stripe Customer ID
   - Receipt Number
5. Save payment

## API Reference

### Stripe Edge Function Endpoint

```
POST https://[your-project-ref].supabase.co/functions/v1/stripe-receipts
```

#### Headers
```
Authorization: Bearer [anon-key]
Content-Type: application/json
```

#### Request Body Examples

**Get Receipt:**
```json
{
  "action": "get_receipt",
  "charge_id": "ch_3xxxxxxxxxxxxx"
}
```

**List Payments:**
```json
{
  "action": "list_payments",
  "customer_id": "cus_xxxxxxxxxxxxx",
  "limit": 10
}
```

**Get Payment History:**
```json
{
  "action": "get_payment_history",
  "customer_id": "cus_xxxxxxxxxxxxx",
  "limit": 20
}
```

#### Response Examples

**Get Receipt Response:**
```json
{
  "receipt_url": "https://pay.stripe.com/receipts/...",
  "receipt_number": "1234-5678",
  "amount": 150000,
  "currency": "zar",
  "status": "succeeded",
  "created": 1705234567,
  "description": "Tuition Fee",
  "payment_method_details": { ... }
}
```

**Payment History Response:**
```json
{
  "history": [
    {
      "payment_intent_id": "pi_xxxxxxxxxxxxx",
      "amount": 150000,
      "currency": "zar",
      "status": "succeeded",
      "created": 1705234567,
      "description": "Tuition Fee",
      "receipt_url": "https://pay.stripe.com/receipts/...",
      "receipt_number": "1234-5678",
      "payment_method": "pm_xxxxxxxxxxxxx",
      "charge_id": "ch_xxxxxxxxxxxxx"
    }
  ]
}
```

## Security Considerations

1. **API Key Protection**: The Stripe API key is stored as a Supabase secret and never exposed to the client
2. **CORS Headers**: Edge function includes proper CORS headers for security
3. **Authentication**: Edge function uses Supabase JWT verification
4. **Data Validation**: All inputs are validated before making Stripe API calls

## Error Handling

The integration includes comprehensive error handling:

- Invalid or missing parameters
- Stripe API errors
- Network errors
- File download errors
- Receipt not available errors

All errors are logged and user-friendly messages are displayed.

## Testing

### Test the Edge Function

```bash
# Using curl
curl -X POST https://[your-project-ref].supabase.co/functions/v1/stripe-receipts \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_receipt",
    "charge_id": "ch_test_xxxxxxxxxxxxx"
  }'
```

### Test in the App

1. Create a test payment in Stripe
2. Add the Stripe IDs to a payment record
3. Try viewing and downloading the receipt
4. Check the Stripe payment history

## Troubleshooting

### Receipt Not Available
- Ensure the payment has been completed in Stripe
- Check that the charge_id or payment_intent_id is correct
- Verify the Stripe API key is set correctly

### Download Fails
- Check file system permissions on mobile
- Verify the receipt URL is accessible
- Check network connectivity

### Stripe History Empty
- Ensure the customer_id is correct
- Verify the customer has payments in Stripe
- Check the Stripe API key has proper permissions

## Future Enhancements

Potential improvements:

1. **Webhook Integration**: Automatically update payment records when Stripe webhooks fire
2. **Bulk Receipt Download**: Download multiple receipts at once
3. **Email Receipts**: Send receipts via email
4. **Receipt Search**: Search receipts by date, amount, or description
5. **Payment Analytics**: Show payment trends and statistics from Stripe data

## Support

For issues or questions:
- Check Supabase Edge Function logs
- Review Stripe Dashboard for payment details
- Check app console logs for errors
- Verify all Stripe IDs are correct

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [expo-file-system Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)
