
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { MASTER_ATOMS, MASTER_SESSIONS } from './atomsData.js';

const e = React.createElement;

const STORAGE_KEY = 'maths_mastery_v11_curriculum';

const storageManager = {
  get: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MASTER_SESSIONS));
      return MASTER_SESSIONS;
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
  const [notes, setNotes] = useState(session.teacher_notes);
  const [aiTip, setAiTip] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Find linked atoms for misconceptions and AI context
  const linkedAtoms = MASTER_ATOMS.filter(a => session.core_atoms.includes(a.atom_id));

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Mastered': return 'bg-emerald-50 border-emerald-400 text-emerald-900';
      case 'Taught': return 'bg-amber-50 border-amber-400 text-amber-900';
      default: return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  const handleStatus = (status, event) => {
    if (event) event.stopPropagation();
    onUpdate(session.session_number, session.strand, { status });
  };

  const askAi = async (e) => {
    e.stopPropagation();
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const atomContext = linkedAtoms.map(a => `${a.title}: ${a.description}`).join('; ');
      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Expert Maths Teacher: The Session Learning Intention is "${session.learning_intention}". 
        It covers these atoms: ${atomContext}.
        Generate 1 high-impact retrieval question for this specific lesson. Max 25 words.`,
      });
      setAiTip(res.text);
    } catch (err) {
      setAiTip("Retriever Coach is currently offline.");
    } finally {
      setAiLoading(false);
    }
  };

  return e('div', {
    className: `border p-5 rounded-xl transition-all duration-300 ${getStatusStyles(session.status)} ${isExpanded ? 'ring-2 ring-blue-500 bg-white shadow-xl scale-[1.01] z-10' : 'hover:border-slate-300 cursor-pointer'}`,
    onClick: onToggle
  }, [
    e('div', { key: 'top', className: 'flex justify-between items-start' }, [
      e('div', { key: 'info', className: 'flex-1' }, [
        e('div', { key: 'atoms', className: 'flex flex-wrap gap-1 mb-2' }, 
          session.core_atoms.map(id => e('span', { key: id, className: 'text-[9px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded tracking-tighter' }, id))
        ),
        e('h3', { key: 'title', className: 'font-black text-sm uppercase tracking-tight' }, `Session ${session.session_number}`),
        e('p', { key: 'li', className: `text-[11px] font-medium leading-relaxed mt-1 ${!isExpanded ? 'line-clamp-1' : ''}` }, session.learning_intention)
      ]),
      e('div', { key: 'btns', className: 'flex flex-col gap-1.5 shrink-0 ml-4' }, [
        e('div', { key: 'row1', className: 'flex gap-1' }, [
          e('button', { 
            key: 'amber', 
            onClick: (e) => handleStatus('Taught', e),
            className: 'text-[9px] font-black px-2 py-1 bg-amber-400 text-amber-950 rounded uppercase active:scale-95'
          }, 'Taught'),
          e('button', { 
            key: 'green', 
            onClick: (e) => handleStatus('Mastered', e),
            className: 'text-[9px] font-black px-2 py-1 bg-emerald-500 text-white rounded uppercase active:scale-95'
          }, 'Master')
        ]),
        e('span', { key: 'sid', className: 'text-[9px] font-bold opacity-30 text-right' }, `#S${session.session_number}`)
      ])
    ]),

    isExpanded && e('div', { key: 'body', className: 'mt-6 pt-6 border-t border-slate-200 space-y-6', onClick: ev => ev.stopPropagation() }, [
      // ATOM DATA (Misconceptions)
      e('div', { key: 'pedagogy', className: 'space-y-3' }, [
        e('h4', { className: 'text-[10px] font-black uppercase tracking-[0.2em] text-slate-400' }, 'Pedagogical Focus'),
        e('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, 
          linkedAtoms.map(atom => e('div', { key: atom.atom_id, className: 'bg-slate-50 p-3 rounded-lg border border-slate-100' }, [
            e('p', { className: 'text-[10px] font-black text-slate-800 mb-1' }, atom.title),
            e('p', { className: 'text-[10px] text-slate-500 italic leading-tight' }, `Watch out: ${atom.misconceptions.join(', ')}`)
          ]))
        )
      ]),

      // RESOURCES
      session.resources && session.resources.length > 0 && e('div', { key: 'resources', className: 'space-y-2' }, [
        e('h4', { className: 'text-[10px] font-black uppercase tracking-[0.2em] text-slate-400' }, 'Lesson Resources'),
        e('div', { className: 'flex flex-wrap gap-2' }, 
          session.resources.map((res, i) => e('a', { 
            key: i, 
            href: res.url, 
            target: '_blank',
            className: 'text-[9px] font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100'
          }, res.name))
        )
      ]),

      e('div', { key: 'actions', className: 'grid grid-cols-2 gap-3' }, [
        e('button', { 
          key: 'undo',
          onClick: (e) => handleStatus('Not Taught', e),
          className: 'text-[10px] font-black bg-slate-100 hover:bg-slate-200 p-2.5 rounded uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2'
        }, 'Reset Status'),
        e('button', { 
          key: 'ai-btn',
          onClick: askAi,
          disabled: aiLoading,
          className: 'text-[10px] font-black bg-blue-600 hover:bg-blue-700 p-2.5 rounded uppercase tracking-widest text-white disabled:opacity-50 flex items-center justify-center gap-2'
        }, aiLoading ? 'Planning...' : 'Retrieval Coach')
      ]),

      aiTip && e('div', { key: 'tip', className: 'p-4 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-950 leading-relaxed italic' }, [
        e('span', { className: 'block font-black uppercase text-[9px] tracking-widest text-blue-400 mb-1 not-italic' }, 'Retrieval Tip'),
        aiTip
      ]),

      e('div', { key: 'note-box', className: 'space-y-1' }, [
        e('label', { className: 'text-[10px] font-black uppercase tracking-widest text-slate-400' }, 'Teacher Reflection'),
        e('textarea', {
          value: notes,
          onChange: (ev) => {
            setNotes(ev.target.value);
            onUpdate(session.session_number, session.strand, { teacher_notes: ev.target.value });
          },
          placeholder: 'Note student breakthroughs or gaps...',
          className: 'w-full h-24 text-[11px] p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none resize-none'
        })
      ])
    ])
  ]);
};

const Timeline = ({ title, sessions, onUpdate }) => {
  const [activeId, setActiveId] = useState(null);

  return e('div', { className: 'flex flex-col h-full' }, [
    e('div', { key: 'heading', className: 'mb-8' }, [
      e('h2', { className: 'text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-1' }, title),
      e('div', { className: 'h-1.5 w-16 bg-blue-600 rounded-full' })
    ]),
    
    e('div', { key: 'container', className: 'bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1' }, [
      e('div', { key: 'stats', className: 'bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center' }, [
        e('span', { className: 'text-[10px] font-black uppercase tracking-widest text-slate-400' }, 'Curriculum Progression'),
        e('span', { className: 'text-[10px] font-black bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600' }, `${sessions.length} Lessons`)
      ]),
      
      e('div', { key: 'b', className: 'p-6 md:p-10 flex-1 relative overflow-y-auto' }, [
        e('div', { key: 'line', className: 'absolute left-[39px] md:left-[51px] top-0 bottom-0 w-1 bg-slate-50 border-l border-dashed border-slate-200' }),
        e('div', { key: 'stack', className: 'space-y-12 relative' }, 
          sessions.sort((a,b) => a.session_number - b.session_number).map(s => {
            const key = `${s.strand}-${s.session_number}`;
            return e('div', { key, className: 'pl-14 md:pl-16 relative' }, [
              e('div', { 
                key: 'dot',
                className: `absolute left-[-16px] md:left-[-12px] top-5 w-8 h-8 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center transition-all ${
                  s.status === 'Mastered' ? 'bg-emerald-500' : s.status === 'Taught' ? 'bg-amber-500' : 'bg-slate-300'
                }`
              }, s.status === 'Mastered' ? e('svg', { className: 'w-4 h-4 text-white', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 3, d: 'M5 13l4 4L19 7' })) : null),
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

  const handleUpdate = (snum, strand, updates) => {
    const data = storageManager.get();
    const next = data.map(s => (s.session_number === snum && s.strand === strand) ? { ...s, ...updates } : s);
    storageManager.save(next);
  };

  const filtered = useMemo(() => {
    if (!reliever) return sessions;
    return ['Place Value', 'Times Tables'].flatMap(st => {
      const strandLessons = sessions.filter(s => s.strand === st).sort((a, b) => a.session_number - b.session_number);
      const next = strandLessons.find(s => s.status !== 'Mastered');
      return next ? [next] : [];
    });
  }, [sessions, reliever]);

  if (!ready) return e('div', { className: 'flex items-center justify-center min-h-screen font-black tracking-widest' }, 'SYNCING DATABASE...');

  return e('div', { className: 'min-h-screen bg-[#f8fafc] flex flex-col font-sans' }, [
    e('header', { className: 'bg-white border-b border-slate-200 sticky top-0 z-50 py-5 shadow-sm px-6' }, [
      e('div', { className: 'max-w-7xl mx-auto flex justify-between items-center' }, [
        e('div', { className: 'flex items-center gap-4' }, [
          e('div', { className: 'bg-slate-900 text-white p-2 rounded-xl' }, 
            e('svg', { className: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, e('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2.5, d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.082.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4 1.253' }))
          ),
          e('div', null, [
            e('h1', { className: 'font-black text-xl tracking-tighter uppercase' }, 'Mastery Engine'),
            e('p', { className: 'text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]' }, 'Curriculum & Atom Tracking')
          ])
        ]),

        e('div', { className: 'flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200' }, [
          e('span', { className: 'text-[10px] font-black uppercase text-slate-500 ml-2' }, 'Reliever Mode'),
          e('button', { 
            onClick: () => setReliever(!reliever),
            className: `w-14 h-8 rounded-full transition-all relative outline-none ${reliever ? 'bg-blue-600' : 'bg-slate-200'}`
          }, [
            e('div', { 
              className: `absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${reliever ? 'translate-x-6' : 'translate-x-0'}` 
            })
          ])
        ])
      ])
    ]),

    e('main', { className: 'max-w-7xl mx-auto w-full flex-1 p-6 md:p-10' }, [
      e('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-12' }, [
        e(Timeline, { title: 'Place Value', sessions: filtered.filter(s => s.strand === 'Place Value'), onUpdate: handleUpdate }),
        e(Timeline, { title: 'Times Tables', sessions: filtered.filter(s => s.strand === 'Times Tables'), onUpdate: handleUpdate })
      ])
    ]),

    e('footer', { className: 'p-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center border-t border-slate-200 bg-white mt-auto' }, 'Curriculum Dashboard • Ver 6.1')
  ]);
};

ReactDOM.createRoot(document.getElementById('root')).render(e(App));
