// src/Login.js

import React, { useRef } from 'react';
import { auth } from './firebase/firebaseConfig';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate(); // Hook to navigate programmatically

    const handleSubmit = async (e) => {
        e.preventDefault();
        const enteredEmail = emailRef.current.value.trim();
        const enteredPassword = passwordRef.current.value;

        // Define the authorized email
        const authorizedEmail = 'ianmcarscadden@gmail.com';

        try {
            // Attempt to sign in the user
            const userCredential = await signInWithEmailAndPassword(
                auth,
                enteredEmail,
                enteredPassword
            );

            const user = userCredential.user;

            // Check if the signed-in user's email matches the authorized email
            if (user.email === authorizedEmail) {
                // Redirect to the main page after successful login
                navigate('/', { replace: true });
            } else {
                // If email does not match, sign out the user and show an error
                await signOut(auth);
                alert('Unauthorized email address. Access denied.');
            }
        } catch (error) {
            // Handle authentication errors
            let errorMessage = 'Failed to login. Please try again.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No user found with the provided email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }
            alert(errorMessage);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        ref={emailRef}
                        required
                        style={styles.input}
                        placeholder="Enter your email"
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        ref={passwordRef}
                        required
                        style={styles.input}
                        placeholder="Enter your password"
                    />
                </div>
                <button type="submit" style={styles.button}>
                    Login
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        marginTop: '5px',
    },
    button: {
        padding: '10px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#1890ff',
        color: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
    },
};

export default Login;
