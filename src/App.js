import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import MainPage from './components/MainPage';
import LoginPage, {validate_cookie, get_user_data} from './components/LoginPage';
import AuthenticatedDashboard from './components/AuthenticatedDashboard';
import HistoryPage from './components/HistoryPage';
import ResetPage from './components/ResetPage.jsx';
import ForgotPasswordPage from './components/ForgotPasswordPage.jsx';
import Cookies from 'js-cookie';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [user, setUser] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            if (await validate_cookie()) {
                try {
                    const response = await get_user_data();
                    const userData = {username: response.data.username, email: response.data.email};
                    setUser(userData);
                } catch (error) {
                    setUser(null);
                }
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
            setIsLoading(false);
        };

        initializeAuth().then();
    }, []);


    const handleLogin = (userData) => {
        setIsLoggedIn(true);
        setUser(userData);
    };

    const handleLogout = () => {
        if (Cookies.get("auth_token")) Cookies.remove("auth_token");
        setUser(null);
        setIsLoggedIn(false);
    };

    if (isLoading) return <div></div>;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage/>}/>
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
                    path="/reset/:token"
                    element={
                        <ResetPage 
                           
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
                <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                <Route
                    path="/dashboard"
                    element={
                        isLoggedIn ? (
                            <AuthenticatedDashboard
                                userName={user?.username || 'User'}
                                onLogout={handleLogout}
                            />
                        ) : (
                            <Navigate to="/login" replace/>
                        )
                    }
                />
                <Route
                    path="/history"
                    element={
                        isLoggedIn ? (
                            <HistoryPage/>
                        ) : (
                            <Navigate to="/login" replace/>
                        )
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;