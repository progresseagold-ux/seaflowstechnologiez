import React from 'react';

interface CompanyLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function CompanyLogo({ className = '', showText = true, size = 'md' }: CompanyLogoProps) {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
    xl: 'h-40 w-40'
  };

  return (
    <div id="company-logo-container" className={`flex items-center gap-3 ${className}`}>
      {/* Dynamic Badge Design replicating provided logo */}
      <svg
        id="company-logo-svg"
        viewBox="0 0 400 400"
        className={`${sizeClasses[size]} shrink-0 drop-shadow-lg`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Deep navy boundary circle with electric network connections background */}
        <circle cx="200" cy="200" r="195" fill="#021124" stroke="#ffffff" strokeWidth="4" />
        <circle cx="200" cy="200" r="185" fill="none" stroke="#FDB813" strokeWidth="1" strokeDasharray="5 5" />
        
        {/* Subtle network lines inside representing 'connections' */}
        <path d="M 50 180 C 120 120, 180 250, 350 200" stroke="#003566" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
        <path d="M 60 250 C 130 300, 220 120, 340 180" stroke="#003566" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
        
        <circle cx="100" cy="190" r="4" fill="#0077b6" />
        <circle cx="280" cy="150" r="5" fill="#0077b6" />
        <circle cx="250" cy="270" r="4" fill="#0077b6" />

        {/* --- Solar Panels Group (Right side) --- */}
        <g transform="translate(240, 150) rotate(15)">
          {/* Main Panel Back Plates */}
          <rect x="0" y="0" width="85" height="110" rx="3" fill="#1e1e1e" stroke="#ffffff" strokeWidth="2.5" />
          {/* Blue Silicon cells */}
          <rect x="4" y="4" width="36" height="50" fill="#0f4c81" />
          <rect x="44" y="4" width="37" height="50" fill="#0f4c81" />
          <rect x="4" y="56" width="36" height="50" fill="#0f4c81" />
          <rect x="44" y="56" width="37" height="50" fill="#0f4c81" />
          {/* Grid lines (Silver / White cells partitions) */}
          <line x1="22" y1="4" x2="22" y2="106" stroke="#e0e0e0" strokeWidth="0.8" />
          <line x1="62" y1="4" x2="62" y2="106" stroke="#e0e0e0" strokeWidth="0.8" />
          <line x1="4" y1="21" x2="81" y2="21" stroke="#e0e0e0" strokeWidth="0.8" />
          <line x1="4" y1="38" x2="81" y2="38" stroke="#e0e0e0" strokeWidth="0.8" />
          <line x1="4" y1="72" x2="81" y2="72" stroke="#e0e0e0" strokeWidth="0.8" />
          <line x1="4" y1="89" x2="81" y2="89" stroke="#e0e0e0" strokeWidth="0.8" />
        </g>

        {/* --- CCTV Camera Group (Left side) --- */}
        <g transform="translate(68, 160)">
          {/* Mount Wall Bracket */}
          <path d="M 0 45 L 20 45 L 30 15 L 20 15 L 0 15 Z" fill="#b0bec5" stroke="#37474f" strokeWidth="2" />
          <rect x="-4" y="10" width="8" height="40" rx="2" fill="#78909c" />
          {/* Joint */}
          <circle cx="28" cy="15" r="7" fill="#546e7a" />
          {/* Camera Housing Body */}
          <g transform="rotate(-5, 28, 15)">
            <rect x="25" y="0" width="75" height="35" rx="5" fill="#f5f5f5" stroke="#37474f" strokeWidth="2.5" />
            <rect x="23" y="-3" width="79" height="6" rx="1.5" fill="#e0e0e0" stroke="#37474f" strokeWidth="1.5" />
            {/* Dark lens cap */}
            <path d="M 100 2 L 108 5 L 108 30 L 100 33 Z" fill="#1a1a1a" stroke="#37474f" strokeWidth="2" />
            {/* Glass Lens element */}
            <circle cx="104" cy="17" r="8" fill="#00e5ff" opacity="0.8" />
            {/* Infrared LEDs surrounding lens */}
            <circle cx="104" cy="9" r="1.5" fill="#ff1744" />
            <circle cx="104" cy="25" r="1.5" fill="#ff1744" />
            {/* Branding details */}
            <text x="35" y="22" fill="#cfd8dc" fontSize="9" fontWeight="bold" fontFamily="monospace">CCTV MAX</text>
          </g>
        </g>

        {/* --- Iconic Metallic Golden "ST" (Centerpiece) --- */}
        <g transform="translate(135, 80)">
          {/* Drop Shadow representation with gold glow offset */}
          <path d="M 30 75 C 20 40, 95 10, 85 55 C 80 80, 15 80, 10 120 C 5 150, 95 140, 85 105" stroke="#4a3b00" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.3"/>
          
          {/* The Golden S */}
          <path 
            d="M 30 75 C 20 40, 95 10, 85 55 C 80 80, 15 80, 10 120 C 5 150, 95 140, 85 105" 
            stroke="url(#goldGradient)" 
            strokeWidth="16" 
            strokeLinecap="round" 
            fill="none"
          />
          
          {/* The Golden T with swooping arrow cutting across */}
          {/* T-bar cross */}
          <path d="M 60 45 L 145 45" stroke="url(#goldGradient)" strokeWidth="16" strokeLinecap="round" fill="none" />
          {/* T stem extending down */}
          <line x1="102" y1="45" x2="102" y2="125" stroke="url(#goldGradient)" strokeWidth="16" strokeLinecap="round" />
          
          {/* Swooping Gold Arrow cutting around ST from S to T */}
          <path d="M 5 60 C 50 -10, 150 15, 145 65" stroke="url(#goldGradient)" strokeWidth="7" fill="none" strokeLinecap="round" />
          {/* Arrow Head */}
          <polygon points="145,63 152,50 138,53" fill="#FDB813" stroke="#e5a900" strokeWidth="1" />
        </g>

        {/* --- Brand Name Typography (Outer Lower Half) --- */}
        <text 
          x="200" 
          y="312" 
          fill="#ffffff" 
          fontSize="22" 
          fontWeight="800" 
          fontFamily="'Poppins', sans-serif" 
          textAnchor="middle" 
          letterSpacing="0.5"
        >
          Seaflows Technologies
        </text>

        {/* --- Capitalized Corporate Motto Ribbon --- */}
        <line x1="60" y1="330" x2="340" y2="330" stroke="#FDB813" strokeWidth="2" strokeLinecap="round" />
        
        <text 
          x="200" 
          y="350" 
          fill="#FDB813" 
          fontSize="11" 
          fontWeight="700" 
          fontFamily="'Poppins', sans-serif" 
          textAnchor="middle" 
          letterSpacing="2.5"
        >
          EXCELLENT CONNECTIONS
        </text>

        <text 
          x="200" 
          y="370" 
          fill="#ffffff" 
          fontSize="11" 
          fontWeight="600" 
          fontFamily="'Poppins', sans-serif" 
          textAnchor="middle" 
          letterSpacing="3"
        >
          BETTER VALUE
        </text>

        {/* Define Metallic Gold Gradients and Filters */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF099" />
            <stop offset="30%" stopColor="#FDB813" />
            <stop offset="50%" stopColor="#9C7000" />
            <stop offset="70%" stopColor="#FDB813" />
            <stop offset="100%" stopColor="#FFF099" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div id="company-text" className="flex flex-col text-left">
          <span className="font-heading font-extrabold text-lg text-white leading-tight tracking-tight">
            Seaflows <span className="text-solar-gold text-[#FDB813]">Tech</span>
          </span>
          <span className="font-sans text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            Excellent Connections
          </span>
        </div>
      )}
    </div>
  );
}
