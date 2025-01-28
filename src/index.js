// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client'; // Updated import for React 18
import App from './App';
import { AuthProvider } from './firebase/AuthContext'; // Ensure correct path

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // Create a root.

root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
