import React from 'react';
import {Calculator, Shield, Zap} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

const MainPage = () => {
    const navigate = useNavigate();
    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
            {/* Rest of your existing code... */}

            <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
              <span
                  onClick={() => navigate('/')}
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent cursor-pointer"
              >
                CryptoCalc
              </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-300"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            Polynomial Arithmetic Made Simple
                        </h1>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            Calculate with confidence with our powerful calculator.
                        </p>

                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Calculator className="w-8 h-8 text-blue-400"/>,
                                title: "Advanced Calculations",
                                description: "Perform complex polynomial arithmetic over Galois Fields with ease and precision."
                            },
                            {
                                icon: <Zap className="w-8 h-8 text-purple-400"/>,
                                title: "Lightning Fast",
                                description: "Get instant results with our calculation engine."
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-indigo-400"/>,
                                title: "Secure & Reliable",
                                description: "Trust in our robust and secure platform for all your needs."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="group relative">
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl transform transition-transform group-hover:scale-105"></div>
                                <div
                                    className="relative p-8 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 hover:border-gray-700 transition-all duration-300">
                                    <div className="bg-gray-800/50 rounded-xl p-3 w-fit mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400">{feature.description}</p>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center text-gray-400">
                        <p>© 2024 CryptoCalc. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainPage;