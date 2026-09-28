import React from 'react';
import { Home, Plus, Bell, User, GraduationCap } from 'lucide-react';

export type NavTab = 'home' | 'schools' | 'create' | 'activity' | 'profile' | 'search';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadCount = 0,
}) => {
  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 pb-safe pointer-events-none select-none flex justify-center px-3">
      {/* Floating Haute-Couture Luxury Navigation Dock */}
      <div className="pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-[24px] bg-[#1E1828]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_45px_rgba(12,8,20,0.5),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-[#D4AF37]/20 min-w-[340px] max-w-[420px] w-full">
        {/* 1. Home / Feed */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-[18px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 ${
            activeTab === 'home'
              ? 'bg-gradient-to-b from-[#6B5B95] to-[#4F4172] text-[#FAF8F5] shadow-[0_4px_16px_rgba(107,91,149,0.45)] border border-[#8C7BB8]/40'
              : 'text-[#A89CB8] hover:text-[#FAF8F5] hover:bg-white/[0.05]'
          }`}
          aria-label="Лента"
        >
          <Home className={`w-4 h-4 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5 leading-none">
            Лента
          </span>
          {activeTab === 'home' && (
            <span className="w-1 h-1 rounded-full bg-[#E5C158] mt-0.5" />
          )}
        </button>

        {/* 2. Schools & Academies */}
        <button
          onClick={() => onChangeTab('schools')}
          className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-[18px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 ${
            activeTab === 'schools'
              ? 'bg-gradient-to-b from-[#6B5B95] to-[#4F4172] text-[#FAF8F5] shadow-[0_4px_16px_rgba(107,91,149,0.45)] border border-[#8C7BB8]/40'
              : 'text-[#A89CB8] hover:text-[#FAF8F5] hover:bg-white/[0.05]'
          }`}
          aria-label="Школы"
        >
          <GraduationCap
            className={`w-4 h-4 ${activeTab === 'schools' ? 'stroke-[2.5]' : 'stroke-2'}`}
          />
          <span className="text-[10px] font-medium tracking-tight mt-0.5 leading-none">
            Школы
          </span>
          {activeTab === 'schools' && (
            <span className="w-1 h-1 rounded-full bg-[#E5C158] mt-0.5" />
          )}
        </button>

        {/* 3. Create (+) - Bespoke Haute-Joaillerie Jewel Center Button */}
        <button
          onClick={() => onChangeTab('create')}
          className="relative px-1 group cursor-pointer active:scale-95 transition-transform"
          aria-label="Опубликовать работу или референс"
          title="Опубликовать"
        >
          <div className="w-12 h-12 rounded-[20px] p-[1.5px] bg-gradient-to-b from-[#F2D785] via-[#D4AF37] to-[#9E7B1E] shadow-[0_6px_20px_rgba(212,175,55,0.4)]">
            <div className="w-full h-full rounded-[18px] bg-gradient-to-br from-[#2D243B] via-[#1E1729] to-[#130E1C] flex items-center justify-center text-[#E5C158] group-hover:text-white transition-colors border border-white/10">
              <Plus className="w-5 h-5 stroke-[2.8]" />
            </div>
          </div>
        </button>

        {/* 4. Activity */}
        <button
          onClick={() => onChangeTab('activity')}
          className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-[18px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 ${
            activeTab === 'activity'
              ? 'bg-gradient-to-b from-[#6B5B95] to-[#4F4172] text-[#FAF8F5] shadow-[0_4px_16px_rgba(107,91,149,0.45)] border border-[#8C7BB8]/40'
              : 'text-[#A89CB8] hover:text-[#FAF8F5] hover:bg-white/[0.05]'
          }`}
          aria-label="Активность"
        >
          <div className="relative">
            <Bell
              className={`w-4 h-4 ${activeTab === 'activity' ? 'stroke-[2.5]' : 'stroke-2'}`}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E07A5F] ring-1 ring-[#1E1828]" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-0.5 leading-none">
            События
          </span>
          {activeTab === 'activity' && (
            <span className="w-1 h-1 rounded-full bg-[#E5C158] mt-0.5" />
          )}
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-[18px] flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none active:scale-95 ${
            activeTab === 'profile'
              ? 'bg-gradient-to-b from-[#6B5B95] to-[#4F4172] text-[#FAF8F5] shadow-[0_4px_16px_rgba(107,91,149,0.45)] border border-[#8C7BB8]/40'
              : 'text-[#A89CB8] hover:text-[#FAF8F5] hover:bg-white/[0.05]'
          }`}
          aria-label="Профиль"
        >
          <User className={`w-4 h-4 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-tight mt-0.5 leading-none">
            Профиль
          </span>
          {activeTab === 'profile' && (
            <span className="w-1 h-1 rounded-full bg-[#E5C158] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};

