# AI Service API Key Setup Instructions

To secure our backend, the Python AI Service (`ai_service`) now requires an API key for its endpoints. The Next.js app needs to send this key to authenticate its requests. 

Follow these instructions to set up the API key both locally and in production (Vercel).

## 1. Choose an API Key
Pick a secure, random string to use as your API key (e.g., `sqd_ai_super_secret_9982!`). **You must use this exact same string in both the AI service and the Next.js app.**

## 2. Local Setup (Next.js)
1. Go to the root directory of the project (`SquadEscrow/`).
2. Create or open a file named `.env.local` (this file is git-ignored).
3. Add the following line:
   ```env
   AI_API_KEY=your_chosen_secret_key
   ```
*(Note: If you don't set this locally, it will fall back to `"your_secret_api_key_here"`)*

## 3. Local Setup (AI Service)
1. Navigate into the `ai_service/` folder.
2. Create or open a file named `.env` (this is also git-ignored, but you can copy from `.env.example`).
3. Add the following line:
   ```env
   AI_API_KEY=your_chosen_secret_key
   ```
*(Note: If you don't set this locally, it will also fall back to `"your_secret_api_key_here"`)*

## 4. Production Setup (Vercel)
When deploying the Next.js app to Vercel, it needs to know both the URL of the hosted AI service and the API key to authenticate.

1. Go to the **Vercel Dashboard** -> Your Project.
2. Click on **Settings** -> **Environment Variables**.
3. Add the following two variables:
   - **Key**: `AI_API_KEY`
     - **Value**: `your_chosen_secret_key`
   - **Key**: `AI_SERVICE_URL`
     - **Value**: `https://your-hosted-ai-service-url.com` (Replace this with the actual URL where your Python FastAPI service is deployed).
4. Click **Save**.
5. Trigger a new deployment on Vercel so the environment variables take effect.

---
**Troubleshooting:**
If you receive a `403 Forbidden` error when trying to use the discovery/search features, it means the API keys in your Next.js environment and your AI service environment do not match. Double-check your `.env` files and Vercel settings!
