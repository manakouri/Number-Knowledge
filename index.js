
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

const STORAGE_KEY = 'maths_mastery_v9';

const storageManager = {
  get: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    return JSON.parse(stored);
  },
  save: (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('storage-update'));
  }
};

/** 
 * COMPONENTS 
 **/

const SessionCard = ({ session, isExpanded, onToggle, onUpdate }) => {
  const [notes, setNotes] = useState(session.notes);
  const [aiTip, setAiTip] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm';
      case 'amber': return 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm';
      default: return 'bg-slate-50 border-slate-200 text-slate-500 shadow-sm';
    }
  };

  const handleStatus = (status, event) => {
    if (event) event.stopPropagation();
    onUpdate(session.session_id, session.strand, { status });
  };

  const askAi = async (e) => {
    e.stopPropagation();
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Expert Teacher: For LI "${session.li}", generate one high-quality retrieval question and one common misconception. Format clearly. Max 40 words.`,
      });
      setAiTip(res.text);
    } catch (err) {
      setAiTip("Retriever Coach is currently unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  return e('div', {
    className: `border p-5 rounded-xl transition-all duration-300 ${getStatusColor(session.status)} ${isExpanded ? 'ring-2 ring-blue-500 bg-white shadow-xl scale-[1.02] z-10' : 'hover:border-slate-300 cursor-pointer'}`,
    onClick: onToggle
  }, [
    e('div', { key: 'top', className: 'flex justify-between items-start' }, [
      e('div', { key: 'info', className: 'flex-1' }, [
        e('div', { key: 'atoms', className: 'flex flex-wrap gap-1 mb-2' }, 
          session.atoms.map(a => e('span', { key: a, className: 'text-[9px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded tracking-tighter' }, a))
        ),
        e('h3', { key: 'title', className: 'font-black text-sm uppercase tracking-tight' }, session.title),
        e('p', { key: 'li', className: `text-[11px] opacity-70 mt-1 ${!isExpanded ? 'line-clamp-1' : ''}` }, session.li)
      ]),
      e('div', { key: 'btns', className: 'flex flex-col gap-1.5 shrink-0 ml-4' }, [
        e('div', { key: 'row1', className: 'flex gap-1' }, [
          e('button', { 
            key: 'amber', 
            onClick: (e) => handleStatus('amber', e),
            className: 'text-[9px] font-black px-2 py-1 bg-amber-400 text-amber-950 rounded uppercase transition-transform active:scale-95'
          }, 'Taught'),
          e('button', { 
            key: 'green', 
            onClick: (e) => handleStatus('green', e),
            className: 'text-[9px] font-black px-2 py-1 bg-emerald-500 text-white rounded uppercase transition-transform active:scale-95'
          }, 'Mastered')
        ]),
        e('span', { key: 'sid', className: 'text-[9px] font-bold opacity-30 text-right' }, `#${session.session_id}`)
      ])
    ]),

    isExpanded && e('div', { key: 'body', className: 'mt-6 pt-6 border-t border-slate-200 space-y-5', onClick: ev => ev.stopPropagation() }, [
      e('div', { key: 'actions', className: 'grid grid-cols-2 gap-3' }, [
        e('button', { 
          key: 'undo',
          onClick: (e) => handleStatus('grey', e),
          className: 'text-[10px] font-black bg-slate-200 hover:bg-slate-300 p-2.5 rounded uppercase tracking-widest text-slate-700 flex items-center justify-center gap-2'
        }, [
          e('svg', { key: 'icon', className: 'w-3 h-3', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M10 19l-7-7m0 0l7-7m-7 7h18' })),
          'Reset Status'
        ]),
        e('button', { 
          key: 'ai-btn',
          onClick: askAi,
          disabled: aiLoading,
          className: 'text-[10px] font-black bg-blue-600 hover:bg-blue-700 p-2.5 rounded uppercase tracking-widest text-white disabled:opacity-50 flex items-center justify-center gap-2'
        }, [
          e('svg', { key: 'icon', className: 'w-3 h-3', fill: 'currentColor', viewBox: '0 0 20 20' }, e('path', { d: 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 015.25-2.906z' })),
          aiLoading ? 'Thinking...' : 'Retrieval Coach'
        ])
      ]),

      aiTip && e('div', { key: 'tip', className: 'p-4 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-950 leading-relaxed' }, [
        e('span', { className: 'block font-black uppercase text-[9px] tracking-widest text-blue-400 mb-2' }, 'Suggested Retrieval Focus'),
        e('p', { className: 'italic font-medium' }, aiTip)
      ]),

      e('div', { key: 'note-box', className: 'space-y-1' }, [
        e('label', { className: 'text-[10px] font-black uppercase tracking-widest text-slate-400' }, 'Teacher Reflection'),
        e('textarea', {
          value: notes,
          onChange: (ev) => {
            setNotes(ev.target.value);
            onUpdate(session.session_id, session.strand, { notes: ev.target.value });
          },
          placeholder: 'Record student progress or focus groups...',
          className: 'w-full h-32 text-[11px] p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none'
        })
      ])
    ])
  ]);
};

const Timeline = ({ title, sessions, onUpdate }) => {
  const [activeId, setActiveId] = useState(null);

  return e('div', { className: 'flex flex-col h-full' }, [
    // STRAND HEADING
    e('div', { key: 'heading', className: 'mb-6' }, [
      e('h2', { className: 'text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-1' }, title),
      e('div', { className: 'h-1.5 w-12 bg-blue-600 rounded-full' })
    ]),
    
    e('div', { key: 'container', className: 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1' }, [
      e('div', { key: 'stats', className: 'bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center' }, [
        e('span', { className: 'text-[10px] font-black uppercase tracking-widest text-slate-400' }, 'Sequence Progression'),
        e('span', { className: 'text-[10px] font-black bg-slate-200 px-2.5 py-1 rounded-full text-slate-600' }, `${sessions.length} Sessions`)
      ]),
      
      e('div', { key: 'b', className: 'p-6 md:p-10 flex-1 relative overflow-y-auto' }, [
        e('div', { key: 'line', className: 'absolute left-[39px] md:left-[51px] top-0 bottom-0 w-1 bg-slate-100 border-l border-dashed border-slate-300' }),
        e('div', { key: 'stack', className: 'space-y-12 relative' }, 
          sessions.sort((a,b) => a.session_id - b.session_id).map(s => {
            const key = `${s.strand}-${s.session_id}`;
            return e('div', { key, className: 'pl-14 md:pl-16 relative' }, [
              e('div', { 
                key: 'dot',
                className: `absolute left-[-16px] md:left-[-12px] top-5 w-8 h-8 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-colors duration-500 ${
                  s.status === 'green' ? 'bg-emerald-500' : s.status === 'amber' ? 'bg-amber-500' : 'bg-slate-300'
                }`
              }, s.status === 'green' ? e('svg', { className: 'w-4 h-4 text-white', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 3, d: 'M5 13l4 4L19 7' })) : null),
              e(SessionCard, {
                session: s,
                isExpanded: activeId === key,
                onToggle: () => setActiveId(activeId === key ? null : key),
                onUpdate
              })
            ]);
          })
        )
      ])
    ])
  ]);
};

const App = () => {
  const [sessions, setSessions] = useState([]);
  const [reliever, setReliever] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessions(storageManager.get());
    setReady(true);
    const refresh = () => setSessions(storageManager.get());
    window.addEventListener('storage-update', refresh);
    return () => window.removeEventListener('storage-update', refresh);
  }, []);

  const handleUpdate = (sid, strand, updates) => {
    const data = storageManager.get();
    const next = data.map(s => (s.session_id === sid && s.strand === strand) ? { ...s, ...updates } : s);
    storageManager.save(next);
  };

  const filtered = useMemo(() => {
    if (!reliever) return sessions;
    return ['place_value', 'times_tables'].flatMap(st => {
      const strandLessons = sessions.filter(s => s.strand === st).sort((a, b) => a.session_id - b.session_id);
      const next = strandLessons.find(s => s.status !== 'green');
      return next ? [next] : [];
    });
  }, [sessions, reliever]);

  if (!ready) return e('div', { className: 'flex items-center justify-center min-h-screen bg-slate-50' }, 
    e('div', { className: 'animate-pulse font-black text-slate-300 tracking-[0.5em]' }, 'LOADING ENGINE')
  );

  return e('div', { className: 'min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900' }, [
    e('header', { className: 'bg-white border-b border-slate-200 sticky top-0 z-50 py-4 shadow-sm' }, [
      e('div', { className: 'max-w-7xl mx-auto px-6 flex justify-between items-center' }, [
        e('div', { className: 'flex items-center gap-4' }, [
          e('div', { className: 'bg-blue-600 text-white p-2 rounded-xl' }, 
            e('svg', { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2.5, d: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }))
          ),
          e('div', null, [
            e('h1', { className: 'font-black text-xl tracking-tighter uppercase' }, 'Mastery Engine'),
            e('p', { className: 'text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]' }, 'Planning & Retrieval Terminal')
          ])
        ]),
        e('div', { className: 'flex items-center gap-6' }, [
          e('div', { className: 'hidden md:flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400' }, [
             e('span', { className: 'flex items-center gap-1.5' }, [e('div', { className: 'w-2 h-2 rounded-full bg-slate-300' }), 'Untaught']),
             e('span', { className: 'flex items-center gap-1.5' }, [e('div', { className: 'w-2 h-2 rounded-full bg-amber-400' }), 'Taught']),
             e('span', { className: 'flex items-center gap-1.5' }, [e('div', { className: 'w-2 h-2 rounded-full bg-emerald-500' }), 'Mastered'])
          ]),
          e('button', { 
            onClick: () => setReliever(!reliever),
            className: `text-[10px] font-black px-5 py-2.5 rounded-full border transition-all shadow-sm flex items-center gap-2 ${reliever ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`
          }, [
            e('div', { className: `w-2 h-2 rounded-full ${reliever ? 'bg-white' : 'bg-slate-300'}` }),
            reliever ? 'Reliever: Next Sessions Only' : 'Full Dashboard View'
          ])
        ])
      ])
    ]),

    e('main', { className: 'max-w-7xl mx-auto w-full flex-1 p-6 md:p-10' }, [
      e('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-12' }, [
        e(Timeline, { title: 'Place Value', sessions: filtered.filter(s => s.strand === 'place_value'), onUpdate: handleUpdate }),
        e(Timeline, { title: 'Times Tables', sessions: filtered.filter(s => s.strand === 'times_tables'), onUpdate: handleUpdate })
      ])
    ]),

    e('footer', { className: 'p-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center border-t border-slate-200 bg-white mt-auto' }, 'Mastery Engine • Designed for Dynamic Classrooms')
  ]);
};

ReactDOM.createRoot(document.getElementById('root')).render(e(App));
