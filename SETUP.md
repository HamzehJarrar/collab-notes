# Collab Notes — Full Setup & Deployment Guide

A real-time collaborative notes app built with **React + Material UI + Firebase**.

---

## Project Structure

```
collab-notes/
├── index.html
├── vite.config.js
├── package.json
├── .env.example          ← copy this to .env and fill in your Firebase keys
├── .gitignore
└── src/
    ├── main.jsx           ← React entry point
    ├── App.jsx            ← Root component (auth + layout)
    ├── firebase/
    │   └── config.js      ← Firebase init (reads from .env)
    └── components/
        ├── AddNote.jsx    ← Input form — writes to Firestore
        ├── NoteList.jsx   ← Real-time listener (onSnapshot)
        └── NoteItem.jsx   ← Single note card (edit + delete)
```

---

## Firestore Collection Structure

```
notes/                         ← collection name
  {auto-generated-id}/         ← document (one per note)
    text:      "Hello world"   ← string
    createdAt: Timestamp       ← Firestore server timestamp
    author:    "Ahmed"         ← string (from anonymous auth)
```

---

## Step 1 — Create a Firebase Project

1. Go to **https://console.firebase.google.com** and click **Add project**.
2. Give it a name (e.g. `collab-notes`) and click through the setup wizard.
3. On the project dashboard, click the **Web** icon (`</>`) to add a web app.
4. Register the app — you'll get a `firebaseConfig` object. **Keep this page open.**

---

## Step 2 — Enable Firestore

1. In the left sidebar: **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** (allows all reads/writes — fine for development).
   > ⚠️ For production, update the security rules to lock down access.
4. Select a region close to you, then click **Enable**.

---

## Step 3 — Enable Anonymous Authentication

1. In the left sidebar: **Build → Authentication**.
2. Click **Get started**, then go to the **Sign-in method** tab.
3. Click **Anonymous** and toggle it **on**.
4. Save.

---

## Step 4 — Set Up the Project Locally

### 4a. Clone / download the project

```bash
# If using Git
git clone <your-repo-url>
cd collab-notes

# Or just unzip the downloaded folder
cd collab-notes
```

### 4b. Install dependencies

```bash
npm install
```

### 4c. Create your `.env` file

Copy the example file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Open `.env` and paste your values from Step 1:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=collab-notes-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=collab-notes-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=collab-notes-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

> ℹ️ All variables must start with `VITE_` — this is how Vite exposes them to the browser.

### 4d. Run locally

```bash
npm run dev
```

Open **http://localhost:5173** in two browser tabs — type in one and watch the other update in real-time!

---

## Step 5 — Deploy to Vercel

### 5a. Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/collab-notes.git
git push -u origin main
```

> Make sure `.env` is listed in `.gitignore` — **never push your real keys to GitHub!**

### 5b. Import on Vercel

1. Go to **https://vercel.com** and log in (or sign up).
2. Click **Add New → Project**.
3. Import your GitHub repository.
4. Vercel will auto-detect Vite — keep the default settings.

### 5c. Add Environment Variables on Vercel

Before clicking **Deploy**, scroll to **Environment Variables** and add all six:

| Name                              | Value (from your .env)       |
|-----------------------------------|------------------------------|
| VITE_FIREBASE_API_KEY             | AIzaSy...                    |
| VITE_FIREBASE_AUTH_DOMAIN         | your-project.firebaseapp.com |
| VITE_FIREBASE_PROJECT_ID          | your-project-id              |
| VITE_FIREBASE_STORAGE_BUCKET      | your-project.appspot.com     |
| VITE_FIREBASE_MESSAGING_SENDER_ID | 123456789                    |
| VITE_FIREBASE_APP_ID              | 1:...:web:...                |

### 5d. Deploy!

Click **Deploy**. Vercel will build and give you a live URL like `https://collab-notes-xyz.vercel.app`.

Share this URL with anyone — they'll all see the same notes in real-time.

---

## Step 6 — (Production) Secure Firestore Rules

When you're ready to go public, replace the test rules in **Firestore → Rules**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      // Anyone signed in (including anonymously) can read/write
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## How Real-Time Sync Works

```
User A adds a note
      │
      ▼
addDoc() → Firestore (cloud)
      │
      ├──► onSnapshot fires for User A   → re-renders list
      ├──► onSnapshot fires for User B   → re-renders list
      └──► onSnapshot fires for User C   → re-renders list
```

`onSnapshot` in `NoteList.jsx` opens a persistent WebSocket connection to
Firestore. Every write — add, update, delete — triggers it on **every**
connected client automatically, with no polling required.

---

## Available Scripts

| Command          | Description                    |
|------------------|--------------------------------|
| `npm run dev`    | Start local dev server         |
| `npm run build`  | Build for production (`dist/`) |
| `npm run preview`| Preview production build       |

---

## Common Issues

**"Missing or insufficient permissions"**  
→ Make sure Firestore is in **test mode** or that your security rules allow access.

**Notes not loading / blank screen**  
→ Double-check all six `VITE_*` env vars are set and the `.env` file is in the project root.

**Anonymous auth error**  
→ Confirm Anonymous provider is enabled in Firebase Console → Authentication → Sign-in method.
