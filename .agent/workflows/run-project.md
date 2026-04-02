---
description: How to run the full NITS Assessment Portal (frontend + backend)
---

## Prerequisites
- **Node.js** installed
- **MongoDB** installed and running as a Windows service (already set up)

## Steps to Run

### 1. Start MongoDB (if not already running)
MongoDB runs as a Windows service and starts automatically on boot. To verify:
```powershell
Get-Service -Name MongoDB
```
If it shows `Stopped`, start it with:
```powershell
Start-Service -Name MongoDB
```

// turbo
### 2. Start the Backend Server
Open a terminal and run:
```powershell
cd c:\Users\costl\Desktop\Netleap\server
node index.js
```
You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### 3. Start the Frontend Dev Server
Open a **second terminal** and run:
```powershell
cd c:\Users\costl\Desktop\Netleap
npm run dev
```
You should see:
```
VITE ready
➜ Local: http://localhost:5173/
```

### 4. Open the App
Open your browser and go to: **http://localhost:5173/**

## Admin Access
- Click the **🔒 Admin** button in the top-right corner
- Username: `admin`
- Password: `nits@2026`

## Ports Summary
| Service  | Port  |
|----------|-------|
| Frontend | 5173  |
| Backend  | 5000  |
| MongoDB  | 27017 |
