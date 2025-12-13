import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PhoneCall, Users, CheckCircle, XCircle, Clock, TrendingUp, Award, Brain } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_calls: 0,
    total_candidates: 0,
    pre_screened_proceed: 0,
    pre_screened_reject: 0,
    avg_fit_score: 0,
    completed_calls: 0,
    in_progress_calls: 0,
    shortlisted: 0,
    rejected: 0,
    on_hold: 0,
    high_match: 0,
    medium_match: 0,
    low_match: 0,
    recent_top_candidates: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            AI Voice Screening Dashboard
          </h2>
          <p className="text-gray-600 mt-2 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Real-time automated candidate screening
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-lg font-semibold text-gray-700">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Pre-Screening Phase Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              Phase 1: AI Pre-Screening
            </h3>
            <p className="text-indigo-100 text-sm">Resume analysis before voice calls • Saves time & credits</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold">{stats.avg_fit_score}<span className="text-2xl">/100</span></p>
            <p className="text-indigo-100 text-xs mt-1">Average Fit Score</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <p className="text-3xl font-bold">{stats.pre_screened_proceed}</p>
            <p className="text-indigo-100 text-sm">✓ Qualified for Call</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg backdrop-blur-sm">
            <p className="text-3xl font-bold">{stats.pre_screened_reject}</p>
            <p className="text-indigo-100 text-sm">✗ Auto-Rejected</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Candidates</p>
              <p className="text-4xl font-bold mt-2">{stats.total_candidates}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">AI Calls Completed</p>
              <p className="text-4xl font-bold mt-2">{stats.completed_calls}</p>
              <p className="text-xs text-purple-200 mt-1">of {stats.total_calls} total</p>
            </div>
            <PhoneCall className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Shortlisted</p>
              <p className="text-4xl font-bold mt-2">{stats.shortlisted}</p>
              <p className="text-xs text-green-200 mt-1">AI Recommended</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">In Progress</p>
              <p className="text-4xl font-bold mt-2">{stats.in_progress_calls}</p>
              <p className="text-xs text-orange-200 mt-1">Live Screening</p>
            </div>
            <Clock className="w-12 h-12 text-orange-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* AI Screening Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Outcomes */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <Brain className="w-6 h-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">AI Screening Outcomes</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-700">Shortlisted</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.shortlisted}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="font-medium text-gray-700">On Hold</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{stats.on_hold}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-3" />
                <span className="font-medium text-gray-700">Rejected</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats.rejected}</span>
            </div>
          </div>
        </div>

        {/* Match Scores */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">AI Match Scores</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-green-600 mr-3" />
                <span className="font-medium text-gray-700">High Match</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">{stats.high_match}</span>
                <p className="text-xs text-gray-500">Strong technical skills</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="font-medium text-gray-700">Medium Match</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-yellow-600">{stats.medium_match}</span>
                <p className="text-xs text-gray-500">Basic understanding</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-700">Low Match</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-600">{stats.low_match}</span>
                <p className="text-xs text-gray-500">Needs improvement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Top Candidates */}
      {stats.recent_top_candidates && stats.recent_top_candidates.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <Award className="w-6 h-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Top Screened Candidates</h3>
            <span className="ml-auto text-sm text-gray-500">AI Shortlisted</span>
          </div>
          <div className="space-y-3">
            {stats.recent_top_candidates.map((candidate, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{candidate.name}</p>
                    <div className="flex gap-2 mt-1">
                      {candidate.skills.map((skill, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    candidate.match_score === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {candidate.match_score} match
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {candidate.call_date ? new Date(candidate.call_date).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
