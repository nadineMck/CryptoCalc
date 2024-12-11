import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {AlertCircle, ArrowRight, Eye, EyeOff, Home, Lock, Mail, User} from 'lucide-react';
import Cookies from 'js-cookie';

import axios from "axios";

axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: "http://127.0.0.1:5000",
});

const LoginPage = ({initialTab = 'login', onLogin}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [_currentUser, setCurrentUser] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState(initialTab);
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
        username: ''
    });

    // Error states
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    useEffect(() => {
        const performNavigate = async () => {
            try {
                const username = Cookies.get("auth_token"); // Retrieve the "username" cookie
                if (username) {
                    setCurrentUser(true);
                    navigate("/dashboard");
                } else {
                    setCurrentUser(false);
                }
            } catch (error) {
                setCurrentUser(false);
                console.error("Error logging in:", error);
            }
        };

        performNavigate();
    }, [navigate]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const validatePassword = (password) => {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);

        if (!hasMinLength || !hasUpperCase) {
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const username = Cookies.get("auth_token"); // Retrieve the "username" cookie
            if (username) {
                navigate('/dashboard');
            } else {
                if (activeTab === 'login') {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Fake delay
                    client.post("/login", {
                        'email': formData.email, 'password': formData.password
                    }, {withCredentials: true})
                        .then((response) => {
                            if (response.data.message === "Login successful") {
                                Cookies.set('username', formData.email, {expires: 1, path: '/', sameSite: 'Lax'});
                                const userData = {name: 'Test User', email: formData.email};
                                navigate('/dashboard');
                            } else {
                                setError(response.data.message)
                            }
                        })
                        .catch(function (error) {
                            setError("Login failed: error");
                        });
                } else {
                    // Sign up validation
                    if (!validatePassword(formData.password)) {
                        setError('Password must be at least 8 characters and contain one uppercase letter');
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        client.post("/signup", {
                            'username': formData.username, 'email': formData.email, 'password': formData.password
                        }, {withCredentials: true})
                            .then((response) => {
                                if (response.data.message == "Signup successful") {
                                    Cookies.set('username', formData.email, {expires: 1, path: '/', sameSite: 'Lax'});
                                    const userData = {name: 'Test User', email: formData.email};
                                    navigate('/dashboard');
                                } else {
                                    setError(response.data.message)
                                }
                            })
                            .catch(function (error) {
                                setError("Signup failed: error");
                            });
                    }
                }
            }

        } catch (err) {
            setError('Something went wrong. Please try again.');
            console.error('Auth error:', err);
        } finally {
            setIsLoading(false);
        }
    };
    const handleHomeClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/', {replace: true});
    };
    return (

        <div
            className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
            {/* Add a fixed position button for home navigation */}
            <button
                onClick={handleHomeClick}
                className="fixed top-4 left-4 flex items-center gap-2 bg-gray-800/50 hover:bg-gray-800 text-white rounded-lg py-2 px-4 transition-all duration-300 backdrop-blur-sm border border-gray-700/50 z-50"
            >
                <Home size={20}/>
                <span>Back to Home</span>
            </button>
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-50">
                    <div
                        className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div
                        className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div
                        className="absolute bottom-1/3 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>
            </div>

            <div className="w-full max-w-md relative">
                <div
                    className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-blue-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl transform rotate-1"></div>
                <div
                    className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-blue-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl transform -rotate-1"></div>

                <div
                    className="relative bg-gray-900/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50">
                    <div className="text-center mb-8">
                        <div
                            onClick={() => navigate('/')}
                            className="inline-block p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 cursor-pointer"
                        >
                            <h1 className="text-3xl font-bold text-white bg-gray-900/90 rounded-xl px-6 py-2">
                                CryptoCalc
                            </h1>
                        </div>
                    </div>

                    <div className="flex mb-8 bg-gray-800/50 rounded-lg p-1">
                        <button
                            onClick={() => {
                                setActiveTab('login');
                                setError('');
                            }}
                            className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${activeTab === 'login'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('signup');
                                setError('');
                            }}
                            className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${activeTab === 'signup'
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div
                            className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
                            <AlertCircle size={20}/>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {activeTab === 'login' ? (
                            <>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                        required
                                        className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Password"
                                        required
                                        className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <label className="flex items-center text-gray-400 hover:text-white cursor-pointer">
                                        <input type="checkbox" className="mr-2 rounded border-gray-600"/>
                                        Remember me
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/forgot-password')}
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                        required
                                        className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                                    />
                                </div>

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Email"
                                        required
                                        className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Password"
                                        required
                                        className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg py-3 px-4 transition-all duration-300 flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <span>Loading...</span>
                            ) : (
                                <>
                                    {activeTab === 'login' ? 'Login' : 'Create Account'}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20}/>
                                </>
                            )}
                        </button>


                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;