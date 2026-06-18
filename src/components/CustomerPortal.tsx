import React, { useState } from 'react';
import { 
  User, Shield, ShoppingBag, FolderHeart, PenTool, Ticket, MessageCircle, 
  Clock, CheckCircle, RefreshCcw, Send, Sparkles, LogOut, KeyRound 
} from 'lucide-react';
import { Order, SolarQuote, CctvQuote, SupportTicket, Booking, InstallmentPlan } from '../types';

interface PortalProps {
  currentUser: { name: string; email: string; phone: string; isLoggedIn: boolean } | null;
  onLogin: (u: { name: string; email: string; phone: string }) => void;
  onLogout: () => void;
  orders: Order[];
  bookings: Booking[];
  savedQuotes: (SolarQuote | CctvQuote | any)[];
  tickets: SupportTicket[];
  installments: InstallmentPlan[];
  onAddTicket: (ticket: any) => void;
  onReplyTicket: (ticketId: string, reply: string) => void;
  selectedPortalTab?: 'orders' | 'installations' | 'quotes' | 'payments' | 'tickets';
  onPortalTabChange?: (tab: 'orders' | 'installations' | 'quotes' | 'payments' | 'tickets') => void;
}

export default function SeaflowsCustomerPortal({
  currentUser,
  onLogin,
  onLogout,
  orders,
  bookings,
  savedQuotes,
  tickets,
  installments,
  onAddTicket,
  onReplyTicket,
  selectedPortalTab,
  onPortalTabChange
}: PortalProps) {
  // Login credentials state
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Active portal tab
  const [localActivePortalTab, setLocalActivePortalTab] = useState<'orders' | 'installations' | 'quotes' | 'payments' | 'tickets'>('orders');
  const activePortalTab = selectedPortalTab || localActivePortalTab;
  const setActivePortalTab = onPortalTabChange || setLocalActivePortalTab;


  // New Support Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    if (isRegistering) {
      onLogin({
        name: nameInput || 'New Customer',
        email: emailInput,
        phone: phoneInput || '+234 800 000 0000'
      });
    } else {
      // Direct fast passwordless signature
      onLogin({
        name: 'Chioma Adebayo',
        email: emailInput,
        phone: '+234 814 555 1234'
      });
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const newTicket = {
      id: 'TK-' + Math.floor(Math.random() * 90000 + 10000),
      clientName: currentUser?.name || 'Client',
      clientEmail: currentUser?.email || 'email@example.com',
      subject: ticketSubject,
      message: ticketMessage,
      status: 'open' as const,
      createdAt: new Date().toISOString().split('T')[0],
      responses: []
    };

    onAddTicket(newTicket);
    setTicketSubject('');
    setTicketMessage('');
  };

  const handleTicketReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketReplyText.trim() || !selectedTicket) return;

    onReplyTicket(selectedTicket.id, ticketReplyText);
    setTicketReplyText('');
  };

  // Pricing styling
  const formatNgn = (n: number) => '₦' + n.toLocaleString('en-NG');

  // Render Login overlay if guest
  if (!currentUser || !currentUser.isLoggedIn) {
    return (
      <div id="login-container" className="max-w-md mx-auto bg-[#060c18] border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col gap-5 text-white">
        <div className="text-center">
          <div className="mx-auto p-3 bg-blue-950/40 text-[#FDB813] border border-blue-900/40 w-fit rounded-full mb-3">
            <KeyRound size={26} />
          </div>
          <h3 className="font-heading font-extrabold text-white text-base">Secure Customer Authentication</h3>
          <p className="text-gray-400 text-xs mt-1">Access your quotation logs, support tickets, and technician dispatch progress panels immediately.</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-xs">
          {isRegistering && (
            <>
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g. Kolawole Ogunleye"
                  className="w-full bg-[#030913] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  placeholder="e.g. +234 814 555 4321"
                  className="w-full bg-[#030913] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Registered Email Address</label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="e.g. customer@example.com"
              className="w-full bg-[#030913] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Private Credentials Password</label>
            <input
              type="password"
              placeholder="••••••••"
              disabled
              value="********"
              className="w-full bg-[#030913] opacity-60 border border-gray-850 rounded-lg p-2.5 text-xs text-white select-none pointer-events-none"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">Authentication is simplified for this demo environment. No password required.</span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 rounded-lg text-xs font-heading font-extrabold tracking-widest uppercase transition-colors"
          >
            {isRegistering ? 'INITIALIZE USER RECORD' : 'SECURE SIGN IN'}
          </button>
        </form>

        <div className="text-center text-xs border-t border-gray-850 pt-4 flex flex-col gap-2">
          {isRegistering ? (
            <span className="text-gray-400">
              Already have records?{' '}
              <button onClick={() => setIsRegistering(false)} className="text-[#FDB813] font-bold hover:underline">
                Sign In
              </button>
            </span>
          ) : (
            <>
              <span className="text-gray-400">
                First time visitor?{' '}
                <button onClick={() => setIsRegistering(true)} className="text-[#FDB813] font-bold hover:underline">
                  Create Account
                </button>
              </span>
              <div className="bg-[#0b1424] p-3 rounded-lg border border-gray-850/80 text-left text-[11px]">
                <span className="font-bold text-gray-300 block mb-1">✨ Passwordless Demo Account:</span>
                <span className="text-gray-400">Simply key in any email address and hit Sign In to load up an active profile seeded with order logs.</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="customer-portal" className="bg-[#060c18] text-white rounded-2xl border border-gray-800 p-6 flex flex-col gap-6 shadow-2xl">
      
      {/* Portal Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#030a14] p-4 rounded-xl border border-gray-850">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-900/30 border border-blue-700/30 text-[#FDB813] rounded-full">
            <User size={18} />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-white text-sm">{currentUser.name}</h3>
            <span className="text-gray-400 text-[11px] block">{currentUser.email} • {currentUser.phone}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-800 text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
            <Shield size={10} /> Active Portal
          </span>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-red-400 p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Internal Navigation Ribbon */}
      <div className="flex flex-wrap gap-1.5 bg-[#030812] p-1.5 rounded-lg border border-gray-850/80">
        <button
          onClick={() => setActivePortalTab('orders')}
          className={`px-3.5 py-2 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors ${
            activePortalTab === 'orders' ? 'bg-[#FDB813] text-[#0A2342]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingBag size={11} className="inline mr-1" /> Orders ({orders.length})
        </button>

        <button
          onClick={() => setActivePortalTab('installations')}
          className={`px-3.5 py-2 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors ${
            activePortalTab === 'installations' ? 'bg-[#FDB813] text-[#0A2342]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Clock size={11} className="inline mr-1" /> Installations ({bookings.length})
        </button>

        <button
          onClick={() => setActivePortalTab('quotes')}
          className={`px-3.5 py-2 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors ${
            activePortalTab === 'quotes' ? 'bg-[#FDB813] text-[#0A2342]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FolderHeart size={11} className="inline mr-1" /> Saved Quotes ({savedQuotes.length})
        </button>

        <button
          onClick={() => setActivePortalTab('payments')}
          className={`px-3.5 py-2 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors ${
            activePortalTab === 'payments' ? 'bg-[#FDB813] text-[#0A2342]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <PenTool size={11} className="inline mr-1" /> Installments ({installments.length})
        </button>

        <button
          onClick={() => setActivePortalTab('tickets')}
          className={`px-3.5 py-2 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors ${
            activePortalTab === 'tickets' ? 'bg-[#FDB813] text-[#0A2342]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Ticket size={11} className="inline mr-1" /> Support Tickets ({tickets.length})
        </button>
      </div>

      {/* --- PORTAL TAB CONTENT CARDS --- */}
      
      {/* 1. ORDERS LIST TAB */}
      {activePortalTab === 'orders' && (
        <div id="portal-orders-tab" className="flex flex-col gap-4">
          <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Your Fulfillment Purchases</h4>
          
          {orders.map(item => (
            <div key={item.id} className="bg-[#030913] border border-gray-850 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-start gap-2 border-b border-gray-900 pb-3">
                <div>
                  <span className="text-gray-500 text-[10px] block font-mono">ORDER REFERENCE</span>
                  <span className="font-mono text-white text-xs font-bold">{item.id}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-mono">AUTHORIZED ON</span>
                  <span className="text-gray-300 text-xs font-semibold">{item.createdAt}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px] block font-mono">FULFILLMENT DISPATCH</span>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    item.status === 'completed'
                      ? 'bg-emerald-950/85 text-emerald-300 border border-emerald-900/30'
                      : 'bg-amber-950/85 text-amber-300 border border-amber-900/30'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Items lists */}
              <div className="flex flex-col gap-2.5">
                {item.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-300">
                    <span>{it.name} <span className="text-gray-500">x{it.quantity}</span></span>
                    <span className="font-semibold">{formatNgn(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-900 pt-3.5 flex flex-wrap justify-between items-center text-xs gap-2">
                <span className="text-gray-500">Delivery Location: <span className="text-white font-medium">{item.clientAddress}</span></span>
                <span className="text-sm font-heading font-extrabold text-emerald-400">Paid: {formatNgn(item.totalNgn)}</span>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="p-8 text-center bg-[#030913] border border-gray-850 rounded-xl text-gray-500 text-xs">
              No orders found. Add items to cart inside our storefront tab and complete checkout!
            </div>
          )}
        </div>
      )}

      {/* 2. INSTALLATIONS LIST TAB */}
      {activePortalTab === 'installations' && (
        <div id="portal-installations-tab" className="flex flex-col gap-4">
          <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Active Technical Jobs (Progress Monitoring)</h4>

          {bookings.map(bk => (
            <div key={bk.id} className="bg-[#030913] border border-gray-850 p-5 rounded-xl flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="text-xs font-heading font-extrabold text-white uppercase">{bk.serviceType} Site Evaluation</span>
                  <p className="text-gray-500 text-[10px] mt-0.5 font-mono">JOB ID: {bk.id} • Registered {bk.createdAt}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block">SCHEDULE SLOT</span>
                  <span className="font-bold text-[#FDB813] text-xs leading-none">{bk.date} at {bk.time}</span>
                </div>
              </div>

              {/* Progress Stepper Visual indicator */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase py-2 bg-[#09101f] border border-gray-850 rounded-lg">
                <div className="border-r border-gray-850 text-blue-400">1. Form Secured</div>
                <div className={`border-r border-gray-850 ${bk.status !== 'pending' ? 'text-blue-400' : 'text-gray-600'}`}>2. Engineer Assigned</div>
                <div className={bk.status === 'completed' ? 'text-emerald-400' : 'text-gray-600'}>3. Live Testing</div>
              </div>

              <div className="flex flex-wrap justify-between items-center text-xs text-gray-400 pt-2 border-t border-gray-900 gap-2">
                <span>Site Address: <span className="text-white font-medium">{bk.message}</span></span>
                <span>Engineer: <span className="text-white font-semibold">{bk.assignedTechnician || 'Allocating...'}</span></span>
              </div>
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="p-8 text-center bg-[#030913] border border-gray-850 rounded-xl text-gray-500 text-xs">
              No technical bookings resolved. Access the Service scheduling forms to book installations immediately.
            </div>
          )}
        </div>
      )}

      {/* 3. SAVED QUOTATIONS TAB */}
      {activePortalTab === 'quotes' && (
        <div id="portal-quotes-tab" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedQuotes.map((quote, idx) => (
            <div key={idx} className="bg-[#030913] border border-gray-850 rounded-xl p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] uppercase font-bold text-[#FDB813] tracking-widest">{quote.type ? `${quote.type} Quote` : 'System Quote'}</span>
                  <span className="text-[10px] text-gray-500 font-mono">{quote.createdAt || 'Current'}</span>
                </div>
                <h4 className="text-xs font-bold text-white mt-1 leading-normal">{quote.recommendedSize || quote.cameraType || 'Power sizing load calc'}</h4>
                <p className="text-[11px] text-gray-400 leading-normal mt-1.5 italic font-sans">{quote.details || `Sizing Peak: ${quote.load}W. Cost includes hardware array components.`}</p>
              </div>

              <div className="flex justify-between items-end border-t border-gray-900 pt-3">
                <div>
                  <span className="text-[9px] text-gray-500 block uppercase font-mono">Hardware Cost</span>
                  <span className="text-sm font-extrabold text-emerald-400 leading-none">{formatNgn(quote.price)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const text = `Hi Seaflows, I am logged in Seaflows customer page and need physical verification of my saved quote (${quote.recommendedSize || 'Power Load Specs'}).\n\n- Approximate Price index: ₦${quote.price.toLocaleString()}`;
                    window.open(`https://wa.me/2349168985436?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  Confirm Quote
                </button>
              </div>
            </div>
          ))}

          {savedQuotes.length === 0 && (
            <div className="col-span-2 p-8 text-center bg-[#030913] border border-gray-850 rounded-xl text-gray-500 text-xs">
              No custom calculated quotation data saved. Go to our sizing, solar, or CCTV calculators, input specifications, and tap Save!
            </div>
          )}
        </div>
      )}

      {/* 4. INSTALLMENTS LISTING TAB */}
      {activePortalTab === 'payments' && (
        <div id="portal-installments-tab" className="flex flex-col gap-4">
          <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Installment Repayments & Balancing Tracker</h4>

          {installments.map(inst => (
            <div key={inst.id} className="bg-[#030913] border border-gray-850 p-5 rounded-xl flex flex-col gap-4">
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <span className="bg-[#FDB813]/10 text-[#FDB813] text-[9px] uppercase px-2 py-0.5 rounded font-mono font-bold tracking-wider">{inst.id}</span>
                  <h4 className="text-xs font-bold text-white mt-1.5">{inst.productName}</h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block leading-none">APPLICATION STATE</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 block rounded ${
                    inst.status === 'approved' 
                      ? 'bg-emerald-950/85 text-emerald-300' 
                      : inst.status === 'rejected'
                        ? 'bg-red-950/85 text-red-300'
                        : 'bg-amber-950/85 text-amber-300'
                  }`}>
                    {inst.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0a1120] border border-gray-850 p-3.5 rounded-lg text-xs">
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Cost Limit</span>
                  <span className="font-bold text-white">{formatNgn(inst.productPrice)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Down Payment Paid</span>
                  <span className="font-bold text-white">{formatNgn(inst.downPaymentNgn)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Flex Term</span>
                  <span className="font-bold text-white">{inst.periodMonths} Months</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase">Monthly Repay</span>
                  <span className="font-bold text-[#FDB813]">{formatNgn(inst.monthlyPaymentNgn)}</span>
                </div>
              </div>

              {inst.status === 'approved' && (
                <div className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                  ✓ Financing Approved. Site mobilization is launched. Monthly payments are due securely on the 28th of each consecutive period.
                </div>
              )}
            </div>
          ))}

          {installments.length === 0 && (
            <div className="p-8 text-center bg-[#030913] border border-gray-850 rounded-xl text-gray-500 text-xs">
              No current installment agreements. Set up your financing layout inside the Installments tab!
            </div>
          )}
        </div>
      )}

      {/* 5. SUPPORT TICKETS WORKSPACE */}
      {activePortalTab === 'tickets' && (
        <div id="portal-tickets-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Create new ticket & list of tickets */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Lodge Helpdesk Support Complaint</h4>
            
            <form onSubmit={handleCreateTicketSubmit} className="bg-[#030913] p-4 rounded-xl border border-gray-850 flex flex-col gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subject / System Issue</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={e => setTicketSubject(e.target.value)}
                  placeholder="e.g. Inverter Wi-Fi application offline"
                  className="w-full bg-[#070e1b] border border-gray-850 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Message Description</label>
                <textarea
                  required
                  value={ticketMessage}
                  onChange={e => setTicketMessage(e.target.value)}
                  rows={4}
                  placeholder="Describe your system behavior. specify battery state logs or blinking warning code cycles..."
                  className="w-full bg-[#070e1b] border border-gray-850 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#FDB813] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Launch Helpdesk Ticket
              </button>
            </form>

            <hr className="border-gray-850"/>

            {/* List historic tickets */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Lodge Ticket Logs:</span>
              {tickets.map(tk => (
                <div
                  key={tk.id}
                  onClick={() => setSelectedTicket(tk)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selectedTicket?.id === tk.id 
                      ? 'bg-blue-600/10 border-blue-500' 
                      : 'bg-[#030913] border-gray-850 hover:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white font-mono">{tk.id}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      tk.status === 'open' ? 'bg-amber-950/85 text-amber-300' : 'bg-emerald-950/85 text-emerald-300'
                    }`}>
                      {tk.status}
                    </span>
                  </div>
                  <span className="text-gray-300 block font-semibold truncate">{tk.subject}</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-1 text-right block">{tk.createdAt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Messages console */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-[#030913] border border-gray-850 rounded-xl p-5 h-full flex flex-col justify-between min-h-[400px]">
                <div>
                  <div className="flex justify-between items-center border-b border-gray-900 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block">{selectedTicket.id} REGISTERATIVE SLIP</span>
                      <h4 className="text-xs font-bold text-white">{selectedTicket.subject}</h4>
                    </div>
                    <button onClick={() => setSelectedTicket(null)} className="text-xs text-gray-400 hover:text-white transition-colors">
                      Close Viewer
                    </button>
                  </div>

                  {/* Thread display */}
                  <div className="flex flex-col gap-3.5 max-h-[250px] overflow-y-auto pr-1">
                    {/* Main Client message */}
                    <div className="p-3 bg-[#0a1120] border border-gray-850 rounded-lg text-xs text-gray-300 self-start max-w-[90%]">
                      <span className="font-bold text-white block text-[10px] mb-1">{currentUser.name} (Client) • {selectedTicket.createdAt}</span>
                      <p className="font-sans">"{selectedTicket.message}"</p>
                    </div>

                    {/* Replies thread */}
                    {selectedTicket.responses.map((resp, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg text-xs text-gray-300 max-w-[90%] ${
                          resp.sender === 'admin' 
                            ? 'bg-blue-950/40 border border-blue-900/40 self-end ml-auto' 
                            : 'bg-[#0a1120] border border-gray-850'
                        }`}
                      >
                        <span className="font-bold text-white block text-[10px] mb-1">
                          {resp.sender === 'admin' ? 'Seaflows Support Helpdesk' : currentUser.name} • {resp.date}
                        </span>
                        <p className="font-sans">{resp.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleTicketReplySubmit} className="flex gap-2 mt-4 border-t border-gray-900 pt-4">
                  <input
                    type="text"
                    required
                    value={ticketReplyText}
                    onChange={e => setTicketReplyText(e.target.value)}
                    placeholder="Enter message replies for support engineers..."
                    className="flex-1 bg-[#070e1b] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-[#030913] rounded-xl border border-gray-850 text-gray-500 min-h-[400px]">
                <Ticket size={40} className="text-gray-700 mb-2 animate-bounce" />
                <span className="text-xs">No ticket chosen. Select an existing ticket from your log lists, or compile helpdesk filings on the left panel.</span>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
