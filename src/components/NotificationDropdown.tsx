import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Check, Trash2, Calendar, FileText, MessageSquare, 
  Clock, ArrowUpRight, CheckCheck, Inbox, ShieldAlert
} from 'lucide-react';
import { Notification } from '../types';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onNotificationClick: (notif: Notification) => void;
}

export default function SeaflowsNotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'booking' | 'quote' | 'ticket'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'booking') return n.type === 'booking';
    if (activeFilter === 'quote') return n.type === 'quote';
    if (activeFilter === 'ticket') return n.type === 'ticket';
    return true; // 'all'
  });

  const getIcon = (type: 'booking' | 'quote' | 'ticket') => {
    switch (type) {
      case 'booking':
        return <Calendar size={14} className="text-amber-400" />;
      case 'quote':
        return <FileText size={14} className="text-blue-400" />;
      case 'ticket':
        return <MessageSquare size={14} className="text-emerald-400" />;
    }
  };

  const getColoredBg = (type: 'booking' | 'quote' | 'ticket') => {
    switch (type) {
      case 'booking':
        return 'bg-amber-950/45 border-amber-900/30';
      case 'quote':
        return 'bg-blue-950/45 border-blue-900/30';
      case 'ticket':
        return 'bg-emerald-950/45 border-emerald-900/30';
    }
  };

  return (
    <div className="relative font-sans" ref={dropdownRef} id="notification-dropdown-wrapper">
      {/* TRIGGER BUTTON */}
      <button
        id="navbar-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg border border-gray-800 bg-[#040916]/80 text-gray-400 hover:text-[#FDB813] hover:border-[#FDB813]/40 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
        title="Check Active Updates & Security Logs"
        aria-label="System notifications"
      >
        <Bell size={16} className={unreadCount > 0 ? "animate-wiggle text-amber-400" : ""} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#fdb813] text-[9px] font-heading font-extrabold text-[#0a2342] shadow-md shadow-[#fdb813]/20 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN FRAME */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3.5 w-80 sm:w-96 bg-[#060c18] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 text-left"
          >
            {/* Header */}
            <div className="bg-[#030913]/95 border-b border-gray-850 p-4 flex justify-between items-center bg-radial-gradient(ellipse at top right, rgba(253, 184, 19, 0.05) 0%, transparent 80%)">
              <div className="flex flex-col gap-0.5">
                <span className="font-heading font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={12} className="text-[#FDB813]" /> Seaflows Activity Feed
                </span>
                <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                  Nigeria Grid: {unreadCount} Updates Pending
                </span>
              </div>

              {notifications.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onMarkAllAsRead}
                    className="p-1.5 bg-[#0a1120] hover:bg-[#121c32] border border-gray-850 hover:border-gray-700 text-gray-400 hover:text-white rounded-md text-[10px] uppercase font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Mark all clear"
                  >
                    <CheckCheck size={11} className="text-emerald-400" /> Read All
                  </button>
                  <button
                    onClick={onClearAll}
                    className="p-1.5 bg-[#0a1120] hover:bg-rose-950/25 border border-gray-850 hover:border-rose-900/30 text-gray-450 hover:text-rose-400 rounded-md text-[10px] uppercase font-bold transition-all cursor-pointer flex items-center gap-1"
                    title="Wipe Logs"
                  >
                    <Trash2 size={11} /> Clear
                  </button>
                </div>
              )}
            </div>

            {/* Filter ribbons */}
            <div className="flex gap-1 border-b border-gray-855 px-3.5 py-2 overflow-x-auto bg-[#030913]/40 scrollbar-none select-none">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: `New (${unreadCount})` },
                { id: 'booking', label: 'Bookings' },
                { id: 'quote', label: 'Quotes' },
                { id: 'ticket', label: 'Support' }
              ].map(filt => (
                <button
                  key={filt.id}
                  onClick={() => setActiveFilter(filt.id as any)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                    activeFilter === filt.id 
                      ? 'bg-[#FDB813] text-[#0A2342]' 
                      : 'bg-[#030913] hover:bg-[#0c1426] text-gray-400 hover:text-white border border-gray-855/80'
                  }`}
                >
                  {filt.label}
                </button>
              ))}
            </div>

            {/* Main scrollable list */}
            <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-900/80">
              <AnimatePresence initial={false}>
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.18 }}
                      className={`p-3.5 flex gap-3 transition-colors cursor-pointer group text-left relative ${
                        n.isRead ? 'bg-transparent text-gray-400' : 'bg-blue-950/10 text-white'
                      }`}
                      onClick={() => {
                        onNotificationClick(n);
                        setIsOpen(false);
                      }}
                    >
                      {/* Read status light dot */}
                      {!n.isRead && (
                        <div className="absolute top-[18px] left-1.5 h-1.5 w-1.5 rounded-full bg-[#fdb813] shadow-md shadow-amber-500/40 animate-pulse" />
                      )}

                      {/* Icon wrapper */}
                      <div className={`p-2 rounded-lg border self-start shrink-0 ${getColoredBg(n.type)}`}>
                        {getIcon(n.type)}
                      </div>

                      {/* Messaging */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex justify-between items-start gap-1 pb-0.5">
                          <span className={`text-[11px] font-bold tracking-tight leading-none uppercase ${
                            n.isRead ? 'text-gray-300' : 'text-[#FDB813]'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono flex items-center gap-1 shrink-0">
                            <Clock size={9} /> {n.createdAt}
                          </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-gray-400 group-hover:text-gray-200 transition-colors break-words">
                          {n.message}
                        </p>
                        
                        {/* Interactive footer details */}
                        <div className="flex justify-between items-center mt-1.5 border-t border-dashed border-gray-850/40 pt-1.5">
                          <span className="text-[9px] text-gray-500 font-mono tracking-wider font-semibold">
                            REF: {n.referenceId}
                          </span>
                          <span className="text-[9px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                            Launch Hub <ArrowUpRight size={10} />
                          </span>
                        </div>
                      </div>

                      {/* Quick mark as read */}
                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(n.id);
                          }}
                          className="p-1 px-1.5 text-gray-500 hover:text-emerald-400 border border-transparent hover:border-emerald-950/50 hover:bg-emerald-950/15 roundedSelf-center transition-colors cursor-pointer self-start"
                          title="Mark Read"
                        >
                          <Check size={12} />
                        </button>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-10 flex flex-col items-center justify-center text-center gap-3.5"
                  >
                    <div className="p-4 bg-[#030913] border border-gray-850 text-gray-500 rounded-full bg-radial-gradient(ellipse at center, rgba(30, 58, 138, 0.1) 0%, transparent 70%) animate-pulse shadow-inner">
                      <Inbox size={32} className="text-gray-650" />
                    </div>
                    <div>
                      <h5 className="font-heading font-extrabold text-xs text-white mb-0.5">Clear Operations Logs</h5>
                      <p className="text-[10px] text-gray-500 max-w-[210px] leading-normal font-sans mx-auto">
                        Your microgrid is calibrated and fully stable. No newly compiled status updates are queued.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky footer */}
            <div className="bg-[#030913]/95 border-t border-gray-855 p-3.5 text-center text-[10px] font-mono text-gray-500 tracking-wider">
              Seaflows Control System v2.6 • Port Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
