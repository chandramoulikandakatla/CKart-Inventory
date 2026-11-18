import React from 'react';
import { Utensils, Coffee, Droplets, Box, BookOpen, Sparkles } from 'lucide-react';

interface ProductArtworkProps {
  category: string;
  id: string;
  className?: string;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  category,
  id,
  className = "w-full h-36"
}) => {
  const configs: Record<string, { grad: string; border: string; accent: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
    'Food and Snacks': {
      grad: 'from-orange-100/90 via-amber-50/80 to-white',
      border: 'border-orange-300/70',
      accent: '#EA580C',
      icon: Utensils
    },
    'Beverages': {
      grad: 'from-cyan-100/85 via-sky-50/80 to-white',
      border: 'border-cyan-300/70',
      accent: '#0284C7',
      icon: Coffee
    },
    'Personal Care': {
      grad: 'from-sky-100/80 via-cyan-50/75 to-white',
      border: 'border-sky-300/70',
      accent: '#0891B2',
      icon: Droplets
    },
    'Daily Essentials': {
      grad: 'from-stone-200/80 via-orange-50/60 to-white',
      border: 'border-stone-300/80',
      accent: '#6F4E37',
      icon: Box
    },
    'Academic Supplies': {
      grad: 'from-blue-100/80 via-cyan-50/70 to-white',
      border: 'border-blue-300/70',
      accent: '#2563EB',
      icon: BookOpen
    },
    'Other Services': {
      grad: 'from-amber-100/85 via-orange-50/70 to-white',
      border: 'border-amber-300/70',
      accent: '#D97706',
      icon: Sparkles
    }
  };
  const cfg = configs[category] || configs['Daily Essentials'];
  const IconComp = cfg.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cfg.grad} border ${cfg.border} shadow-inner flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02] ${className}`}>
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
