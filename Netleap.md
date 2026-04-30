<p align="center">
  <img src="public/logo2.jpg" alt="NITS Logo" width="120" />
</p>

<h1 align="center">Netleap — NITS Assessment Portal</h1>

<p align="center">
  A full-stack, secure online examination platform built for NITS (National Institute of Technology, Silchar) aptitude assessments.
  <br />
  <strong>React + Vite · Express · MongoDB</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.1-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/License-Private-red" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Question File Format](#-question-file-format)
- [Anti-Cheat System](#-anti-cheat-system)
- [Admin Dashboard](#-admin-dashboard)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Netleap** is a proctored online examination portal designed for conducting aptitude tests. It features a student-facing exam interface with a comprehensive anti-cheat system, and an admin dashboard with analytics, question management, and result tracking — all wrapped in a modern, glassmorphism-styled UI.

The platform allows administrators to upload question papers via `.txt` files, publish them as live exams, and monitor student performance in real-time through rich analytics charts and exportable Excel reports.

---

## ✨ Features

### 🎓 Student Experience
- **Registration Form** — Name, email, and contact validation before exam entry
- **Dynamic Question Loading** — Questions fetched from the server in real-time
- **Question Randomization** — Optional shuffling of both questions and answer options
- **30-Minute Timed Exam** — Countdown timer with visual warnings (yellow < 5 min, red < 1 min)
- **Question Navigator** — Grid-based navigation panel showing answered/unanswered status
- **Clear Answer** — Students can deselect a chosen answer before submitting
- **Session Persistence** — Exam progress saved to `localStorage` for crash recovery
- **Resume Prompt** — Automatic detection of incomplete sessions with resume/discard options
- **Auto-Submit** — Exam automatically submits when the timer runs out
- **Result Screen** — Post-exam submission confirmation with integrity report

### 🔒 Anti-Cheat / Proctoring
- **Fullscreen Enforcement** — Exam runs in mandatory fullscreen mode
- **Tab Switch Detection** — `visibilitychange` and `blur` event monitoring
- **Keyboard Blocking** — Disables `PrintScreen`, `F12`, `Ctrl+Shift+I/J/C`, `Ctrl+C/V/X/A/S/U`, `Escape`, `Alt+Tab`, and `Meta` key
- **Context Menu Disabled** — Right-click is blocked during the exam
- **Copy/Cut/Paste/Drag Blocked** — All clipboard and drag interactions are prevented
- **Student Watermark** — Full-screen repeating student name overlay to deter screen photography
- **Violation Counter** — All violations tracked, displayed to student, and reported to admin

### 🛠️ Admin Dashboard
- **JWT Authentication** — Secure admin login with 4-hour token expiration
- **Analytics Dashboard** — Visual charts rendered on HTML5 Canvas:
  - Score distribution (bar chart)
  - Pass vs. fail ratio (donut chart)
  - Violations overview (bar chart)
  - Score trend (line chart)
  - Summary cards (total students, avg score, pass rate, avg time, total violations)
- **Results Table** — Sortable table with student name, email, contact, scores, violations, time taken, and submission date
- **Excel Export** — One-click download of all results as `.xlsx` file (powered by SheetJS)
- **Clear All Results** — Bulk deletion with confirmation dialog
- **Question Manager** — Upload, preview, edit, and publish question papers:
  - Drag-and-drop file upload (`.txt`)
  - Intelligent question parser with auto-categorization
  - Inline question/option editing
  - Correct answer marking
  - Question type detection (MCQ, True/False, Subjective)
  - Randomization toggles (questions & options)
  - Upload history with version tracking
  - Template file download

---

## 🧰 Tech Stack

| Layer       | Technology                                                          |
|-------------|---------------------------------------------------------------------|
| **Frontend** | React 19, Vite 8, Lucide React (icons), XLSX (SheetJS)            |
| **Styling**  | Vanilla CSS with CSS variables, glassmorphism, mesh gradients      |
| **Backend**  | Node.js, Express 5, Mongoose 8                                    |
| **Database** | MongoDB (local or Atlas)                                           |
| **Auth**     | JSON Web Tokens (JWT) with bcryptjs                                |
| **Upload**   | Multer (file upload middleware)                                    |
| **Proxy**    | Vite dev server proxy (`/api` → `localhost:5000`)                  |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Client (Browser)                     │
│                                                          │
│   ┌──────────┐  ┌───────────┐  ┌──────────────────────┐ │
│   │  Intro   │→ │   Exam    │→ │   Result Screen      │ │
│   │  Screen  │  │  Screen   │  │                      │ │
│   └──────────┘  └───────────┘  └──────────────────────┘ │
│        │                                                  │
│   ┌────┴─────┐  ┌───────────────────────────────────┐    │
│   │  Admin   │→ │       Admin Dashboard              │    │
│   │  Login   │  │  Analytics │ Results │ Questions    │    │
│   └──────────┘  └───────────────────────────────────┘    │
│                                                          │
│   Anti-Cheat Layer │ Session Manager │ Watermark Overlay  │
└───────────────────────────┬──────────────────────────────┘
                            │  REST API (/api)
                            │  (Vite Proxy in dev)
┌───────────────────────────┴──────────────────────────────┐
│                   Express Server (:5000)                  │
│                                                          │
│   ┌──────────┐  ┌───────────┐  ┌──────────────────────┐ │
│   │ /auth    │  │ /results  │  │ /questions            │ │
│   │  login   │  │  CRUD     │  │  upload/publish/CRUD  │ │
│   └──────────┘  └───────────┘  └──────────────────────┘ │
│                                                          │
│   JWT Middleware │ Question Parser │ Multer Uploads       │
└───────────────────────────┬──────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │   MongoDB      │
                    │  (:27017)      │
                    │                │
                    │  Collections:  │
                    │  • questionsets│
                    │  • results     │
                    └────────────────┘
```

---

## 📦 Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** ≥ 6.x (running locally as a service or via MongoDB Atlas)
- **npm** ≥ 9.x

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/netleap.git
cd netleap
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server/` directory:

```env
MONGO_URI=mongodb://localhost:27017/netleap
JWT_SECRET=your_super_secret_key_here
ADMIN_USER=admin
ADMIN_PASS=nits@2026
PORT=5000
```

### 5. Ensure MongoDB is running

```powershell
# Windows (if installed as a service)
Get-Service -Name MongoDB

# Start if stopped
Start-Service -Name MongoDB
```

```bash
# macOS / Linux
mongod --dbpath /data/db
```

---

## ▶️ Running the Project

### Start the Backend Server

```bash
cd server
node index.js
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### Start the Frontend Dev Server

Open a **second terminal**:

```bash
# From the project root
npm run dev
```

You should see:
```
VITE v8.0.1  ready in ~800 ms

  ➜  Local:   http://localhost:5173/
```

### Open the Application

Navigate to **http://localhost:5173/** in your browser.

---

## 📁 Project Structure

```
Netleap/
├── public/                          # Static assets
│   ├── favicon.svg                  # Browser favicon
│   ├── icons.svg                    # SVG icon sprite
│   └── logo2.jpg                    # NITS brand logo
│
├── src/                             # Frontend source code
│   ├── components/
│   │   ├── AdminLogin.jsx           # Admin login form
│   │   ├── AdminPanel.jsx           # Admin dashboard (analytics, table, charts)
│   │   ├── AntiCheatBlocker.jsx     # Anti-cheat event listeners wrapper
│   │   ├── ExamScreen.jsx           # Main exam interface with timer & navigation
│   │   ├── IntroScreen.jsx          # Student registration + rules screen
│   │   ├── QuestionManager.jsx      # Question upload, preview, edit & publish
│   │   ├── QuestionNavigator.jsx    # Grid-based question navigation panel
│   │   ├── ResultScreen.jsx         # Post-exam result & integrity report
│   │   └── Watermark.jsx            # Full-screen student name watermark
│   │
│   ├── data/
│   │   └── questions.js             # Fallback/static question data
│   │
│   ├── utils/
│   │   ├── api.js                   # REST API client functions
│   │   └── sessionManager.js        # localStorage session persistence
│   │
│   ├── App.jsx                      # Root component with screen routing
│   ├── index.css                    # Global styles (47KB — full design system)
│   └── main.jsx                     # React entry point
│
├── server/                          # Backend source code
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   │
│   ├── models/
│   │   ├── Question.js              # QuestionSet Mongoose schema
│   │   └── Result.js                # Result Mongoose schema
│   │
│   ├── routes/
│   │   ├── auth.js                  # POST /api/auth/login
│   │   ├── questions.js             # Question CRUD + upload + publish
│   │   └── results.js               # Result CRUD
│   │
│   ├── utils/
│   │   └── questionParser.js        # Text file → structured question parser
│   │
│   ├── uploads/                     # Temporary file upload directory
│   ├── .env                         # Environment variables (git-ignored)
│   ├── index.js                     # Express server entry point
│   └── package.json                 # Backend dependencies
│
├── .gitignore
├── eslint.config.js                 # ESLint configuration
├── index.html                       # HTML entry point
├── package.json                     # Frontend dependencies
├── vite.config.js                   # Vite config with API proxy
└── README.md                        # ← You are here
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Endpoint           | Auth | Description          |
|--------|--------------------|------|----------------------|
| POST   | `/api/auth/login`  | ❌   | Admin login → JWT    |

**Request Body:**
```json
{
  "username": "admin",
  "password": "nits@2026"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login successful"
}
```

---

### Results

| Method | Endpoint         | Auth | Description              |
|--------|------------------|------|--------------------------|
| POST   | `/api/results`   | ❌   | Submit exam result       |
| GET    | `/api/results`   | ✅   | Get all results (admin)  |
| DELETE | `/api/results`   | ✅   | Clear all results (admin)|

---

### Questions

| Method | Endpoint                      | Auth | Description                        |
|--------|-------------------------------|------|------------------------------------|
| POST   | `/api/questions/upload`       | ✅   | Upload & parse a question file     |
| POST   | `/api/questions/publish`      | ✅   | Publish a parsed question set      |
| GET    | `/api/questions/active`       | ❌   | Get the currently live exam (safe) |
| GET    | `/api/questions/active/answers`| ❌  | Get answer key for grading         |
| GET    | `/api/questions/history`      | ✅   | List all question sets (admin)     |
| GET    | `/api/questions/:id`          | ✅   | Get a specific question set        |
| PUT    | `/api/questions/:id`          | ✅   | Update a question set              |
| DELETE | `/api/questions/:id`          | ✅   | Delete a question set              |

---

### Health Check

| Method | Endpoint       | Auth | Description         |
|--------|----------------|------|---------------------|
| GET    | `/api/health`  | ❌   | Server health check |

---

## 📝 Question File Format

Questions are uploaded as `.txt` files. The parser supports the following format:

```text
EXAM TITLE: Sample Aptitude Test
CATEGORY: General

1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Answer: C

2. The earth revolves around the sun.
A) True
B) False
Answer: A

3. A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?
A) 120 meters
B) 150 meters
C) 180 meters
D) 200 meters
Answer: B

4. Explain the process of photosynthesis in detail.

5. Choose the antonym of 'Benevolent'.
A) Kind
B) Malevolent
C) Generous
D) Charitable
Answer: B
```

### Format Rules

| Element            | Supported Formats                                          |
|--------------------|-----------------------------------------------------------|
| **Question Number** | `1.`, `1)`, `Q1.`, `Q1)`, `Question 1:`, `Q:`           |
| **Options**        | `A)`, `A.`, `(A)`, `a)`, `- text`, `• text`              |
| **Answer Line**    | `Answer: C`, `Correct: B`, `Ans: 2`, `Ans = A`           |
| **Correct Marker** | Prefix with `*` or `✓` (e.g., `*C) Paris`)               |
| **Metadata**       | `EXAM TITLE:`, `CATEGORY:` (top of file)                  |

### Auto-Categorization

The parser automatically detects question categories based on keywords:

- **Logical Reasoning** — logic, reasoning, pattern, series, syllogism
- **Quantitative Aptitude** — calculate, ratio, percentage, profit, speed
- **Verbal Ability** — synonym, antonym, grammar, vocabulary
- **Data Interpretation** — graph, chart, table, pie chart
- **General Knowledge** — capital, country, history, geography
- **Science** — physics, chemistry, biology, atom
- **Mathematics** — equation, theorem, integral, derivative
- **Computer Science** — algorithm, programming, database

---

## 🔒 Anti-Cheat System

The `AntiCheatBlocker` component wraps the entire exam environment and implements multiple layers of protection:

| Vector                        | Detection Method                              | Action                |
|-------------------------------|-----------------------------------------------|-----------------------|
| Tab switching                 | `visibilitychange` event                      | Violation logged      |
| Window blur (Alt+Tab)         | `blur` event with 200ms debounce              | Violation logged      |
| Fullscreen exit               | `fullscreenchange` event                      | Warning modal + log   |
| Right-click                   | `contextmenu` event                           | Blocked               |
| Copy / Cut / Paste            | Clipboard events                              | Blocked               |
| Drag                          | `dragstart` event                             | Blocked               |
| Screenshot (PrintScreen)      | `keydown` event + clipboard clear             | Violation logged      |
| Dev Tools (F12, Ctrl+Shift+I) | `keydown` event                               | Blocked               |
| View Source (Ctrl+U)          | `keydown` event                               | Blocked               |
| Select All (Ctrl+A)           | `keydown` event                               | Blocked               |
| Screen photography            | **Watermark overlay** with student name       | Deterrent             |

All violations are:
1. Counted and shown to the student in real-time
2. Included in the final submission payload
3. Visible to admins in the results table and analytics

---

## 📊 Admin Dashboard

### Accessing Admin

1. Click the **🔒 Admin** button in the top-right corner of the intro screen
2. Login with your admin credentials (default: `admin` / `nits@2026`)

### Dashboard Tabs

| Tab              | Description                                                     |
|------------------|-----------------------------------------------------------------|
| **Analytics**    | Visual dashboard with score distribution, pass/fail ratio, violations chart, and score trend line |
| **Results Table**| Full student results with sortable columns and Excel export     |
| **Questions**    | Upload, preview, edit, and publish question papers              |

### Analytics Charts (Canvas-Rendered)

- **Score Distribution** — Bar chart showing student count by score range (0-20%, 21-40%, 41-60%, 61-80%, 81-100%)
- **Pass vs Fail** — Donut chart with ≥50% pass threshold
- **Violations Overview** — Bar chart showing students by violation count (0, 1, 2, 3+)
- **Score Trend** — Line chart of the last 15 student scores

---

## ⚙️ Environment Variables

| Variable       | Description                  | Default                          |
|----------------|------------------------------|----------------------------------|
| `MONGO_URI`    | MongoDB connection string    | `mongodb://localhost:27017/netleap` |
| `JWT_SECRET`   | Secret key for JWT signing   | *(required)*                     |
| `ADMIN_USER`   | Admin username               | `admin`                          |
| `ADMIN_PASS`   | Admin password               | `nits@2026`                      |
| `PORT`         | Backend server port          | `5000`                           |

---

## 🖼️ Screenshots

> Screenshots can be added here after deployment.

| Screen | Description |
|--------|-------------|
| Intro Screen | Student registration form with exam rules |
| Exam Screen | MCQ interface with timer, navigator, and watermark |
| Result Screen | Post-submission integrity report |
| Admin Analytics | Charts and summary cards |
| Admin Results | Student results table |
| Question Manager | Upload, preview, and publish questions |

---

## 🗂️ Database Schema

### `questionsets` Collection

```javascript
{
  examTitle: String,          // e.g., "Aptitude Test 2026"
  version: Number,            // Auto-incremented per title
  questions: [{
    id: Number,               // Sequential question number
    question: String,         // Question text
    type: String,             // "mcq" | "true_false" | "subjective"
    category: String,         // Auto-detected or manual
    options: [String],        // Array of option strings
    correctAnswer: Number     // Index (0-3) or -1 if unknown
  }],
  sourceFileName: String,     // Original upload filename
  isPublished: Boolean,       // Only one can be true at a time
  randomizeQuestions: Boolean,
  randomizeOptions: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### `results` Collection

```javascript
{
  studentData: {
    name: String,             // Student full name
    email: String,            // Student email
    contact: String           // 10-digit phone number
  },
  total: Number,              // Total questions
  correct: Number,            // Correct answers
  wrong: Number,              // Wrong answers
  skipped: Number,            // Unanswered questions
  violations: Number,         // Anti-cheat violation count
  timeTaken: Number,          // Time in seconds
  submittedAt: Date           // Submission timestamp
}
```

---

## 🔧 Development Notes

### Vite Proxy

In development, the Vite dev server proxies all `/api` requests to the Express backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### Ports Summary

| Service   | Port  |
|-----------|-------|
| Frontend  | 5173  |
| Backend   | 5000  |
| MongoDB   | 27017 |

### Session Persistence

Student exam sessions are persisted to `localStorage` under the key `netleap_active_session`. This allows recovery from:
- Accidental browser refresh
- Browser crash
- Temporary network loss

On return, students see a **Resume Prompt** to continue or start fresh.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is **private** and proprietary to NITS. All rights reserved.

---

<p align="center">
  Built with ❤️ for <strong>NITS</strong>
</p>
