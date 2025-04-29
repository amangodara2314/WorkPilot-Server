# 🔧 Project Management App – Backend

This is the **backend** of a real-time project management app built with **Node.js**, **Express**, **MongoDB**, and **Socket.io**.  
It powers features like user authentication, workshops, projects, tasks, and real-time collaboration with role-based permissions.

---

## 📽 Demo

[Watch the Demo Video](https://youtu.be/1Oa4RlujmLQ)


---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- Socket.io
- JWT Auth
- Google OAuth
- REST APIs

---

## 🚀 Features

- 🔐 **Authentication**
  - Register/Login via email & password
  - Google OAuth support
- 🧑‍🤝‍🧑 **Workshops**
  - Each user has a default personal workshop
  - Can create multiple workshops
  - Invite members via join link
- 🗂 **Projects & Tasks**
  - Create multiple projects per workshop
  - Add tasks to projects
- 👥 **Role-Based Access**
  - `Owner`: Full permissions
  - `Admin`: All except delete workshop
  - `Member`: Can view/edit only their tasks
- 🔄 **Real-time Collaboration**
  - All actions synced live using Socket.io

---

## 📦 API Endpoints

Base URL: `/api`

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register with email & password |
| POST | `/login` | Login with credentials |
| POST | `/register/google` | Register with Google |
| POST | `/login/google` | Login with Google |

### Workshop (`/api/workshop`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a workshop |
| GET | `/details/:id` | Get details of a specific workshop |
| GET | `/` | Get all workshops of a user |
| PATCH | `/change/:id` | Change workshop (custom logic) |
| PUT | `/:id` | Update workshop |
| POST | `/join/:code` | Join workshop via code |
| DELETE | `/:id` | Delete workshop |

### Project (`/api/project`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create a project |
| GET | `/details/:id` | Get project details |
| GET | `/:workshopId` | Get all projects under a workshop |
| PUT | `/:id` | Update project |
| DELETE | `/:id` | Delete project |

### Task (`/api/task`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all tasks |
| GET | `/:id` | Get a task by ID |
| POST | `/` | Create a task |
| PUT | `/:id` | Update a task |
| DELETE | `/:id` | Delete a task |

### User (`/api/user`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user data (for auth refresh) |

### Member (`/api/member`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:id` | Get all members of a workshop |
| PUT | `/change-role/:id` | Change member role |

---

## ⚙️ Getting Started

```bash
git clone git@github.com:amangodara2314/WorkPilot-Server.git
cd WorkPilot-Server
npm install
node index.js
```

#📬 Contact

I'm currently looking for a job opportunity as a MERN Stack Developer.
Feel free to connect with me on [Linkedin](https://www.linkedin.com/in/aman-godara-8160ba2b7/)

