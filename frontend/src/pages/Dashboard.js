import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { PhoneCall, Users, CheckCircle, XCircle, Clock, TrendingUp, Award, Brain, Activity, Calendar, Bot } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
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

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
    <div className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-white/5 p-6 rounded-2xl group hover:border-white/10 transition-all duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className={`p-2 w-fit rounded-lg mb-4 bg-white/5 ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
        </div>
        <div>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{user?.username || 'User'}</span>
          </h2>
          <p className="text-gray-400 mt-1 text-sm">Here's what's happening with your recruitment pipeline today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-lg border border-white/5">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-gray-300">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Candidates"
          value={stats.total_candidates}
          icon={Users}
          colorClass="text-blue-500 bg-blue-500/20"
        />
        <StatCard
          title="Active Calls"
          value={stats.in_progress_calls}
          subtext="Currently screening"
          icon={PhoneCall}
          colorClass="text-purple-500 bg-purple-500/20"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          subtext={`${stats.high_match} High Match`}
          icon={CheckCircle}
          colorClass="text-green-500 bg-green-500/20"
        />
        <StatCard
          title="Avg Functionality Score"
          value={`${stats.avg_fit_score}%`}
          icon={Activity}
          colorClass="text-orange-500 bg-orange-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column - Tech Skills & Recent Candidates */}
        <div className="lg:col-span-2 space-y-8">

          {/* Pipeline Visual */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Hiring Funnel</h3>
                <p className="text-sm text-gray-500">Conversion rates across phases</p>
              </div>
              <div className="p-2 bg-white/5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20">
                <div className="flex justify-between items-start mb-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-mono text-indigo-300/50">01</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.total_candidates}</p>
                <p className="text-xs text-indigo-200">Applied</p>
              </div>
              {/* Step 2 */}
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 border border-purple-500/20">
                <div className="flex justify-between items-start mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="text-xs font-mono text-purple-300/50">02</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.pre_screened_proceed}</p>
                <p className="text-xs text-purple-200">Passed AI Screening</p>
              </div>
              {/* Step 3 */}
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/5 border border-green-500/20">
                <div className="flex justify-between items-start mb-2">
                  <Award className="w-5 h-5 text-green-400" />
                  <span className="text-xs font-mono text-green-300/50">03</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.shortlisted}</p>
                <p className="text-xs text-green-200">Shortlisted</p>
              </div>
            </div>
          </div>

          {/* Recent Candidates */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Top Candidates</h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View All</button>
            </div>

            <div className="space-y-4">
              {stats.recent_top_candidates && stats.recent_top_candidates.length > 0 ? (
                stats.recent_top_candidates.map((candidate, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                        {candidate.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{candidate.name}</h4>
                        <div className="flex gap-2 mt-1">
                          {candidate.skills?.slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-gray-300 rounded border border-white/10">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${candidate.match_score === 'high'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                        {candidate.match_score?.toUpperCase()} MATCH
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {candidate.call_date ? new Date(candidate.call_date).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No candidates processed yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Stats */}
        <div className="space-y-8">
          {/* Call Outcomes */}
          <div className="bg-slate-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Call Outcomes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/10 hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-green-500/20 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-300">Shortlisted</span>
                </div>
                <span className="text-lg font-bold text-white">{stats.shortlisted}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10 border border-orange-500/10 hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-orange-500/20 text-orange-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-300">On Hold</span>
                </div>
                <span className="text-lg font-bold text-white">{stats.on_hold}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/10 hover:border-red-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-red-500/20 text-red-400">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-300">Rejected</span>
                </div>
                <span className="text-lg font-bold text-white">{stats.rejected}</span>
              </div>
            </div>
          </div>

          {/* AI Agent Status */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-indigo-950/40 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-8 -mt-8"></div>

            <h3 className="text-lg font-bold text-white mb-4 relative z-10 flex items-center">
              <Bot className="w-5 h-5 mr-2 text-indigo-400" />
              AI Agent Status
            </h3>

            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Status</span>
                <span className="flex items-center text-green-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                  Online & active
                </span>
              </div>

              <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full w-[35%]"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Load: 35%</span>
                <span>{stats.in_progress_calls} Active Calls</span>
              </div>

              <button className="w-full py-2.5 mt-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-900/20">
                View Agent Logs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
