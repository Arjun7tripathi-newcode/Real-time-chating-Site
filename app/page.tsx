"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { MessageSquare, Shield, Zap, Globe, Lock, ArrowRight, Sparkles, Command } from "lucide-react";
import { cn } from "@/lib/utils";

const FloatingElement = ({ className, children, delay = 0 }: { className?: string; children?: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-15, 15, -15] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const FeatureCard = ({ icon: Icon, title, desc, index }: { icon: any; title: string; desc: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
    whileHover={{ y: -5, scale: 1.02 }}
    className="group relative p-8 rounded-[40px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl overflow-hidden hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-500"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-blue-500/10 group-hover:scale-110 transition-all duration-500">
        <Icon className="w-7 h-7 text-white/40 group-hover:text-blue-400 transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">{desc}</p>
    </div>
  </motion.div>
);

const ProcessStep = ({ number, title, desc, index }: { number: string; title: string; desc: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.8 }}
    className="relative pl-12 border-l border-white/10 py-10"
  >
    <div className="absolute left-[-16px] top-10 w-8 h-8 rounded-full bg-blue-600 border-4 border-[#050505] flex items-center justify-center text-[10px] font-black italic shadow-[0_0_20px_rgba(37,99,235,0.5)]">
       {number}
    </div>
    <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
    <p className="text-white/40 leading-relaxed font-bold italic">{desc}</p>
  </motion.div>
);

export default function LandingPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const heroOpacity = useTransform(springScroll, [0, 0.15], [1, 0]);
  const heroScale = useTransform(springScroll, [0, 0.15], [1, 0.9]);
  const dashboardY = useTransform(springScroll, [0, 0.25], [100, 0]);
  const dashboardRotate = useTransform(springScroll, [0, 0.25], [10, 0]);

  useEffect(() => {
    if (isLoaded && userId) router.push("/dashboard");
  }, [isLoaded, userId, router]);

  if (isLoaded && userId) return null;

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-cyan-600/5 rounded-full blur-[120px]" />
        
        {/* Gridded Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.02) 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between backdrop-blur-md bg-black/10 border-b border-white/[0.05]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
             <MessageSquare className="w-6 h-6 text-black" fill="currentColor" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter">ChatPro.</span>
        </motion.div>
        
        <div className="flex items-center gap-6">
          <SignInButton mode="modal">
            <button className="text-sm font-bold text-white/50 hover:text-white transition-colors">Sign In</button>
          </SignInButton>
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
             <button className="px-6 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
                Launch App
             </button>
          </SignInButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[140vh] flex flex-col items-center justify-start pt-48 pb-20 px-6 z-10">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="text-center max-w-5xl sticky top-48"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-10"
          >
            <Sparkles className="w-3 h-3" />
            The Future of Conversations
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-7xl md:text-[140px] font-black tracking-[-0.05em] leading-[0.9] mb-8 sm:mb-12"
          >
            Chatting <br />
            <span className="bg-gradient-to-t from-white/20 via-white to-white bg-clip-text text-transparent italic">Reimagined.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-white/40 text-lg md:text-2xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed"
          >
            Experience a world-class real-time platform. <br className="hidden md:block" />
            Built for security. Designed for delight.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 px-4 sm:px-0"
          >
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="group relative w-full md:w-auto px-8 sm:px-10 py-4 sm:py-6 bg-blue-600 rounded-2xl sm:rounded-[28px] text-base sm:text-lg font-bold hover:bg-blue-500 transition-all overflow-hidden flex items-center justify-center gap-3">
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                 <span className="relative flex items-center gap-3">
                   Start Chatting <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                 </span>
              </button>
            </SignInButton>
            <div className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl sm:rounded-[28px] text-[12px] sm:text-sm font-semibold text-white/50">
               <Command className="w-4 h-4" /> Press <span className="text-white">K</span> to search
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Floating Mockup Preview */}
      <div className="relative z-20 -mt-[40vh] flex justify-center px-6">
        <motion.div 
          style={{ y: dashboardY, rotateX: dashboardRotate }}
          className="w-full max-w-6xl relative perspective-1000"
        >
          <div className="relative z-10 p-2 rounded-[40px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/30 via-white/5 to-violet-500/30 rounded-[40px] opacity-40 blur-sm pointer-events-none" />
            <img 
               src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop" 
               alt="Dashboard Preview" 
               className="w-full h-auto rounded-[32px] border border-white/5 brightness-75 contrast-125 saturate-150"
            />
          </div>

          <FloatingElement className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl opacity-50" />
          <FloatingElement className="absolute -bottom-20 -right-20 w-60 h-60 bg-violet-500/30 rounded-full blur-3xl text-right opacity-50" delay={1} />
        </motion.div>
      </div>

      {/* Section: The Problem & The Solution (ABOUT) */}
      <section className="py-60 px-8 relative z-10 overflow-hidden">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
               >
                  <h2 className="text-4xl md:text-8xl font-black tracking-[-0.04em] leading-[0.9] mb-8 sm:mb-12">
                     No Bloat. <br />
                     <span className="text-white/20 italic">Just Chat.</span>
                  </h2>
                  <p className="text-white/50 text-xl md:text-3xl font-bold leading-relaxed mb-10 italic">
                     Most apps are cluttered with stories, statuses, and ads. ChatPro strips it all away to give you what you actually need: 
                     <span className="text-blue-500"> Real-time connection.</span>
                  </p>
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                           <Shield className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="font-bold text-white/70 tracking-tight">Zero tracking. Absolute privacy starting from your unique ID.</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                           <Zap className="w-6 h-6 text-violet-500" />
                        </div>
                        <p className="font-bold text-white/70 tracking-tight">Blazing fast delivery using our edge-optimized socket mesh.</p>
                     </div>
                  </div>
               </motion.div>
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative h-[600px] w-full bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-[60px] border border-white/10 overflow-hidden p-10"
               >
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                   <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                      <div className="px-5 py-2 rounded-full border border-blue-500/30 text-blue-500 text-[10px] font-black tracking-[0.4em] mb-6 uppercase">Benefits</div>
                      <h3 className="text-4xl font-extrabold mb-8">Why ChatPro?</h3>
                      <ul className="space-y-8 text-left max-w-sm mx-auto">
                         <li className="flex gap-4 group">
                            <span className="text-blue-500 font-black italic">01.</span>
                            <span className="font-bold text-white/40 group-hover:text-white transition-colors">No Phone Number Required. Use your shareable Short ID.</span>
                         </li>
                         <li className="flex gap-4 group">
                            <span className="text-blue-500 font-black italic">02.</span>
                            <span className="font-bold text-white/40 group-hover:text-white transition-colors">Self Chat built-in for personal notes, reminders & files.</span>
                         </li>
                         <li className="flex gap-4 group">
                            <span className="text-blue-500 font-black italic">03.</span>
                            <span className="font-bold text-white/40 group-hover:text-white transition-colors">Discord-style Public Rooms. Join any community with one click.</span>
                         </li>
                         <li className="flex gap-4 group">
                            <span className="text-blue-500 font-black italic">04.</span>
                            <span className="font-bold text-white/40 group-hover:text-white transition-colors">Instant Search. Find anyone globally by name or unique ID.</span>
                         </li>
                      </ul>
                   </div>
               </motion.div>
            </div>
         </div>
      </section>

      {/* Marquee Section */}
      <section className="py-24 border-y border-white/[0.05] overflow-hidden whitespace-nowrap bg-black/50">
         <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex gap-20 items-center justify-center"
         >
            {[...Array(40)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <span className="text-4xl font-black uppercase tracking-tighter opacity-10">Real-Time Messaging</span>
              </div>
            ))}
         </motion.div>
      </section>

      {/* How it Works Section */}
      <section className="py-60 px-8 relative z-10">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
               <div>
                  <h2 className="text-5xl md:text-[90px] font-black tracking-[-0.04em] leading-[0.8] mb-12">
                     Join. <br />
                     Search. <br />
                     <span className="text-blue-500">Connect.</span>
                  </h2>
                  <p className="text-white/30 text-xl font-bold italic max-w-md">The simplest boarding process in the industry. Ready in seconds.</p>
               </div>
               <div className="flex flex-col">
                  <ProcessStep 
                    index={0} number="01" title="Instant Onboarding" 
                    desc="Sign up securely using Clerk. No phone verification or complex forms needed. Get your unique User ID instantly." 
                  />
                  <ProcessStep 
                    index={1} number="02" title="Global Lookup" 
                    desc="Use the instant search bar to find friends by their shareable ID or name. Start a 1:1 chat or join a public room." 
                  />
                  <ProcessStep 
                    index={2} number="03" title="Pure Experience" 
                    desc="Send messages with zero lag. Utilize your personal Self Chat for reminders or group chats for collaborative talk." 
                  />
               </div>
            </div>
         </div>
      </section>

      {/* Feature Grid */}
      <section className="py-60 px-8 relative z-10 bg-[#070707]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
             <h2 className="text-5xl md:text-8xl font-black tracking-tight mb-8">Engineered for <br /><span className="text-blue-500">Unmatched</span> Velocity.</h2>
             <p className="text-white/40 text-xl font-medium max-w-xl mx-auto italic leading-relaxed">Everything you need to stay connected, without the complexity.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              index={0}
              icon={Zap} 
              title="Instant Delivery" 
              desc="Messages syncing across all your devices in under 20ms. Powered by modern Socket.IO technology." 
            />
            <FeatureCard 
              index={1}
              icon={Shield} 
              title="End-to-End Privacy" 
              desc="Your data is yours. Secure MongoDB storage with industry-standard encryption protocols." 
            />
            <FeatureCard 
              index={2}
              icon={Lock} 
              title="Identity First" 
              desc="World-class authentication by Clerk. Your private space is protected by the best in the industry." 
            />
            <FeatureCard 
              index={3}
              icon={Globe} 
              title="Global Rooms" 
              desc="Join a diverse array of public rooms or create your own community. The world is just a chat away." 
            />
            <FeatureCard 
              index={4}
              icon={ArrowRight} 
              title="Self Workspace" 
              desc="Personal notes, reminders, and draft storage. Your very own private room for whatever you need." 
            />
            <FeatureCard 
              index={5}
              icon={Command} 
              title="Short ID System" 
              desc="Share your unique User ID to connect instantly. No phone numbers, no friction. Just talk." 
            />
          </div>
        </div>
      </section>

      {/* Big Stats/Proof Section */}
      <section className="py-40 px-8 relative z-10">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="text-center">
               <div className="text-7xl font-black tracking-tighter mb-4 italic text-white/5">20ms</div>
               <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Latency</p>
            </div>
            <div className="text-center">
               <div className="text-7xl font-black tracking-tighter mb-4 italic text-white/5">0.0%</div>
               <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Ad Exposure</p>
            </div>
            <div className="text-center">
               <div className="text-7xl font-black tracking-tighter mb-4 italic text-white/5">100%</div>
               <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Encrypted</p>
            </div>
         </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-60 px-6 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-3xl border-t border-white/[0.05]" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
           <h2 className="text-5xl md:text-[110px] font-black tracking-tighter mb-12 leading-[0.8] tracking-[-0.06em]">Ready to <br /> <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">Begin Now?</span></h2>
           <SignInButton mode="modal" forceRedirectUrl="/dashboard">
             <button className="group relative w-full sm:w-auto px-10 sm:px-16 py-6 sm:py-8 bg-white text-black text-xl sm:text-2xl font-black rounded-3xl sm:rounded-[40px] hover:scale-105 active:scale-95 transition-all shadow-[0_50px_100px_rgba(255,255,255,0.1)]">
                Launch Experience
                <div className="absolute inset-1 rounded-[36px] bg-gradient-to-br from-blue-500 to-violet-600 opacity-0 group-hover:opacity-100 blur-2xl -z-10 transition-opacity" />
             </button>
           </SignInButton>
           <p className="mt-16 text-white/20 font-bold uppercase tracking-[0.4em] text-[10px]">Zero setup cost · Enterprise Grade Security</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/[0.05] relative z-10 bg-[#030303]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <MessageSquare className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-lg tracking-tighter">ChatPro.</span>
          </div>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest leading-loose text-center md:text-left">
            Built with Passion by Team ChatPro. <br />
            © 2026 High-Volume Messaging Corp. All Rights Reserved.
          </p>
          <div className="flex gap-12">
            {["Twitter", "GitHub", "Discord"].map(s => (
              <a key={s} href="#" className="text-white/20 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
