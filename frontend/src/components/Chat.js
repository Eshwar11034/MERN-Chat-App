// src/components/Chat.js

import React, { useState } from 'react';
import { useWebRTC } from '../webrtc/WebRTCContext';
import socket from '../socket';

const Chat = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const { createOffer, createAnswer, addIceCandidate, sendMessage } = useWebRTC();

    // Example: Sending a message
    const handleSendMessage = () => {
        sendMessage(message);
        setMessages([...messages, { text: message, sender: 'Me' }]);
        setMessage('');
    };

    // Handle incoming WebRTC messages
    socket.on('webrtc-offer', async (data) => {
        await createAnswer(data.offer, data.sender);
    });

    socket.on('webrtc-answer', async (data) => {
        await peerConnection.current.setRemoteDescription(data.answer);
    });

    socket.on('webrtc-ice-candidate', async (data) => {
        await addIceCandidate(data.candidate);
    });

    return (
        <div>
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.sender}: </strong> {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default Chat;
