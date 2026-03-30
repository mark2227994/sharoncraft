# SharonCraft M-Pesa Setup

This project now includes a real M-Pesa STK Push integration path using Supabase Edge Functions.

## What was added

- `supabase/functions/mpesa-stk-push`
  Starts an STK Push request with Daraja and saves the checkout record.
- `supabase/functions/mpesa-callback`
  Receives the Daraja callback and updates the checkout status.
- `public.mpesa_checkouts`
  Stores M-Pesa checkout requests, response payloads, and callback results.
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

## 6. Notes

- The current integration records payment requests in `mpesa_checkouts`. It does not yet convert successful M-Pesa payments into admin `orders` automatically.
- WhatsApp checkout remains as a fallback path.
- The frontend never stores Daraja secrets. All secret work stays in Supabase Edge Functions.
