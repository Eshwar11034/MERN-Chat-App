// Importing socket.io library
import { Server } from 'socket.io';

// WebRTC Offer handler
export const handleOffer = (socket, data) => {
    console.log('Handling WebRTC offer from:', data.sender);
    // Send the offer to the intended peer
    socket.to(data.target).emit('webrtc-offer', data);
};

// WebRTC Answer handler
export const handleAnswer = (socket, data) => {
    console.log('Handling WebRTC answer from:', data.sender);
    // Send the answer to the intended peer
    socket.to(data.target).emit('webrtc-answer', data);
};

// WebRTC ICE Candidate handler
export const handleIceCandidate = (socket, data) => {
    console.log('Handling WebRTC ICE candidate from:', data.sender);
    // Send the ICE candidate to the intended peer
    socket.to(data.target).emit('webrtc-ice-candidate', data);
};
