# 🎓 AlloGate — Classroom Resource Allocation System

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Build-Vite-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Prototype-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
</p>

<p align="center">
  <b>A structured, role-driven system that replaces messy classroom resource handling with clarity and control.</b>
</p>

---

## 🖼️ Preview

### 🔐 Login & Role-Based Dashboard
![Login Demo](./assets/login.gif)

### 📦 Resource Request Flow (Faculty)
![Request Demo](./assets/request.gif)

### 🧑‍💼 Admin Approval System
![Admin Demo](./assets/admin.gif)

### 🛠 Inventory Management (Manager)
![Inventory Demo](./assets/inventory.gif)

### 📊 Reports & Analytics
![Reports Demo](./assets/reports.gif)

> 📌 All demos are recorded from the running application.  
> Assets are stored under `/assets` for easy access and version control.
---

## 🚩 Problem It Solves

In most institutions, resource allocation is:
- unstructured  
- manually tracked  
- prone to miscommunication  

Which leads to:
- missing requests  
- incorrect inventory  
- zero transparency  

**AlloGate introduces a controlled workflow where every action is visible and traceable.**

---

## 🧠 System Overview

AlloGate models a real academic workflow:

```
Faculty → Request → Admin → Approve/Reject → Manager → Maintain Inventory
```

Every step updates the system state instantly.

---

## 🧩 Roles

### 👩‍🏫 Faculty
- Submit requests  
- Check availability  
- Modify / cancel pending requests  
- Track status  
- Receive notifications  

---

### 🧑‍💼 Admin
- Review requests  
- Approve / reject  
- Monitor inventory  
- Analyze reports  

---

### 🛠 Manager / Lab Technician
- Update quantities  
- Change availability  
- Maintain resource status  
- Add notes  

---

## ⚙️ Features

✔ Role-based authentication  
✔ Smart request workflow with validation  
✔ Live inventory tracking  
✔ Editable request lifecycle  
✔ Status tracking system  
✔ Notification engine  
✔ Admin analytics dashboard  
✔ Real-time inventory reflection  

---

## 🗂 User Stories Coverage

| ID   | Feature                          | Status |
|------|----------------------------------|--------|
| US1  | Authentication                   | ✅ |
| US2  | Resource Request                 | ✅ |
| US3  | Availability View                | ✅ |
| US4  | Modify / Cancel                  | ✅ |
| US5  | Status Tracking                  | ✅ |
| US6  | Review Requests                  | ✅ |
| US7  | Inventory View                   | ✅ |
| US8  | Notifications                    | ✅ |
| US9  | Resource Updates                 | ✅ |
| US10 | Reports                          | ✅ |

---

## 🧱 Tech Stack

### Frontend
- React  
- TypeScript  
- Vite  
- React Router  

### UI / Styling
- Tailwind CSS  
- Radix UI  
- Lucide Icons  
- MUI (optional components)

### Data Layer
- localStorage (mock persistence)  
- Central API abstraction  
- Recharts (analytics)

---

## 🧪 Data Architecture

All data is handled client-side using:

```
localStorage
```

### Collections:
- users  
- resources  
- resourceRequests  
- notifications  

### Design Choice

This approach ensures:
- zero setup friction  
- full workflow demonstration  
- clean upgrade path to backend  

---

## 🔐 Demo Credentials

| Role     | Email                     | Password     |
|----------|--------------------------|-------------|
| Faculty  | faculty@smartclass.edu   | faculty123  |
| Admin    | admin@smartclass.edu     | admin123    |
| Manager  | manager@smartclass.edu   | manager123  |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open:
```
http://localhost:5173
```

---

## 🧭 Test Flow

### Faculty
- Submit request  
- Modify / cancel  
- Track status  

### Admin
- Approve / reject  
- Monitor impact  

### Manager
- Update inventory  
- Verify system sync  

---

## 🗃 Project Structure

```
src/
  app/
    layouts/
    lib/
      api.ts
      db.ts
      types.ts
    pages/
      Login.tsx
      RequestResources.tsx
      ResourceAvailability.tsx
      ManageRequests.tsx
      RequestStatus.tsx
      ReviewRequests.tsx
      Inventory.tsx
      Notifications.tsx
      UpdateStatus.tsx
      Reports.tsx
```

---

## ⚠️ Current Limitations

- No backend  
- No database  
- No authentication security  
- No real-time sync  

---

## 🔮 Future Scope

- Backend (Node.js / Express)  
- Database (PostgreSQL / MongoDB / Firebase)  
- JWT authentication  
- Real-time updates  
- Smart scheduling system  
- Email / push notifications  

---

## 🏗️ Design Philosophy

> Systems fail when decisions are invisible.

AlloGate enforces:
- visibility  
- accountability  
- structured flow  

---

## 📄 License

MIT License

---

## ✨ Portfolio Note

This project demonstrates:
- system design thinking  
- role-based architecture  
- frontend state management  
- workflow modeling  

It’s not just UI — it’s a **complete process simulation**.
