import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Filter, ShoppingCart, Heart, RefreshCw, Eye, Star, Check, 
  Trash2, X, Plus, Minus, CreditCard, ShieldAlert, BadgeInfo, CheckCircle,
  Sliders, Sun, Zap, Sparkles, Calculator, ChevronDown, ChevronUp, Bolt
} from 'lucide-react';
import { Product, CartItem } from '../types';

interface StoreProps {
  products: Product[];
  cart: CartItem[];
  wishlist: Product[];
  onAddToCart: (p: Product, qty: number) => void;
  onRemoveFromCart: (id: string) => void;
  onUpdateCartQty: (id: string, qty: number) => void;
  onAddToWishlist: (p: Product) => void;
  onRemoveFromWishlist: (id: string) => void;
  onCheckout: (orderDetails: any) => void;
}

export default function SeaflowsStore({
  products,
  cart,
  wishlist,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQty,
  onAddToWishlist,
  onRemoveFromWishlist,
  onCheckout
}: StoreProps) {
  // Auto-scrolling anchor for product catalog variations
  const storeGridRef = React.useRef<HTMLDivElement | null>(null);

  // Navigation & filtering state
  const [activeSegment, setActiveSegment] = useState<'all' | 'solar' | 'cctv'>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');

  React.useEffect(() => {
    if (activeSegment !== 'all' || selectedSubCategory !== 'all') {
      if (storeGridRef.current) {
        storeGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeSegment, selectedSubCategory]);

  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(3000000);
  
  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Quick-Quote Slider Estimator State
  const [inverterKva, setInverterKva] = useState<number>(3); // Default 3 KVA Hybrid Inverter
  const [batteryCount, setBatteryCount] = useState<number>(2); // Default 2 Batteries
  const [solarPanels, setSolarPanels] = useState<number>(4); // Default 4 Panels
  const [cctvCameras, setCctvCameras] = useState<number>(4); // Default 4 AI Surveillance Cameras
  const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
  const [isQuoteEstimatorOpen, setIsQuoteEstimatorOpen] = useState<boolean>(false); // Start collapsed for slickness, can be toggled open
  const [quoteSuccessMessage, setQuoteSuccessMessage] = useState<string>('');

  // Dynamic Pricing Constants matching Seaflows Technologies standard premium rates
  const INVERTER_RATE = 350000; // ₦350,000 per kVA Pure Sine Wave Heavy Transformer
  const BATTERY_RATE = 450000;  // ₦450,000 per German tubular/deep-cycle gel/lithium module
  const PANEL_RATE = 210000;    // ₦210,000 per high-efficiency Mono PERC premium panel
  const CCTV_RATE = 85000;       // ₦85,000 per smart AI PTZ/Bullet thermal-imaging stream

  const inverterCost = inverterKva * INVERTER_RATE;
  const batteryCost = batteryCount * BATTERY_RATE;
  const panelCost = solarPanels * PANEL_RATE;
  const cctvCost = cctvCameras * CCTV_RATE;
  const recorderCost = cctvCameras > 8 ? 195000 : cctvCameras > 0 ? 110000 : 0; // 16ch vs 8ch/4ch NVR
  
  const equipmentTotal = inverterCost + batteryCost + panelCost + cctvCost + recorderCost;
  const installationCost = includeInstallation ? Math.max(150000, Math.round(equipmentTotal * 0.10)) : 0;
  const calculatedGrandTotal = equipmentTotal + installationCost;

  const handleAddCustomPackageToCart = () => {
    if (calculatedGrandTotal <= 0) return;
    
    // Construct real custom product matching Product schema
    const customPackageProduct: Product = {
      id: `custom-package-${Date.now()}`,
      name: `Seaflows Custom System Package (${inverterKva > 0 ? `${inverterKva}kVA Inverter` : 'Backup'} + ${batteryCount}x Batt + ${cctvCameras}x CCTV)`,
      category: 'solar-accessory',
      price: calculatedGrandTotal,
      specifications: {
        'Inverter Capacity': inverterKva > 0 ? `${inverterKva} kVA Pure Sine Wave` : 'None',
        'Battery Bank Size': batteryCount > 0 ? `${batteryCount}x 200Ah deep-cycle units` : 'None',
        'Solar Array': solarPanels > 0 ? `${solarPanels}x high-efficacy panels` : 'None',
        'AI CCTV Surveillance': cctvCameras > 0 ? `${cctvCameras} smart motion streams` : 'None',
        'Commissioning Services': includeInstallation ? 'Included (Nationwide)' : 'Self-Installation'
      },
      image: '',
      rating: 5.0,
      reviews: [],
      stock: 1,
      description: `Bespoke dynamic compiled power & security package. Tailored precisely utilizing our high-grade materials and equipment. Includes certified warranty with premium site support.`,
      brand: 'SEAFLOWS'
    };

    onAddToCart(customPackageProduct, 1);
    setQuoteSuccessMessage('Custom system configuration added to checkout cart!');
    setIsCartOpen(true);
    setTimeout(() => {
      setQuoteSuccessMessage('');
    }, 4000);
  };

  // Checkout Form State
  const [paymentGateway, setPaymentGateway] = useState<'paystack' | 'flutterwave' | 'stripe'>('paystack');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Formatting NGN Currency
  const formatNgn = (n: number) => '₦' + n.toLocaleString('en-NG');

  // Filter products
  const filteredProducts = products.filter(p => {
    // Segment check
    if (activeSegment === 'solar' && !p.category.startsWith('solar') && p.category !== 'inverter' && p.category !== 'battery') return false;
    if (activeSegment === 'cctv' && !p.category.startsWith('cctv')) return false;

    // Subcategory check
    if (selectedSubCategory !== 'all' && p.category !== selectedSubCategory) return false;

    // Search check
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Price check
    if (p.price < minPrice || p.price > maxPrice) return false;

    return true;
  });

  const allSubcategories = activeSegment === 'all' 
    ? ['all', 'solar-panel', 'inverter', 'battery', 'solar-accessory', 'cctv-camera', 'cctv-recorder', 'cctv-accessory']
    : activeSegment === 'solar'
      ? ['all', 'solar-panel', 'inverter', 'battery', 'solar-accessory']
      : ['all', 'cctv-camera', 'cctv-recorder', 'cctv-accessory'];

  // Comparison mechanics
  const handleToggleCompare = (product: Product) => {
    const exists = compareList.some(item => item.id === product.id);
    if (exists) {
      setCompareList(compareList.filter(item => item.id !== product.id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare a maximum of 3 products simultaneously.");
        return;
      }
      setCompareList([...compareList, product]);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaying(true);
    
    // Simulate premium financial security processing
    setTimeout(() => {
      setIsPaying(false);
      setPaymentDone(true);
      
      const orderData = {
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalNgn: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        paymentMethod: paymentGateway.toUpperCase(),
        clientName: cardName,
        clientAddress: deliveryAddress,
        clientPhone: clientPhone
      };

      onCheckout(orderData);
      
      // Clear forms
      setTimeout(() => {
        setPaymentDone(false);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        // Clear variables
        setCardName('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setDeliveryAddress('');
        setClientPhone('');
      }, 3000);
    }, 2500);
  };

  const getProductImage = (category: string) => {
    if (category === 'solar-panel') {
      return '/src/assets/images/solar_panel_category_1781779732131.jpg';
    }
    if (category === 'inverter') {
      return '/src/assets/images/inverter_category_1781779750199.jpg';
    }
    if (category === 'battery') {
      return '/src/assets/images/battery_category_1781779763875.jpg';
    }
    if (category.startsWith('cctv')) {
      return '/src/assets/images/cctv_camera_category_1781779777409.jpg';
    }
    return '/src/assets/images/accessory_category_1781779793510.jpg';
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <div id="store-ecosystem" className="flex flex-col gap-6 text-white bg-[#060c18] p-6 rounded-2xl border border-gray-800">
      
      {/* Sub Header & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-heading font-extrabold text-white flex items-center gap-2">
            Seaflows Digital Storefront
          </h2>
          <p className="text-gray-400 text-xs">Certified solar microgrids & high-grade bullet surveillance systems with nationwide dispatch.</p>
        </div>

        {/* Action icons shortcut */}
        <div className="flex items-center gap-3">
          <button
            id="compare-trigger"
            onClick={() => setIsCompareOpen(true)}
            className="relative p-2.5 bg-[#0e182a] border border-gray-800 rounded-xl hover:bg-[#15243f] transition-all flex items-center gap-1.5 text-xs text-gray-300 font-bold"
          >
            <RefreshCw size={14} className={compareList.length > 0 ? "animate-spin" : ""} />
            Compare ({compareList.length})
          </button>
          <button
            id="wishlist-trigger"
            className="p-2.5 bg-[#0e182a] border border-gray-800 rounded-xl hover:bg-[#15243f] transition-all flex items-center gap-1.5 text-xs text-gray-300 font-bold"
          >
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            Wishlist ({wishlist.length})
          </button>
          <button
            id="cart-trigger"
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 bg-[#FDB813] text-[#0A2342] rounded-xl hover:bg-amber-400 font-bold flex items-center gap-1.5 text-xs transition-transform transform active:scale-95"
          >
            <ShoppingCart size={14} />
            Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
          </button>
        </div>
      </div>

      {/* Dynamic Quick-Quote System Cost Estimator */}
      <div className="bg-gradient-to-r from-[#030915] via-[#09152b] to-[#030915] rounded-xl border border-gray-800 p-4 shrink-0 transition-all shadow-md relative overflow-hidden">
        {/* Decorative corner ambient lights */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FDB813]/2 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/3 rounded-full blur-[60px] pointer-events-none" />

        <div className="flex justify-between items-center cursor-pointer border-b border-gray-850 pb-3" onClick={() => setIsQuoteEstimatorOpen(!isQuoteEstimatorOpen)}>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#FDB813]/10 border border-[#FDB813]/20 rounded-lg text-[#FDB813] flex items-center justify-center">
              <Calculator size={16} className="animate-pulse" />
            </span>
            <div>
              <h3 className="text-xs font-heading font-extrabold text-white tracking-wide uppercase flex items-center gap-1.5">
                Instant System Cost Architect & Estimator
                <span className="bg-blue-950/40 text-blue-300 text-[8px] px-1.5 py-0.5 rounded border border-blue-900/40 uppercase tracking-widest font-mono">Real-time</span>
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Slider-configured rough estimates for hybrid power backups and commercial camera matrices.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-emerald-400 font-heading bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30">
              {formatNgn(calculatedGrandTotal)}
            </span>
            <button
              type="button"
              className="p-1 bg-[#0c1322] border border-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              {isQuoteEstimatorOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isQuoteEstimatorOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                
                {/* SLIDERS MODULE */}
                <div className="lg:col-span-7 flex flex-col gap-4.5 bg-[#030812]/50 p-4 rounded-xl border border-gray-900">
                  <span className="text-[9px] font-mono text-[#FDB813] tracking-widest uppercase font-extrabold flex items-center gap-1">
                    <Sliders size={10} /> 1. Fine-Tune Hardware Parameters
                  </span>

                  {/* 1. Inverter slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-300 font-bold flex items-center gap-1">
                        <Zap size={10} className="text-amber-400" /> Pure Sine Inverter Capacity
                      </span>
                      <span className="text-[#FDB813] font-mono font-bold">
                        {inverterKva === 0 ? 'None' : `${inverterKva} kVA`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={inverterKva}
                      onChange={(e) => setInverterKva(Number(e.target.value))}
                      className="w-full accent-[#FDB813] bg-[#0c1424] h-1.5 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-500 font-sans italic leading-none block">
                      {inverterKva === 0 && 'No power backup required.'}
                      {inverterKva > 0 && inverterKva <= 2 && 'Optimal for basic items: fans, lights, router, and CCTV.'}
                      {inverterKva > 2 && inverterKva <= 5 && 'Covers standard flat limits, washing machine, pump & fridge.'}
                      {inverterKva > 5 && 'Supports complete duplex cooling systems, server racks, & large properties.'}
                    </span>
                  </div>

                  {/* 2. Battery storage slider */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-300 font-bold flex items-center gap-1">
                        <Bolt size={10} className="text-blue-400" /> German Tubular / Gel Batteries
                      </span>
                      <span className="text-blue-400 font-mono font-bold">
                        {batteryCount === 0 ? 'None' : `${batteryCount} Unit${batteryCount > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="1"
                      value={batteryCount}
                      onChange={(e) => setBatteryCount(Number(e.target.value))}
                      className="w-full accent-blue-500 bg-[#0c1424] h-1.5 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-500 font-sans italic leading-none block">
                      {batteryCount === 0 && 'Direct generator / grid bypass.'}
                      {batteryCount > 0 && batteryCount <= 2 && 'Standard nighttime light-load storage.'}
                      {batteryCount > 2 && batteryCount <= 4 && 'Heavy Duty 24Hr backup safety.'}
                      {batteryCount > 4 && 'Long Autonomy modular reserve (Commercial / Medical).'}
                    </span>
                  </div>

                  {/* 3. Solar Panels counts */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-300 font-bold flex items-center gap-1">
                        <Sun size={10} className="text-amber-500" /> High-Efficiency Mono PERC Panels
                      </span>
                      <span className="text-amber-400 font-mono font-bold">
                        {solarPanels === 0 ? 'None' : `${solarPanels} Panel${solarPanels > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="2"
                      value={solarPanels}
                      onChange={(e) => setSolarPanels(Number(e.target.value))}
                      className="w-full accent-amber-500 bg-[#0c1424] h-1.5 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-500 font-sans italic leading-none block">
                      {solarPanels === 0 && 'Grid / Gen charging only.'}
                      {solarPanels > 0 && solarPanels <= 4 && 'Charges under minimal sun conditions.'}
                      {solarPanels > 4 && solarPanels <= 8 && 'Generates up to 30KWH daily output.'}
                      {solarPanels > 8 && 'Full off-grid autonomy generation.'}
                    </span>
                  </div>

                  {/* 4. CCTV cameras slider */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-300 font-bold flex items-center gap-1">
                        <ShieldAlert size={10} className="text-rose-400" /> AI CCTV Camera Streams
                      </span>
                      <span className="text-rose-400 font-mono font-bold">
                        {cctvCameras === 0 ? 'None' : `${cctvCameras} Camera${cctvCameras > 1 ? 's' : ''}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="16"
                      step="2"
                      value={cctvCameras}
                      onChange={(e) => setCctvCameras(Number(e.target.value))}
                      className="w-full accent-rose-500 bg-[#0c1424] h-1.5 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9px] text-gray-500 font-sans italic leading-none block">
                      {cctvCameras === 0 && 'No CCTV surveillance security.'}
                      {cctvCameras > 0 && cctvCameras <= 4 && 'Standard parameter angles coverage.'}
                      {cctvCameras > 4 && cctvCameras <= 8 && 'Integrated surrounding bullet scanning.'}
                      {cctvCameras > 8 && 'Full site military-intelligence layout.'}
                    </span>
                  </div>

                  {/* Installation Commissioning Toggle */}
                  <div className="mt-2 pt-2 border-t border-gray-900 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-gray-300 block">Professional Installation & Commissioning</span>
                      <span className="text-[9px] text-gray-500 block leading-tight">10% Equipment baseline covering bracket rails, cabling, and certified field engineers.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeInstallation} 
                        onChange={(e) => setIncludeInstallation(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-[#0a1120] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-[#FDB813] after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-900 border border-gray-800"></div>
                    </label>
                  </div>
                </div>

                {/* COST PREVIEW AND CTAs */}
                <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-[#030913] p-4 rounded-xl border border-gray-850">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-mono text-gray-500 tracking-widest uppercase font-extrabold flex items-center gap-1 border-b border-gray-850 pb-2">
                      <Sparkles size={10} /> 2. Real-time Fee Breakdown
                    </span>

                    <div className="space-y-1.5 text-[11px] text-gray-400">
                      {inverterKva > 0 && (
                        <div className="flex justify-between">
                          <span>Inverter Unit ({inverterKva}kVA):</span>
                          <span className="font-mono text-white">{formatNgn(inverterCost)}</span>
                        </div>
                      )}
                      {batteryCount > 0 && (
                        <div className="flex justify-between">
                          <span>Battery Stack ({batteryCount}x):</span>
                          <span className="font-mono text-white">{formatNgn(batteryCost)}</span>
                        </div>
                      )}
                      {solarPanels > 0 && (
                        <div className="flex justify-between">
                          <span>Solar Array ({solarPanels}x Panels):</span>
                          <span className="font-mono text-white">{formatNgn(panelCost)}</span>
                        </div>
                      )}
                      {cctvCameras > 0 && (
                        <div className="flex justify-between">
                          <span>Bullet CCTV ({cctvCameras} Streams):</span>
                          <span className="font-mono text-white">{formatNgn(cctvCost)}</span>
                        </div>
                      )}
                      {cctvCameras > 0 && (
                        <div className="flex justify-between">
                          <span>HE Surveillance NVR Recorder:</span>
                          <span className="font-mono text-white">{formatNgn(recorderCost)}</span>
                        </div>
                      )}
                      {includeInstallation && (
                        <div className="flex justify-between text-blue-400">
                          <span>Secure Field Installation:</span>
                          <span className="font-mono">{formatNgn(installationCost)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-850 pt-3">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Total Rough Estimate</span>
                      <span className="text-xl font-heading font-extrabold text-[#FDB813]">{formatNgn(calculatedGrandTotal)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomPackageToCart}
                      className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-2.5 px-4 rounded-lg font-heading font-extrabold text-xs tracking-wider uppercase transition-transform active:scale-[0.98] duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={13} /> Wrap & Add Package to Cart
                    </button>

                    {quoteSuccessMessage && (
                      <span className="text-[9.5px] font-bold text-emerald-400 font-sans block text-center mt-2 animate-bounce">
                        {quoteSuccessMessage}
                      </span>
                    )}

                    <span className="text-[8.5px] text-gray-500 leading-snug mt-2.5 text-center block font-sans">
                      *Note: Generated rough pricing estimates are indicative of equipment costs + site engineering fees and can vary + or - 5% on site topology assessment.
                    </span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Showcase Bento - Interactive Generated Placeholder Deck */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-mono tracking-widest text-[#FDB813] uppercase font-bold flex items-center gap-1.5">
          <Sparkles size={11} className="text-[#FDB813]" /> Shop By High-Tech Hardware Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              id: 'solar-panel',
              segment: 'solar',
              label: 'Solar Panels',
              desc: 'Bifacial Mono PERC cells',
              image: '/src/assets/images/solar_panel_category_1781779732131.jpg',
            },
            {
              id: 'inverter',
              segment: 'solar',
              label: 'Smart Inverters',
              desc: 'Pure sine wave hybrid systems',
              image: '/src/assets/images/inverter_category_1781779750199.jpg',
            },
            {
              id: 'battery',
              segment: 'solar',
              label: 'Titan Batteries',
              desc: 'Rack-ready deep-cycle lithium',
              image: '/src/assets/images/battery_category_1781779763875.jpg',
            },
            {
              id: 'cctv-camera',
              segment: 'cctv',
              label: 'AI Surveillance',
              desc: 'Starlight face-recognition cameras',
              image: '/src/assets/images/cctv_camera_category_1781779777409.jpg',
            },
            {
              id: 'accessories',
              segment: 'all',
              label: 'System Hardware',
              desc: 'Heavy cabling, controllers & NVRs',
              image: '/src/assets/images/accessory_category_1781779793510.jpg',
            }
          ].map(cat => {
            const isFilterSelected = (cat.id === 'accessories' && selectedSubCategory === 'all') || (selectedSubCategory === cat.id);
            return (
              <motion.button
                key={cat.id}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (cat.id === 'accessories') {
                    setActiveSegment('all');
                    setSelectedSubCategory('all');
                  } else {
                    setActiveSegment(cat.segment as any);
                    setSelectedSubCategory(cat.id);
                  }
                }}
                className={`relative h-28 rounded-xl overflow-hidden border text-left flex flex-col justify-end p-3 transition-all duration-300 group cursor-pointer ${
                  isFilterSelected 
                    ? 'border-[#FDB813] ring-1 ring-[#FDB813]/30 shadow-lg shadow-[#FDB813]/10' 
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Full Bleed Image with Overlay */}
                <img 
                  src={cat.image} 
                  alt={cat.label} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                
                {/* Gradient shader protection layer */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10 transition-colors duration-300 ${
                  isFilterSelected ? 'from-black/95 via-black/75 to-transparent' : 'from-black/90 via-black/50 to-transparent'
                }`} />

                {/* Content */}
                <div className="relative z-10 flex flex-col">
                  <span className={`text-[11px] font-heading font-extrabold tracking-wide uppercase transition-colors ${
                    isFilterSelected ? 'text-[#FDB813]' : 'text-white'
                  }`}>
                    {cat.label}
                  </span>
                  <span className="text-[8.5px] text-gray-400 font-sans leading-normal line-clamp-1">
                    {cat.desc}
                  </span>
                </div>
                
                {/* Glowing edge dots */}
                {isFilterSelected && (
                  <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FDB813] rounded-full animate-ping" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Primary Category Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#030812] p-2.5 rounded-xl border border-gray-800/80">
        <div className="flex gap-1.5">
          {[
            { id: 'all', label: 'All Catalog' },
            { id: 'solar', label: 'Solar Energy Products' },
            { id: 'cctv', label: 'CCTV Security Systems' }
          ].map(seg => (
            <button
              key={seg.id}
              onClick={() => {
                setActiveSegment(seg.id as any);
                setSelectedSubCategory('all');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors ${
                activeSegment === seg.id 
                  ? 'bg-[#FDB813] text-[#0A2342]' 
                  : 'text-gray-400 hover:text-white hover:bg-[#0d1624]'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        {/* Global Live Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-3 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search panels, AI cameras, NVRs..."
            className="w-full bg-[#0a1120] text-xs text-white pl-9 pr-4 py-2.5 rounded-lg border border-gray-800 focus:outline-none focus:border-[#FDB813] transition-colors"
          />
        </div>
      </div>

      {/* Sub-Category Filters Rail */}
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
        {allSubcategories.map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubCategory(sub)}
            className={`px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest rounded-full transition-colors border ${
              selectedSubCategory === sub 
                ? 'bg-blue-600/20 text-blue-300 border-blue-500' 
                : 'bg-[#090f1a] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
            }`}
          >
            {sub.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Core Products Grid */}
      <div ref={storeGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 scroll-mt-24">
        {filteredProducts.map(p => {
          const isComparing = compareList.some(item => item.id === p.id);
          const inWish = wishlist.some(item => item.id === p.id);
          const inCart = cart.some(item => item.product.id === p.id);

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 35, scale: 0.90 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: "-12% 0px -12% 0px" }}
              whileHover={{ 
                scale: 1.025,
                y: -6, 
                borderColor: "rgba(253, 184, 19, 0.35)",
                boxShadow: "0 20px 40px -15px rgba(253, 184, 13, 0.12)",
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              transition={{ 
                type: "spring",
                stiffness: 95,
                damping: 15
              }}
              className="bg-[#030913] rounded-xl border border-gray-800 p-4 flex flex-col gap-3 relative transition-all duration-300 will-change-transform"
            >
              {/* Product Badge Category */}
              <div className="flex justify-between items-start gap-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40">
                  {p.category.split('-')[0]}
                </span>
                
                {/* Low Stock Indicator */}
                {p.stock <= 15 && (
                  <span className="text-[8px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded flex items-center gap-0.5 border border-amber-900/30">
                    <ShieldAlert size={8} /> Only {p.stock} Left
                  </span>
                )}
              </div>

              {/* High-Tech Generated Illustration placeholder as full-fill canvas */}
              <div className="h-40 bg-[#060c18] rounded-lg flex items-center justify-center relative overflow-hidden group border border-gray-900">
                {/* Visual Image Asset */}
                <img 
                  src={getProductImage(p.category)} 
                  alt={p.name} 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-300 group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Modern visual shader shield */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#030913] via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-2.5 left-2.5 z-10 p-1.5 bg-black/75 rounded-md border border-gray-800/40 text-[#FDB813] opacity-80 group-hover:opacity-100 transition-opacity">
                  {p.category === 'solar-panel' && <Sun size={10} />}
                  {p.category === 'inverter' && <Zap size={10} />}
                  {p.category === 'battery' && <Bolt size={10} />}
                  {p.category.startsWith('cctv') && <ShieldAlert size={10} />}
                  {!['solar-panel', 'inverter', 'battery', 'cctv-camera', 'cctv-recorder'].includes(p.category) && <Sliders size={10} />}
                </div>

                <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 bg-black/65 rounded border border-gray-800/50 backdrop-blur-xs">
                  <span className="text-[8px] text-gray-400 font-mono font-bold uppercase tracking-wider">{p.brand} GENUINE</span>
                </div>

                {/* Floating quick actions */}
                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleCompare(p)}
                    className={`p-1.5 rounded-lg border text-white transition-colors cursor-pointer ${
                      isComparing ? 'bg-blue-600 border-blue-500' : 'bg-gray-900 border-gray-700 hover:bg-gray-800'
                    }`}
                    title="Compare specifications"
                  >
                    <RefreshCw size={11} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => inWish ? onRemoveFromWishlist(p.id) : onAddToWishlist(p)}
                    className="p-1.5 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-800 text-rose-500 transition-colors cursor-pointer"
                    title="Add to Wishlist"
                  >
                    <Heart size={11} fill={inWish ? "currentColor" : "none"} />
                  </motion.button>
                </div>
              </div>

              {/* Title & Price */}
              <div className="flex flex-col gap-1 flex-1">
                <h3 className="font-heading font-bold text-xs text-white line-clamp-2 leading-snug hover:text-[#FDB813] cursor-pointer transition-colors" onClick={() => setSelectedProduct(p)}>
                  {p.name}
                </h3>
                
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                  <Star size={10} className="text-[#FDB813] fill-[#FDB813]" />
                  <span className="font-semibold text-white">{p.rating}</span>
                  <span>({p.reviews.length} reviews)</span>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-850 flex justify-between items-end">
                  <span className="text-sm font-heading font-extrabold text-emerald-400">{formatNgn(p.price)}</span>
                  <span className="text-[10px] text-gray-500 font-mono uppercase">{p.brand}</span>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-[#0b1424] hover:bg-[#111f38] border border-gray-800 py-2 rounded-lg text-[11px] font-bold text-gray-300 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Eye size={12} /> View Details
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAddToCart(p, 1)}
                  className={`py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    inCart 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-[#FDB813] hover:bg-amber-400 text-[#0A2342]'
                  }`}
                >
                  {inCart ? <CheckCircle size={12} /> : <Plus size={12} />}
                  {inCart ? 'In Cart' : 'Buy Now'}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- CART DRAWER OVERLAY --- */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-md bg-[#070e1b] border-l border-gray-800 h-full flex flex-col p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-[#FDB813]" size={20} />
                  <span className="font-heading font-extrabold text-white text-base">Your Cart Items</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-[#030913] p-3 rounded-lg border border-gray-800 flex justify-between items-center gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-white block line-clamp-1">{item.product.name}</span>
                      <span className="text-[11px] text-emerald-400 font-bold block mt-0.5">{formatNgn(item.product.price)}</span>
                    </div>

                    {/* Qty selectors */}
                    <div className="flex items-center gap-2 bg-[#0a1120] px-2 py-1 rounded-md border border-gray-800 shrink-0">
                      <button onClick={() => onUpdateCartQty(item.product.id, Math.max(1, item.quantity - 1))} className="text-gray-400 hover:text-white p-1">
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-mono font-bold text-white px-1">{item.quantity}</span>
                      <button onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)} className="text-gray-400 hover:text-white p-1">
                        <Plus size={11} />
                      </button>
                    </div>

                    <button onClick={() => onRemoveFromCart(item.product.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 text-gray-500">
                    <ShoppingCart size={40} className="text-gray-700 mb-2" />
                    <span className="text-xs">Your shopping cart is currently empty. Add products to get started.</span>
                  </div>
                )}
              </div>

              {/* Sum & checkout checkout info */}
              {cart.length > 0 && (
                <div className="border-t border-gray-800 pt-5 mt-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-xs text-gray-400 uppercase">Subtotal Accumulation</span>
                    <span className="text-lg text-[#FDB813] font-heading font-extrabold">{formatNgn(cartTotal)}</span>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-3 rounded-xl text-xs font-heading font-extrabold tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5"
                  >
                    Secure Online Checkout <CreditCard size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SIDE-BY-SIDE COMPARE DRAWER OVERLAY --- */}
      <AnimatePresence>
        {isCompareOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#070e1b] border border-gray-800 w-full max-w-4xl p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                <span className="font-heading font-extrabold text-white text-base">Specifications Side-by-Side Comparison</span>
                <button onClick={() => setIsCompareOpen(false)} className="p-1 text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto">
                {compareList.map(item => (
                  <div key={item.id} className="bg-[#030913] p-4 rounded-xl border border-gray-850 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-2">
                        <span className="text-[10px] font-mono text-[#FDB813] uppercase">{item.brand}</span>
                        <button onClick={() => handleToggleCompare(item)} className="text-red-400 hover:text-red-300 p-0.5">
                          <X size={12} />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 mb-2">{item.name}</h4>
                      <span className="text-lg font-extrabold text-emerald-400 block mb-4">{formatNgn(item.price)}</span>

                      <div className="flex flex-col gap-2.5 text-[11px] border-t border-gray-850 pt-3">
                        {Object.entries(item.specifications).map(([k, v]) => (
                          <div key={k} className="border-b border-gray-900 pb-1.5">
                            <span className="text-gray-400 block text-[9px] uppercase tracking-wider">{k}</span>
                            <span className="text-gray-200 font-semibold">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onAddToCart(item, 1)}
                      className="w-full bg-[#101b30] hover:bg-blue-900 border border-gray-800 py-2 rounded-lg text-xs font-bold font-heading text-white transition-colors mt-6"
                    >
                      Add to Basket
                    </button>
                  </div>
                ))}

                {compareList.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    <RefreshCw size={40} className="mx-auto text-gray-700 mb-2" />
                    <span>No products chosen. Tap the comparison icon on any product in the store.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DETAILED PRODUCT DETAILS MODAL --- */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#070e1b] border border-gray-800 w-full max-w-2xl p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-5"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                <span className="font-heading font-extrabold text-white text-base">Product Technical Sheet</span>
                <button onClick={() => setSelectedProduct(null)} className="p-1 text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Visual Banner of the Category with Seaflows aesthetics */}
                <div className="h-44 w-full relative rounded-xl overflow-hidden border border-gray-850 animate-fade-in shrink-0">
                  <img 
                    src={getProductImage(selectedProduct.category)} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover opacity-85"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070e1b] via-[#070e1b]/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono tracking-wider font-extrabold text-[#FDB813] bg-black/60 px-2 py-0.5 rounded border border-gray-800/50 backdrop-blur-xs">
                      {selectedProduct.category.replace('-', ' ')} Catalog Item
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[#FDB813] font-mono text-[11px] tracking-wider uppercase font-bold">{selectedProduct.brand} ORIGINAL</span>
                    <span className="text-[10px] text-gray-400">STOCK IN NIGERIA: {selectedProduct.stock} UNITS</span>
                  </div>
                  <h3 className="text-sm font-heading font-extrabold text-white">{selectedProduct.name}</h3>
                </div>

                <div className="p-4 bg-[#030913] rounded-xl border border-gray-850 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Catalog Spot price</span>
                    <span className="text-xl font-heading font-extrabold text-emerald-400">{formatNgn(selectedProduct.price)}</span>
                  </div>
                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct, 1);
                      setSelectedProduct(null);
                    }}
                    className="bg-[#FDB813] text-[#0A2342] hover:bg-amber-400 px-5 py-2.5 rounded-lg text-xs font-bold leading-none uppercase tracking-wider transition-colors"
                  >
                    Add to Cart basket
                  </button>
                </div>

                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800 pb-1.5 mb-2">Description / Engineering</h4>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">{selectedProduct.description}</p>
                </div>

                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800 pb-1.5 mb-2">Technical Matrix Specification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedProduct.specifications).map(([k, v]) => (
                      <div key={k} className="p-2.5 bg-[#030913] border border-gray-850 text-xs rounded-lg flex justify-between">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-white font-bold text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews listing */}
                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800 pb-1.5 mb-2">Customer Feedback Review</h4>
                  {selectedProduct.reviews.map(rev => (
                    <div key={rev.id} className="bg-[#030913] p-3 rounded-lg border border-gray-850 flex flex-col gap-1.5 mb-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{rev.user}</span>
                        <div className="flex gap-0.5 text-[#FDB813]">
                          {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} size={10} className="fill-current" />)}
                        </div>
                      </div>
                      <p className="text-gray-300 italic">"{rev.comment}"</p>
                      <span className="text-[10px] text-gray-500 font-mono text-right">{rev.date}</span>
                    </div>
                  ))}
                  {selectedProduct.reviews.length === 0 && (
                    <span className="text-xs text-gray-500 italic">No reviews compiled for this physical item yet. Feel free to leave a post-purchase log.</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SECURE CHECKOUT POPUP / FORM --- */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#070e1b] border border-gray-800 w-full max-w-md p-6 rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
                <span className="font-heading font-extrabold text-white text-base">Secure Gateway E-Checkout</span>
                <button onClick={() => setIsCheckoutOpen(false)} className="p-1 text-gray-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {paymentDone ? (
                <div id="payment-success" className="flex flex-col items-center text-center py-8 gap-4">
                  <div className="p-3 bg-emerald-900/40 text-emerald-300 rounded-full border border-emerald-800 animate-bounce">
                    <CheckCircle size={36} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-white text-base">Payment Authorized Successfully!</h3>
                    <p className="text-gray-400 text-xs mt-1">Thank you. An automated representative will reach out to you within 2 hour cycles to verify your site address coordinates.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4 text-xs">
                  
                  {/* Total Value */}
                  <div className="p-4 bg-[#0a1528] rounded-xl border border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Grand Total Outlay</span>
                    <span className="text-lg font-heading font-extrabold text-[#FDB813]">{formatNgn(cartTotal)}</span>
                  </div>

                  {/* Payment gateway select */}
                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-2">Integrated Gateway Router</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'paystack', label: 'Paystack' },
                        { id: 'flutterwave', label: 'Flutterwave' },
                        { id: 'stripe', label: 'Stripe' }
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setPaymentGateway(g.id as any)}
                          className={`py-2 px-1 rounded-lg border text-center font-bold tracking-wider transition-colors uppercase text-[9px] ${
                            paymentGateway === g.id 
                              ? 'bg-blue-600/20 text-blue-300 border-blue-500' 
                              : 'bg-[#030913] text-gray-400 border-gray-850 hover:border-gray-700'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-850 my-1"/>

                  {/* Client Info */}
                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Active Phone/WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      placeholder="e.g. +234 803 123 4567"
                      className="w-full bg-[#030913] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#FDB813]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Physical Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. 15 Allen Avenue, Ikeja, Lagos"
                      className="w-full bg-[#030913] border border-gray-850 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Card values inputs */}
                  <div className="p-3 bg-[#030913] rounded-xl border border-gray-850 flex flex-col gap-3">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block border-b border-gray-900 pb-1.5 flex items-center gap-1">
                      <CreditCard size={10} /> Debit / Credit Secure Card Details
                    </span>

                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Cardholders Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="e.g. Chinedu Yusuf Adeleke"
                        className="w-full bg-[#070e1b] border border-gray-850 rounded-md p-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">16-Digit Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        maxLength={19}
                        placeholder="4321 0000 8731 2294"
                        className="w-full bg-[#070e1b] border border-gray-850 rounded-md p-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          maxLength={5}
                          placeholder="09/29"
                          className="w-full bg-[#070e1b] border border-gray-850 rounded-md p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">CVV Pin</label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          maxLength={3}
                          placeholder="***"
                          className="w-full bg-[#070e1b] border border-gray-850 rounded-md p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full bg-[#FDB813] hover:bg-amber-400 text-[#0A2342] py-3 rounded-xl text-xs font-heading font-extrabold uppercase tracking-widest transition-opacity flex items-center justify-center gap-1.5"
                  >
                    {isPaying ? 'Authenticating payment...' : `PAY ${formatNgn(cartTotal)} SECURELY`}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
