import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Scale,
    LogOut,
    User,
    MessageCircle,
    FileText,
    Search,
    Briefcase,
    Star,
    TrendingUp,
    Clock,
    CheckCircle,
    X,
    Upload,
    File,
    Trash2
} from 'lucide-react';
import api from '../utils/axiosConfig';
import VoiceAssistantModal from '../components/VoiceAssistantModal';
import ChatMessaging from '../components/ChatMessaging';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lawyers, setLawyers] = useState([]);
    const [cases, setCases] = useState([]);
    const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
    const [recommendedLawyers, setRecommendedLawyers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [showHireModal, setShowHireModal] = useState(false);
    const [hireData, setHireData] = useState({
        title: '',
        caseType: 'Criminal Law',
        description: '',
        priority: 'medium'
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [showChat, setShowChat] = useState(false);
    const [selectedCaseForChat, setSelectedCaseForChat] = useState(null);
    const [showQuickChatModal, setShowQuickChatModal] = useState(false);
    const [quickChatLawyer, setQuickChatLawyer] = useState(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, active, pending, closed
    const caseTypeMapping = {
        'family': 'Family Law',
        'property': 'Property Law',
        'criminal': 'Criminal Law',
        'business': 'Corporate Law',
        'civil': 'Civil Law',
        'labor': 'Labour Law',
        'consumer': 'Consumer Law',
        'other': 'Other',
        'General Consultation': 'General Consultation'
    };
    const [quickChatData, setQuickChatData] = useState({
        title: 'Initial Consultation',
        description: 'I would like to start a conversation regarding legal advice.',
        caseType: 'General Consultation'
    });

    useEffect(() => {
        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchLawyers();
            fetchMyCases();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await api.get('/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser(response.data);

            if (response.data.role !== 'client') {
                navigate('/lawyer-dashboard');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchLawyers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/lawyers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLawyers(response.data);
            setRecommendedLawyers(response.data.slice(0, 3));
        } catch (error) {
            console.error('Error fetching lawyers:', error);
        }
    };

    const fetchMyCases = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/cases', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCases(response.data.cases);
        } catch (error) {
            console.error('Error fetching cases:', error);
        }
    };

    const getRecommendations = (issueType) => {
        const filtered = lawyers.filter(l =>
            l.specializations?.some(s => s.toLowerCase().includes(issueType.toLowerCase())) ||
            issueType.toLowerCase().includes(l.specializations?.[0]?.toLowerCase())
        );

        const sorted = (filtered.length > 0 ? filtered : lawyers)
            .sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));

        setRecommendedLawyers(sorted.slice(0, 3));
    };

    const handleVoiceIssueSubmission = async (submissionData) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');

            // Find best lawyer immediately instead of waiting for state update
            const issueType = submissionData.detectedCategory;
            const filtered = lawyers.filter(l =>
                l.specializations?.some(s => s.toLowerCase().includes(issueType.toLowerCase())) ||
                issueType.toLowerCase().includes(l.specializations?.[0]?.toLowerCase())
            );
            const sorted = (filtered.length > 0 ? filtered : lawyers)
                .sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
            const bestLawyer = sorted[0];

            const response = await api.post('/api/cases', {
                title: submissionData.detectedCategory.toUpperCase() + ": " + submissionData.description.substring(0, 30) + "...",
                description: submissionData.description,
                caseType: caseTypeMapping[submissionData.detectedCategory] || 'Other',
                priority: submissionData.priority,
                clientId: user._id,
                lawyerId: bestLawyer?._id,
                submissionMethod: 'voice',
                voiceTranscript: submissionData.description,
                nlpAnalysis: submissionData.nlpAnalysis
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Issue submitted! We've recommended ${bestLawyer?.name} for your case.`);
            fetchMyCases();
        } catch (error) {
            console.error('Error submitting voice request:', error);
            const errorMessage = error.response?.data?.message || 'Failed to submit request via voice.';
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isDocument = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

            if (!isValidSize) {
                alert(`${file.name} is too large. Max size is 5MB.`);
                return false;
            }
            if (!isImage && !isDocument) {
                alert(`${file.name} is not a supported file type.`);
                return false;
            }
            return true;
        });

        // Convert to base64 for storage
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedFiles(prev => [...prev, {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: reader.result
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFile = (index) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitIssue = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');

            // Auto-assign to recommended lawyer based on case type
            getRecommendations(issueData.caseType);
            const assignedLawyer = recommendedLawyers.find(l =>
                l.specializations?.some(s => s.toLowerCase().includes(issueData.caseType.toLowerCase()))
            ) || lawyers[0];

            const casePayload = {
                ...issueData,
                clientId: user._id,
                lawyerId: assignedLawyer?._id,
                submissionMethod: 'form',
                documents: uploadedFiles.map(f => ({
                    fileName: f.name,
                    fileType: f.type,
                    fileSize: f.size,
                    fileData: f.data
                }))
            };

            await api.post('/api/cases', casePayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Issue submitted successfully!');
            setShowIssueModal(false);
            setIssueData({ title: '', caseType: 'Criminal Law', description: '', priority: 'medium' });
            setUploadedFiles([]);
            fetchMyCases();
        } catch (error) {
            console.error('Error submitting issue:', error);
            alert(error.response?.data?.message || 'Failed to submit issue.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleHireLawyer = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await api.post('/api/cases', {
                ...hireData,
                clientId: user._id,
                lawyerId: selectedLawyer._id,
                submissionMethod: 'form',
                documents: uploadedFiles.map(f => ({
                    fileName: f.name,
                    fileType: f.type,
                    fileSize: f.size,
                    fileData: f.data
                }))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Case submitted successfully!');
            setShowHireModal(false);
            setHireData({ title: '', caseType: 'Criminal Law', description: '', priority: 'medium' });
            setUploadedFiles([]);
            fetchMyCases();
        } catch (error) {
            console.error('Error submitting case:', error);
            alert(error.response?.data?.message || 'Failed to submit case.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickChat = (lawyer) => {
        // Check if there's an existing active case with this lawyer
        const existingCase = cases.find(c =>
            c.lawyer?._id === lawyer._id &&
            ['submitted', 'under_review', 'in_progress'].includes(c.status)
        );

        if (existingCase) {
            setSelectedCaseForChat(existingCase);
            setShowChat(true);
        } else {
            // No existing case, show modal to start one
            setQuickChatLawyer(lawyer);
            setShowQuickChatModal(true);
        }
    };

    const startConsultation = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.post('/api/cases', {
                ...quickChatData,
                clientId: user._id,
                lawyerId: quickChatLawyer._id,
                submissionMethod: 'form',
                priority: 'medium'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // The backend returns the new case
            const newCase = response.data.case;

            // Re-fetch cases to update the list
            await fetchMyCases();

            // Close quick chat modal and open actual chat
            setShowQuickChatModal(false);
            setSelectedCaseForChat(newCase);
            setShowChat(true);
        } finally {
            setSubmitting(false);
        }
    };

    const getFilteredCases = () => {
        if (activeTab === 'all') return cases;
        if (activeTab === 'active') return cases.filter(c => c.status === 'under_review' || c.status === 'in_progress');
        if (activeTab === 'pending') return cases.filter(c => c.status === 'submitted');
        if (activeTab === 'closed') return cases.filter(c => c.status === 'closed');
        return cases;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'text-gray-600 bg-gray-100';
            case 'under_review': return 'text-blue-600 bg-blue-100';
            case 'in_progress': return 'text-yellow-600 bg-yellow-100';
            case 'closed': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Scale className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Modern Header */}
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                CaseBridge
                            </h1>
                            <p className="text-xs text-gray-500">Client Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/messages')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-all text-sm font-bold"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Messages
                        </button>
                        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                            <User className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Message Banner */}
                {showWelcome && (
                    <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 z-10">
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors group/close"
                                title="Dismiss message"
                            >
                                <X className="w-5 h-5 text-blue-100 group-hover/close:text-white" />
                            </button>
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Scale className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Welcome to CaseBridge, {user?.name}!</h2>
                                <p className="text-blue-100 text-lg max-w-2xl mb-6">
                                    {cases.length === 0
                                        ? "Your secure bridge to professional legal assistance. You don't have any active cases yet. Start the conversation with a verified lawyer today."
                                        : `You have ${cases.filter(c => c.status !== 'closed').length} active cases. Continue the conversation with your legal experts or start a new consultation.`}
                                </p>
                                <button
                                    onClick={() => setShowVoiceAssistant(true)}
                                    className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {cases.length === 0 ? "Start the Conversation" : "New Consultation"}
                                </button>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl"></div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={() => setActiveTab(activeTab === 'active' ? 'all' : 'active')}
                        className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left group ${activeTab === 'active' ? 'border-blue-600 ring-4 ring-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-semibold ${activeTab === 'active' ? 'text-blue-600' : 'text-gray-500'}`}>Active Cases</span>
                            <FileText className={`w-5 h-5 ${activeTab === 'active' ? 'text-blue-600' : 'text-blue-500'}`} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{cases.filter(c => c.status === 'under_review' || c.status === 'in_progress').length}</p>
                        <p className="text-xs text-gray-500 mt-1">Currently ongoing</p>
                    </button>

                    <button
                        onClick={() => setActiveTab(activeTab === 'pending' ? 'all' : 'pending')}
                        className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left group ${activeTab === 'pending' ? 'border-yellow-600 ring-4 ring-yellow-50 shadow-md' : 'border-gray-100 hover:border-yellow-200 hover:shadow-md'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-semibold ${activeTab === 'pending' ? 'text-yellow-600' : 'text-gray-500'}`}>Pending Review</span>
                            <Clock className={`w-5 h-5 ${activeTab === 'pending' ? 'text-yellow-600' : 'text-yellow-500'}`} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{cases.filter(c => c.status === 'submitted').length}</p>
                        <p className="text-xs text-gray-500 mt-1">Awaiting lawyer review</p>
                    </button>

                    <button
                        onClick={() => setActiveTab(activeTab === 'closed' ? 'all' : 'closed')}
                        className={`bg-white rounded-2xl p-6 shadow-sm border transition-all text-left group ${activeTab === 'closed' ? 'border-green-600 ring-4 ring-green-50 shadow-md' : 'border-gray-100 hover:border-green-200 hover:shadow-md'}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-semibold ${activeTab === 'closed' ? 'text-green-600' : 'text-gray-500'}`}>Resolved</span>
                            <CheckCircle className={`w-5 h-5 ${activeTab === 'closed' ? 'text-green-600' : 'text-green-500'}`} />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{cases.filter(c => c.status === 'closed').length}</p>
                        <p className="text-xs text-gray-500 mt-1">Successfully closed</p>
                    </button>
                </div>

                {/* Recommended Lawyers */}
                {recommendedLawyers.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                Recommended for You
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recommendedLawyers.map((lawyer) => (
                                <div key={lawyer._id} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-lg transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                            <Scale className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Verified</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">Advoc. {lawyer.name}</h3>
                                    <p className="text-xs text-blue-600 font-semibold mb-3">{lawyer.specializations?.[0]}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>{lawyer.yearsOfExperience} years experience</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedLawyer(lawyer);
                                                setShowHireModal(true);
                                            }}
                                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all"
                                        >
                                            Consult Now
                                        </button>
                                        <button
                                            onClick={() => handleQuickChat(lawyer)}
                                            className="px-4 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                                            title="Message Lawyer"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Lawyers */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Search className="w-6 h-6 text-blue-600" />
                        Find Lawyers
                    </h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, specialization, or location..."
                            className="w-full px-6 py-4 pl-14 bg-white rounded-2xl shadow-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>

                    {/* Filtered Lawyers */}
                    {searchTerm && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lawyers
                                .filter(l =>
                                    l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    l.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                    l.location?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((lawyer) => (
                                    <div key={lawyer._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-blue-500 transition-all flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Advoc. {lawyer.name}</h3>
                                            <p className="text-xs text-gray-500">{lawyer.specializations?.join(', ')}</p>
                                            <p className="text-xs text-blue-600 font-semibold mt-1">{lawyer.yearsOfExperience} years exp.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleQuickChat(lawyer)}
                                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                title="Message Lawyer"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedLawyer(lawyer);
                                                    setShowHireModal(true);
                                                }}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                                            >
                                                Hire
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* My Cases */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            My Cases
                            {activeTab !== 'all' && (
                                <span className="text-sm font-medium text-gray-400 ml-2">
                                    • Filtering by {activeTab}
                                </span>
                            )}
                        </h2>
                        {activeTab !== 'all' && (
                            <button
                                onClick={() => setActiveTab('all')}
                                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                Show All Cases
                            </button>
                        )}
                    </div>
                    {getFilteredCases().length > 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                            {getFilteredCases().map((c) => (
                                <div key={c._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{c.title}</h3>
                                            <p className="text-sm text-gray-500 mb-2">With Advoc. {c.lawyer?.name} • {c.caseNumber}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(c.status)}`}>
                                                    {c.status.replace('_', ' ')}
                                                </span>
                                                {c.priority === 'high' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-600">
                                                        High Priority
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {c.lawyer && (
                                            <button
                                                onClick={() => {
                                                    setSelectedCaseForChat(c);
                                                    setShowChat(true);
                                                }}
                                                className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Message Lawyer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {activeTab === 'all' ? "No cases yet" : `No ${activeTab} cases found`}
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                                {activeTab === 'all'
                                    ? "Start by describing your case to our AI Assistant or hiring a professional lawyer."
                                    : `Try changing your filters or checking all cases to see your full history.`}
                            </p>
                            {activeTab !== 'all' && (
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                                >
                                    Show All Cases
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Floating Voice Assistant Button */}
            <button
                onClick={() => setShowVoiceAssistant(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 group"
            >
                <MessageCircle className="w-8 h-8" />
                <div className="absolute right-full mr-4 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Voice Assistant
                </div>
            </button>

            {/* Voice Assistant Modal */}
            <VoiceAssistantModal
                isOpen={showVoiceAssistant}
                onClose={() => setShowVoiceAssistant(false)}
                onSubmitIssue={handleVoiceIssueSubmission}
            />

            {/* Chat Messaging Modal */}
            {showChat && selectedCaseForChat && (
                <ChatMessaging
                    caseId={selectedCaseForChat._id}
                    currentUser={user}
                    recipientUser={selectedCaseForChat.lawyer}
                    isOpen={showChat}
                    onClose={() => setShowChat(false)}
                />
            )}

            {/* Hire Lawyer Modal */}
            {showHireModal && selectedLawyer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Submit Your Case</h2>
                            <button onClick={() => setShowHireModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">Submit to <b>Advoc. {selectedLawyer.name}</b></p>

                        <form onSubmit={handleHireLawyer} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Case Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Brief description of your issue"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={hireData.title}
                                    onChange={(e) => setHireData({ ...hireData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Case Type</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={hireData.caseType}
                                        onChange={(e) => setHireData({ ...hireData, caseType: e.target.value })}
                                    >
                                        <option>Criminal Law</option>
                                        <option>Civil Law</option>
                                        <option>Family Law</option>
                                        <option>Property Law</option>
                                        <option>Corporate Law</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={hireData.priority}
                                        onChange={(e) => setHireData({ ...hireData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Provide detailed information about your case..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={hireData.description}
                                    onChange={(e) => setHireData({ ...hireData, description: e.target.value })}
                                ></textarea>
                            </div>

                            {/* File Upload Section */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Documents/Images</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                        <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                        <p className="text-sm font-medium text-gray-700">Click to upload files</p>
                                        <p className="text-xs text-gray-500 mt-1">Images, PDF, Word (Max 5MB each)</p>
                                    </label>
                                </div>

                                {/* Uploaded Files Preview */}
                                {uploadedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    {file.type.startsWith('image/') ? (
                                                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-200">
                                                            <img src={file.data} alt={file.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center">
                                                            <File className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowHireModal(false)}
                                    className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Case'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Start Consultation Modal */}
            {showQuickChatModal && quickChatLawyer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
                            <h3 className="text-xl font-bold">Start Conversation</h3>
                            <button onClick={() => setShowQuickChatModal(false)} className="p-2 hover:bg-white/20 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={startConsultation} className="p-6 space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-2">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                    {quickChatLawyer.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">Messaging</p>
                                    <h4 className="font-bold text-gray-900 text-lg">Advoc. {quickChatLawyer.name}</h4>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 italic">
                                To start a secure conversation, we'll create a consultation request for you.
                            </p>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Consultation Topic</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={quickChatData.title}
                                    onChange={(e) => setQuickChatData({ ...quickChatData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Initial Message / Context</label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    value={quickChatData.description}
                                    onChange={(e) => setQuickChatData({ ...quickChatData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowQuickChatModal(false)}
                                    className="flex-1 py-3 border-2 border-gray-100 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {submitting ? 'Starting...' : 'Start Chat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}