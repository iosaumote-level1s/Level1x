import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, Calendar } from 'lucide-react';
import { DailyLog, PeriodicReport } from '../types';
import { generatePeriodicReport } from '../services/aiService';
import { cn } from '../lib/utils';

interface ReportingSystemProps {
  logs: DailyLog[];
}

export default function ReportingSystem({ logs }: ReportingSystemProps) {
  const [period, setPeriod] = useState<'7 days' | '15 days' | 'month' | 'quarter' | 'six month' | 'year'>('7 days');
  const [report, setReport] = useState<PeriodicReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period, logs]);

  const fetchReport = async () => {
    if (logs.length === 0) return;
    setLoading(true);
    try {
      // Filter logs for the selected period
      const now = new Date();
      const filteredLogs = logs.filter(log => {
        const logDate = new Date(log.date);
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (period === '7 days') return diffDays <= 7;
        if (period === '15 days') return diffDays <= 15;
        if (period === 'month') return diffDays <= 30;
        if (period === 'quarter') return diffDays <= 90;
        if (period === 'six month') return diffDays <= 180;
        if (period === 'year') return diffDays <= 365;
        return false;
      });

      if (filteredLogs.length > 0) {
        const res = await generatePeriodicReport(filteredLogs, period);
        setReport(res);
      } else {
        setReport(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Period Selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {(['7 days', '15 days', 'month', 'quarter', 'six month', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all border",
              period === p 
                ? "bg-white text-zinc-950 border-white shadow-xl scale-105" 
                : "bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-40 flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-16 h-16 border-t-2 border-cyan-400 rounded-full animate-spin" />
            <p className="text-white/20 font-bold uppercase tracking-[0.5em] text-[10px]">Analyzing Data Nodes...</p>
          </motion.div>
        ) : report ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Summary & Score */}
            <div className="lg:col-span-8 glass-card p-12 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-175 transition-transform duration-[2s]">
                <BarChart3 className="w-64 h-64 text-white" />
              </div>
              <div className="relative z-10 space-y-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">Executive Summary</p>
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-tight flex items-center gap-4">
                    Performance Review <ChevronRight className="w-8 h-8 text-white/20" /> {period}
                  </h3>
                </div>
                <p className="text-white/60 text-xl font-medium leading-relaxed italic border-l-2 border-cyan-400/30 pl-8">
                  "{report.summary}"
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 glass-card p-12 flex flex-col justify-between items-center text-center bg-gradient-to-br from-cyan-400/10 to-transparent border-cyan-400/20">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400">System Score</p>
                <div className="text-9xl font-black italic tracking-tighter text-white tabular-nums drop-shadow-2xl">
                  {report.score}
                </div>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${report.score}%` }}
                  className="h-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                />
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="glass-card p-12 space-y-8 border-green-500/10 hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-500/10 rounded-2xl text-green-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-black italic uppercase tracking-tight">Core Strengths</h4>
                </div>
                <ul className="space-y-4">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="flex gap-4 items-start bg-white/5 p-5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="text-white/60 font-semibold italic text-base leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-12 space-y-8 border-orange-500/10 hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-black italic uppercase tracking-tight">Optimization Zones</h4>
                </div>
                <ul className="space-y-4">
                  {report.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-4 items-start bg-white/5 p-5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="text-white/60 font-semibold italic text-base leading-snug">{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-40 text-center glass-card border-dashed border-white/10 opacity-30">
            <Calendar className="w-16 h-16 mx-auto mb-6 text-white/50" />
            <p className="text-[10px] font-bold uppercase tracking-[0.5em]">No Data Points Detected for this Temporal Range</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
