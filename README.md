# Secure Connect Platform

**Web Development III — Lab 4: Secure Connect and Communication Platform**  
**Student Name:** Vinayak Vashisth  
**Roll Number:** 2501730150  

---

## Overview

Secure Connect Platform is a backend service built with Node.js, Express, MongoDB, and Socket.IO. It implements secure RESTful API endpoints for user authentication and personal notes management, complemented by real-time notifications and room-based messaging via WebSockets.

---

## Features

- **Authentication & Authorization**: User registration and login using salted `bcryptjs` password hashing and stateless JSON Web Tokens (JWT).
- **Protected Notes API**: Full CRUD capabilities for user notes. Notes are strictly scoped to the authenticated owner.
- **Role-Based Access Control (RBAC)**: Endpoint-level permission guards differentiating standard users from administrators.
- **Event-Driven Notifications**: Internal Node.js `EventEmitter` pipeline coupled with Socket.IO to broadcast live `note:created` notifications to connected clients.
- **Real-Time Room Chat**: Socket.IO room subscriptions (`join_room`) and targeted message broadcasting (`chat_message`).

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Native Driver)
- **Real-Time Layer**: Socket.IO
- **Security**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`)
- **Testing**: Postman (REST & WebSocket collections)

---

## Project Structure

```text
secure-connect-platform/
├── docs/
│   └── postman-test-plan.md     # Step-by-step API testing guide
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection handler
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification and RBAC checks
│   └── routes/
│       ├── authRoutes.js        # /api/auth (signup, login)
│       └── notesRoutes.js       # /api/notes (CRUD endpoints)
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js                    # Application entry point and Socket.IO handlers
```

---

## REST API Reference

**Base URL:** `http://localhost:5000`

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/auth/signup` | None | Register a new user (`username`, `email`, `password`) |
| `POST` | `/api/auth/login` | None | Authenticate user and receive a JWT |

### Protected Routes

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/protected` | Bearer Token | Verify token validity and access basic user claims |
| `GET` | `/api/admin` | Admin Token | Access admin-only route (enforces `role === "admin"`) |

### Notes Management (`/api/notes`)

All notes endpoints require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/notes` | Create a note (`title`, `content`). Triggers `note:created` event. |
| `GET` | `/api/notes` | Retrieve all notes owned by the authenticated user. |
| `GET` | `/api/notes/:id` | Retrieve a specific note by ID. |
| `PUT` | `/api/notes/:id` | Update note title or content by ID. |
| `DELETE` | `/api/notes/:id` | Delete note by ID. |

---

## Real-Time Socket.IO Events

Connect to `ws://localhost:5000` (or `http://localhost:5000` via Socket.IO client).

### Server-to-Client Events

- **`note:created`**: Emitted server-wide whenever an authenticated user creates a note.
  ```json
  {
    "userId": "673...",
    "title": "Meeting Notes"
  }
  ```

- **`room_joined`**: Emitted back to the client confirming room subscription.
  ```json
  {
    "room": "general"
  }
  ```

- **`chat_message`**: Broadcasted to all sockets inside the specified room.
  ```json
  {
    "room": "general",
    "username": "Vinayak Vashisth",
    "message": "Hello from the chat room!",
    "sentAt": "2026-11-06T17:20:00.000Z"
  }
  ```

### Client-to-Server Events

- **`join_room`**: Joins a named room.
  ```json
  { "room": "general" }
  ```

- **`chat_message`**: Sends a message to a room.
  ```json
  {
    "room": "general",
    "username": "Vinayak Vashisth",
    "message": "Hello from the chat room!"
  }
  ```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (local or MongoDB Atlas)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/codeREDxbt/Secure-Connect-Platform.git
   cd Secure-Connect-Platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   MONGODB_URI=mongodb://127.0.0.1:27017
   DB_NAME=secure_connect_platform
   JWT_EXPIRES_IN=1h
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

---

## Verification & Screenshots

### REST API Operations

#### 1. Create Note (`POST /api/notes`)
![Create Note](https://github.com/user-attachments/assets/a3bd7d3e-d0b7-41ed-90d1-d7674503704e)

#### 2. Update Note (`PUT /api/notes/:id`)
![Update Note](https://github.com/user-attachments/assets/907710f6-2653-4d08-93b8-0cdcd4d77606)

#### 3. Delete Note (`DELETE /api/notes/:id`)
![Delete Note](https://github.com/user-attachments/assets/ff1f413b-31e5-4fa1-bfb5-bbb12ae30edf)

---

### Real-Time Communication (Socket.IO)

#### 4. Live Note Created Notification
![Note Created Event](https://github.com/user-attachments/assets/013dfbbd-d612-499c-ad4c-6a5b567fb1b8)

#### 5. Join Room (`join_room`)
![Join Room](https://github.com/user-attachments/assets/624d95ae-e8dc-4fb1-9a64-ad581b48c290)

#### 6. Send Chat Message (`chat_message`)
![Chat Message](https://github.com/user-attachments/assets/c5fa2e92-6c3f-4f55-9c2a-95aaac38fe8f)

---

### Server Event Logging

#### 7. Terminal Logs (Events & Connections)
![Server Logs](https://github.com/user-attachments/assets/7c3a2af4-5eaf-44c1-b0ed-d77cb5115bb3)
