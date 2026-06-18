import React from 'react';
import { motion } from 'motion/react';
import { 
  Sun, Shield, Video, Calculator as CalcIcon, 
  ArrowUpRight, Wrench, Sparkles, ShieldCheck, 
  Tv, Zap, HandCoins, ChevronRight, Star, Quote
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import { TunnelHeroBackground } from './TunnelBackground';
import { TESTIMONIALS } from '../data';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  isDarkMode: boolean;
}

// Global ScrollReveal utility for pop up motion effect as users scroll through
export function ScrollReveal({ 
  children, 
  delay = 0, 
  direction = 'up' 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' 
}) {
  const getOffset = () => {
    switch (direction) {
      case 'up': return { y: 40, scale: 0.90 };
      case 'down': return { y: -40, scale: 0.90 };
      case 'left': return { x: 40, scale: 0.90 };
      case 'right': return { x: -40, scale: 0.90 };
      case 'zoom': return { scale: 0.85, y: 15 };
      default: return { scale: 0.90 };
    }
  };

  const initialVal = { opacity: 0, ...getOffset() };

  return (
    <motion.div
      initial={initialVal}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      whileHover={{ 
        scale: 1.025, 
        y: -4,
        boxShadow: "0 20px 40px -15px rgba(253, 184, 13, 0.08)",
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      viewport={{ once: false, margin: "-12% 0px -12% 0px" }}
      transition={{ 
        type: "spring",
        stiffness: 95,
        damping: 15,
        delay 
      }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

// High-performance animated counter that runs when in viewport view
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = React.useState(0);
  const elementRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    let active = true;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let startTime: number | null = null;
        const duration = 1600; // ms

        const update = (now: number) => {
          if (!active) return;
          if (!startTime) startTime = now;
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          
          setCount(Math.floor(easeProgress * target));

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            setCount(target);
          }
        };

        requestAnimationFrame(update);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [target]);

  return (
    <span ref={elementRef} className="text-[#FDB813] text-2xl sm:text-3xl font-heading font-extrabold block">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function SeaflowsLandingPage({
  onGetStarted,
  onLoginClick,
  onSignUpClick,
  isDarkMode
}: LandingPageProps) {

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onGetStarted();
    }
  };

  // Stagger entry configurations
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemFadeIn = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex flex-col gap-16 text-left selection:bg-[#FDB813] selection:text-[#0A2342] relative overflow-hidden" id="landing-page">
      
      {/* 100% FRAMER MOTION GOVERNED FLOATING GLOW BLOBS */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          y: [-30, 30, -30],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[8%] left-[5%] w-72 h-72 rounded-full bg-gradient-to-tr from-[#FDB813]/4 to-transparent blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          x: [25, -25, 25],
          y: [20, -20, 20],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] right-[5%] w-96 h-96 rounded-full bg-gradient-to-br from-[#0A2342]/6 to-transparent blur-3xl pointer-events-none"
      />

      {/* 1. DEDICATED LANDING NAVIGATION BAR */}
      <ScrollReveal direction="down">
        <div className="w-full bg-[#040916]/50 border border-gray-850/80 rounded-2xl px-6 py-4 flex justify-between items-center backdrop-blur-md backdrop-filter shadow-sm">
          <div className="flex items-center gap-2">
            <CompanyLogo />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={scrollToFeatures}
              className="hidden sm:inline-flex text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#FDB813] px-3 py-1.5 transition-colors cursor-pointer"
            >
              Features
            </button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToFeatures}
              className="bg-transparent text-gray-200 border border-gray-850 hover:border-gray-700 hover:bg-gray-900/10 px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
            >
              Get Started
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onLoginClick}
              className="bg-[#0A2342] hover:bg-[#123661] text-white border border-[#0A2342] px-4.5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
            >
              Login
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 25px -5px rgba(253, 184, 19, 0.2)" }}
              whileTap={{ scale: 0.97 }}
              onClick={onSignUpClick}
              className="bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] px-4.5 py-2 rounded-xl text-xs font-heading font-extrabold tracking-widest uppercase transition-all cursor-pointer shadow-md shadow-amber-500/10"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. HERO PRESENTATION GRAPHICS */}
      <ScrollReveal direction="zoom">
        <div className="relative bg-gradient-to-br from-[#0c182f] to-[#01091a] rounded-2.5xl p-6 sm:p-12 border border-gray-800 flex flex-col lg:flex-row justify-between items-center gap-10 overflow-hidden shadow-2xl z-0">
          {/* Imported 21st.dev animated Three.js background component */}
          <TunnelHeroBackground />

          {/* Professional composite brand image overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <img 
              src="/src/assets/images/hero_tech_background_1781372804402.jpg" 
              alt="Seaflows Solar and CCTV Infrastructure Background" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-[0.09] object-center mix-blend-screen filter saturate-105 brightness-[0.8]"
            />
            {/* Custom dark multi-layer gradients to guarantee superb contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c182f]/95 via-[#040e1b]/80 to-[#040e1b]/45 lg:bg-gradient-to-r lg:from-[#0c182f]/95 lg:via-[#0c182f]/70 lg:to-transparent" />
            <div className="absolute inset-0 bg-[#02050f]/15 mix-blend-multiply" />
          </div>

          <div className="absolute inset-0 bg-[#FDB813]/2 opacity-50 pointer-events-none z-10" />
          
          <div className="max-w-2xl flex flex-col gap-5 z-10 relative">
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#FDB813] text-xs font-mono font-extrabold tracking-widest bg-amber-950/40 border border-amber-900/30 px-3.5 py-1 w-fit rounded-full uppercase"
            >
              Excellent Connections, Better Value
            </motion.span>
            
            <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight tracking-tight">
              High-Grade Solar Networks & AI CCTV Surveillance Systems
            </h1>
            
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-lg font-sans">
              Seaflows Technologies delivers certified solar backup microgrids, pure sine wave power inverters, and high-sec PTZ thermal recorders designed for commercial and private complexes throughout Nigeria.
            </p>

            <div className="flex flex-wrap gap-3.5 mt-2">
              <motion.button
                whileHover={{ scale: 1.04, y: -1, boxShadow: "0 12px 30px -5px rgba(253,184,19,0.3)" }}
                whileTap={{ scale: 0.96 }}
                onClick={onSignUpClick}
                className="bg-[#FDB813] text-[#0A2342] hover:bg-amber-400 font-heading font-extrabold px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer"
              >
                Configure Solar System <ArrowUpRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                onClick={scrollToFeatures}
                className="bg-transparent text-white border border-gray-750 hover:border-gray-500 font-bold px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition-colors cursor-pointer"
              >
                Explore Solutions Overview
              </motion.button>
            </div>
          </div>

          {/* Floating metrics grid with animated counters on the right of the hero */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-fit shrink-0 font-sans z-10 relative">
            <motion.div 
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 350 } }}
              className="p-4 bg-[#030913]/90 border border-gray-850 rounded-xl w-full sm:w-[160px] cursor-pointer shadow-lg hover:border-[#FDB813]/30 transition-all"
            >
              <AnimatedCounter target={280} suffix="+" />
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-none">Microgrids Deployed</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 350 } }}
              className="p-4 bg-[#030913]/90 border border-gray-850 rounded-xl w-full sm:w-[160px] cursor-pointer shadow-lg hover:border-[#FDB813]/30 transition-all"
            >
              <AnimatedCounter target={1200} suffix="+" />
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-none">CCTV Mounts Active</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 350 } }}
              className="p-4 bg-[#030913]/90 border border-gray-850 rounded-xl w-full sm:w-[160px] cursor-pointer shadow-lg hover:border-[#FDB813]/30 transition-all"
            >
              <AnimatedCounter target={100} suffix="%" />
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-none">PSW Pure Stability</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 350 } }}
              className="p-4 bg-[#030913]/90 border border-gray-850 rounded-xl w-full sm:w-[160px] cursor-pointer shadow-lg hover:border-[#FDB813]/30 transition-all"
            >
              <span className="text-[#FDB813] text-2xl sm:text-3xl font-heading font-extrabold block">Naira</span>
              <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-none">Zero Fuel Surcharges</span>
            </motion.div>
          </div>
        </div>
      </ScrollReveal>

      {/* 3. FEATURES SECTION */}
      <div id="features-section" className="flex flex-col gap-8 scroll-mt-20">
        <ScrollReveal>
          <div className="text-center md:text-left">
            <span className="text-xs uppercase font-mono font-extrabold tracking-widest text-[#FDB813] block mb-1">
              Engineered Core Strengths
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Uncompromised Quality Designed For Clean Energy Independence
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-2xl">
              We bypass local grid instabilities and brownouts by supplying premium, highly durable components that run silent, secure, and automatic.
            </p>
          </div>
        </ScrollReveal>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div 
            variants={itemFadeIn}
            whileHover={{ y: -8, boxShadow: "0 20px 40px -15px rgba(253, 184, 19, 0.12)", borderColor: "rgba(253, 184, 19, 0.4)" }}
            className="group bg-[#030913] border border-gray-850 rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer transition-colors duration-300"
          >
            {/* Visual Slate Container */}
            <div className="relative h-44 overflow-hidden bg-gray-950">
              <motion.img 
                src="/src/assets/images/solar_slate_visual_1781367593244.jpg" 
                alt="Advanced Hybrid Solar Visual Slate"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-110 filter saturate-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-[#030913]/30 to-transparent" />
              
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="absolute bottom-3 left-4 p-2.5 bg-blue-950/80 text-[#FDB813] rounded-xl border border-blue-900/40 backdrop-blur-sm shadow-md"
              >
                <Sun size={20} />
              </motion.div>
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
              <h3 className="text-base font-heading font-extrabold text-white group-hover:text-[#FDB813] transition-colors">Advanced Hybrid Solar</h3>
              <p className="text-gray-400 text-xs leading-relaxed flex-1">
                Monocrystalline half-cell panels backed by premium grade Lithium iron phosphate (LiFePO4) storage options for true 6,000+ cycle life endurance.
              </p>
              <ul className="text-xs text-gray-500 space-y-1.5 mt-2 border-t border-gray-850/60 pt-3">
                <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> High conversion efficiency panels</li>
                <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> Hybrid sine wave stabilizers</li>
              </ul>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={itemFadeIn}
            whileHover={{ y: -8, boxShadow: "0 20px 40px -15px rgba(59, 130, 246, 0.12)", borderColor: "rgba(59, 130, 246, 0.4)" }}
            className="group bg-[#030913] border border-gray-850 rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer transition-colors duration-300"
          >
            {/* Visual Slate Container */}
            <div className="relative h-44 overflow-hidden bg-gray-950">
              <motion.img 
                src="/src/assets/images/cctv_slate_visual_1781367608943.jpg" 
                alt="Intel CCTV Surveillance Visual Slate"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-110 filter saturate-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-[#030913]/30 to-transparent" />
              
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="absolute bottom-3 left-4 p-2.5 bg-blue-950/80 text-[#FDB813] rounded-xl border border-blue-900/40 backdrop-blur-sm shadow-md"
              >
                <Video size={20} />
              </motion.div>
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
              <h3 className="text-base font-heading font-extrabold text-white group-hover:text-[#FDB813] transition-colors">Intel CCTV Surveillance</h3>
              <p className="text-gray-400 text-xs leading-relaxed flex-1">
                Full 4K Ultra-HD bullet cameras styled with starlight IR registers and IP67 weather shielding to operate flawlessly during harsh regional storms.
              </p>
              <ul className="text-xs text-gray-500 space-y-1.5 mt-2 border-t border-gray-850/60 pt-3">
                <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> AI motion & human tracking</li>
                <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> Real-time cloud recording</li>
              </ul>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={itemFadeIn}
            whileHover={{ y: -8, boxShadow: "0 20px 40px -15px rgba(253, 184, 19, 0.12)", borderColor: "rgba(253, 184, 19, 0.4)" }}
            className="group bg-[#030913] border border-gray-850 rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer transition-colors duration-300"
          >
            {/* Visual Slate Container */}
            <div className="relative h-44 overflow-hidden bg-gray-950">
              <motion.img 
                src="/src/assets/images/energy_flow_visual_1781367623147.jpg" 
                alt="Flexible Installment Options Visual Slate"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-110 filter saturate-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-[#030913]/30 to-transparent" />
              
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="absolute bottom-3 left-4 p-2.5 bg-blue-950/80 text-[#FDB813] rounded-xl border border-blue-900/40 backdrop-blur-sm shadow-md"
              >
                <HandCoins size={20} />
              </motion.div>
            </div>

            <div className="p-5 flex flex-col gap-3 flex-1">
              <h3 className="text-base font-heading font-extrabold text-white group-hover:text-[#FDB813] transition-colors">Flexible Installment Options</h3>
              <p className="text-gray-400 text-xs leading-relaxed flex-1">
                Equip your property now with a minimal down-payment, then spread remaining costs over convenient 3, 6, or 12 month terms with 0% hidden surcharges.
              </p>
              <ul className="text-xs text-gray-500 space-y-1.5 mt-2 border-t border-gray-850/60 pt-3">
                <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> Rapid financing approval</li>
                <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-400" /> Fully transparent billing logs</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 4. REAL-TIME GROUNDING ACCENT CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ScrollReveal direction="left">
            <motion.div 
              whileHover={{ borderColor: "rgba(253, 184, 19, 0.35)", boxShadow: "0 15px 35px -5px rgba(253, 184, 19, 0.08)" }}
              className="group relative overflow-hidden bg-[#030913] border border-gray-850 rounded-2xl p-6 flex flex-col justify-between gap-6 h-full transition-all duration-350"
            >
              {/* Stability Hybrid Background Image */}
              <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-2xl">
                <img 
                  src="/src/assets/images/stability_hybrid_bg_1781380182467.jpg" 
                  alt="Solar panels and dome camera background" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-[0.24] group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1] saturate-[1.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-[#030913]/90 to-[#030913]/60" />
              </div>

              <div className="relative z-10">
                <span className="text-[#FDB813] font-mono text-[10px] font-bold tracking-widest block mb-1">CCTV & SOLAR STABILITY ADVANTAGE</span>
                <h3 className="text-base font-heading font-extrabold text-white mb-2 group-hover:text-[#FDB813] transition-colors duration-250">Why Premium African Complexes Prefer Seaflows Connections</h3>
                <p className="text-gray-400 text-xs leading-relaxed font-sans text-justify">
                  Modern grid instability across West African cities exacts heavy tolls on electronic business nodes and private residences. High-power diesel fuel generators emit noxious smoke while standard low-budget voltage setups cause frequent brownouts. Seaflows Technologies delivers uncompromised Pure Sine Wave technology and starlight-enabled IP67 hardware arrays to transition properties into secure, clean, and self-sufficient zones.
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-905 pt-4">
                <motion.div 
                  whileHover={{ scale: 1.05, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(10,17,32,0.9)" }}
                  className="p-3 bg-[#0a1120]/80 backdrop-blur-xs rounded-xl border border-gray-900 text-center transition-all duration-200 cursor-pointer"
                >
                  <span className="text-white font-mono font-bold block">15 Mins Response</span>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mt-0.5">SUPPORT TICKETING</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(10,17,32,0.9)" }}
                  className="p-3 bg-[#0a1120]/80 backdrop-blur-xs rounded-xl border border-gray-900 text-center transition-all duration-200 cursor-pointer"
                >
                  <span className="text-white font-mono font-bold block">IP67 Waterproof</span>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mt-0.5">CAMERA HARDWARE</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, border: "1px solid rgba(255,255,255,0.12)", backgroundColor: "rgba(10,17,32,0.9)" }}
                  className="p-3 bg-[#0a1120]/80 backdrop-blur-xs rounded-xl border border-gray-900 text-center transition-all duration-200 cursor-pointer"
                >
                  <span className="text-white font-mono font-bold block">6,000+ Cycles</span>
                  <span className="text-gray-500 text-[9px] uppercase tracking-wider block mt-0.5">LITHIUM LIFE LIFE</span>
                </motion.div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>

        <div className="lg:col-span-4">
          <ScrollReveal direction="right">
            <motion.div 
              whileHover={{ scale: 1.01, borderColor: "rgba(59, 130, 246, 0.3)" }}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-950/20 to-indigo-950/25 border border-blue-900/40 p-6 rounded-2xl flex flex-col justify-between h-full shadow-lg transition-all duration-350"
            >
              {/* Smart AI Assistant Background Image */}
              <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-2xl">
                <img 
                  src="/src/assets/images/ai_assistant_bg_1781380197860.jpg" 
                  alt="Smart AI helper background" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-[0.22] group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1] saturate-[1.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040e21] via-[#040e21]/90 to-[#040e21]/70" />
              </div>

              <div className="relative z-10">
                <span className="flex gap-1.5 items-center text-[#FDB813] font-bold text-xs uppercase mb-2">
                  <Sparkles size={14} className="animate-pulse" /> Secure AI Agent Assist
                </span>
                <h4 className="text-sm font-heading font-extrabold text-white mb-2 group-hover:text-[#FDB813] transition-colors duration-250">Discuss Microgrid Solutions With AI</h4>
                <p className="text-gray-400 text-xs leading-normal">Have questions? Log in or create an account to start configuring your custom solar sizes or domestic protection architectures with our server-integrated AI assistant.</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "rgba(44,74,133,0.8)" }}
                whileTap={{ scale: 0.97 }}
                onClick={onLoginClick}
                className="relative z-10 w-full bg-[#1e345e]/70 hover:bg-[#2c4a85] border border-blue-850 text-blue-300 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
              >
                Access Sizing Assistant <ChevronRight size={14} />
              </motion.button>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>

      {/* VERIFIED CLIENT TESTIMONIALS SECTION */}
      <div className="flex flex-col gap-8 scroll-mt-20" id="testimonies-section">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-mono font-extrabold tracking-widest text-[#FDB813] block mb-1">
                Verified Client Performance
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                Success Stories From Trusted Partners
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1.5 max-w-xl">
                See how residences, small-scale enterprises, and corporate complexes across Nigeria enjoy seamless clean energy configurations and unbreached camera safety.
              </p>
            </div>
            
            {/* Visual overall trust metric block */}
            <div className="bg-[#030913] border border-gray-850 rounded-xl px-4 py-2.5 flex items-center gap-3 shrink-0 self-start md:self-auto shadow-md">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-[#102a54] border border-gray-900 flex items-center justify-center text-[10px] text-white font-bold">YB</div>
                <div className="w-7 h-7 rounded-full bg-[#523d06] border border-gray-900 flex items-center justify-center text-[10px] text-[#FDB813] font-bold">CN</div>
                <div className="w-7 h-7 rounded-full bg-[#0a3825] border border-gray-900 flex items-center justify-center text-[10px] text-emerald-400 font-bold">DO</div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-white text-xs font-bold">4.9 / 5</span>
                  <div className="flex text-[#FDB813]">
                    {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">320+ CLIENT MONITORS ACTIVE</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Testimonials Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, idx) => {
            const isYusuf = item.id === 'test-1';
            const isChioma = item.id === 'test-2';
            
            return (
              <div key={item.id} className="h-full">
                <ScrollReveal delay={idx * 0.1} direction={idx === 0 ? "left" : idx === 1 ? "up" : "right"}>
                  <motion.div 
                    whileHover={{ y: -6, borderColor: isYusuf ? "rgba(253, 184, 19, 0.3)" : "rgba(59, 130, 246, 0.3)" }}
                    className="relative group bg-[#030913] border border-gray-850 rounded-2xl p-6 h-full flex flex-col justify-between transition-all duration-300 shadow-xl overflow-hidden"
                  >
                  {/* Subtle quote watermark in background */}
                  <div className="absolute right-4 top-4 text-gray-900 group-hover:text-amber-500/5 transition-colors pointer-events-none select-none">
                    <Quote size={56} className="opacity-[0.03]" />
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Stars Rating Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5 text-[#FDB813]">
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" className="stroke-none" />
                        ))}
                      </div>
                      
                      <span className="text-[9px] font-mono uppercase bg-gray-950 px-2.5 py-0.5 rounded-full text-gray-500 border border-gray-900">
                        {isYusuf ? 'Enterprise Hybrid' : isChioma ? 'Estate Solar' : 'IT Integration'}
                      </span>
                    </div>

                    {/* Testimonial Quote Speech */}
                    <p className="text-gray-300 text-xs sm:text-[13px] leading-relaxed italic font-light relative z-10">
                      "{item.text}"
                    </p>
                  </div>

                  {/* Customer Information Footer */}
                  <div className="flex items-center gap-3 border-t border-gray-850/60 pt-4 mt-6">
                    {/* Custom high-contrast initial avatar fallback with professional brand color styling */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-inner ${
                      isYusuf 
                        ? 'bg-[#1e1a06] text-[#FDB813] border border-amber-900/30' 
                        : isChioma 
                        ? 'bg-[#03152e] text-[#4d97ff] border border-blue-900/30' 
                        : 'bg-[#071911] text-[#29d687] border border-emerald-950/30'
                    }`}>
                      {item.name.split(' ').map(part => part[0]).join('')}
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="text-white text-xs font-extrabold truncate">{item.name}</h4>
                      <p className="text-gray-500 text-[10px] truncate">{item.role}</p>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            </div>
          );
        })}
        </div>
      </div>

      {/* 5. HIGH-CONVERTING BOTTOM CALL TO ACTION */}
      <ScrollReveal direction="zoom">
        <div className="bg-[#030913] border border-gray-850 p-8 sm:p-12 rounded-2.5xl text-center flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient(ellipse at center, rgba(253, 184, 19, 0.05) 0%, transparent 70%) pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white max-w-xl">
            Ready to Transition Your Estate to Sustainable Clean Energy?
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm max-w-md">
            Sign up today to custom-calculate your billing, track dispatch timelines, browse product catalog supplies, and communicate with dedicated field engineers.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2, boxShadow: "0 15px 35px -5px rgba(253, 184, 19, 0.3)" }}
            whileTap={{ scale: 0.96 }}
            onClick={onSignUpClick}
            className="bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] font-heading font-extrabold px-8 py-3 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer mt-2"
          >
            Create A Free Account Securing ₦0 Consultation
          </motion.button>
        </div>
      </ScrollReveal>

    </div>
  );
}
