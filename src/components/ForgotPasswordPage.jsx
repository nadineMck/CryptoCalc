import React from 'react';
import {useNavigate} from 'react-router-dom';
import {AlertCircle, ArrowLeft, ArrowRight, Mail} from 'lucide-react';
import axios from "axios";

axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: "https://cryptocalc-p0qp.onrender.com",
});

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
 
         client.post("/reset", {
                    'email': email
                }, {withCredentials: true})
                    .then(async (response) => {
                        if (!response.data.reset) {
                            setError(response.data.message);
                            setSuccess(false);
                        } else {
                            setError('');
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            setSuccess(true);
                        }
                    })
                    .catch(function (error) {
                        setError(error);
                    });
        } catch (err) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-purple-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft size={18}/>
                        Back to Login
                    </button>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                            Reset Password
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Enter your email address and we will send you instructions to reset your password.
                        </p>
                    </div>

                    {error && (<div
                        className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
                        <AlertCircle size={20}/>
                        <span>{error}</span>
                    </div>)}

                    {success ? (
                        <div className="text-center py-4">
                            <p className="text-green-400 mb-4">
                                Password reset instructions have been sent to your email.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-200"
                            >
                                Return to Login
                                <ArrowRight size={18}/>
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Mail className="text-gray-500" size={18}/>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    required
                                    className="w-full bg-gray-800/50 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg py-3 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending...' : (
                                    <>
                                        Reset Password
                                        <ArrowRight size={18}/>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;