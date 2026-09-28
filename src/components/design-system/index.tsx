import React from 'react';
import { LucideIcon, Heart, Sparkles, X } from 'lucide-react';

export * from './Toast';

// --- BUTTON ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'want';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] select-none whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-2xl';

  const sizeStyles = {
    sm: 'h-9 px-3.5 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-13 px-6 text-base gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#2D2738] text-[#FAF8F5] hover:bg-[#3D354B] shadow-xs active:bg-[#1C1824]',
    secondary:
      'bg-[#F3EEF8] text-[#2D2738] hover:bg-[#EAE2F2] active:bg-[#DFD4E9]',
    outline:
      'bg-transparent border border-[#EDE8F3] text-[#2D2738] hover:bg-[#F9F7FC]',
    ghost:
      'bg-transparent text-[#7E748E] hover:text-[#2D2738] hover:bg-[#F3EEF8]/60',
    want: 'bg-[#6B5B95] text-white hover:bg-[#58355E] shadow-md shadow-[#6B5B95]/20 active:bg-[#4E2B54] font-semibold tracking-wide moon-glow-btn',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

// --- ICON BUTTON ---
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: 'ghost' | 'secondary' | 'surface' | 'active';
  size?: 'sm' | 'md' | 'lg';
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 min-w-[32px] min-h-[32px]',
    md: 'w-11 h-11 min-w-[44px] min-h-[44px]', // Accessible touch target
    lg: 'w-13 h-13 min-w-[52px] min-h-[52px]',
  };

  const variantStyles = {
    ghost: 'text-[#7E748E] hover:text-[#2D2738] hover:bg-[#F3EEF8] active:bg-[#EAE2F2]',
    secondary: 'bg-[#F3EEF8] text-[#2D2738] hover:bg-[#EAE2F2]',
    surface: 'bg-white/90 text-[#2D2738] shadow-sm backdrop-blur-md hover:bg-white',
    active: 'bg-[#6B5B95]/10 text-[#6B5B95]',
  };

  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-95 cursor-pointer ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <Icon className="w-5 h-5 shrink-0" />
    </button>
  );
};

// --- AVATAR ---
export const Avatar: React.FC<{
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ src, name, size = 'md', className = '' }) => {
  const [error, setError] = React.useState(false);

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-semibold',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-[#E7DFD5] text-[#57534E] shrink-0 border border-[#FAF8F5] shadow-xs select-none ${sizeStyles[size]} ${className}`}
    >
      {src && !error ? (
        <img
          src={src}
          alt={name}
          onError={() => setError(true)}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials || 'BM'}</span>
      )}
    </div>
  );
};

// Fast global image memory cache to avoid blank squares or flashing on re-renders
const globalLoadedImages = new Set<string>();

// Preload & pre-decode helper for high-speed feeds
export function preloadImage(url: string): Promise<void> {
  if (!url || globalLoadedImages.has(url)) return Promise.resolve();
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    const finish = () => {
      globalLoadedImages.add(url);
      resolve();
    };
    if (img.complete) {
      finish();
    } else {
      img.onload = finish;
      img.onerror = finish;
    }
    if ('decode' in img) {
      img.decode().then(finish).catch(finish);
    }
  });
}

// --- MEDIA IMAGE (With Zero-Broken-Image Policy & Instant Cache Memory) ---
export const MediaImage: React.FC<{
  src: string;
  alt: string;
  aspectRatio?: '4/3' | '1/1' | '16/9' | '3/4' | 'auto';
  className?: string;
  fallbackColor?: string;
  priority?: boolean;
  onClick?: () => void;
}> = ({ src, alt, aspectRatio = '4/3', className = '', fallbackColor, priority = false, onClick }) => {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(() => globalLoadedImages.has(src));
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (globalLoadedImages.has(src)) {
      setIsLoaded(true);
      return;
    }
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      globalLoadedImages.add(src);
      setIsLoaded(true);
    }
  }, [src]);

  const aspectStyles = {
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '16/9': 'aspect-video',
    '3/4': 'aspect-[3/4]',
    auto: '',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-[#EFEAE2] ${aspectStyles[aspectRatio]} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={fallbackColor ? { backgroundColor: fallbackColor } : undefined}
    >
      {/* Shimmer placeholder while image is decoding */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#EDE7DE] via-[#F5EFE6] to-[#EDE7DE] animate-pulse" />
      )}

      {!hasError ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => {
            globalLoadedImages.add(src);
            setIsLoaded(true);
          }}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#F5EFE6] to-[#E7DFD5] text-[#78716C]">
          <Sparkles className="w-6 h-6 mb-2 opacity-60 text-[#D9532F]" />
          <span className="text-xs font-medium line-clamp-2 max-w-[80%]">{alt}</span>
        </div>
      )}
    </div>
  );
};

// --- WANT BUTTON («ХОЧУ») ---
// The core client action in BE&MOON (Section 16, 17)
export const WantButton: React.FC<{
  onClick: () => void;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  disabled?: boolean;
  className?: string;
}> = ({
  onClick,
  fullWidth = false,
  size = 'md',
  label = 'ХОЧУ',
  disabled = false,
  className = '',
}) => {
  return (
    <Button
      variant="want"
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      className={`tracking-wider ${className}`}
    >
      <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
      {label}
    </Button>
  );
};

// --- FOLLOW BUTTON ---
export const FollowButton: React.FC<{
  isFollowing: boolean;
  onToggle: () => void;
  followersCount?: number;
  className?: string;
}> = ({ isFollowing, onToggle, followersCount, className = '' }) => {
  return (
    <button
      onClick={onToggle}
      className={`h-9 px-4 text-xs font-semibold rounded-full transition-all duration-150 active:scale-95 cursor-pointer whitespace-nowrap ${
        isFollowing
          ? 'bg-[#F3EEF8] text-[#554D63] hover:bg-[#EAE2F2] border border-[#EDE8F3]'
          : 'bg-[#6B5B95] text-white hover:bg-[#58355E] shadow-xs'
      } ${className}`}
    >
      {isFollowing ? 'Вы подписаны' : 'Подписаться'}
      {followersCount !== undefined && (
        <span className="ml-1.5 opacity-80 tabular-nums">· {followersCount}</span>
      )}
    </button>
  );
};

// --- BOTTOM SHEET ---
export const BottomSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, subtitle, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2D2738]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      {/* Sheet panel */}
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 border-t border-x border-[#EDE8F3]">
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-[#D8D0E3] rounded-full" />
        </div>
        {/* Header */}
        {(title || subtitle) && (
          <div className="px-6 pt-2 pb-4 flex items-start justify-between border-b border-[#EDE8F3]">
            <div>
              {title && <h3 className="text-lg font-bold text-[#2D2738]">{title}</h3>}
              {subtitle && <p className="text-xs text-[#7E748E] mt-0.5">{subtitle}</p>}
            </div>
            <IconButton icon={X} label="Закрыть" size="sm" onClick={onClose} />
          </div>
        )}
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
};

// --- MODAL ---
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#2D2738]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} bg-[#FAF8F5] rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 border border-[#EDE8F3]`}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#EDE8F3]">
          <h3 className="text-base font-bold text-[#2D2738] truncate">{title}</h3>
          <IconButton icon={X} label="Закрыть" size="sm" onClick={onClose} />
        </div>
        <div className="p-6 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
};

// --- EMPTY STATE (Section 41) ---
export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}> = ({ title, description, actionText, onAction, icon: Icon = Sparkles }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-white/70 rounded-3xl border border-[#EDE8F3] shadow-xs">
      <div className="w-14 h-14 rounded-full bg-[#F3EEF8] flex items-center justify-center text-[#6B5B95] mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-[#2D2738] mb-1">{title}</h4>
      <p className="text-xs text-[#7E748E] max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
