import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Upload, PhoneCall, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates/');
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('resume-upload');
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (selectedJob) {
        formData.append('job_id', selectedJob);
    }

    setUploading(true);
    try {
      await api.post('/candidates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchCandidates();
      setShowUploadModal(false);
      setSelectedJob('');
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleCall = async (id) => {
    try {
      await api.post(`/candidates/${id}/call`);
      toast.success("Call triggered successfully!");
      setTimeout(fetchCandidates, 1000); // Refresh candidates after call
    } catch (error) {
      console.error("Call trigger failed:", error);
      const errorMsg = error.response?.data?.detail || "Failed to trigger call";
      toast.error(errorMsg);
    }
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Candidate Pool
          </h2>
          <p className="text-gray-600 mt-2">Upload resumes and initiate AI voice screenings</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg font-semibold transition-all"
          >
            <Upload className="w-5 h-5 mr-2" />
            Add Candidate
          </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-4">
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Total Candidates</p>
          <p className="text-2xl font-bold text-gray-900">{candidates.length}</p>
        </div>
        <div className="flex-1 bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg shadow-sm border border-green-200">
          <p className="text-sm text-green-700 font-semibold">✓ Pre-Qualified</p>
          <p className="text-2xl font-bold text-green-600">
            {candidates.filter(c => c.pre_screen_status === 'proceed').length}
          </p>
        </div>
        <div className="flex-1 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg shadow-sm border border-red-200">
          <p className="text-sm text-red-700 font-semibold">✗ Pre-Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {candidates.filter(c => c.pre_screen_status === 'reject').length}
          </p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Voice Screened</p>
          <p className="text-2xl font-bold text-blue-600">
            {candidates.filter(c => c.screening_status).length}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Candidate</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Applied For</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Key Skills</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Pre-Screen</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Voice Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((candidate) => {
              const jobTitle = jobs.find(j => j._id === candidate.job_id)?.title || 'General';
              return (
              <tr key={candidate._id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                      {candidate.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{candidate.fullName}</div>
                      <div className="text-xs text-gray-500">{candidate.email}</div>
                      <div className="text-xs text-gray-400">{candidate.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-semibold text-indigo-600">{jobTitle}</div>
                      <div className="text-xs text-gray-500">{candidate.years_of_experience ? `${candidate.years_of_experience}+ years` : 'Fresher'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white">
                        +{candidate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {candidate.pre_screen_status ? (
                    <div>
                      <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                        candidate.pre_screen_status === 'proceed' ? 'bg-green-100 text-green-800 border border-green-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {candidate.pre_screen_status === 'proceed' ? '✓ Qualified' : '✗ Rejected'}
                      </span>
                      {candidate.fit_score !== undefined && (
                        <div className="text-xs text-gray-600 mt-1">
                          Score: <span className="font-bold">{candidate.fit_score}/100</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Pending</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {candidate.screening_status ? (
                    <div>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        candidate.screening_status === 'selected' ? 'bg-green-100 text-green-800' :
                        candidate.screening_status === 'rejected' ? 'bg-red-100 text-red-800' :
                        candidate.screening_status === 'screened' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {candidate.screening_status === 'selected' ? '✓ Selected' :
                         candidate.screening_status === 'rejected' ? '✗ Rejected' :
                         'Screened'}
                      </span>
                      {candidate.last_match_score && (
                        <span className={`ml-2 text-xs ${
                          candidate.last_match_score === 'high' ? 'text-green-600' :
                          candidate.last_match_score === 'medium' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          ({candidate.last_match_score})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Not called yet</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewDetails(candidate)}
                      className="text-gray-600 hover:text-blue-600 flex items-center"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCall(candidate._id)}
                      disabled={candidate.pre_screen_status === 'reject'}
                      className={`px-3 py-1.5 rounded-lg flex items-center text-xs font-semibold shadow-sm ${
                        candidate.pre_screen_status === 'reject'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                      }`}
                      title={candidate.pre_screen_status === 'reject' ? 'Pre-screening failed' : 'Initiate AI Screening Call'}
                    >
                      <PhoneCall className="w-4 h-4 mr-1" />
                      {candidate.pre_screen_status === 'reject' ? 'Blocked' : 'Initiate Call'}
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {candidates.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No candidates found. Upload a resume to get started.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Upload Candidate Resume</h3>
                    <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-xs text-indigo-800 font-semibold mb-1">🤖 AI Pre-Screening Enabled</p>
                  <p className="text-xs text-indigo-600">Resume will be automatically analyzed against job requirements. Only qualified candidates proceed to voice screening.</p>
                </div>
                <form onSubmit={handleFileUpload}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Job Role (Required for AI Pre-Screening)</label>
                        <select 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={selectedJob}
                            onChange={(e) => setSelectedJob(e.target.value)}
                        >
                            <option value="">-- General / No Specific Job --</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF)</label>
                        <input 
                            id="resume-upload"
                            type="file" 
                            accept=".pdf"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button 
                            type="button"
                            onClick={() => setShowUploadModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedCandidate.fullName}</h3>
                        <p className="text-gray-500">{selectedCandidate.email} • {selectedCandidate.phone}</p>
                    </div>
                    <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Pre-Screening Banner */}
                {selectedCandidate.pre_screen_status && (
                  <div className={`mb-6 p-4 rounded-xl border-2 ${
                    selectedCandidate.pre_screen_status === 'proceed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1 flex items-center">
                          {selectedCandidate.pre_screen_status === 'proceed' ? '✓' : '✗'} Phase 1: AI Pre-Screening
                        </h4>
                        <p className={`text-sm ${
                          selectedCandidate.pre_screen_status === 'proceed' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {selectedCandidate.pre_screen_reason || 'Resume analyzed against job requirements'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">{selectedCandidate.fit_score || 0}<span className="text-lg">/100</span></p>
                        <p className="text-xs text-gray-500">Fit Score</p>
                      </div>
                    </div>
                    {selectedCandidate.matching_skills && selectedCandidate.matching_skills.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-green-700 font-semibold mb-1">Matching Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedCandidate.matching_skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCandidate.missing_skills && selectedCandidate.missing_skills.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-700 font-semibold mb-1">Missing Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedCandidate.missing_skills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Professional Summary</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600"><span className="font-medium">Experience:</span> {selectedCandidate.years_of_experience} years ({selectedCandidate.exp_type})</p>
                            <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Job Role:</span> {jobs.find(j => j._id === selectedCandidate.job_id)?.title || 'General'}</p>
                        </div>

                        <h4 className="font-semibold text-gray-700 mt-6 mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedCandidate.skills.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Experience</h4>
                        <div className="space-y-4">
                            {selectedCandidate.experience.length > 0 ? (
                                selectedCandidate.experience.map((exp, index) => (
                                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                                        <p className="font-medium text-gray-800">{exp.role || 'Role Unknown'}</p>
                                        <p className="text-sm text-blue-600">{exp.company || 'Company Unknown'}</p>
                                        <p className="text-xs text-gray-500">{exp.duration || ''}</p>
                                        {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No detailed experience listed.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                    <h4 className="font-semibold text-gray-700 mb-2">Resume Snippet</h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 font-mono h-32 overflow-y-auto">
                        {selectedCandidate.resume_text ? selectedCandidate.resume_text.slice(0, 1000) + '...' : 'No resume text available.'}
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    {selectedCandidate.screening_status && (
                        <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">Status:</span>
                            <span className={`px-3 py-1.5 inline-flex text-sm font-semibold rounded-full ${
                                selectedCandidate.screening_status === 'selected' ? 'bg-green-100 text-green-800' :
                                selectedCandidate.screening_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                selectedCandidate.screening_status === 'screened' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {selectedCandidate.screening_status === 'selected' ? '✓ Selected by AI' :
                                 selectedCandidate.screening_status === 'rejected' ? '✗ Not Selected' :
                                 selectedCandidate.screening_status === 'screened' ? 'Screened' :
                                 'Not Screened'}
                            </span>
                        </div>
                    )}
                    <button 
                        onClick={() => handleCall(selectedCandidate._id)}
                        className="flex items-center px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 font-semibold shadow-md"
                    >
                        <PhoneCall className="w-5 h-5 mr-2" />
                        Initiate AI Screening Call
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
