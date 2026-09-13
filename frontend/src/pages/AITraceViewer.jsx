import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AITraceViewer = () => {
    const [threadId, setThreadId] = useState('');
    const [trace, setTrace] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTrace = async (e) => {
        e.preventDefault();
        if (!threadId) return;
        setLoading(true);
        setError(null);
        setTrace(null);
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/ai/trace/${threadId}`);
            setTrace(res.data.trace);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-mono text-sm">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">AI Internal Trace Viewer</h1>
                    <Link to="/admin" className="text-blue-500 hover:underline">? Back to Admin</Link>
                </div>

                <form onSubmit={fetchTrace} className="flex gap-4 mb-8">
                    <input 
                        type="text" 
                        placeholder="Enter Thread ID (e.g. uuid)..." 
                        className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={threadId}
                        onChange={(e) => setThreadId(e.target.value)}
                    />
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold">
                        {loading ? 'Fetching...' : 'View Trace'}
                    </button>
                </form>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                {trace && (
                    <div className="space-y-6 relative">
                        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 z-0"></div>
                        {trace.map((step, index) => (
                            <div key={index} className="relative z-10 flex gap-4">
                                <div className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
                                     style={{
                                         backgroundColor: step.role === 'user' ? '#3b82f6' : 
                                                          step.role === 'ai' ? '#8b5cf6' : 
                                                          step.role === 'tool_response' ? '#10b981' : '#6b7280'
                                     }}>
                                    {step.role.toUpperCase()}
                                </div>
                                <div className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
                                    {step.content && (
                                        <div className="mb-2 whitespace-pre-wrap text-gray-800">
                                            {step.content}
                                        </div>
                                    )}
                                    {step.tool_calls && step.tool_calls.length > 0 && (
                                        <div className="mt-3">
                                            <p className="font-bold text-purple-700 text-xs uppercase mb-1">??? Tool Calls Requested:</p>
                                            {step.tool_calls.map((call, i) => (
                                                <div key={i} className="bg-purple-50 p-2 rounded border border-purple-100 mb-2 font-mono text-xs text-purple-900 overflow-x-auto">
                                                    <strong>{call.name}</strong>( {JSON.stringify(call.args)} )
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {step.tool_name && (
                                        <div className="mt-2">
                                            <p className="font-bold text-green-700 text-xs uppercase mb-1">? Output from {step.tool_name}:</p>
                                            <div className="bg-green-50 p-2 rounded border border-green-100 font-mono text-xs text-green-900 overflow-x-auto whitespace-pre-wrap">
                                                {step.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {trace.length === 0 && <p className="text-gray-500 text-center italic">No messages found in this thread.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AITraceViewer;
