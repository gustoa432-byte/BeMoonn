import React from 'react';

interface BeMoonLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const BeMoonLogo: React.FC<BeMoonLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  onClick,
}) => {
  const sizeClasses = {
    sm: { symbol: 'h-4', text: 'text-xs tracking-[0.2em]' },
    md: { symbol: 'h-5', text: 'text-sm tracking-[0.24em]' },
    lg: { symbol: 'h-7', text: 'text-lg tracking-[0.28em]' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none text-black cursor-pointer group ${className}`}
      title="BE&MOON"
    >
      {/* 
        Exact geometric B&W symbol from brand identity:
        1. Crescent moon on left (concave facing right)
        2. Full solid circular moon on right
      */}
      <svg
        viewBox="0 0 74 36"
        className={`${currentSize.symbol} w-auto text-black shrink-0 transition-transform duration-200 group-hover:scale-105`}
        fill="currentColor"
        aria-hidden="true"
      >
        <defs>
          <mask id="bemoon-crescent-mask">
            <rect width="100" height="100" fill="white" />
            {/* Cut circle offset to the right creates the sleek crescent */}
            <circle cx="28" cy="18" r="14.5" fill="black" />
          </mask>
        </defs>

        {/* Crescent Moon */}
        <circle
          cx="17"
          cy="18"
          r="15"
          mask="url(#bemoon-crescent-mask)"
          fill="#111111"
        />

        {/* Full Moon */}
        <circle cx="53" cy="18" r="15" fill="#111111" />
      </svg>

      {/* Monospaced / Geometric Sans uppercase logotype BEMOON */}
      {showText && (
        <span
          className={`font-sans font-black ${currentSize.text} text-[#111111] uppercase leading-none`}
        >
          BEMOON
        </span>
      )}
    </div>
  );
};
