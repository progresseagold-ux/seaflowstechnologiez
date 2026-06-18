import { Product, BlogItem, PortfolioItem, Testimonial } from './types';

export const SOLAR_PRODUCTS: Product[] = [
  {
    id: 'sol-001',
    name: 'Seaflows Elite 550W Monocrystalline Bifacial Panel',
    category: 'solar-panel',
    price: 180000,
    brand: 'Seaflows',
    stock: 45,
    rating: 4.9,
    description: 'High-efficiency bifacial monocrystalline solar panel with half-cut cell technology, generating up to 25% extra power from the rear side. Certified for extreme durability and salt-mist corrosion resistance.',
    image: 'solar-panel-550w',
    specifications: {
      'Rated Power': '550W',
      'Cell Type': 'Monocrystalline (Bifacial)',
      'Efficiency': '21.5%',
      'Open Circuit Voltage (Voc)': '49.8V',
      'Short Circuit Current (Isc)': '13.9A',
      'Dimensions': '2279 x 1134 x 35 mm',
      'Warranty': '12-year product, 25-year linear performance'
    },
    reviews: [
      { id: 'rev-1', user: 'Chidi K.', rating: 5, comment: 'Phenomenal performance! Easily gets more output during bright afternoons. Clean design.', date: '2026-05-12' }
    ]
  },
  {
    id: 'sol-002',
    name: 'Seaflows Compact 450W Monocrystalline Panel',
    category: 'solar-panel',
    price: 145000,
    brand: 'Seaflows',
    stock: 80,
    rating: 4.8,
    description: 'Highly reliable monocrystalline solar panel perfect for tight residential roof configurations. Features state-of-the-art multi-busbar technology for minimized microcracks.',
    image: 'solar-panel-450w',
    specifications: {
      'Rated Power': '450W',
      'Cell Type': 'Monocrystalline',
      'Efficiency': '20.7%',
      'Open Circuit Voltage (Voc)': '41.4V',
      'Short Circuit Current (Isc)': '11.5A',
      'Dimensions': '2094 x 1038 x 35 mm',
      'Warranty': '10-year product, 25-year performance'
    },
    reviews: []
  },
  {
    id: 'sol-003',
    name: 'Seaflows Apex 5kVA/48V Smart Hybrid Inverter',
    category: 'inverter',
    price: 680000,
    brand: 'Seaflows Power',
    stock: 20,
    rating: 4.9,
    description: 'Pure sine wave hybrid inverter with a built-in 80A MPPT charge controller. Features seamless automatic transfer switch (ATS), high-resolution LCD touch screen, and integrated Wi-Fi monitoring.',
    image: 'inverter-5kva',
    specifications: {
      'Rated Power': '5000W / 5kVA',
      'Input Voltage': '48V DC',
      'MPPT Range': '120V - 450V DC',
      'Max Charge Current': '80A',
      'Output Voltage': '230V AC ± 5%',
      'Efficiency': '93%',
      'Connectivity': 'Wi-Fi / Mobile App Monitoring'
    },
    reviews: [
      { id: 'rev-2', user: 'Mrs. Funmi A.', rating: 5, comment: 'The Wi-Fi application makes tracking my daily solar yield super simple. No blinking when NEPA cuts light.', date: '2026-05-24' }
    ]
  },
  {
    id: 'sol-004',
    name: 'Seaflows Pro 3kVA/24V Off-Grid Inverter',
    category: 'inverter',
    price: 420000,
    brand: 'Seaflows Power',
    stock: 15,
    rating: 4.7,
    description: 'Perfect budget-friendly solution for small-to-medium households. Pure sine wave output with high surge capacity for smooth appliance startup.',
    image: 'inverter-3kva',
    specifications: {
      'Rated Power': '3000W / 3kVA',
      'Input Voltage': '24V DC',
      'MPPT Capacity': '60A',
      'Output Voltage': '230V AC',
      'Efficiency': '90%'
    },
    reviews: []
  },
  {
    id: 'sol-005',
    name: 'Seaflows Lithium LiFePO4 Titan 48V/100Ah Battery',
    category: 'battery',
    price: 1500000,
    brand: 'Seaflows Titan',
    stock: 25,
    rating: 5.0,
    description: 'Premium Lithium Iron Phosphate (LiFePO4) storage block with smart BMS. Standard 19-inch rack-ready design, support up to 6000 cycles at 80% DoD for extreme longevity over 10+ years.',
    image: 'battery-lithium',
    specifications: {
      'Battery Chemistry': 'LiFePO4 (Lithium Iron Phosphate)',
      'Nominal Voltage': '51.2V',
      'Capacity': '100Ah (5.12kWh)',
      'Cycle Life': '> 6,000 Cycles @ 80% DoD',
      'Max Discharge Rate': '100A Co',
      'Weight': '44 kg',
      'Warranty': '5-year manufacturer warranty'
    },
    reviews: [
      { id: 'rev-3', user: 'Emeka O.', rating: 5, comment: 'Durable and handles heavy appliances flawlessly. Best lithium storage in Nigeria.', date: '2026-04-18' }
    ]
  },
  {
    id: 'sol-006',
    name: 'Seaflows Deep-Cycle Gel 12V/200Ah Battery',
    category: 'battery',
    price: 240000,
    brand: 'Seaflows Power',
    stock: 62,
    rating: 4.5,
    description: 'Maintenance-free tubular gel battery. Specifically engineered to withstand the ambient heat of West African climates without off-gassing.',
    image: 'battery-gel',
    specifications: {
      'Nominal Voltage': '12V',
      'Capacity': '200Ah @ 20hr rate',
      'Chemistry': 'Tubular Gel',
      'Design Life': '8 - 10 years',
      'Weight': '60 kg'
    },
    reviews: []
  },
  {
    id: 'sol-007',
    name: 'Seaflows MPPT 100V/60A Smart Charge Controller',
    category: 'solar-accessory',
    price: 130000,
    brand: 'Seaflows',
    stock: 35,
    rating: 4.8,
    description: 'Highly advanced maximum power point tracking controller. Boosts current output for battery bank charging by up to 30% compared to standard PWM controllers.',
    image: 'charge-controller',
    specifications: {
      'Method': 'Ultra-Fast MPPT',
      'Max PV Input': '100V DC',
      'Rated Output Current': '60A',
      'Auto Detect': '12V / 24V / 36V / 48V Bank'
    },
    reviews: []
  }
];

export const CCTV_PRODUCTS: Product[] = [
  {
    id: 'cam-001',
    name: 'Seaflows Guard PTZ Smart Dome AI Camera',
    category: 'cctv-camera',
    price: 95000,
    brand: 'Seaflows Security',
    stock: 30,
    rating: 4.9,
    description: 'Enterprise 4K (8MP) pan-tilt-zoom indoor/outdoor dome camera. Features smart AI human detection, facial recognition, vehicle classification, and 150m night vision with dual starlight sensor.',
    image: 'camera-ptz',
    specifications: {
      'Resolution': '4K UHD (3840 x 2160) @ 30fps',
      'PTZ Range': 'Pan: 360° continuous, Tilt: 90°',
      'Optical Zoom': '30x Optical Zoom',
      'Night Vision': 'Dual Starlight IR (Up to 150 meters)',
      'Waterproof Standard': 'IP67 Weatherproof',
      'Smart Features': 'Intrusion Detection, Tripwire, Face Recognition',
      'Connectivity': 'PoE (Power over Ethernet)'
    },
    reviews: [
      { id: 'rev-4', user: 'Alhaji Ibrahim', rating: 5, comment: 'Installed on our warehouse complex. Super zoom is extremely clear. Can read license plates over 80 meters away.', date: '2026-05-02' }
    ]
  },
  {
    id: 'cam-002',
    name: 'Seaflows Fortress 4MP PoE Bullet Camera',
    category: 'cctv-camera',
    price: 65000,
    brand: 'Seaflows Security',
    stock: 75,
    rating: 4.8,
    description: 'Rugged performance 4-megapixel PoE bullet camera. Designed with metal intrusion housing for vandal resilience and full-color night vision using built-in spotlights.',
    image: 'camera-bullet',
    specifications: {
      'Resolution': '4MP Standard QHD',
      'Lens': '2.8mm Wide Angle',
      'Night Vision': 'Full-Color Night Vision (30m)',
      'Storage': 'MicroSD Slot (Up to 256GB) & NVR support',
      'Protection': 'IP67 & IK10 Vandal-Proof'
    },
    reviews: []
  },
  {
    id: 'cam-003',
    name: 'Seaflows Vigilant HD Dome Camera (PoE)',
    category: 'cctv-camera',
    price: 45000,
    brand: 'Seaflows Security',
    stock: 90,
    rating: 4.6,
    description: 'Compact 5-megapixel indoor PoE dome camera. Perfect for offices, corridors, and residential living spaces. Includes direct two-way audio communications.',
    image: 'camera-dome',
    specifications: {
      'Resolution': '5MP SuperHD',
      'Audio': 'Built-in Mic & Speaker (2-Way Audio)',
      'Lenses': '3.6mm Fixed Focal Length',
      'Material': 'Industrial Premium Polymer'
    },
    reviews: []
  },
  {
    id: 'cam-004',
    name: 'Seaflows Omni 8-Channel PoE Network Video Recorder (NVR)',
    category: 'cctv-recorder',
    price: 175000,
    brand: 'Seaflows Security',
    stock: 18,
    rating: 4.8,
    description: 'Professional 4K 8-Channel NVR. Designed for multi-channel video ingestion. Easy local setup with dynamic HDMI output, and cloud access for remote live feeds.',
    image: 'recorder-nvr-8ch',
    specifications: {
      'Channels': '8-Channel PoE Built-in switch',
      'Decoding Format': 'H.265+ / H.264',
      'Max Output': '4K HDMI display',
      'SATA Ports': '1 SATA Slot up to 10TB HDD',
      'App Support': 'Android, iOS, PC Remote Access'
    },
    reviews: []
  },
  {
    id: 'cam-005',
    name: 'Seaflows Titan 16-Channel Professional NVR',
    category: 'cctv-recorder',
    price: 290000,
    brand: 'Seaflows Security',
    stock: 10,
    rating: 4.9,
    description: 'Industrial-grade 16-channel video recording system configured to host multiple drive banks. Provides hardware acceleration for advanced AI classification.',
    image: 'recorder-nvr-16ch',
    specifications: {
      'Channels': '16-Channel PoE ports',
      'SATA Slots': '2 SATA Bays (Up to 20TB total storage)',
      'Bandwidth': '160Mbps Max throughput',
      'Backup': 'USB 3.0 / Network Cloud Storage'
    },
    reviews: []
  },
  {
    id: 'cam-006',
    name: 'WD Purple Surveillance 4TB Custom Hard Drive',
    category: 'cctv-accessory',
    price: 110000,
    brand: 'Western Digital',
    stock: 50,
    rating: 4.7,
    description: 'All-frame surveillance storage specialized for 24/7 high-definition camera streams. Minimizes frame dropouts and write latencies.',
    image: 'cctv-hard-drive',
    specifications: {
      'Capacity': '4TB',
      'Form Factor': '3.5-inch Internal',
      'Interface': 'SATA 6 Gb/s',
      'Workload Rating': '180 TB/year'
    },
    reviews: []
  }
];

export const BLOG_POSTS: BlogItem[] = [
  {
    id: 'blog-1',
    title: 'How to Choose the Right Solar System for Your Nigerian Home',
    summary: 'A simple, practical guide on matching your home appliances, load requirements, and inverter batteries to avoid system overloads.',
    content: 'Solar energy has become a staple for steady, reliable, and noise-free power in Nigeria. Many homeowners buy solar systems without understanding their household load requirements. This leads to system tripping, early battery mortality, and overall bad values.\n\nFirst, list your devices. Devices like ACs, water pumps, and electric irons have inductive start currents which are up to 3x higher than their running wattage. A 1.5HP AC can pull up to 3500W during startup. Ensure your inverter is configured to handle the surge.',
    image: 'blog-solar-guide',
    category: 'Solar Guide',
    author: 'Engr. Seun Flows',
    date: '2026-05-20',
    tags: ['solar tips', 'energy saving', 'Nigeria power']
  },
  {
    id: 'blog-2',
    title: 'Smart CCTV Camera Placement Strategies for Complete Security',
    summary: 'Ensure zero blind spots. Expert tips on placing dome and bullet cameras at entryways, perimeters, and internal workspaces.',
    content: 'Securing your business or home requires more than just buying premium cameras. Smart placements prevent vandalism and provide clear evidentiary footages. Ground cameras should be placed at eye level when tracking entry lanes but must be housed inside vandal-proof casings. Outdoor cameras must face outward with overlapping ranges to cover blind angles.',
    image: 'blog-cctv-guide',
    category: 'Security Tips',
    author: 'CCTV Expert Nelson',
    date: '2026-05-28',
    tags: ['CCTV placement', 'security systems', 'home guard']
  }
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'port-1',
    title: '15kVA Solar Power System - Ikeja Estate',
    category: 'Residential Solar',
    stats: {
      'Inverter Size': '15kVA Smart Hybrid',
      'Battery Bank': '30kWh Lithium Titan',
      'Total Panels': '24x 500W Mono Bifacial',
      'Daily Production': '65 kWh Average',
      'Fuel Savings': '₦480,000 / month'
    },
    imageBefore: 'residential-before',
    imageAfter: 'residential-after',
    clientName: 'Dr. Kunle Adeleke',
    clientReview: 'Seaflows completely eliminated our generator fuel bills. The power switch is 100% quiet and instant.'
  },
  {
    id: 'port-2',
    title: 'High-Sec IP CCTV Surveillance System - Lekki Warehouses',
    category: 'Commercial CCTV',
    stats: {
      'Total Cameras': '32x Smart 4K PTZ & Bullet',
      'Storage Unit': '2x 16-Ch NVR (20TB Storage)',
      'AI Triggers': 'Yes (Tripwire & Face Class)',
      'Backup SLA': '24 Hours UPS Power'
    },
    imageBefore: 'commercial-before',
    imageAfter: 'commercial-after',
    clientName: 'SGS Logistics Ltd',
    clientReview: 'Excellent connections and seamless monitoring. Our control room can watch all stations live from phone apps.'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Alhaji Yusuf Bello',
    role: 'MD, Yusuf & Sons Enterprises',
    text: 'Seaflows Technologies delivers on their motto "Excellent Connections, Better Value". Their technical expertise in setting up our 30kW solar network was world-class. Recommended!',
    rating: 5,
    imageUrl: 'user-yusuf'
  },
  {
    id: 'test-2',
    name: 'Chioma Nwachukwu',
    role: 'Home Owner, Lekki Phase 1',
    text: 'Having CCTV cameras I can view right on my phone is awesome. When we added their 5kVA Solar System, the power became stable. No more generator noises.',
    rating: 5,
    imageUrl: 'user-chioma'
  },
  {
    id: 'test-3',
    name: 'David Olatunji',
    role: 'IT Director, Sterling Chambers',
    text: 'Professional team, precise cabling, and premium mounting brackets. The customer portal allows easy tracking of our post-installation support tickets.',
    rating: 5,
    imageUrl: 'user-david'
  }
];
