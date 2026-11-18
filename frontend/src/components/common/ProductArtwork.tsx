import React, { useState } from 'react';
import {
  Utensils,
  Cookie,
  Flame,
  Coffee,
  Heart,
  Droplets,
  Sparkles,
  Apple,
  Shirt,
  ShieldCheck,
  Box,
} from 'lucide-react';

interface ProductArtworkProps {
  category: string;
  id: string;
  imageUrl?: string;
  name?: string;
  className?: string;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  category,
  id,
  imageUrl,
  name,
  className = 'w-full h-36',
}) => {
  const [imgError, setImgError] = useState(false);

  const configs: Record<
    string,
    { grad: string; border: string; accent: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }
  > = {
    Chips: {
      grad: 'from-amber-100/90 via-orange-50/80 to-white',
      border: 'border-orange-300/70',
      accent: '#EA580C',
      icon: Utensils,
    },
    'Rusks & Wafers': {
      grad: 'from-amber-100/80 via-yellow-50/70 to-white',
      border: 'border-amber-300/70',
      accent: '#D97706',
      icon: Cookie,
    },
    Nachos: {
      grad: 'from-orange-100/90 via-red-50/80 to-white',
      border: 'border-red-300/70',
      accent: '#DC2626',
      icon: Flame,
    },
    'Bhujia & Mixtures': {
      grad: 'from-yellow-100/90 via-amber-50/80 to-white',
      border: 'border-yellow-400/70',
      accent: '#B45309',
      icon: Utensils,
    },
    'Breakfast Cereals': {
      grad: 'from-orange-100/80 via-amber-50/75 to-white',
      border: 'border-orange-300/70',
      accent: '#C2410C',
      icon: Coffee,
    },
    Chocolate: {
      grad: 'from-stone-200/90 via-amber-100/70 to-white',
      border: 'border-stone-400/70',
      accent: '#57331D',
      icon: Heart,
    },
    Biscuits: {
      grad: 'from-amber-100/85 via-orange-50/70 to-white',
      border: 'border-amber-300/70',
      accent: '#B45309',
      icon: Cookie,
    },
    'Bathing Soaps': {
      grad: 'from-sky-100/85 via-cyan-50/80 to-white',
      border: 'border-sky-300/70',
      accent: '#0284C7',
      icon: Droplets,
    },
    'Hair Oil & Serum': {
      grad: 'from-emerald-100/80 via-teal-50/70 to-white',
      border: 'border-emerald-300/70',
      accent: '#059669',
      icon: Sparkles,
    },
    'Shampoo & Conditioner': {
      grad: 'from-teal-100/85 via-cyan-50/75 to-white',
      border: 'border-teal-300/70',
      accent: '#0D9488',
      icon: Droplets,
    },
    'Feminine Care': {
      grad: 'from-rose-100/85 via-pink-50/75 to-white',
      border: 'border-rose-300/70',
      accent: '#E11D48',
      icon: Heart,
    },
    Fruits: {
      grad: 'from-green-100/85 via-emerald-50/80 to-white',
      border: 'border-green-300/70',
      accent: '#16A34A',
      icon: Apple,
    },
    'Dry Fruits': {
      grad: 'from-amber-100/90 via-stone-100/80 to-white',
      border: 'border-amber-400/70',
      accent: '#78350F',
      icon: Box,
    },
    'Laundry Care': {
      grad: 'from-blue-100/85 via-sky-50/75 to-white',
      border: 'border-blue-300/70',
      accent: '#2563EB',
      icon: Shirt,
    },
    Disinfectants: {
      grad: 'from-cyan-100/90 via-emerald-50/75 to-white',
      border: 'border-cyan-400/70',
      accent: '#0891B2',
      icon: ShieldCheck,
    },
  };

  const cfg = configs[category] || {
    grad: 'from-stone-200/80 via-orange-50/60 to-white',
    border: 'border-stone-300/80',
    accent: '#6F4E37',
    icon: Box,
  };
  const IconComp = cfg.icon;

  if (imageUrl && !imgError) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#F5F0EB] border border-stone-200/80 shadow-inner flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02] ${className}`}
      >
        <img
          src={imageUrl}
          alt={name || id}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
        <span className="absolute bottom-2 left-2 text-[9px] font-mono font-bold uppercase tracking-widest text-white bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-full shadow-sm">
          {id}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.grad} border ${cfg.border} shadow-inner flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02] ${className}`}
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-30" style={{ background: cfg.accent }} />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-25" style={{ background: cfg.accent }} />
      <div className="relative z-10 flex flex-col items-center">
        <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_20px_-4px_rgba(44,26,18,0.12)]">
          <IconComp className="w-8 h-8" style={{ color: cfg.accent }} />
        </div>
        <span className="mt-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#4A2E1B] bg-white/90 border border-stone-200/80 px-2.5 py-0.5 rounded-full shadow-sm">
          {id}
        </span>
      </div>
    </div>
  );
};

export default ProductArtwork;
