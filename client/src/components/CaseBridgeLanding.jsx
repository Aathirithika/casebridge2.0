import React from 'react';
import { Scale, Mic, UserCheck, Lock, ChevronLeft, MessageCircle, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CaseBridgeLanding() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/role-selection');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="hover:bg-gray-800 p-2 rounded">
                        <ChevronLeft size={24} />
                    </button>
                    <button className="hover:bg-gray-800 p-2 rounded">
                        <MessageCircle size={24} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">CaseBridge Legal Platform</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                    <Globe size={20} />
                    <span>Public</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                            <Scale className="w-12 h-12 text-blue-600" strokeWidth={2} />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl font-bold text-blue-600 text-center mb-3">
                        CaseBridge
                    </h1>
                    <p className="text-xl text-gray-600 text-center mb-12">
                        Connecting You with Legal Excellence
                    </p>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex items-center gap-3">
                            <Mic className="w-6 h-6 text-gray-700" />
                            <span className="text-lg font-medium text-gray-900">Voice Support Available</span>
                        </div>

                        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex items-center gap-3">
                            <UserCheck className="w-6 h-6 text-gray-700" />
                            <span className="text-lg font-medium text-gray-900">Verified Lawyers Only</span>
                        </div>

                        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex items-center gap-3">
                            <Lock className="w-6 h-6 text-gray-700" />
                            <span className="text-lg font-medium text-gray-900">Secure & Confidential</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleGetStarted}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-lg transition-colors shadow-lg mb-6"
                    >
                        Get Started
                    </button>

                    {/* Login Link */}
                    <p className="text-center text-blue-600 font-medium">
                        Already have an account? <button onClick={handleLogin} className="hover:underline">Login</button>
                    </p>
                </div>
            </main>
        </div>
    );
}