import React, {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AlertCircle, ArrowRight, Eye, EyeOff, Home, Lock} from 'lucide-react';
import Cookies from 'js-cookie';

import axios from "axios";

axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: "https://cryptocalc-p0qp.onrender.com",
});

export const validate_cookie = async () => {
    const username_hash = Cookies.get("auth_token");
    try {
        const response = await client.post("/cookie", {
            username_hash: username_hash
        }, {withCredentials: true});
        return response.data.authenticated;
    } catch (error) {
        return false;
    }
};

export const get_user_data = async () => {
    const username_hash = Cookies.get("auth_token");
    try {
        return await client.post("/user_details", {
            username_hash: username_hash
        }, {withCredentials: true});
    } catch (error) {
        return null;
    }
};

const ResetPage = ({onLogin}) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [_currentUser, setCurrentUser] = React.useState(false);
    const navigate = useNavigate();
    const {token} = useParams();
    // Form state
    const [formData, setFormData] = React.useState({
        password: ''
    });

    // Error states
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    useEffect(() => {
        const performNavigate = async () => {
            try {
                if (await validate_cookie()) {
                    try {
                        const response = await get_user_data();
                        const userData = {username: response.data.username, email: response.data.email};
                        onLogin(userData);
                    } catch (error) {
                        onLogin(null);
                    }
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

        performNavigate().then();
    }, [navigate]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev, [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (await validate_cookie()) {
            navigate('/dashboard');
        }

        try {
            console.log(token)
            client.post("/reset/" + token, {
                'password': formData.password
            }, {withCredentials: true})
                .then(async (response) => {
                    if (response.data.reset) {
                        const userData = {
                            username: response.data.username, email: response.data.email
                        };
                        await onLogin(userData);
                        Cookies.set('auth_token', response.data.username_hash, {
                            path: '/', sameSite: 'Lax'
                        });
                        navigate('/dashboard');
                    } else {
                        setError(response.data.message);
                    }
                })
                .catch(function (error) {
                    setError(error);
                });
        } catch (err) {
            setError('Something went wrong. Please try again.');
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


                    {error && (<div
                        className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
                        <AlertCircle size={20}/>
                        <span>{error}</span>
                    </div>)}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {<>


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

                                </label>

                            </div>
                        </>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg py-3 px-4 transition-all duration-300 flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (<span>Loading...</span>) : (<>
                                {'Reset Password'}
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20}/>
                            </>)}
                        </button>


                    </form>
                </div>
            </div>
        </div>);
}


export default ResetPage;