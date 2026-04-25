import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from './types';
import Dashboard from './components/Dashboard';
import Questionnaire from './components/Questionnaire';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Loader2, Sparkles, Zap, Shield, Activity, Bell } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !db) {
      setError("CONFIGURATION ERROR: FIREBASE NOT INITIALIZED. PLEASE CHECK YOUR ENVIRONMENT VARIABLES.");
      setLoading(false);
      return;
    }

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        
        // Listen for real-time updates to the profile
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              userId: u.uid,
              displayName: u.displayName || 'Champion',
              email: u.email || '',
              completedAssessment: false,
              createdAt: new Date().toISOString(),
              streaks: {}
            };
            setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async () => {
    if (loggingIn || !auth) return;
    setLoggingIn(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/popup-blocked') {
        setError('POPUP BLOCKED: PLEASE ENABLE POPUPS');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('LOGIN CANCELLED');
      } else {
        setError('SYSTEM ERROR: LOGIN FAILED');
      }
    } finally {
      setLoggingIn(false);
    }
  };
  const logout = () => auth && signOut(auth);

  const quotes = [
    "YOUR ONLY LIMIT IS THE ONE YOU SET.",
    "AMATEURS COMPETE. PROFESSIONALS DOMINATE.",
    "SUCCESS IS NOT A DESTINATION, IT'S A TRANSFORMATION.",
    "THE 1% AREN'T BORN. THEY ARE BUILT.",
    "FOCUS ON THE PROGRESS, NOT THE PAIN.",
    "DISCIPLINE IS THE BRIDGE BETWEEN GOALS AND ACCOMPLISHMENT."
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-100/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-100/5 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.8em] text-white/20">Loading your profile</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="blob w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-fuchsia-600/20 top-[-10%] left-[-10%] animate-[pulse_8s_infinite] scale-150" />
        <div className="blob w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] bg-cyan-600/20 bottom-[-5%] right-[-5%] animate-[pulse_12s_infinite] scale-125" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 sm:space-y-12 max-w-4xl relative z-10 w-full"
        >
          <div className="flex justify-center">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="glass-card p-6 sm:p-8 bg-white/5 border-white/20 shadow-[0_0_60px_rgba(34,211,238,0.2)] rounded-[24px] sm:rounded-[32px]"
            >
              <Sparkles className="w-10 h-10 sm:w-16 sm:h-16 text-amber-400" />
            </motion.div>
          </div>
          
          <div className="space-y-4 px-2">
            <h1 className="italic bg-gradient-to-br from-white via-white to-white/30 bg-clip-text text-transparent px-2">
              LEVEL1X
            </h1>
            <div className="h-20 sm:h-24 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="glass-card px-4 sm:px-8 py-3 sm:py-4 bg-white/5 border-white/10 flex items-center gap-3 sm:gap-4 shadow-xl rounded-2xl"
                >
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 animate-bounce shrink-0" />
                  <p className="text-white font-bold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-[9px] sm:text-xs">
                    {quotes[currentQuoteIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-sm sm:text-xl md:text-2xl text-white/50 font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase">
              Upgrade Your Hardware. <br className="sm:hidden" /> <span className="text-white/80">Reach Top 1%.</span>
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8 px-4">
            <button 
              onClick={login}
              disabled={loggingIn}
              className="group relative inline-flex items-center justify-center gap-4 sm:gap-6 bg-white text-zinc-950 px-8 sm:px-16 py-6 sm:py-8 rounded-[20px] sm:rounded-[24px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs hover:bg-cyan-400 hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transition-all active:scale-95 disabled:opacity-50 w-full sm:w-auto"
            >
              <div className="absolute -inset-1 bg-cyan-400 opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-[21px] sm:rounded-[25px]" />
              {loggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 relative z-10" />
              )}
              <span className="relative z-10 whitespace-nowrap">{loggingIn ? 'LOGGING IN...' : 'START ASCENSION'}</span>
            </button>
            
            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-fuchsia-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="pt-8 sm:pt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-white/10 opacity-40">
            {[
              { label: 'Growth Efficiency', value: 'OPTIMAL', icon: Activity },
              { label: 'Growth Nodes', value: 'ONLINE', icon: Zap },
              { label: 'System Security', value: 'ENCRYPTED', icon: Shield },
            ].map((node, i) => (
              <div key={i} className="flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-3">
                <node.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <div className="space-y-1 text-left sm:text-center">
                  <p className="text-[7px] sm:text-[8px] font-bold tracking-[0.1em] sm:tracking-[0.15em] opacity-60 uppercase">{node.label}</p>
                  <p className="text-[9px] sm:text-[10px] font-black tracking-[0.1em] sm:tracking-[0.2em] text-white/80">{node.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30 relative overflow-x-hidden">
      {/* Persistent Background Elements */}
      <div className="blob w-[300px] h-[300px] sm:w-[800px] sm:h-[800px] bg-cyan-600/10 top-[-10%] left-[-10%] scale-150" />
      <div className="blob w-[250px] h-[250px] sm:w-[600px] sm:h-[600px] bg-fuchsia-600/10 bottom-[-5%] right-[-5%] scale-150" />
      
      <nav className="border-b border-white/10 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 flex justify-between items-center bg-zinc-950/40 backdrop-blur-3xl sticky top-0 z-[100]">
        <div className="flex items-center gap-3 sm:gap-8">
          <div className="p-2 sm:p-3 glass-card bg-white/5 border-white/10 rounded-xl">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="font-black tracking-tighter text-xl sm:text-3xl uppercase italic leading-none">
              LEVEL<span className="text-white/40 font-bold">1X</span>
            </h1>
            <p className="text-[6px] sm:text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-0.5 sm:mt-1">level up daily</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-12">
          {profile && (
            <div className="flex gap-4 sm:gap-8">
              <div className="text-right hidden sm:block space-y-1">
                <p className="text-[8px] uppercase tracking-[0.2em] font-bold text-white/30">Overall Rank</p>
                <p className="text-lg sm:text-2xl font-black text-cyan-400 italic uppercase tracking-tighter">Top 1%</p>
              </div>
              <div className="text-right space-y-1 sm:space-y-1">
                <p className="text-[7px] sm:text-[8px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold text-white/30">Daily Streak</p>
                <p className="text-sm sm:text-2xl font-black text-fuchsia-400 italic uppercase tracking-tighter">12 DAYS</p>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="p-3 sm:p-4 glass-card bg-white/5 border-white/10 hover:border-white/30 text-white/40 hover:text-white transition-all group rounded-xl"
            title="Log Out"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-12 relative z-10 pb-24 sm:pb-12">
        <AnimatePresence mode="wait">
          {!profile?.completedAssessment ? (
            <Questionnaire key="survey" onComplete={() => setProfile(p => p ? {...p, completedAssessment: true} : null)} />
          ) : (
            <Dashboard key="dashboard" profile={profile} />
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-7xl mx-auto px-6 sm:px-16 py-12 sm:py-20 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-10 border-t border-white/5 opacity-20 relative z-10 mb-20 sm:mb-0">
        <div className="flex gap-8 sm:gap-12">
          <span className="text-[8px] sm:text-[9px] font-bold text-cyan-400 uppercase tracking-[0.4em] sm:tracking-[0.6em] flex items-center gap-2 sm:gap-3">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse" />
            System Live
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] sm:tracking-[0.4em]">442 Nodes</span>
        </div>
        <div className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-[0.4em] sm:tracking-[0.6em] italic text-center">
          "AMATEURS COMPETE. PROFESSIONALS DOMINATE."
        </div>
      </footer>
    </div>

  );
}
