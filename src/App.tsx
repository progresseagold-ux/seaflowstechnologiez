import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Video, Calculator as CalcIcon, UserRound, ShieldCheck, 
  HelpCircle, Send, Sparkles, Menu, X, ArrowUpRight, Wrench, 
  Info, MessageSquare, AlertTriangle, ShieldAlert, RefreshCw, ArrowUp,
  ChevronDown, ShoppingBag, Calendar, Facebook, Instagram, Phone
} from 'lucide-react';

// Import custom written components
import CompanyLogo from './components/CompanyLogo';
import SeaflowsCalculator from './components/Calculator';
import SeaflowsStore from './components/Store';
import SeaflowsBookingSystem from './components/BookingSystem';
import SeaflowsCustomerPortal from './components/CustomerPortal';
import SeaflowsAdminDashboard from './components/AdminDashboard';
import SeaflowsStaticPages from './components/StaticPages';
import SeaflowsLandingPage, { ScrollReveal } from './components/LandingPage';
import SeaflowsLoginPage from './components/LoginPage';
import SeaflowsSignUpPage from './components/SignUpPage';
import SeaflowsNotificationDropdown from './components/NotificationDropdown';
import SeaflowsMotionBackground, { BackgroundStyle } from './components/MotionBackground';
import { TunnelHeroBackground } from './components/TunnelBackground';
import { supabase } from './lib/supabase';

// Import Types and Sample Data
import { Product, CartItem, Order, Booking, SupportTicket, SolarQuote, CctvQuote, InstallmentPlan, Notification } from './types';
import { SOLAR_PRODUCTS, CCTV_PRODUCTS, BLOG_POSTS, PORTFOLIO_ITEMS, TESTIMONIALS } from './data';
import { DEFAULT_COMP_SELECTIONS, DEFAULT_COMPONENT_PRICES } from './utils/customQuoteDefaults';

export default function App() {
  // Navigation & Screen Control
  const [activeTab, setActiveTab] = useState<'landing' | 'login' | 'signup' | 'home' | 'store' | 'calculators' | 'bookings' | 'portal' | 'admin' | 'info'>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigationScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll-Up floating action state
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isBgControlOpen, setIsBgControlOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smooth auto-scroll to details viewport on any active tab change
  useEffect(() => {
    if (navigationScrollRef.current) {
      navigationScrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  // Global Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('seaflows-theme');
    return saved === 'dark';
  });

  // Apply theme class to document body & html
  useEffect(() => {
    localStorage.setItem('seaflows-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Global Immersive Motion Background State
  const [activeBg, setActiveBg] = useState<BackgroundStyle>(() => {
    const saved = localStorage.getItem('seaflows-active-bg');
    return (saved as BackgroundStyle) || 'solar'; // Start with Solar as the default for gorgeous motion images!
  });

  useEffect(() => {
    localStorage.setItem('seaflows-active-bg', activeBg);
  }, [activeBg]);

  // Core Unified Reactive States
  const [products, setProducts] = useState<Product[]>([...SOLAR_PRODUCTS, ...CCTV_PRODUCTS]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; email: string; phone: string; isLoggedIn: boolean } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Custom Quotation components for administrator configuration
  const [customQuoteComponents, setCustomQuoteComponents] = useState<Record<string, { label: string; checked: boolean; type: string; qty: number; options: string[] }>>(() => {
    const saved = localStorage.getItem('seaflows_custom_quote_components');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_COMP_SELECTIONS;
  });

  const [customQuotePrices, setCustomQuotePrices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('seaflows_custom_quote_prices');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_COMPONENT_PRICES;
  });

  const handleUpdateCustomComponents = (newVal: Record<string, any>) => {
    setCustomQuoteComponents(newVal);
    localStorage.setItem('seaflows_custom_quote_components', JSON.stringify(newVal));
  };

  const handleUpdateCustomPrices = (newPrices: Record<string, number>) => {
    setCustomQuotePrices(newPrices);
    localStorage.setItem('seaflows_custom_quote_prices', JSON.stringify(newPrices));
  };

  // Session Tracking & Reactive updates
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = session.user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

          const isAdminFlag = profile?.is_admin === true;
          setIsAdmin(isAdminFlag);

          const { data: fullProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          setCurrentUser({
            id: user.id,
            name: fullProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Customer',
            email: user.email || '',
            phone: fullProfile?.phone || user.user_metadata?.phone || '+234 814 555 1234',
            isLoggedIn: true
          });
          setActiveTab('home');
        } else {
          setIsAdmin(false);
          setCurrentUser(null);
          setActiveTab('landing');
        }
      } catch (err) {
        console.error('Session retrieve failure:', err);
        setIsAdmin(false);
        setCurrentUser(null);
        setActiveTab('landing');
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkSession();

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        const isAdminFlag = profile?.is_admin === true;
        setIsAdmin(isAdminFlag);

        const { data: fullProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setCurrentUser({
          id: user.id,
          name: fullProfile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'Customer',
          email: user.email || '',
          phone: fullProfile?.phone || user.user_metadata?.phone || '+234 814 555 1234',
          isLoggedIn: true
        });
        if (event === 'SIGNED_IN') {
          setActiveTab('home');
        }
      } else {
        setIsAdmin(false);
        setCurrentUser(null);
        setActiveTab('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Protect all internal dashboard pages & admin route
  useEffect(() => {
    if (isAuthLoading) return;

    const publicTabs = ['landing', 'login', 'signup'];
    if (!currentUser?.isLoggedIn && !publicTabs.includes(activeTab)) {
      setActiveTab('login');
    } else if (activeTab === 'admin' && !isAdmin) {
      setActiveTab('home');
    }
  }, [activeTab, currentUser, isAuthLoading, isAdmin]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setActiveTab('landing');
    } catch (err) {
      console.error('Sign Out failed:', err);
      setCurrentUser(null);
      setActiveTab('landing');
    }
  };

  // Database Seed Pools
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'SF-ORD-8732',
      items: [
        { productId: 'sol-003', name: 'Seaflows Apex 5kVA/48V Smart Hybrid Inverter', quantity: 1, price: 680000 },
        { productId: 'sol-005', name: 'Seaflows Lithium Titan battery 48V', quantity: 1, price: 1500000 }
      ],
      totalNgn: 2180000,
      clientName: 'Chioma Adebayo',
      clientAddress: 'Plot 14, Kola Street, Ikeja GRA, Lagos',
      clientPhone: '+234 814 555 1234',
      status: 'completed',
      createdAt: '2026-05-18'
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-55291',
      clientName: 'Chioma Adebayo',
      clientEmail: 'chioma@example.com',
      clientPhone: '+234 814 555 1234',
      serviceType: 'solar',
      date: '2026-06-15',
      time: '11:00',
      message: 'Residential 5kVA panels mounting verification. Roof angle 15 degrees south.',
      status: 'assigned',
      createdAt: '2026-05-19',
      assignedTechnician: 'Engr. Adebayo Chidi'
    }
  ]);

  const [savedQuotes, setSavedQuotes] = useState<any[]>([
    {
      id: 'QT-8123',
      clientName: 'Chioma Adebayo',
      clientPhone: '+234 814 555 1234',
      type: 'solar',
      recommendedSize: '5kVA Hybrid Solar array package',
      price: 2680000,
      details: 'Sizing load peak at ~3400W. Includes 4x 550W panels with 10kVA Lithium storage storage.',
      status: 'approved',
      createdAt: '2026-05-19'
    }
  ]);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TK-4819',
      clientName: 'Chioma Adebayo',
      clientEmail: 'chioma@example.com',
      subject: 'Inverter mobile cloud synchronization latency',
      message: 'The Wi-Fi card telemetry lags by 5 minutes occasionally during cloud sweeps. Is there a localized firmware update?',
      status: 'open',
      createdAt: '2026-05-20',
      responses: [
        { sender: 'admin', text: 'Hello Chioma. Please recycle your local router power access. We have queued a wireless ping sweep on our central server.', date: '2026-05-20' }
      ]
    }
  ]);

  const [installments, setInstallments] = useState<InstallmentPlan[]>([
    {
      id: 'INST-2917',
      productName: 'Seaflows 5kVA Energy Storage Suite',
      productPrice: 2180000,
      downPaymentNgn: 1090000,
      monthlyPaymentNgn: 218000,
      periodMonths: 6,
      status: 'approved'
    }
  ]);

  const [selectedPortalTab, setSelectedPortalTab] = useState<'orders' | 'installations' | 'quotes' | 'payments' | 'tickets'>('orders');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'NT-1',
      type: 'booking',
      referenceId: 'BK-55291',
      title: 'Booking Assigned',
      message: 'Your solar system installation check on 2026-06-15 has been assigned to Engr. Adebayo Chidi.',
      isRead: false,
      createdAt: '2026-05-19'
    },
    {
      id: 'NT-2',
      type: 'quote',
      referenceId: 'QT-8123',
      title: 'Quote Approved',
      message: 'Your 5kVA Hybrid Solar array quote setup (QT-8123) has been approved for ₦2,680,000.',
      isRead: false,
      createdAt: '2026-05-19'
    },
    {
      id: 'NT-3',
      type: 'ticket',
      referenceId: 'TK-4819',
      title: 'Support Response',
      message: 'Technical Admin replied to your ticket "Inverter mobile cloud synchronization latency".',
      isRead: false,
      createdAt: '2026-05-20'
    }
  ]);

  // --- FLOATING AI BOT CHAT STATE ---
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: "Hello! Welcome to Seaflows Technologies. I am your server-secure AI Engineering assistant.\n\nAsk me about configuring solar energy arrays, sizing calculators, pure sine wave stability, or bullet starlight camera packages!" }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto Scroll Chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiOpen]);

  // Escape key hook to drop back AI Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAiOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- API CALL PROXY HANDLERS ---
  const handleSendAiMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const prompt = customMsg || chatInput;
    if (!prompt.trim()) return;

    // Append client dialogue
    const newHistory = [...chatMessages, { role: 'user' as const, text: prompt }];
    setChatMessages(newHistory);
    setChatInput('');
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt,
          history: chatMessages.slice(-8) // pass last 8 dialogue logs for lightweight context
        })
      });

      if (!response.ok) {
        throw new Error("Credentials missing or gateway server offline.");
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err: any) {
      console.warn("AI assist error:", err);
      setAiError("Check API Settings: Is your GEMINI_API_KEY set under 'Settings > Secrets'?");
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: "I apologize. I am temporarily unable to reach the server. Please verify your GEMINI_API_KEY environment variable is configured in the Settings > Secrets tab on AI Studio." 
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- CART / WISHLIST ACTIONS ---
  const handleAddToCart = (p: Product, qty: number) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === p.id);
      if (exists) {
        return prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product: p, quantity: qty }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const handleUpdateCartQty = (id: string, qty: number) => {
    setCart(prev => prev.map(item => item.product.id === id ? { ...item, quantity: qty } : item));
  };

  const handleAddToWishlist = (p: Product) => {
    if (!wishlist.some(item => item.id === p.id)) {
      setWishlist(prev => [...prev, p]);
    }
  };

  const handleRemoveFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  // --- DYNAMIC DATABASE SUBMISSIONS ---
  const handleAddQuotation = (quote: any) => {
    const freshVal = {
      ...quote,
      id: 'QT-' + Math.floor(Math.random() * 9000 + 1000),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setSavedQuotes(prev => [freshVal, ...prev]);
    alert("Quotation layout secured. Logged inside your portal!");
  };

  const handleAddInstallmentApplication = (app: any) => {
    const freshVal = {
      ...app,
      id: 'INST-' + Math.floor(Math.random() * 9000 + 1000),
      status: 'pending'
    };
    setInstallments(prev => [freshVal, ...prev]);
    alert("Financial installment plan submitted successfully. Review status inside your account dashboard!");
  };

  const handleCheckoutAuthorize = (orderDetails: any) => {
    const newOrd: Order = {
      id: 'SF-ORD-' + Math.floor(Math.random() * 90000 + 10000),
      items: orderDetails.items,
      totalNgn: orderDetails.totalNgn,
      paymentMethod: orderDetails.paymentMethod || 'PAYSTACK',
      clientName: orderDetails.clientName,
      clientAddress: orderDetails.clientAddress,
      clientPhone: orderDetails.clientPhone,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setOrders(prev => [newOrd, ...prev]);
    setCart([]); // Clear cart post checkout auth
  };

  const handleAddBooking = (bk: any) => {
    setBookings(prev => [bk, ...prev]);
  };

  const handleAddTicket = (tk: any) => {
    setTickets(prev => [tk, ...prev]);
  };

  const handleReplyTicket = (ticketId: string, text: string) => {
    setTickets(prev => prev.map(tk => {
      if (tk.id === ticketId) {
        return {
          ...tk,
          responses: [...tk.responses, { sender: 'client', text, date: new Date().toISOString().split('T')[0] }]
        };
      }
      return tk;
    }));
  };

  // --- ADMIN ACTIONS PROXIES ---
  const handleAddProduct = (p: Product) => {
    setProducts(prev => [p, ...prev]);
  };

  const handleUpdateProduct = (p: Product) => {
    setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateBookingStatus = (id: string, status: 'pending' | 'assigned' | 'completed', tech?: string) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id === id) {
        return {
          ...bk,
          status,
          assignedTechnician: tech || bk.assignedTechnician
        };
      }
      return bk;
    }));

    // Dynamic notification trigger
    const targetBooking = bookings.find(b => b.id === id);
    const serviceString = targetBooking ? targetBooking.serviceType.toUpperCase() : 'SOLAR';
    const statusText = status === 'assigned' ? `assigned to ${tech || 'a technician'}` : status;

    setNotifications(prev => [
      {
        id: 'NT-' + Math.floor(Math.random() * 90000 + 10000),
        type: 'booking',
        referenceId: id,
        title: `Booking Updated`,
        message: `Your SLA booking (${id}) for ${serviceString} has been updated to ${statusText.toUpperCase()}.`,
        isRead: false,
        createdAt: new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);
  };

  const handleAdminTicketReply = (id: string, text: string) => {
    setTickets(prev => prev.map(tk => {
      if (tk.id === id) {
        return {
          ...tk,
          status: 'resolved' as const,
          responses: [...tk.responses, { sender: 'admin', text, date: new Date().toISOString().split('T')[0] }]
        };
      }
      return tk;
    }));

    const targetTicket = tickets.find(t => t.id === id);
    const subjectLine = targetTicket ? `"${targetTicket.subject}"` : `ticket ${id}`;

    setNotifications(prev => [
      {
        id: 'NT-' + Math.floor(Math.random() * 90000 + 10000),
        type: 'ticket',
        referenceId: id,
        title: `Support Ticket Response`,
        message: `Support Admin replied to your ticket ${subjectLine}: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`,
        isRead: false,
        createdAt: new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);
  };

  const handleUpdateQuoteStatus = (id: string, type: 'solar' | 'cctv', status: 'pending' | 'approved' | 'rejected') => {
    setSavedQuotes(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, status };
      }
      return q;
    }));

    const targetQuote = savedQuotes.find(q => q.id === id);
    const quoteName = targetQuote ? (targetQuote.recommendedSize || `${type.toUpperCase()} package`) : `${type.toUpperCase()} package`;

    setNotifications(prev => [
      {
        id: 'NT-' + Math.floor(Math.random() * 90000 + 10000),
        type: 'quote',
        referenceId: id,
        title: `Quote Status Update`,
        message: `Your ${quoteName} quote (${id}) has been updated to ${status.toUpperCase()} by the engineering team.`,
        isRead: false,
        createdAt: new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);
  };

  // Notification action handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notif: Notification) => {
    handleMarkAsRead(notif.id);
    
    // Map types to corresponding client portal tabs
    let portalTab: 'orders' | 'installations' | 'quotes' | 'payments' | 'tickets' = 'orders';
    if (notif.type === 'booking') {
      portalTab = 'installations';
    } else if (notif.type === 'quote') {
      portalTab = 'quotes';
    } else if (notif.type === 'ticket') {
      portalTab = 'tickets';
    }
    
    setSelectedPortalTab(portalTab);
    setActiveTab('portal');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#020610] flex flex-col items-center justify-center text-white" id="initial-loading">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw size={36} className="animate-spin text-[#FDB813]" />
          <h2 className="font-heading font-extrabold text-[#FDB813] text-sm tracking-wider uppercase">Seaflows Technologies</h2>
          <p className="text-gray-400 text-xs font-mono">Synchronizing secure grid telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020610] text-gray-150 flex flex-col font-sans selection:bg-[#FDB813] selection:text-[#0A2342]">
      
      {/* Immersive Motion Background Layer */}
      <SeaflowsMotionBackground style={activeBg} />
      
      {/* HEADER RAIL */}
      {currentUser?.isLoggedIn && (
        <header className="sticky top-0 bg-[#040916]/90 backdrop-blur-md border-b border-gray-900 z-40 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center">
            
            <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
              <CompanyLogo />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 glass-floating-nav px-3 py-1.5 transition-all duration-300">
              {[
                { id: 'home', label: 'Explore' },
                { id: 'store', label: 'Storefront' },
                { id: 'calculators', label: 'Sizing & Quotes' },
                { id: 'bookings', label: 'Book Support' },
                { id: 'info', label: 'Organization Info' },
                { id: 'portal', label: 'My Portal' },
                ...(isAdmin ? [{ id: 'admin', label: 'System Admin' }] : [])
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`relative px-4.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
                    activeTab === (tab.id as any) 
                      ? 'text-[#FDB813]' 
                      : 'text-gray-400 hover:text-[#FDB813]'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="activeTabUnder"
                      className="absolute inset-0 bg-[#FDB813]/10 border border-[#FDB813]/30 rounded-full animate-pulse-glow-gold -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Right Action Widgets */}
            <div className="flex items-center gap-3">
              {/* Notification System Dropdown */}
              <SeaflowsNotificationDropdown
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAllNotifications}
                onNotificationClick={handleNotificationClick}
              />

              {/* Dynamic Motion Background Switcher */}
              <button
                onClick={() => {
                  const transitionMap: Record<BackgroundStyle, BackgroundStyle> = {
                    solar: 'cctv',
                    cctv: 'cosmos',
                    cosmos: 'solar'
                  };
                  setActiveBg(transitionMap[activeBg]);
                }}
                className="p-1 px-2.5 rounded-lg border border-gray-850 hover:border-gray-700 bg-gray-950/45 hover:bg-gray-900/40 transition-all duration-200 text-gray-400 hover:text-[#FDB813] flex items-center gap-1.5 cursor-pointer shadow-sm text-xs font-mono font-bold"
                title="Cycle through gorgeous motion backgrounds (Solar, CCTV, Cosmos)"
              >
                <Sparkles size={12} className={activeBg !== 'cosmos' ? 'animate-pulse text-[#FDB813]' : ''} />
                <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider text-gray-400">
                  {activeBg === 'solar' && 'Solar Pattern'}
                  {activeBg === 'cctv' && 'AI Surveillance'}
                  {activeBg === 'cosmos' && 'Cosmos Stars'}
                </span>
              </button>

              {/* Global Theme Toggle */}
              <button
                id="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg border dark-theme-toggle transition-all duration-200 text-gray-500 hover:text-[#FDB813] flex items-center justify-center cursor-pointer shadow-sm"
                title={isDarkMode ? "Switch to Clean Light Theme" : "Switch to High-Contrast Dark Mode"}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun size={16} className="text-[#FDB813] fill-[#FDB813]/25" />
                ) : (
                  <Moon size={16} className="text-[#0A2342] fill-[#0A2342]/10" />
                )}
              </button>

              {/* Quick Stats banner */}
              <div className="hidden md:flex items-center gap-2 bg-[#0c1626]/60 border border-blue-950 px-3.5 py-1.5 rounded-full text-[10px] text-blue-300 font-mono tracking-wider">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                NIGERIA DISTRIBUTED GRID ACTIVE
              </div>

              {/* Secure Log out */}
              <button
                onClick={handleLogout}
                className="bg-red-950/20 hover:bg-red-900/35 text-red-300 border border-red-900/30 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign Out
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* MOBILE EXPANSION NAV MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && currentUser?.isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-[#040916] border-b border-gray-900 px-4 py-6 flex flex-col gap-3.5 z-30"
          >
            {[
              { id: 'home', label: 'Explore Home' },
              { id: 'store', label: 'Storefront Catalog' },
              { id: 'calculators', label: 'Solar & CCTV calculators' },
              { id: 'bookings', label: 'Book Technical SLA' },
              { id: 'info', label: 'Organization Info' },
              { id: 'portal', label: 'Customer Account Portal' },
              ...(isAdmin ? [{ id: 'admin', label: 'Central Administration' }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`py-2 text-left text-sm font-bold uppercase tracking-wider block border-l-2 pl-3 transition-colors ${
                  activeTab === tab.id ? 'border-[#FDB813] text-[#FDB813] bg-[#0b1324]' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="py-2 text-left text-sm font-bold uppercase tracking-wider block border-l-2 pl-3 transition-colors border-rose-900 text-rose-400 bg-rose-950/10 hover:bg-rose-900/30"
            >
              Sign Out Securely
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={navigationScrollRef} className="scroll-mt-24" />

      {/* PRIMARY ACTIVE SCENE RENDER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
        {/* Ambient background particles and subtle glow blobs for premium high-tech feel */}
        <div className="absolute top-[5%] left-[2%] w-64 h-64 rounded-full bg-gradient-to-tr from-[#FDB813]/3 to-transparent blur-3xl pointer-events-none animate-premium-float" />
        <div className="absolute top-[35%] right-[2%] w-80 h-80 rounded-full bg-gradient-to-br from-[#0A2342]/4 to-transparent blur-3xl pointer-events-none animate-premium-float-sec" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {activeTab === 'landing' && (
              <SeaflowsLandingPage 
                onGetStarted={() => setActiveTab('signup')} 
                onLoginClick={() => setActiveTab('login')} 
                onSignUpClick={() => setActiveTab('signup')} 
                isDarkMode={isDarkMode} 
              />
            )}

            {activeTab === 'login' && (
              <SeaflowsLoginPage 
                onSuccess={() => setActiveTab('home')} 
                onSignUpClick={() => setActiveTab('signup')} 
                onBackToLanding={() => setActiveTab('landing')} 
              />
            )}

            {activeTab === 'signup' && (
              <SeaflowsSignUpPage 
                onSuccess={() => setActiveTab('login')} 
                onLoginClick={() => setActiveTab('login')} 
                onBackToLanding={() => setActiveTab('landing')} 
              />
            )}

            {activeTab === 'home' && (
              <div id="home-view" className="flex flex-col gap-12 text-left">
                {/* HERO PRESENTATION GRAPHICS */}
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
                    <span className="text-[#FDB813] text-xs font-mono font-extrabold tracking-widest bg-amber-950/40 border border-amber-900/30 px-3.5 py-1 w-fit rounded-full uppercase">
                      Excellent Connections, Better Value
                    </span>
                    
                    <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight tracking-tight">
                      High-Grade Solar Networks & AI CCTV Surveillance Systems
                    </h1>
                    
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-lg font-sans">
                      Seaflows Technologies delivers certified solar backup microgrids, pure sine wave power inverters, and high-sec PTZ thermal recorders designed for commercial and private complexes throughout Nigeria.
                    </p>

                    <div className="flex flex-wrap gap-3.5 mt-2">
                      <button
                        onClick={() => setActiveTab('calculators')}
                        className="bg-[#FDB813] text-[#0A2342] hover:bg-amber-400 font-heading font-extrabold px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer"
                      >
                        Generate Smart Quote <ArrowUpRight size={14} />
                      </button>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="bg-transparent text-white border border-gray-700 hover:border-gray-500 hover:bg-gray-900/30 font-bold px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition-colors cursor-pointer"
                      >
                        Schedule Technician Site Visit
                      </button>
                    </div>
                  </div>

                  {/* Floating metrics grid on the right of the hero */}
                  <div className="grid grid-cols-2 gap-4 w-full lg:w-fit shrink-0 font-sans z-10 relative">
                    <div className="p-4 bg-[#030913]/90 border border-gray-850 rounded-xl max-w-[160px] card-premium-interactive">
                      <span className="text-[#FDB813] text-2xl font-heading font-extrabold block">280+</span>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-none">Microgrids Deployed</span>
                    </div>
                    <div className="p-4 bg-[#030913]/90 border border-gray-850 rounded-xl max-w-[160px] card-premium-interactive">
                      <span className="text-[#FDB813] text-2xl font-heading font-extrabold block">1,200+</span>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-none">CCTV Mounts Active</span>
                    </div>
                    <div className="p-4 bg-[#030913]/90 border border-gray-850 rounded-xl max-w-[160px] card-premium-interactive">
                      <span className="text-[#FDB813] text-2xl font-heading font-extrabold block">100%</span>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-none">PSW Pure Stability</span>
                    </div>
                    <div className="p-4 bg-[#030913]/90 border border-gray-850 rounded-xl max-w-[160px] card-premium-interactive">
                      <span className="text-[#FDB813] text-2xl font-heading font-extrabold block">Naira</span>
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-none">Zero Fuel Surcharges</span>
                    </div>
                  </div>
                </div>

                {/* QUICK LINK SHORTCUT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <ScrollReveal delay={0.1} direction="left">
                    <div className="group h-full relative overflow-hidden card-premium-interactive bg-[#030913] border border-gray-850 rounded-2xl p-5 hover:border-[#FDB813]/40 transition-all duration-300 cursor-pointer" onClick={() => setActiveTab('store')}>
                      {/* Realistic Background Image */}
                      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-2xl">
                        <img 
                          src="/src/assets/images/store_hardware_bg_1781374182005.jpg" 
                          alt="Hardware Store Solar, Battery, & CCTV Stock Slate background" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-25 group-hover:scale-110 transition-transform duration-700 ease-[0.16,1,0.3,1] saturate-[1.1]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-[#030913]/85 to-[#030913]/55" />
                      </div>

                      <div className="relative z-10">
                        <div className="p-3 bg-blue-950/40 text-[#FDB813] w-fit rounded-xl border border-blue-900/30 mb-4 transition-transform group-hover:rotate-12 duration-300">
                          <Sun size={20} />
                        </div>
                        <h4 className="text-sm font-heading font-extrabold text-white mb-2 group-hover:text-[#FDB813] transition-colors duration-250">Explore Hardware Store</h4>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-[240px]">Browse certified monocrystalline panels, deep cycle gel storage, and starlight surveillance cams with direct Nigeria delivery.</p>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={0.2} direction="up">
                    <div className="group h-full relative overflow-hidden card-premium-interactive bg-[#030913] border border-gray-850 rounded-2xl p-5 hover:border-[#FDB813]/40 transition-all duration-300 cursor-pointer" onClick={() => setActiveTab('calculators')}>
                      {/* Realistic Background Image */}
                      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-2xl">
                        <img 
                          src="/src/assets/images/calculator_tools_bg_1781374199223.jpg" 
                          alt="Solar & CCTV Calculators Visual Slate background" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-25 group-hover:scale-110 transition-transform duration-700 ease-[0.16,1,0.3,1] saturate-[1.1]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-[#030913]/85 to-[#030913]/55" />
                      </div>

                      <div className="relative z-10">
                        <div className="p-3 bg-blue-950/40 text-[#FDB813] w-fit rounded-xl border border-blue-900/30 mb-4 transition-transform group-hover:rotate-12 duration-300">
                          <CalcIcon size={20} />
                        </div>
                        <h4 className="text-sm font-heading font-extrabold text-white mb-2 group-hover:text-[#FDB813] transition-colors duration-250">Sizing & Quote Calculators</h4>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-[240px]">Estimate solar size loads, count required surveillance channels, generate layout quotation sheets, and spread installment payments.</p>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={0.3} direction="right">
                    <div className="group h-full relative overflow-hidden card-premium-interactive bg-[#030913] border border-gray-850 rounded-2xl p-5 hover:border-[#FDB813]/40 transition-all duration-300 cursor-pointer" onClick={() => setActiveTab('bookings')}>
                      {/* Realistic Background Image */}
                      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden rounded-2xl">
                        <img 
                          src="/src/assets/images/technician_install_bg_1781374215505.jpg" 
                          alt="Field Technicians Support Slate background" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-25 group-hover:scale-110 transition-transform duration-700 ease-[0.16,1,0.3,1] saturate-[1.1]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-[#030913]/85 to-[#030913]/55" />
                      </div>

                      <div className="relative z-10">
                        <div className="p-3 bg-blue-950/40 text-[#FDB813] w-fit rounded-xl border border-blue-900/30 mb-4 transition-transform group-hover:rotate-12 duration-300">
                          <Wrench size={20} />
                        </div>
                        <h4 className="text-sm font-heading font-extrabold text-white mb-2 group-hover:text-[#FDB813] transition-colors duration-250">Book Field Technicians</h4>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-[240px]">Secure prioritized site diagnostic inspections or schedule routine solar inverter system checkups with top certified engineers.</p>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* REAL-TIME GROUNDING COMPREHENSIVE CARD GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
                  <div className="lg:col-span-8 h-full">
                    <ScrollReveal direction="left">
                      <div className="group h-full relative overflow-hidden card-premium-interactive bg-[#030913] border border-gray-850 rounded-2xl p-6 flex flex-col justify-between gap-6 hover:border-[#FDB813]/30 transition-all duration-300">
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
                          <div className="p-3 bg-[#0a1120]/80 backdrop-blur-xs rounded-xl border border-gray-900 text-center hover:scale-105 transition-transform duration-200 cursor-pointer">
                            <span className="text-white font-mono font-bold block">15 Mins Response</span>
                            <span className="text-gray-500 text-[9px] uppercase tracking-wider block mt-0.5">SUPPORT TICKETING</span>
                          </div>
                          <div className="p-3 bg-[#0a1120]/80 backdrop-blur-xs rounded-xl border border-gray-900 text-center hover:scale-105 transition-transform duration-200 cursor-pointer">
                            <span className="text-white font-mono font-bold block">IP67 Waterproof</span>
                            <span className="text-gray-500 text-[9px] uppercase tracking-wider block mt-0.5">CAMERA HARDWARE</span>
                          </div>
                          <div className="p-3 bg-[#0a1120]/80 backdrop-blur-xs rounded-xl border border-gray-900 text-center hover:scale-105 transition-transform duration-200 cursor-pointer">
                            <span className="text-white font-mono font-bold block">6,000+ Cycles</span>
                            <span className="text-gray-500 text-[9px] uppercase tracking-wider block mt-0.5">LITHIUM LIFE LIFE</span>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  </div>

                  {/* Quick AI Trigger promo on the side */}
                  <div className="lg:col-span-4 h-full">
                    <ScrollReveal direction="right">
                      <div className="group h-full relative overflow-hidden card-premium-interactive bg-gradient-to-br from-blue-950/20 to-indigo-950/25 border border-blue-900/40 p-6 rounded-2xl flex flex-col justify-between hover:border-[#FDB813]/30 transition-all duration-300">
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
                          <div className="flex gap-1.5 items-center text-[#FDB813] font-bold text-xs uppercase mb-2">
                            <Sparkles size={14} className="animate-pulse" /> Secure AI Agent Assist
                          </div>
                          <h4 className="text-sm font-heading font-extrabold text-white mb-2 group-hover:text-[#FDB813] transition-colors duration-250">Discuss Microgrid Solutions With AI</h4>
                          <p className="text-gray-400 text-xs leading-normal">Have questions? Tap the chatbot floating below to query solar inverter options, pricing rules, or get quick tips on selecting dome cameras.</p>
                        </div>

                        <button
                          onClick={() => setIsAiOpen(true)}
                          className="relative z-10 w-full bg-[#1e345e]/70 hover:bg-[#2c4a85] border border-blue-800 text-blue-300 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
                        >
                          Initiate AI Dialogue Session
                        </button>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
                
              </div>
            )}

            {activeTab === 'store' && (
              <SeaflowsStore
                products={products}
                cart={cart}
                wishlist={wishlist}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onUpdateCartQty={handleUpdateCartQty}
                onAddToWishlist={handleAddToWishlist}
                onRemoveFromWishlist={handleRemoveFromWishlist}
                onCheckout={handleCheckoutAuthorize}
              />
            )}

            {activeTab === 'calculators' && (
              <SeaflowsCalculator 
                onSaveQuote={handleAddQuotation}
                products={products}
                currentUser={currentUser}
                customQuoteComponents={customQuoteComponents}
                customQuotePrices={customQuotePrices}
              />
            )}

            {activeTab === 'bookings' && (
              <SeaflowsBookingSystem 
                onAddBooking={handleAddBooking} 
                currentUser={currentUser}
              />
            )}

            {activeTab === 'info' && (
              <SeaflowsStaticPages 
                portfolio={PORTFOLIO_ITEMS} 
                blogs={BLOG_POSTS} 
                testimonials={TESTIMONIALS}
              />
            )}

            {activeTab === 'portal' && (
              <SeaflowsCustomerPortal 
                currentUser={currentUser}
                onLogin={(u) => setCurrentUser({ ...u, isLoggedIn: true })}
                onLogout={() => setCurrentUser(null)}
                orders={orders}
                bookings={bookings}
                savedQuotes={savedQuotes}
                tickets={tickets}
                installments={installments}
                onAddTicket={handleAddTicket}
                onReplyTicket={handleReplyTicket}
                selectedPortalTab={selectedPortalTab}
                onPortalTabChange={setSelectedPortalTab}
              />
            )}

            {activeTab === 'admin' && (
              <SeaflowsAdminDashboard 
                products={products}
                orders={orders}
                bookings={bookings}
                savedQuotes={savedQuotes}
                tickets={tickets}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onReplyTicket={handleAdminTicketReply}
                onUpdateQuoteStatus={handleUpdateQuoteStatus}
                customQuoteComponents={customQuoteComponents}
                customQuotePrices={customQuotePrices}
                onUpdateCustomComponents={handleUpdateCustomComponents}
                onUpdateCustomPrices={handleUpdateCustomPrices}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* --- FOOTER AT BOTTOM --- */}
      <footer className="bg-[#030913] border-t border-gray-900 py-12 mt-12 text-xs text-gray-500 font-sans transition-colors relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex flex-col gap-1.5 items-center md:items-start text-center md:text-left">
              <CompanyLogo />
              <span className="text-gray-400 block mt-1 tracking-wider italic font-serif">"Excellent Connections, Better Value"</span>
              <div className="flex gap-3 items-center mt-4">
                <a 
                  href="https://wa.me/2349168985436" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Chat on WhatsApp"
                  className="w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all"
                >
                  <Phone size={14} />
                </a>
                <a 
                  href="https://facebook.com/seaflowstechnologies" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Facebook Handle"
                  className="w-8 h-8 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/20 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white hover:scale-110 transition-all"
                >
                  <Facebook size={14} />
                </a>
                <a 
                  href="https://instagram.com/seaflowstechnologies1" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title="Instagram Handle"
                  className="w-8 h-8 rounded-full bg-[#E1306C]/10 border border-[#E1306C]/20 flex items-center justify-center text-[#E1306C] hover:bg-[#E1306C] hover:text-white hover:scale-110 transition-all"
                >
                  <Instagram size={14} />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-center md:items-start w-full md:w-auto">
              <span className="text-white text-[10px] font-mono tracking-widest uppercase">Quick Links</span>
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-gray-400 text-xs">
                <button onClick={() => { setActiveTab('home'); }} className="hover:text-[#FDB813] transition-colors font-semibold">Home</button>
                <span>•</span>
                <button onClick={() => { setActiveTab('store'); }} className="hover:text-[#FDB813] transition-colors font-semibold">Store Catalog</button>
                <span>•</span>
                <button onClick={() => { setActiveTab('calculators'); }} className="hover:text-[#FDB813] transition-colors font-semibold">Calculators</button>
                <span>•</span>
                <button onClick={() => { setActiveTab('info'); }} className="hover:text-[#FDB813] transition-colors font-semibold">About Us</button>
              </div>
            </div>

            <div className="flex flex-col gap-3 items-center md:items-end w-full md:w-auto text-center md:text-right text-[11px]">
              <span className="text-white text-[10px] font-mono tracking-widest uppercase">Official Hotlines</span>
              <a 
                href="https://wa.me/2349168985436" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-emerald-400 font-bold block transition-colors mt-0.5"
              >
                WhatsApp: +234 916 898 5436
              </a>
              <span className="text-gray-500 text-[10px]">TikTok: @Seaflowstechnologies</span>
            </div>
          </div>

          <div className="border-t border-gray-900/60 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-[11px] text-gray-500">
            <div>
              <span>© 2026 Seaflows Technologies Ltd. Built to Africa microgrid specifications.</span>
              <span className="block text-[10px] text-gray-650 mt-0.5">Certified pure sine wave stabilizers & IP67 bullet cams.</span>
            </div>
            <div className="flex gap-1 items-center bg-[#050c18] border border-gray-850 px-3 py-1.5 rounded-lg animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-gray-400 uppercase font-mono tracking-widest">Support Portal Online (15m SLA)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Click outside backdrop model to drop back */}
      <AnimatePresence>
        {isAiOpen && (
          <motion.div
            key="ai-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAiOpen(false)}
            className="fixed inset-0 bg-[#020610] backdrop-blur-[1.5px] z-[48] cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* --- REUSABLE AI CHAT FLOATING BUBBLE COLLAPSED/OPEN --- */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isAiOpen ? (
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              className="bg-[#070e1b] border border-gray-800/90 w-85 sm:w-105 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[580px] border-t-2 border-t-[#FDB813] relative z-50 animate-in text-left"
            >
              {/* AI Chat Header */}
              <div className="bg-[#0a1120] border-b border-gray-850 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-1.5 bg-[#FDB813]/10 text-[#FDB813] font-bold text-[9px] rounded border border-[#FDB813]/25 animate-pulse select-none uppercase tracking-wide">
                    AI Agent Active
                  </div>
                  <span className="font-heading font-extrabold text-xs text-white">Seaflows AI Assistant</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Drop back / Minimize visual action button */}
                  <button 
                    onClick={() => setIsAiOpen(false)}
                    title="Drop Back (Minimize)"
                    className="p-1 px-1.5 bg-[#15233c] hover:bg-[#203454] text-gray-300 hover:text-[#FDB813] border border-gray-800 rounded transition-all text-[10px] flex items-center gap-1 cursor-pointer font-semibold font-mono"
                  >
                    <ChevronDown size={12} className="text-[#FDB813]" />
                    <span>Drop Back</span>
                  </button>

                  <button 
                    onClick={() => setIsAiOpen(false)}
                    className="p-1 bg-[#1c2e4a]/40 hover:bg-gray-800 border border-gray-850 text-gray-450 hover:text-white rounded transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Dialogue Box */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-xs h-[320px] scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col gap-1 max-w-[85%] ${
                      msg.role === 'user' ? 'self-end ml-auto' : 'self-start'
                    }`}
                  >
                    {/* Header line for message sender */}
                    <div className={`flex items-center gap-1 text-[9px] text-gray-450 font-mono tracking-wider ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {msg.role === 'user' ? (
                        <>
                          <span>YOU</span>
                          <UserRound size={10} className="text-gray-500" />
                        </>
                      ) : (
                        <>
                          <Sparkles size={10} className="text-[#FDB813]" />
                          <span className="text-gray-400 font-bold">SEAFLOWS AI</span>
                        </>
                      )}
                    </div>

                    <div
                      className={`p-3 rounded-2xl whitespace-pre-line text-left leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#FDB813] text-[#0A2342] font-semibold rounded-tr-none shadow-[0_2px_8px_rgba(253,184,19,0.15)]' 
                          : 'bg-[#0a1120] border border-gray-850 text-gray-250 rounded-tl-none shadow-[0_2px_6px_rgba(0,0,0,0.25)]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="p-3 bg-[#030913] border border-gray-850 text-gray-450 rounded-xl max-w-[80%] self-start flex items-center gap-2">
                    <RefreshCw size={12} className="animate-spin text-[#FDB813]" />
                    <span>AI Engineering analysis processing...</span>
                  </div>
                )}

                {aiError && (
                  <div className="p-3 bg-red-1000/10 border border-red-900/40 text-red-350 rounded-xl flex items-start gap-1.5 text-[11px] self-start font-mono">
                    <ShieldAlert size={14} className="shrink-0 text-red-400 mt-0.5" />
                    <span>{aiError}</span>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>

              {/* Dynamic Action Shortcuts Navigation Bar */}
              <div className="bg-[#040812] border-t border-gray-900 px-4 py-2 flex flex-col gap-1">
                <span className="text-[9px] text-[#FDB813] font-bold tracking-wider uppercase font-mono block">
                  🚀 Interactive Shortcuts (Auto-Drops Back Assistant):
                </span>
                <div className="grid grid-cols-2 gap-1.5 mt-0.5 pb-0.5">
                  {[
                    { label: "Hardware Store", tab: "store", icon: <ShoppingBag size={10} /> },
                    { label: "Sizing & Quotes", tab: "calculators", icon: <CalcIcon size={10} /> },
                    { label: "Book Support", tab: "bookings", icon: <Calendar size={10} /> },
                    { label: "My Client Portal", tab: "portal", icon: <UserRound size={10} /> }
                  ].map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => {
                        setActiveTab(item.tab as any);
                        setIsAiOpen(false); // Drops back smoothly!
                      }}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 bg-[#0a1224] hover:bg-[#FDB813] hover:text-[#0A2342] text-xs text-gray-300 font-bold border border-gray-850 rounded-lg transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      {item.icon}
                      <span className="text-[9.5px] uppercase tracking-wide">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick suggestion tags */}
              <div className="px-4 pb-2 pt-2 flex flex-wrap gap-1.5 border-t border-gray-900 bg-[#040810]">
                {[
                  "Recommend a CCTV set",
                  "Explain 5kVA Solar Quote",
                  "Warranties & SLA setup",
                  "Installment spread plans"
                ].map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSendAiMessage(undefined, tag)}
                    className="text-[9px] bg-[#080f1d] hover:bg-gray-800 text-gray-450 border border-gray-850/80 px-2.5 py-1 rounded-md transition-colors text-left font-sans select-none cursor-pointer"
                  >
                    💡 {tag}
                  </button>
                ))}
              </div>

              {/* Input console */}
              <form onSubmit={handleSendAiMessage} className="p-3 bg-[#0a1120] border-t border-gray-850 flex gap-2">
                <input
                  type="text"
                  required
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask Seaflows AI Assistant..."
                  className="flex-1 bg-[#040913] text-xs text-white border border-gray-850 rounded-lg p-2 focus:outline-none focus:border-[#FDB813] placeholder-gray-550"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="p-2.5 bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] rounded-lg transition-transform active:scale-95 duration-150 disabled:opacity-50 cursor-pointer flex items-center justify-center"
                >
                  <Send size={13} />
                </button>
              </form>

            </motion.div>
          ) : (
            <motion.button
              layoutId="ai-bubble-floating"
              onClick={() => setIsAiOpen(true)}
              className="bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform transform active:scale-95 duration-200 cursor-pointer"
              title="Speak with Seaflows AI Assistant"
            >
              <MessageSquare size={21} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* GLOBAL PREMIUM AUTO-SCROLL TO TOP TRIGGER */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="fixed bottom-24 right-6.5 z-50 p-3 rounded-full bg-[#0A2342]/90 border border-[#FDB813]/25 text-[#FDB813] hover:text-[#0A2342] hover:bg-[#FDB813] shadow-2xl transition-all duration-350 flex items-center justify-center cursor-pointer animate-pulse-glow-gold"
            id="scroll-to-top"
            title="Auto Scroll to Top"
            aria-label="Scroll back to top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* GLOBAL BACKGROUND EXPERIENCES SELECTOR (BOTTOM-LEFT) */}
      <div className="fixed bottom-6 left-6 z-50 font-sans">
        <AnimatePresence>
          {isBgControlOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-80 bg-[#030914]/95 border border-gray-850 rounded-2xl p-4.5 shadow-2xl backdrop-blur-lg flex flex-col gap-3.5 text-left"
            >
              <div className="flex justify-between items-center border-b border-gray-900 pb-2.5">
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-[#FDB813] uppercase tracking-wider">Immersive Backdrops</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Dynamic Motion Config</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBgControlOpen(false)}
                  className="p-1.5 hover:bg-gray-900 rounded-lg text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Backdrops Selection Group */}
              <div className="flex flex-col gap-2">
                {[
                  { id: 'solar', label: 'Solar Energy Grid', icon: <Sun size={14} className="text-amber-400" />, desc: 'Animated monocrystalline gold cells' },
                  { id: 'cctv', label: 'AI CCTV Scan Net', icon: <Video size={14} className="text-blue-400" />, desc: 'Isometric starlight scanning beams' },
                  { id: 'cosmos', label: 'Deep Cosmic Stars', icon: <Sparkles size={14} className="text-purple-400" />, desc: 'Slow floating ambient color layers' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveBg(item.id as BackgroundStyle)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeBg === item.id 
                        ? 'bg-[#FDB813]/10 border-[#FDB813]/40 text-[#FDB813]' 
                        : 'bg-[#050b18] border-gray-900 hover:border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 bg-[#030913] border border-gray-850 rounded-lg shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold block">{item.label}</span>
                      <span className="text-[9px] text-gray-500 block leading-tight mt-0.5">{item.desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Step-by-Step Educational Info */}
              <div className="bg-[#050b18] border border-gray-900 p-2.5 rounded-xl">
                <span className="text-[9px] text-[#FDB813] uppercase tracking-widest font-mono font-bold block mb-1">IMAGE BACKGROUND STEPS:</span>
                <ul className="text-[9.5px] text-gray-400 space-y-1 font-sans">
                  <li className="flex items-start gap-1">
                    <span className="text-[#FDB813] font-bold">1.</span> 
                    <span>Synthesized high-quality 16:9 theme patterns using AI asset generator</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-[#FDB813] font-bold">2.</span> 
                    <span>Configured slow panning, breathing zoom scale, and scan overlays</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-[#FDB813] font-bold">3.</span> 
                    <span>Constructed fixed, contrast-preserving opacity blending layers</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.button
              layoutId="bg-picker-bubble"
              onClick={() => setIsBgControlOpen(true)}
              className="bg-[#040c1d]/90 hover:bg-gray-900 hover:border-gray-700 text-gray-400 hover:text-[#FDB813] font-bold border border-gray-850 p-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 cursor-pointer transition-transform transform active:scale-95 duration-200"
              title="Change animated background"
            >
              <Sparkles size={16} className={`${activeBg !== 'cosmos' ? 'animate-pulse text-[#FDB813]' : ''}`} />
              <span className="text-[10px] uppercase font-mono tracking-widest font-extrabold pr-1">Change Background</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
