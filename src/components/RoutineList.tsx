import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { RoutineItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, Clock, Zap, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function RoutineList() {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newTrigger, setNewTrigger] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const rQuery = query(collection(db, 'users', auth.currentUser.uid, 'routines'), orderBy('order'));
    return onSnapshot(rQuery, (snap) => {
      setRoutines(snap.docs.map(d => ({ ...d.data(), id: d.id } as RoutineItem)));
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
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex justify-between items-end pb-6 border-b border-white/10">
        <div className="space-y-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-cyan-400">Daily Blueprint</p>
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-tight italic">Planned Habits</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            "p-5 rounded-2xl transition-all relative group",
            isAdding ? "bg-white text-zinc-950 scale-105 shadow-lg" : "bg-white/5 border border-white/10 text-white/40 hover:border-cyan-400/50 hover:text-white"
          )}
        >
          <Plus className={cn("w-8 h-8 transition-transform duration-700", isAdding && "rotate-45")} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            className="glass-card p-10 space-y-8 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 ml-2 italic">Habit Name</label>
                <input 
                  autoFocus
                  placeholder="Morning Exercise or Deep Work"
                  className="w-full text-xl font-bold bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-400 transition-all text-white placeholder:text-white/10"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 ml-2 italic">When to do it</label>
                <input 
                  placeholder="After my morning coffee"
                  className="w-full text-xl font-bold bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-cyan-400 transition-all text-white placeholder:text-white/10"
                  value={newTrigger}
                  onChange={e => setNewTrigger(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-2">
              <div className="flex items-center gap-6 bg-white/5 px-8 py-4 rounded-xl border border-white/10 min-w-[200px] group hover:border-cyan-400/30 transition-colors">
                <Clock className="w-5 h-5 text-white/30 group-hover:text-cyan-400 transition-colors" />
                <input 
                  type="time" 
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="bg-transparent text-2xl font-black text-white outline-none font-mono tracking-tighter [color-scheme:dark]"
                />
              </div>
              <button 
                onClick={addRoutine}
                className="w-full sm:w-auto bg-white text-zinc-950 px-12 py-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-cyan-400 transition-all shadow-xl active:scale-95"
              >
                Save to Routine
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {routines.map((r, i) => (
          <motion.div 
            key={r.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "p-8 glass-card flex flex-col sm:flex-row items-center justify-between gap-8 group relative",
              r.completedTodayIndex === today && "opacity-40 grayscale-[0.5]"
            )}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-fuchsia-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center gap-10 flex-1">
              <div className="text-center min-w-[100px]">
                <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.3em] mb-2">Target Time</p>
                <p className="text-4xl font-black text-white tabular-nums tracking-tighter leading-none">{r.time}</p>
              </div>
              
              <div className="w-[1px] h-12 bg-white/10 hidden sm:block" />
              
              <div className="space-y-2">
                <h4 className={cn("text-2xl font-bold uppercase tracking-tight transition-all italic", r.completedTodayIndex === today ? "line-through text-white/30" : "text-white")}>{r.title}</h4>
                {r.trigger && (
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <p className="text-[9px] text-white/50 font-bold uppercase tracking-[0.15em]">Trigger: {r.trigger}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => toggleComplete(r)}
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all border shrink-0",
                  r.completedTodayIndex === today 
                    ? "bg-white text-zinc-950 border-white shadow-lg" 
                    : "bg-white/5 text-white/20 hover:text-cyan-400 border-white/10 hover:border-cyan-400/50"
                )}
              >
                <CheckCircle2 className="w-8 h-8" />
              </button>
              
              <button 
                onClick={() => deleteDoc(doc(db, 'users', auth.currentUser!.uid, 'routines', r.id))}
                className="p-4 text-white/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}

        {routines.length === 0 && !isAdding && (
          <div className="py-20 text-center glass-card border-dashed border-white/10 space-y-6 bg-transparent">
            <div className="flex justify-center">
              <div className="p-8 bg-white/5 rounded-full text-white/20 border border-white/5">
                <LayoutDashboard className="w-16 h-16" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[9px]">No Habits Planned Yet</p>
              <h3 className="text-xl font-bold uppercase text-white/20 tracking-widest leading-none">Create Your First Habit</h3>
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
