import React, { useState } from 'react';
import { ASSESSMENT_QUESTIONS } from '../constants/questions';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { generateRecommendedRoutine } from '../services/aiService';
import { cn } from '../lib/utils';
import { AssessmentResponse } from '../types';

interface QuestionnaireProps {
  onComplete: () => void;
}

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = ASSESSMENT_QUESTIONS[step];
  const progress = ((step + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  const handleNext = async () => {
    if (step < ASSESSMENT_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    try {
      const timestamp = new Date().toISOString();
      const assessmentId = Date.now().toString();
      const assessmentRef = doc(db, 'users', auth.currentUser.uid, 'assessments', assessmentId);
      
      const assessmentData: AssessmentResponse = {
        userId: auth.currentUser.uid,
        answers,
        timestamp: timestamp,
        rawScore: Object.keys(answers).length
      };

      await setDoc(assessmentRef, assessmentData);

      // Generate suggested routine
      const suggestedItems = await generateRecommendedRoutine(assessmentData);
      
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      const routinesRef = collection(db, 'users', auth.currentUser.uid, 'routines');
      
      for (const item of suggestedItems) {
        const newRoutineRef = doc(routinesRef);
        batch.set(newRoutineRef, {
          userId: auth.currentUser.uid,
          title: item.title,
          time: item.time,
          trigger: item.trigger,
          order: 0,
          completedTodayIndex: "",
          createdAt: timestamp
        });
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      batch.update(userRef, {
        completedAssessment: true,
        vision3Year: answers['vision3Year'] || '',
        targetIncome: answers['targetIncome']?.toString() || '0',
        dreamCareer: answers['dreamCareer'] || '',
        fitnessGoal: answers['fitnessGoal'] || ''
      });

      await batch.commit();

      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 sm:py-20 min-h-[100dvh] sm:min-h-[85vh] flex flex-col justify-center relative px-2">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="mb-10 sm:mb-20 space-y-4 sm:space-y-6 relative z-10 px-4 sm:px-10">
        <div className="flex justify-between items-end mb-2">
          <div className="space-y-1">
            <p className="text-[8px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-[0.4em] sm:tracking-[0.6em]">NODE_INITIALIZATION</p>
            <p className="text-[6px] sm:text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] sm:tracking-[0.4em]">PROTOCOL_V4.X</p>
          </div>
          <span className="text-2xl sm:text-4xl font-black text-white italic tabular-nums tracking-tighter">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 sm:h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
          className="glass-card p-6 sm:p-16 lg:p-24 relative z-10 overflow-hidden rounded-[24px] sm:rounded-[32px]"
        >
          {isSubmitting ? (
            <div className="py-12 sm:py-20 flex flex-col items-center justify-center space-y-6 sm:space-y-8">
              <div className="w-12 h-12 sm:w-20 sm:h-20 border-t-2 border-cyan-400 rounded-full animate-spin" />
              <p className="text-white/40 font-bold uppercase tracking-widest text-[9px] sm:text-xs">CONFIGURING_ROUTINE_PROTOCOLS...</p>
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-16">
              <div className="space-y-6 sm:space-y-8">
                <span className="text-[8px] sm:text-[9px] font-bold px-3 py-1 sm:px-4 sm:py-1.5 bg-white/5 text-fuchsia-400 rounded-full uppercase tracking-[0.3em] sm:tracking-[0.4em] border border-fuchsia-400/20 w-fit block">
                  {currentQuestion.category}
                </span>
                <h3 className="leading-[1] italic text-white">
                  {currentQuestion.text}
                </h3>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {currentQuestion.type === 'select' && (
                  <div className={cn(
                    "grid gap-3 sm:gap-4",
                    currentQuestion.options && currentQuestion.options.length > 5 
                      ? "grid-cols-2 sm:grid-cols-5" 
                      : "grid-cols-1"
                  )}>
                    {currentQuestion.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setAnswers({ ...answers, [currentQuestion.id]: option });
                          handleNext();
                        }}
                        className={cn(
                          "w-full text-left p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[24px] border transition-all flex justify-between items-center group relative overflow-hidden min-h-[56px]",
                          answers[currentQuestion.id] === option 
                            ? "bg-white text-zinc-950 border-white shadow-lg scale-[1.02]" 
                            : "bg-white/5 border-white/10 hover:border-cyan-400/50 text-white/40 hover:text-white",
                          currentQuestion.options && currentQuestion.options.length > 5 && "flex-col items-center justify-center p-3 sm:p-4 text-center"
                        )}
                      >
                        <div className="absolute inset-y-0 left-0 w-1 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className={cn(
                          "text-lg sm:text-2xl font-bold uppercase tracking-tight relative z-10",
                          currentQuestion.options && currentQuestion.options.length > 5 && "text-sm sm:text-lg lg:text-xl"
                        )}>{option}</span>
                        {(!currentQuestion.options || currentQuestion.options.length <= 5) && (
                          <ChevronRight className={cn("w-5 h-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2 relative z-10", answers[currentQuestion.id] === option && "opacity-100 text-zinc-950")} />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'boolean' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                    {[true, false].map((val) => (
                      <button
                        key={String(val)}
                        onClick={() => {
                          setAnswers({ ...answers, [currentQuestion.id]: val });
                          handleNext();
                        }}
                        className={cn(
                          "p-8 sm:p-16 rounded-2xl sm:rounded-[32px] border-2 text-center transition-all group relative overflow-hidden min-h-[80px]",
                          answers[currentQuestion.id] === val 
                            ? "border-cyan-400 bg-cyan-400 text-zinc-950 shadow-xl" 
                            : "border-white/10 bg-white/5 hover:border-white/30 text-white/20 hover:text-white"
                        )}
                      >
                        <span className="text-2xl sm:text-4xl font-black uppercase tracking-tighter group-hover:scale-105 transition-transform block relative z-10">{val ? "YES" : "NO"}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'number' && (
                  <div className="space-y-8 sm:space-y-12">
                    <div className="relative">
                      <input
                        type="number"
                        autoFocus
                        placeholder="0"
                        className="w-full text-5xl sm:text-[8rem] font-black bg-transparent border-b-2 border-white/10 focus:border-cyan-400 outline-none py-4 sm:py-8 text-white tracking-tighter transition-all placeholder:text-white/5 tabular-nums min-h-[64px]"
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: Number(e.target.value) })}
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.value.length > 5) target.value = target.value.slice(0, 5);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      />
                      <div className="absolute bottom-2 sm:bottom-4 right-0 text-[7px] sm:text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] sm:tracking-[0.5em]">SYSTEM_WAITING...</div>
                    </div>
                    <button
                      onClick={handleNext}
                      className="bg-white text-zinc-950 px-8 sm:px-16 py-4 sm:py-6 rounded-xl sm:rounded-[24px] font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.6em] hover:bg-cyan-400 shadow-xl transition-all flex items-center justify-center gap-4 sm:gap-6 w-full sm:w-fit min-h-[56px]"
                    >
                      EXECUTE <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <div className="space-y-8 sm:space-y-12">
                    <div className="relative">
                      <textarea
                        autoFocus
                        placeholder="Type your answer here..."
                        className="w-full text-xl sm:text-4xl lg:text-5xl font-bold bg-transparent border-b-2 border-white/10 focus:border-cyan-400 outline-none py-4 sm:py-8 text-white tracking-tight transition-all placeholder:text-white/5 min-h-[150px] sm:min-h-[200px] resize-none"
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
                      />
                      <div className="absolute bottom-2 sm:bottom-4 right-0 text-[7px] sm:text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] sm:tracking-[0.5em]">PRESS_ENTER_TO_COMMIT</div>
                    </div>
                    <button
                      onClick={handleNext}
                      className="bg-white text-zinc-950 px-8 sm:px-16 py-4 sm:py-6 rounded-xl sm:rounded-[24px] font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.6em] hover:bg-cyan-400 shadow-xl transition-all flex items-center justify-center gap-4 sm:gap-6 w-full sm:w-fit min-h-[56px]"
                    >
                      EXECUTE <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 sm:mt-16 flex justify-between items-center px-6 sm:px-10 relative z-20">
        <button 
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 sm:gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all uppercase font-bold text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.4em] italic group min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> PREV
        </button>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-[7px] sm:text-[9px] tracking-[0.4em] sm:tracking-[0.6em] text-white/20 uppercase">UPLINK_STABLE</span>
        </div>
      </div>
    </div>
  );
}
