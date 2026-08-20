# NexMeet

> A real-time video conferencing platform built with React, Node.js, Express, Socket.IO and WebRTC.

NexMeet is a full-stack video conferencing application that enables users to create and join meetings, communicate through real-time chat, and participate in peer-to-peer audio/video calls.

The project was built to understand and implement real-world concepts such as WebRTC, Socket.IO-based signaling, REST APIs, authentication, real-time communication, media device handling, and production deployment on AWS.

---

## 🌐 Live Demo

**Frontend:**  
https://nexmeet.saumyakhobragade.dev

**Backend API:**  
https://nexmeet-api.saumyakhobragade.dev

---

## ✨ Features

### 🎥 Video Conferencing

- Real-time peer-to-peer audio/video communication
- WebRTC-based media streaming
- Camera and microphone controls
- Participant management
- Remote video rendering
- WebRTC peer connection establishment
- Real-time participant join/leave notifications

### 🖥️ Screen Sharing

- Share the entire screen or an application window
- Dynamically replace the outgoing video track
- Continue communicating while screen sharing

### 💬 Real-Time Chat

- Real-time meeting chat
- Socket.IO-based message delivery
- Meeting-specific conversations
- Existing messages are loaded when participants join

### 👥 Meeting Rooms

- Create or join meetings using meeting codes
- Multiple participants can join the same meeting
- Participants are notified when users join or leave
- Each meeting maintains its own participant list

### 🔐 Authentication

- User registration
- User login
- Protected application routes
- Authentication state management
- Persistent user information

### 📊 Activity & History

- User activity tracking
- Meeting-related activity records
- User history

### 📱 Responsive Interface

- Responsive meeting interface
- Mobile-friendly layouts
- Dedicated controls for camera, microphone, screen sharing, chat, and leaving meetings

---

# 🧠 How NexMeet Works

NexMeet uses different technologies for different communication requirements.

### REST API

Used for:

- Authentication
- User management
- Activity tracking
- History
- Persistent application data

### Socket.IO

Used for:

- Real-time signaling
- Participant events
- Chat messages
- WebRTC signaling messages

### WebRTC

Used for:

- Audio transmission
- Video transmission
- Peer-to-peer media communication

The Node.js server does **not** continuously stream participants' audio/video.

Instead, Socket.IO is primarily responsible for signaling while WebRTC establishes the actual peer-to-peer media connection.

```text
                         NexMeet
                            │
                ┌───────────┴───────────┐
                │                       │
             REST API               Socket.IO
                │                       │
                ▼                       ▼
        Application Data          Signaling + Chat
                                        │
                                        ▼
                                    WebRTC
                                        │
                                Peer-to-Peer Media
                                  ↙           ↘
                             Browser A     Browser B
                                🎥             🎥
```

---

# 🏗️ System Architecture

```text
                         Internet
                            │
                            ▼
                    ┌───────────────┐
                    │     Nginx     │
                    │ Reverse Proxy │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
      nexmeet.saumyakhobragade.dev
                                    nexmeet-api.saumyakhobragade.dev
              │                           │
              ▼                           ▼
       React/Vite Build              Node.js
              │                     + Express
              │                           │
              │                      Socket.IO
              │                           │
              │                        MongoDB
              │
              └──────────────┐
                             │
                             ▼
                         Web Browser
                             │
                       WebRTC Signaling
                             │
                             ▼
                    Peer-to-Peer Connection
                         ↙           ↘
                    User A           User B
```

---

# 🔄 Video Call Flow

The video calling system follows a WebRTC signaling process.

### 1. User connects

The browser establishes a Socket.IO connection with the backend.

```text
Browser
   │
   │ Socket.IO Connection
   ▼
Node.js + Socket.IO
```

### 2. User joins a meeting

The client emits:

```javascript
socket.emit("join-call", meetingCode);
```

The backend maintains a list of connected socket IDs for each meeting.

Conceptually:

```javascript
connections = {
    meetingCode: [
        socketId1,
        socketId2,
        socketId3
    ]
};
```

### 3. Participant notification

Existing participants are notified when another participant joins.

```text
User B
   │
   │ user-joined
   ▼
User A
```

### 4. WebRTC Offer

A participant creates an `RTCPeerConnection` and generates an SDP offer.

```text
User A
   │
   │ createOffer()
   ▼
SDP Offer
```

The offer is sent through Socket.IO.

```text
User A
   │
   │ signal
   ▼
Socket.IO Server
   │
   │ signal
   ▼
User B
```

### 5. WebRTC Answer

The receiving participant sets the remote description and generates an answer.

```text
User B
   │
   │ createAnswer()
   ▼
SDP Answer
   │
   ▼
Socket.IO
   │
   ▼
User A
```

### 6. ICE Candidate Exchange

Both browsers generate ICE candidates.

These candidates are exchanged through Socket.IO.

```text
User A
   │
   │ ICE Candidate
   ▼
Socket.IO
   │
   ▼
User B

User B
   │
   │ ICE Candidate
   ▼
Socket.IO
   │
   ▼
User A
```

STUN helps browsers discover suitable network candidates for establishing the peer-to-peer connection.

### 7. Peer-to-Peer Media

Once the WebRTC connection is established, audio and video can flow directly between participants.

```text
             Socket.IO
          Signaling Only
             ↕     ↕
          User A User B
             ╲     ╱
              ╲   ╱
              WebRTC
          Audio + Video
```

The backend does not act as the media server.

---

# 💬 Chat Architecture

Chat is implemented independently using Socket.IO.

When a participant sends a message:

```text
User A
   │
   │ chat-message
   ▼
Socket.IO Server
   │
   ├───────────────┐
   ▼               ▼
User A           User B
```

Messages are associated with the relevant meeting so participants in other meetings do not receive them.

---

# 🧩 Backend Architecture

The backend handles:

- Authentication
- User APIs
- MongoDB communication
- Meeting operations
- Socket.IO connections
- WebRTC signaling
- Real-time chat
- Participant tracking
- Activity tracking

The backend is primarily responsible for application logic and signaling rather than transmitting the actual WebRTC media.

---

# 🗂️ Project Structure

```text
NexMeet/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── .env
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── contexts/
│   │   ├── pages/
│   │   │   ├── Authentication.jsx
│   │   │   ├── History.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Landing.jsx
│   │   │   └── VideoMeet.jsx
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── environment.js
│   ├── .env
│   ├── .env.production
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- JavaScript
- Axios
- Socket.IO Client
- WebRTC
- Tailwind CSS
- CSS

## Backend

- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose

## Authentication

- JWT-based authentication
- Protected routes
- Backend authentication APIs

## Real-Time Communication

- Socket.IO
- WebRTC
- STUN
- ICE candidate exchange

## Deployment

- AWS EC2
- Amazon Linux
- Nginx
- PM2
- Elastic IP
- Name.com DNS
- HTTPS / SSL

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git
- MongoDB or MongoDB Atlas

Check your versions:

```bash
node --version
npm --version
git --version
```

---

# 📥 Clone the Repository

```bash
git clone https://github.com/SaumyaKhobragade/NexMeet.git
cd NexMeet
```

---

# ⚙️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional environment variables required by the backend.

Start the backend:

```bash
npm start
```

The backend should be available at:

```text
http://localhost:3000
```

---

# 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🌎 Environment Configuration

NexMeet uses Vite environment variables for configuring the backend URL.

## Development

`.env`

```env
VITE_API_URL=http://localhost:3000
```

## Production

`.env.production`

```env
VITE_API_URL=https://nexmeet-api.saumyakhobragade.dev
```

The frontend accesses the configured backend through:

```javascript
const server = import.meta.env.VITE_API_URL;

export default server;
```

### Important

Vite injects `VITE_*` variables during the build process.

Whenever the environment variable changes, rebuild the frontend:

```bash
npm run build
```

---

# 🔐 Environment Variable Security

Never commit sensitive credentials to GitHub.

Examples of secrets that should remain private:

```text
MongoDB credentials
JWT secrets
API keys
Database passwords
Private service credentials
```

Use `.gitignore` to keep environment files out of Git.

A safe `.env.example` can be provided without containing real credentials.

---

# 🏭 Production Build

Create a production build:

```bash
cd frontend
npm run build
```

Vite generates:

```text
frontend/
└── dist/
    ├── index.html
    └── assets/
```

The `dist` directory is served by Nginx in production.

---

# ☁️ AWS Deployment

NexMeet is deployed on an AWS EC2 instance.

The production server uses:

- AWS EC2
- Elastic IP
- Amazon Linux
- Nginx
- PM2
- MongoDB Atlas
- HTTPS

Architecture:

```text
Internet
   │
   ▼
AWS EC2
   │
   ├── Nginx
   ├── Node.js
   ├── PM2
   └── NexMeet
```

---

# 🌐 Domain Configuration

### Frontend

```text
https://nexmeet.saumyakhobragade.dev
```

### Backend

```text
https://nexmeet-api.saumyakhobragade.dev
```

Both domains point to the EC2 Elastic IP using DNS records configured through Name.com.

---

# 🔀 Nginx Reverse Proxy

Nginx acts as the public-facing reverse proxy.

Frontend:

```text
nexmeet.saumyakhobragade.dev
        │
        ▼
      Nginx
        │
        ▼
frontend/dist
```

Backend:

```text
nexmeet-api.saumyakhobragade.dev
        │
        ▼
      Nginx
        │
        ▼
localhost:3000
        │
        ▼
Node.js + Express
```

Nginx also proxies Socket.IO/WebSocket traffic.

---

# 🔒 HTTPS

Production traffic is served over HTTPS:

```text
https://nexmeet.saumyakhobragade.dev
https://nexmeet-api.saumyakhobragade.dev
```

HTTPS is important for NexMeet because browser APIs such as camera access, microphone access, and screen sharing require a secure context in production.

Socket.IO therefore operates through a secure WebSocket connection:

```text
wss://nexmeet-api.saumyakhobragade.dev/socket.io/
```

---

# ⚡ PM2

PM2 keeps the Node.js backend running in production.

Check running processes:

```bash
pm2 status
```

View backend logs:

```bash
pm2 logs nexmeet-backend
```

Restart the backend:

```bash
pm2 restart nexmeet-backend
```

Save the PM2 process list:

```bash
pm2 save
```

---

# 🔄 Production Deployment Workflow

After making changes locally:

```bash
git add .
git commit -m "your commit message"
git push origin main
```

SSH into EC2 and pull the latest changes:

```bash
cd ~/NexMeet
git pull origin main
```

## Backend

```bash
cd backend
npm install
pm2 restart nexmeet-backend
```

Verify:

```bash
pm2 status
pm2 logs nexmeet-backend --lines 30
```

## Frontend

```bash
cd ../frontend
npm install
npm run build
```

Nginx automatically serves the newly generated `dist` files.

---

# 🔄 Complete Deployment Command Sequence

When both frontend and backend have changed:

```bash
cd ~/NexMeet

git pull origin main

cd backend
npm install
pm2 restart nexmeet-backend

cd ../frontend
npm install
npm run build
```

Verify:

```bash
pm2 status
pm2 logs nexmeet-backend --lines 30
```

---

# 🔌 Socket.IO Architecture

Socket.IO handles the real-time communication layer.

The server maintains connected users and meeting participants.

Conceptually:

```javascript
connections = {
    meetingCode: [
        socketId1,
        socketId2,
        socketId3
    ]
};
```

When a participant joins:

```text
join-call
    │
    ▼
Server identifies meeting
    │
    ▼
Socket ID added to meeting
    │
    ▼
Existing participants notified
```

---

# 📡 WebRTC Signaling

Socket.IO is used to exchange WebRTC signaling information.

The server acts as a relay:

```javascript
socket.on("signal", (toId, message) => {
    io.to(toId).emit("signal", socket.id, message);
});
```

This allows participants to exchange:

- SDP offers
- SDP answers
- ICE candidates

The server does not process the actual video stream.

---

# 🎥 WebRTC Media Flow

After signaling and ICE negotiation are completed:

```text
Browser A
    │
    │ WebRTC
    │ Audio + Video
    ▼
Browser B
```

The media connection is peer-to-peer.

---

# 🧊 ICE and STUN

WebRTC uses ICE to determine how two peers can communicate.

Candidates can include:

```text
Host candidates
Server-reflexive candidates
Other network candidates
```

STUN helps browsers discover public-facing network information.

Candidates are exchanged through Socket.IO:

```text
Browser A
   │
   │ ICE Candidate
   ▼
Socket.IO
   │
   ▼
Browser B
```

---

# 🧪 Testing

## Local Testing

Start the backend:

```bash
cd backend
npm start
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Video Meeting Testing

1. Open NexMeet in one browser.
2. Open NexMeet in another browser or Incognito window.
3. Log in with the required accounts.
4. Join the same meeting.
5. Verify that participants appear.
6. Test the camera.
7. Test the microphone.
8. Test screen sharing.
9. Test real-time chat.
10. Leave and rejoin the meeting.

---

# 🔍 Debugging Socket.IO

Backend logs:

```bash
pm2 logs nexmeet-backend
```

A successful connection should generate:

```text
A user connected: <socket-id>
```

During WebRTC negotiation, signaling messages and ICE candidates can also be observed through backend logs when debugging is enabled.

---

# 🔍 Debugging WebRTC

Chrome provides a dedicated WebRTC debugging page:

```text
chrome://webrtc-internals/
```

Useful states include:

```text
iceConnectionState
connectionState
signalingState
iceGatheringState
```

A successful connection should eventually reach:

```text
iceConnectionState: connected
connectionState: connected
```

---

# 🐛 Common Deployment Issues

## `VITE_API_URL` is Undefined

If the frontend sends a request similar to:

```text
https://nexmeet.saumyakhobragade.dev/undefined/api/...
```

the production environment variable was not available when the Vite build was generated.

Verify:

```bash
cat .env.production
```

Make sure it contains:

```env
VITE_API_URL=https://nexmeet-api.saumyakhobragade.dev
```

Then rebuild:

```bash
npm run build
```

---

## Frontend Changes Are Not Appearing

Run:

```bash
npm run build
```

Then perform a hard refresh:

```text
Ctrl + Shift + R
```

Vite environment variables and frontend source changes are incorporated into the production bundle during the build.

---

## Backend Changes Are Not Appearing

Restart PM2:

```bash
pm2 restart nexmeet-backend
```

Then inspect:

```bash
pm2 logs nexmeet-backend
```

---

## Socket.IO Connection Problems

Open:

```text
DevTools → Network → WS
```

A successful WebSocket upgrade should show:

```text
101 Switching Protocols
```

The production Socket.IO endpoint is:

```text
https://nexmeet-api.saumyakhobragade.dev/socket.io/
```

---

# 📈 Scalability Considerations

The current architecture is designed primarily as a learning and portfolio project and uses a single EC2 instance.

A larger production deployment could introduce:

- Multiple backend instances
- Load balancing
- Redis
- Socket.IO Redis adapter
- Dedicated TURN infrastructure
- Database scaling
- Centralized logging
- Monitoring
- Auto Scaling
- Containerization

For larger video conferencing systems, an SFU-based architecture could also be introduced instead of relying entirely on peer-to-peer WebRTC connections.

---

# 🚧 Current Limitations

NexMeet is primarily an educational and portfolio project.

Current limitations include:

- Peer-to-peer WebRTC architecture
- Single EC2 deployment
- Limited horizontal scalability
- No dedicated TURN infrastructure
- Limited observability
- No automated CI/CD pipeline
- Limited cross-browser testing
- Meeting state is maintained by the backend process
- Large meetings may become inefficient with pure peer-to-peer connections

---

# 🔮 Future Improvements

- [ ] Meeting scheduling
- [ ] Improved meeting history
- [ ] Participant display names
- [ ] Mute/unmute indicators
- [ ] Participant count
- [ ] Host controls
- [ ] Waiting room
- [ ] Meeting recording
- [ ] Virtual backgrounds
- [ ] Improved mobile UI
- [ ] Better Safari and Firefox compatibility
- [ ] TURN server support
- [ ] Automated testing
- [ ] GitHub Actions CI/CD
- [ ] Centralized logging
- [ ] Monitoring and health checks
- [ ] Docker containerization
- [ ] Redis-based distributed Socket.IO state
- [ ] SFU-based media architecture for larger meetings

---

# 🎓 What I Learned

NexMeet was built as a practical project to understand real-time full-stack applications and WebRTC.

### React

- Component-based architecture
- State management
- Hooks
- `useEffect`
- Forms
- API integration
- Conditional rendering
- Reusable components

### Backend Development

- REST API development
- Express.js
- Middleware
- Authentication
- MongoDB
- Mongoose
- API integration

### Real-Time Systems

- WebSockets
- Socket.IO
- Event-driven communication
- Real-time chat
- Participant management
- WebRTC signaling

### WebRTC

- `RTCPeerConnection`
- SDP offers
- SDP answers
- ICE candidates
- STUN
- Media streams
- Camera and microphone APIs
- Screen sharing
- Peer-to-peer media communication

### Deployment

- AWS EC2
- Elastic IP
- Nginx
- PM2
- DNS configuration
- HTTPS
- Reverse proxying
- WebSocket proxying
- Production environment variables

---

# 🧠 Key Architectural Takeaway

One of the primary concepts demonstrated by NexMeet is the separation between **signaling** and **media transport**.

```text
                    SIGNALING

        ┌─────────────────────────────┐
        │                             │
        ▼                             ▼
    Browser A                     Browser B
        │                             │
        └───────── Socket.IO ─────────┘
                       │
                    Server


                     MEDIA

        ┌─────────────────────────────┐
        │                             │
        ▼                             ▼
    Browser A ◄────── WebRTC ──────► Browser B
```

Socket.IO helps peers discover and negotiate with each other.

WebRTC establishes the actual peer-to-peer audio/video connection.

This separation is fundamental to understanding how real-time video conferencing systems are structured.

---

# 📚 Project Purpose

NexMeet was developed as a practical full-stack project while learning the MERN stack and real-time communication technologies.

The primary goal was to understand the engineering concepts behind:

- Real-time applications
- Video conferencing
- WebRTC
- WebSocket communication
- Authentication
- REST APIs
- Production deployment

Rather than attempting to reproduce the complete infrastructure of commercial platforms such as Zoom or Google Meet, NexMeet focuses on implementing the core concepts behind such systems.

---

# ⚠️ Disclaimer

NexMeet is an educational and portfolio project.

It is not intended to replace production-grade video conferencing infrastructure and currently has limitations in scalability, reliability, monitoring, and cross-browser compatibility.

---

# 👨‍💻 Author

**Saumya Khobragade**

Computer Science Student

GitHub:  
https://github.com/SaumyaKhobragade/NexMeet

---

# ⭐ Support

If you found this project interesting or useful for learning React, Socket.IO, WebRTC, or full-stack development, consider giving the repository a ⭐.

---

## License

This project is intended for educational and portfolio purposes.
