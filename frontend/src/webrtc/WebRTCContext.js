// src/webrtc/WebRTCContext.js

import React, { createContext, useContext, useRef } from 'react';
import socket from '../socket';

const WebRTCContext = createContext();

export const useWebRTC = () => {
    return useContext(WebRTCContext);
};

export const WebRTCContextProvider = ({ children }) => {
    const peerConnection = useRef(null);
    const dataChannel = useRef(null);

    const createPeerConnection = (targetId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:YOUR_TURN_SERVER_IP:3478',
                    username: 'your_username',
                    credential: 'your_credential'
                }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtc-ice-candidate', {
                    target: targetId,
                    candidate: event.candidate
                });
            }
        };

        pc.ondatachannel = (event) => {
            dataChannel.current = event.channel;
        };

        return pc;
    };

    const createOffer = async (targetId) => {
        peerConnection.current = createPeerConnection(targetId);
        dataChannel.current = peerConnection.current.createDataChannel('chat');
        
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit('webrtc-offer', {
            target: targetId,
            offer: peerConnection.current.localDescription
        });
    };

    const createAnswer = async (offer, targetId) => {
        peerConnection.current = createPeerConnection(targetId);
        await peerConnection.current.setRemoteDescription(offer);

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit('webrtc-answer', {
            target: targetId,
            answer: peerConnection.current.localDescription
        });
    };

    const addIceCandidate = async (candidate) => {
        if (peerConnection.current) {
            await peerConnection.current.addIceCandidate(candidate);
        }
    };

    const sendMessage = (message) => {
        if (dataChannel.current) {
            dataChannel.current.send(message);
        } else {
            console.error('Data channel is not established.');
        }
    };

    return (
        <WebRTCContext.Provider value={{ createOffer, createAnswer, addIceCandidate, sendMessage }}>
            {children}
        </WebRTCContext.Provider>
    );
};
