'use client';

import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setUser(null);
                return;
            }

            try {
                let payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                    return;
                }

                setUser({
                    id: payload.userId,
                    email: payload.email,
                    role: payload.role,
                });
            } catch (error) {
                console.error('Error verifying token:', error);
                localStorage.removeItem('token');
                setUser(null);
            }
        };

        checkToken();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;