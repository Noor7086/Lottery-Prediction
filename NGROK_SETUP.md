# Ngrok Setup Guide

## Step 1: Get Your Ngrok URL

1. **Make sure ngrok is running**:
   ```bash
   ngrok http 5000
   ```

2. **Copy your ngrok URL** from the ngrok terminal:
   - Look for the "Forwarding" line
   - Example: `https://abc123.ngrok.io -> http://localhost:5000`
   - Your ngrok URL is: `https://abc123.ngrok.io`

## Step 2: Update Backend Configuration

### Update `backend/env` file:

Find the `CORS_ORIGINS` line and add your ngrok URL:

```env
CORS_ORIGINS=https://seagreen-owl-810079.hostingersite.com,https://YOUR_NGROK_URL.ngrok.io,http://localhost:3000,http://localhost:5173
```

**Replace `YOUR_NGROK_URL` with your actual ngrok URL**

Example:
```env
CORS_ORIGINS=https://seagreen-owl-810079.hostingersite.com,https://abc123.ngrok.io,http://localhost:3000,http://localhost:5173
```

## Step 3: Restart Your Backend

After updating the `backend/env` file:

1. **Stop your backend** (Ctrl+C if running)
2. **Restart it**:
   ```bash
   npm run server
   ```

You should see:
```
🚀 Server running on http://0.0.0.0:5000
🌐 CORS enabled for: https://seagreen-owl-810079.hostingersite.com,https://abc123.ngrok.io,...
📡 Backend is ready for ngrok!
```

## Step 4: Test Your Backend

Open your browser and visit:
```
https://YOUR_NGROK_URL.ngrok.io/api/health
```

You should see:
```json
{"status":"OK","timestamp":"2024-01-01T12:00:00.000Z"}
```

✅ If you see this, your backend is accessible via ngrok!

## Step 5: Configure Frontend

### Create `.env.production` file

In your project root, create a file named `.env.production`:

```env
VITE_API_BASE_URL=https://YOUR_NGROK_URL.ngrok.io/api
```

**Replace `YOUR_NGROK_URL` with your actual ngrok URL**

Example:
```env
VITE_API_BASE_URL=https://abc123.ngrok.io/api
```

### Rebuild Frontend

```bash
npm run build
```

### Upload to Hostinger

Upload the new `dist` folder contents to your Hostinger hosting.

## Step 6: Test Login

1. Open your domain: https://seagreen-owl-810079.hostingersite.com
2. Open browser Developer Tools (F12)
3. Go to Console tab
4. Try to log in
5. Check console for:
   - `🔗 API Base URL: https://your-ngrok-url.ngrok.io/api` ✅
   - Any error messages

## Important Notes

### ⚠️ Ngrok URL Changes

**Free ngrok accounts**: Your URL changes every time you restart ngrok!

If you restart ngrok:
1. Get the new URL
2. Update `CORS_ORIGINS` in `backend/env`
3. Update `VITE_API_BASE_URL` in `.env.production`
4. Restart backend
5. Rebuild frontend
6. Re-upload to Hostinger

### 💡 Keep Ngrok Running

- Keep the ngrok terminal window open
- If ngrok stops, your backend won't be accessible
- Your PC must be on and backend running

### 🔒 For Production

Consider:
- **Paid ngrok plan** (fixed URL)
- **Deploy backend to cloud** (Railway, Render, etc.)
- **Use a VPN** for more security

## Troubleshooting

### Issue: CORS Error
- **Fix**: Make sure your ngrok URL is in `CORS_ORIGINS` in `backend/env`
- Restart backend after updating

### Issue: "Cannot connect to server"
- **Fix**: 
  - Check ngrok is running
  - Check backend is running
  - Verify ngrok URL is correct

### Issue: 404 Not Found
- **Fix**: Make sure you're using the HTTPS ngrok URL (not HTTP)
- Make sure backend is running on port 5000

## Quick Checklist

- [ ] Ngrok is running (`ngrok http 5000`)
- [ ] Copied ngrok URL
- [ ] Added ngrok URL to `CORS_ORIGINS` in `backend/env`
- [ ] Restarted backend
- [ ] Tested backend: `https://your-ngrok-url.ngrok.io/api/health`
- [ ] Created `.env.production` with `VITE_API_BASE_URL`
- [ ] Rebuilt frontend (`npm run build`)
- [ ] Uploaded new `dist` folder to Hostinger
- [ ] Tested login on domain

## Current Status

After completing the steps above, your setup will be:

```
Frontend (Domain) → Ngrok → Your PC Backend
https://seagreen-owl-810079.hostingersite.com → https://abc123.ngrok.io → http://localhost:5000
```

✅ This will work!

