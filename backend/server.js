import path from "path";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from 'http';
import { Server } from 'socket.io';

import { handleOffer, handleAnswer, handleIceCandidate } from './socket/webrtcSignaling.js';
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectToMongoDB from "./db/connectToMongoDB.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this to your frontend's URL if needed for security
        methods: ["GET", "POST"]
    }
});

// Connect to MongoDB
connectToMongoDB();

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Route setup
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use(express.static(path.join(__dirname, "/frontend/dist")));

// Fallback to serve the frontend
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// WebRTC STUN/TURN server configuration
const stunTurnServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }, // Public STUN server
        {
            urls: 'turn:YOUR_TURN_SERVER_IP:3478', // Replace with your TURN server
            username: 'your_username',
            credential: 'your_credential'
        }
    ]
};

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // WebRTC signaling handlers
    socket.on('webrtc-offer', (data) => {
        handleOffer(socket, data);
    });

    socket.on('webrtc-answer', (data) => {
        handleAnswer(socket, data);
    });

    socket.on('webrtc-ice-candidate', (data) => {
        handleIceCandidate(socket, data);
    });

    // Additional existing Socket.io handlers
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

    // Example: Chat message handler
    socket.on('chat-message', (msg) => {
        console.log('Message received:', msg);
        // Broadcast message to all clients
        io.emit('chat-message', msg);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
