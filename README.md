# Sawari - MERN Ride-Hailing Platform 🚖

Sawari is a full-stack, real-time ride-hailing application built with the MERN stack (MongoDB, Express, React, Node.js). It provides a seamless experience for both passengers and captains (drivers) to connect, track rides in real-time, and chat on the go.

## ✨ Key Features

### 🗺️ Live Tracking & ETA
- **Interactive Maps:** Real-time map rendering using 
eact-leaflet.
- **Live ETA:** Intelligently calculates and displays distance and Estimated Time of Arrival (ETA) dynamically using geospatial data.
- **Auto-Camera Tracking:** The passenger's map automatically centers and tracks the Captain's moving vehicle without reloading or spamming API requests.

### 💬 Real-Time In-Ride Chat
- **Bi-Directional Websockets:** Persistent chat implementation powered by Socket.io allowing direct communication between passenger and captain.
- **Unread Badges:** Floating action toggles that notify users when they receive a message.
- **Seamless UI Overlay:** Chat panels slide up elegantly without disrupting the live map view.

### 👤 Profiles & ImageKit Integration
- **Avatar Uploads:** Integrated with ImageKit SDK for secure, scalable profile picture uploads during registration.
- **Captain Dashboards:** Drivers have access to a rich dashboard displaying their avatar, earnings, and trip metrics.
- **User Profile Management:** Dedicated profile screens for passengers to manage their account.

### 🎨 Beautiful & Fluid UI (Phase 1)
- **Sawari Theme:** A cohesive Emerald/Navy design language matching modern ride-share apps.
- **GSAP Animations:** Butter-smooth modal, sliding, and minimizing animations.
- **Collapsible Panels:** E.g., The passenger's WaitingForDriver panel intelligently collapses into a 90px sticky header that keeps the OTP visible at all times, maximizing map visibility.
- **Contextual Hiding:** Intelligent UI that auto-hides search forms when a ride is pending or active.

### 🔒 Reliability & Bug Prevention
- **Resilient State:** Safely re-hydrates GPS and map markers if a user accidentally refreshes the browser during a ride.
- **Ghost Ping Interception:** Prevents captains from accepting cancelled rides and dynamically removes stale UI popups.
- **Advanced State Sync:** Bi-directional websocket listeners accurately broadcast 
ide-cancelled and 
ide-confirmed events to keep both parties exactly in sync.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- GSAP (Animations)
- React Router DOM
- React-Leaflet (Maps)
- Axios
- Socket.io-client

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Socket.io
- JSON Web Tokens (JWT) & bcrypt (Authentication)
- express-validator (Data sanitization)
- ImageKit (Image hosting)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- ImageKit Account (for avatar uploads)

### Backend Setup
1. Navigate to the backend directory:
   \\ash
   cd backend
   \2. Install dependencies:
   \\ash
   npm install
   \3. Create a .env file in the ackend directory and add the following:
   \\env
   PORT=3000
   DB_CONNECT=<Your MongoDB Connection String>
   JWT_SECRET=<Your JWT Secret>
   IMAGEKIT_PUBLIC_KEY=<Your ImageKit Public Key>
   IMAGEKIT_PRIVATE_KEY=<Your ImageKit Private Key>
   IMAGEKIT_URL_ENDPOINT=<Your ImageKit URL Endpoint>
   \4. Start the server:
   \\ash
   npm start
   \
### Frontend Setup
1. Navigate to the frontend directory:
   \\ash
   cd frontend
   \2. Install dependencies:
   \\ash
   npm install
   \3. Create a .env file in the rontend directory and add the following:
   \\env
   VITE_BASE_URL=http://localhost:3000
   VITE_IMAGEKIT_PUBLIC_KEY=<Your ImageKit Public Key>
   VITE_IMAGEKIT_URL_ENDPOINT=<Your ImageKit URL Endpoint>
   \4. Start the development server:
   \\ash
   npm run dev
   \
---

## 🗂️ Project Structure

- **ackend/**
  - **controllers/**: Core logic for rides, users, captains, and maps.
  - **models/**: Mongoose schemas (User, Captain, Ride).
  - **
outes/**: Express routes.
  - **services/**: Complex business logic, matching algorithms, and ETA calculations.
  - **socket.js**: Centralized Socket.io implementation.
  - **utils/**: Helper utilities (logger, imagekit).

- **rontend/src/**
  - **components/**: Reusable UI components (LiveTracking, RidePopUp, WaitingForDriver, RideChat).
  - **context/**: React Context API for global state (User, Captain, Socket).
  - **pages/**: Main views (Home, Riding, CaptainHome).

---

## 🤝 Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).