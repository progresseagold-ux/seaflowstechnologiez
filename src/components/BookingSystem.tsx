import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ToggleRight, MessageSquare, Phone, Send, Info, CheckCircle2 } from 'lucide-react';

interface BookingProps {
  onAddBooking: (booking: any) => void;
  currentUser?: { name: string; email: string; phone: string } | null;
}

export default function SeaflowsBookingSystem({ onAddBooking, currentUser }: BookingProps) {
  const [serviceType, setServiceType] = useState<'solar' | 'cctv' | 'maintenance' | 'inspection' | 'consultation'>('solar');
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '');
  const [bookingDate, setBookingDate] = useState('2026-06-10');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [siteLocation, setSiteLocation] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [bookedReceipt, setBookedReceipt] = useState<any | null>(null);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData = {
      id: 'BK-' + Math.floor(Math.random() * 90000 + 10000),
      clientName,
      clientEmail,
      clientPhone,
      serviceType,
      date: bookingDate,
      time: bookingTime,
      message: `${clientMessage} (Location: ${siteLocation})`,
      status: 'pending' as const,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddBooking(bookingData);
    setBookedReceipt(bookingData);

    // Reset fields except identifiers
    setSiteLocation('');
    setClientMessage('');
  };

  const dispatchWhatsAppNotification = (bk: any) => {
    const textMessage = `Hello Seaflows Technologies, I scheduled an installation or support slot on your platform.\n\n*Reservation ID:* ${bk.id}\n- Service type: ${bk.serviceType.toUpperCase()}\n- Client: ${bk.clientName}\n- Contact: ${bk.clientPhone}\n- Schedule: ${bk.date} at ${bk.time}\n\nPlease confirm availability!`;
    window.open(`https://wa.me/2349168985436?text=${encodeURIComponent(textMessage)}`, '_blank');
  };

  return (
    <div id="booking-ecosystem" className="bg-[#060c18] text-white p-6 rounded-2xl border border-gray-800 shadow-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column - booking form */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#FDB813] block mb-1">NATIONWIDE TECHNICAL COORDINATION</span>
            <h2 className="text-xl font-heading font-extrabold text-white">Schedule On-Site Installation & Assessment</h2>
            <p className="text-gray-400 text-xs text-balance mt-1">Book premium Seaflows technicians for solar panel arrays placement, system inspections, cabling maintenance, or professional CCTV mounts.</p>
          </div>

          <form onSubmit={handleSubmitBooking} className="flex flex-col gap-4 bg-[#030913] p-5 rounded-xl border border-gray-800">
            {/* Service Type selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Service Segment Required</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'solar', label: 'Solar Install' },
                  { id: 'cctv', label: 'CCTV Install' },
                  { id: 'maintenance', label: 'Maintenance' },
                  { id: 'inspection', label: 'Diagnostic' },
                  { id: 'consultation', label: 'Consult' }
                ].map(srv => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setServiceType(srv.id as any)}
                    className={`py-2 px-1 rounded-lg border text-center font-bold text-[10px] tracking-wider transition-colors uppercase ${
                      serviceType === srv.id 
                        ? 'bg-blue-600/20 text-blue-300 border-blue-500 shadow' 
                        : 'bg-[#0a1120] text-gray-400 border-gray-850 hover:border-gray-800'
                    }`}
                  >
                    {srv.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Coordinates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="e.g. Kolawole Chidi"
                  className="w-full bg-[#0a1120] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Phone Number / WhatsApp</label>
                <input 
                  type="text" 
                  required
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  placeholder="e.g. +234 814 555 0000"
                  className="w-full bg-[#0a1120] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
                placeholder="e.g. client@example.com"
                className="w-full bg-[#0a1120] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Schedule picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Calendar size={12} className="text-[#FDB813]" /> Date Selection
                </label>
                <input 
                  type="date" 
                  required
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full bg-[#0a1120] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-[#FDB813]" /> Hour Slot
                </label>
                <select
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  className="w-full bg-[#0a1120] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="09:00">09:00 AM (Morning Session)</option>
                  <option value="11:00">11:00 AM (Mid-Day slot)</option>
                  <option value="13:00">01:00 PM (Afternoon slot)</option>
                  <option value="15:00">03:00 PM (Late Session)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Site Coordinate Location Address</label>
              <input 
                type="text" 
                required
                value={siteLocation}
                onChange={e => setSiteLocation(e.target.value)}
                placeholder="e.g. Plot 4B, Chevron Way, Lekki, Lagos"
                className="w-full bg-[#0a1120] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Specific Instructions / Appliance notes</label>
              <textarea 
                value={clientMessage}
                onChange={e => setClientMessage(e.target.value)}
                rows={3}
                placeholder="Specify roof layout angle or number of CCTV camera mounting heights..."
                className="w-full bg-[#0a1120] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 rounded-lg text-xs font-heading font-extrabold tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5"
            >
              Allocate Booking Slot <Send size={13} />
            </button>
          </form>
        </div>

        {/* Right column - booked notices or informational panels */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {bookedReceipt ? (
            <div id="booking-receipt" className="bg-gradient-to-br from-[#0c182f] to-[#040e1b] p-6 rounded-xl border border-emerald-500/40 relative">
              <div className="p-2 bg-emerald-900/30 border border-emerald-600/30 text-emerald-300 w-fit rounded-full mb-3 animate-pulse">
                <CheckCircle2 size={24} />
              </div>
              
              <h3 className="font-heading font-extrabold text-white text-base">Booking Slot Secured!</h3>
              <p className="text-gray-400 text-[11px] mt-1">Your temporary technician booking is authorized. System code: <span className="font-mono text-emerald-400 font-bold">{bookedReceipt.id}</span></p>

              <div className="flex flex-col gap-3 mt-5 pb-4 border-b border-gray-850 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Class Type:</span>
                  <span className="font-bold text-white uppercase">{bookedReceipt.serviceType} Installation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scheduled Date:</span>
                  <span className="font-bold text-white">{bookedReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scheduled Hour:</span>
                  <span className="font-bold text-[#FDB813]">{bookedReceipt.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Primary Contact:</span>
                  <span className="font-bold text-white">{bookedReceipt.clientPhone}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatchWhatsAppNotification(bookedReceipt)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={13} /> Confirm via Instant WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setBookedReceipt(null)}
                  className="w-full bg-[#101b30] hover:bg-gray-800 text-gray-400 py-2 px-3 rounded-lg text-[11px] font-semibold transition-colors text-center"
                >
                  Schedule Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#030913] p-5 rounded-xl border border-gray-800 flex flex-col gap-4">
              <h4 className="text-[#FDB813] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Info size={14} /> Service Mobilization Notice
              </h4>
              
              <div className="flex flex-col gap-4 text-xs text-gray-300 leading-relaxed">
                <div className="p-3 bg-[#0a1120] border-l-2 border-amber-500 rounded-r-lg">
                  <span className="font-bold text-white block">1. Inspection site evaluation fee:</span>
                  <span className="text-[11px] text-gray-400">A diagnostic site visitation charge of ₦15,000 applies across Lagos, Oyo, Abuja, and Rivers states. Free during active equipment checkout!</span>
                </div>

                <div className="p-3 bg-[#0a1120] border-l-2 border-[#16A34A] rounded-r-lg">
                  <span className="font-bold text-white block">2. Fast Dispatch Channels:</span>
                  <span className="text-[11px] text-gray-400">Scheduled slots are locked. Once locked, Seaflows sends an automated WhatsApp confirmation slip directly to coordinate team loading sheets.</span>
                </div>

                <div className="p-3 bg-[#0a1120] border-l-2 border-blue-500 rounded-r-lg">
                  <span className="font-bold text-white block">3. Safety Standards:</span>
                  <span className="text-[11px] text-gray-400">All assigned engineers are fully insured and carry brand identification badges for corporate secure entry verification tags.</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
