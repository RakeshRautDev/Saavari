import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";

const AIAssistant = ({ role = "passenger" }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [threadId] = useState(uuidv4());
    const [isLoading, setIsLoading] = useState(false);
    const [processedWidgets, setProcessedWidgets] = useState({});

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setIsLoading(true);

        try {
            const tokenType = role === "captain" ? "captain-token" : "user-token";
            const token = localStorage.getItem(tokenType) || document.cookie.split(tokenType + "=")[1]?.split(";")[0];
            const endpoint = role === "captain" ? "/ai/chat/captain" : "/ai/chat";
            
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}${endpoint}`, 
                { message: userMsg, threadId },
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true 
                }
            );

            setMessages(prev => [...prev, { role: "agent", text: response.data.response }]);
        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: "agent", text: "Sorry, I am having trouble connecting right now." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmRide = async (draft, idx) => {
        setProcessedWidgets(prev => ({ ...prev, [idx]: 'loading' }));
        try {
            const token = localStorage.getItem("user-token") || document.cookie.split("user-token=")[1]?.split(";")[0];
            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, 
                {
                    pickup: draft.pickup,
                    destination: draft.destination,
                    vehicleType: draft.vehicleType
                },
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true 
                }
            );
            window.dispatchEvent(new CustomEvent('ride-created-by-ai'));
            setMessages(prev => [...prev, { role: "agent", text: "Ride created successfully! You can track it on the main map." }]);
            setProcessedWidgets(prev => ({ ...prev, [idx]: 'success' }));
        } catch (error) {
            setMessages(prev => [...prev, { role: "agent", text: "Failed to create ride." }]);
            setProcessedWidgets(prev => ({ ...prev, [idx]: 'error' }));
        }
    };

    const renderMessage = (msg, idx) => {
        if (msg.role === "user") {
            return (
                <div key={idx} className="flex justify-end mb-4">
                    <div className="px-4 py-3 rounded-2xl max-w-[85%] text-[15px] bg-[#0f172a] text-white rounded-br-sm shadow-md">
                        {msg.text}
                    </div>
                </div>
            );
        }

        // Try to parse json block
        let textToRender = msg.text || "";
        const jsonMatch = textToRender.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            try {
                const data = JSON.parse(jsonMatch[1]);
                if (data.ui_action === "CONFIRM_RIDE_WIDGET") {
                    const status = processedWidgets[idx];
                    return (
                        <div key={idx} className="flex justify-start mb-4">
                            <div className="p-4 rounded-2xl w-[90%] bg-white border border-gray-100 text-[#0f172a] rounded-bl-sm shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <i className="ri-taxi-fill"></i>
                                    </div>
                                    <h4 className="font-bold text-base">Ride Draft</h4>
                                </div>
                                <div className="flex flex-col gap-2 mb-4 text-sm text-gray-600">
                                    <div className="flex gap-3 items-start">
                                        <i className="ri-map-pin-user-fill text-gray-400 mt-1"></i>
                                        <p>{data.draft.pickup}</p>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <i className="ri-map-pin-2-fill text-blue-500 mt-1"></i>
                                        <p>{data.draft.destination}</p>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mt-1">
                                        <span className="font-medium capitalize">{data.draft.vehicleType}</span>
                                        <span className="font-bold text-[#0f172a]">₹{data.draft.estimatedFare}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleConfirmRide(data.draft, idx)}
                                    disabled={status === 'loading' || status === 'success'}
                                    className={`w-full text-white font-semibold py-3 rounded-xl transition-all shadow-md ${
                                        status === 'success' ? 'bg-gray-400' : 
                                        status === 'loading' ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    {status === 'success' ? 'Booked' : status === 'loading' ? 'Booking...' : 'Confirm & Book'}
                                </button>
                            </div>
                        </div>
                    );
                }

                if (data.ui_action === "CONFIRM_CANCEL_WIDGET") {
                    const status = processedWidgets[idx];
                    return (
                        <div key={idx} className="flex justify-start mb-4">
                            <div className="p-4 rounded-2xl w-[90%] bg-white border border-red-100 text-[#0f172a] rounded-bl-sm shadow-[0_4px_20px_rgba(239,68,68,0.1)]">
                                <h4 className="font-bold mb-2 text-red-600 flex items-center gap-2">
                                    <i className="ri-error-warning-fill"></i> Cancel Ride
                                </h4>
                                <p className="text-sm mb-4 text-gray-600">Are you sure you want to cancel this ride?</p>
                                <button 
                                    onClick={async () => {
                                        setProcessedWidgets(prev => ({ ...prev, [idx]: 'loading' }));
                                        try {
                                            const token = localStorage.getItem("user-token") || document.cookie.split("user-token=")[1]?.split(";")[0];
                                            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/cancel-user`, 
                                                { rideId: data.draft.rideId },
                                                { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
                                            );
                                            setMessages(prev => [...prev, { role: "agent", text: "Ride cancelled successfully." }]);
                                            setProcessedWidgets(prev => ({ ...prev, [idx]: 'success' }));
                                        } catch (e) {
                                            setMessages(prev => [...prev, { role: "agent", text: "Failed to cancel ride." }]);
                                            setProcessedWidgets(prev => ({ ...prev, [idx]: 'error' }));
                                        }
                                    }}
                                    disabled={status === 'loading' || status === 'success'}
                                    className={`w-full text-white font-semibold py-3 rounded-xl transition-colors ${
                                        status === 'success' ? 'bg-gray-400' : 
                                        status === 'loading' ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                                >
                                    {status === 'success' ? 'Cancelled' : status === 'loading' ? 'Cancelling...' : 'Confirm Cancel'}
                                </button>
                            </div>
                        </div>
                    );
                }
            } catch (e) {
                // Ignore parse errors, fallback to text
            }
        }

        const cleanText = (textToRender || "").replace(/```json[\s\S]*?```/g, "").trim();
        if (!cleanText) return null;

        return (
            <div key={idx} className="flex justify-start mb-4">
                <div className="px-4 py-3 rounded-2xl max-w-[85%] text-[15px] bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm prose prose-sm prose-p:leading-relaxed prose-li:my-0 max-w-none">
                    <ReactMarkdown>
                        {cleanText}
                    </ReactMarkdown>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-gray-50/80">
            {/* Header */}
            <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-[#0f172a] flex items-center justify-center text-white shadow-md">
                        <i className="ri-robot-2-fill text-xl"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#0f172a]">Sawari AI</h3>
                        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Online
                        </p>
                    </div>
                </div>
                <div 
                    className="text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 bg-gray-100 px-2 py-1 rounded"
                    onClick={() => {
                        navigator.clipboard.writeText(threadId);
                        alert("Thread ID copied to clipboard!");
                    }}
                    title="Copy Thread ID"
                >
                    ID
                </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4 text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-200">
                            <i className="ri-chat-smile-3-line text-4xl"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">I am Sawari's AI assistant.</p>
                            <p className="text-xs mt-1">Ask me to book a ride, check fares, or help you find nearby places!</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => renderMessage(msg, idx))}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-2 py-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <input 
                        type="text" 
                        className="flex-1 bg-transparent px-4 py-2 text-[15px] outline-none text-[#0f172a] placeholder:text-gray-400"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button 
                        onClick={handleSend}
                        className="bg-[#0f172a] text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400 shadow-md hover:bg-blue-600 transition-colors shrink-0"
                        disabled={!input.trim() || isLoading}
                    >
                        <i className="ri-send-plane-fill text-lg ml-0.5"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
