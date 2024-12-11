import React from 'react';
import {
    ArrowLeft,
    Calculator,
    Calendar,
    Clock,
    Divide,
    FilterX,
    History,
    Minus,
    Percent,
    Plus,
    RotateCcw,
    Search,
    X
} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {format} from 'date-fns';

import axios from "axios";
import Cookies from "js-cookie";

const client = axios.create({
    baseURL: "https://cryptocalc-p0qp.onrender.com",
});

const HistoryPage = ({}) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filteredHistory, setFilteredHistory] = React.useState([]);
    const [historyData, setHistoryData] = React.useState([]);

    React.useEffect(() => {
        const username_hash = Cookies.get("auth_token");
        client.post("/api/history", {
            username_hash: username_hash
        }, { withCredentials: true })
            .then((response) => {
                console.log(response.data);
                setHistoryData(response.data);
                setFilteredHistory(historyData);
            })
            .catch((error) => {
                console.error("Error fetching history:", error);
            });
    }, []);

    // Enhanced sample history data with all calculation parameters

    const getOperationIcon = (operation) => {
        switch (operation) {
            case 'add':
                return <Plus size={16} className="text-blue-400"/>;
            case 'subtract':
                return <Minus size={16} className="text-blue-400"/>;
            case 'multiply':
                return <X size={16} className="text-blue-400"/>;
            case 'divide':
                return <Divide size={16} className="text-blue-400"/>;
            case 'modulo':
                return <Percent size={16} className="text-blue-400"/>;
            case 'inverse':
                return <RotateCcw size={16} className="text-blue-400"/>;
            default:
                return <Calculator size={16} className="text-blue-400"/>;
        }
    };

    const getOperationLabel = (operation) => {
        const labels = {
            add: 'Addition',
            subtract: 'Subtraction',
            multiply: 'Multiplication',
            divide: 'Division',
            modulo: 'Modulo',
            inverse: 'Inverse'
        };
        return labels[operation] || operation;
    };

    React.useEffect(() => {
        if (searchTerm) {
            const filtered = historyData.filter(item =>
                item.input1.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.input2.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.result.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.irreduciblePolynomial.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredHistory(filtered);
        } else {
            setFilteredHistory(historyData);
        }
    }, [searchTerm, historyData]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
            {/* Background animation */}
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

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="mr-4 text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={24}/>
                                </button>
                                <div className="flex items-center">
                                    <History className="w-6 h-6 text-blue-400 mr-2"/>
                                    <h1 className="text-xl font-semibold text-white">Calculation History</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search calculations..."
                                className="w-full bg-gray-900/50 text-white placeholder-gray-500 rounded-lg py-3 px-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                            />
                            <Search
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <FilterX className="w-5 h-5"/>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* History List */}
                    <div className="space-y-4">
                        {filteredHistory.map((item) => (
                            <div
                                key={item.id}
                                className="bg-gray-900/40 backdrop-blur-xl rounded-lg p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all"
                            >
                                <div className="space-y-4">
                                    {/* Header with timestamp and field */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                                            <Calendar className="w-4 h-4"/>
                                            <span>{format(item.timestamp, 'MMM d, yyyy')}</span>
                                            <Clock className="w-4 h-4 ml-2"/>
                                            <span>{format(item.timestamp, 'HH:mm')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-medium">
                                                {item.field}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Operation and Field Details */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-gray-900/30 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1 text-gray-400">
                                                {getOperationIcon(item.operation)}
                                                <span>{getOperationLabel(item.operation)}</span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Format: {item.inputFormat} → {item.outputFormat}
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/30 rounded-lg p-3">
                                            <div className="text-sm text-gray-400">Irreducible Polynomial:</div>
                                            <div className="text-xs text-gray-300 font-mono">
                                                {item.irreduciblePolynomial}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Calculation Details */}
                                    <div className="bg-gray-900/30 rounded-lg p-4 font-mono">
                                        <div className="text-gray-300 mb-1">{item.input1}</div>
                                        {item.input2 && (
                                            <div className="text-gray-300 mb-1">{item.input2}</div>
                                        )}
                                        <div className="h-px bg-gray-700 my-2"></div>
                                        <div className="text-white font-medium">
                                            {item.result}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredHistory.length === 0 && (
                            <div className="text-center py-12">
                                <History className="w-12 h-12 text-gray-600 mx-auto mb-4"/>
                                <h3 className="text-lg font-medium text-gray-300 mb-2">No calculations found</h3>
                                <p className="text-gray-400">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Your calculation history will appear here'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;