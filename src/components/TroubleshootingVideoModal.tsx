import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Volume2, VolumeX, RotateCcw, X, Sliders, 
  HelpCircle, CheckCircle, Flame, ShieldAlert, Sparkles, 
  Clock, ArrowRight, Gauge, Activity, Radio, AlertCircle
} from 'lucide-react';

export interface VideoGuide {
  id: string;
  title: string;
  description: string;
  errorCode: string;
  severity: 'low' | 'medium' | 'high';
  videoUrl: string;
  durationString: string;
  durationSeconds: number;
  iconName: string;
  captions: Array<{ time: number; text: string }>;
  steps: string[];
}

export const VIDEO_GUIDES: VideoGuide[] = [
  {
    id: 'f05-battery',
    title: 'Resolving Battery DC Alarm (F05 Low Volt Alert)',
    description: 'Learn how to diagnose premature low voltage cutoff alarms, bypass utility battery loading, and recalibrate programs.',
    errorCode: 'F05 (LOW VOLT)',
    severity: 'high',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-solar-panels-on-a-sunny-day-41662-large.mp4',
    durationString: '02:45',
    durationSeconds: 165,
    iconName: 'battery',
    captions: [
      { time: 0, text: 'Welcome back. Today we\'re fixing the common F05 battery low voltage alarm.' },
      { time: 10, text: 'First, locate and inspect the heavy DC breaker switch connected between your inverter and battery cabinet.' },
      { time: 25, text: 'Check if the state of charge drops below your cut-off threshold (typically 44V for 48V modular setups).' },
      { time: 42, text: 'Connect the utility grid bypass override to force utility-charging if solar radiation is absent.' },
      { time: 60, text: 'Now, enter Program Mode by holding the ENTER key on your inverter screen for 3 seconds.' },
      { time: 80, text: 'Scroll to option 29 (Low DC Cut-off Voltage) using the up/down keys.' },
      { time: 105, text: 'Adjust this option to match your battery BMS discharge parameters (e.g., 42V to 45V).' },
      { time: 130, text: 'Save settings. The red fault LED will clear, and standard inverting will resume smoothly.' }
    ],
    steps: [
      'Locate and slide the heavy DC circuit breakers OFF-and-ON to verify contact stability.',
      'Check current LCD DC voltage readout on the primary screen.',
      'Hold the ENTER key for 3 seconds to access Menu Settings.',
      'Adjust Program 29 (Low Cut-off) and Program 02 (Grid Charging Current).',
      'Save settings and apply bypass utility cycle.'
    ]
  },
  {
    id: 'f01-overload',
    title: 'Solving Inverter Overload Shutdowns (F01 Surge Limit)',
    description: 'Sequence start heavy inductive appliances like pumps, AC compressors, and fridges safely without collapsing pure sine wave inverters.',
    errorCode: 'F01 (OVERLOAD)',
    severity: 'medium',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-animation-of-a-circuit-board-under-load-32244-large.mp4',
    durationString: '03:10',
    durationSeconds: 190,
    iconName: 'zap',
    captions: [
      { time: 0, text: 'Experiencing an F01 Overload fault? Let\'s check your appliance startup sequence.' },
      { time: 12, text: 'Inverters safety-trip if temporary surge currents exceed maximum peak ratings (typically 200%).' },
      { time: 28, text: 'Identify high-surge inductive loads: water pumps, air conditioners, and refrigerators.' },
      { time: 48, text: 'Disconnect all secondary breakers. Switch on heavy inductive equipment PRIOR to starting smaller electronics.' },
      { time: 70, text: 'Let\'s modify Program Option 23 (Overload Bypass) to enable automatic grid transfer during startups.' },
      { time: 100, text: 'Ensure option 23 is set to "BYE" (Bypass Enabled).' },
      { time: 130, text: 'Perform a clean restart of the inverter control module using the manual red rocker toggle at the bottom.' }
    ],
    steps: [
      'Turn OFF all distribution circuit breakers on the distribution board (DB).',
      'Turn ON only the pure resistive loads (lighting, fans) one by one.',
      'For inductive motors (air conditioning, water pumping), ensure sequence intervals are minimum 5 minutes apart.',
      'Turn OFF and reset the red rocker button on the side chassis of the inverter.',
      'Configure settings parameter 23 to bypass overload trigger.'
    ]
  },
  {
    id: 'f02-temperature',
    title: 'Dust Filter Maintenance & Fixing Over-Temp (F02 Alarm)',
    description: 'Safely clear tropical sand or dust blockages from heat sinks and exhaust ducts to resolve system cooling faults.',
    errorCode: 'F02 (OVER-TEMP)',
    severity: 'medium',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-macro-shot-of-computer-cooling-system-fans-operating-43572-large.mp4',
    durationString: '01:50',
    durationSeconds: 110,
    iconName: 'thermometer',
    captions: [
      { time: 0, text: 'F02 indicates an active temperature threshold breach. Let\'s inspect the thermal systems.' },
      { time: 10, text: 'First, look beneath the inverter chassis and confirm if both exhaust fans are spinning freely.' },
      { time: 25, text: 'Ensure there is at least 20cm of negative clearance around all heatsink ventilation rails.' },
      { time: 45, text: 'Switch off the DC breaker and use dry compressed air to clear sand from filtration mesh grids.' },
      { time: 70, text: 'For tropical areas, avoid mounting units in direct sunlight; guarantee shaded wall ventilation.' },
      { time: 95, text: 'Allow the internal components to cool entirely for 15 minutes, then reboot your system.' }
    ],
    steps: [
      'Power off the AC input source and DC battery isolation switch completely.',
      'Use a clean dry brush or low-pressure air spray on the fan grills.',
      'Clear any items stacked on top of or next to the metallic inverter chassis.',
      'Relocate the unit if it is placed in an enclosed unventilated closet.',
      'Allow 15 minutes of downtime before powering up.'
    ]
  },
  {
    id: 'manual-bypass',
    title: 'Bypass Switch Setup & System Safety Isolation',
    description: 'How to switch output safely to direct utility/grid feed, completely isolating the inverter for safe hardware servicing.',
    errorCode: 'MANUAL BYPASS',
    severity: 'low',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-a-man-working-with-wires-and-a-tester-44046-large.mp4',
    durationString: '02:15',
    durationSeconds: 135,
    iconName: 'refresh-cw',
    captions: [
      { time: 0, text: 'Welcome. Today we\'re reviewing the manual changeover bypass switch process.' },
      { time: 12, text: 'If you need to isolate your inverter for maintenance, bypass transfers utility directly to loads.' },
      { time: 30, text: 'Locate your outer metal Changeover switch. Never rotate under maximum operational house load.' },
      { time: 55, text: 'First, turn the primary inverter power switch to OFF, then trip the main AC Output circuit breaker.' },
      { time: 80, text: 'Safely rotate the heavy handle of your changeover selector from Position 1 (Solar) to Position 2 (Grid Bypass).' },
      { time: 108, text: 'Confirm grid load feeds immediately. The inverter is now completely isolated and safe to touch.' }
    ],
    steps: [
      'Reduce electrical consumption to safety limits (switch off heavy equipment).',
      'Press power switch on the bottom of the inverter cabinet to OFF.',
      'Open the distribution board and trip the Inverter AC output breaker to safety.',
      'Rotate manual changeover rotary switch selector slowly but firmly to grid-bypass.',
      'The inverter is now safe for diagnostic inspection or clean cable removal.'
    ]
  }
];

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGuideId?: string;
}

export default function TroubleshootingVideoModal({ isOpen, onClose, selectedGuideId }: VideoModalProps) {
  const [activeGuide, setActiveGuide] = useState<VideoGuide>(VIDEO_GUIDES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState('');
  
  // Immersive physical synthesizer stats
  const [isHumSynthActive, setIsHumSynthActive] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Symptoms Checklist States for assistant
  const [symptoms, setSymptoms] = useState({
    redLight: false,
    clickingNoise: false,
    hotAir: false,
    noDisplay: false
  });
  
  // Custom video element reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  // Audio synthesizer nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Set the selected guide based on prop trigger
  useEffect(() => {
    if (selectedGuideId) {
      const found = VIDEO_GUIDES.find(v => v.id === selectedGuideId);
      if (found) {
        setActiveGuide(found);
        setCurrentTime(0);
        setIsPlaying(false);
        setHasVideoError(false);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }
      }
    }
  }, [selectedGuideId, isOpen]);

  // Sync subtitle tracking
  useEffect(() => {
    const caps = activeGuide.captions;
    const matched = caps.reduce((acc, cap) => {
      if (currentTime >= cap.time) {
        return cap.text;
      }
      return acc;
    }, 'Select PLAY to start troubleshooting instructions audio simulation...');
    
    setActiveSubtitle(matched);
  }, [currentTime, activeGuide]);

  // Handle HTML5 video events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Safe Audio Hum sound synthesis
  const toggleAudioHum = () => {
    if (isHumSynthActive) {
      stopOscillator();
      setIsHumSynthActive(false);
    } else {
      startOscillator();
      setIsHumSynthActive(true);
    }
  };

  const startOscillator = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous osc if running
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (_) {}
        oscRef.current.disconnect();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // High-grade matching frequencies depending on the active troubleshooting code
      if (activeGuide.id === 'f05-battery') {
        osc.frequency.value = 55; // 55Hz DC battery magnetic ripple
      } else if (activeGuide.id === 'f01-overload') {
        osc.frequency.value = 90; // 90Hz high electrical transformer vibration
      } else if (activeGuide.id === 'f02-temperature') {
        osc.frequency.value = 180; // 180Hz thermal fan whine speed
      } else {
        osc.frequency.value = 60; // 60Hz utility pure sine hum
      }

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5); // safe comfortable room volume

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (err) {
      console.warn('[Seaflows Hum Synthesizer] Blocked or unsupported:', err);
    }
  };

  const stopOscillator = () => {
    try {
      if (gainRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, ctx.currentTime);
        gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        setTimeout(() => {
          if (oscRef.current) {
            try { oscRef.current.stop(); } catch (_) {}
            oscRef.current.disconnect();
            oscRef.current = null;
          }
        }, 300);
      }
    } catch (_) {}
  };

  // Stop sound when closing
  useEffect(() => {
    if (!isOpen) {
      stopOscillator();
      setIsHumSynthActive(false);
      setIsPlaying(false);
    }
    return () => {
      stopOscillator();
    };
  }, [isOpen]);

  // Adjust oscillator frequency reactively when switching guides
  useEffect(() => {
    if (isHumSynthActive) {
      startOscillator(); // restart with matching guide frequency
    }
  }, [activeGuide]);

  // Custom Video playback toggle
  const togglePlay = () => {
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setHasVideoError(false);
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Video tag play rejected, running fallback simulated progress:', err);
            setHasVideoError(true);
            setIsPlaying(true);
          });
      } else {
        setIsPlaying(true);
      }
    }
  };

  // Fallback Interval Simulates Progressive Frame flow if MP4 blocked
  useEffect(() => {
    let timer: any;
    if (isPlaying && (hasVideoError || !videoRef.current)) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= activeGuide.durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1 * playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, hasVideoError, activeGuide, playbackSpeed]);

  // Speed and Volume control triggers
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVal = parseFloat(e.target.value);
    setCurrentTime(targetVal);
    if (videoRef.current) {
      videoRef.current.currentTime = targetVal;
    }
  };

  const handleReset = () => {
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="seaflows-video-modal-viewport" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          id="video-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-6xl bg-[#030913] border border-gray-800 rounded-2xl flex flex-col overflow-hidden text-white shadow-2xl relative"
        >
          {/* Header Panel */}
          <div className="flex justify-between items-center bg-[#070e1b] border-b border-gray-850 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-950/20 rounded-lg text-[#FDB813] border border-amber-500/30">
                <Gauge size={16} className="animate-spin-slow" />
              </span>
              <div className="text-left">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#FDB813] flex items-center gap-1">
                  <Sparkles size={8} className="fill-current" /> Seaflows Technical Assistance Console
                </span>
                <h4 className="text-sm font-heading font-extrabold tracking-tight">Interactive DIY Inverter Calibration Lab</h4>
              </div>
            </div>

            <button 
              id="close-video-modal"
              onClick={onClose}
              className="p-1.5 hover:bg-gray-800/60 rounded-lg text-gray-450 hover:text-white transition-all cursor-pointer"
              title="Close System Diagnostics"
            >
              <X size={18} />
            </button>
          </div>

          {/* Core Body Container - Split Screen layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto max-h-[75vh]">
            
            {/* Left Column: Guides queue selector and symptoms assistant (Cols 4) */}
            <div className="lg:col-span-4 border-r border-gray-850 bg-[#050b16] p-5 flex flex-col gap-5 text-left select-none">
              
              {/* Selector Segment */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">I. SELECT TROUBLESHOOTING GUIDE</span>
                <div className="flex flex-col gap-2">
                  {VIDEO_GUIDES.map(vg => (
                    <button
                      key={vg.id}
                      onClick={() => {
                        setActiveGuide(vg);
                        setCurrentTime(0);
                        setIsPlaying(false);
                        setHasVideoError(false);
                        if (videoRef.current) videoRef.current.currentTime = 0;
                      }}
                      className={`p-3 rounded-lg border text-xs font-semibold transition-all flex flex-col gap-1 text-left ${
                        activeGuide.id === vg.id
                          ? 'bg-[#FDB813]/10 border-[#FDB813] text-[#FDB813]'
                          : 'bg-[#030913] border-gray-850 text-gray-400 hover:text-white hover:border-gray-750'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-gray-900 border border-gray-800 text-gray-300">{vg.errorCode}</span>
                        <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1">
                          <Clock size={10} /> {vg.durationString}
                        </span>
                      </div>
                      <span className="font-heading truncate block mt-1">{vg.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms Decision Tree Checklist matrix */}
              <div className="border-t border-gray-850/80 pt-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-500">II. COIL/SYSTEM BEHAVIORS</span>
                  <span className="text-[8px] bg-blue-900/30 text-blue-300 font-mono px-1.5 py-0.2 rounded">Real-time overlay</span>
                </div>

                <div className="p-3 bg-[#030913] border border-gray-850 rounded-lg text-[11px] space-y-2.5">
                  <p className="text-gray-400 leading-normal mb-1.5 text-[10px]">Toggle real physical conditions to see visual overlays on the troubleshooting deck.</p>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-700 bg-gray-900 text-[#FDB813] focus:ring-0 w-3.5 h-3.5"
                      checked={symptoms.redLight}
                      onChange={(e) => setSymptoms(prev => ({ ...prev, redLight: e.target.checked }))}
                    />
                    <span>Chassis Red light flashes continuously</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-700 bg-gray-900 text-[#FDB813] focus:ring-0 w-3.5 h-3.5"
                      checked={symptoms.clickingNoise}
                      onChange={(e) => setSymptoms(prev => ({ ...prev, clickingNoise: e.target.checked }))}
                    />
                    <span>Automatic switch makes rattling "clicks"</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-700 bg-gray-900 text-[#FDB813] focus:ring-0 w-3.5 h-3.5"
                      checked={symptoms.hotAir}
                      onChange={(e) => setSymptoms(prev => ({ ...prev, hotAir: e.target.checked }))}
                    />
                    <span>Smell of heavy plastic or static heat sparks</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-700 bg-gray-900 text-[#FDB813] focus:ring-0 w-3.5 h-3.5"
                      checked={symptoms.noDisplay}
                      onChange={(e) => setSymptoms(prev => ({ ...prev, noDisplay: e.target.checked }))}
                    />
                    <span>Completely black screen with no response</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column: Video viewport & details queue (Cols 8) */}
            <div className="lg:col-span-8 p-5 flex flex-col gap-4 text-left">
              
              {/* The Video Display Box */}
              <div className="relative aspect-video w-full bg-black rounded-xl border border-gray-850 overflow-hidden flex flex-col items-center justify-center group shadow-inner">
                
                {/* HTML5 standard media container */}
                <video
                  ref={videoRef}
                  src={activeGuide.videoUrl}
                  onClick={togglePlay}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnded}
                  playsInline
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover select-none cursor-pointer ${
                    isPlaying && !hasVideoError ? 'opacity-90' : 'opacity-40'
                  }`}
                  style={{ display: hasVideoError ? 'none' : 'block' }}
                />

                {/* Simulated diagnostic animated graphic screen shown if HTML5 video blocks/fails, or as overlay */}
                {(hasVideoError || !isPlaying) && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0a1120] to-black">
                    <div className="p-4 bg-blue-950/20 border border-blue-900/3s0 rounded-full mb-3 text-[#FDB813] animate-pulse">
                      <Sliders size={28} />
                    </div>
                    
                    <span className="text-[10px] font-mono uppercase text-[#FDB813] tracking-widest block font-bold mb-1">
                      {isPlaying ? '⚡ DIAGNOSTIC GRAPHIC STREAM ACTIVE' : 'SYSTEM PAUSED'}
                    </span>
                    <h5 className="text-sm font-bold text-gray-200 text-center max-w-sm px-4">
                      {activeGuide.title}
                    </h5>

                    {/* Simulating floating waveforms inside fallback console */}
                    {isPlaying && (
                      <div className="flex gap-1 items-end h-8 mt-4">
                        {Array.from({ length: 15 }).map((_, i) => {
                          const delay = i * 0.1;
                          const ht = [12, 28, 16, 32, 20, 8, 24, 14, 30, 18, 10, 22, 12, 16, 6][i];
                          return (
                            <motion.div
                              key={i}
                              initial={{ height: 4 }}
                              animate={{ height: [4, ht, 4] }}
                              transition={{ duration: 1.2, repeat: Infinity, delay: delay, ease: 'easeInOut' }}
                              className="w-1 bg-gradient-to-t from-amber-600 to-[#FDB813]"
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Subtitles Track Embedded (Bottom of Video panel) */}
                <div className="absolute bottom-16 left-4 right-4 z-20 bg-black/75 backdrop-blur-sm border border-gray-800/60 p-2.5 rounded-lg text-center text-[11px] leading-relaxed select-none">
                  <span className="text-[#FDB813] font-mono tracking-widest font-extrabold uppercase mr-1.5">AUDIO SUB:</span>
                  <span className="text-gray-100 italic">"{activeSubtitle}"</span>
                </div>

                {/* Symptoms Alarm banners appearing in real-time as customized overlays */}
                {symptoms.redLight && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="absolute top-4 left-4 z-20 bg-red-950/90 border border-red-500/50 text-red-200 px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 font-bold"
                  >
                    <AlertCircle size={12} className="text-red-400 animate-pulse" />
                    <span>ALARM ALERT: Critical HW State detected. Press bypass.</span>
                  </motion.div>
                )}

                {symptoms.clickingNoise && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="absolute top-4 right-4 z-20 bg-amber-950/90 border border-amber-500/50 text-amber-200 px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 font-bold"
                  >
                    <Radio size={12} className="text-amber-400 animate-bounce" />
                    <span>ACOUSTIC RELAY FAILURE: Arcing hazardous switch cycles.</span>
                  </motion.div>
                )}

                {symptoms.hotAir && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="absolute bottom-32 left-4 z-20 bg-orange-950/90 border border-orange-500/50 text-orange-200 px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 font-bold"
                  >
                    <Flame size={12} className="text-orange-400 animate-pulse" />
                    <span>THERMAL FAULT: Heatsink over limit. Shutdown immediately!</span>
                  </motion.div>
                )}

                {/* Hover Play/Pause Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25 z-10">
                  <button
                    onClick={togglePlay}
                    className="h-12 w-12 rounded-full bg-[#FDB813] text-[#0A2342] flex items-center justify-center shadow-lg transform hover:scale-105 transition-all text-sm font-bold cursor-pointer"
                  >
                    {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-0.5" />}
                  </button>
                </div>

              </div>

              {/* VIDEO MEDIA CONTROL PANEL DOCK */}
              <div className="bg-[#050b16] border border-gray-850 p-4 rounded-xl flex flex-col gap-3 select-none">
                
                {/* Seek Bar slider */}
                <div className="flex items-center gap-3 w-full">
                  <span className="text-[10px] font-mono text-gray-500">
                    {Math.floor(currentTime / 60).toString().padStart(2, '0')}:
                    {Math.floor(currentTime % 60).toString().padStart(2, '0')}
                  </span>
                  
                  <input
                    type="range"
                    min="0"
                    max={activeGuide.durationSeconds}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FDB813] hover:h-1.5 transition-all"
                  />

                  <span className="text-[10px] font-mono text-gray-300">
                    {activeGuide.durationString}
                  </span>
                </div>

                {/* Audio volume, speeds and immersive hum triggers */}
                <div className="flex flex-wrap gap-4 items-center justify-between mt-1">
                  
                  {/* Left Controls: Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlay}
                      className="px-4 py-1.5 bg-[#FDB813] text-[#0A2342] hover:bg-amber-400 rounded-lg text-xs font-extrabold uppercase flex items-center gap-1 cursor-pointer"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={12} className="fill-current" /> Pause Demo
                        </>
                      ) : (
                        <>
                          <Play size={12} className="fill-current" /> Run Instruction
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleReset}
                      className="p-1.5 bg-gray-900 border border-gray-800 hover:text-white rounded-lg text-gray-400 transition-colors"
                      title="Rewind to start"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>

                  {/* Right Controls: volume & synth */}
                  <div className="flex items-center gap-4 flex-wrap">
                    
                    {/* Immersive Audio Hum Synthesis */}
                    <button
                      onClick={toggleAudioHum}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isHumSynthActive
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 animate-pulse'
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                      }`}
                      title="Synthesize realistic inverter operational mains frequency (55Hz hum)"
                    >
                      <Activity size={10} />
                      <span>{isHumSynthActive ? ' Hum synth (55Hz) ON' : 'Diagnose Hum Sound'}</span>
                    </button>

                    {/* Speed Selector */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-gray-500 mr-1 uppercase">SPEED</span>
                      {[1, 1.5, 2].map(sp => (
                        <button
                          key={sp}
                          onClick={() => setPlaybackSpeed(sp)}
                          className={`px-2 py-1 text-[9px] font-mono font-semibold rounded ${
                            playbackSpeed === sp 
                              ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
                              : 'bg-[#030913] border border-gray-850 text-gray-500 hover:text-white'
                          }`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>

                    {/* Standard slider volume */}
                    <div className="flex items-center gap-1.5 border-l border-gray-800 pl-3">
                      <button 
                        onClick={() => setIsMuted(!isMuted)} 
                        className="text-gray-400 hover:text-white"
                        title={isMuted ? "Unmute Volume" : "Mute Volume"}
                      >
                        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-16 h-1 bg-gray-850 accent-[#FDB813] cursor-pointer"
                      />
                    </div>

                  </div>

                </div>

              </div>

              {/* Step-by-Step interactive checklist corresponding to active troubleshooting guide */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="p-4 bg-[#050b16] border border-gray-850 rounded-xl text-left select-none">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#FDB813] tracking-wider block mb-2">📒 STEP-BY-STEP CALIBRATION SEQUENCE</span>
                  <div className="space-y-2">
                    {activeGuide.steps.map((st, sidx) => (
                      <div key={sidx} className="flex gap-2.5 items-start text-xs">
                        <span className="h-4 w-4 shrink-0 rounded-full bg-blue-900/30 text-blue-300 border border-blue-800 font-mono text-[9px] font-extrabold flex items-center justify-center">
                          {sidx + 1}
                        </span>
                        <p className="text-gray-300 text-[11px] leading-relaxed font-sans">{st}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#0c182f]/40 to-[#040e1b]/40 border border-[#FDB813]/20 rounded-xl text-left flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#FDB813] mb-2">
                      <ShieldAlert size={14} />
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wide">Precautionary Safety Regulations</span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
                      Never remove the outer metal enclosure screws while battery or grid mains inputs are actively connected. Inside filters output up to 350V DC which remains stored in heavy electrolytic capacitor banks for up to 5 minutes after switching off. Ensure you wear rubber-soled footwear during checkouts.
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-850 pt-3 mt-3">
                    <span className="text-[9px] text-[#FDB813] uppercase font-mono font-bold tracking-widest animate-pulse">🔧 SEAFLOWS TACTICAL DEPLOYMENT READY</span>
                    <button
                      onClick={onClose}
                      className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-800/40 text-blue-300 border border-blue-800/50 rounded-lg text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer"
                    >
                      Dispatch System Engineer <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
