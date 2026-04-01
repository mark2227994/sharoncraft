# SharonCraft M-Pesa Setup

This project now includes a real M-Pesa STK Push integration path using Supabase Edge Functions.

## What was added

- `supabase/functions/mpesa-stk-push`
  Starts an STK Push request with Daraja and saves the checkout record.
- `supabase/functions/mpesa-callback`
  Receives the Daraja callback and updates the checkout status.
- `supabase/functions/mpesa-checkout-status`
  Lets the storefront poll for the final payment result and linked order IDs.
- `public.mpesa_checkouts`
  Stores M-Pesa checkout requests, response payloads, callback results, and generated order IDs.
- Cart drawer checkout UI
  Lets the client enter name, phone, delivery area, then trigger `Pay with M-Pesa`.

## 1. Run the latest schema

Run:

- `supabase/supabase-schema.sql`

This creates the `mpesa_checkouts` table and its admin policies.

## 2. Add Supabase secrets

Set these secrets in your Supabase project:

- `MPESA_ENV`
  Use `sandbox` for testing or `production` when live.
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_TRANSACTION_TYPE`
  Usually `CustomerPayBillOnline`
- `MPESA_ACCOUNT_REFERENCE_PREFIX`
  Example: `SHARONCRAFT`
- `MPESA_CALLBACK_SECRET`
  Optional but recommended

## 3. Deploy the functions

Deploy:

```bash
supabase functions deploy mpesa-stk-push
supabase functions deploy mpesa-callback
supabase functions deploy mpesa-checkout-status
```

This repo now includes [supabase/config.toml](/c:/Users/USER/Desktop/projects/bead%20VN2/supabase/config.toml), which sets both functions to `verify_jwt = false`. That matters because:

- `mpesa-stk-push` is called from the public storefront cart
- `mpesa-callback` is called by Safaricom, not by a signed-in Supabase user

## 4. Callback URL

The callback function URL is:

```text
https://<your-project-ref>.supabase.co/functions/v1/mpesa-callback
```

If you set `MPESA_CALLBACK_SECRET`, the checkout function automatically appends it as a query string when it sends the STK request.

## 5. Test checklist

- Add a product to cart
- Open cart
- Tap `Pay with M-Pesa`
- Enter a Safaricom phone number
- Submit the STK request
- Confirm the prompt on the phone
- Check `public.mpesa_checkouts` in Supabase for:
  - `status = prompted` after request acceptance
  - `status = paid` after callback success
  - `mpesa_receipt_number`
- Check `public.orders` and `public.order_tracking` for the new `ORD-...` records created automatically after a successful callback.
- Confirm the paid customer sees the generated `ORD-...` tracking ID in the storefront after payment.

## 6. Notes

- Successful M-Pesa callbacks now create live `orders` and `order_tracking` rows automatically.
- Successful M-Pesa callbacks can also send a WhatsApp payment confirmation when WhatsApp secrets and template setup are in place.
- Each paid item gets a public tracking ID in the `ORD-YYYYMMDD-XXXX` format so the client can follow up without seeing private order data.
- WhatsApp checkout remains as a fallback path.
- The frontend never stores Daraja secrets. All secret work stays in Supabase Edge Functions.

For WhatsApp payment notification setup, see [WHATSAPP_SETUP.md](/c:/Users/USER/Desktop/projects/bead%20VN2/docs/WHATSAPP_SETUP.md).
