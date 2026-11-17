<div align="center">

<!-- GitHub-friendly 3D-inspired animated header (hosted image; no extra asset file required) -->
<img src="https://capsule-render.vercel.app/api?type=waving&height=270&color=0:0B1026,50:4338CA,100:7C3AED&text=ChatPro&fontColor=FFFFFF&fontSize=74&fontAlignY=38&desc=REAL-TIME%20COMMUNICATION%20PLATFORM&descAlignY=59&descSize=18&animation=fadeIn" width="100%" alt="ChatPro — real-time communication platform" />

<br />

<a href="https://github.com/Arjun7tripathi-newcode/Real-time-chating-Site">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=20&duration=2700&pause=900&color=9085FF&center=true&vCenter=true&width=780&lines=One+platform.+Every+conversation.;Live+chat+%E2%80%A2+Private+groups+%E2%80%A2+Public+rooms;Video+meetings+%E2%80%A2+Presence+%E2%80%A2+Reactions;Built+for+instant+connections." alt="Animated ChatPro feature introduction" />
</a>

### Where conversations feel instant.

**A full-stack messaging and video collaboration experience** built with a responsive, motion-rich interface.

[![Next.js](https://img.shields.io/badge/Next.js-16-111827?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-0F172A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-1D4ED8?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-171717?style=for-the-badge&logo=socketdotio)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-14532D?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-4F46E5?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Agora](https://img.shields.io/badge/Agora-RTC-2563EB?style=for-the-badge)](https://www.agora.io/)

<br />

[![GitHub stars](https://img.shields.io/github/stars/Arjun7tripathi-newcode/Real-time-chating-Site?style=flat-square&color=7C3AED)](https://github.com/Arjun7tripathi-newcode/Real-time-chating-Site/stargazers)
[![Repository size](https://img.shields.io/github/repo-size/Arjun7tripathi-newcode/Real-time-chating-Site?style=flat-square&color=7C3AED)](https://github.com/Arjun7tripathi-newcode/Real-time-chating-Site)
[![Last commit](https://img.shields.io/github/last-commit/Arjun7tripathi-newcode/Real-time-chating-Site?style=flat-square&color=7C3AED)](https://github.com/Arjun7tripathi-newcode/Real-time-chating-Site/commits/main)

**[Features](#-features) · [Tech Stack](#-tech-stack) · [Architecture](#-architecture) · [Setup](#-getting-started) · [Deployment](#-deployment)**

</div>

---

## ✦ Overview

**ChatPro** is a responsive, full-stack communication app designed to make online conversations feel immediate and organized. It combines a Next.js web application with a standalone Socket.IO server, MongoDB persistence, Clerk authentication, and Agora-powered video meetings.

Rather than stopping at a simple chat box, the project includes multiple conversation types, presence indicators, typing feedback, and message-level controls — all within a light/dark interface.

## 🪐 Experience at a Glance

> **Designed with a 3D-inspired visual language:** layered glass-like surfaces, depth, subtle motion, immersive gradients, and responsive transitions. The application itself uses **Framer Motion**, not Three.js; the graphic header above is a decorative GitHub README animation.

| 💬 **Connect** | 👥 **Collaborate** | 🎥 **Meet** |
|:---:|:---:|:---:|
| Instant direct messages | Private groups & public rooms | Agora video & audio calls |
| Typing & presence indicators | Search, member management | Meeting ID join flow |
| Emoji reactions & controls | Up to 10 group participants | Camera & mic toggles |

<details>
<summary><strong>🔎 Expand: What makes this an engineering project?</strong></summary>
<br />

- **Distributed realtime layer:** a standalone Socket.IO service handles event fan-out, typing, presence, and room subscriptions.
- **Persistent data model:** MongoDB/Mongoose models provide history for multiple conversation types.
- **Authentication & identity:** Clerk sign-in with a signed webhook for profile synchronization.
- **Video pipeline:** Agora channel tokens issued from an authenticated Next.js API endpoint.
- **Frontend state:** Zustand powers conversational UI state across responsive workspace views.

</details>

## ✨ Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>💬 Messaging</h3>
      <ul>
        <li>One-to-one chats and personal saved-message chat</li>
        <li>Real-time message delivery via Socket.IO</li>
        <li>Typing indicators and online presence</li>
        <li>Message reactions and emoji picker</li>
        <li>Edit recent messages and delete messages</li>
        <li>Disappearing messages (10s / 60s options)</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>👥 Spaces & Communities</h3>
      <ul>
        <li>Private group chats with up to 10 members</li>
        <li>Group member management</li>
        <li>Public chat rooms with shareable room IDs</li>
        <li>Password-protected rooms</li>
        <li>Search chats, rooms, and other users</li>
        <li>Clerk-powered sign-in and account management</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🎥 Video Meetings</h3>
      <ul>
        <li>Create or join meetings using meeting IDs</li>
        <li>Agora RTC audio/video integration</li>
        <li>Microphone and camera controls</li>
        <li>Multiple participant video tiles</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🎨 Experience</h3>
      <ul>
        <li>Responsive dashboard layouts</li>
        <li>Light and dark mode</li>
        <li>Animated UI with Framer Motion</li>
        <li>Toast notifications and loading states</li>
        <li>Persistent chat data in MongoDB</li>
      </ul>
    </td>
  </tr>
</table>

> **Implementation note:** Meeting screen sharing and certain settings controls appear in the UI but are not wired up as functional features in the current code. They are intentionally not listed as completed above.

## 🧰 Tech Stack

| Layer | Technologies |
|:--|:--|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & motion** | Tailwind CSS 4, Framer Motion, Lucide icons |
| **Realtime** | Socket.IO server + Socket.IO client |
| **Data** | MongoDB, Mongoose |
| **Authentication** | Clerk, Svix webhook verification |
| **Video & audio** | Agora RTC SDK, Agora token generation |
| **State & utilities** | Zustand, Axios, date-fns, react-hot-toast, emoji-picker-react |

## 🏗️ Architecture

```mermaid
flowchart TB
    U[Browser / React UI] --> N[Next.js 16 App Router]
    U <-->|Realtime events| S[Standalone Socket.IO server]
    U <-->|Audio + video| A[Agora RTC]
    N --> C[Clerk authentication]
    N --> M[(MongoDB / Mongoose)]
    N --> T[Agora token endpoint]
    T --> A
    C -->|Signed user webhooks| N
```

- **Next.js** handles the frontend, authenticated routes, and API endpoints.
- **MongoDB** stores profiles, conversations, messages, rooms, groups, and meeting records.
- **Socket.IO** distributes live messages, presence, typing events, reactions, and message updates.
- **Agora** connects participants for real-time audio/video calls.

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.9+** and npm
- A **MongoDB** connection string (local or Atlas)
- A **Clerk** application
- An **Agora** project for video meetings

### 1. Clone the repository

```bash
git clone https://github.com/Arjun7tripathi-newcode/Real-time-chating-Site.git
cd Real-time-chating-Site
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
CLERK_WEBHOOK_SECRET=whsec_your_secret

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatpro

# Standalone Socket.IO server (defaults to port 8080)
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080

# Agora video meetings
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

> Never commit `.env.local` or real API keys. Video meetings require valid Agora credentials. The standalone Node socket server uses port **8080** by default; `SOCKET_PORT` can be supplied in its process environment to change it.

### 4. Configure Clerk webhooks

In the [Clerk Dashboard](https://dashboard.clerk.com/), set up an endpoint pointing to:

```text
https://your-domain.com/api/webhooks/clerk
```

Subscribe to `user.created`, `user.updated`, and `user.deleted`, then copy the signing secret into `CLERK_WEBHOOK_SECRET`.

For local testing, expose the Next.js development server through a secure tunnel (such as `ngrok http 3000`) and use that HTTPS URL for the webhook endpoint.

### 5. Start both servers

**Terminal 1 — Next.js**

```bash
npm run dev
```

**Terminal 2 — Socket.IO**

```bash
npm run socket
```

Open **http://localhost:3000** in your browser.

### Available commands

| Command | Purpose |
|:--|:--|
| `npm run dev` | Start the Next.js development server |
| `npm run socket` | Start the standalone Socket.IO server |
| `npm run build` | Build the production Next.js app |
| `npm run start` | Start the production Next.js app |
| `npm run lint` | Run ESLint |

## 📂 Project Structure

```text
Real-time-chating-Site/
├── app/
│   ├── api/
│   │   ├── agora/token/          # RTC token endpoint
│   │   ├── conversations/        # Direct conversations
│   │   ├── groups/               # Private groups & messages
│   │   ├── meetings/             # Video meeting records
│   │   ├── messages/             # Direct messages & actions
│   │   ├── react/                # Message reactions
│   │   ├── rooms/                # Public / protected rooms
│   │   ├── users/                # Profiles & search
│   │   └── webhooks/clerk/       # User synchronization
│   ├── dashboard/page.tsx       # Main workspace
│   └── page.tsx                 # Landing page
├── components/
│   ├── chat/                    # Chat UI components
│   └── meet/                    # Video meeting UI
├── hooks/
│   ├── meet/use-agora.ts        # Agora lifecycle
│   ├── use-chat-store.ts        # Zustand chat state
│   └── use-socket.tsx           # Socket.IO client
├── lib/                         # MongoDB, IDs, helpers
├── models/                      # Mongoose schemas
├── socket/server.js             # Separate realtime service
├── proxy.ts                     # Clerk route middleware
└── package.json
```

## 🌐 Deployment

ChatPro has **two separately running services**: the Next.js app and the Socket.IO server.

| Service | Suggested hosting |
|:--|:--|
| Next.js web app | Vercel or a Node.js host |
| Socket.IO server | Railway, Render, Fly.io, or VPS |
| MongoDB | MongoDB Atlas |
| Authentication | Clerk |
| Audio/video | Agora |

Set the production `NEXT_PUBLIC_SOCKET_URL` to your deployed Socket.IO URL, configure the Clerk webhook with your public app domain, and add the environment variables to your hosting provider. The realtime service must remain running independently of serverless Next.js functions.

> **Before production:** The Socket.IO server currently permits all CORS origins and accepts room-join events without socket-level authorization checks. Restrict CORS, authenticate connections, verify room membership, use HTTPS/WSS, and review abuse/rate-limit protections before deploying for untrusted users. Do not treat interface labels as proof of end-to-end encryption.

## 🗺️ Roadmap

- [ ] Functional screen sharing in meetings
- [ ] File and image attachments
- [ ] Stronger authenticated Socket.IO room access
- [ ] Automated tests and CI checks
- [ ] Expanded meeting controls and settings

## 🤝 Contributing

Contributions, bug reports, and ideas are welcome. Open an [issue](https://github.com/Arjun7tripathi-newcode/Real-time-chating-Site/issues) to discuss changes, or fork the project and open a pull request.

## 👨‍💻 Built By

<div align="center">

**Arjun Tripathi**

[![GitHub](https://img.shields.io/badge/GitHub-Arjun7tripathi--newcode-181717?style=for-the-badge&logo=github)](https://github.com/Arjun7tripathi-newcode)

*Built to explore rich, real-time communication experiences on the modern web.*

**If you find this project useful, consider giving it a star. ⭐**

</div>
