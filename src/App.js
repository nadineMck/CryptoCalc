import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import AuthenticatedDashboard from './components/AuthenticatedDashboard';
import HistoryPage from './components/HistoryPage';
import ForgotPasswordPage from './components/ForgotPasswordPage.jsx';
import axios from "axios";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [user, setUser] = React.useState(null);

    const handleLogin = (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setUser(null);
        setIsLoggedIn(false);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route
                    path="/login"
                    element={
                        <LoginPage
                            onLogin={handleLogin}
                            isLoggedIn={isLoggedIn}
                            initialTab="login"
                        />
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <LoginPage
                            initialTab="signup"
                            onLogin={handleLogin}
                            isLoggedIn={isLoggedIn}
                        />
                    }
                />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route
                    path="/dashboard"
                    element={
                        isLoggedIn ? (
                            <AuthenticatedDashboard
                                userName={user?.name || 'User'}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                <Route
                    path="/history"
                    element={
                        isLoggedIn ? (
                            <HistoryPage
                                userName={user?.name || 'User'}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;