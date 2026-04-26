import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { RoutineItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, Clock, Zap, MoreVertical, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RoutineList() {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newTrigger, setNewTrigger] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/routines`;
    
    setLoading(true);
    const rQuery = query(collection(db, path), orderBy('order'));
    
    return onSnapshot(rQuery, (snap) => {
      setRoutines(snap.docs.map(d => ({ ...d.data(), id: d.id } as RoutineItem)));
      setLoading(false);
      setError(null);
    }, (err) => {
      setLoading(false);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (e: any) {
        setError(e.message);
      }
    });
  }, []);

  const addRoutine = async () => {
    if (!auth.currentUser || !newTitle) return;
    await addDoc(collection(db, 'users', auth.currentUser.uid, 'routines'), {
      userId: auth.currentUser.uid,
      title: newTitle,
      time: newTime,
      trigger: newTrigger,
      order: routines.length,
      createdAt: new Date().toISOString()
    });
    setNewTitle('');
    setNewTrigger('');
    setIsAdding(false);
  };

  const toggleComplete = async (routine: RoutineItem) => {
    if (!auth.currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    await updateDoc(doc(db, 'users', auth.currentUser.uid, 'routines', routine.id), {
      completedTodayIndex: routine.completedTodayIndex === today ? '' : today
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
      <div className="flex justify-between items-end pb-4 sm:pb-6 border-b border-white/10">
        <div className="space-y-1">
          <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400">Daily Blueprint</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-tight italic">Planned Habits</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "p-3 sm:p-5 rounded-2xl transition-all relative group min-h-[48px] min-w-[48px] flex items-center justify-center",
            isAdding ? "bg-white text-zinc-950 scale-105 shadow-lg" : "bg-white/5 border border-white/10 text-white/40 hover:border-cyan-400/50 hover:text-white"
          )}
        >
          <Plus className={cn("w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-700", isAdding && "rotate-45")} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className="glass-card p-6 sm:p-10 space-y-6 sm:space-y-8 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 ml-2 italic">Habit Name</label>
                <input 
                  autoFocus
                  placeholder="Morning Exercise or Deep Work"
                  className="w-full text-lg sm:text-xl font-bold bg-white/5 border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 outline-none focus:border-cyan-400 transition-all text-white placeholder:text-white/10 min-h-[56px]"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 ml-2 italic">When to do it</label>
                <input 
                  placeholder="After my morning coffee"
                  className="w-full text-lg sm:text-xl font-bold bg-white/5 border border-white/10 rounded-xl px-4 sm:px-6 py-3 sm:py-4 outline-none focus:border-cyan-400 transition-all text-white placeholder:text-white/10 min-h-[56px]"
                  value={newTrigger}
                  onChange={e => setNewTrigger(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 sm:gap-6 pt-2">
              <div className="flex items-center gap-4 sm:gap-6 bg-white/5 px-6 sm:px-8 py-3 sm:py-4 rounded-xl border border-white/10 group hover:border-cyan-400/30 transition-colors min-h-[56px]">
                <Clock className="w-5 h-5 text-white/30 group-hover:text-cyan-400 transition-colors" />
                <input 
                  type="time" 
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="bg-transparent text-xl sm:text-2xl font-black text-white outline-none font-mono tracking-tighter [color-scheme:dark] flex-1"
                />
              </div>
              <button 
                onClick={addRoutine}
                className="bg-white text-zinc-950 px-8 sm:px-12 py-3 sm:py-5 rounded-xl font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-xl active:scale-95 min-h-[56px] w-full lg:w-auto"
              >
                Save to Routine
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 sm:space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-6 bg-white/5 rounded-3xl border border-white/5">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">Accessing Blueprint...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-6 glass-card border-white/10 text-center">
            <AlertCircle className="w-10 h-10 text-fuchsia-400/50" />
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-400/50">Link Interrupted</p>
              <p className="text-[10px] text-white/20 font-medium max-w-xs mx-auto">Routine data temporarily unavailable.</p>
            </div>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Retry Sync</button>
          </div>
        ) : (
          routines.map((r, i) => (
            <motion.div 
              key={r.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "p-6 sm:p-8 glass-card flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 group relative",
                r.completedTodayIndex === today && "opacity-40 grayscale-[0.5]"
              )}
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-fuchsia-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-row items-center gap-6 sm:gap-10 flex-1 w-full sm:w-auto">
                <div className="text-center min-w-[70px] sm:min-w-[100px]">
                  <p className="text-[6px] sm:text-[7px] font-bold text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2 text-nowrap">Target Time</p>
                  <p className="text-2xl sm:text-4xl font-black text-white tabular-nums tracking-tighter leading-none">{r.time}</p>
                </div>
                
                <div className="w-[1px] h-10 sm:h-12 bg-white/10" />
                
                <div className="space-y-1 sm:space-y-2 flex-1">
                  <h4 className={cn("text-lg sm:text-2xl font-bold uppercase tracking-tight transition-all italic leading-tight", r.completedTodayIndex === today ? "line-through text-white/30" : "text-white")}>{r.title}</h4>
                  {r.trigger && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
                      <p className="text-[7px] sm:text-[9px] text-white/50 font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] line-clamp-1">Trigger: {r.trigger}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto border-t border-white/5 pt-4 sm:pt-0 sm:border-0">
                <button 
                  onClick={() => toggleComplete(r)}
                  className={cn(
                    "flex-1 sm:flex-none w-auto sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all border shrink-0 min-h-[48px]",
                    r.completedTodayIndex === today 
                      ? "bg-white text-zinc-950 border-white shadow-lg" 
                      : "bg-white/5 text-white/20 hover:text-cyan-400 border-white/10 hover:border-cyan-400/50"
                  )}
                >
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                
                <button 
                  onClick={() => deleteDoc(doc(db, 'users', auth.currentUser!.uid, 'routines', r.id))}
                  className="p-3 text-white/30 hover:text-red-400 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 min-h-[48px] min-w-[48px] flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}

        {routines.length === 0 && !isAdding && !loading && !error && (
          <div className="py-12 sm:py-20 text-center glass-card border-dashed border-white/10 space-y-4 sm:space-y-6 bg-transparent">
            <div className="flex justify-center">
              <div className="p-6 sm:p-8 bg-white/5 rounded-full text-white/20 border border-white/5">
                <LayoutDashboard className="w-12 h-12 sm:w-16 sm:h-16" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px]">No Habits Planned Yet</p>
              <h3 className="text-lg font-bold uppercase text-white/20 tracking-widest leading-none">Create Your First Habit</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
