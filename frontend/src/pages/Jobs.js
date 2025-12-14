import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
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
            } catch (error) {
                console.error("Error deleting job:", error);
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Open Positions
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">AI-powered voice screening for job openings</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 shadow-md font-semibold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Post Position
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <div key={job._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:border-indigo-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mb-3">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
                                <p className="text-xs text-gray-400">📅 {new Date(job.created_at).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(job._id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Delete Position"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 mt-3 line-clamp-3 text-sm leading-relaxed">{job.description}</p>
                        <div className="mt-5 pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-bold uppercase text-indigo-600 mb-2">Key Requirements</h4>
                            <div className="flex flex-wrap gap-2">
                                {job.requirements.slice(0, 4).map((req, index) => (
                                    <span key={index} className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 text-xs rounded-full font-medium border border-indigo-200">
                                        {req}
                                    </span>
                                ))}
                                {job.requirements.length > 4 && (
                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                        +{job.requirements.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {jobs.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-dashed border-indigo-200">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-600 font-medium text-lg mb-2">No open positions yet</p>
                        <p className="text-gray-500 text-sm">Create your first job opening to start AI voice screening</p>
                    </div>
                )}
            </div>

            {/* Create Job Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                                <Briefcase className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                                Post New Position
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Position Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Senior React Developer"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Job Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Describe the role and responsibilities..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                />
                            </div>
                            <div className="mb-7">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Key Requirements</label>
                                <input
                                    type="text"
                                    placeholder="React, Python, Node.js, 3+ years exp"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    value={newJob.requirements}
                                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate with commas - AI will screen candidates on these</p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 font-semibold shadow-md transition-all"
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
