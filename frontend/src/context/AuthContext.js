'use client';

import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ENDPOINTS from "@/utils/api_endpoint.util";

const AuthContext = createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch current user from backend
    const fetchCurrentUser = async () => {
        try {
            const response = await fetch(ENDPOINTS.USER_ME, {
                method: "GET",
                credentials: "include", // Include cookies
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else if (response.status === 401) {
                // Token expired, try to refresh
                const refreshResponse = await fetch(ENDPOINTS.USER_REFRESH, {
                    method: "POST",
                    credentials: "include",
                });

                if (refreshResponse.ok) {
                    // Retry fetching user after refresh
                    const retryResponse = await fetch(ENDPOINTS.USER_ME, {
                        method: "GET",
                        credentials: "include",
                    });
                    
                    if (retryResponse.ok) {
                        const data = await retryResponse.json();
                        setUser(data.user);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await fetch(ENDPOINTS.USER_LOGOUT, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            setUser(null);
            router.push("/");
        }
    };

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, refetchUser: fetchCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;