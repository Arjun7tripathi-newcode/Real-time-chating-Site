"use client";

import { motion } from "framer-motion";
import { Hammer, Sparkles, Rocket, ArrowLeft } from "lucide-react";
import { useChatStore } from "@/hooks/use-chat-store";

export const UnderDevelopment = () => {
  const { setAppMode } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-white dark:bg-[#050505] p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl"
      >
        {/* Animated Icon Container */}
        <div className="relative mb-12">
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-700 rounded-[32px] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
          >
            <Hammer className="w-10 h-10 text-white" />
          </motion.div>
          
          {/* Floating Accents */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-4 -right-4 bg-amber-400 p-2 rounded-full shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-amber-900" />
          </motion.div>
          
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-2 -left-6 bg-indigo-400 p-2 rounded-full shadow-lg"
          >
            <Rocket className="w-4 h-4 text-indigo-900" />
          </motion.div>
        </div>

        {/* Text Content */}
        <h2 className="text-sm font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">
          Experimental Feature
        </h2>
        
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-tight italic">
          Meet Zone <br />
          <span className="text-zinc-400 dark:text-zinc-600 not-italic">Under Construction.</span>
        </h1>
        
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg mb-12 max-w-md mx-auto leading-relaxed italic">
          We're handcrafting the next generation of video communication. Something extraordinary is brewing in the lab.
        </p>

        {/* Progress Indicator Mock */}
        <div className="w-full max-w-xs bg-zinc-100 dark:bg-zinc-900/50 h-1.5 rounded-full mb-12 overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 2, delay: 0.5, ease: "circOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
          />
        </div>

        {/* Interaction */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAppMode("chat")}
          className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full font-black text-xs uppercase tracking-widest transition-all hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Hub
        </motion.button>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-zinc-400 dark:text-zinc-600">
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Antigravity Labs</span>
        <div className="w-1 h-1 rounded-full bg-zinc-800" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">v2.0.4 - Build</span>
      </div>
    </div>
  );
};
