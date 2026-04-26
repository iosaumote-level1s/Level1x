import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Brain, Star } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, orderBy, doc, updateDoc, setDoc } from 'firebase/firestore';
import { conductDailyChat } from '../services/aiService';
import { ChatMessage, UserProfile } from '../types';
import { cn } from '../lib/utils';

const MessageItem = memo(({ message, onSaveWin }: { message: ChatMessage; onSaveWin: (text: string) => void }) => {
  const isUser = message.sender === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex gap-3 sm:gap-4 max-w-[92%] sm:max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <div className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border",
        isUser ? "bg-white text-zinc-950 border-white" : "bg-white/5 text-white/40 border-white/10"
      )}>
        {isUser ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Brain className="w-4 h-4 sm:w-5 sm:h-5" />}
      </div>
      <div className="space-y-2">
        <div className={cn(
          "p-4 sm:p-5 rounded-2xl sm:rounded-[24px] text-xs sm:text-sm font-medium leading-relaxed shadow-sm",
          isUser 
            ? "bg-white/10 text-white border border-white/20 rounded-tr-none" 
            : "bg-white text-zinc-950 rounded-tl-none font-semibold"
        )}>
          {message.text}
        </div>
        {isUser && (
          <button 
            onClick={() => onSaveWin(message.text)}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-400 text-zinc-950 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md min-h-[32px]"
          >
            <Star className="w-3 h-3 fill-zinc-950" /> Log as Today's Win
          </button>
        )}
      </div>
    </motion.div>
  );
});

export default function AIChat({ profile }: { profile: UserProfile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'chat'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || !auth.currentUser) return;

    setInput('');
    
    await addDoc(collection(db, 'users', auth.currentUser.uid, 'chat'), {
      userId: auth.currentUser.uid,
      text: trimmedInput,
      sender: 'user',
      timestamp: new Date().toISOString()
    });

    setIsTyping(true);
    try {
      const aiResponse = await conductDailyChat(messages, trimmedInput, profile);
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'chat'), {
        userId: auth.currentUser.uid,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, profile]);

  const saveWin = useCallback(async (winText: string) => {
    if (!auth.currentUser) return;
    const today = new Date().toISOString().split('T')[0];
    const logRef = doc(db, 'users', auth.currentUser.uid, 'logs', today);
    try {
      await updateDoc(logRef, { winOfDay: winText });
    } catch {
      await setDoc(logRef, {
        userId: auth.currentUser.uid,
        date: today,
        winOfDay: winText,
        sleepHours: 8,
        affirmationDone: false,
        meditationMinutes: 0,
        meals: [],
        learning: ""
      });
    }
  }, []);

  const renderedMessages = useMemo(() => messages.map((m) => (
    <MessageItem key={m.id} message={m} onSaveWin={saveWin} />
  )), [messages, saveWin]);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100dvh-180px)] sm:h-[700px] flex flex-col glass-card overflow-hidden shadow-2xl relative rounded-none sm:rounded-[40px] mb-20 sm:mb-0">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />
      
      {/* Header */}
      <div className="p-4 sm:p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-white text-zinc-950 rounded-xl sm:rounded-2xl shadow-lg">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight italic text-white leading-tight">Level1X System</h3>
            <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-cyan-400">Growth Sync Enabled</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[7px] sm:text-[8px] font-bold text-green-500 uppercase tracking-widest">Active</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 sm:space-y-6 scrollbar-none"
      >
        <AnimatePresence mode="popLayout text-zinc-100">
          {renderedMessages}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 sm:gap-4 mr-auto max-w-[80%]"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex gap-1.5 p-4 sm:p-5 bg-white/5 border border-white/10 rounded-2xl sm:rounded-[24px] rounded-tl-none">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-1 h-1 rounded-full bg-white/40"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 sm:p-8 border-t border-white/10 bg-white/[0.01]">
        <div className="relative group">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Share your progress..."
            className="w-full bg-zinc-950 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-4 sm:py-5 pr-14 sm:pr-16 outline-none focus:border-cyan-400/50 transition-all font-medium text-white placeholder:text-white/10 shadow-inner min-h-[56px] text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white text-zinc-950 rounded-lg sm:rounded-xl hover:bg-cyan-400 transition-all active:scale-90 min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
