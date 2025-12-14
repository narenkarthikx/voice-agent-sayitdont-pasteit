import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', description: '', requirements: '' });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs/');
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await api.delete(`/jobs/${id}`);
                fetchJobs();
                toast.success("Job deleted successfully");
            } catch (error) {
                console.error("Error deleting job:", error);
                toast.error("Failed to delete job");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newJob,
                requirements: newJob.requirements.split(',').map(req => req.trim())
            };
            await api.post('/jobs/', payload);
            setShowModal(false);
            setNewJob({ title: '', description: '', requirements: '' });
            toast.success("Job created successfully");
            fetchJobs();
        } catch (error) {
            console.error("Error creating job:", error);
            toast.error("Failed to create job");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">
                        Open Positions
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">AI-powered voice screening for job openings</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/20 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Post Position
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <div key={job._id} className="bg-slate-800/50 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                                <p className="text-xs text-gray-500">📅 {new Date(job.created_at).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(job._id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                title="Delete Position"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-400 mt-3 line-clamp-3 text-sm leading-relaxed">{job.description}</p>
                        <div className="mt-5 pt-4 border-t border-white/5">
                            <h4 className="text-xs font-bold uppercase text-indigo-400 mb-2">Key Requirements</h4>
                            <div className="flex flex-wrap gap-2">
                                {job.requirements.slice(0, 4).map((req, index) => (
                                    <span key={index} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded-full font-medium border border-indigo-500/20">
                                        {req}
                                    </span>
                                ))}
                                {job.requirements.length > 4 && (
                                    <span className="px-2.5 py-1 bg-white/5 text-gray-400 text-xs rounded-full font-medium">
                                        +{job.requirements.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-slate-800/30 rounded-2xl border-2 border-dashed border-white/10">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
                            <Briefcase className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-300 font-medium text-lg mb-2">No open positions yet</p>
                        <p className="text-gray-500 text-sm">Create your first job opening to start AI voice screening</p>
                    </div>
                )}
            </div>

            {/* Create Job Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/20">
                                    <Briefcase className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    Post New Position
                                </h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Position Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Senior React Developer"
                                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Describe the role and responsibilities..."
                                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                />
                            </div>
                            <div className="mb-7">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Key Requirements</label>
                                <input
                                    type="text"
                                    placeholder="React, Python, Node.js, 3+ years exp"
                                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    value={newJob.requirements}
                                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate with commas - AI will screen candidates on these</p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-gray-400 hover:bg-white/5 rounded-lg font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-900/20 transition-all"
                                >
                                    Create Position
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Jobs;
