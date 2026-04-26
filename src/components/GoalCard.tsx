import React, { useState, memo } from 'react';
import { Goal } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CheckCircle2, Trash2, Camera, Clock, Target, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GoalCardProps {
  goal: Goal;
}

const GoalCard = memo(({ goal }: GoalCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [desc, setDesc] = useState(goal.description);

  const updateGoal = async (data: Partial<Goal>) => {
    if (!auth.currentUser) return;
    await updateDoc(doc(db, 'users', auth.currentUser.uid, 'goals', goal.id), data);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group glass-card p-6 sm:p-10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-2 sm:gap-4 z-20">
        <button onClick={() => setIsEditing(!isEditing)} className="p-3 bg-white/5 text-white/50 rounded-2xl hover:bg-white hover:text-zinc-950 transition-all border border-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button onClick={() => deleteDoc(doc(db, 'users', auth.currentUser!.uid, 'goals', goal.id))} className="p-3 bg-red-400/10 text-red-400 rounded-2xl hover:bg-red-400 hover:text-white transition-all border border-red-400/20 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="space-y-6 sm:space-y-10">
        <div className="flex justify-between items-start">
          <div className="bg-white/5 px-4 py-1.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/30 border border-white/10">
            {goal.status}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 sm:space-y-6">
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full text-2xl sm:text-4xl font-black uppercase tracking-tighter bg-transparent border-b border-white/20 focus:border-cyan-400 outline-none text-white py-2 sm:py-4 min-h-[48px]"
              onBlur={() => {setIsEditing(false); updateGoal({ title });}}
            />
            <textarea 
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full text-xs sm:text-sm text-white/40 bg-transparent border-b border-white/20 focus:border-cyan-400 outline-none resize-none pb-2 sm:pb-4 h-24 min-h-[80px]"
              onBlur={() => {setIsEditing(false); updateGoal({ description: desc });}}
            />
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter leading-[0.9] text-white italic">{goal.title}</h4>
            <p className="text-xs sm:text-sm text-white/40 line-clamp-3 sm:line-clamp-2 leading-relaxed tracking-wide font-medium">{goal.description}</p>
          </div>
        )}

        {goal.photoUrl && (
          <div className="w-full h-40 sm:h-48 rounded-2xl sm:rounded-[24px] overflow-hidden border border-white/10 group-hover:border-cyan-400/30 transition-all duration-500">
            <img src={goal.photoUrl} alt="Progress" className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/20 italic">Node_Integrity</span>
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 tabular-nums">{goal.progress}%</span>
          </div>
          <div className="h-1.5 sm:h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.02]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              className="h-full bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
          <button 
            onClick={() => updateGoal({ status: goal.status === 'completed' ? 'in-progress' : 'completed', progress: goal.status === 'completed' ? 0 : 100 })}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 sm:gap-4 py-4 sm:py-5 rounded-xl sm:rounded-[24px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] transition-all min-h-[56px]",
              goal.status === 'completed' 
                ? "bg-cyan-400 text-zinc-950 shadow-[0_0_30px_rgba(34,211,238,0.3)]" 
                : "bg-white/5 text-white/40 hover:bg-white hover:text-zinc-950 border border-white/10"
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {goal.status === 'completed' ? "Protocol_verified" : "Execute_Protocol"}
          </button>
          
          <label className="flex items-center justify-center p-4 sm:p-5 bg-white/5 text-white/40 rounded-xl sm:rounded-[24px] hover:bg-white hover:text-zinc-950 transition-all cursor-pointer border border-white/10 min-h-[56px] min-w-[56px]">
            <Camera className="w-5 h-5" />
            <input type="file" className="hidden" onChange={(e) => {
              if (e.target.files?.[0]) {
                const reader = new FileReader();
                reader.onload = (re => updateGoal({ photoUrl: re.target?.result as string }));
                reader.readAsDataURL(e.target.files[0]);
              }
            }} />
          </label>
        </div>
      </div>
    </motion.div>
  );
});

export default GoalCard;
