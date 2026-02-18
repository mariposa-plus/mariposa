# Google OAuth + Forms API Setup Guide

## ✅ Completed Steps

### Backend Configuration
- ✅ Google OAuth service with token encryption
- ✅ Google Forms API integration
- ✅ OAuth routes and controllers
- ✅ Credentials added to `.env` file
- ✅ Dependencies installed (googleapis, axios)

### Frontend Configuration
- ✅ Google OAuth hook (useGoogleOAuth)
- ✅ GoogleAccountConnect component
- ✅ Integration with config form system
- ✅ API URL configured

---

## ⚠️ IMPORTANT: Google Cloud Console Setup Required

### You MUST complete these steps before testing:

#### 1. Update Redirect URI in Google Cloud Console

**Current Configuration:**
```
Client ID: 888757186275-5imr155dmiln33r9a77230vna61nug3h.apps.googleusercontent.com
Redirect URI: http://localhost:3000/api/oauth/google/auth ❌ WRONG
```

**Required Configuration:**
```
Redirect URI: http://localhost:5000/api/oauth/google/callback ✅ CORRECT
```

**Steps:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on OAuth 2.0 Client ID: `888757186275-5imr155dmiln33r9a77230vna61nug3h`
3. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5000/api/oauth/google/callback
   ```
4. Keep **"Authorized JavaScript origins"**: `http://localhost:3000`
5. Click **Save**

#### 2. Enable Required Google APIs

**Go to:** https://console.cloud.google.com/apis/library

Enable these APIs:
- ✅ **Google Forms API** (REQUIRED)
- ✅ **Google Sheets API** (REQUIRED for sheets integration method)

**How to enable:**
1. Search for "Google Forms API"
2. Click on it
3. Click "Enable"
4. Repeat for "Google Sheets API"

**Note:** People API or Google+ API is NOT required anymore - we decode the ID token for user email instead of making API calls.

---

## 🚀 Testing the Integration

### Step 1: Start the Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
Server running in development mode on port 5000
✅ Redis connection successful
MongoDB connected
```

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```

### Step 3: Test OAuth Flow

1. **Login to Mariposa**
   - Open http://localhost:3000
   - Login with your account

2. **Create a Test Pipeline**
   - Navigate to Pipelines
   - Click "New Pipeline"

3. **Add Google Form Component**
   - Open the left sidebar (node palette)
   - Find "Triggers" category
   - Drag "Google Form" onto the canvas
   - Double-click the Google Form node

4. **Connect Google Account**
   - You should see **"Connect Google Account" button FIRST**
   - Click it
   - OAuth popup opens with Google consent screen
   - Select your Google account
   - Grant permissions for Forms & Sheets
   - Popup closes automatically
   - Your account appears in the list

5. **Configure Form Settings**
   - Select your connected account
   - Enter Form ID (from Google Form URL)
   - Configure other settings as needed
   - Save configuration

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
**Problem:** Redirect URI not configured correctly in Google Cloud Console

**Solution:**
1. Check Google Cloud Console credentials page
2. Ensure redirect URI is exactly: `http://localhost:5000/api/oauth/google/callback`
3. Note: `localhost` (not `127.0.0.1` or IP address)

### Error: "Access blocked: This app's request is invalid"
**Problem:** Google APIs not enabled

**Solution:**
1. Go to https://console.cloud.google.com/apis/library
2. Enable "Google Forms API"
3. Enable "Google Sheets API"

### Error: "Popup blocked"
**Problem:** Browser blocking OAuth popup

**Solution:**
1. Allow popups for `localhost:3000`
2. Try again

### OAuth popup doesn't close
**Problem:** Message passing between popup and parent window failed

**Solution:**
1. Check browser console for errors
2. Ensure both frontend and backend are running
3. Try refreshing the page

### Error: "Failed to fetch accounts"
**Problem:** Backend not running or API URL misconfigured

**Solution:**
1. Ensure backend is running on port 5000
2. Check `NEXT_PUBLIC_API_URL` in frontend/.env.local
3. Should be: `http://172.23.207.114:5000/api` or `http://localhost:5000/api`

---

## 📋 Available API Endpoints

### OAuth Management
- `GET /api/oauth/google/auth` - Generate OAuth URL
- `GET /api/oauth/google/callback` - Handle OAuth callback
- `GET /api/oauth/google/accounts` - List connected accounts
- `DELETE /api/oauth/google/accounts/:credentialId` - Disconnect account
- `POST /api/oauth/google/test-connection/:credentialId` - Test credentials

### Google Forms API
- `GET /api/google-forms/:credentialId/forms/:formId/structure` - Get form fields
- `GET /api/google-forms/:credentialId/forms/:formId/responses` - Get responses
- `GET /api/google-forms/:credentialId/forms/:formId/auto-detect` - Auto-detect field mapping
- `GET /api/google-forms/:credentialId/sheets/:sheetId/responses` - Get responses from Sheets
- `POST /api/google-forms/:credentialId/test-form/:formId` - Test form access

---

## 🔐 Security Features

✅ **Token Encryption**: OAuth tokens encrypted with AES-256 before database storage
✅ **CSRF Protection**: State parameter validation in OAuth flow
✅ **JWT Authentication**: All endpoints require valid JWT token
✅ **User Isolation**: Credentials tied to user ID
✅ **Automatic Token Refresh**: Expired tokens refreshed automatically

---

## 📝 Google Form Integration Methods

### Method 1: Webhook (Real-time) ⚡
- Fastest response time
- Requires Apps Script setup in Google Form
- Recommended for production

### Method 2: Polling (Periodic) ⏰
- Check for new responses every N minutes
- No Apps Script setup needed
- Good for testing

### Method 3: Google Sheets 📊
- Read responses from linked Google Sheet
- Useful for existing form + sheet setups
- Requires Sheet ID

---

## 🎯 Next Steps After Setup

1. **Test with a real Google Form:**
   - Create a test form at https://forms.google.com
   - Copy the Form ID from URL
   - Connect your Google account in Mariposa
   - Configure the Google Form trigger

2. **Build a pipeline:**
   - Add processing nodes after the Google Form trigger
   - Test with a form submission
   - Monitor execution logs

3. **Production deployment:**
   - Update redirect URI to production domain
   - Use environment-specific credentials
   - Enable webhook method for real-time processing

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify all environment variables are set correctly
3. Ensure Google Cloud APIs are enabled
4. Check browser console and backend logs for errors

**Environment Variables Checklist:**
- ✅ `GOOGLE_CLIENT_ID` in backend/.env
- ✅ `GOOGLE_CLIENT_SECRET` in backend/.env
- ✅ `GOOGLE_REDIRECT_URI` in backend/.env
- ✅ `WALLET_ENCRYPTION_KEY` in backend/.env (32 characters)
- ✅ `NEXT_PUBLIC_API_URL` in frontend/.env.local

---

**Last Updated:** December 26, 2024
**Status:** ✅ Implementation Complete - Awaiting Google Cloud Console Configuration
