# 🚌 School Bus Management System

A desktop-based school bus management application built with **Electron**, **React**, and **MongoDB**.  
It supports **morning**, **day**, and **college** shifts with both **manual** and **automatic** bus assignment modes.

---

## 📋 Features

### Core
- **Route Management** – Create, edit, and manage bus routes.
- **Bus Assignment** – Assign buses to stands/students.
- **Print Support** – Export assignment sheets for drivers or management.
- **Responsive UI** – Tailored for both small and large screens.

### Assignment Modes
1. **Manual Assignment**
   - Morning, Day, and College shifts.
   - Assign buses and stands directly from the UI.
   - Color-coded stand display.
   - Supports editing and removing assignments.

2. **Automatic Assignment**
   - Logic handled in `Automation.jsx`.
   - Automatically allocates buses to stands based on availability.
   - Ensures assigned buses are hidden from other shifts until reset.
   - Separate automatic logic for Morning, Day, and College shifts.

### Editing & Reset
- Full editing capability of previously assigned buses and stands.
- Reset option to clear all assignments and restore availability.

---

## 🛠 Technology Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| **Frontend**   | React, React Router, TailwindCSS, Toastify |
| **Backend**    | Node.js (Electron Main Process) |
| **Database**   | MongoDB                        |
| **Desktop**    | Electron                       |
| **Animations** | Framer Motion                  |

---

## 📂 Folder Structure

```
src/
 ├── components/
 │    ├── Morning.jsx
 │    ├── Day.jsx
 │    ├── College.jsx
 │    └── AssignmentTable.jsx
 │
 ├── pages/
 │    └── Automation.jsx
 │
 ├── utils/
 │    ├── busAssignmentLogic.js   # Shared assignment functions
 │    └── mongoConfig.js          # Single MongoDB configuration for all environments
 │
 ├── App.jsx
 ├── index.js
 └── ...
```

---

## 🚀 Getting Started

### 1️⃣ Install dependencies
```bash
npm install
```

### 2️⃣ Run in development
```bash
npm run electron:dev
```

### 3️⃣ Build for production
```bash
npm run electron:build
```

---

## 🔄 Assignment Logic Overview

- **Manual Mode**:  
  - Assign buses to stands directly from the shift UI.
  - Edits are saved immediately to MongoDB.
  
- **Automatic Mode**:
  - Triggered from `Automation.jsx`.
  - Runs a set of rules to auto-allocate buses based on availability and shift.
  - Hides already-assigned buses from other shifts until reset.

---

## 📝 Notes for Developers
- **Single MongoDB Config**:  
  The app uses the same MongoDB connection for **development** and **production**.
  
- **Adding New Shift**:  
  - Create a new `<ShiftName>.jsx` in `components/`.
  - Add corresponding logic in `Automation.jsx`.
  - Update shared assignment logic in `utils/busAssignmentLogic.js`.

