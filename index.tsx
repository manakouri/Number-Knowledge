import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc, 
  getDocs
} from "firebase/firestore";
import { master_atoms, master_sessions } from './atomsData.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5L2VJahLNK76xWxC7MjsGbbcf70HjARs",
  authDomain: "number-knowledge-71dba.firebaseapp.com",
  projectId: "number-knowledge-71dba",
  storageBucket: "number-knowledge-71dba.firebasestorage.app",
  messagingSenderId: "931772776390",
  appId: "1:931772776390:web:e6fddd88629bcf1d803cc7"
};

// Initialize Firebase services safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// --- Components ---

/**
 * Seeder Component for populating Firestore
 */
const DatabaseSeeder = () => {
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const seedDatabase = async () => {
    setSeeding(true);
    setMessage('Seeding started...');
    console.log("🚀 Starting Database Seed...");

    try {
      // Seed Atoms
      for (const atom of master_atoms) {
        const atomRef = doc(db, "atoms", atom.atom_id);
        await setDoc(atomRef, atom);
        console.log(`✅ Seeded Atom: ${atom.atom_id}`);
      }

      // Seed Sessions
      for (const session of master_sessions) {
        const sessionId = `${session.strand}-${session.session_id}`;
        const sessionRef = doc(db, "sessions", sessionId);
        await setDoc(sessionRef, session);
        console.log(`✅ Seeded Session: ${sessionId}`);
      }

      setMessage('Database successfully seeded!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      setMessage('Error seeding database. Check console.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-6 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Database Tools</span>
        <p className="text-[11px] text-slate-500">Push master curriculum data to your Firestore instance.</p>
      </div>
      <div className="flex items-center gap-4">
        {message && <span className="text-[11px] font-bold text-blue-600 animate-pulse">{message}</span>}
        <button 
          onClick={seedDatabase}
          disabled={seeding}
          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
            seeding ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
          }`}
        >
          {seeding ? 'Syncing...' : '🚀 Push Data to Firebase'}
        </button>
      </div>
    </div>
  );
};

const SessionCard = ({ session, isExpanded, onToggle }) => {
  const [localNotes, setLocalNotes] = useState(session.notes || '');
  const [aiTip, setAiTip] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    setLocalNotes(session.notes || '');
  }, [session.notes]);

  const linkedAtoms = master_atoms.filter(a => session.atoms.includes(a.atom_id));

  const getStatusStyles = (status) => {
    switch (status) {
      case 'green': return 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-emerald-100';
      case 'amber': return 'bg-amber-50 border-amber-400 text-amber-900 shadow-amber-100';
      default: return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  const updateSession = async (updates) => {
    try {
      const sessionId = `${session.strand}-${session.session_id}`;
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, updates);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  };

  const handleStatus = (newStatus, event) => {
    if (event) event.stopPropagation();
    updateSession({ status: newStatus });
  };

  const askAi = async (e) => {
    e.stopPropagation();
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = linkedAtoms.map(a => `${a.title}: ${a.description}`).join('; ');
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Expert Maths Coach: Focus on session "${session.title}" (${session.li}). Atoms: ${context}. Suggest one specific task or question to check for the misconceptions: ${linkedAtoms.flatMap(a => a.misconceptions).join(', ')}. Keep it under 30 words.`,
      });
      setAiTip(response.text || "No coaching tips found.");
    } catch (err) {
      console.error("Gemini Error:", err);
      setAiTip("Teacher Coach unavailable at the moment.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div 
      className={`border p-6 rounded-2xl transition-all duration-500 shadow-sm ${getStatusStyles(session.status)} ${isExpanded ? 'ring-2 ring-blue-500 bg-white shadow-2xl scale-[1.02] z-10' : 'hover:border-slate-300 cursor-pointer'}`}
      onClick={onToggle}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {session.atoms.map((id) => (
              <span key={id} className="text-[9px] font-black bg-slate-800 text-white px-2 py-0.5 rounded-md tracking-tighter uppercase">{id}</span>
            ))}
          </div>
          <h3 className="font-black text-base uppercase tracking-tight text-slate-900">{session.title}</h3>
          <p className={`text-[11px] font-medium leading-relaxed mt-1.5 opacity-80 ${!isExpanded ? 'line-clamp-1' : ''}`}>{session.li}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex gap-1.5">
            <button 
              onClick={(e) => handleStatus('amber', e)}
              className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase transition-all active:scale-95 ${session.status === 'amber' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
            >
              Taught
            </button>
            <button 
              onClick={(e) => handleStatus('green', e)}
              className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg uppercase transition-all active:scale-95 ${session.status === 'green' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
            >
              Mastered
            </button>
          </div>
          <span className="text-[10px] font-black opacity-20 text-right tracking-widest">SESSION {session.session_id}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-8 pt-8 border-t border-slate-100 space-y-8" onClick={ev => ev.stopPropagation()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linkedAtoms.map(atom => (
              <div key={atom.atom_id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                <div className="absolute -top-3 left-4 px-2 bg-slate-900 text-white text-[8px] font-black rounded uppercase">Knowledge Atom</div>
                <p className="text-[11px] font-black text-slate-800 mb-2">{atom.title}</p>
                <p className="text-[10px] text-slate-500 leading-snug italic">Common errors: {atom.misconceptions.join(', ')}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button 
              onClick={askAi}
              disabled={aiLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Consulting Coach...
                </>
              ) : 'Get Teaching Insight'}
            </button>
            {aiTip && (
              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] text-blue-900 italic leading-relaxed shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="block font-black text-[9px] uppercase tracking-widest text-blue-400 mb-2 not-italic">Coach Strategy</span>
                {aiTip}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Session Reflections</label>
              <button 
                onClick={(e) => handleStatus('grey', e)}
                className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Reset Progress
              </button>
            </div>
            <textarea
              value={localNotes}
              onChange={(ev) => {
                setLocalNotes(ev.target.value);
                updateSession({ notes: ev.target.value });
              }}
              placeholder="How did the class respond? Which students need more support?"
              className="w-full h-32 text-[11px] p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const Timeline = ({ title, sessions }) => {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-10">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">{title}</h2>
        <div className="h-2 w-20 bg-blue-600 rounded-full"></div>
      </div>
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col flex-1 overflow-hidden">
        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mastery Flow</span>
          <span className="text-[10px] font-black bg-white border border-slate-200 px-4 py-1.5 rounded-full text-slate-600 shadow-sm">{sessions.length} Units</span>
        </div>
        
        <div className="p-8 md:p-12 flex-1 relative overflow-y-auto max-h-[70vh]">
          <div className="absolute left-[45px] md:left-[57px] top-0 bottom-0 w-[2px] bg-slate-100"></div>
          <div className="space-y-14 relative">
            {sessions.sort((a, b) => a.session_id - b.session_id).map((s) => {
              const id = `${s.strand}-${s.session_id}`;
              return (
                <div key={id} className="pl-16 md:pl-20 relative">
                  <div 
                    className={`absolute left-[-11px] md:left-[-7px] top-6 w-7 h-7 rounded-full border-4 border-white shadow-lg z-10 transition-all duration-500 ${
                      s.status === 'green' ? 'bg-emerald-500' : s.status === 'amber' ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                  ></div>
                  <SessionCard
                    session={s}
                    isExpanded={activeId === id}
                    onToggle={() => setActiveId(activeId === id ? null : id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [sessions, setSessions] = useState([]);
  const [relieverMode, setRelieverMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sessions"), (snapshot) => {
      setSessions(snapshot.docs.map(d => d.data()));
      setIsLoaded(true);
    }, (error) => {
      console.error("Firestore Error:", error);
    });
    return () => unsub();
  }, []);

  const viewableSessions = useMemo(() => {
    if (!relieverMode) return sessions;
    return ['Place Value', 'Times Tables'].flatMap(st => {
      const strandArr = sessions.filter(s => s.strand === st).sort((a, b) => a.session_id - b.session_id);
      const next = strandArr.find(s => s.status !== 'green');
      return next ? [next] : [];
    });
  }, [sessions, relieverMode]);

  if (!isLoaded) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-white font-black uppercase tracking-[0.5em] text-[10px]">Accessing Engine</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow-xl shadow-slate-900/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter uppercase text-slate-900">Mastery Engine</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-0.5">Terminal V7.0</p>
            </div>
          </div>

          <div className="flex items-center gap-5 bg-slate-100/50 p-2.5 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase text-slate-500 ml-3 tracking-widest">Reliever Mode</span>
            <button 
              onClick={() => setRelieverMode(!relieverMode)}
              className={`w-16 h-9 rounded-full transition-all duration-300 relative outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 ${relieverMode ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-slate-300'}`}
            >
              <div 
                className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow-md transition-transform duration-300 ${relieverMode ? 'translate-x-7' : 'translate-x-0'}`} 
              />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full flex-1 p-8 md:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
          <Timeline title="Place Value" sessions={viewableSessions.filter(s => s.strand === 'Place Value')} />
          <Timeline title="Times Tables" sessions={viewableSessions.filter(s => s.strand === 'Times Tables')} />
        </div>
      </main>

      <DatabaseSeeder />

      <footer className="p-16 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] text-center border-t border-slate-100 bg-white mt-auto">
        Real-time Curriculum Framework • Powered by Google Cloud
      </footer>
    </div>
  );
};

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}