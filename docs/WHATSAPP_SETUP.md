# SharonCraft WhatsApp Payment Notifications

This project can now send an automatic WhatsApp payment confirmation after a successful M-Pesa callback.

## What it does

- Sends a WhatsApp template message after a checkout is marked `paid`
- Keeps all WhatsApp credentials inside Supabase Edge Function secrets
- Logs every notification attempt in `public.whatsapp_notifications`
- Never blocks order creation if WhatsApp is not configured or a send fails

## Current provider path

The implementation uses the Meta WhatsApp Cloud API template-message flow.

Make sure your business has the right customer opt-in/transactional messaging basis before sending automated WhatsApp notifications.

## Required Supabase secrets

Set these in your Supabase project before going live:

- `WHATSAPP_PROVIDER`
  Use `meta_cloud`
- `WHATSAPP_ACCESS_TOKEN`
  A token with WhatsApp messaging access
- `WHATSAPP_PHONE_NUMBER_ID`
  The Meta business phone number ID that sends the message
- `WHATSAPP_TEMPLATE_PAYMENT_RECEIVED`
  The approved template name for payment confirmations
- `WHATSAPP_TEMPLATE_LANGUAGE`
  Template language code such as `en`
- `WHATSAPP_GRAPH_VERSION`
  Optional. Defaults to `v23.0`

## Recommended payment template

Create and approve a template with 4 body variables in this order:

1. Customer name
2. Public order ID or order IDs
3. M-Pesa receipt number
4. Paid amount

Example body:

```text
Hello {{1}}, SharonCraft has received your payment.
Order ID: {{2}}
M-Pesa receipt: {{3}}
Amount: {{4}}
```

If you want the template to mention your tracking page directly, include that fixed website URL in the template text itself before approval.

## After setup

1. Run the latest SQL in `supabase/supabase-schema.sql`
2. Redeploy `mpesa-callback`
3. Make one test payment
4. Check `public.whatsapp_notifications` for `sent`, `failed`, or `skipped`
5. Confirm the customer receives the payment confirmation with the `ORD-...` tracking ID

## Important behavior

- Order creation still happens even if WhatsApp is not configured
- A missing template, token, or phone ID is logged as `skipped`
- Provider errors are logged as `failed`
- Successful sends are logged as `sent`
