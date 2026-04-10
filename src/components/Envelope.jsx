import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Laugh, Frown } from 'lucide-react';

export default function Envelope({ confession }) {
  const [isOpen, setIsOpen] = useState(false);

  // Exact shades per your request: 
  // top (thickest/darkest), sides (lightest), bottom (medium), inside (very dark to contrast letter)
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
            : 'relative mx-auto w-40 h-28 z-10 hover:scale-105'
        }`}
      >
        {/* Envelope Backing (Inside) */}
<div className="absolute inset-0 rounded-md shadow-xl" style={{ backgroundColor: theme.inside }}>          
          {/* The Letter */}
          <motion.div
            className="absolute left-[5%] right-[5%] bg-white rounded-md shadow-inner p-4 flex flex-col justify-between overflow-hidden border border-slate-200"
            animate={{ 
              height: isOpen ? '170%' : '90%', 
              y: isOpen ? -110 : 10,
              zIndex: isOpen ? 20 : 0
            }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
          >
            <div className="text-center">
              <h3 className="font-serif font-extrabold text-slate-900 text-lg border-b-2 border-slate-100 pb-2 mb-3">
                {confession.nickname}
              </h3>
              <p className="font-serif text-slate-700 text-sm leading-relaxed overflow-y-auto max-h-[160px] scrollbar-hide text-left">
                {isOpen ? confession.text : "..."}
              </p>
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                  className="flex justify-around items-center pt-3 mt-2 border-t border-slate-100"
                >
                  <button className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors">
                    <Heart size={18} /> <span className="text-xs font-bold">{confession.hearts}</span>
                  </button>
                  <button className="flex items-center gap-1 text-slate-400 hover:text-amber-500 transition-colors">
                    <Laugh size={18} /> <span className="text-xs font-bold">{confession.laughs}</span>
                  </button>
                  <button className="flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors">
                    <Frown size={18} /> <span className="text-xs font-bold">{confession.tears}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Left Flap */}
          <div 
            className="absolute top-0 left-0 w-full h-full z-10"
            style={{ backgroundColor: theme.sides, clipPath: 'polygon(0 0, 50% 50%, 0 100%)' }}
          ></div>
          
          {/* Right Flap */}
          <div 
            className="absolute top-0 left-0 w-full h-full z-10"
            style={{ backgroundColor: theme.sides, clipPath: 'polygon(100% 0, 50% 50%, 100% 100%)' }}
          ></div>

          {/* Bottom Flap (Overlaps sides slightly) */}
          <div 
            className="absolute top-0 left-0 w-full h-full z-15 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]"
            style={{ backgroundColor: theme.bottom, clipPath: 'polygon(0 100%, 50% 55%, 100% 100%)' }}
          ></div>

          {/* Top Flap (Animated, overlaps everything when closed) */}
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