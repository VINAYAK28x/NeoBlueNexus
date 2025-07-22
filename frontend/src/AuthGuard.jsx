import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AuthGuard = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Redirect to the login page if not authenticated
        return <Navigate to="/" replace />;
    }

    // If authenticated, render the child routes
    return <Outlet />;
};

export default AuthGuard; 