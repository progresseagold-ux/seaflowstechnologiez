export interface Product {
  id: string;
  name: string;
  category: 'solar-panel' | 'inverter' | 'battery' | 'solar-accessory' | 'cctv-camera' | 'cctv-recorder' | 'cctv-accessory';
  price: number;
  specifications: Record<string, string>;
  image: string;
  rating: number;
  reviews: Review[];
  stock: number;
  description: string;
  brand: string;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: 'solar' | 'cctv' | 'maintenance' | 'inspection' | 'consultation';
  date: string;
  time: string;
  message: string;
  status: 'pending' | 'assigned' | 'completed';
  assignedTechnician?: string;
  createdAt: string;
}

export interface SolarQuote {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientLocation: string;
  buildingType: string;
  appliances: string;
  loadRequirement: number; // in kW/W
  backupTime: number; // hours
  // System outputs
  systemSizeKw: number;
  requiredPanelsCount: number;
  panelWattsEach: number;
  batteryCapacityAh: number;
  batteryType: string;
  inverterPowerKva: number;
  chargeControllerAh: number;
  estimatedCostNgn: number;
  estimatedSavingsNgn: number;
  paybackPeriodYears: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CctvQuote {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientLocation: string;
  camerasCount: number;
  cameraType: string;
  buildingType: string;
  isOutdoor: boolean;
  storageDays: number;
  // System outputs
  recorderChannels: number;
  hardDriveSizeTb: number;
  powerSupplyAmps: number;
  accessoriesNeed: string[];
  estimatedCostNgn: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface InstallmentPlan {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  productId: string;
  productName: string;
  productPrice: number;
  downPaymentNgn: number;
  periodMonths: number;
  monthlyPaymentNgn: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  clientName: string;
  clientEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
  responses: { sender: 'client' | 'admin'; text: string; date: string }[];
}

export interface BlogItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  stats: Record<string, string>;
  imageBefore: string;
  imageAfter: string;
  clientReview: string;
  clientName: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  totalNgn: number;
  paymentMethod: string;
  status: 'pending' | 'dispatched' | 'completed';
  createdAt: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
}

export interface Notification {
  id: string;
  type: 'booking' | 'quote' | 'ticket';
  referenceId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

