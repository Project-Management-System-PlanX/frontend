# 🚀 TeamUp Frontend

The modern, responsive frontend for the TeamUp collaboration platform, built with **Next.js**, **TailwindCSS**, and **Supabase**.

## 📖 Quick Links
- **[Installation Guide (INSTALL.md)](./INSTALL.md)** - Follow this for first-time setup.
- **[Architecture Guide](#)** - Overview of components and state management.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (Turbopack)
- **Styling**: TailwindCSS
- **Real-time**: Supabase Realtime
- **State Management**: Zustand & React Query
- **Video/Audio**: LiveKit

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure the **Backend** is running first. Follow the [Backend README](../../backend/README.md) for instructions.

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## 🏗️ Project Structure
```
frontend/
├── app/            # Next.js App Router (Pages & Layouts)
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks (Live updates with Supabase)
├── lib/            # API clients and utilities
├── providers/      # React context providers
├── public/         # Static assets
└── stores/         # Zustand store definitions
```

---

## 🤝 Contributing
Please run the linter and formatter before pushing code:
```bash
npm run lint
npm run format
```
