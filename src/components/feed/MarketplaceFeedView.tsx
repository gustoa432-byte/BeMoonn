import React, { useState, useEffect, useCallback } from 'react';
import { Work, Reference, User } from '../../types/domain';
import { api } from '../../services/apiClient';
import { MarketplaceWorkCard } from './MarketplaceWorkCard';
import { Sparkles, RefreshCw, Flame } from 'lucide-react';

const CATEGORIES = [
  'Все',
  'Стрижки & Барбер',
  'Ногти & Маникюр',
  'Брови & Ресницы',
  'Макияж',
  'Уход',
];

interface MarketplaceItem {
  work: Work;
  reference?: Reference;
  author: User;
}

// In-memory cache for instant 0ms tab retention
const globalMarketplaceCache: Record<string, MarketplaceItem[]> = {};

interface MarketplaceFeedViewProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onWant: (work: Work, reference: Reference, author: User) => void;
  onOpenUser: (userId: string, selectedWorkId?: string) => void;
  currentUser: User | null;
}

export const MarketplaceFeedView: React.FC<MarketplaceFeedViewProps> = ({
  selectedCategory,
  onSelectCategory,
  onWant,
  onOpenUser,
  currentUser,
}) => {
  const [onlyPortfolio, setOnlyPortfolio] = useState(false);
  const [items, setItems] = useState<MarketplaceItem[]>(() => {
    return globalMarketplaceCache[`${selectedCategory}_all`] || [];
  });
  const [loading, setLoading] = useState(() => {
    return !globalMarketplaceCache[`${selectedCategory}_all`];
  });
  const [savedWorkIds, setSavedWorkIds] = useState<Set<string>>(new Set());

  const loadWorks = useCallback(async () => {
    const key = `${selectedCategory}_${onlyPortfolio ? 'portfolio' : 'all'}`;
    try {
      if (!globalMarketplaceCache[key]) {
        setLoading(true);
      }
      const res = await api.getMarketplaceWorks(
        selectedCategory === 'Все' ? undefined : selectedCategory,
        onlyPortfolio
      );
      const loadedItems = res.items || [];
      setItems(loadedItems);
      globalMarketplaceCache[key] = loadedItems;
    } catch (err) {
      console.error('Error loading marketplace works:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, onlyPortfolio]);

  useEffect(() => {
    loadWorks();
  }, [loadWorks]);

  const handleToggleLike = (workId: string) => {
    setSavedWorkIds((prev) => {
      const next = new Set(prev);
      if (next.has(workId)) {
        next.delete(workId);
      } else {
        next.add(workId);
      }
      return next;
    });
  };

  return (
    <div className="pb-24">
      {/* 1. STICKY CATEGORIES & FILTER RAIL */}
      <div className="sticky top-[53px] z-20 bg-[#FAF8F5]/90 backdrop-blur-md px-1 py-2 mb-3 border-b border-[#EDE8F3]">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat && !onlyPortfolio;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setOnlyPortfolio(false);
                  onSelectCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6B5B95] text-white shadow-xs'
                    : 'bg-white text-[#554D63] border border-[#EDE8F3] hover:bg-[#FAF8FD]'
                }`}
              >
                {cat}
              </button>
            );
          })}

          {/* Quick Filter: Для портфолио */}
          <button
            type="button"
            onClick={() => setOnlyPortfolio((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
              onlyPortfolio
                ? 'bg-[#E07A5F] text-white shadow-xs'
                : 'bg-white text-[#E07A5F] border border-[#E07A5F]/40 hover:bg-[#FAF8FD]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Для портфолио (0 ₽)</span>
          </button>
        </div>
      </div>

      {/* 2. MARKETPLACE 2-COLUMN GRID (Wildberries / Ozon Style) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#7E748E]">
          <div className="w-9 h-9 border-3 border-[#6B5B95] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">Загрузка витрины работ...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {items.map(({ work, reference, author }) => (
            <MarketplaceWorkCard
              key={work.id}
              work={work}
              reference={reference}
              author={author}
              isLiked={savedWorkIds.has(work.id)}
              onToggleLike={handleToggleLike}
              onWant={onWant}
              onOpenUser={onOpenUser}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#EDE8F3] shadow-xs">
          <Sparkles className="w-8 h-8 mx-auto text-[#6B5B95] mb-2" />
          <h3 className="font-bold text-sm text-[#2D2738]">
            Работы в этой категории пока не найдены
          </h3>
          <p className="text-xs text-[#7E748E] mt-1 max-w-xs mx-auto">
            {onlyPortfolio
              ? 'Сейчас нет открытых предложений «Для портфолио». Выберите другую категорию.'
              : 'Попробуйте сбросить фильтры или посмотреть все категории.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setOnlyPortfolio(false);
              onSelectCategory('Все');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#6B5B95] text-white text-xs font-bold hover:bg-[#584880] transition-colors cursor-pointer"
          >
            Показать все работы
          </button>
        </div>
      )}
    </div>
  );
};
