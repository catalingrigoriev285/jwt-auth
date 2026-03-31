"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
    const { user, logout, loading } = useAuth();

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Please log in</div>
            </main>
        );
    }

    const handleLogout = async () => {
        await logout();
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
                        {user?.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{user?.role}</p>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-mono text-xs">{user?.id}</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                    Logout
                </button>
            </div>
        </main>
    );
};

export default Dashboard;
