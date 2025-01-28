// src/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './firebase/AuthContext';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        // User is not authenticated
        return <Navigate to="/login" replace />;
    }

    if (currentUser.email !== 'ianmcarscadden@gmail.com') {
        // User does not have the required email
        return <Navigate to="/login" replace />;
    }

    // User is authenticated and has the correct email
    return children;
};

export default PrivateRoute;
