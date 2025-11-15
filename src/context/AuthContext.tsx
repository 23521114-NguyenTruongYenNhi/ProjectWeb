import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

interface User {
    _id: string;
    name: string;
    email: string;
    token: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('mystere-meal-user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('mystere-meal-user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data: any = await authAPI.login({ email, password });

            const userData: User = {
                _id: data._id,
                name: data.name,
                email: data.email,
                token: data.token,
            };

            setUser(userData);
            localStorage.setItem('mystere-meal-user', JSON.stringify(userData));
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error(error instanceof Error ? error.message : 'Login failed. Please try again.');
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const data: any = await authAPI.signup({ name, email, password });

            const userData: User = {
                _id: data._id,
                name: data.name,
                email: data.email,
                token: data.token,
            };

            setUser(userData);
            localStorage.setItem('mystere-meal-user', JSON.stringify(userData));
        } catch (error) {
            console.error('Signup failed:', error);
            throw new Error(error instanceof Error ? error.message : 'Signup failed. Please try again.');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('mystere-meal-user');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
