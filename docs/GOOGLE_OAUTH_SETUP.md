# Google OAuth Setup Guide

## Overview
SharonCraft now supports Google OAuth login/signup. This guide walks through configuring Google OAuth in Supabase.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the Google+ API:
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add Authorized redirect URIs:
     - `https://vonzscriztdcdhobulhy.supabase.co/auth/v1/callback`
     - `http://localhost:3000/api/auth/callback` (for development)
   - Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click to enable
5. Paste your credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Click **Save**

## Step 3: Update Redirect URLs in Supabase

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain:
   - Production: `https://sharoncraft.com`
3. Add **Redirect URLs** for development:
   - `http://localhost:3000/api/auth/callback`
4. Click **Save**

## Step 4: Test Google OAuth

1. Start dev server: `npm run dev`
2. Go to http://localhost:3000/login
3. Click **Sign in with Google**
4. You should be redirected to Google login
5. After login, you'll be redirected back to the account dashboard

## File Structure

### New Files
- `lib/supabase-client.js` - Client-side Supabase setup with `signInWithGoogle()` function
- `pages/api/auth/callback.js` - OAuth callback handler that exchanges auth code for session

### Updated Files
- `pages/login.jsx` - Added Google OAuth button and handler
- `pages/register.jsx` - Added Google OAuth button for signup

### Function: `signInWithGoogle()`

```javascript
import { signInWithGoogle } from "../lib/supabase-client";

// Usage in React component
async function handleGoogleSignIn() {
  const { data, error } = await signInWithGoogle();
  if (error) {
    console.error("Sign in failed:", error);
  }
}
```

## Features

✅ **Sign in with Google** - Existing users can login with Google
✅ **Sign up with Google** - New users can create account with Google
✅ **Automatic account creation** - First-time Google users get account auto-created
✅ **Session management** - Google session stored in auth cookie
✅ **Error handling** - User-friendly error messages
✅ **Responsive design** - Works on mobile and desktop

## Troubleshooting

### "Failed to sign in with Google"
- Check Google OAuth credentials are correctly set in Supabase
- Verify redirect URLs match in both Google Cloud Console and Supabase
- Ensure Site URL is correctly configured in Supabase

### Redirect loop
- Check that `http://localhost:3000/api/auth/callback` is added to Google's authorized redirect URIs
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct in `.env.local`

### "Invalid Client" error
- Double-check Client ID and Client Secret in Supabase Provider settings
- Regenerate credentials in Google Cloud Console if needed

## Security Considerations

- Google auth uses PKCE (Proof Key for Code Exchange) for extra security
- Auth tokens stored in httpOnly cookies (not accessible to JavaScript)
- Cookies only sent over HTTPS in production
- Session tokens have 7-day expiry

## Next Steps

- Add other OAuth providers (GitHub, Facebook, etc.)
- Add two-factor authentication
- Add email verification requirements
- Add account linking (connect multiple login methods to one account)

## Environment Variables

Make sure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://vonzscriztdcdhobulhy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_3CbiLXuCbqRGjKmBp7Ez3w_NV4HaLXa
```

No additional environment variables needed - Google credentials are stored in Supabase.
