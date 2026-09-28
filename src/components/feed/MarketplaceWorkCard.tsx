import React, { useState, useMemo, useRef } from 'react';
import { Work, Reference, User } from '../../types/domain';
import { Heart, ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export interface MarketplaceWorkCardProps {
  work: Work;
  reference?: Reference;
  author: User;
  isLiked?: boolean;
  onToggleLike?: (workId: string) => void;
  onWant: (work: Work, reference: Reference, author: User) => void;
  onOpenUser: (userId: string, selectedWorkId?: string) => void;
}

interface SlideItem {
  type: 'reference' | 'before' | 'after';
  label: string;
  url: string;
  alt: string;
}

export const MarketplaceWorkCard: React.FC<MarketplaceWorkCardProps> = ({
  work,
  reference,
  author,
  isLiked: initialLiked = false,
  onToggleLike,
  onWant,
  onOpenUser,
}) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Strictly construct slides in order: REFERENCE → BEFORE → AFTER
  const slides: SlideItem[] = useMemo(() => {
    const list: SlideItem[] = [];

    // 1. REFERENCE
    const refUrl =
      work.reference_image ||
      reference?.media?.[0]?.url ||
      reference?.media?.[0]?.thumbnail_url;
    if (refUrl) {
      list.push({
        type: 'reference',
        label: 'Референс',
        url: refUrl,
        alt: `Референс: ${work.reference_title || work.title}`,
      });
    }

    // 2. BEFORE
    const beforeUrl = work.before_image;
    if (beforeUrl) {
      list.push({
        type: 'before',
        label: 'До',
        url: beforeUrl,
        alt: `До: ${work.title}`,
      });
    }

    // 3. AFTER
    const afterUrl =
      work.after_image ||
      work.media?.[0]?.url ||
      work.media?.[0]?.thumbnail_url;
    if (afterUrl) {
      list.push({
        type: 'after',
        label: 'После',
        url: afterUrl,
        alt: `Результат: ${work.title}`,
      });
    }

    // If somehow empty, fallback to first media item if present
    if (list.length === 0 && work.media?.[0]?.url) {
      list.push({
        type: 'after',
        label: 'После',
        url: work.media[0].url,
        alt: work.title,
      });
    }

    return list;
  }, [work, reference]);

  const activeSlide = slides[activeSlideIndex] || slides[0];

  const handleNextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (slides.length <= 1) return;
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (slides.length <= 1) return;
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch gestures for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35; // px

    if (distance > minSwipeDistance) {
      // Swiped left -> next
      e.stopPropagation();
      handleNextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      e.stopPropagation();
      handlePrevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Like click
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => !prev);
    if (onToggleLike) {
      onToggleLike(work.id);
    }
  };

  // Want / Cart click
  const handleWantClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const effectiveRef: Reference = reference || {
      id: work.reference_id || `ref_${work.id}`,
      author_id: work.author_id,
      author_name: work.author_name || 'Мастер',
      source_type: 'curated',
      title: work.reference_title || work.title,
      category: work.category,
      tags: work.specializations || [],
      media: [
        {
          id: `m_${work.id}`,
          owner_id: work.author_id,
          type: 'image',
          url: activeSlide?.url || '',
          thumbnail_url: activeSlide?.url || '',
          width: 800,
          height: 800,
          mime_type: 'image/jpeg',
        },
      ],
      created_at: work.created_at,
    };
    onWant(work, effectiveRef, author);
  };

  // Card click -> directly opens UserProfile with selected work!
  const handleCardClick = () => {
    onOpenUser(work.author_id, work.id);
  };

  const isPortfolio = Boolean(work.is_portfolio_model || work.price === 0);
  const ratingValue = work.rating !== undefined ? work.rating.toFixed(1) : '4.9';
  const distanceText = work.distance_km ? `${work.distance_km} км` : (author?.professional?.city || 'Москва');

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#EDE8F3] hover:border-[#6B5B95]/40 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-sm"
    >
      {/* 1. VISUAL SLIDE DISPLAY */}
      <div
        className="relative w-full aspect-[4/5] bg-[#F5F2F9] overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeSlide?.url ? (
          <img
            src={activeSlide.url}
            alt={activeSlide.alt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#FAF8FD] to-[#EDE8F3]">
            <span className="text-xs font-semibold text-[#6B5B95]">{work.title}</span>
            <span className="text-[10px] text-[#7E748E] mt-1">Результат работы</span>
          </div>
        )}

        {/* Slide Type Tag (Top-Left) */}
        {activeSlide && (
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide backdrop-blur-md shadow-2xs ${
                activeSlide.type === 'reference'
                  ? 'bg-[#2D2738]/80 text-[#FAF8F5]'
                  : activeSlide.type === 'before'
                  ? 'bg-[#554D63]/80 text-[#FAF8F5]'
                  : 'bg-[#2E7D32]/85 text-white'
              }`}
            >
              {activeSlide.label}
            </span>
          </div>
        )}

        {/* Action: Like / Save (Top-Right) */}
        <button
          type="button"
          onClick={handleLikeClick}
          aria-label={isLiked ? 'Удалить из сохраненного' : 'Сохранить работу'}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur-md flex items-center justify-center shadow-xs text-[#2D2738] hover:bg-white active:scale-90 transition-all cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-[#E07A5F] text-[#E07A5F]' : 'text-[#554D63]'
            }`}
          />
        </button>

        {/* Slide Tap Regions (Desktop Left/Right Hover Arrows) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Предыдущее фото"
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white/80 backdrop-blur-xs hidden group-hover:flex items-center justify-center shadow-2xs text-[#2D2738] hover:bg-white active:scale-90 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Следующее фото"
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white/80 backdrop-blur-xs hidden group-hover:flex items-center justify-center shadow-2xs text-[#2D2738] hover:bg-white active:scale-90 transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Slide Indicators (Bottom Dashes) */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-center gap-1 pointer-events-none">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-200 ${
                  idx === activeSlideIndex
                    ? 'w-4 bg-white shadow-xs'
                    : 'w-1.5 bg-white/50 backdrop-blur-xs'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. CARD METADATA (Strictly: Price, Title, Rating, Quick Action) */}
      <div className="p-2.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Price Row + Quick Action */}
          <div className="flex items-center justify-between gap-1.5">
            {isPortfolio ? (
              <div className="flex items-baseline gap-1 truncate">
                <span className="font-extrabold text-sm sm:text-base text-[#E07A5F] tabular-nums">
                  0 ₽
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#6B5B95] truncate">
                  · Для портфолио
                </span>
              </div>
            ) : (
              <div className="font-extrabold text-sm sm:text-base text-[#2D2738] tabular-nums tracking-tight">
                {work.price.toLocaleString('ru-RU')} ₽
              </div>
            )}

            {/* Quick «Хочу» / Booking Button */}
            <button
              type="button"
              onClick={handleWantClick}
              title="Записаться / Хочу"
              className="w-7 h-7 rounded-xl bg-[#FAF8FD] hover:bg-[#6B5B95] text-[#6B5B95] hover:text-white border border-[#EDE8F3] hover:border-transparent flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs active:scale-90"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Service Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-[#2D2738] group-hover:text-[#6B5B95] transition-colors truncate mt-1">
            {work.title}
          </h3>
        </div>

        {/* Rating and Distance */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#7E748E] mt-1.5 pt-1.5 border-t border-[#F5F2F9]">
          <span className="font-bold text-[#2D2738] flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{ratingValue}</span>
          </span>
          <span className="text-[#C2BACD]" aria-hidden="true">
            ·
          </span>
          <span className="truncate">{distanceText}</span>
        </div>
      </div>
    </article>
  );
};
