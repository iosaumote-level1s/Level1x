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
        const [hour, min] = r.time.split(':').map(Number);
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
          <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-fuchsia-400">Current_Trigger</p>
          <h3 className="text-xl font-bold tracking-tight uppercase">Active Focus</h3>
        </div>
        <Bell className="w-4 h-4 text-white/20" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTrigger.title}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="glass-card p-6 border-white/5 relative group overflow-hidden bg-white/[0.02]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
            <activeTrigger.icon className="w-16 h-16" />
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
              activeTrigger.type === 'routine' ? "bg-cyan-400/10 border-cyan-400 text-cyan-400" : "bg-fuchsia-400/10 border-fuchsia-400 text-fuchsia-400"
            )}>
              <activeTrigger.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black italic tracking-tighter uppercase leading-none">{activeTrigger.title}</h4>
              <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">{activeTrigger.subtitle}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Real-Time Sync Active</span>
            </div>
            <div className="text-[7px] font-bold text-white/20 uppercase tracking-widest italic leading-none">
              LEVEL1X // TRIGGER_ID_00{Math.floor(Math.random() * 9)}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
