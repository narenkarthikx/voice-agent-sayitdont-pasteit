import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mic, BarChart2, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Since we don't have a register function in context yet, we'll mock it or add it later.
    // For now, we'll just handle login. If register is selected, we map to login for demo or
    // we can implement a register call if the backend supports it (which it does: /auth/register).
    // But let's check if AuthContext exposes register. It currently doesn't.
    // I will add register to AuthContext in the next step.

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLoginView) {
            const success = await login(formData.username, formData.password);
            if (success) {
                navigate('/app/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } else {
            // Handle Register
            // Since AuthContext doesn't have register yet, I'll temporarily use a direct fetch or just show a message
            // But for a proper implementation, I will update AuthContext after this file creation.
            try {
                const response = await fetch('http://localhost:8000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Auto login after register
                    const success = await login(formData.username, formData.password);
                    if (success) {
                        navigate('/app/dashboard');
                    } else {
                        setIsLoginView(true);
                        setError('Registration successful! Please login.');
                    }
                } else {
                    const data = await response.json();
                    setError(data.detail || 'Registration failed');
                }
            } catch (err) {
                setError('An error occurred. Please try again.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-indigo-500/20 rounded-full blur-[80px]"></div>
            </div>

            <nav className="relative z-10 px-8 py-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Mic className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        SayIt! Don't PasteIt!
                    </span>
                </div>
                <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
                    <a href="#features" className="hover:text-white transition-colors">Workflow</a>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-12 md:py-20 gap-12">

                {/* Left Content */}
                <div className="md:w-1/2 space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-green-400">AI Voice Agent Active</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                        Recruit with the <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            Speed of Sound
                        </span>
                    </h1>

                    <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                        Stop pasting resumes. Start hearing candidates. Our AI voice agents conduct intelligent, conversational screenings so you can hire the best talent, faster.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center space-x-8 mt-4 text-gray-400">
                            <div className="flex items-center space-x-2">
                                <BarChart2 className="w-5 h-5 text-indigo-400" />
                                <span>Data-Driven</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="w-5 h-5 text-purple-400" />
                                <span>Unbiased</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content - Authentication Card */}
                <div className="md:w-1/2 w-full max-w-md mx-auto relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-20 transform rotate-6"></div>
                    <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative">
                        <div className="flex justify-between mb-8 border-b border-white/10 pb-4">
                            <button
                                onClick={() => setIsLoginView(true)}
                                className={`text-lg font-medium pb-4 -mb-4 transition-all ${isLoginView ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setIsLoginView(false)}
                                className={`text-lg font-medium pb-4 -mb-4 transition-all ${!isLoginView ? 'text-white border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Register
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-600"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-600"
                                    placeholder="Enter password"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-red-400 text-sm text-center">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span>{isLoginView ? 'Sign In' : 'Create Account'}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {isLoginView && (
                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ username: 'admin', password: 'password123' })}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors focus:outline-none"
                                >
                                    Auto-fill Demo Credentials (admin)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* How It Works Section */}
            <section id="features" className="relative z-10 py-24 bg-gray-900/50 backdrop-blur-lg border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 animate-fade-in-up">
                        <h2 className="text-sm font-semibold text-indigo-400 tracking-wider uppercase mb-3">
                            The Workflow
                        </h2>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                            3-Phase Intelligent Screening
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                            From resume upload to final shortlist, our autonomous agents handle the entire initial screening process with human-like precision.
                        </p>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 z-0"></div>

                        {/* Phase 1 */}
                        <div className="relative z-10 group">
                            <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-3xl hover:bg-gray-800/80 transition-all hover:-translate-y-2 duration-300 h-full">
                                <div className="w-16 h-16 bg-gray-900 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform relative">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold border-4 border-gray-900">1</div>
                                    <Users className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-center text-white">Pre-Call Screening</h3>
                                <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-indigo-400">•</span>
                                        <span><strong>Resume Parsing:</strong> Instant extraction of skills & experience.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-indigo-400">•</span>
                                        <span><strong>Smart Fit Score:</strong> LLM analyzes candidates against job descriptions (0-100 score).</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-indigo-400">•</span>
                                        <span><strong>Auto-Filter:</strong> Low matches are automatically filtered out.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Phase 2 */}
                        <div className="relative z-10 group">
                            <div className="bg-gray-800/40 border border-purple-500/30 p-8 rounded-3xl hover:bg-gray-800/80 transition-all hover:-translate-y-2 duration-300 h-full relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                                <div className="w-16 h-16 bg-gray-900 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform relative">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold border-4 border-gray-900">2</div>
                                    <Mic className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-center text-white">Voice AI Interview</h3>
                                <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-purple-400">•</span>
                                        <span><strong>Autonomous Calls:</strong> AI calls qualified candidates automatically.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-purple-400">•</span>
                                        <span><strong>Targeted Questions:</strong> Asks 3-5 deep technical & behavioral questions.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-purple-400">•</span>
                                        <span><strong>Natural Chat:</strong> Handles follow-ups and interruptions naturally.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Phase 3 */}
                        <div className="relative z-10 group">
                            <div className="bg-gray-800/40 border border-gray-700/50 p-8 rounded-3xl hover:bg-gray-800/80 transition-all hover:-translate-y-2 duration-300 h-full">
                                <div className="w-16 h-16 bg-gray-900 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform relative">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold border-4 border-gray-900">3</div>
                                    <BarChart2 className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-center text-white">Post-Call Analysis</h3>
                                <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-blue-400">•</span>
                                        <span><strong>Instant Insights:</strong> Get transcripts, recordings, and structured summaries.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-blue-400">•</span>
                                        <span><strong>Skill Scoring:</strong> Detailed assessment of technical depth per skill.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-blue-400">•</span>
                                        <span><strong>Final Decision:</strong> AI recommends Shortlist, On-Hold, or Reject.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 text-center">
                        <div className="inline-flex items-center space-x-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full px-6 py-3">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                            <span className="text-indigo-300 font-medium">80% faster hiring time • 24/7 Availability</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Decorative Waveform */}
            <div className="absolute bottom-0 left-0 w-full opacity-30 pointer-events-none">
                {/* Simple SVG wave representation or use an image asset if preferred. For CSS-only, gradients work well. */}
                <div className="h-24 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>
            </div>
        </div>
    );
};

export default LandingPage;
