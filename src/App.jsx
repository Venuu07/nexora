import { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from './supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Hash } from 'lucide-react';
import Envelope from './components/Envelope';
import ConfessModal from './components/ConfessModal';

export default function App() {
  const [confessions, setConfessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  
  // ADMIN STATE
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const clickTimer = useRef(null);
  const clickCount = useRef(0);

  const tags = ['All', 'Crush', 'Academic', 'Hostel Life', 'Regrets', 'Faculty'];

  useEffect(() => {
    fetchConfessions();
    const channel = supabase.channel('realtime-confessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'confessions' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setConfessions((prev) => {
            if (prev.some(c => c.text === payload.new.text)) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setConfessions((prev) => prev.filter(c => c.id !== payload.old.id));
        }
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchConfessions = async () => {
    const { data } = await supabase.from('confessions').select('*').order('created_at', { ascending: false });
    if (data) setConfessions(data);
  };

  const handleOptimisticAdd = (newConfession) => {
    setConfessions((prev) => [newConfession, ...prev]);
  };

  // The Secret Knock Logic
  const handleSecretKnock = () => {
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    
    if (clickCount.current >= 5) {
      if (!isAdmin) {
        const pass = prompt("Enter Admin Passcode:");
        if (pass === "B20BOSS") { // YOUR SECRET PASSCODE
          localStorage.setItem('isAdmin', 'true');
          setIsAdmin(true);
          alert("God Mode Activated. You can now delete posts.");
        } else {
          alert("Incorrect passcode.");
        }
      } else {
        const logout = confirm("Deactivate God Mode?");
        if (logout) {
          localStorage.removeItem('isAdmin');
          setIsAdmin(false);
        }
      }
      clickCount.current = 0;
    } else {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
      }, 1000); // Must tap 5 times within 1 second
    }
  };

  const displayedConfessions = useMemo(() => {
    let filtered = confessions;
    if (activeTag !== 'All') {
      filtered = filtered.filter(c => c.tag === activeTag);
    }
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [confessions, activeTag]);

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans flex flex-col">
      <div className="grid-background"></div>

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto p-4 grid grid-cols-3 items-center gap-2">
          
          <div className="justify-self-start">
            <span className="font-['Anton'] text-xl md:text-3xl tracking-widest text-foreground drop-shadow-md uppercase">
              Confessout
            </span>
          </div>

          <div className="justify-self-center text-center cursor-pointer select-none" onClick={handleSecretKnock}>
            <h1 className="text-2xl md:text-4xl font-['Montserrat'] font-black tracking-[0.15em] text-black drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              NEXORA <span className="text-zinc-800">2K26</span>
            </h1>
            <p className="text-[9px] md:text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">
              The Final Send-off {isAdmin && " 🛡️"}
            </p>
          </div>

          <div className="justify-self-end">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-foreground text-background px-3 py-2 md:px-5 md:py-2.5 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2 text-sm shadow-lg"
            >
              <PenLine size={16} /> <span className="hidden md:inline">Confess</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-center border-t border-border/50">
          <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-hide justify-start md:justify-center">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  activeTag === tag 
                    ? 'border-zinc-800 bg-zinc-800/10 text-zinc-900' 
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {tag === 'All' ? <Hash size={12} className="inline mr-1" /> : ''}{tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto p-4 md:p-8 pt-8 relative w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12">
          <AnimatePresence>
            {displayedConfessions.map((confession) => (
              <Envelope key={confession.id} confession={confession} isAdmin={isAdmin} />
            ))}
          </AnimatePresence>
        </div>
        
        {displayedConfessions.length === 0 && (
          <div className="text-center mt-32 text-muted-foreground">
            <p className="text-xl">No secrets found here.</p>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-border/50 bg-background/50 backdrop-blur-md mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center items-center">
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            Made with <span className="text-rose-500 animate-pulse inline-block mx-1">❤︎</span> by B21
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {isModalOpen && <ConfessModal onClose={() => setIsModalOpen(false)} addConfessionOptimistically={handleOptimisticAdd} />}
      </AnimatePresence>
    </div>
  );
}