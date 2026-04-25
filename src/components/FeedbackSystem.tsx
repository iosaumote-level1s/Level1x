import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { cn } from '../lib/utils';

export default function FeedbackSystem() {
  const [suggestion, setSuggestion] = useState('');
  const [category, setCategory] = useState('Feature Request');
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !suggestion) return;

    await addDoc(collection(db, 'system_feedback'), {
      userId: auth.currentUser.uid,
      suggestion,
      category,
      createdAt: new Date().toISOString()
    });

    setSuggestion('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-8 space-y-8 sm:space-y-10 px-4 sm:px-0">
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter leading-none text-white">System Feedback</h2>
        <p className="text-zinc-500 font-sans text-[7px] sm:text-[9px] uppercase tracking-[0.2em] font-bold text-cyan-400">Help us improve your experience</p>
      </div>

      <form onSubmit={submitFeedback} className="glass-card p-6 sm:p-10 space-y-8 sm:space-y-10 shadow-2xl border-white/10 rounded-2xl sm:rounded-[32px]">
        <div className="space-y-4">
          <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-cyan-400 italic ml-2">Category</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {['Feature Request', 'UI Styling', 'Performance', 'AI Coaching', 'Report Bug'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "py-3 sm:py-4 px-2 rounded-xl text-[7px] sm:text-[9px] font-black uppercase tracking-wider italic transition-all border min-h-[44px]",
                  category === cat 
                    ? "bg-white text-zinc-950 border-white shadow-lg scale-105" 
                    : "bg-white/5 text-white/40 border-white/10 hover:border-white/30"
                )}
              >
                {cat}
              </button>
             ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-cyan-400 italic ml-2">Your Message</label>
          <textarea
            className="w-full min-h-[120px] sm:min-h-[140px] bg-zinc-950 border border-white/10 rounded-2xl p-4 sm:p-6 outline-none focus:border-cyan-400 text-base sm:text-lg font-medium text-white resize-none transition-all placeholder:text-white/5"
            placeholder="Tell us what's on your mind..."
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
          />
        </div>

        <button
          disabled={!suggestion || submitted}
          className="w-full bg-white text-zinc-950 py-4 sm:py-5 rounded-2xl font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] italic text-base sm:text-lg hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 min-h-[56px]"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                key="submitted"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 sm:gap-3"
              >
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-950" />
                SENT
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                className="flex items-center justify-center gap-2 sm:gap-3"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                SEND FEEDBACK
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </form>
    </div>
  );
}
