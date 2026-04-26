import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Zap, Clock, Brain, Target, Activity } from 'lucide-react';
import { RoutineItem, Goal } from '../types';
import { cn } from '../lib/utils';

interface NotificationTriggersProps {
  routines: RoutineItem[];
  goals: Goal[];
}

export default function NotificationTriggers({ routines, goals }: NotificationTriggersProps) {
  const [activeTrigger, setActiveTrigger] = useState<{ type: 'routine' | 'goal', title: string, subtitle: string, icon: any } | null>(null);

  useEffect(() => {
    const checkTriggers = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Check routines (within 30 mins window)
      const currentRoutine = routines.find(r => {
        if (!r.time || typeof r.time !== 'string' || !r.time.includes(':')) return false;
        const [hour, min] = r.time.split(':').map(Number);
        if (isNaN(hour) || isNaN(min)) return false;
        const rMinutes = hour * 60 + min;
        return Math.abs(currentMinutes - rMinutes) < 30;
      });

      if (currentRoutine) {
        setActiveTrigger({
          type: 'routine',
          title: currentRoutine.title,
          subtitle: currentRoutine.trigger ? `Trigger: ${currentRoutine.trigger}` : 'Active Scheduled Habit',
          icon: Zap
        });
        return;
      }

      // If no routine, check for "at risk" goals (simple logic for demo - in progress goals)
      const pendingGoal = goals.find(g => g.status === 'in-progress');
      if (pendingGoal) {
        setActiveTrigger({
          type: 'goal',
          title: pendingGoal.title,
          subtitle: `Domain Objective: ${pendingGoal.category}`,
          icon: Target
        });
        return;
      }

      // Default motivational trigger
      setActiveTrigger({
        type: 'goal',
        title: "PUSH BEYOND COMFORT",
        subtitle: "The 1% mindset requires constant pressure.",
        icon: Brain
      });
    };

    checkTriggers();
    const interval = setInterval(checkTriggers, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [routines, goals]);

  if (!activeTrigger) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-fuchsia-400">Current_Trigger</p>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight uppercase text-white">Active Focus</h3>
        </div>
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/20" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTrigger.title}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="glass-card p-4 sm:p-6 border-white/5 relative group overflow-hidden bg-white/[0.02] rounded-2xl sm:rounded-3xl"
        >
          <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
            <activeTrigger.icon className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            <div className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border",
              activeTrigger.type === 'routine' ? "bg-cyan-400/10 border-cyan-400 text-cyan-400" : "bg-fuchsia-400/10 border-fuchsia-400 text-fuchsia-400"
            )}>
              <activeTrigger.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black italic tracking-tighter uppercase leading-none text-white">{activeTrigger.title}</h4>
              <p className="text-[7px] sm:text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">{activeTrigger.subtitle}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[6px] sm:text-[7px] font-bold text-white/40 uppercase tracking-widest leading-none">Real-Time Sync Active</span>
            </div>
            <div className="text-[6px] sm:text-[7px] font-bold text-white/20 uppercase tracking-widest italic leading-none">
              LEVEL1X // TRGR_00{Math.floor(Math.random() * 9)}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
