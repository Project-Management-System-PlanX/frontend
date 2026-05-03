# 🎨 Installation & Setup Guide (Frontend)

This guide ensures a smooth and safe setup for the TeamUp frontend application.

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Backend Services**: Ensure the backend services (Ports 3002/3005) are running.

---

## 🚀 Step 1: Installation

```bash
# Install dependencies
npm install
```

### Dealing with Installation Errors:
If you encounter peer dependency conflicts or "locked" errors:
```bash
# Force a clean install
rm -rf node_modules .next package-lock.json
npm install
```

---

## 📄 Step 2: Environment Setup

The frontend requires environment variables to connect to Supabase and the Backend API.

```bash
# Create local environment file
cp .env.example .env.local
```

### Key Variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `NEXT_PUBLIC_API_URL`: Should point to the Workspace Service (usually `http://localhost:3002`).

---

## 🏃 Step 3: Running the App

### Start Development Server
```bash
npm run dev
```
The app will be available at **[http://localhost:3000](http://localhost:3000)**.

---

## 🔧 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **API Requests Failing** | Check if the backend is running on port 3002 and that CORS is enabled. |
| **Authentication Errors** | Ensure `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` match your backend's `.env`. |
| **Next.js Hydration Errors** | Clear cache by deleting the `.next` folder and restarting with `npm run dev`. |
| **Biome/Linting Issues** | Run `npm run format` to fix auto-fixable linting errors. |
