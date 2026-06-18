import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, FileText, ClipboardList, Percent, Plus, Trash2, 
  Download, Send, ArrowRight, Share2, AlertCircle, CheckCircle, Check, Smartphone 
} from 'lucide-react';
import { Product } from '../types';
import { DEFAULT_COMP_SELECTIONS, DEFAULT_COMPONENT_PRICES } from '../utils/customQuoteDefaults';
import { downloadSolarQuotePdf, downloadCctvQuotePdf } from '../utils/pdfGenerator';

interface CalculatorProps {
  onSaveQuote?: (quote: any) => void;
  products: Product[];
  currentUser?: { name: string; email: string; phone: string } | null;
  customQuoteComponents?: Record<string, { label: string; checked: boolean; type: string; qty: number; options: string[] }>;
  customQuotePrices?: Record<string, number>;
}

interface SizingItem {
  id: string;
  appliance: string;
  qty: number;
  watts: number;
  hours: number;
}

const COMMON_APPLIANCES = [
  { name: 'LED Light Bulb', defaultWatts: 15 },
  { name: 'Ceiling Fan', defaultWatts: 75 },
  { name: 'LED Television', defaultWatts: 120 },
  { name: 'Refrigerator / Freezer', defaultWatts: 250 },
  { name: 'Air Conditioner (1.5 HP)', defaultWatts: 1200 },
  { name: 'Laptop / PC', defaultWatts: 100 },
  { name: 'Water Pumping Machine', defaultWatts: 750 },
  { name: 'Microwave Oven', defaultWatts: 1200 },
  { name: 'Washing Machine', defaultWatts: 500 }
];

export default function SolarCctvCalculator({ 
  onSaveQuote, 
  products, 
  currentUser,
  customQuoteComponents,
  customQuotePrices
}: CalculatorProps) {
  const calcDetailsRef = React.useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<'sizing' | 'solar-quote' | 'cctv-quote' | 'installment'>('sizing');

  React.useEffect(() => {
    if (activeTab && calcDetailsRef.current) {
      calcDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- 1. SOLAR SIZING CALCULATOR STUFF ---
  const [sizingItems, setSizingItems] = useState<SizingItem[]>([
    { id: '1', appliance: 'LED Light Bulb', qty: 10, watts: 15, hours: 8 },
    { id: '2', appliance: 'Ceiling Fan', qty: 4, watts: 75, hours: 12 },
    { id: '3', appliance: 'LED Television', qty: 2, watts: 120, hours: 6 },
    { id: '4', appliance: 'Refrigerator / Freezer', qty: 1, watts: 250, hours: 24 }
  ]);
  const [customName, setCustomName] = useState('');
  const [customWatts, setCustomWatts] = useState(100);
  const [customQty, setCustomQty] = useState(1);
  const [customHours, setCustomHours] = useState(6);

  const addSizingItem = () => {
    if (!customName.trim()) return;
    setSizingItems([
      ...sizingItems,
      {
        id: Date.now().toString(),
        appliance: customName,
        watts: customWatts,
        qty: customQty,
        hours: customHours
      }
    ]);
    setCustomName('');
    setCustomWatts(100);
    setCustomQty(1);
    setCustomHours(6);
  };

  const removeSizingItem = (id: string) => {
    setSizingItems(sizingItems.filter(item => item.id !== id));
  };

  // Sizing Calculations
  const calculateSizing = () => {
    let totalRunningWatts = 0;
    let totalDailyWh = 0;
    let peakDemandWatts = 0; // tracking inductive motor peaks

    sizingItems.forEach(item => {
      const running = item.watts * item.qty;
      totalRunningWatts += running;
      totalDailyWh += running * item.hours;
      
      // Inductive loads start peak handles
      if (item.appliance.toLowerCase().includes('condit') || item.appliance.toLowerCase().includes('pump') || item.appliance.toLowerCase().includes('fridge')) {
        peakDemandWatts += running * 2.5; // starting factor
      } else {
        peakDemandWatts += running;
      }
    });

    const dailyKwh = totalDailyWh / 1000;
    
    // Inverter size: Total running watts + padding (25% safety gap) or peak demand, whichever is higher
    const recommendedInverterW = Math.max(totalRunningWatts * 1.25, peakDemandWatts * 0.7);
    const inverterKva = Math.max(1.0, parseFloat((recommendedInverterW / 800).toFixed(1))); // power factor 0.8 scale

    // Battery Bank setup (Assume 48V bank for stability above 3KVA, 24V below)
    const systemVoltage = inverterKva >= 3.0 ? 48 : 24;
    // Autonomy target: 1.2 days, Depth of Discharge gap: 50% for Gel, 80% for Lithium. Let's use 60% average.
    const batteryCapacityAh = Math.round((totalDailyWh * 1.2) / (systemVoltage * 0.6));

    // Solar Panel Array (Assume 5 hours of peak sun in Nigeria)
    // Panel expansion factor (30% systemic losses capture)
    const requiredPanelWatts = Math.round((totalDailyWh * 1.3) / 5);
    const panels500wCount = Math.max(1, Math.round(requiredPanelWatts / 500));

    // Charge controller size (A) = Panel Watts / system voltage
    const chargeControllerA = Math.round(requiredPanelWatts / systemVoltage);

    // Costs
    const estimatedCostNgn = Math.round(
      (panels500wCount * 170000) + // panels
      (inverterKva >= 5 ? 680000 : 420000) + // inverter
      (batteryCapacityAh > 200 ? 1500000 : 500000) + // battery
      150000 // cabling, installation and iron frames
    );

    return {
      totalRunningWatts,
      dailyKwh,
      inverterKva,
      systemVoltage,
      batteryCapacityAh,
      requiredPanelWatts,
      panels500wCount,
      chargeControllerA,
      estimatedCostNgn
    };
  };

  const sizingResults = calculateSizing();

  // --- 2. AUTOMATED SOLAR QUOTE GENERATOR STATE ---
  const [solarSqFt, setSolarSqFt] = useState<'duplex' | 'flat' | 'bungalow' | 'commercial'>('flat');
  const [solarLoc, setSolarLoc] = useState('Lekki, Lagos');
  const [solarBackup, setSolarBackup] = useState(12); // hours
  const [solarPreferredLoad, setSolarPreferredLoad] = useState<'basic' | 'medium' | 'heavy'>('medium');
  const [showSolarResult, setShowSolarResult] = useState(false);
  const [solarQuoteResult, setSolarQuoteResult] = useState<any>(null);

  // --- COMPONENT-BASED SOLAR QUOTING STATE ---
  const [solarSubTab, setSolarSubTab] = useState<'instant' | 'custom'>('instant');
  const [compSelections, setCompSelections] = useState<Record<string, { label: string; checked: boolean; type: string; qty: number; options: string[] }>>(() => {
    return customQuoteComponents || DEFAULT_COMP_SELECTIONS;
  });

  React.useEffect(() => {
    if (customQuoteComponents) {
      setCompSelections(prev => {
        const merged = { ...prev };
        Object.entries(customQuoteComponents).forEach(([key, val]) => {
          if (!merged[key]) {
            merged[key] = { ...val };
          } else {
            merged[key] = {
              ...merged[key],
              label: val.label,
              options: val.options,
              type: val.options.includes(merged[key].type) ? merged[key].type : val.type
            };
          }
        });
        return merged;
      });
    }
  }, [customQuoteComponents]);

  const [customClientName, setCustomClientName] = useState('');
  const [showCompResult, setShowCompResult] = useState(false);
  const [compSuccessMsg, setCompSuccessMsg] = useState(false);

  const componentPricesObj: Record<string, number> = customQuotePrices || DEFAULT_COMPONENT_PRICES;

  React.useEffect(() => {
    if (currentUser?.name && !customClientName) {
      setCustomClientName(currentUser.name);
    }
  }, [currentUser]);

  const toggleCompCheckedVal = (key: string) => {
    setCompSelections(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        checked: !prev[key].checked
      }
    }));
  };

  const updateCompTypeVal = (key: string, opt: string) => {
    setCompSelections(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        type: opt
      }
    }));
  };

  const updateCompQtyVal = (key: string, quantity: number) => {
    setCompSelections(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        qty: Math.max(0, quantity)
      }
    }));
  };

  const calculateCustomTotalCost = () => {
    let total = 0;
    Object.keys(compSelections).forEach(key => {
      const item = compSelections[key];
      if (item.checked) {
        const itemPrice = componentPricesObj[item.type] || 0;
        total += itemPrice * item.qty;
      }
    });
    return total;
  };

  const generateSolarQuote = (e: React.FormEvent) => {
    e.preventDefault();
    
    let loadKw = 2.5;
    let inverterKVA = 3.5;
    let panelsCount = 6;
    let batterySpecs = '48V 100Ah Lithium Bank';
    let basePrice = 2400000;
    let annualSavings = 650000;

    if (solarPreferredLoad === 'basic') {
      loadKw = 1.2;
      inverterKVA = 1.5;
      panelsCount = 4;
      batterySpecs = '24V 200Ah Gel Pack';
      basePrice = 1250000;
      annualSavings = 380000;
    } else if (solarPreferredLoad === 'heavy') {
      loadKw = 7.5;
      inverterKVA = 7.5;
      panelsCount = 16;
      batterySpecs = '48V 200Ah Lithium Titanium Bank';
      basePrice = 5800000;
      annualSavings = 1600000;
    }

    if (solarSqFt === 'duplex') {
      basePrice += 450000;
      loadKw += 1.0;
    } else if (solarSqFt === 'commercial') {
      basePrice += 1500000;
      loadKw += 3.0;
      inverterKVA += 2.0;
      panelsCount += 8;
    }

    const paybackPeriod = parseFloat((basePrice / annualSavings).toFixed(1));

    const quoteData = {
      type: 'solar',
      clientName: currentUser?.name || 'Valued Customer',
      clientLocation: solarLoc,
      buildingType: solarSqFt,
      loadkw: loadKw,
      backupHours: solarBackup,
      recommendedSize: `${inverterKVA}kVA Hybrid Network`,
      equipment: [
        { name: `Seaflows ${inverterKVA}kVA Hybrid Inverter with MPPT`, qty: 1 },
        { name: 'Seaflows 500W Monocrystalline Panels', qty: panelsCount },
        { name: `Seaflows ${batterySpecs}`, qty: 1 },
        { name: 'Cabling, Inverter Panel, Safety Breaker Box, Rail Mounts', qty: 1 }
      ],
      price: basePrice,
      savings: annualSavings,
      payback: paybackPeriod,
      leadTime: '3-5 Working Days'
    };

    setSolarQuoteResult(quoteData);
    setShowSolarResult(true);
  };

  // --- 3. AUTOMATED CCTV QUOTE GENERATOR STATE ---
  const [cctvCamerasCount, setCctvCamerasCount] = useState(4);
  const [cctvCameraType, setCctvCameraType] = useState('4MP Dome & Bullet mix');
  const [cctvBuildingType, setCctvBuildingType] = useState('residential');
  const [cctvOutdoor, setCctvOutdoor] = useState(true);
  const [cctvStorageDays, setCctvStorageDays] = useState(14);
  const [showCctvResult, setShowCctvResult] = useState(false);
  const [cctvQuoteResult, setCctvQuoteResult] = useState<any>(null);

  const generateCctvQuote = (e: React.FormEvent) => {
    e.preventDefault();

    const channels = cctvCamerasCount <= 4 ? 4 : cctvCamerasCount <= 8 ? 8 : 16;
    const hddTb = cctvCamerasCount * cctvStorageDays * 0.05 <= 2 ? 2 : cctvCamerasCount * cctvStorageDays * 0.05 <= 4 ? 4 : 8;
    
    // pricing weights
    const cameraCostEach = 65000;
    const nvrCost = channels === 4 ? 120000 : channels === 8 ? 175000 : 290000;
    const hddCost = hddTb === 2 ? 65000 : hddTb === 4 ? 110000 : 195000;
    const cablingCost = cctvCamerasCount * 25000;
    const installationFee = cctvCamerasCount * 12000 + 40000;

    const totalPrice = (cctvCamerasCount * cameraCostEach) + nvrCost + hddCost + cablingCost + installationFee;

    const quoteData = {
      type: 'cctv',
      clientName: currentUser?.name || 'Valued Customer',
      cameras: cctvCamerasCount,
      cameraType: cctvCameraType,
      channels,
      buildingType: cctvBuildingType,
      outdoor: cctvOutdoor,
      storageDays: cctvStorageDays,
      hddSize: `${hddTb} TB Surveillance Grade HDD`,
      equipment: [
        { name: `Seaflows Fortress ${cctvCameraType} Infrared Cameras`, qty: cctvCamerasCount },
        { name: `Seaflows Omni ${channels}-Channel PoE Network Video Recorder`, qty: 1 },
        { name: `${hddTb}TB WD Purple Surveillance Drive`, qty: 1 },
        { name: 'Industrial Cabling roll (Cat6 Ethernet with Waterproof RJ45 Caps)', qty: cctvCamerasCount },
        { name: '12V Centralized Power Supply Box & Surge Protectors', qty: 1 }
      ],
      price: totalPrice,
      maintenanceAnnual: Math.round(totalPrice * 0.1),
      leadTime: '1-3 Working Days'
    };

    setCctvQuoteResult(quoteData);
    setShowCctvResult(true);
  };

  // --- 4. INSTALLMENT PAYMENT CALCULATOR STATE ---
  const [instValue, setInstValue] = useState(2500000);
  const [instMonths, setInstMonths] = useState(6);
  const [instDownPercent, setInstDownPercent] = useState(30);

  const calculateInstallment = () => {
    const downPayment = Math.round(instValue * (instDownPercent / 100));
    const principalBalance = instValue - downPayment;
    
    // 1% interest rate per month simple surcharge
    const totalInterest = principalBalance * (0.015 * instMonths);
    const totalPayableWithInterest = principalBalance + totalInterest;
    const monthlyPayment = Math.round(totalPayableWithInterest / instMonths);

    return {
      downPayment,
      principalBalance,
      monthlyPayment,
      totalInterest,
      totalPayable: downPayment + totalPayableWithInterest
    };
  };

  const instResults = calculateInstallment();

  const handleSaveToDashboard = (quote: any) => {
    if (onSaveQuote) {
      onSaveQuote(quote);
      setSuccessMsg(`Quotation saved successfully inside your Customer Portal!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Pre-filled WhatsApp string
  const dispatchWhatsApp = (quote: any) => {
    let whatsappText = '';
    if (quote.type === 'solar') {
      whatsappText = `Hello Seaflows Technologies, I generated a Solar quotation on your platform.\n\n*Customer Details:*\n- Name: ${quote.clientName}\n- Location: ${quote.clientLocation}\n- Building type: ${quote.buildingType}\n- Backup needed: ${quote.backupHours} hrs\n- Recommended Size: ${quote.recommendedSize}\n- Estimated Price: ₦${quote.price.toLocaleString()}\n\nPlease book a physical site survey for me.`;
    } else {
      whatsappText = `Hello Seaflows Technologies, I generated a CCTV surveillance quotation on your platform.\n\n*Customer Details:*\n- Name: ${quote.clientName}\n- Area: ${cctvBuildingType}\n- Cameras: ${quote.cameras} units (${quote.cameraType})\n- Storage days: ${quote.storageDays} days\n- Estimated Price: ₦${quote.price.toLocaleString()}\n\nPlease reach out to me for scheduling.`;
    }
    const encoded = encodeURIComponent(whatsappText);
    window.open(`https://wa.me/2349168985436?text=${encoded}`, '_blank');
  };

  const formatCurrency = (val: number) => {
    return '₦' + val.toLocaleString('en-NG');
  };

  return (
    <div id="calculator-section" className="bg-[#0b1426] text-white p-6 rounded-2xl shadow-2xl border border-gray-800">
      
      {/* Tab Selectors */}
      <div id="calc-tabs" className="flex flex-wrap gap-2 mb-8 bg-[#040b15]/60 p-2 rounded-xl border border-gray-800/80 relative">
        {[
          { id: 'sizing', label: 'Solar Sizing Load', icon: <Calculator size={14} /> },
          { id: 'solar-quote', label: 'Solar Instant Quote', icon: <FileText size={14} /> },
          { id: 'cctv-quote', label: 'CCTV Camera Quote', icon: <ClipboardList size={14} /> },
          { id: 'installment', label: 'Installments Flex', icon: <Percent size={14} /> }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors duration-200 cursor-pointer z-10"
            >
              {isSelected && (
                <motion.div
                  layoutId="activeCalcTabIndicator"
                  className="absolute inset-0 bg-[#FDB813] rounded-lg -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`flex items-center gap-2 transition-colors duration-200 ${isSelected ? 'text-[#0A2342] font-bold' : 'text-gray-400 hover:text-white'}`}>
                {tab.icon} {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {successMsg && (
        <div id="calc-success" className="mb-4 flex items-center gap-2 bg-emerald-950/80 text-emerald-300 border border-emerald-800 p-3 rounded-lg text-sm">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      <div ref={calcDetailsRef} className="scroll-mt-24" />

      {/* --- CONTENT 1: SOLAR SIZING LOAD CALCULATOR --- */}
      {activeTab === 'sizing' && (
        <div id="sizing-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sizing inputs panel */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-heading font-bold text-white mb-1">Domestic Appliance Load Matrix</h3>
              <p className="text-gray-400 text-xs">Specify quantities and running usage times to build a custom consumption chart.</p>
            </div>

            {/* Common pre-sets selectors */}
            <div className="bg-[#030913] p-4 rounded-xl border border-gray-800/60 flex flex-col gap-3">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Quick Inject Appliance Selectors:</span>
              <div className="flex flex-wrap gap-2">
                {COMMON_APPLIANCES.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCustomName(preset.name);
                      setCustomWatts(preset.defaultWatts);
                    }}
                    className="bg-[#101b30] hover:bg-[#1a2d4b] text-gray-300 text-[11px] px-2.5 py-1.5 rounded-lg transition-colors border border-gray-800 flex items-center gap-1"
                  >
                    <Plus size={10} className="text-[#FDB813]" /> {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline creation form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#030913] p-4 rounded-xl border border-gray-800">
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Appliance Name</label>
                <input 
                  type="text" 
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Microwave, CCTV Screen"
                  className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-[#FDB813]"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Wattage (W)</label>
                <input 
                  type="number" 
                  value={customWatts}
                  onChange={e => setCustomWatts(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Qty</label>
                <input 
                  type="number" 
                  value={customQty}
                  onChange={e => setCustomQty(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Hrs/Day</label>
                <input 
                  type="number" 
                  max="24"
                  value={customHours}
                  onChange={e => setCustomHours(Math.max(1, Math.min(24, parseInt(e.target.value) || 0)))}
                  className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div className="md:col-span-12 flex justify-end">
                <button
                  onClick={addSizingItem}
                  className="bg-[#FDB813] text-[#0A2342] text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add to Matrix
                </button>
              </div>
            </div>

            {/* List Table of appliances added */}
            <div className="bg-[#030913] rounded-xl border border-gray-800/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#09101f] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="p-3">Appliance</th>
                    <th className="p-3">Power</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Hours</th>
                    <th className="p-3">Total Daily Wh</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {sizingItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#070e1b]">
                      <td className="p-3 font-medium text-white">{item.appliance}</td>
                      <td className="p-3 text-gray-300">{item.watts}W</td>
                      <td className="p-3 text-gray-300">{item.qty}</td>
                      <td className="p-3 text-gray-300">{item.hours} hrs</td>
                      <td className="p-3 text-[#FDB813] font-semibold">{(item.watts * item.qty * item.hours).toLocaleString()} Wh</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeSizingItem(item.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sizingItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500">Your sizing list is empty. Inject appliances using the controls above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sizing outputs panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-[#0c182f] to-[#040e1b] p-6 rounded-xl border border-[#FDB813]/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FDB813]/10 text-[#FDB813] text-[9px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Certified Seaflows Matrix
              </div>
              
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Load Requirement Summary</h4>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-[10px] text-gray-400 block">Peak Running Power</span>
                  <span className="text-xl font-heading font-extrabold text-white">{(sizingResults.totalRunningWatts).toLocaleString()} W</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Daily Consumption</span>
                  <span className="text-xl font-heading font-extrabold text-[#FDB813]">{sizingResults.dailyKwh.toFixed(2)} kWh</span>
                </div>
              </div>

              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 border-b border-gray-800 pb-1">Recommended Hardware Architecture</h4>
              
              <div className="flex flex-col gap-3.5 text-xs text-gray-300">
                <div className="flex justify-between items-center bg-[#050b14] p-2.5 rounded-lg border border-gray-800/80">
                  <span className="text-gray-400">Pure Sine-Wave Inverter Size</span>
                  <span className="font-mono font-bold text-white text-sm">{sizingResults.inverterKva} KVA ({sizingResults.systemVoltage}V System)</span>
                </div>
                
                <div className="flex justify-between items-center bg-[#050b14] p-2.5 rounded-lg border border-gray-800/80">
                  <span className="text-gray-400">Total Solar Array Needed</span>
                  <span className="font-mono font-bold text-white text-sm">{sizingResults.requiredPanelWatts} Watts PV</span>
                </div>

                <div className="flex justify-between items-center bg-[#050b14] p-2.5 rounded-lg border border-gray-800/80">
                  <span className="text-gray-400">Seaflows 500W Panels Count</span>
                  <span className="font-mono font-bold text-[#FDB813] text-sm">{sizingResults.panels500wCount} Units</span>
                </div>

                <div className="flex justify-between items-center bg-[#050b14] p-2.5 rounded-lg border border-gray-800/80">
                  <span className="text-gray-400">Battery Capacity (at {sizingResults.systemVoltage}V)</span>
                  <span className="font-mono font-bold text-white text-sm">{sizingResults.batteryCapacityAh} Ah (Autonomy setup)</span>
                </div>

                <div className="flex justify-between items-center bg-[#050b14] p-2.5 rounded-lg border border-gray-800/80">
                  <span className="text-gray-400">Smart MPPT Charge Controller</span>
                  <span className="font-mono font-bold text-white text-sm">Min. {sizingResults.chargeControllerA} Amps</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-bold uppercase">Estimated Project Cost</span>
                  <span className="text-lg font-extrabold text-emerald-400">{formatCurrency(sizingResults.estimatedCostNgn)}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">Includes panels, rack structures, inverter block, lithium/gel storage setup, cabling, transport, and 1-year certified support SLA.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={() => handleSaveToDashboard({
                    type: 'solar-load',
                    load: sizingResults.totalRunningWatts,
                    kwh: sizingResults.dailyKwh,
                    inverter: `${sizingResults.inverterKva} KVA`,
                    price: sizingResults.estimatedCostNgn,
                    details: `${sizingResults.panels500wCount} panels, ${sizingResults.batteryCapacityAh}Ah Battery`
                  })}
                  className="bg-[#12233f] text-white hover:bg-[#1c355e] border border-gray-700 py-2 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Download size={12} /> Save to Portal
                </button>
                <button
                  onClick={() => {
                    const text = `Hi Seaflows, I loaded my sizing on your site.\n\n*Results Matrix:*\n- Total load: ${sizingResults.totalRunningWatts}W\n- Daily consumption: ${sizingResults.dailyKwh.toFixed(2)} kWh\n- Recommended Inverter: ${sizingResults.inverterKva} KVA\n- Panels: ${sizingResults.panels500wCount} units\n- Est price: ₦${sizingResults.estimatedCostNgn.toLocaleString()}\n\nContact me for site booking!`;
                    window.open(`https://wa.me/2349168985436?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="bg-emerald-600 text-white hover:bg-emerald-500 py-2 px-3 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Smartphone size={12} /> Send WhatsApp
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- CONTENT 2: AUTOMATED SOLAR QUOTE GENERATOR --- */}
      {activeTab === 'solar-quote' && (
        <div className="flex flex-col gap-6">
          
          {/* Sub Tab Switcher with visual prompts */}
          <div className="flex border-b border-gray-800 pb-4 justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
                Solar Quotation Hub <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full font-sans uppercase">Updated</span>
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">Select a predefined solar package or design a granular individual component bill of materials (BOM).</p>
            </div>
            <div className="flex bg-[#040b15]/90 p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setSolarSubTab('instant')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  solarSubTab === 'instant' 
                    ? 'bg-[#FDB813] text-[#0A2342] shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Instant Predefined Packages
              </button>
              <button
                onClick={() => setSolarSubTab('custom')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  solarSubTab === 'custom' 
                    ? 'bg-[#FDB813] text-[#0A2342] shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Build Custom Component Quote
              </button>
            </div>
          </div>

          {/* MODE A: INSTANT PREDEFINED PACKAGES */}
          {solarSubTab === 'instant' && (
            <div id="solar-quote-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-heading font-bold text-white mb-1">Instant Solar Quotation Engine</h3>
                  <p className="text-gray-400 text-xs text-balance">Answer these direct operational metrics to configure your microgrid costs and project payback metrics instantly.</p>
                </div>

                <form onSubmit={generateSolarQuote} className="flex flex-col gap-4 bg-[#030913] p-5 rounded-xl border border-gray-800">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Your Location (Nigeria State / Area)</label>
                    <input 
                      type="text" 
                      value={solarLoc}
                      onChange={e => setSolarLoc(e.target.value)}
                      placeholder="e.g. Ikeja GRA, Lagos"
                      required
                      className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Building Architecture Typology</label>
                    <select 
                      value={solarSqFt}
                      onChange={e => setSolarSqFt(e.target.value as any)}
                      className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="flat">Standard 2-3 Bedroom Apartment / Flat</option>
                      <option value="duplex">4-5 Bedroom Duplex Residence</option>
                      <option value="bungalow">Detached Bungalow Block</option>
                      <option value="commercial">Commercial Office Complex / Warehouse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Load Capacity Target</label>
                    <select
                      value={solarPreferredLoad}
                      onChange={e => setSolarPreferredLoad(e.target.value as any)}
                      className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="basic">Basic: Lights, LED TV, Ceiling Fans, Tablets (1.5kVA system)</option>
                      <option value="medium">Medium: Lights, Fridge, Freezer, Smart TVs, Water pump (3.5kVA - 5kVA)</option>
                      <option value="heavy">Heavy-Duty: All major appliances, inverter AC units, micro-ovens (5kVA - 10kVA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 flex justify-between">
                      <span>Required Night Backup Time</span>
                      <span className="text-[#FDB813]">{solarBackup} Hours</span>
                    </label>
                    <input 
                      type="range" 
                      min="4" 
                      max="24"
                      value={solarBackup}
                      onChange={e => setSolarBackup(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#101b30] accent-[#FDB813] rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>4 Hrs</span>
                      <span>12 Hrs (Sufficient overnight)</span>
                      <span>24 Hrs (Full off-grid autonomy)</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 rounded-lg text-xs font-heading font-extrabold transition-all duration-300 mt-2 flex items-center justify-center gap-1 uppercase tracking-wider"
                  >
                    Assemble Quotation <ArrowRight size={14} />
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7">
                {showSolarResult && solarQuoteResult ? (
                  <div id="solar-quote-result" className="bg-[#030913] p-6 rounded-xl border border-gray-800 flex flex-col gap-5">
                    
                    {/* Header detail */}
                    <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                      <div>
                        <span className="bg-[#FDB813]/10 text-[#FDB813] text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest block w-fit mb-1">RECOMMENDED DESIGN</span>
                        <h3 className="text-base font-heading font-extrabold text-white">{solarQuoteResult.recommendedSize}</h3>
                        <p className="text-gray-400 text-xs">For {solarQuoteResult.clientName} at {solarQuoteResult.clientLocation}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase">Project Value</span>
                        <span className="text-lg font-heading font-extrabold text-emerald-400">{formatCurrency(solarQuoteResult.price)}</span>
                      </div>
                    </div>

                    {/* Checklist of devices */}
                    <div>
                      <h4 className="text-xs text-gray-300 font-bold mb-2">Detailed Equipment Bill of Materials (BOM)</h4>
                      <div className="flex flex-col gap-2">
                        {solarQuoteResult.equipment.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs p-2.5 bg-[#08101e] border border-gray-800 rounded-lg">
                            <span className="text-gray-300">{item.name}</span>
                            <span className="font-bold text-[#FDB813]">QTY: {item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Savings and paybacks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0a162b] p-4 rounded-xl border border-gray-800/80">
                      <div className="text-center md:border-r border-gray-800 font-bold text-amber-400">
                        <span className="text-[10px] text-gray-400 block uppercase mb-0.5">Est. Annual Fuel Savings</span>
                        <span className="text-sm font-bold text-emerald-300">{formatCurrency(solarQuoteResult.savings)}</span>
                      </div>
                      <div className="text-center md:border-r border-gray-800">
                        <span className="text-[10px] text-gray-400 block uppercase mb-0.5">Payback Horizon</span>
                        <span className="text-sm font-bold text-[#FDB813]">{solarQuoteResult.payback} Years</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 block uppercase mb-0.5">Physical Installation SLA</span>
                        <span className="text-sm font-bold text-white">{solarQuoteResult.leadTime}</span>
                      </div>
                    </div>

                    {/* Custom CTA */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-800/80">
                      <button
                        onClick={() => handleSaveToDashboard(solarQuoteResult)}
                        className="flex-1 bg-gradient-to-r from-[#0e1f3a] to-[#162f55] text-white hover:from-[#152e55] hover:to-[#214376] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 border border-gray-800"
                      >
                        <Download size={13} /> Save to Customer Portal
                      </button>
                      <button
                        onClick={() => dispatchWhatsApp(solarQuoteResult)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Smartphone size={13} /> Dispatch Quote via WhatsApp
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-[#030913] rounded-xl border border-gray-800 text-gray-500 min-h-[350px]">
                    <FileText size={48} className="text-gray-700 mb-3 animate-pulse" />
                    <span className="font-heading font-semibold text-gray-400 text-sm">Quotation Waiting Generation</span>
                    <span className="text-xs text-gray-600 mt-1 max-w-[280px]">Fill the parameters on the left to instantly build out pricing and specifications indexes.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODE B: SMART CUSTOM COMPONENT SPECIFICATION BUILDER */}
          {solarSubTab === 'custom' && (
            <div id="solar-custom-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
              
              {/* Form Input list for each component */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-heading font-bold text-white mb-0.5">What components do you want?</h3>
                  <p className="text-gray-400 text-xs">Your plan will depend on the components and types you select.</p>
                </div>

                {/* Live Running Total Card */}
                <div className="bg-[#031124] border border-[#FDB813]/35 p-5 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Cost of selected equipments</span>
                  <span className="text-2xl font-extrabold font-mono text-emerald-400">
                    ₦{calculateCustomTotalCost().toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col gap-3.5">
                  {(Object.entries(compSelections) as [string, any][]).map(([key, item]) => (
                    <div 
                      key={key} 
                      className={`transition-all duration-300 rounded-xl p-4 border ${
                        item.checked 
                          ? 'bg-[#030a15] border-[#FDB813]/55 shadow-md shadow-[#FDB813]/5' 
                          : 'bg-[#030913]/40 border-gray-850 hover:border-gray-850'
                      }`}
                    >
                      {/* Checkbox Trigger Row */}
                      <button
                        type="button"
                        onClick={() => toggleCompCheckedVal(key)}
                        className="flex items-center gap-3 w-full text-left focus:outline-none"
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                          item.checked 
                            ? 'border-[#FDB813] bg-[#FDB813]/25 text-[#FDB813]' 
                            : 'border-gray-700 bg-transparent text-transparent hover:border-gray-500'
                        }`}>
                          <Check size={12} strokeWidth={3} className={item.checked ? 'block' : 'hidden'} />
                        </span>
                        <div className="flex-1">
                          <span className="text-sm font-bold text-white font-heading block">{item.label}</span>
                          {item.checked && (
                            <span className="text-[10px] text-amber-400 font-medium font-mono">
                              {item.type} (x{item.qty})
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Expandable Options Subform */}
                      {item.checked && (
                        <div className="mt-4 pt-4 border-t border-gray-800 pl-8 flex flex-col gap-4">
                          
                          {/* Option selection radio lists */}
                          {item.options.length > 1 && (
                            <div>
                              <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">What type do you need?</span>
                              <div className="flex flex-col gap-1.5">
                                {item.options.map(opt => (
                                  <label 
                                    key={opt} 
                                    className={`flex items-center gap-2.5 p-2.5 rounded-lg cursor-pointer transition-all border text-xs ${
                                      item.type === opt 
                                        ? 'bg-[#FDB813]/10 border-[#FDB813]/70 text-[#FDB813] font-bold' 
                                        : 'bg-[#040c17] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                                    }`}
                                  >
                                    <input 
                                      type="radio" 
                                      name={`type-${key}`} 
                                      checked={item.type === opt}
                                      onChange={() => updateCompTypeVal(key, opt)}
                                      className="sr-only"
                                    />
                                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                      item.type === opt ? 'border-[#FDB813] bg-[#FDB813]' : 'border-gray-600'
                                    }`}>
                                      {item.type === opt && <span className="w-1.5 h-1.5 bg-black rounded-full" />}
                                    </span>
                                    <span>{opt} - <span className="text-emerald-400 font-mono">₦{componentPricesObj[opt].toLocaleString()}</span></span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dynamic numerical counter input */}
                          <div>
                            <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">How many do you need?</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateCompQtyVal(key, item.qty - 1)}
                                className="w-8 h-8 rounded-lg bg-[#040e1b] border border-gray-800 hover:border-text-gray-400 text-white flex items-center justify-center font-bold text-lg select-none"
                              >
                                -
                              </button>
                              <input 
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(e) => updateCompQtyVal(key, parseInt(e.target.value) || 1)}
                                placeholder="Enter qty"
                                className="flex-1 bg-[#050e1c] border border-gray-800 rounded-lg p-2 text-center text-xs text-white focus:outline-none focus:border-[#FDB813] font-mono font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => updateCompQtyVal(key, item.qty + 1)}
                                className="w-8 h-8 rounded-lg bg-[#040e1b] border border-gray-800 hover:border-text-gray-400 text-white flex items-center justify-center font-bold text-lg select-none"
                              >
                                +
                              </button>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Portal Customization Info and Action */}
                <div className="bg-[#030913] border border-gray-800 p-5 rounded-xl flex flex-col gap-4 mt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Customer / Reference Name</label>
                    <input 
                      type="text"
                      value={customClientName}
                      onChange={(e) => setCustomClientName(e.target.value)}
                      placeholder="e.g. Seaflows Technologies Client"
                      className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      const totalSelected = (Object.values(compSelections) as any[]).filter(x => x.checked && x.qty > 0).length;
                      if (totalSelected === 0 || calculateCustomTotalCost() === 0) {
                        alert("Please select at least one component to proceed!");
                        return;
                      }
                      setShowCompResult(true);
                      setTimeout(() => {
                        const target = document.getElementById('custom-comp-result-box');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 rounded-lg text-xs font-heading font-extrabold transition-all duration-300 flex items-center justify-center gap-1 uppercase tracking-wider"
                  >
                    Assemble Precise Quote <ArrowRight size={14} />
                  </button>
                </div>

              </div>

              {/* Precise Results Panel */}
              <div id="custom-comp-result-box" className="lg:col-span-7">
                {showCompResult ? (
                  <div className="bg-[#030913] p-6 rounded-xl border border-gray-800 flex flex-col gap-5">
                    
                    {/* Success Alert Banner */}
                    <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-center gap-3">
                      <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-xs block">Quote request detail is ready</span>
                        <span className="text-[10px] text-gray-400">Custom specification successfully optimized and drafted.</span>
                      </div>
                    </div>

                    {/* Metadata summary header */}
                    <div className="border-b border-gray-800 pb-3">
                      <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">CLIENT FILE</span>
                      <h3 className="text-base font-bold text-white font-heading">{customClientName || 'Valued Customer'}</h3>
                      <p className="text-gray-400 text-xs mt-0.5 font-sans">Custom Component Bill of Materials Configuration Report</p>
                    </div>

                    {/* Pay with Instalment Option (30% downpayment, balance + simple interest surcharges / 12) */}
                    <div className="bg-[#030c18] border border-gray-800 rounded-xl p-5 flex flex-col gap-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-extrabold text-white font-heading">Plan A: Pay with Instalment</h4>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase font-sans">Flexible Finance</span>
                      </div>
                      <p className="text-gray-400 text-xs">Spread out security costs with an initial 30% downpayment, followed by 12 convenient monthly disbursements.</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2 bg-[#010610] p-4 rounded-lg border border-gray-850">
                        <div>
                          <span className="text-[10px] block text-gray-400 uppercase font-bold mb-0.5">Down Payment (30%)</span>
                          <span className="text-base font-extrabold font-mono text-emerald-400">
                            ₦{Math.round(calculateCustomTotalCost() * 0.3).toLocaleString()}.00
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] block text-gray-400 uppercase font-bold mb-0.5">Monthly (12 Mo)</span>
                          <span className="text-base font-extrabold font-mono text-[#FDB813]">
                            ₦{Math.round((calculateCustomTotalCost() * 0.7 * 1.48) / 12).toLocaleString()}.00/mo
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plan B outright options */}
                    <div className="bg-[#020b12] border border-gray-850 rounded-xl p-5 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-extrabold text-white font-heading">Plan B: Pay Outrightly</h4>
                        <span className="text-[9px] bg-[#FDB813]/10 text-[#FDB813] border border-[#FDB813]/20 px-2 py-0.5 rounded-full font-bold uppercase font-sans">Cash Discount</span>
                      </div>
                      <div className="bg-[#010610] p-4 rounded-lg border border-gray-850 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 uppercase font-bold">Total Cash Purchase</span>
                        <span className="text-lg font-extrabold font-mono text-emerald-400">
                          ₦{calculateCustomTotalCost().toLocaleString()}.00
                        </span>
                      </div>
                    </div>

                    {/* Specs Table */}
                    <div>
                      <h4 className="text-xs text-gray-300 font-bold mb-2 uppercase tracking-wide">Hardware Specs</h4>
                      <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#020610]">
                        <table className="w-full text-left text-xs text-gray-300">
                          <thead className="bg-[#050d18] text-[10px] uppercase font-bold text-gray-400 border-b border-gray-800">
                            <tr>
                              <th className="p-3">#</th>
                              <th className="p-3">Hardware Type Name / Model</th>
                              <th className="p-3 text-right">Quantity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-850">
                            {(Object.entries(compSelections) as [string, any][])
                              .filter(([_, value]) => value.checked && value.qty > 0)
                              .map(([key, value], idx) => (
                                <tr key={key} className={idx % 2 === 0 ? 'bg-[#040c17]/40' : 'bg-[#020610]'}>
                                  <td className="p-3 font-mono text-gray-500">{idx + 1}</td>
                                  <td className="p-3">
                                    <span className="block font-bold text-white">{value.label}</span>
                                    <span className="text-[10px] text-gray-400 font-medium font-mono">Model: {value.type}</span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-[#FDB813] font-mono">{value.qty} items</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Save to Portals and Dispatch Buttons */}
                    <div className="flex flex-wrap gap-2.5 pt-3 border-t border-gray-800/80">
                      <button
                        onClick={() => {
                          const activeEquipment = (Object.entries(compSelections) as [string, any][])
                            .filter(([_, value]) => value.checked && value.qty > 0)
                            .map(([_, value]) => ({
                              name: `${value.label} (${value.type})`,
                              qty: value.qty
                            }));
                          
                          const totalCost = calculateCustomTotalCost();
                          const customQuote = {
                            type: 'solar',
                            clientName: customClientName || 'Valued Customer',
                            clientLocation: 'Seaflows Custom Design Port',
                            buildingType: 'Custom Spec Assembler',
                            loadkw: 0,
                            backupHours: 12,
                            recommendedSize: `Custom Assembly Matrix (Value: ₦${totalCost.toLocaleString()})`,
                            equipment: activeEquipment,
                            price: totalCost,
                            savings: Math.round(totalCost * 0.15),
                            payback: 3.5,
                            leadTime: 'Instant Custom SLA'
                          };
                          handleSaveToDashboard(customQuote);
                        }}
                        className="flex-1 bg-gradient-to-r from-[#031d3f] to-[#01142c] text-white hover:border-[#FDB813]/40 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 border border-gray-800"
                      >
                        <Download size={13} /> Save Request
                      </button>
                      <button
                        onClick={() => {
                          downloadSolarQuotePdf(
                            customClientName || 'Valued Customer',
                            compSelections,
                            componentPricesObj,
                            calculateCustomTotalCost()
                          );
                        }}
                        className="flex-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FileText size={13} /> Download PDF Quote
                      </button>
                      <button
                        onClick={() => {
                          const activeEquipmentText = (Object.entries(compSelections) as [string, any][])
                            .filter(([_, value]) => value.checked && value.qty > 0)
                            .map(([_, value]) => `• ${value.label} (${value.type}): Qty ${value.qty}`)
                            .join('\n');
                          
                          const totalCost = calculateCustomTotalCost();
                          const downPaymentVal = Math.round(totalCost * 0.3);
                          const mthPaymentVal = Math.round((totalCost * 0.7 * 1.48) / 12);
                          
                          const text = `Hello Seaflows Technologies, I generated a custom configuration on your Solar Quotation Engine:\n\n*Name*: ${customClientName || 'Customer'}\n\n*Selected Bill of Materials*:\n${activeEquipmentText}\n\n*Outright Cash Price*: ₦${totalCost.toLocaleString()}.00\n*Down Payment (30%)*: ₦${downPaymentVal.toLocaleString()}.00\n*Monthly Instalment*: ₦${mthPaymentVal.toLocaleString()}.00/month\n\nPlease review and connect for delivery!`;
                          
                          window.open(`https://wa.me/2349168985436?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Smartphone size={13} /> Dispatch Quote via WhatsApp
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-[#030913] rounded-xl border border-gray-800 text-gray-500 min-h-[350px]">
                    <FileText size={48} className="text-gray-700 mb-3 animate-pulse" />
                    <span className="font-heading font-semibold text-gray-400 text-sm">Specification Analysis Waiting</span>
                    <span className="text-xs text-gray-600 mt-1 max-w-[280px]">Select components, options and quantities on the left, then trigger precise design calculation.</span>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* --- CONTENT 3: AUTOMATED CCTV QUOTE GENERATOR --- */}
      {activeTab === 'cctv-quote' && (
        <div id="cctv-quote-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-heading font-bold text-white mb-1">Corporate CCTV Quotation Engine</h3>
              <p className="text-gray-400 text-xs">Configure your network structure, camera density, and retention guidelines to review customized storage arrays instantly.</p>
            </div>

            <form onSubmit={generateCctvQuote} className="flex flex-col gap-4 bg-[#030913] p-5 rounded-xl border border-gray-800">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 flex justify-between">
                  <span>Number of Surveillance CCTV Cameras</span>
                  <span className="text-[#FDB813] font-mono">{cctvCamerasCount} Units</span>
                </label>
                <input 
                  type="range" 
                  min="2" 
                  max="32"
                  value={cctvCamerasCount}
                  onChange={e => setCctvCamerasCount(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#101b30] accent-[#FDB813] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>2 Units</span>
                  <span>8 Units</span>
                  <span>16 Units</span>
                  <span>32 Units Max</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Camera Lens Specification Type</label>
                <select 
                  value={cctvCameraType}
                  onChange={e => setCctvCameraType(e.target.value)}
                  className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="4MP Dome & Bullet mix">4MP Full Color Night Vision (Commercial Standard)</option>
                  <option value="5MP SuperHD Smart Eye">5MP SuperHD Dome with Two-Way Audio</option>
                  <option value="8MP (4K) PTZ Auto-Tracking Dome">4K UltraHD with 30x Optical Zoom Track (Apex Secure)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 font-sans">Building Structure Area</label>
                <select 
                  value={cctvBuildingType}
                  onChange={e => setCctvBuildingType(e.target.value)}
                  className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="residential">Residential Villa / Duplex Roof Layout</option>
                  <option value="office">Corporate Commercial Office Floors</option>
                  <option value="industrial">High-Secrecy Industrial Site / Warehouse</option>
                  <option value="retail">Retail Shop / Store Spaces</option>
                </select>
              </div>

              <div className="flex items-center gap-3 bg-[#0a1120] p-3 rounded-lg border border-gray-800">
                <input 
                  type="checkbox" 
                  id="outdoor-check" 
                  checked={cctvOutdoor} 
                  onChange={e => setCctvOutdoor(e.target.checked)}
                  className="w-4 h-4 bg-gray-800 accent-[#FDB813]"
                />
                <label htmlFor="outdoor-check" className="text-xs text-gray-300 font-semibold cursor-pointer">Requires Outdoor Waterproof Junction Boxes</label>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 flex justify-between">
                  <span>Video Retention Buffer Frame</span>
                  <span className="text-[#FDB813] font-mono">{cctvStorageDays} Days Feed</span>
                </label>
                <input 
                  type="range" 
                  min="7" 
                  max="60"
                  step="7"
                  value={cctvStorageDays}
                  onChange={e => setCctvStorageDays(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#101b30] accent-[#FDB813] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>7 Days</span>
                  <span>14 Days (Overwrites)</span>
                  <span>30 Days</span>
                  <span>60 Days Extreme</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 rounded-lg text-xs font-heading font-extrabold transition-all duration-300 mt-2 flex items-center justify-center gap-1 uppercase tracking-wider"
              >
                Compile security quote <ArrowRight size={14} />
              </button>
            </form>
          </div>

          <div className="lg:col-span-7">
            {showCctvResult && cctvQuoteResult ? (
              <div id="cctv-quote-result" className="bg-[#030913] p-6 rounded-xl border border-gray-800 flex flex-col gap-5">
                
                {/* Header view */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                  <div>
                    <span className="bg-[#FDB813]/10 text-[#FDB813] text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest block w-fit mb-1">SECURITY CLASSIFICATION APPROVED</span>
                    <h3 className="text-base font-heading font-extrabold text-white">Seaflows Guard - {cctvQuoteResult.cameras} Cameras Array</h3>
                    <p className="text-gray-400 text-xs">Target Environment: {cctvQuoteResult.buildingType.toUpperCase()} architecture layout</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase">Estimated System Cost</span>
                    <span className="text-lg font-heading font-extrabold text-emerald-400">{formatCurrency(cctvQuoteResult.price)}</span>
                  </div>
                </div>

                {/* Storage assessment */}
                <div className="bg-[#0c182a] border border-[#FDB813]/30 p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} className="text-[#FDB813] shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Smart Video Ingestion Allocation</span>
                    <span className="text-gray-300">Requires a dedicated <span className="font-semibold text-[#FDB813]">{cctvQuoteResult.hddSize}</span> to support continuous recording for <span className="font-semibold text-white">{cctvQuoteResult.storageDays} days</span> under H.265+ compression schemas.</span>
                  </div>
                </div>

                {/* BOM checklist */}
                <div>
                  <h4 className="text-xs text-gray-300 font-bold mb-2">Itemized Materials List</h4>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {cctvQuoteResult.equipment.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-[11px] p-2 bg-[#08101e] border border-gray-800/60 rounded-md">
                        <span className="text-gray-300">{item.name}</span>
                        <span className="font-bold text-[#FDB813]">QTY: {item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payout maintenance metric */}
                <div className="grid grid-cols-2 gap-4 border-t border-gray-800/80 pt-4 text-xs text-gray-400">
                  <div>
                    <span>Optional Support / Maintenance SLA</span>
                    <span className="block font-bold text-white mt-1">{formatCurrency(cctvQuoteResult.maintenanceAnnual)} / Yr</span>
                  </div>
                  <div>
                    <span>Dispatch Turnaround Time</span>
                    <span className="block font-bold text-white mt-1">{cctvQuoteResult.leadTime} (Instant scheduling)</span>
                  </div>
                </div>

                {/* CTA actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleSaveToDashboard({
                      type: 'cctv-quote',
                      cameras: cctvQuoteResult.cameras,
                      cameraType: cctvQuoteResult.cameraType,
                      price: cctvQuoteResult.price,
                      details: `${cctvQuoteResult.cameras}x Cameras, ${cctvQuoteResult.hddSize}`
                    })}
                    className="flex-1 bg-gradient-to-r from-[#0e1f3a] to-[#162f55] text-white hover:from-[#152e55] hover:to-[#214376] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 border border-gray-800"
                  >
                    <Download size={13} /> Save to Customer Portal
                  </button>
                  <button
                    onClick={() => downloadCctvQuotePdf(cctvQuoteResult)}
                    className="flex-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText size={13} /> Download PDF Quote
                  </button>
                  <button
                    onClick={() => dispatchWhatsApp(cctvQuoteResult)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Smartphone size={13} /> Dispatch Quote via WhatsApp
                  </button>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-[#030913] rounded-xl border border-gray-800 text-gray-500 min-h-[350px]">
                <ClipboardList size={48} className="text-gray-700 mb-3 animate-pulse" />
                <span className="font-heading font-semibold text-gray-400 text-sm">Security Matrix Waiting Compilation</span>
                <span className="text-xs text-gray-600 mt-1 max-w-[280px]">Fill camera quantities and parameters on the left to compile security costs indexes.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- CONTENT 4: INSTALLMENT PAYMENT CALCULATOR --- */}
      {activeTab === 'installment' && (
        <div id="installment-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-heading font-bold text-white mb-1">Flexi-Pay Installment Calculator</h3>
              <p className="text-gray-400 text-xs">Spread physical asset purchases across multiple months with customized upfront ratios and smooth approvals.</p>
            </div>

            <div className="flex flex-col gap-4 bg-[#030913] p-5 rounded-xl border border-gray-800">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 flex justify-between">
                  <span>Estimated Solar/CCTV System Value</span>
                  <span className="text-[#FDB813] font-mono">{formatCurrency(instValue)}</span>
                </label>
                <input 
                  type="range" 
                  min="500000" 
                  max="10000000"
                  step="250000"
                  value={instValue}
                  onChange={e => setInstValue(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#101b30] accent-[#FDB813] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>500k</span>
                  <span>2.5m</span>
                  <span>5.0m</span>
                  <span>10.0m NGN</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 flex justify-between">
                  <span>Upfront Down Payment Percentage</span>
                  <span className="text-[#FDB813] font-mono">{instDownPercent}%</span>
                </label>
                <select
                  value={instDownPercent}
                  onChange={e => setInstDownPercent(parseInt(e.target.value))}
                  className="w-full bg-[#0a1120] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value={20}>20% Down Payment (Minimum limit)</option>
                  <option value={30}>30% Down Payment (Standard Corporate)</option>
                  <option value={40}>40% Down Payment (Enhanced Approval rate)</option>
                  <option value={50}>50% Down Payment (Instant Automated Release)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Repayment Term Period</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 9, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setInstMonths(m)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                        instMonths === m 
                          ? 'bg-[#FDB813] text-[#0A2342]' 
                          : 'bg-[#0a1120] text-gray-300 hover:bg-gray-800 border border-gray-800'
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-[#030913] p-6 rounded-xl border border-gray-800 flex flex-col gap-5">
              <h4 className="text-xs text-[#FDB813] font-bold uppercase tracking-wider border-b border-gray-800 pb-2">Repayment Schedule Breakdown</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#09101f] rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase">Required Down Payment</span>
                  <span className="text-xl font-extrabold text-white">{formatCurrency(instResults.downPayment)}</span>
                  <p className="text-[9px] text-gray-500 mt-1">Paid prior to mobilization and assembly of equipment.</p>
                </div>

                <div className="p-4 bg-[#09101f] rounded-lg border border-gray-800">
                  <span className="text-[10px] text-gray-400 block uppercase">Monthly Installment</span>
                  <span className="text-xl font-extrabold text-[#FDB813]">{formatCurrency(instResults.monthlyPayment)}</span>
                  <p className="text-[9px] text-gray-500 mt-1">Paid on the 28th of every consecutive month.</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-gray-800 pt-4 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Purchase Value</span>
                  <span>{formatCurrency(instValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Principal Balance Remaining</span>
                  <span>{formatCurrency(instResults.principalBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Interest Surcharge ({instMonths} Months)</span>
                  <span className="text-amber-500">+{formatCurrency(instResults.totalInterest)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-850 pt-2 font-bold text-white">
                  <span>Total Cumulative Outlay</span>
                  <span className="text-emerald-400">{formatCurrency(instResults.totalPayable)}</span>
                </div>
              </div>

              <div className="bg-[#0d1622] rounded-lg p-3.5 border border-blue-900/40 mt-2">
                <span className="text-[10px] font-bold text-blue-300 uppercase block mb-1">Corporate Eligibility Notice</span>
                <p className="text-[10px] text-gray-400 leading-normal">Requires valid business registration, utility verification, bank statements (6 months), and post-dated cheque sheets. Site installations will begin immediately upon down payment confirmation.</p>
              </div>

              <button
                onClick={() => handleSaveToDashboard({
                  type: 'installment',
                  productId: 'custom-package',
                  productName: 'Custom Power & Surveillance Package',
                  productPrice: instValue,
                  downPaymentNgn: instResults.downPayment,
                  periodMonths: instMonths,
                  monthlyPaymentNgn: instResults.monthlyPayment
                })}
                className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 rounded-lg text-xs font-heading font-extrabold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                Submit Installment Request Form <Share2 size={13} />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
