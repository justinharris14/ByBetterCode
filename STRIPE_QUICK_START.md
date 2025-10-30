
# Stripe Integration Quick Start

## For Parents

### View a Receipt
1. Open the **Payments** screen
2. Find a paid payment
3. Tap **"View Receipt"** button
4. Receipt opens in browser

### Download a Receipt
1. Open the **Payments** screen
2. Find a paid payment
3. Tap **"Download"** button
4. Receipt saves to your device
5. Tap **"Open"** to view the downloaded file

### View Complete Payment History
1. Open the **Payments** screen
2. Tap **"View Stripe Payment History"** button
3. All Stripe payments load
4. View or download any receipt

## For Admins

### Add Stripe Information to a Payment
1. Open **Admin Payments**
2. Tap **"+"** to add or tap **"Edit"** on existing payment
3. Fill in basic payment details
4. Scroll to **"Stripe Integration"** section
5. Add:
   - **Stripe Payment Intent ID**: `pi_xxxxxxxxxxxxx`
   - **Stripe Charge ID**: `ch_xxxxxxxxxxxxx`
   - **Stripe Customer ID**: `cus_xxxxxxxxxxxxx`
   - **Receipt Number**: `1234-5678`
6. Tap **"Create Payment"** or **"Update Payment"**

### Where to Find Stripe IDs

#### In Stripe Dashboard:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click **Payments**
3. Click on a payment
4. Copy the IDs:
   - **Payment Intent**: Starts with `pi_`
   - **Charge**: Starts with `ch_`
   - **Customer**: Starts with `cus_`
   - **Receipt Number**: Found in receipt details

## Setup Checklist

- [ ] Set `STRIPE_API_KEY` in Supabase secrets
- [ ] Deploy `stripe-receipts` Edge Function
- [ ] Test with a Stripe test payment
- [ ] Add Stripe IDs to payment records
- [ ] Test viewing receipts
- [ ] Test downloading receipts
- [ ] Test payment history

## Common Issues

### "No receipt available"
**Solution**: Ensure the payment is completed in Stripe and has a charge_id

### "Failed to load Stripe history"
**Solution**: Check that the customer_id is correct and the Stripe API key is set

### Download fails on mobile
**Solution**: Check app permissions for file system access

### Receipt URL not working
**Solution**: Verify the Stripe charge has a receipt_url (some test charges may not)

## Testing with Stripe Test Mode

1. Use Stripe test API key: `sk_test_xxxxxxxxxxxxx`
2. Make test payments using test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
3. Test receipts will have test mode watermark
4. All test data can be cleared from Stripe Dashboard

## Quick Commands

### Set Stripe API Key (Supabase CLI)
```bash
supabase secrets set STRIPE_API_KEY=sk_test_xxxxxxxxxxxxx
```

### Test Edge Function
```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/stripe-receipts \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"action":"get_receipt","charge_id":"ch_test_xxxxx"}'
```

### View Edge Function Logs
```bash
supabase functions logs stripe-receipts
```

## Support

- **Stripe Issues**: Check [Stripe Dashboard](https://dashboard.stripe.com)
- **Edge Function Issues**: Check Supabase Edge Function logs
- **App Issues**: Check app console logs

## Next Steps

1. ✅ Set up Stripe API key
2. ✅ Test with a payment
3. ✅ Add Stripe IDs to payments
4. ✅ Test receipt viewing
5. ✅ Test receipt downloading
6. 🔄 Implement webhook integration (optional)
7. 🔄 Add email receipt functionality (optional)

---

**Need Help?** Check the full [Stripe Integration Guide](./STRIPE_INTEGRATION_GUIDE.md) for detailed information.
