import { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Hash } from 'lucide-react';
import Envelope from './components/Envelope';
import ConfessModal from './components/ConfessModal';

export default function App() {
  const [confessions, setConfessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTag, setActiveTag] = useState('All');

  const tags = ['All', 'Crush', 'Academic', 'Hostel Life', 'Regrets', 'Faculty'];

  useEffect(() => {
    fetchConfessions();
    const channel = supabase.channel('realtime-confessions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'confessions' }, (payload) => {
        setConfessions((prev) => {
          if (prev.some(c => c.text === payload.new.text)) return prev;
          return [payload.new, ...prev];
        });
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
          
          {/* Left: Confessout Brand */}
          <div className="justify-self-start">
            <span className="font-['Anton'] text-xl md:text-3xl tracking-widest text-foreground drop-shadow-md uppercase">
              Confessout
            </span>
          </div>

          {/* Center: NEXORA 2K26 */}
          <div className="justify-self-center text-center">
            {/* Premium Black Font with a subtle white glow for contrast against the dark background */}
            <h1 className="text-2xl md:text-4xl font-['Montserrat'] font-black tracking-[0.15em] text-black drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
              NEXORA <span className="text-zinc-800">2K26</span>
            </h1>
            <p className="text-[9px] md:text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">
              The Final Send-off
            </p>
          </div>

          {/* Right: Confess Button */}
          <div className="justify-self-end">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-foreground text-background px-3 py-2 md:px-5 md:py-2.5 rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2 text-sm shadow-lg"
            >
              <PenLine size={16} /> <span className="hidden md:inline">Confess</span>
            </button>
          </div>
        </div>

        {/* Tag Filters */}
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-center border-t border-border/50">
          <div className="flex gap-2 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-hide justify-start md:justify-center">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  activeTag === tag 
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' 
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {tag === 'All' ? <Hash size={12} className="inline mr-1" /> : ''}{tag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Wall */}
      <main className="flex-grow max-w-7xl mx-auto p-4 md:p-8 pt-8 relative z-10 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-12">
          <AnimatePresence>
            {displayedConfessions.map((confession) => (
              <Envelope key={confession.id} confession={confession} />
            ))}
          </AnimatePresence>
        </div>
        
        {displayedConfessions.length === 0 && (
          <div className="text-center mt-32 text-muted-foreground">
            <p className="text-xl">No secrets found here.</p>
          </div>
        )}
      </main>

      {/* Clean, Centered Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-background/50 backdrop-blur-md mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center items-center">
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            Made with <span className="text-rose-500 animate-pulse inline-block mx-1">❤︎</span> by B21
          </p>
        </div>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && <ConfessModal onClose={() => setIsModalOpen(false)} addConfessionOptimistically={handleOptimisticAdd} />}
      </AnimatePresence>
    </div>
  );
}