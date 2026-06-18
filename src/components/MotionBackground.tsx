import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type BackgroundStyle = 'cosmos' | 'solar' | 'cctv';

interface MotionBackgroundProps {
  style: BackgroundStyle;
  speedMultiplier?: number; // 1 represents default, 0.5 slow, 2 fast
}

export default function SeaflowsMotionBackground({
  style,
  speedMultiplier = 1
}: MotionBackgroundProps) {
  // Translate speed multipliers to animation durations (default 40s/60s)
  const durationNormal = 60 / speedMultiplier;
  const durationFast = 30 / speedMultiplier;

  // Render different layers based on selection
  return (
    <div className="fixed inset-0 -z-50 w-full h-full overflow-hidden bg-gradient-to-b from-[#021025] via-[#010a18] to-[#01050e] pointer-events-none transition-colors duration-1000">
      
      {/* Dynamic Blend Overlays to maintain contrast accessibility */}
      <div className="absolute inset-0 bg-[#020a1c]/55 z-10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#020a1c] to-transparent z-10" />
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#020a1c] to-transparent z-10" />

      <AnimatePresence mode="wait">
        {style === 'cosmos' && (
          <motion.div
            key="cosmos-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Ambient sliding glowing orbs and particles */}
            <motion.div
              animate={{
                x: [-155, 155, -155],
                y: [-110, 110, -110],
                scale: [1, 1.28, 1],
              }}
              transition={{
                duration: durationNormal,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[15%] left-[8%] w-[42rem] h-[42rem] rounded-full bg-gradient-to-tr from-[#0a2342]/45 via-[#0A2342]/20 to-[#FDB813]/16 blur-[110px]"
            />

            <motion.div
              animate={{
                x: [110, -110, 110],
                y: [130, -130, 130],
                scale: [1.12, 0.88, 1.12],
              }}
              transition={{
                duration: durationNormal * 1.3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-[15%] right-[8%] w-[48rem] h-[48rem] rounded-full bg-gradient-to-br from-[#FDB813]/15 via-[#123661]/25 to-[#020c1b]/5 blur-[130px]"
            />

            {/* Central Seablue & Gold Ambient Transition Glow */}
            <motion.div
              animate={{
                scale: [0.9, 1.1, 0.9],
                opacity: [0.6, 0.9, 0.6]
              }}
              transition={{
                duration: durationNormal * 0.9,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[35%] left-[30%] w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-[#0d2a4e]/25 to-[#FDB813]/8 blur-[100px]"
            />

            {/* Subtle starlight starry layer using HTML indicators */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]" />
          </motion.div>
        )}

        {style === 'solar' && (
          <motion.div
            key="solar-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full mix-blend-screen"
          >
            {/* Ambient Seablue & Gold backing glows inside Solar */}
            <div className="absolute top-[10%] left-[20%] w-[38rem] h-[38rem] rounded-full bg-[#0A2342]/65 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[15%] right-[25%] w-[42rem] h-[42rem] rounded-full bg-[#FDB813]/12 blur-[140px] pointer-events-none" />

            {/* High-quality generated solar macrogrid panning */}
            <motion.img
              src="/src/assets/images/solar_pattern_bg_1781173099888.png"
              alt="Solar Microgrid Pattern Background"
              referrerPolicy="no-referrer"
              className="absolute w-[120vw] h-[120vh] -left-[10vw] -top-[10vh] object-cover scale-105 filter saturate-[1.25] brightness-[0.75]"
              animate={{
                x: [-35, 35, -35],
                y: [-25, 25, -25],
                rotate: [0, 1.5, -1.5, 0],
              }}
              transition={{
                duration: durationNormal * 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Glowing Golden flares sliding along the screen */}
            <motion.div
              animate={{
                x: ['-10%', '110%'],
                y: ['15%', '85%']
              }}
              transition={{
                duration: durationFast,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute w-[30rem] h-[30rem] bg-gradient-to-br from-[#FDB813]/25 to-transparent blur-[120px] rounded-full"
            />
          </motion.div>
        )}

        {style === 'cctv' && (
          <motion.div
            key="cctv-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 w-full h-full mix-blend-color-dodge"
          >
            {/* Generated CCTV Network vector graphic */}
            <motion.img
              src="/src/assets/images/cctv_network_bg_1781173116474.png"
              alt="CCTV AI Network Scan Background"
              referrerPolicy="no-referrer"
              className="absolute w-[125vw] h-[125vh] -left-[12vw] -top-[12vh] object-cover scale-110 filter saturate-[1.3] brightness-[0.55]"
              animate={{
                scale: [1, 1.04, 1.01, 1],
                x: [25, -25, 25],
                y: [-20, 20, -20],
              }}
              transition={{
                duration: durationNormal * 1.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Animated green/blue scanline scanner sliding up/down */}
            <motion.div 
              animate={{
                y: ['-5%', '105%']
              }}
              transition={{
                duration: durationFast * 0.4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FDB813]/25 to-transparent blur-[1px] shadow-[0_0_12px_rgba(253,184,19,0.4)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
