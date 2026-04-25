import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { X, Save, Brain, Camera, Zap, Check, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DailyLog } from '../types';
import { analyzeDailyLog } from '../services/aiService';
import { cn } from '../lib/utils';

interface LogFormProps {
  onClose: () => void;
}

export default function LogForm({ onClose }: LogFormProps) {
  const [sleep, setSleep] = useState(8);
  const [affirmation, setAffirmation] = useState(false);
  const [learning, setLearning] = useState('');
  const [winOfDay, setWinOfDay] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [meditation, setMeditation] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnalize = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    
    const log: DailyLog = {
      userId: auth.currentUser.uid,
      date: new Date().toISOString().split('T')[0],
      sleepHours: sleep,
      affirmationDone: affirmation,
      meditationMinutes: meditation,
      meals: [],
      learning: learning,
      winOfDay: winOfDay,
      photoUrl: photo || undefined
    };

    try {
      const feedback = await analyzeDailyLog(log);
      setAiFeedback(feedback || "Analysis complete.");
      setShowFeedback(true);
    } catch (err) {
      console.error(err);
      setAiFeedback("System error during analysis. Manual sync required.");
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    
    const today = new Date().toISOString().split('T')[0];
    const log: DailyLog = {
      userId: auth.currentUser.uid,
      date: today,
      sleepHours: sleep,
      affirmationDone: affirmation,
      meditationMinutes: meditation,
      meals: [],
      learning: learning,
      winOfDay: winOfDay,
      photoUrl: photo || undefined,
      aiFeedback: aiFeedback || undefined,
      feedbackRating: rating || undefined
    };

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'logs', today), log);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#050510]/80 backdrop-blur-3xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative glass-card border-white/10 w-full max-w-5xl h-full max-h-[850px] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)]"
      >
        <div className="flex-1 p-10 lg:p-12 overflow-y-auto space-y-12">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-cyan-400">Daily Progress Review // {new Date().toLocaleDateString()}</p>
              <h2 className="text-5xl font-black tracking-tighter leading-tight uppercase italic">
                {showFeedback ? "AI Audit" : "Log Progress"}
              </h2>
            </div>
            <button onClick={onClose} className="p-4 bg-white/5 text-white/30 rounded-2xl hover:text-white hover:bg-white/10 transition-all border border-white/10"><X className="w-6 h-6" /></button>
          </div>

          <AnimatePresence mode="wait">
            {!showFeedback ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-cyan-400" />
                      Sleep Duration (Hours)
                    </label>
                    <div className="space-y-4">
                      <input 
                        type="range" min="4" max="12" step="0.5" value={sleep} 
                        onChange={e => setSleep(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer" 
                      />
                      <div className="text-7xl font-black text-white tracking-tighter leading-none tabular-nums">{sleep}<span className="text-3xl text-white/20 ml-1">H</span></div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-fuchsia-400" />
                      Mental Focus
                    </label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setAffirmation(true)}
                        className={cn("flex-1 py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all border", affirmation ? "bg-white text-zinc-950 border-white shadow-lg" : "bg-white/5 text-white/30 border-white/10 hover:border-white/30")}
                      >Active</button>
                      <button 
                        onClick={() => setAffirmation(false)}
                        className={cn("flex-1 py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all border", !affirmation ? "bg-white/10 text-white border-white/20" : "bg-transparent text-white/5 border-transparent")}
                      >Inactive</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400" />
                    Share Today's Big Win
                  </label>
                  <input 
                    placeholder="I coded for 4 hours straight..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 outline-none focus:border-cyan-400 text-lg font-medium text-white transition-all placeholder:text-white/10"
                    value={winOfDay}
                    onChange={e => setWinOfDay(e.target.value)}
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400" />
                    Lessons Learned
                  </label>
                  <textarea 
                    placeholder="Describe what you learned today..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 outline-none focus:border-cyan-400 text-lg font-medium text-white min-h-[160px] resize-none transition-all placeholder:text-white/10"
                    value={learning}
                    onChange={e => setLearning(e.target.value)}
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-400" />
                    Daily Snapshot
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="cursor-pointer bg-white text-zinc-950 px-8 py-4 rounded-xl font-bold uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-cyan-400 transition-all text-[10px] group">
                      <Camera className="w-5 h-5" />
                      {photo ? "Change Image" : "Upload Photo"}
                      <input type="file" className="hidden" onChange={e => {
                        if (e.target.files?.[0]) {
                          const reader = new FileReader();
                          reader.onload = (re => setPhoto(re.target?.result as string));
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }} />
                    </label>
                    {photo && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-lg">
                        <img src={photo} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12"
              >
                <div className="glass-card p-10 bg-white/5 border-white/10 relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      AI COACH FEEDBACK
                    </p>
                    <p className="text-2xl font-medium leading-relaxed italic text-white/90">
                      "{aiFeedback}"
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">Rate This Advice</p>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => setRating(val)}
                        className={cn(
                          "flex-1 py-4 rounded-xl font-black text-lg transition-all border",
                          rating === val 
                            ? "bg-cyan-400 border-cyan-400 text-zinc-950 shadow-lg" 
                            : "bg-white/5 border-white/10 text-white/30 hover:border-white/30"
                        )}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowFeedback(false)}
                  className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
                >
                  ← BACK TO EDITING
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-[380px] bg-white/[0.03] backdrop-blur-3xl p-12 flex flex-col items-center justify-center text-center space-y-12 border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="relative group">
            <div className="absolute -inset-6 bg-cyan-400 opacity-20 blur-3xl rounded-full animate-pulse" />
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl relative z-10">
              <Brain className="w-10 h-10 text-zinc-950" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tight leading-none italic">
              {showFeedback ? "Save to History" : "AI Analysis"}
            </h3>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] leading-relaxed">
              {showFeedback 
                ? "Finalizing your daily entry. Your feedback helps me improve." 
                : "Starting analysis of your day. Syncing your progress."}
            </p>
          </div>
          <button 
            onClick={showFeedback ? handleFinalize : handleAnalize}
            disabled={isSubmitting || (showFeedback && rating === null)}
            className="w-full bg-white text-zinc-950 py-6 rounded-3xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-cyan-400 hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (showFeedback ? "SAVE LOG" : "GET AI FEEDBACK")}
          </button>
          
          {showFeedback && rating === null && (
            <p className="text-fuchsia-400 text-[8px] font-bold uppercase tracking-widest animate-pulse">
              Rating Required
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
