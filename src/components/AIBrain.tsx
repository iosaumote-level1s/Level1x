import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Brain, Zap, Target, TrendingUp, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { AscensionAnalysis } from '../services/aiService';
import { cn } from '../lib/utils';

interface AIBrainProps {
  analysis: AscensionAnalysis | null;
  loading: boolean;
  onClose: () => void;
  onSync: () => void;
}

export default function AIBrain({ analysis, loading, onClose, onSync }: AIBrainProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#050510]/95 backdrop-blur-3xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="relative glass-card border-white/10 w-full max-w-6xl h-full max-h-[900px] overflow-hidden flex flex-col shadow-[0_0_150px_rgba(0,0,0,0.9)]"
      >
        <div className="flex-1 overflow-y-auto p-10 lg:p-14 space-y-12">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-cyan-400">AI Analysis // Personal Growth</p>
              <h2 className="text-5xl font-black tracking-tighter leading-tight uppercase italic">Intelligence Report</h2>
            </div>
            <button onClick={onClose} className="p-4 bg-white/5 text-white/30 rounded-2xl hover:text-white hover:bg-white/10 transition-all border border-white/10"><X className="w-6 h-6" /></button>
          </div>

          {!analysis && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-10">
              <div className="relative group">
                <div className="absolute -inset-12 bg-cyan-400 opacity-20 blur-[80px] rounded-full animate-pulse" />
                <div className="w-32 h-32 bg-white rounded-[32px] flex items-center justify-center shadow-2xl relative z-10">
                  <Brain className="w-16 h-16 text-zinc-950" />
                </div>
              </div>
              <div className="max-w-md space-y-4">
                <h3 className="text-3xl font-black uppercase tracking-tight italic">AI Offline</h3>
                <p className="text-white/40 text-sm font-medium tracking-wide leading-relaxed">
                  Start an AI analysis to process your data and receive growth tips.
                </p>
              </div>
              <button 
                onClick={onSync}
                className="bg-white text-zinc-950 px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-xs hover:bg-cyan-400 hover:shadow-lg transition-all flex items-center gap-4"
              >
                <Zap className="w-5 h-5 animate-pulse" />
                INITIATE GROWTH SYNC
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-8">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-white/5 rounded-full border-t-cyan-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-center">
                <p className="text-[9px] font-bold uppercase tracking-[0.6em] text-cyan-400 animate-pulse">Syncing Your Progress</p>
                <p className="text-white/20 font-mono text-[9px] uppercase tracking-[0.2em]">Crafting your peak performance plan...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Stats & Summary */}
              <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-10 bg-white/[0.02] border-white/5 space-y-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">Efficiency Index</p>
                    <div className="text-7xl font-black text-cyan-400 tracking-tighter tabular-nums leading-none">
                      {analysis?.efficiencyScore}%
                    </div>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${analysis?.efficiencyScore}%` }} />
                  </div>
                </div>

                <div className="lg:col-span-2 glass-card p-10 bg-white/[0.02] border-white/5 space-y-6">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">Strategic Review</p>
                    <h4 className="text-xl font-bold uppercase tracking-tight">Growth Status</h4>
                  </div>
                  <p className="text-white/60 text-lg font-medium leading-relaxed italic">
                    "{analysis?.progressSummary}"
                  </p>
                </div>
              </div>

              {/* Power Moves */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-cyan-400">Core Actions</p>
                  <h4 className="text-3xl font-black uppercase tracking-tighter italic">Top Actions</h4>
                </div>
                <div className="space-y-4">
                  {analysis?.topActions.map((move, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card p-8 bg-white/[0.01] border-white/5 flex gap-6 group hover:bg-white/[0.03] transition-all"
                    >
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-white/20 font-mono">[{move.category}]</span>
                          <h5 className="text-lg font-bold uppercase tracking-tight text-white">{move.title}</h5>
                        </div>
                        <p className="text-white/50 text-[11px] leading-relaxed">{move.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mantra & Feedback */}
              <div className="lg:col-span-5 space-y-12">
                <div className="glass-card p-10 bg-gradient-to-br from-fuchsia-400/10 to-transparent border-fuchsia-400/20 relative overflow-hidden group">
                  <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-amber-400 opacity-5 group-hover:scale-125 transition-transform duration-1000" />
                  <div className="relative z-10 space-y-6">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">Focus Command</p>
                    <h4 className="text-3xl font-black uppercase tracking-tight leading-tight italic bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      {analysis?.focusMantra}
                    </h4>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">Growth Optimization</p>
                    <h4 className="text-xl font-bold uppercase tracking-tight">AI Lessons</h4>
                  </div>
                  <div className="glass-card p-8 bg-white/5 border-white/10 italic text-white/50 text-[13px] leading-relaxed relative">
                    <span className="absolute top-2 left-2 text-4xl text-white/5 font-serif">"</span>
                    {analysis?.growthFeedback}
                  </div>
                </div>

                <button 
                  onClick={onSync}
                  className="w-full bg-white/5 border border-white/10 text-white/40 py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[9px] hover:text-white hover:border-cyan-400/50 transition-all flex items-center justify-center gap-3 group"
                >
                  <TrendingUp className="w-3.5 h-3.5 group-hover:-translate-y-1 transition-transform" />
                  UPDATE REPORT
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-8 border-t border-white/10 bg-white/[0.02] flex justify-between items-center opacity-40">
          <div className="flex gap-6">
            <p className="text-[8px] font-bold text-white tracking-[0.4em] uppercase">Status: System Optimal</p>
            <p className="text-[8px] font-bold text-white tracking-[0.4em] uppercase">Alignment: {analysis?.efficiencyScore || 0}% Complete</p>
          </div>
          <p className="text-[8px] font-bold text-white/60 tracking-[0.1em] uppercase italic">"Amateurs compete. Professionals dominate."</p>
        </div>
      </motion.div>
    </div>
  );
}
