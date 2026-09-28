import React, { useState, useEffect } from 'react';
import { User } from '../../types/domain';
import { Search, WifiOff } from 'lucide-react';
import { BeMoonLogo } from '../common/BeMoonLogo';
import { offlineStorage, StorageStatus } from '../../services/offlineStorage';

interface TopBarProps {
  currentUser?: User | null;
  onSwitchRole?: () => void;
  onOpenAnalytics?: () => void;
  onOpenTests?: () => void;
  onOpenSearch: () => void;
  onOpenSettings?: () => void;
  onLogoClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onOpenSearch,
  onLogoClick,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      offlineStorage.getStorageStatus().then(setStorageStatus);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#EDE8F3] px-3 sm:px-4 py-2.5 shadow-2xs">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
        {/* Left: Brand with B&W BE&MOON Logo */}
        <div className="flex items-center shrink-0">
          <BeMoonLogo size="sm" onClick={onLogoClick} />
        </div>

        {/* Small Search Window with Magnifying Glass Inside */}
        <div className="flex-1 flex justify-end items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 h-8 px-3 bg-[#F6F3F9] hover:bg-[#EFEAF4] border border-[#EDE8F3] rounded-full cursor-pointer transition-all group shadow-2xs w-full max-w-[200px]"
            title="Быстрый поиск: мастера, работы, референсы"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-3xs text-[#6B5B95] group-hover:scale-110 transition-transform shrink-0">
              <Search className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span className="text-xs text-[#7E748E] font-medium truncate">Поиск</span>
          </button>

          {!isOnline && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCE8E6] text-[#C62828] text-[10px] font-bold shrink-0">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

