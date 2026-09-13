import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalRides: 0, totalCaptains: 0, activeCaptains: 0, completedRides: 0
    });
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/stats`);
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="space-x-4">
                    <Link to="/admin/ai-trace" className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 font-medium">🔍 AI Trace Viewer</Link>
                    <Link to="/" className="text-blue-500 hover:underline px-4 py-2">Back to Home</Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Rides</h3>
                    <p className="text-4xl font-bold mt-2">{stats.totalRides}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Completed Rides</h3>
                    <p className="text-4xl font-bold mt-2 text-green-500">{stats.completedRides}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Captains</h3>
                    <p className="text-4xl font-bold mt-2">{stats.totalCaptains}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Active Captains (Online)</h3>
                    <p className="text-4xl font-bold mt-2 text-blue-500">{stats.activeCaptains}</p>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold mb-4">Platform Intelligence</h3>
                <p className="text-gray-600 mb-4">
                    The platform is actively orchestrated by the AI Assistant LangGraph pipeline. 
                    Real-time monitoring and telemetry will be hooked into this dashboard.
                </p>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    [ AI Observability / Heatmap Visualization coming soon ]
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
