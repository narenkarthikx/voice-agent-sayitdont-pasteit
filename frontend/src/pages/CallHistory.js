import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Play, Pause, X, Loader2, Calendar, Clock, User, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import WaveSurfer from 'wavesurfer.js';

const WaveformPlayer = ({ url }) => {
  const containerRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create WaveSurfer instance
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#cbd5e1', // Slate-300
      progressColor: '#2563eb', // Blue-600
      cursorColor: '#1e40af', // Blue-800
      barWidth: 2,
      barGap: 3,
      barRadius: 3,
      height: 64,
      normalize: true,
      minPxPerSec: 50,
    });

    wavesurfer.current = ws;
    ws.load(url).catch((err) => {
        if (err.name !== 'AbortError') {
            console.error("Error loading audio:", err);
        }
    });

    ws.on('ready', () => {
      setIsReady(true);
    });

    ws.on('finish', () => {
      setIsPlaying(false);
    });

    return () => {
      try {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
          wavesurfer.current = null;
        }
      } catch (e) {
        // Ignore AbortError which happens when destroying while loading
        if (e.name !== 'AbortError') {
            console.warn("Error destroying wavesurfer instance:", e);
        }
      }
    };
  }, [url]);

  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(wavesurfer.current.isPlaying());
    }
  };

  return (
    <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div ref={containerRef} className="w-full mb-4" />
      
      <div className="flex justify-center">
        <button
          onClick={togglePlayPause}
          disabled={!isReady}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>
      </div>
    </div>
  );
};

const CallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [loadingRecording, setLoadingRecording] = useState(false);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await api.get('/calls/');
      setCalls(response.data);
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };

  const handlePlayRecording = async (call) => {
    setSelectedCall(call);
    setLoadingRecording(true);
    setShowRecordingModal(true);
    setRecordingUrl(null);

    try {
      const response = await api.get(`/calls/${call._id}/recording`);
      if (response.data.recording_url) {
        setRecordingUrl(response.data.recording_url);
      } else {
        toast.info("Recording not available for this call.");
        // We keep the modal open to show details even if recording is missing, 
        // but maybe the user wants to close it? 
        // For now let's keep it open so they can see the summary.
      }
    } catch (error) {
      console.error("Error fetching recording:", error);
      toast.error("Failed to load recording or recording unavailable.");
    } finally {
      setLoadingRecording(false);
    }
  };

  return (
    <div>
       <div className="mb-8">
         <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
           AI Screening History
         </h2>
         <p className="text-gray-600 mt-2">Review all automated voice screening sessions</p>
       </div>
       <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">AI Result</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Match Score</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Screened On</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {calls.map((call) => (
              <tr key={call._id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2">
                      AI
                    </div>
                    <span className="text-gray-700">Candidate #{call.candidate_id.slice(-6)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {call.outcome ? (
                    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full ${
                      call.outcome === 'shortlisted' ? 'bg-green-100 text-green-800 border border-green-300' : 
                      call.outcome === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' : 
                      call.outcome === 'on_hold' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                      'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {call.outcome === 'shortlisted' ? '✓ Shortlisted' : 
                       call.outcome === 'rejected' ? '✗ Rejected' : 
                       call.outcome === 'on_hold' ? '⏸ On Hold' : 
                       '⊘ Incomplete'}
                    </span>
                  ) : (
                    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      call.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                      call.status === 'In-Progress' ? 'bg-orange-100 text-orange-800 animate-pulse' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {call.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {call.match_score ? (
                    <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${
                      call.match_score === 'high' ? 'bg-green-100 text-green-700' : 
                      call.match_score === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {call.match_score.toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not assessed</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {call.start_time ? new Date(call.start_time).toLocaleString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {call.status === 'Completed' && (
                    <button
                      onClick={() => handlePlayRecording(call)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-end ml-auto font-semibold shadow-sm"
                      title="View Details & Play"
                    >
                      <Play className="w-4 h-4 mr-1" /> Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {calls.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No calls recorded yet.
          </div>
        )}
       </div>

       {/* Call Details & Recording Modal */}
       {showRecordingModal && selectedCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Call Details</h3>
                    <button onClick={() => setShowRecordingModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Recording Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <Play className="w-4 h-4 mr-2" /> Call Recording
                        </h4>
                        {loadingRecording ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                                <p className="text-sm text-gray-500">Loading audio...</p>
                            </div>
                        ) : recordingUrl ? (
                            <WaveformPlayer url={recordingUrl} />
                        ) : (
                            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg text-sm text-center">
                                No recording available for this call.
                            </div>
                        )}
                    </div>

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center"><User className="w-3 h-3 mr-1" /> Candidate ID</p>
                            <p className="text-sm font-medium text-gray-900 truncate">{selectedCall.candidate_id}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" /> Status</p>
                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${selectedCall.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                selectedCall.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                                {selectedCall.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Started At</p>
                            <p className="text-sm font-medium text-gray-900">
                                {selectedCall.start_time ? new Date(selectedCall.start_time).toLocaleString() : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Ended At</p>
                            <p className="text-sm font-medium text-gray-900">
                                {selectedCall.end_time ? new Date(selectedCall.end_time).toLocaleString() : '-'}
                            </p>
                        </div>
                        {selectedCall.outcome && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Outcome</p>
                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${selectedCall.outcome === 'shortlisted' ? 'bg-green-100 text-green-800' : 
                                    selectedCall.outcome === 'rejected' ? 'bg-red-100 text-red-800' : 
                                    selectedCall.outcome === 'on_hold' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-gray-100 text-gray-800'}`}>
                                    {selectedCall.outcome}
                                </span>
                            </div>
                        )}
                        {selectedCall.match_score && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Match Score</p>
                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${selectedCall.match_score === 'high' ? 'bg-green-100 text-green-800' : 
                                    selectedCall.match_score === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}`}>
                                    {selectedCall.match_score}
                                </span>
                            </div>
                        )}
                        {selectedCall.availability && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Availability</p>
                                <p className="text-sm font-medium text-gray-900">{selectedCall.availability}</p>
                            </div>
                        )}
                        {selectedCall.current_ctc && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Current CTC</p>
                                <p className="text-sm font-medium text-gray-900">{selectedCall.current_ctc}</p>
                            </div>
                        )}
                        {selectedCall.expected_ctc && (
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Expected CTC</p>
                                <p className="text-sm font-medium text-gray-900">{selectedCall.expected_ctc}</p>
                            </div>
                        )}
                    </div>

                    {/* Skills Assessment */}
                    {selectedCall.skills_assessment && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2" /> Skills Assessment
                            </h4>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {selectedCall.skills_assessment}
                            </div>
                        </div>
                    )}

                    {/* Summary */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2" /> AI Summary
                        </h4>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedCall.summary || "No summary available."}
                        </div>
                    </div>

                    {/* Transcript (if available) */}
                    {selectedCall.transcript && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <FileText className="w-4 h-4 mr-2" /> Transcript
                            </h4>
                            <div className="bg-white border border-gray-200 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                                {selectedCall.transcript}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button 
                        onClick={() => setShowRecordingModal(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CallHistory;
