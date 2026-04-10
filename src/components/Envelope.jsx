import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Laugh, Frown, Flag, Trash2 } from 'lucide-react';
import { supabase } from '../supabase';

// Pass the new onDeleteOptimistically prop here
export default function Envelope({ confession, isAdmin, onDeleteOptimistically }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasReported, setHasReported] = useState(() => localStorage.getItem(`report_${confession.id}`) === 'true');
  
  // Reaction State
  const [localCounts, setLocalCounts] = useState({
    hearts: confession.hearts || 0,
    laughs: confession.laughs || 0,
    tears: confession.tears || 0,
  });
  const [userReaction, setUserReaction] = useState(() => localStorage.getItem(`reaction_${confession.id}`));

  // Keep local counts synced if someone else reacts in real-time
  useEffect(() => {
    setLocalCounts({
      hearts: confession.hearts || 0,
      laughs: confession.laughs || 0,
      tears: confession.tears || 0,
    });
  }, [confession.hearts, confession.laughs, confession.tears]);

  const handleReaction = async (e, type) => {
    e.stopPropagation(); // Prevents the envelope from closing when clicking a reaction

    let newCounts = { ...localCounts };
    let newReaction = null;

    if (userReaction === type) {
      newCounts[type] = Math.max(0, newCounts[type] - 1);
      localStorage.removeItem(`reaction_${confession.id}`);
    } else {
      if (userReaction) {
        newCounts[userReaction] = Math.max(0, newCounts[userReaction] - 1);
      }
      newCounts[type] += 1;
      newReaction = type;
      localStorage.setItem(`reaction_${confession.id}`, type);
    }

    setLocalCounts(newCounts);
    setUserReaction(newReaction);

    const { error } = await supabase
      .from('confessions')
      .update({
        hearts: newCounts.hearts,
        laughs: newCounts.laughs,
        tears: newCounts.tears
      })
      .eq('id', confession.id);

    if (error) console.error("Reaction Error:", error);
  };

  const handleReport = async (e) => {
    e.stopPropagation();
    if (hasReported) return;

    setHasReported(true);
    localStorage.setItem(`report_${confession.id}`, 'true');

    // Increment report in DB silently
    const newReports = (confession.reports || 0) + 1;
    await supabase.from('confessions').update({ reports: newReports }).eq('id', confession.id);
    
    alert("Post flagged for review.");
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("ADMIN: Are you sure you want to delete this confession permanently?");
    if (confirmDelete) {
      setIsOpen(false); // Close envelope instantly
      
      // OPTIMISTIC DELETE: Vanish from screen immediately!
      if (onDeleteOptimistically) {
        onDeleteOptimistically(confession.id);
      }

      // BACKGROUND SYNC: Delete from DB
      await supabase.from('confessions').delete().eq('id', confession.id);
    }
  };

  const themes = {
    'Crush': { top: '#881337', bottom: '#be123c', sides: '#e11d48', inside: '#4c0519' },
    'Academic': { top: '#0f172a', bottom: '#334155', sides: '#475569', inside: '#020617' },
    'Hostel Life': { top: '#78350f', bottom: '#b45309', sides: '#d97706', inside: '#451a03' },
    'Regrets': { top: '#4c1d95', bottom: '#6d28d9', sides: '#8b5cf6', inside: '#2e1065' },
    'Faculty': { top: '#134e4a', bottom: '#0f766e', sides: '#14b8a6', inside: '#042f2e' },
  };

  const theme = themes[confession.tag] || themes['Crush'];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer perspective-1000 transition-all duration-300 ${
          isOpen 
            ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[360px] h-[240px] z-[70]' 
            : 'relative mx-auto w-40 h-28 hover:scale-105'
        }`}
      >
        <div className="absolute inset-0 rounded-md shadow-xl" style={{ backgroundColor: theme.inside }}>
          
          {/* The Letter */}
          {/* The Letter */}
          <motion.div
            className="absolute left-[5%] right-[5%] bg-white rounded-md shadow-inner p-4 flex flex-col border border-slate-200"
            animate={{ 
              height: isOpen ? '170%' : '90%', 
              y: isOpen ? -110 : 10,
              zIndex: isOpen ? 20 : 0
            }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
          >
            {/* ADMIN DELETE BUTTON */}
            {isAdmin && isOpen && (
              <button 
                onClick={handleDelete}
                className="absolute top-2 right-2 text-rose-500 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors shadow-sm z-50"
                title="Delete Post permanently"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Header / Name (shrink-0 keeps it locked at the top) */}
            <h3 className="font-serif font-extrabold text-slate-900 text-lg border-b-2 border-slate-100 pb-2 mb-2 px-8 text-center shrink-0">
              {confession.nickname}
            </h3>

            {/* The Message Body (flex-1 dynamically fills all the empty white space) */}
            <div className="relative flex-1 min-h-0 overflow-hidden mb-1">
              <p 
                className="font-serif text-slate-700 text-sm leading-relaxed overflow-y-auto h-full pb-8 pr-2 text-left"
                style={{
                  // Adds a sleek, modern custom scrollbar
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 transparent'
                }}
              >
                {isOpen ? confession.text : "..."}
              </p>

              {/* Premium Fade-Out Gradient indicating more text below */}
              {isOpen && (
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              )}
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="flex justify-between items-center pt-3 border-t border-slate-100 shrink-0"
                >
                  {/* Reactions Container */}
                  <div className="flex gap-4">
                    <button 
                      onClick={(e) => handleReaction(e, 'hearts')}
                      className={`flex items-center gap-1 transition-all duration-200 ${userReaction === 'hearts' ? 'text-rose-500 scale-110 drop-shadow-sm' : 'text-slate-400 hover:text-rose-400'}`}
                    >
                      <Heart size={18} fill={userReaction === 'hearts' ? 'currentColor' : 'none'} strokeWidth={2} /> 
                      <span className="text-xs font-bold">{localCounts.hearts}</span>
                    </button>

                    <button 
                      onClick={(e) => handleReaction(e, 'laughs')}
                      className={`flex items-center gap-1 transition-all duration-200 ${userReaction === 'laughs' ? 'text-amber-500 scale-110 drop-shadow-sm' : 'text-slate-400 hover:text-amber-400'}`}
                    >
                      <Laugh size={18} strokeWidth={userReaction === 'laughs' ? 2.5 : 2} /> 
                      <span className="text-xs font-bold">{localCounts.laughs}</span>
                    </button>

                    <button 
                      onClick={(e) => handleReaction(e, 'tears')}
                      className={`flex items-center gap-1 transition-all duration-200 ${userReaction === 'tears' ? 'text-blue-500 scale-110 drop-shadow-sm' : 'text-slate-400 hover:text-blue-400'}`}
                    >
                      <Frown size={18} strokeWidth={userReaction === 'tears' ? 2.5 : 2} /> 
                      <span className="text-xs font-bold">{localCounts.tears}</span>
                    </button>
                  </div>

                  {/* REPORT BUTTON */}
                  <button 
                    onClick={handleReport}
                    title="Report this post"
                    className={`flex items-center transition-colors ${hasReported ? 'text-red-400 cursor-not-allowed' : 'text-slate-300 hover:text-red-500'}`}
                  >
                    <Flag size={16} fill={hasReported ? 'currentColor' : 'none'} />
                    {isAdmin && confession.reports > 0 && (
                      <span className="text-[10px] ml-1 text-red-500 font-bold">({confession.reports})</span>
                    )}
                  </button>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Envelope Flaps */}
          <div className="absolute top-0 left-0 w-full h-full z-10" style={{ backgroundColor: theme.sides, clipPath: 'polygon(0 0, 50% 50%, 0 100%)' }}></div>
          <div className="absolute top-0 left-0 w-full h-full z-10" style={{ backgroundColor: theme.sides, clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)' }}></div>
          <div className="absolute top-0 left-0 w-full h-full z-15 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]" style={{ backgroundColor: theme.bottom, clipPath: 'polygon(0 100%, 50% 55%, 100% 100%)' }}></div>
          <motion.div
            className="origin-top absolute top-0 left-0 w-full h-full z-30 drop-shadow-xl"
            style={{ backgroundColor: theme.top, clipPath: 'polygon(0 0, 100% 0, 50% 50%)' }}
            animate={{ rotateX: isOpen ? 180 : 0, zIndex: isOpen ? 0 : 30 }}
            transition={{ duration: 0.6, type: 'spring' }}
          ></motion.div>
        </div>
      </motion.div>
    </>
  );
}