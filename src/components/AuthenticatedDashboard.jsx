import React from 'react';
import {
    Calculator,
    Calculator as CalcIcon,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Code,
    Copy,
    Divide,
    Hash,
    History,
    Info,
    LogOut,
    Minus,
    Percent,
    Plus,
    RefreshCw,
    RotateCcw,
    Settings,
    Sigma,
    Square,
    Trash2,
    User,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


import axios from "axios";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;


const client = axios.create({
    baseURL: "http://127.0.0.1:5000",
});

const FormatIndicator = ({ format }) => {
    const getFormatIcon = () => {
        switch (format) {
            case 'binary':
                return <Code className="w-4 h-4" />;
            case 'hexadecimal':
                return <Hash className="w-4 h-4" />;
            case 'polynomial':
                return <CalcIcon className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getFormatColor = () => {
        switch (format) {
            case 'binary':
                return 'from-green-600 to-emerald-600';
            case 'hexadecimal':
                return 'from-orange-600 to-red-600';
            case 'polynomial':
                return 'from-blue-600 to-purple-600';
            default:
                return 'from-gray-600 to-gray-600';
        }
    };

    return (
        <div
            className={`inline-flex items-center px-2 py-1 rounded-md bg-gradient-to-r ${getFormatColor()} text-white text-xs font-medium`}>
            {getFormatIcon()}
            <span className="ml-1 capitalize">{format}</span>
        </div>
    );
};

const AuthenticatedDashboard = ({ onLogout, userName }) => {
    const navigate = useNavigate();
    const [showSteps, setShowSteps] = React.useState(false);
    const [calculationSteps, setCalculationSteps] = React.useState([]);
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [showParameters, setShowParameters] = React.useState(false);
    const [operation, setOperation] = React.useState('add');
    const [inputFormat, setInputFormat] = React.useState('polynomial');
    const [outputFormat, setOutputFormat] = React.useState('polynomial');
    const [activeInput, setActiveInput] = React.useState('first');
    const [copyStatus, setCopyStatus] = React.useState(false);
    const [irreduciblePolyFormat, setIrreduciblePolyFormat] = React.useState('polynomial');
    const [field, setField] = React.useState('GF(2⁸)');
    const [showPolyQuickTerms, setShowPolyQuickTerms] = React.useState(false);
    // Add handler for irreducible polynomial input
    const handleIrreduciblePolyInput = (value) => {
        setIrreduciblePoly(value);
    };

    // Add handler for quick term insertion in irreducible polynomial
    const insertIrreducibleTerm = (power) => {
        const inputField = document.getElementById('irreducible-poly');
        if (inputField) {
            const start = inputField.selectionStart;
            const end = inputField.selectionEnd;
            const currentValue = irreduciblePoly;
            const newValue = power === 0 ? `${currentValue.slice(0, start)}1${currentValue.slice(end)}` : power === 1
                ? `${currentValue.slice(0, start)}x${currentValue.slice(end)}`
                : `${currentValue.slice(0, start)}x${replacePowers(power)}${currentValue.slice(end)}`;

            setIrreduciblePoly(newValue);
        }
    };

    // Add handler for operator insertion in irreducible polynomial
    const insertIrreducibleOperator = (operator) => {
        const inputField = document.getElementById('irreducible-poly');
        if (inputField) {
            const start = inputField.selectionStart;
            const currentValue = irreduciblePoly;
            const newValue = `${currentValue.slice(0, start)} ${operator} ${currentValue.slice(start)}`;

            setIrreduciblePoly(newValue);
        }
    };

    const [input, setInput] = React.useState({
        first: '',
        second: '',
        modulo: ''
    });
    const handleDeleteUser = () => {
        // Add your delete user logic here
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // Implement delete user functionality
            handleLogoutClick(); // Logout after deletion
        }
    };
    const [selectedField, setSelectedField] = React.useState('gf256');
    const handleLogoutClick = () => {
        onLogout(); // Call the prop function first
        navigate('/'); // Then navigate
    };
    const galoisFields = [
        { id: 'gf2', label: 'GF(2)', power: 1 },
        { id: 'gf4', label: 'GF(2²)', power: 2 },
        { id: 'gf8', label: 'GF(2³)', power: 3 },
        { id: 'gf16', label: 'GF(2⁴)', power: 4 },
        { id: 'gf32', label: 'GF(2⁵)', power: 5 },
        { id: 'gf64', label: 'GF(2⁶)', power: 6 },
        { id: 'gf128', label: 'GF(2⁷)', power: 7 },
        { id: 'gf256', label: 'GF(2⁸)', power: 8 }
    ];

    const commonPolynomials = {
        gf2: { default: 'x + 1', options: ['x + 1'] },
        gf4: { default: 'x² + x + 1', options: ['x² + x + 1'] },
        gf8: { default: 'x³ + x + 1', options: ['x³ + x + 1', 'x³ + x² + 1'] },
        gf16: { default: 'x⁴ + x + 1', options: ['x⁴ + x + 1', 'x⁴ + x³ + 1'] },
        gf32: { default: 'x⁵ + x² + 1', options: ['x⁵ + x² + 1', 'x⁵ + x³ + 1'] },
        gf64: { default: 'x⁶ + x + 1', options: ['x⁶ + x + 1', 'x⁶ + x⁵ + 1'] },
        gf128: { default: 'x⁷ + x³ + 1', options: ['x⁷ + x³ + 1', 'x⁷ + x + 1'] },
        gf256: { default: 'x⁸ + x⁴ + x³ + x + 1', options: ['x⁸ + x⁴ + x³ + x + 1', 'x⁸ + x⁵ + x³ + x² + 1'] }
    };

    const [irreduciblePoly, setIrreduciblePoly] = React.useState(commonPolynomials.gf256.default);
    const [result, setResult] = React.useState(null);

    const formats = [
        { id: 'binary', label: 'Binary' },
        { id: 'hexadecimal', label: 'Hexadecimal' },
        { id: 'polynomial', label: 'Polynomial' }
    ];

    const operations = [
        { id: 'add', label: 'Add', icon: Plus },
        { id: 'subtract', label: 'Subtract', icon: Minus },
        { id: 'multiply', label: 'Multiply', icon: X },
        { id: 'divide', label: 'Divide', icon: Divide },
        { id: 'modulo', label: 'Modulo', icon: Percent },
        { id: 'inverse', label: 'Inverse', icon: RotateCcw }
    ];

    const handleFieldChange = (fieldId) => {
        setSelectedField(fieldId);
        setIrreduciblePoly(commonPolynomials[fieldId].default);
        setInput({
            first: '',
            second: '',
            modulo: Math.pow(2, galoisFields.find(f => f.id === fieldId).power)
        });
        setField(galoisFields.find(f => f.id === fieldId).label)
    };

    const handleCopy = async () => {
        if (result?.value) {
            await navigator.clipboard.writeText(result.value);
            setCopyStatus(true);
            setTimeout(() => setCopyStatus(false), 2000);
        }
    };
    function replacePowers(inputStr) {
        const powerMap = {
            "0": "⁰",
            "1": "¹",
            "2": "²",
            "3": "³",
            "4": "⁴",
            "5": "⁵",
            "6": "⁶",
            "7": "⁷",
            "8": "⁸",
            "9": "⁹"
        };

        inputStr = inputStr + ""
        for (const [key, value] of Object.entries(powerMap)) {
            inputStr = inputStr.split(key).join(value);
        }

        return inputStr;
    }

    const insertTerm = (power) => {
        const inputField = document.getElementById(activeInput);
        if (inputField) {
            const start = inputField.selectionStart;
            const end = inputField.selectionEnd;
            const currentValue = input[activeInput];
            const newValue = power === 0 ? `${currentValue.slice(0, start)}1${currentValue.slice(end)}` : power === 1
                ? `${currentValue.slice(0, start)}x${currentValue.slice(end)}`
                : `${currentValue.slice(0, start)}x${replacePowers(power)}${currentValue.slice(end)}`;

            setInput(prev => ({
                ...prev,
                [activeInput]: newValue
            }));
        }
    };

    const insertOperator = (operator) => {
        const inputField = document.getElementById(activeInput);
        if (inputField) {
            const start = inputField.selectionStart;
            const currentValue = input[activeInput];
            const newValue = `${currentValue.slice(0, start)} ${operator} ${currentValue.slice(start)}`;

            setInput(prev => ({
                ...prev,
                [activeInput]: newValue
            }));
        }
    };

    const handleClear = () => {
        setInput({
            first: '',
            second: '',
            modulo: ''
        });
        setResult(null);
    };

    const handleCalculate = () => {
        // send axios request, return result of calculation
        client.post("/api/calculate", {
            polynomial1: first.value,
            polynomial2: operation != 'inverse' ? second.value : "",
            operation: operation,
            inputFormat: inputFormat,
            outputFormat: outputFormat,
            irreduciblePoly: irreduciblePoly,
            irreduciblePolyFormat: irreduciblePolyFormat,
            field: field,
            timestamp: new Date()
        })
            .then((response) => {
                setCalculationSteps(response.data.steps);
                setResult({
                    operation: operation,
                    value: response.data.result,
                    timestamp: response.data.timestamp
                });
            })
            .catch(function (error) {
                setResult({
                    operation: operation,
                    value: "An internal React Error has occured: " + error.toString(),
                    timestamp: new Date()
                });
                setCalculationSteps([{ description: "Error", value: error.toString() }]);
            });

    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
            {/* Animated background */}
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

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <span
                            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            CryptoCalc
                        </span>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-3 bg-gray-800/50 rounded-lg px-4 py-2 text-gray-200 hover:bg-gray-800 transition-colors"
                            >
                                <User size={20} />
                                <span>{userName}</span>
                                <ChevronDown size={16} />
                            </button>

                            {showUserMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-800">
                                    <div className="py-1">
                                        <button
                                            onClick={() => navigate('/history')}
                                            className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 w-full"
                                        >
                                            <History size={16} className="mr-2" />
                                            History
                                        </button>
                                        <button
                                            onClick={handleDeleteUser}
                                            className="flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 w-full border-t border-gray-800"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Delete Account
                                        </button>

                                        <button
                                            onClick={() => handleLogoutClick()}
                                            className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 w-full"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Calculator Section */}
                <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl p-8 border border-gray-800/50">
                    {/* Title and Controls */}
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-white">
                            {showParameters ? 'Calculator Parameters' : 'Galois Field Calculator'}
                        </h2>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowParameters(!showParameters)}
                                className="bg-gray-800/50 hover:bg-gray-800 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-300"
                            >
                                {showParameters ? <Calculator size={20} /> : <Settings size={20} />}
                                {showParameters ? 'Calculator' : 'Parameters'}
                            </button>
                            {!showParameters && (
                                <button
                                    onClick={handleClear}
                                    className="bg-gray-800/50 hover:bg-gray-800 text-white rounded-lg px-4 py-2 flex items-center gap-2"
                                >
                                    <RefreshCw size={20} />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {showParameters ? (
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                            <div className="space-y-6">
                                {/* Field Selection */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-white mb-4">Galois Field Selection</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {galoisFields.map((field) => (
                                            <button
                                                key={field.id}
                                                onClick={() => handleFieldChange(field.id)}
                                                className={`flex items-center justify-center px-4 py-3 rounded-lg transition-all ${selectedField === field.id
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                    : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium">{field.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Square className="w-4 h-4 text-blue-400" />
                                            <span className="text-gray-300">Current Field: </span>
                                            <span className="text-white font-medium">
                                                {galoisFields.find(f => f.id === selectedField)?.label}
                                            </span>
                                            <span className="text-gray-400">
                                                (modulo {Math.pow(2, galoisFields.find(f => f.id === selectedField)?.power)})
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Irreducible Polynomial */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-white mb-4">Irreducible Polynomial</h3>

                                    {/* Common Polynomials */}
                                    <div className="mb-4">
                                        <label className="block text-gray-300 text-sm font-medium mb-2">
                                            Common Polynomials
                                            for {galoisFields.find(f => f.id === selectedField)?.label}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {commonPolynomials[selectedField]?.options.map((poly, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setIrreduciblePoly(poly)}
                                                    className={`px-3 py-2 rounded-lg transition-all text-sm ${irreduciblePoly === poly
                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                        : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
                                                        }`}
                                                >
                                                    {poly}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Format Selection and Custom Input */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Polynomial Format
                                            </label>
                                            <div className="flex gap-2">
                                                {formats.map((format) => (
                                                    <button
                                                        key={format.id}
                                                        onClick={() => setIrreduciblePolyFormat(format.id)}
                                                        className={`px-3 py-2 rounded-lg transition-all ${irreduciblePolyFormat === format.id
                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                            : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {format.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-gray-300 text-sm font-medium">
                                                    Custom Polynomial
                                                </label>
                                                {irreduciblePolyFormat === 'polynomial' && (
                                                    <button
                                                        onClick={() => setShowPolyQuickTerms(!showPolyQuickTerms)}
                                                        className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                                                    >
                                                        {showPolyQuickTerms ? <ChevronUp size={16} /> :
                                                            <ChevronDown size={16} />}
                                                        Quick Terms
                                                    </button>
                                                )}
                                            </div>

                                            <div className="relative">
                                                <input
                                                    id="irreducible-poly"
                                                    type="text"
                                                    value={irreduciblePoly}
                                                    onChange={(e) => handleIrreduciblePolyInput(e.target.value)}
                                                    placeholder={`Enter irreducible polynomial in ${irreduciblePolyFormat} format`}
                                                    className="w-full bg-gray-900/50 text-white placeholder-gray-500 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50 font-mono"
                                                />
                                                <Sigma
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            </div>

                                            {/* Quick Terms Panel */}
                                            {irreduciblePolyFormat === 'polynomial' && showPolyQuickTerms && (
                                                <div
                                                    className="mt-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label
                                                                className="block text-gray-300 text-xs font-medium mb-2">
                                                                Terms
                                                            </label>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {[...Array(9)].map((_, i) => (
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => insertIrreducibleTerm(i)}
                                                                        className="bg-gray-900/50 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm transition-all"
                                                                    >

                                                                        {i == 0 ? "1" : "x"}{i > 1 ? <sup>{i}</sup> : ''}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label
                                                                className="block text-gray-300 text-xs font-medium mb-2">
                                                                Operators
                                                            </label>
                                                            <div className="flex gap-2">
                                                                {['+', '-', '×'].map((op) => (
                                                                    <button
                                                                        key={op}
                                                                        onClick={() => insertIrreducibleOperator(op)}
                                                                        className="flex-1 bg-gray-900/50 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all"
                                                                    >
                                                                        {op}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Info Box */}
                                            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                <div className="flex gap-2">
                                                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                                    <div className="text-sm text-gray-300">
                                                        <p className="font-medium text-blue-400 mb-1">Usage Notes:</p>
                                                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                                                            <li>Use x as the variable (e.g., x⁸ + x⁴ + 1)</li>
                                                            <li>The polynomial must be irreducible over GF(2)</li>
                                                            <li>The degree must match the selected field size</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Format Settings */}
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-4">Format Settings</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Input Format
                                            </label>
                                            <div className="flex gap-2">
                                                {formats.map((format) => (
                                                    <button
                                                        key={format.id}
                                                        onClick={() => setInputFormat(format.id)}
                                                        className={`px-3 py-2 rounded-lg transition-all ${inputFormat === format.id
                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                            : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {format.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                Output Format
                                            </label>
                                            <div className="flex gap-2">
                                                {formats.map((format) => (
                                                    <button
                                                        key={format.id}
                                                        onClick={() => setOutputFormat(format.id)}
                                                        className={`px-3 py-2 rounded-lg transition-all ${outputFormat === format.id
                                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                            : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        {format.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Calculator Interface */}
                            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                                {/* Format Indicators */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400">Input:</span>
                                            <FormatIndicator format={inputFormat} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400">Output:</span>
                                            <FormatIndicator format={outputFormat} />
                                        </div>
                                    </div>
                                </div>

                                {/* Operations */}
                                <div className="mb-6">
                                    <label className="block text-gray-300 text-sm font-medium mb-3">
                                        Operation
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {operations.map((op) => {
                                            const Icon = op.icon;
                                            return (
                                                <button
                                                    key={op.id}
                                                    onClick={() => setOperation(op.id)}
                                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${operation === op.id
                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                        : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800'
                                                        }`}
                                                >
                                                    <Icon size={18} />
                                                    <span>{op.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Input Fields and Quick Terms */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="col-span-2 space-y-4">
                                        <div>
                                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                                First Input
                                            </label>
                                            <input
                                                id="first"
                                                type="text"
                                                value={input.first}
                                                onChange={(e) => setInput({ ...input, first: e.target.value })}
                                                onFocus={() => setActiveInput('first')}
                                                placeholder="Enter first value"
                                                className="w-full bg-gray-900/50 text-white placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                                            />
                                        </div>

                                        {operation !== 'inverse' && (
                                            <div>
                                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                                    Second Input
                                                </label>
                                                <input
                                                    id="second"
                                                    type="text"
                                                    value={input.second}
                                                    onChange={(e) => setInput({ ...input, second: e.target.value })}
                                                    onFocus={() => setActiveInput('second')}
                                                    placeholder="Enter second value"
                                                    className="w-full bg-gray-900/50 text-white placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50"
                                                />
                                            </div>
                                        )}

                                        <button
                                            onClick={handleCalculate}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg py-3 px-4 transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            <Calculator size={20} />
                                            Calculate
                                        </button>
                                    </div>

                                    {/* Quick Terms Panel */}
                                    {inputFormat === 'polynomial' && (
                                        <div
                                            className="col-span-1 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                                        Quick Terms
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[...Array(9)].map((_, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => insertTerm(i)}
                                                                className="bg-gray-900/50 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-sm transition-all"
                                                            >
                                                                {i == 0 ? "1" : "x"}{i > 1 ? <sup>{i}</sup> : ''}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                                        Operators
                                                    </label>
                                                    <div className="flex gap-2">
                                                        {['+', '-', '×'].map((op) => (
                                                            <button
                                                                key={op}
                                                                onClick={() => insertOperator(op)}
                                                                className="flex-1 bg-gray-900/50 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all"
                                                            >
                                                                {op}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Result Section */}
                            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-medium text-white">Result</h3>
                                        {result && (
                                            <button
                                                onClick={() => setShowSteps(!showSteps)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                                            >
                                                {showSteps ? <ChevronUp size={16} /> : <ChevronRight size={16} />}
                                                <span className="text-sm">Calculation Steps</span>
                                            </button>
                                        )}
                                    </div>
                                    {result && (
                                        <button
                                            onClick={handleCopy}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${copyStatus
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                                                }`}
                                        >
                                            {copyStatus ? (
                                                <>
                                                    <Check size={16} className="animate-appear" />
                                                    <span className="text-sm">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    <span className="text-sm">Copy</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {result ? (
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div
                                                className="bg-gray-800/50 rounded-lg p-3 text-white font-mono group-hover:bg-gray-800/70 transition-colors">
                                                {result.value}
                                            </div>
                                            <div
                                                className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity pointer-events-none"></div>
                                        </div>

                                        {/* Calculation Steps */}
                                        {showSteps && (
                                            <div
                                                className="mt-4 space-y-3 bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                                                <h4 className="text-sm font-medium text-gray-300">Calculation
                                                    Steps:</h4>
                                                <div className="space-y-2">
                                                    {calculationSteps.map((step, index) => (
                                                        <div key={index} className="flex flex-col gap-1">
                                                            <div className="text-sm text-gray-400">
                                                                {index + 1}. {step.description}
                                                            </div>
                                                            <div
                                                                className="bg-gray-900/50 rounded p-2 text-sm text-white font-mono">
                                                                {step.value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-center py-8">
                                        Enter values and click Calculate to see the result
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthenticatedDashboard;