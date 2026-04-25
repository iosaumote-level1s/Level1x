import React, { useState, useEffect } from 'react';
import { UserProfile, Goal, DailyLog, GoalCategory, RoutineItem } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, CheckCircle2, TrendingUp, DollarSign, Heart, Brain, Book, Users, Zap, LayoutDashboard, Target, Calendar, MessageSquare, Camera, Star, Activity, BarChart3, Sparkles } from 'lucide-react';
import GoalCard from './GoalCard';
import RoutineList from './RoutineList';
import FeedbackSystem from './FeedbackSystem';
import LogForm from './LogForm';
import AIBrain from './AIBrain';
import { generateAscensionAnalysis, AscensionAnalysis } from '../services/aiService';
import { cn } from '../lib/utils';

import AIChat from './AIChat';
import ReportingSystem from './ReportingSystem';
import NotificationTriggers from './NotificationTriggers';

interface DashboardProps {
  profile: UserProfile;
}

const CATEGORIES: { label: GoalCategory; icon: any; color: string }[] = [
  { label: 'Money & Wealth', icon: DollarSign, color: '#f0abfc' },
  { label: 'Fitness & Energy', icon: Heart, color: '#22d3ee' },
  { label: 'Mindset & Focus', icon: Brain, color: '#c084fc' },
  { label: 'Learning & Skills', icon: Book, color: '#818cf8' },
  { label: 'Network & Relationships', icon: Users, color: '#fb923c' },
  { label: 'Discipline & Habits', icon: Zap, color: '#f472b6' },
];

export default function Dashboard({ profile }: DashboardProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'routine' | 'chat' | 'reports' | 'feedback'>('overview');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showBrainModal, setShowBrainModal] = useState(false);
  const [analysis, setAnalysis] = useState<AscensionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const goalsQuery = query(collection(db, 'users', auth.currentUser.uid, 'goals'));
    const unsubscribeGoals = onSnapshot(goalsQuery, (snap) => {
      setGoals(snap.docs.map(d => ({ ...d.data(), id: d.id } as Goal)));
    });

    const logsQuery = query(collection(db, 'users', auth.currentUser.uid, 'logs'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snap) => {
      setLogs(snap.docs.map(d => d.data() as DailyLog));
    });

    const routinesQuery = query(collection(db, 'users', auth.currentUser.uid, 'routines'));
    const unsubscribeRoutines = onSnapshot(routinesQuery, (snap) => {
      setRoutines(snap.docs.map(d => ({ ...d.data(), id: d.id } as RoutineItem)));
    });

    return () => {
      unsubscribeGoals();
      unsubscribeLogs();
      unsubscribeRoutines();
    };
  }, []);

  const handleAscensionSync = async () => {
    if (analyzing || !profile) return;
    setAnalyzing(true);
    setShowBrainModal(true);
    try {
      const res = await generateAscensionAnalysis(profile, goals, logs);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const calculatedRank = Math.max(1, 100 - (goals.filter(g => g.status === 'completed').length * 5) - (logs.length * 2));
  const efficiency = Math.min(99.9, (logs.length > 0 ? (logs.filter(l => l.feedbackRating && l.feedbackRating >= 4).length / logs.length) * 100 : 0) + 40).toFixed(1);

  const chartData = CATEGORIES.map(cat => ({
    name: cat.label,
    value: goals.filter(g => g.category === cat.label && g.status === 'completed').length + 1,
    color: cat.color
  }));

  const progressData = [
    { day: 'MON', progress: 65 },
    { day: 'TUE', progress: 80 },
    { day: 'WED', progress: 45 },
    { day: 'THU', progress: 90 },
    { day: 'FRI', progress: 70 },
    { day: 'SAT', progress: 100 },
    { day: 'SUN', progress: 85 },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    return `Heyy ${greeting}`;
  };

  return (
    <div className="space-y-16 pb-24 relative">
      {/* Personalized Greeting */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <p className="text-cyan-400 font-bold uppercase tracking-[0.4em] text-[10px]">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
          {getGreeting()}, <span className="text-white/40">great to see you</span>.
        </h2>
        <p className="text-white/40 font-medium tracking-wide">
          Ready to dominate the 1% tier today, {profile.displayName}?
        </p>
      </motion.div>

      <AnimatePresence>
        {showBrainModal && (
          <AIBrain 
            analysis={analysis} 
            loading={analyzing} 
            onClose={() => setShowBrainModal(false)}
            onSync={handleAscensionSync}
          />
        )}
      </AnimatePresence>
      {/* Header Stat Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Efficiency Score', value: `${efficiency}%`, icon: Zap, color: 'text-cyan-400' },
          { label: 'Current Rank', value: `TOP ${calculatedRank.toFixed(1)}%`, icon: TrendingUp, color: 'text-fuchsia-400' },
          { label: 'Growth Velocity', value: `+${(logs.length * 0.4).toFixed(1)}%`, icon: Zap, color: 'text-purple-400' },
          { label: 'Active Goals', value: `${goals.length}`, icon: CheckCircle2, color: 'text-white' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 flex flex-col justify-between h-36 relative group overflow-hidden border-white/10"
          >
            <div className="relative z-10 space-y-1">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">{stat.label}</p>
              <p className={cn("text-4xl font-black tracking-tight", stat.color)}>{stat.value}</p>
            </div>
            <stat.icon className={cn("absolute -bottom-4 -right-4 w-20 h-20 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 blur-[1px]", stat.color)} />
          </motion.div>
        ))}
      </div>

      {/* Futuristic Tabs */}
      <div className="flex flex-wrap gap-2 p-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl w-fit mx-auto justify-center">
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'chat', icon: MessageSquare, label: 'Coaching Chat' },
          { id: 'reports', icon: BarChart3, label: 'Reports' },
          { id: 'goals', icon: Target, label: 'Domains' },
          { id: 'routine', icon: Calendar, label: 'Routine' },
          { id: 'feedback', icon: Brain, label: 'Sync' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-xl font-bold uppercase text-[9px] tracking-[0.2em] transition-all relative overflow-hidden",
              activeTab === tab.id 
                ? "bg-white text-zinc-950 shadow-lg" 
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Real-time Triggers & Notifications */}
            <div className="lg:col-span-12">
              <NotificationTriggers routines={routines} goals={goals} />
            </div>

            {/* Domain Analysis Glass Card */}
            <div className="glass-card lg:col-span-4 p-8 flex flex-col">
              <div className="space-y-1 mb-8">
                <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-cyan-400">Section 01</p>
                <h3 className="text-xl font-bold tracking-tight uppercase">Domain Focus</h3>
              </div>
              <div className="h-64 flex-grow relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(5, 5, 16, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '16px', 
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black tracking-tighter bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent italic">07</span>
                  <span className="text-[7px] font-bold uppercase text-white/30 tracking-[0.2em]">Active Nodes</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                {CATEGORIES.map(cat => (
                  <div key={cat.label} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[7px] text-white/50 font-bold uppercase tracking-widest truncate">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Neural Velocity Glass Card */}
            <div className="glass-card lg:col-span-8 p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-fuchsia-400">Section 02</p>
                  <h3 className="text-xl font-bold tracking-tight uppercase">Performance Velocity</h3>
                </div>
                <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">Real Time Stream</div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 8, fill: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '2px' }} 
                      dy={15} 
                    />
                    <YAxis hide domain={[0, 110]} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: 'rgba(5, 5, 16, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '9px' }} />
                    <Bar dataKey="progress" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 1% Vision Card */}
            <div className="lg:col-span-12 glass-card p-10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Sparkles className="w-64 h-64 text-amber-400" />
              </div>
              <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.6em]">Absolute Vision</p>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter">The 1% Identity</h3>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Target Freedom Date</p>
                    <p className="text-xl font-black text-white italic">APRIL 2029</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-3">
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">3-Year Vision</p>
                    <p className="text-sm font-medium leading-relaxed text-white/80 italic line-clamp-3">"{profile.vision3Year || "Not defined yet..."}"</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Dream Career</p>
                    <p className="text-sm font-medium leading-relaxed text-white/80 italic">"{profile.dreamCareer || "Not defined yet..."}"</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Financial Freedom</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-tighter italic">${Number(profile.targetIncome || 0).toLocaleString()}/YR</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Peak Physical Goal</p>
                    <p className="text-sm font-medium leading-relaxed text-white/80 italic">"{profile.fitnessGoal || "Not defined yet..."}"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Capture Card */}
            <div className="lg:col-span-12 glass-card p-10 overflow-hidden relative group">
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                <div className="max-w-2xl space-y-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-cyan-400 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-cyan-400" />
                    Growth Initiative
                  </p>
                  <h4 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase italic">
                    Log Your <span className="text-cyan-400">Daily Progress</span>
                  </h4>
                  <p className="text-white/40 text-sm font-medium tracking-wide">
                    Convert lessons into wisdom. Record your wins and optimize for tomorrow.
                  </p>
                </div>
                <button 
                  onClick={() => setShowLogModal(true)}
                  className="shrink-0 group/btn"
                >
                  <div className="relative flex items-center justify-center gap-4 bg-white text-zinc-950 px-10 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-cyan-400 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    ADD LOG ENTRY
                  </div>
                </button>
              </div>
            </div>

            {/* Neural Log History */}
            <div className="lg:col-span-12 space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-cyan-400">Section 03</p>
                  <h3 className="text-xl font-bold tracking-tight uppercase">Performance History</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {logs.slice().sort((a,b) => b.date.localeCompare(a.date)).map((log, i) => (
                  <motion.div 
                    key={log.date}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6 space-y-4 relative group border-white/5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">Log Date</p>
                        <p className="text-lg font-black italic text-cyan-400 uppercase tracking-tighter leading-none">{log.date}</p>
                      </div>
                      {log.feedbackRating && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10">
                          <span className="text-[8px] font-black text-cyan-400">{log.feedbackRating}/5</span>
                          <Star className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
                        </div>
                      )}
                    </div>
                    
                    {log.winOfDay && (
                      <div className="space-y-1.5">
                        <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">Daily Win</p>
                        <p className="text-[10px] text-fuchsia-400 font-black uppercase italic leading-relaxed line-clamp-2">{log.winOfDay}</p>
                      </div>
                    )}

                    {log.aiFeedback && (
                      <div className="space-y-1.5">
                        <p className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">AI Advice</p>
                        <p className="text-[10px] text-white/60 leading-relaxed italic line-clamp-2">"{log.aiFeedback}"</p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-fuchsia-400 opacity-60" />
                        <span className="text-[8px] font-bold text-white/50">{log.sleepHours}H REST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Brain className="w-3 h-3 text-purple-400 opacity-60" />
                        <span className="text-[8px] font-bold text-white/50">{log.meditationMinutes}M SYNC</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {logs.length === 0 && (
                <div className="py-20 text-center glass-card border-dashed border-white/5 opacity-30">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No History Data Available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AIChat profile={profile} />
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ReportingSystem logs={logs} />
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {CATEGORIES.map(cat => (
              <div key={cat.label} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className={cn("p-3 rounded-2xl", `text-[${cat.color}] shadow-sm`)} style={{ backgroundColor: `${cat.color}20` }}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{cat.label}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {goals.filter(g => g.category === cat.label).map(goal => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                  <button 
                    onClick={async () => {
                      if (!auth.currentUser) return;
                      await addDoc(collection(db, 'users', auth.currentUser.uid, 'goals'), {
                        userId: auth.currentUser.uid,
                        category: cat.label,
                        title: 'New Goal',
                        description: 'What do you want to achieve?',
                        status: 'in-progress',
                        progress: 0,
                        createdAt: new Date().toISOString()
                      });
                    }}
                    className="h-full min-h-[200px] border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-black hover:text-black transition-all group"
                  >
                    <div className="p-4 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                      <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-bold">Add Domain Objective</span>
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'routine' && <RoutineList />}
        {activeTab === 'feedback' && (
          <div className="flex flex-col items-center justify-center py-40 space-y-12">
            <div className="relative group">
              <div className="absolute -inset-20 bg-fuchsia-400 opacity-10 blur-[120px] rounded-full group-hover:opacity-30 transition-opacity" />
              <div className="w-64 h-64 glass-card border-white/10 flex items-center justify-center relative z-10 hover:scale-105 transition-transform duration-500">
                <Brain className="w-32 h-32 text-fuchsia-400" />
              </div>
            </div>
            <div className="text-center max-w-2xl space-y-8">
              <h3 className="text-6xl font-black italic tracking-tighter uppercase">AI COACHING SYSTEM</h3>
              <p className="text-white/40 text-xl font-medium leading-relaxed">
                Unlock peak performance by synchronizing your behavioral data with our AI Growth Engine.
              </p>
              <button 
                onClick={handleAscensionSync}
                className="bg-white text-zinc-950 px-20 py-10 rounded-[32px] font-black uppercase tracking-[0.5em] text-sm hover:bg-fuchsia-400 hover:shadow-[0_0_60px_rgba(240,171,252,0.5)] transition-all flex items-center justify-center gap-6 mx-auto group"
              >
                <Zap className="w-6 h-6 animate-pulse group-hover:scale-125 transition-transform" />
                START AI ANALYSIS
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogModal && (
          <LogForm onClose={() => setShowLogModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
