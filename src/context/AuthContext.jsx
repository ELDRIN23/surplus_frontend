import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
            // Optionally verify token validity here
        }
        setLoading(false);
    }, []);

    const login = async (email, password, role) => {
        try {
            const { data } = await axios.post('/api/auth/login', { email, password, role });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data; // Return data for redirect logic
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const registerUser = async (formData) => {
        try {
            const { data } = await axios.post('/api/auth/register-user', formData);
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
        } catch (error) {
           throw error.response?.data?.message || 'Registration failed';
        }
    };

    const registerVendor = async (vendorData) => {
        try {
             const { data } = await axios.post('/api/auth/register-vendor', vendorData);
             setUser(data);
             localStorage.setItem('userInfo', JSON.stringify(data));
             return data;
        } catch (error) {
             throw error.response?.data?.message || 'Registration failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerUser, registerVendor, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
