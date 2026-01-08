
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

const e = React.createElement;

/** 
 * DATA & CONSTANTS 
 **/
const INITIAL_SESSIONS = [
  { "session_id": 1, "strand": "place_value", "title": "The 10 Symbols", "li": "To understand that all numbers are built from 0-9.", "atoms": ["PV-1.1", "PV-1.2"], "status": "grey", "notes": "" },
  { "session_id": 1, "strand": "times_tables", "title": "Equal Groups", "li": "To identify equal and unequal groups.", "atoms": ["TT-1.1"], "status": "grey", "notes": "" },
  { "session_id": 2, "strand": "place_value", "title": "Zero as Placeholder", "li": "To use zero to hold a place in a 2-digit number.", "atoms": ["PV-1.3"], "status": "grey", "notes": "" },
  { "session_id": 2, "strand": "times_tables", "title": "Repeated Addition", "li": "To represent addition as multiplication.", "atoms": ["TT-1.2"], "status": "grey", "notes": "" },
  { "session_id": 3, "strand": "place_value", "title": "Unitizing Tens", "li": "To bundle 10 ones into 1 ten.", "atoms": ["PV-1.4"], "status": "grey", "notes": "" },
  { "session_id": 3, "strand": "times_tables", "title": "The Array", "li": "To represent multiplication as a grid.", "atoms": ["TT-1.4"], "status": "grey", "notes": "" },
  { "session_id": 8, "strand": "place_value", "title": "Crossing 100", "li": "To count forward and back across the 100 barrier.", "atoms": ["PV-2.3"], "status": "grey", "notes": "" },
  { "session_id": 8, "strand": "times_tables", "title": "Commutativity", "li": "To understand that factor order doesn't change the product.", "atoms": ["TT-2.1"], "status": "grey", "notes": "" },
  { "session_id": 11, "strand": "place_value", "title": "Internal Zero", "li": "To write 3-digit numbers with zero placeholders.", "atoms": ["PV-2.5"], "status": "grey", "notes": "" },
  { "session_id": 11, "strand": "times_tables", "title": "Multiples of 3", "li": "To identify patterns in the 3x table.", "atoms": ["TT-2.4"], "status": "grey", "notes": "" }
];

const STORAGE_KEY = 'maths_mastery_v6_js';

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
  updateSession: (sessionId, strand, updates) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const data = JSON.parse(stored);
    const updated = data.map(s => (s.session_id === sessionId && s.strand === strand) ? { ...s, ...updates } : s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};

/** 
 * COMPONENTS 
 **/

const SessionCard = ({ session, isExpanded, onToggle }) => {
  const [notes, setNotes] = useState(session.notes);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState(null);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'green': return 'bg-emerald-50 border-emerald-400 text-emerald-900';
      case 'amber': return 'bg-amber-50 border-amber-400 text-amber-900';
      default: return 'bg-slate-50 border-slate-300 text-slate-500';
    }
  };

  const updateStatus = (newStatus, e) => {
    if (e) e.stopPropagation();
    firebaseService.updateSession(session.session_id, session.strand, { status: newStatus });
  };

  const fetchAiTip = async (e) => {
    e.stopPropagation();
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Teacher Assistant: Give 2 retrieval questions for: "${session.li}". Max 40 words.`,
      });
      setAiTip(res.text || "No tips available.");
    } catch (err) {
      setAiTip("AI service unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  return e('div', {
    className: `border-l-4 p-5 rounded-r-xl shadow-sm transition-all duration-300 ${getStatusClasses(session.status)} ${isExpanded ? 'bg-white shadow-xl scale-[1.01] z-10' : 'hover:bg-opacity-80 cursor-pointer'}`,
    onClick: onToggle
  }, [
    e('div', { key: 'header', className: 'flex justify-between items-start' }, [
      e('div', { key: 'content', className: 'flex-1' }, [
        e('div', { key: 'atoms', className: 'flex flex-wrap gap-1.5 mb-2' }, 
          session.atoms.map(atom => e('span', { key: atom, className: 'text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase' }, atom))
        ),
        e('h3', { key: 'title', className: 'font-black text-base uppercase tracking-tight' }, session.title),
        e('p', { key: 'li', className: `text-xs opacity-70 mt-1 ${!isExpanded ? 'line-clamp-1' : ''}` }, session.li)
      ]),
      e('div', { key: 'actions', className: 'flex flex-col gap-2 items-end shrink-0 ml-4' }, [
        e('div', { key: 'buttons', className: 'flex gap-1' }, [
          e('button', { 
            key: 'taught', 
            onClick: (e) => updateStatus('amber', e),
            className: 'text-[8px] font-black px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded border border-amber-400/30 uppercase text-amber-900'
          }, 'Taught'),
          e('button', { 
            key: 'master', 
            onClick: (e) => updateStatus('green', e),
            className: 'text-[8px] font-black px-2 py-1 bg-emerald-200 hover:bg-emerald-300 rounded border border-emerald-400/30 uppercase text-emerald-900'
          }, 'Master')
        ]),
        e('span', { key: 'id', className: 'text-[10px] font-bold opacity-30' }, `ID: ${session.session_id}`)
      ])
    ]),
    
    isExpanded && e('div', { key: 'editor', className: 'mt-6 pt-6 border-t border-slate-200 space-y-5', onClick: e => e.stopPropagation() }, [
      e('div', { key: 'controls', className: 'grid grid-cols-2 gap-4' }, [
        e('button', { 
          key: 'reset',
          onClick: () => updateStatus('grey'),
          className: 'text-[10px] font-black bg-slate-200 p-2.5 rounded uppercase tracking-widest text-slate-600 hover:bg-slate-300 transition-colors'
        }, 'Reset Status'),
        e('button', { 
          key: 'ai',
          onClick: fetchAiTip,
          disabled: aiLoading,
          className: 'text-[10px] font-black bg-blue-600 p-2.5 rounded uppercase tracking-widest text-white hover:bg-blue-700 transition-colors disabled:opacity-50'
        }, aiLoading ? 'Asking...' : 'AI Prompts')
      ]),
      
      aiTip && e('div', { key: 'ai-tip', className: 'p-4 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-900 leading-relaxed' }, [
        e('h5', { className: 'font-black uppercase tracking-widest mb-1 flex items-center gap-1' }, '✨ Coach Suggestion'),
        e('p', { className: 'italic' }, aiTip)
      ]),

      e('div', { key: 'notes-area', className: 'space-y-1.5' }, [
        e('label', { className: 'text-[10px] font-black uppercase tracking-widest text-slate-400' }, 'Teacher Reflection'),
        e('textarea', {
          value: notes,
          onChange: (ev) => {
            setNotes(ev.target.value);
            firebaseService.updateSession(session.session_id, session.strand, { notes: ev.target.value });
          },
          placeholder: 'Record student focus groups or lesson adjustments...',
          className: 'w-full h-32 text-[11px] p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-inner'
        })
      ])
    ])
  ]);
};

const Timeline = ({ title, sessions }) => {
  const [expandedId, setExpandedId] = useState(null);

  return e('div', { className: 'bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full' }, [
    e('div', { key: 'header', className: 'bg-slate-900 text-white px-6 py-4 flex justify-between items-center' }, [
      e('h2', { className: 'font-black uppercase tracking-tighter text-sm' }, title),
      e('span', { className: 'text-[10px] font-black bg-white/10 px-3 py-1 rounded-full border border-white/20' }, `${sessions.length} Lessons`)
    ]),
    e('div', { key: 'body', className: 'p-6 md:p-8 bg-slate-50/30 flex-1 relative overflow-y-auto' }, [
      e('div', { key: 'line', className: 'absolute left-[39px] md:left-[47px] top-0 bottom-0 w-1 bg-slate-200' }),
      e('div', { key: 'items', className: 'space-y-10 relative' }, 
        sessions.sort((a,b) => a.session_id - b.session_id).map(session => {
          const key = `${session.strand}-${session.session_id}`;
          return e('div', { key, className: 'pl-14 md:pl-16 relative' }, [
            e('div', { 
              key: 'indicator',
              className: `absolute left-[-16px] md:left-[-12px] top-5 w-8 h-8 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-colors ${
                session.status === 'green' ? 'bg-emerald-500' : 
                session.status === 'amber' ? 'bg-amber-500' : 'bg-slate-300'
              }`
            }, session.status === 'green' ? e('svg', { className: 'w-4 h-4 text-white', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 3, d: 'M5 13l4 4L19 7' })) : null),
            e(SessionCard, {
              session,
              isExpanded: expandedId === key,
              onToggle: () => setExpandedId(expandedId === key ? null : key)
            })
          ]);
        })
      )
    ])
  ]);
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
    const result = [];
    ['place_value', 'times_tables'].forEach(strand => {
      const strandLessons = sessions.filter(s => s.strand === strand).sort((a, b) => a.session_id - b.session_id);
      const next = strandLessons.find(s => s.status !== 'green');
      if (next) result.push(next);
    });
    return result;
  }, [sessions, relieverMode]);

  if (loading) return e('div', { className: 'min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white font-mono p-10' }, [
    e('div', { className: 'w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6' }),
    e('p', { className: 'uppercase tracking-[0.3em] font-black text-xs' }, 'Syncing Lessons...')
  ]);

  return e('div', { className: 'min-h-screen bg-[#f8fafc] flex flex-col font-sans antialiased text-slate-900' }, [
    e('header', { className: 'bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50' }, [
      e('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between' }, [
        e('div', { className: 'flex items-center gap-4' }, [
          e('div', { className: 'bg-slate-900 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-500/20' }, 
            e('svg', { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2.5, d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012-2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }))
          ),
          e('div', null, [
            e('h1', { className: 'font-black text-xl tracking-tighter leading-none' }, 'MASTERY TRACKER'),
            e('p', { className: 'text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1' }, 'Classroom Engine v3.0')
          ])
        ]),
        e('div', { 
          className: `flex items-center gap-4 border p-2 rounded-2xl px-5 transition-all ${relieverMode ? 'bg-blue-600 border-blue-700 text-white shadow-lg' : 'bg-white border-slate-200'}`
        }, [
          e('span', { className: `text-[10px] font-black uppercase tracking-widest ${relieverMode ? 'text-white' : 'text-slate-400'}` }, 'Reliever Mode'),
          e('button', { 
            onClick: () => setRelieverMode(!relieverMode),
            className: `w-12 h-6 rounded-full transition-all relative ${relieverMode ? 'bg-white/20 ring-1 ring-white/50' : 'bg-slate-300'}`
          }, e('div', { className: `absolute top-1 left-1 w-4 h-4 rounded-full transition-transform shadow-sm ${relieverMode ? 'translate-x-6 bg-white' : 'bg-white'}` }))
        ])
      ])
    ]),

    e('main', { className: 'max-w-7xl mx-auto w-full flex-1 p-6 md:p-8 space-y-8' }, [
      e('div', { className: 'flex flex-col md:flex-row justify-between items-end gap-6' }, [
        e('h2', { className: 'text-3xl font-black tracking-tight uppercase leading-none' }, relieverMode ? "Today's Focus Points" : "Sequence Overview"),
        e('div', { className: 'flex gap-4 text-[9px] font-black uppercase tracking-widest bg-white p-3 rounded-xl border border-slate-200' }, [
          e('span', { className: 'flex items-center gap-1.5' }, [e('div', { className: 'w-2.5 h-2.5 rounded-full bg-slate-300' }), 'Not Taught']),
          e('span', { className: 'flex items-center gap-1.5' }, [e('div', { className: 'w-2.5 h-2.5 rounded-full bg-amber-400' }), 'Taught / Repeat']),
          e('span', { className: 'flex items-center gap-1.5' }, [e('div', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-500' }), 'Mastered'])
        ])
      ]),

      e('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-8' }, [
        e(Timeline, { strandName: 'Place Value', sessions: filteredSessions.filter(s => s.strand === 'place_value') }),
        e(Timeline, { strandName: 'Times Tables', sessions: filteredSessions.filter(s => s.strand === 'times_tables') })
      ])
    ]),

    e('footer', { className: 'bg-white border-t border-slate-200 p-10 mt-10' }, [
      e('div', { className: 'max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 tracking-widest uppercase' }, [
        e('p', null, `© ${new Date().getFullYear()} Mastery Engine • Side-by-Side Planning`),
        e('p', null, 'Intelligent Assistance via Google Gemini')
      ])
    ])
  ]);
};

ReactDOM.createRoot(document.getElementById('root')).render(e(App));
