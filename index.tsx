
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { MASTER_ATOMS } from './atomsData.js';

/** 
 * CONSTANTS & ENUMS 
 **/
const SessionStatus = {
  NOT_TAUGHT: 'NOT_TAUGHT',
  TAUGHT_REPEAT: 'TAUGHT_REPEAT',
  MASTERED: 'MASTERED'
};

const Strand = {
  PLACE_VALUE: 'Place Value',
  TIMES_TABLES: 'Times Tables'
};

/** 
 * INITIAL DATA 
 * Seed data representing the 'sessions' collection.
 **/
const INITIAL_SESSIONS = [
  {
    id: 'pv-session-1',
    strand: Strand.PLACE_VALUE,
    title: 'Placeholder Zero',
    learningIntention: 'Identify that "10" is different from "1" because the "0" holds a place.',
    status: SessionStatus.MASTERED,
    teacherNotes: 'Students understood this well using MAB blocks.',
    order: 1,
    linkedAtomIds: ['PV-1.3']
  },
  {
    id: 'pv-session-2',
    strand: Strand.PLACE_VALUE,
    title: 'Teen vs Ty Confusions',
    learningIntention: 'Distinguish between 13 (thirteen) and 30 (thirty) by sound and symbol.',
    status: SessionStatus.TAUGHT_REPEAT,
    teacherNotes: 'Some students still writing 31 for thirteen. Needs group drill.',
    order: 2,
    linkedAtomIds: ['PV-2.1']
  },
  {
    id: 'pv-session-3',
    strand: Strand.PLACE_VALUE,
    title: 'Rounding Strategies',
    learningIntention: 'Round any number to the nearest 10 using the midpoint rule.',
    status: SessionStatus.NOT_TAUGHT,
    teacherNotes: '',
    order: 3,
    linkedAtomIds: ['PV-3.4']
  },
  {
    id: 'tt-session-1',
    strand: Strand.TIMES_TABLES,
    title: 'Repeated Addition Basics',
    learningIntention: 'Transform 2+2+2 into 3 x 2.',
    status: SessionStatus.MASTERED,
    teacherNotes: 'High engagement with Lego brick arrays.',
    order: 1,
    linkedAtomIds: ['TT-1.2']
  },
  {
    id: 'tt-session-2',
    strand: Strand.TIMES_TABLES,
    title: 'Commutative Law',
    learningIntention: 'Understand that 5 x 2 and 2 x 5 have the same product.',
    status: SessionStatus.TAUGHT_REPEAT,
    teacherNotes: 'Wait for the class to visualize turning the array 90 degrees.',
    order: 2,
    linkedAtomIds: ['TT-2.1']
  }
];

/** 
 * FIREBASE SIMULATOR 
 * Mock service that uses LocalStorage to mimic Firestore persistence.
 **/
const STORAGE_KEY = 'maths_mastery_db_v1';
const firebaseService = {
  getSessions: (callback) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : INITIAL_SESSIONS;
    if (!stored) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    callback(data);
    
    const handleStorage = () => {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      callback(current);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  },
  updateSession: async (id, updates) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const data = JSON.parse(stored);
    const updated = data.map(s => s.id === id ? { ...s, ...updates } : s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};

/** 
 * AI COACH SERVICE 
 **/
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const getAISuggestions = async (intention) => {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a Maths Education Specialist. For the learning intention "${intention}", give 2-3 specific classroom activities. Max 60 words.`,
    });
    return res.text || "No suggestions found.";
  } catch (e) {
    return "Gemini is busy right now.";
  }
};

/** 
 * COMPONENTS 
 **/

const SessionCard = ({ session, isExpanded, onToggle }) => {
  const [notes, setNotes] = useState(session.teacherNotes);
  const [aiTip, setAiTip] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Link atoms logic
  const linkedAtoms = useMemo(() => 
    MASTER_ATOMS.filter(atom => session.linkedAtomIds.includes(atom.atom_id)),
    [session.linkedAtomIds]
  );

  const getStatusClasses = (status) => {
    switch (status) {
      case SessionStatus.MASTERED: return 'bg-emerald-50 border-emerald-400 text-emerald-900';
      case SessionStatus.TAUGHT_REPEAT: return 'bg-amber-50 border-amber-400 text-amber-900';
      default: return 'bg-slate-100 border-slate-300 text-slate-500';
    }
  };

  const handleAiClick = async (e) => {
    e.stopPropagation();
    setLoadingAi(true);
    const tip = await getAISuggestions(session.learningIntention);
    setAiTip(tip);
    setLoadingAi(false);
  };

  return (
    <div 
      className={`border-l-4 p-5 rounded-r-xl shadow-sm transition-all duration-300 ${getStatusClasses(session.status)} ${isExpanded ? 'bg-white shadow-xl scale-[1.02] z-10' : 'hover:bg-opacity-80 cursor-pointer'}`}
      onClick={!isExpanded ? onToggle : undefined}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {session.linkedAtomIds.map(id => (
              <span key={id} className="text-[10px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                Atom: {id}
              </span>
            ))}
          </div>
          <h3 className="font-bold text-lg leading-none">{session.title}</h3>
          <p className={`text-sm opacity-80 mt-1 ${!isExpanded ? 'line-clamp-1' : ''}`}>{session.learningIntention}</p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">
            {session.status.replace('_', ' ')}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-1 hover:bg-black/5 rounded-full">
            <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-200 space-y-6 animate-in fade-in slide-in-from-top-2">
          
          {/* Linked Atom Details */}
          {linkedAtoms.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Atom Details</h4>
              <div className="grid gap-2">
                {linkedAtoms.map(atom => (
                  <div key={atom.atom_id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-blue-800">{atom.title}</span>
                      <span className="font-bold text-slate-400">Phase {atom.phase}</span>
                    </div>
                    <p className="text-slate-600 italic mb-2">"{atom.description}"</p>
                    <div className="flex gap-2 text-red-600">
                       <span className="font-black">Watch for:</span>
                       <p>{atom.misconceptions.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
              <select 
                value={session.status} 
                onChange={(e) => firebaseService.updateSession(session.id, { status: e.target.value })}
                className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={SessionStatus.NOT_TAUGHT}>Not Taught</option>
                <option value={SessionStatus.TAUGHT_REPEAT}>Taught / Repeat</option>
                <option value={SessionStatus.MASTERED}>Mastered</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleAiClick}
                disabled={loadingAi}
                className="w-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" /></svg>
                {loadingAi ? 'Asking AI...' : 'Teaching Tips'}
              </button>
            </div>
          </div>

          {aiTip && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed animate-in fade-in zoom-in-95">
              <h5 className="font-black uppercase tracking-widest mb-2 flex items-center gap-1">✨ Gemini Coach Strategy</h5>
              <p className="italic whitespace-pre-line">{aiTip}</p>
              <button onClick={() => setAiTip(null)} className="mt-3 text-[10px] font-bold text-blue-600 hover:underline uppercase">Dismiss</button>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teacher Notes</label>
            <textarea 
              value={notes} 
              onChange={(e) => {
                setNotes(e.target.value);
                firebaseService.updateSession(session.id, { teacherNotes: e.target.value });
              }}
              placeholder="Record observations, student names, or focus points..."
              className="w-full h-32 text-xs p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-inner"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const Timeline = ({ title, sessions }) => {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <h2 className="font-black uppercase tracking-tighter text-sm">{title}</h2>
        <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-full border border-white/20">
          {sessions.length} Lessons
        </span>
      </div>
      
      <div className="p-6 md:p-8 bg-slate-50/30 flex-1 relative overflow-y-auto">
        <div className="absolute left-[39px] md:left-[47px] top-0 bottom-0 w-1 bg-slate-200"></div>
        <div className="space-y-10 relative">
          {sessions.sort((a,b) => a.order - b.order).map(session => (
            <div key={session.id} className="pl-14 md:pl-16 relative">
              <div className={`absolute left-[-16px] md:left-[-12px] top-5 w-8 h-8 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-colors ${
                session.status === SessionStatus.MASTERED ? 'bg-emerald-500' : 
                session.status === SessionStatus.TAUGHT_REPEAT ? 'bg-amber-500' : 'bg-slate-300'
              }`}>
                {session.status === SessionStatus.MASTERED && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <SessionCard 
                session={session} 
                isExpanded={expandedId === session.id}
                onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
              />
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="text-center py-20 text-slate-400 italic font-medium">No sessions in this view.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [sessions, setSessions] = useState([]);
  const [relieverMode, setRelieverMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return firebaseService.getSessions((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const filteredSessions = useMemo(() => {
    if (!relieverMode) return sessions;
    return [Strand.PLACE_VALUE, Strand.TIMES_TABLES].flatMap(strand => {
      const strandLessons = sessions.filter(s => s.strand === strand).sort((a, b) => a.order - b.order);
      const next = strandLessons.find(s => s.status !== SessionStatus.MASTERED);
      return next ? [next] : [];
    });
  }, [sessions, relieverMode]);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-mono p-10">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="uppercase tracking-[0.3em] font-black text-xs animate-pulse">Syncing Mastery Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-500/20">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
               <h1 className="font-black text-xl tracking-tighter leading-none">MASTERY DASHBOARD</h1>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Atom Tracking Engine v2.5</p>
            </div>
          </div>
          <div className={`flex items-center gap-4 border p-2 rounded-2xl px-5 transition-all ${relieverMode ? 'bg-blue-600 border-blue-700 text-white shadow-lg' : 'bg-white border-slate-200'}`}>
             <span className={`text-[10px] font-black uppercase tracking-widest ${relieverMode ? 'text-white' : 'text-slate-400'}`}>Reliever Mode</span>
             <button onClick={() => setRelieverMode(!relieverMode)} className={`w-12 h-6 rounded-full transition-all relative ${relieverMode ? 'bg-white/20 ring-1 ring-white/50' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform shadow-sm ${relieverMode ? 'translate-x-6 bg-white' : 'bg-white'}`}></div>
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-1 p-6 md:p-8 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div>
              <h2 className="text-3xl font-black tracking-tight uppercase">
                 {relieverMode ? "Today's Focus Lessons" : "Curriculum Timelines"}
              </h2>
              <p className="text-slate-500 font-medium text-sm mt-1">
                 Tracking {MASTER_ATOMS.length} curriculum master atoms across key strands.
              </p>
           </div>
           <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest bg-white p-3 rounded-xl border border-slate-200">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>Not Taught</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>Repeat</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>Mastered</span>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Timeline title={Strand.PLACE_VALUE} sessions={filteredSessions.filter(s => s.strand === Strand.PLACE_VALUE)} />
          <Timeline title={Strand.TIMES_TABLES} sessions={filteredSessions.filter(s => s.strand === Strand.TIMES_TABLES)} />
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 tracking-widest uppercase">
          <p>© {new Date().getFullYear()} Mastery Timeline Engine • Built for Educators</p>
          <p>Powered by Google Gemini 3.0 Flash</p>
        </div>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
