import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, User, Briefcase, ArrowLeft } from 'lucide-react';
import api from '../utils/axiosConfig';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/auth/login', formData);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));

            // Redirect based on role
            if (response.data.role === 'lawyer') {
                navigate('/lawyer-dashboard');
            } else {
                navigate('/client-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-gray-900 text-white px-6 py-4 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Scale className="w-6 h-6" />
                    <span className="text-xl font-semibold">CaseBridge Legal Platform</span>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                    Back to Home
                </button>
            </header>

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button
                            className="flex-1 py-4 font-bold text-sm text-blue-600 border-b-2 border-blue-600 transition-colors"
                        >
                            LOGIN
                        </button>
                        <button
                            onClick={() => navigate('/role-selection')}
                            className="flex-1 py-4 font-bold text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            REGISTER
                        </button>
                    </div>

                    <div className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Scale className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-500 text-sm mb-8">
                            Sign in to your account to continue
                        </p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-xs">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="text-left">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="text-left">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end px-1">
                                <button type="button" className="text-xs text-blue-600 hover:underline">
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>

                        <p className="mt-8 text-gray-500 text-sm">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/role-selection')}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                Register now
                            </button>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}