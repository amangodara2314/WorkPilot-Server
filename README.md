# 🚀 Real-time Project Management App

This is the **frontend** of a full-stack collaborative project management tool built with the **MERN stack** and **Socket.io**, supporting **real-time updates**, **role-based permissions**, and **team collaboration** via invite links.

---

## 🎥 Demo

Watch the 1-minute demo video here:  
🔗 [Click to watch on Youtube](https://youtu.be/1Oa4RlujmLQ)

---

## 🌟 Features

- 🔐 **Authentication**
  - Email/password login and registration
  - Google OAuth integration

- 🧠 **Workshops & Projects**
  - Each user gets a personal workshop by default
  - Create unlimited workshops and projects
  - Organize tasks under projects and workshops

- 👥 **Team Collaboration**
  - Invite users to a workshop via a shareable link
  - Real-time syncing using **Socket.io**

- 🛡️ **Role-based Access Control**
  - **Owner**: Full access (including deleting workshops, managing roles)
  - **Admin**: Same as owner, except delete workshop
  - **Member**: Can view/edit only assigned tasks

- ⚡ **Real-time Updates**
  - Task and project changes sync instantly for all users
  - Track online users in real time

---

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS, Context API
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **Auth:** JWT + Google OAuth  
- **Realtime:** Socket.io  
- **UI:** Shadcn/ui + Lucide icons  
- **Deployment:** Vercel

---

## 🧑‍💻 Getting Started (Local Setup)

1. **Clone the repo**
   ```bash
   git clone git@github.com:amangodara2314/WorkPilot-Server.git
   cd WorkPilot-Server
   npm install
2. **Start development server**
   ```bash
   npm run dev
