"use client";

import React from "react";

import { useAuth } from "@/context/AuthContext";
import ENDPOINTS from "@/utils/api_endpoint.util";

const SignUp = () => {
    const { user, setUser } = useAuth();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");

    if (user) {
        window.location.href = "/dashboard";
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(ENDPOINTS.USER_REGISTER, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to create account",
                );
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Use your email to create an account.
                    </p>
                </div>

                <form
                    className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow"
                    onSubmit={handleSubmit}
                >
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="pb-4">
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Create account
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <a
                        href="/"
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        Sign in
                    </a>
                </p>
            </div>
        </main>
    );
};

export default SignUp;
