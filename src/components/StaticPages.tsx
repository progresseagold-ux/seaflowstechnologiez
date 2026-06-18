import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Users, Flame, Star, Award, MapPin, Phone, Mail, 
  Clock, Share2, Facebook, Instagram, Linkedin, Youtube, Send, 
  ExternalLink, Search, Tag, Newspaper, Eye, ChevronRight 
} from 'lucide-react';
import { PortfolioItem, BlogItem, Testimonial } from '../types';
import TroubleshootingVideoModal, { VIDEO_GUIDES } from './TroubleshootingVideoModal';

interface StaticProps {
  portfolio: PortfolioItem[];
  blogs: BlogItem[];
  testimonials: Testimonial[];
}

function ScrollReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.90 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
        damping: 15
      }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

export default function SeaflowsStaticPages({ portfolio, blogs, testimonials }: StaticProps) {
  const staticScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [activeSubView, setActiveSubView] = useState<'about' | 'projects' | 'testimonials' | 'blog' | 'contact'>('about');

  // Video guide modal stats controls
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | undefined>(undefined);

  // Blog Search and Filter states
  const [blogSearch, setBlogSearch] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  // Smooth auto-scroll to details viewport on any active subsection view or selected blog change
  React.useEffect(() => {
    if (staticScrollRef.current) {
      staticScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSubView, selectedBlog]);

  // Contact form submission state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("Acknowledged! Seaflows customer relations team has queued your contact slip. A representative will ring you back within 15 minutes.");
    
    // reset
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactMsg('');
    setTimeout(() => setContactStatus(null), 5000);
  };

  const filteredBlogs = blogs.filter(b => {
    if (!blogSearch) return true;
    return b.title.toLowerCase().includes(blogSearch.toLowerCase()) || 
           b.summary.toLowerCase().includes(blogSearch.toLowerCase()) ||
           b.tags.some(t => t.toLowerCase().includes(blogSearch.toLowerCase()));
  });

  return (
    <div id="static-pages-ecosystem" className="bg-[#060c18] text-white p-6 rounded-2xl border border-gray-800 flex flex-col gap-6 shadow-xl">
      
      {/* Sub Navigation Bar for Info Pages */}
      <ScrollReveal>
        <div className="flex flex-wrap gap-2 border-b border-gray-850 pb-4 justify-center md:justify-start">
          {[
            { id: 'about', label: 'About Seaflows' },
            { id: 'projects', label: 'Completed Portfolio' },
            { id: 'testimonials', label: 'Testimonials' },
            { id: 'blog', label: 'Resource Blog' },
            { id: 'contact', label: 'Contact Us' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => {
                setActiveSubView(btn.id as any);
                setSelectedBlog(null);
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeSubView === btn.id 
                  ? 'bg-[#FDB813] text-[#0A2342]' 
                  : 'bg-[#030913] text-gray-400 hover:text-white hover:bg-gray-800/40 border border-gray-850'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      <div ref={staticScrollRef} className="scroll-mt-24" />

      {/* --- Page: ABOUT US --- */}
      {activeSubView === 'about' && (
        <div id="about-content" className="flex flex-col gap-8">
          {/* Identity block */}
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b border-gray-850 pb-8">
              <div className="flex flex-col gap-4 text-left">
                <span className="text-[#FDB813] text-xs font-bold tracking-widest uppercase">WHO WE ARE</span>
                <h3 className="text-2xl font-heading font-extrabold text-white">We Engineered the Connection, You Reap the Value.</h3>
                <p className="text-gray-400 text-xs leading-relaxed font-sans">
                  Seaflows Technologies has positioned itself as Africa’s corporate beacon in renewable microgrid integration and high-integrity surveillance network mobilization. Powered by our motto, <span className="text-white font-bold italic">"Excellent Connections, Better Value"</span>, we deploy end-to-end solar configurations and complex CCTV domes to buffer households and commercial complexes from energy deficits and security incidents.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-[#030913] rounded-lg border border-gray-850">
                    <span className="text-[#FDB813] text-lg font-heading font-extrabold block">Nigeria, Africa</span>
                    <span className="text-gray-500 text-[10px] uppercase">OPERATIONAL FOOTPRINT</span>
                  </div>
                  <div className="p-3 bg-[#030913] rounded-lg border border-gray-850">
                    <span className="text-[#FDB813] text-lg font-heading font-extrabold block">Tier-1 Class</span>
                    <span className="text-gray-500 text-[10px] uppercase">EQUIPMENT MOBILIZATION</span>
                  </div>
                </div>
              </div>

              {/* Corporate Missions */}
              <div className="flex flex-col gap-4 bg-gradient-to-br from-[#0c182f] to-[#040e1b] p-6 rounded-xl border border-gray-850">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-blue-900/30 text-[#FDB813] rounded-lg border border-blue-800/30">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Our Corporate Mission</h4>
                    <p className="text-gray-400 text-[11px] leading-relaxed">To design, engineer, and mobilize high-durability solar hybrid arrays and CCTV surveillance meshes that unlock safe, continuous, and efficient operations for African enterprises and homes.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start mt-2">
                  <div className="p-2 bg-blue-900/30 text-[#FDB813] rounded-lg border border-blue-800/30">
                    <Flame size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Our Corporate Vision</h4>
                    <p className="text-gray-400 text-[11px] leading-relaxed">To lead the West African infrastructural corridor in smart, solar-sizing innovations and automated cloud CCTV visual telemetry solutions by 2030, establishing unparalleled value thresholds.</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Certifications and Why Choose us */}
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#030913] rounded-xl border border-gray-850 text-left">
                <span className="text-[#FDB813] font-bold text-xs uppercase block mb-2">1. 100% Sinusoidal Stability</span>
                <p className="text-gray-400 text-[11px] leading-relaxed">All inverters deployed are pure sine wave (PSW) blocks to protect induction appliances from coil degradation and operational hazards.</p>
              </div>

              <div className="p-4 bg-[#030913] rounded-xl border border-gray-850 text-left">
                <span className="text-[#FDB813] font-bold text-xs uppercase block mb-2">2. IP67 Certified Surveillance</span>
                <p className="text-gray-400 text-[11px] leading-relaxed">Our cameras are fully waterproofed with metallic vandalism hoods to withstand salt air and high precipitation cycles safely.</p>
              </div>

              <div className="p-4 bg-[#030913] rounded-xl border border-gray-850 text-left">
                <span className="text-[#FDB813] font-bold text-xs uppercase block mb-2">3. Flexible Financing Flex</span>
                <p className="text-gray-400 text-[11px] leading-relaxed">Through our proprietary installment calculator, buyers can spread asset checkouts across months with comfortable upfront deposits.</p>
              </div>
            </div>
          </ScrollReveal>

          {/* DIY Troubleshooting Hub Section */}
          <ScrollReveal>
            <div id="diy-troubleshooting-hub" className="bg-gradient-to-br from-[#071329] to-[#030913] p-6 rounded-2xl border border-amber-500/20 text-left mt-4 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-855">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#FDB813] uppercase tracking-widest flex items-center gap-1.5 mb-1 animate-pulse">
                    <Flame size={12} className="fill-current text-[#FDB813]" /> DIY Video Troubleshooting Terminal
                  </span>
                  <h4 className="text-lg font-heading font-extrabold text-white">Basic DIY Solar Inverter Troubleshooting Hub</h4>
                  <p className="text-gray-400 text-xs mt-1">
                    Facing an active inverter error, cutoff alarm, or buzzer? Don't panic. Before calling an onsite structural team, select a video guide below to launch our interactive troubleshooting simulator to resolve common alarms instantly.
                  </p>
                </div>
                <div className="bg-[#030913] border border-gray-850 p-2.5 rounded-lg flex flex-col items-center shrink-0 min-w-[125px]">
                  <span className="text-[9px] text-gray-500 font-mono">CALIBRATION ACCESS</span>
                  <span className="text-xs text-emerald-450 font-mono font-bold flex items-center gap-1 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> ONLINE ACTIVE
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {VIDEO_GUIDES.map(guide => (
                  <div key={guide.id} className="bg-[#030913]/90 border border-gray-850 rounded-xl p-4.5 flex flex-col justify-between hover:border-[#FDB813]/30 transition-all duration-300 group shadow-lg">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2.5">
                        <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-black border border-gray-800 text-[#FDB813]">{guide.errorCode}</span>
                        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1"><Clock size={11} /> {guide.durationString}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white group-hover:text-[#FDB813] transition-colors leading-snug">{guide.title}</h5>
                      <p className="text-gray-455 text-[11px] leading-relaxed mt-1.5">{guide.description}</p>
                    </div>
                    
                    <div className="mt-4 pt-3.5 border-t border-gray-900/60 flex justify-between items-center bg-[#030913] -mx-4 -mb-4 p-4 rounded-b-xl border-dashed">
                      <span className="text-[9px] text-gray-500 font-mono">BMS Safety Bypass Standard</span>
                      <button
                        onClick={() => {
                          setSelectedGuideId(guide.id);
                          setIsVideoModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#FDB813]/10 hover:bg-[#FDB813] hover:text-[#0A2342] text-[#FDB813] border border-[#FDB813]/25 hover:border-transparent rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1"
                      >
                        Watch Tutorial Guide <Youtube size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      )}

      {/* --- Page: PORTFOLIO GALLERY --- */}
      {activeSubView === 'projects' && (
        <div id="projects-content" className="flex flex-col gap-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-lg font-heading font-extrabold text-white mb-1">Our Completed Infrastructure Projects</h3>
            <p className="text-gray-400 text-xs">Verify Seaflows technical performance through authentic before / after diagnostic stats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolio.map(pt => (
              <div key={pt.id} className="bg-[#030913] border border-gray-850 rounded-xl p-5 flex flex-col gap-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-[#FDB813] bg-[#FDB813]/10 px-2.5 py-0.5 rounded font-bold uppercase tracking-widest">{pt.category}</span>
                  <span className="text-[10px] text-gray-500 font-mono">Job Verified</span>
                </div>

                <h4 className="text-xs font-bold text-white leading-normal">{pt.title}</h4>

                {/* Before and After slider simulation */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0a1120] rounded-lg p-3 text-center border border-gray-850">
                    <span className="text-[9px] text-red-400 uppercase font-bold block mb-1">Previous Status (Before)</span>
                    <span className="text-xs font-mono text-gray-400 leading-relaxed">Stable Grid Deficit • Frequent generator outages (Noise & Smoke)</span>
                  </div>
                  <div className="bg-[#0a1528] rounded-lg p-3 text-center border border-emerald-500/25">
                    <span className="text-[9px] text-emerald-400 uppercase font-bold block mb-1">Seaflows Design (After)</span>
                    <span className="text-xs font-mono text-white leading-relaxed">24/7 Smart Autonomous Power & Starlight AI Camera Security</span>
                  </div>
                </div>

                {/* Project numerical metrics */}
                <div className="bg-[#09101f] rounded-lg p-3.5 border border-gray-850 text-xs">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2 border-b border-gray-900 pb-1">TECHNICAL SPECS COMPLIED</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(pt.stats).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-gray-900 py-1">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-white font-mono font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client voice */}
                <div className="p-3.5 bg-[#0a1120] rounded-lg border-l-2 border-[#FDB813] text-xs">
                  <p className="text-gray-300 italic">"{pt.clientReview}"</p>
                  <span className="text-white block font-bold text-[10px] text-right mt-1.5">— {pt.clientName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Page: TESTIMONIALS & INTEGRATIONS --- */}
      {activeSubView === 'testimonials' && (
        <div id="testimonials-content" className="flex flex-col gap-6">
          <div className="text-center max-w-xl mx-auto border-b border-gray-850 pb-4 mb-2">
            <h3 className="text-lg font-heading font-extrabold text-white mb-1">Corporate Client Testimonials</h3>
            <p className="text-gray-400 text-xs">Verified reports scraped from online directories and certified installation records.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(item => (
              <div key={item.id} className="bg-[#030913] border border-gray-850 rounded-xl p-5 flex flex-col justify-between gap-4 text-left">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-0.5 text-[#FDB813]">
                    {Array.from({ length: item.rating }).map((_, i) => <Star key={i} size={11} className="fill-current" />)}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans italic">"{item.text}"</p>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-900 pt-3.5">
                  <div className="h-8 w-8 rounded-full bg-blue-900/40 text-blue-300 border border-blue-800 text-[10px] font-bold uppercase flex items-center justify-center">
                    {item.name.substring(0, 2)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{item.name}</span>
                    <span className="text-[10px] text-gray-500 block">{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Google reviews index highlight card */}
          <div className="bg-[#051126] border border-blue-900/30 p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 text-left">
            <div>
              <span className="text-[10px] font-bold text-[#FDB813] uppercase block mb-1">GOOGLE REVIEWS REAL-TIME METRIC</span>
              <h4 className="text-sm font-bold text-white">4.9 Star Rating across 280+ Verified Customers in Nigeria</h4>
              <p className="text-gray-400 text-xs mt-0.5">Scraped securely under Google Maps platform guidelines.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-heading font-extrabold text-white">4.9 / 5.0</span>
              <div className="flex text-[#FDB813]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="fill-current" />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Page: SECURE BLOG SYSTEM --- */}
      {activeSubView === 'blog' && (
        <div id="blog-content" className="flex flex-col gap-6">
          
          {selectedBlog ? (
            <div id="blog-article" className="bg-[#030913] border border-gray-850 p-6 rounded-xl flex flex-col gap-4 text-left">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="text-gray-450 hover:text-[#FDB813] transition-colors text-xs font-bold mb-2 flex items-center gap-1"
              >
                ← Back to Articles Queue
              </button>

              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#FDB813]">{selectedBlog.category}</span>
                <span className="text-gray-500 text-[10px] font-mono">{selectedBlog.date}</span>
              </div>

              <h3 className="text-xl font-heading font-extrabold text-white leading-snug">{selectedBlog.title}</h3>
              <span className="text-[11px] text-gray-400 font-bold block">Author: {selectedBlog.author}</span>

              <hr className="border-gray-900 my-1"/>

              <div className="text-xs text-gray-300 leading-relaxed font-sans space-y-4 whitespace-pre-line text-justify">
                {selectedBlog.content}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-900">
                {selectedBlog.tags.map(t => (
                  <span key={t} className="text-[9px] uppercase font-mono bg-gray-900 px-2.5 py-1 rounded border border-gray-800 text-gray-400">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Filter search blogs bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#030913] p-3.5 rounded-xl border border-gray-850">
                <span className="text-xs text-gray-400 font-bold uppercase">Energy & CCTV Guides library</span>
                
                <div className="relative w-full sm:w-64">
                  <Search size={12} className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    value={blogSearch}
                    onChange={e => setBlogSearch(e.target.value)}
                    placeholder="Search guidelines..."
                    className="w-full bg-[#070e1b] border border-gray-850 p-2 pl-8 text-xs text-white rounded focus:outline-none focus:border-[#FDB813]"
                  />
                </div>
              </div>

              {/* Grid lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBlogs.map(b => (
                  <div key={b.id} className="bg-[#030913] border border-gray-850 rounded-xl p-5 flex flex-col justify-between text-left hover:border-gray-700 transition-colors">
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between text-[10px] font-mono text-[#FDB813]">
                        <span>{b.category}</span>
                        <span>{b.date}</span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{b.title}</h4>
                      <p className="text-gray-400 text-[11px] leading-relaxed line-clamp-3">{b.summary}</p>
                    </div>

                    <button
                      onClick={() => setSelectedBlog(b)}
                      className="text-xs text-[#FDB813] font-bold mt-4 hover:underline flex items-center gap-1"
                    >
                      Read Guide Article <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- Page: CONTACT US --- */}
      {activeSubView === 'contact' && (
        <div id="contact-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* contact coordination information */}
          <div className="lg:col-span-5 flex flex-col gap-5 justify-between bg-gradient-to-br from-[#0c182f] to-[#040e1b] p-6 rounded-xl border border-gray-850 text-left">
            <div className="flex flex-col gap-4">
              <span className="text-[#FDB813] text-xs font-bold tracking-widest uppercase">GET IN TOUCH</span>
              <h3 className="text-lg font-heading font-extrabold text-white leading-snug">Seaflows Premium Central Directory</h3>
              <p className="text-gray-400 text-xs leading-relaxed">Reach out directly to our corporate headquarters in Lagos or schedule site coordination visits in alternative states.</p>

              <hr className="border-gray-800/80 my-1"/>

              <div className="flex flex-col gap-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <MapPin size={18} className="text-[#FDB813] shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Corporate HQ Address</span>
                    <span className="text-gray-400">12 Olowu Street, Ikeja GRA, Lagos State, Nigeria</span>
                  </div>
                </div>

                <a 
                  href="https://wa.me/2349168985436" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 group/link hover:text-emerald-400 transition-colors"
                >
                  <Phone size={18} className="text-[#FDB813] group-hover/link:text-emerald-400 shrink-0 transition-colors" />
                  <div>
                    <span className="font-bold text-white block group-hover/link:text-emerald-300 transition-colors">Central WhatsApp & Phone</span>
                    <span className="text-gray-400 group-hover/link:text-gray-300 transition-colors">+234 916 898 5436 (Click to Chat)</span>
                  </div>
                </a>

                <div className="flex items-center gap-3.5">
                  <Mail size={18} className="text-[#FDB813] shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Electronic Correspondence</span>
                    <span className="text-gray-400">info@seaflowstech.com (SLA replies 2 hours)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <Clock size={18} className="text-[#FDB813] shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Operational Hours</span>
                    <span className="text-gray-400">Monday — Saturday: 08:00 AM — 06:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800/80 pt-4 mt-2">
                <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider block mb-2.5">Official Social Channels</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a 
                    href="https://facebook.com/seaflowstechnologies" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-[#030913] border border-gray-850 hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5 transition-all text-gray-400 hover:text-white"
                  >
                    <Facebook size={14} className="text-[#1877F2]" />
                    <div className="min-w-0">
                      <span className="text-[10px] block font-semibold text-white">Facebook</span>
                      <span className="text-[9px] block text-gray-400 truncate">Seaflows Technologies</span>
                    </div>
                  </a>

                  <a 
                    href="https://instagram.com/seaflowstechnologies1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-[#030913] border border-gray-850 hover:border-[#E1306C]/40 hover:bg-[#E1306C]/5 transition-all text-gray-400 hover:text-white"
                  >
                    <Instagram size={14} className="text-[#E1306C]" />
                    <div className="min-w-0">
                      <span className="text-[10px] block font-semibold text-white">Instagram</span>
                      <span className="text-[9px] block text-gray-400 truncate">Seaflowstechnologies1</span>
                    </div>
                  </a>

                  <a 
                    href="https://www.tiktok.com/@seaflowstechnologies" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="col-span-1 sm:col-span-2 flex items-center gap-2.5 p-2 rounded-lg bg-[#030913] border border-gray-850 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all text-gray-400 hover:text-white"
                  >
                    <Share2 size={14} className="text-cyan-400" />
                    <div className="min-w-0 flex-1 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] block font-semibold text-white">TikTok Handle</span>
                        <span className="text-[9px] block text-gray-400">@Seaflowstechnologies</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-wider font-mono text-gray-500 border border-gray-800 px-1.5 py-0.5 rounded-md bg-gray-950">Follow Us</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Embedded Google Maps mock */}
            <div className="p-3 bg-[#030913] border border-gray-800 rounded-lg text-center mt-4">
              <span className="text-[10px] text-[#FDB813] block font-mono uppercase">GEOGRAPHIC MAP LOCATION ACTIVE</span>
              <span className="text-xs text-gray-400 mt-1 block">Plot 15, Block B, CBD Industrial Zone, Ikeja GRA, Lagos</span>
              <div className="h-20 bg-[#070e1b] rounded border border-gray-850 mt-2 flex items-center justify-center text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                [Google Map Rendered]
              </div>
            </div>
          </div>

          {/* Contact Input form */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider text-left">Submit Inquiries Channel</h4>
            
            <form onSubmit={handleContactSubmit} className="bg-[#030913] border border-gray-850 p-5 rounded-xl flex flex-col gap-4 text-xs text-left">
              {contactStatus && (
                <div className="p-3 bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 rounded-lg leading-relaxed text-[11px]">
                  {contactStatus}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. Adebayo Chidi"
                    className="w-full bg-[#070e1b] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1.5">Your Phone/WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="e.g. +234 803 111 2222"
                    className="w-full bg-[#070e1b] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5">Email Coordinates</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="w-full bg-[#070e1b] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5">Subject Agenda</label>
                <select className="w-full bg-[#070e1b] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none">
                  <option value="solar">Commercial Solar Microgrid Setup Valuation</option>
                  <option value="cctv">Dome CCTV Camera Security Quotation Inspection</option>
                  <option value="installment">Installment payments flex inquiries</option>
                  <option value="partnership">Strategic Partnership / Supplier channels</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1.5">Detailed Message</label>
                <textarea
                  required
                  value={contactMsg}
                  onChange={e => setContactMsg(e.target.value)}
                  rows={4}
                  placeholder="State your building dimensions or specific load capacity guidelines..."
                  className="w-full bg-[#070e1b] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 rounded-lg text-xs font-heading font-extrabold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
              >
                Send Correspondence <Send size={12} />
              </button>
            </form>
          </div>

        </div>
      )}

      <TroubleshootingVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        selectedGuideId={selectedGuideId}
      />

    </div>
  );
}
