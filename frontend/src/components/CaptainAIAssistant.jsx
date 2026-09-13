import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";

const CaptainAIAssistant = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [threadId] = useState(uuidv4());
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setIsLoading(true);

        try {
            const token = localStorage.getItem("captain-token") || document.cookie.split("captain-token=")[1]?.split(";")[0];
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/ai/chat/captain`, 
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

        const cleanText = (msg.text || "").replace(/```json[\s\S]*?```/g, "").trim();
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-[#0f172a] flex items-center justify-center text-white shadow-md">
                        <i className="ri-robot-2-fill text-xl"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#0f172a]">Sawari Copilot</h3>
                        <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Online
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
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-200">
                            <i className="ri-steering-2-fill text-4xl"></i>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">I am your Sawari Copilot.</p>
                            <p className="text-xs mt-1">Ask me about optimal routes, busy areas, or earnings insights!</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => renderMessage(msg, idx))}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-2 py-1.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
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
                        className="bg-[#0f172a] text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400 shadow-md hover:bg-emerald-600 transition-colors shrink-0"
                        disabled={!input.trim() || isLoading}
                    >
                        <i className="ri-send-plane-fill text-lg ml-0.5"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CaptainAIAssistant;
