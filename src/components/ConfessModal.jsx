import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';
import { X, Send, Sparkles, ShieldAlert } from 'lucide-react';
import { generateFictionalName } from '../utils/names';

export default function ConfessModal({ onClose, addConfessionOptimistically }) {
  const [formData, setFormData] = useState({ text: '', tag: 'Crush' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const randomName = generateFictionalName();

    const newConfession = {
      nickname: randomName,
      text: formData.text,
      tag: formData.tag,
      hearts: 0, laughs: 0, tears: 0,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    // Instantly show on the wall
    addConfessionOptimistically(newConfession);
    onClose(); 

    // Send to database (No PIN anymore)
    const { error } = await supabase.from('confessions').insert([{
      nickname: randomName, 
      text: formData.text, 
      tag: formData.tag
    }]);

    if (error) console.error("Supabase Error:", error);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-background/90 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl w-full max-w-4xl shadow-2xl relative my-auto flex flex-col md:flex-row overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors bg-background/50 rounded-full p-1 md:bg-transparent">
          <X size={20} />
        </button>
        
        {/* LEFT COLUMN: Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles size={20} className="text-primary" /> Drop a Secret
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Your identity will be randomly assigned.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-foreground">
            <select 
              className="w-full bg-background border border-border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent cursor-pointer"
              onChange={(e) => setFormData({...formData, tag: e.target.value})}
            >
              <option value="Crush">💖 Crush</option>
              <option value="Academic">🏫 Academic</option>
              <option value="Hostel Life">🍕 Hostel Life</option>
              <option value="Regrets">🤐 Regrets</option>
              <option value="Faculty">👨‍🏫 Faculty</option>
            </select>

            <div>
              <textarea 
                required placeholder="Spill it here..." rows="6"
                className="w-full bg-background border border-border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none placeholder:text-muted-foreground"
                onChange={(e) => setFormData({...formData, text: e.target.value})}
              />
              <p className="text-[10px] text-muted-foreground opacity-70 mt-1.5 leading-tight">
                *Url addresses, email addresses, phone numbers, usernames and hashes are forbidden.
              </p>
            </div>

            <button 
              type="submit" disabled={isSubmitting}
              className="w-full bg-foreground text-background font-medium py-3 rounded-md hover:bg-muted-foreground transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Sealing...' : <><Send size={18} /> Seal & Post</>}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Rules */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-muted/30 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={18} className="text-destructive" />
            <h3 className="font-bold text-foreground">Rules of Posting</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5 marker:text-border">
            <li>Posts must be a confession.</li>
            <li>No hate speech.</li>
            <li>No doxxing.</li>
            <li>No child exploitation.</li>
            <li>No animal abuse.</li>
            <li>No crowdfunding, donations, or self-advertisement.</li>
            <li>No impersonation.</li>
            <li>No violence and threats (Including sexual violence).</li>
            <li className="text-foreground font-medium pt-2 border-t border-border mt-2 -ml-5 pl-5 list-none">
              Moderators reserve the right to remove content they deem harmful.
            </li>
            <li className="text-foreground font-medium -ml-5 pl-5 list-none">
              You must be over 18 years old to post.
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}