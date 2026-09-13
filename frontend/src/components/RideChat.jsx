import React, { useState, useEffect, useRef } from 'react';
import { socketContextData } from '../context/SocketContext';

const RideChat = ({ ride, currentUserType, onClose }) => {
    const { socket, sendMessage, receiveMessage } = React.useContext(socketContextData) || {};
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (ride?.messages) {
            setMessages(ride.messages);
        }
    }, [ride]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!socket || !receiveMessage) return;

        const cleanup = receiveMessage("receive-chat-message", (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return cleanup;
    }, [socket, receiveMessage]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket || !sendMessage) return;

        const msgData = {
            rideId: ride._id,
            message: input.trim(),
            senderType: currentUserType
        };

        sendMessage("send-chat-message", msgData);
        
        // Optimistically add to local state
        setMessages(prev => [...prev, {
            senderType: currentUserType,
            content: input.trim(),
            timestamp: new Date().toISOString()
        }]);
        
        setInput('');
    };

    const isUser = currentUserType === 'user';
    const otherName = isUser 
        ? (ride?.captain?.fullname?.firstname || 'Captain') 
        : (ride?.user?.fullname?.firstname || 'Passenger');
        
    const otherAvatar = isUser
        ? ride?.captain?.avatarUrl
        : ride?.user?.avatarUrl;

    return (
        <div className="flex flex-col h-full bg-gray-50 relative">
            <div className="flex items-center gap-4 p-4 bg-white border-b border-gray-100 shadow-sm shrink-0">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                    <i className="ri-arrow-left-s-line text-2xl text-gray-600"></i>
                </button>
                <div className="flex items-center gap-3">
                    {otherAvatar ? (
                        <img src={otherAvatar} alt={otherName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <i className="ri-user-fill text-lg"></i>
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-[#0f172a]">{otherName}</h3>
                        <p className="text-xs text-emerald-600 font-semibold">Online</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        <i className="ri-chat-3-line text-4xl mb-2 block"></i>
                        No messages yet.<br/>Send a message to coordinate your ride.
                    </div>
                )}
                
                {messages.map((msg, idx) => {
                    const isMine = msg.senderType === currentUserType;
                    return (
                        <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl ${isMine ? 'bg-emerald-500 text-white rounded-br-sm shadow-emerald-500/20 shadow-md' : 'bg-white text-[#0f172a] border border-gray-100 shadow-sm rounded-bl-sm'}`}>
                                <p className="text-[15px] leading-snug">{msg.content}</p>
                                <p className={`text-[10px] mt-1 font-medium ${isMine ? 'text-emerald-100' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shrink-0 pb-safe">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..." 
                        className="flex-1 bg-gray-100 rounded-full px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        <i className="ri-send-plane-fill text-lg"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RideChat;
