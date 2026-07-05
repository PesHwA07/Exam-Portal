# NetLeap — Online Exam Portal

NetLeap is a full-stack online examination platform built with **React (Vite)** on the frontend and **Node.js / Express / MongoDB** on the backend. It lets an admin upload and publish question sets, and lets students take timed, proctored exams with instant scoring — all deployable as a single project on Vercel.

## ✨ Features

### Student Experience
- Clean intro screen to enter candidate details before starting an exam
- Timed exam interface with a question navigator (jump between questions, track answered/skipped)
- **Session persistence** — if the browser is closed or refreshed mid-exam, students are prompted to resume from where they left off
- Instant result screen with score breakdown (correct / wrong / skipped)
- Support for multiple question types: MCQ, True/False, and Subjective

### Anti-Cheating / Proctoring
- Full-screen enforcement during the exam
- Tab-switch and window-blur detection, logged as violations
- Blocks right-click, copy/cut/paste, text selection, and common dev-tools shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, PrintScreen, etc.)
- On-screen watermark overlay to discourage screen capture/sharing
- Violation count is recorded and stored alongside each student's result

### Admin Panel
- Secure admin login (JWT-based authentication)
- Upload question sets from `.txt` files with automatic parsing
- Preview parsed questions before publishing
- Versioned question sets — only one set can be "published" (live) at a time
- Edit, republish, or delete existing question sets
- View all submitted results with score, timing, and violation data
- Export results (built with `xlsx` support for spreadsheet-friendly output)
- Clear all results when starting a fresh exam cycle

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- React Router
- Lucide Icons
- Plain CSS (custom design system, no UI framework)

**Backend**
- Node.js + Express 5
- MongoDB with Mongoose
- JWT for admin authentication
- bcryptjs for password hashing
- Multer for file uploads (in-memory storage, serverless-friendly)

**Deployment**
- Configured for [Vercel](https://vercel.com) — a single project serving the built frontend and the Express API as a serverless function (`/api`)

## 📁 Project Structure

```
Exam-Portal/
├── api/                    # Vercel serverless entry point
│   └── index.js
├── public/                 # Static assets
├── src/                    # React frontend
│   ├── components/         # IntroScreen, ExamScreen, ResultScreen, AdminPanel, etc.
│   ├── data/
│   ├── utils/               # Session management, API client
│   ├── App.jsx
│   └── main.jsx
├── server/                 # Express backend (used for local dev)
│   ├── middleware/          # Auth middleware
│   ├── models/               # Mongoose schemas (QuestionSet, Result)
│   ├── routes/                # auth, questions, results
│   ├── utils/                  # Question file parser
│   └── index.js
├── vercel.json
├── vite.config.js
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB database (local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/PesHwA07/Exam-Portal.git
cd Exam-Portal
```

### 2. Install dependencies
```bash
npm install
npm run install:server
```

### 3. Configure environment variables
Create a `.env` file inside the `server/` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_USER=your_admin_username
ADMIN_PASS=your_admin_password
PORT=5000
```

### 4. Run the backend
```bash
cd server
npm run dev
```

### 5. Run the frontend
In a separate terminal, from the project root:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`, with the API running at `http://localhost:5000`.

## 📤 Uploading Questions

Question sets are uploaded as plain `.txt` files from the Admin Panel. The parser reads the file, extracts the exam title and questions, and shows a preview before you publish. Only one question set can be live/published at any given time — publishing a new one automatically unpublishes the previous one.

## 📊 Results

Every exam submission is stored with the student's details, score breakdown, time taken, and number of proctoring violations. Admins can view all results in the panel and clear them when preparing for a new exam session.

## 📄 License

This project is provided as-is for educational and portfolio purposes.
