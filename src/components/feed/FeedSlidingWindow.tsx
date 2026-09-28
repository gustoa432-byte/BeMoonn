import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FeedItemResponse,
  Work,
  Reference,
  User,
} from '../../types/domain';
import { api } from '../../services/apiClient';
import { offlineStorage } from '../../services/offlineStorage';
import { FeedItem } from './FeedItem';
import { useToast, preloadImage } from '../design-system';
import { Sparkles, ArrowUp } from 'lucide-react';

interface FeedSlidingWindowState {
  items: FeedItemResponse[];
  startOffset: number;
  topSpacerHeight: number;
  category: string;
}

// Module-level in-memory cache for instant 0ms switching & retention
let globalFeedState: FeedSlidingWindowState = {
  items: [],
  startOffset: 0,
  topSpacerHeight: 0,
  category: 'Все',
};

const CATEGORIES = [
  'Все',
  'Стрижки & Барбер',
  'Ногти & Маникюр',
  'Брови & Ресницы',
  'Макияж',
  'Уход',
];

const ESTIMATED_ITEM_HEIGHT = 610; // Average pixel height of a feed card
const WINDOW_SIZE = 20; // Strictly 20 items in memory at all times
const BATCH_SIZE = 10; // Load 10 items and evict 10 items
const TRIGGER_DOWN_INDEX = 14; // Index 14 in window = 15th item (user reaches 15th item)
const TRIGGER_UP_INDEX = 2; // Index 2 in window = user scrolls back up

// Helper to pre-load and pre-decode images ahead of time into GPU RAM
function preloadBatchImages(items: FeedItemResponse[]) {
  if (!items) return;
  items.forEach((item) => {
    if (item.reference.media?.[0]?.url) {
      preloadImage(item.reference.media[0].url);
    }
    if (item.reference.media?.[0]?.thumbnail_url) {
      preloadImage(item.reference.media[0].thumbnail_url);
    }
    if (item.works?.[0]?.media?.[0]?.url) {
      preloadImage(item.works[0].media[0].url);
    }
  });
}

interface FeedSlidingWindowProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onWant: (work: Work, reference: Reference, author: User) => void;
  onOpenUser?: (userId: string) => void;
  onOpenMaster?: (userId: string) => void; // alias
  onOpenReference: (referenceId: string) => void;
  onOpenWork: (workId: string) => void;
  currentUser: User | null;
}

export const FeedSlidingWindow: React.FC<FeedSlidingWindowProps> = ({
  selectedCategory,
  onSelectCategory,
  onWant,
  onOpenUser,
  onOpenMaster,
  onOpenReference,
  onOpenWork,
}) => {
  const { showToast } = useToast();

  // Initialize strictly from in-memory cache if available
  const [feedItems, setFeedItems] = useState<FeedItemResponse[]>(() => {
    if (globalFeedState.category === selectedCategory && globalFeedState.items.length > 0) {
      return globalFeedState.items;
    }
    return [];
  });

  const [startOffset, setStartOffset] = useState<number>(() => {
    if (globalFeedState.category === selectedCategory) {
      return globalFeedState.startOffset;
    }
    return 0;
  });

  const [topSpacerHeight, setTopSpacerHeight] = useState<number>(() => {
    if (globalFeedState.category === selectedCategory) {
      return globalFeedState.topSpacerHeight;
    }
    return 0;
  });

  const [initialLoading, setInitialLoading] = useState<boolean>(() => {
    return !(globalFeedState.category === selectedCategory && globalFeedState.items.length > 0);
  });

  const [isSlidingLoading, setIsSlidingLoading] = useState<boolean>(false);

  // Locking ref to prevent concurrent slide operations
  const isFetchingRef = useRef<boolean>(false);
  const downSentinelRef = useRef<HTMLDivElement | null>(null);
  const upSentinelRef = useRef<HTMLDivElement | null>(null);

  // Synchronize memory cache
  const updateMemoryCache = (
    items: FeedItemResponse[],
    offset: number,
    spacerHeight: number,
    cat: string
  ) => {
    globalFeedState = {
      items,
      startOffset: offset,
      topSpacerHeight: spacerHeight,
      category: cat,
    };
  };

  // Proactively prefetch the NEXT 10 items into memory & browser cache
  const prefetchNextBatch = useCallback(async (currentStartOffset: number, category: string) => {
    try {
      const nextOffsetToLoad = currentStartOffset + WINDOW_SIZE;
      const res = await api.getFeed(
        undefined,
        category === 'Все' ? undefined : category,
        BATCH_SIZE,
        nextOffsetToLoad
      );
      if (res.items && res.items.length > 0) {
        preloadBatchImages(res.items);
      }
    } catch (e) {
      // silent background prefetch
    }
  }, []);

  // Initial load: strictly 20 items (records 0..19)
  const loadInitialBatch = useCallback(
    async (category: string) => {
      try {
        setInitialLoading(true);

        // Instant offline fallback if network is slow
        if (feedItems.length === 0) {
          const cached = await offlineStorage.getCachedFeed();
          if (cached && cached.length > 0) {
            const normalizedCached: FeedItemResponse[] = cached.map((it: any) => ({
              ...it,
              author: it.author || it.master || {
                id: it.works?.[0]?.author_id || it.reference?.author_id || '',
                name: it.works?.[0]?.author_name || it.reference?.author_name || 'Специалист',
                avatar: it.works?.[0]?.author_avatar || '',
              },
            }));
            const initial20 = normalizedCached.slice(0, WINDOW_SIZE);
            setFeedItems(initial20);
            preloadBatchImages(initial20);
            setStartOffset(0);
            setTopSpacerHeight(0);
            updateMemoryCache(initial20, 0, 0, category);
            setInitialLoading(false);
          }
        }

        const res = await api.getFeed(
          undefined,
          category === 'Все' ? undefined : category,
          WINDOW_SIZE,
          0
        );

        const loaded20 = res.items.slice(0, WINDOW_SIZE);
        setFeedItems(loaded20);
        preloadBatchImages(loaded20);
        setStartOffset(0);
        setTopSpacerHeight(0);
        updateMemoryCache(loaded20, 0, 0, category);
        offlineStorage.cacheFeed(loaded20);

        // Proactively prefetch next 10 items so they are already cached
        prefetchNextBatch(0, category);
      } catch (err) {
        console.error('Failed to load initial feed batch:', err);
      } finally {
        setInitialLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prefetchNextBatch]
  );

  // Handle category change: reset to offset 0 with 20 items
  useEffect(() => {
    if (globalFeedState.category !== selectedCategory || globalFeedState.items.length === 0) {
      loadInitialBatch(selectedCategory);
    } else {
      // Restore from in-memory cache instantly (0ms)
      setFeedItems(globalFeedState.items);
      preloadBatchImages(globalFeedState.items);
      setStartOffset(globalFeedState.startOffset);
      setTopSpacerHeight(globalFeedState.topSpacerHeight);
      setInitialLoading(false);
    }
  }, [selectedCategory, loadInitialBatch]);

  // Slide forward: triggered when user reaches 15th item (TRIGGER_DOWN_INDEX = 14)
  // Loads records 20-30 (10 items), evicts records 0-10 from memory.
  // Strictly keeps 20 latest loaded items in memory.
  const slideForward = useCallback(async () => {
    if (isFetchingRef.current || isSlidingLoading) return;
    isFetchingRef.current = true;
    setIsSlidingLoading(true);

    try {
      const nextOffsetToLoad = startOffset + WINDOW_SIZE;
      const res = await api.getFeed(
        undefined,
        selectedCategory === 'Все' ? undefined : selectedCategory,
        BATCH_SIZE,
        nextOffsetToLoad
      );

      if (res.items && res.items.length > 0) {
        preloadBatchImages(res.items);

        setFeedItems((prev) => {
          // Evict oldest 10 items (0..9)
          const remaining10 = prev.slice(BATCH_SIZE);
          // Append new 10 items
          const new20 = [...remaining10, ...res.items];

          const newStartOffset = startOffset + BATCH_SIZE;
          const newSpacer = topSpacerHeight + BATCH_SIZE * ESTIMATED_ITEM_HEIGHT;

          setStartOffset(newStartOffset);
          setTopSpacerHeight(newSpacer);
          updateMemoryCache(new20, newStartOffset, newSpacer, selectedCategory);

          // Proactively prefetch the upcoming batch ahead of time
          prefetchNextBatch(newStartOffset, selectedCategory);

          return new20;
        });
      }
    } catch (err) {
      console.error('Error sliding feed window forward:', err);
    } finally {
      setIsSlidingLoading(false);
      // Debounce sentinel re-arming
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 250);
    }
  }, [startOffset, topSpacerHeight, selectedCategory, isSlidingLoading, prefetchNextBatch]);

  // Slide backward: triggered when user scrolls up towards beginning of current 20 items
  const slideBackward = useCallback(async () => {
    if (startOffset <= 0 || isFetchingRef.current || isSlidingLoading) return;
    isFetchingRef.current = true;
    setIsSlidingLoading(true);

    try {
      const prevOffsetToLoad = Math.max(0, startOffset - BATCH_SIZE);
      const res = await api.getFeed(
        undefined,
        selectedCategory === 'Все' ? undefined : selectedCategory,
        BATCH_SIZE,
        prevOffsetToLoad
      );

      if (res.items && res.items.length > 0) {
        preloadBatchImages(res.items);

        setFeedItems((prev) => {
          // Keep top 10 items, evict bottom 10 items
          const remaining10 = prev.slice(0, BATCH_SIZE);
          const new20 = [...res.items, ...remaining10];

          const newStartOffset = Math.max(0, startOffset - BATCH_SIZE);
          const newSpacer = Math.max(0, topSpacerHeight - BATCH_SIZE * ESTIMATED_ITEM_HEIGHT);

          setStartOffset(newStartOffset);
          setTopSpacerHeight(newSpacer);
          updateMemoryCache(new20, newStartOffset, newSpacer, selectedCategory);

          return new20;
        });
      }
    } catch (err) {
      console.error('Error sliding feed window backward:', err);
    } finally {
      setIsSlidingLoading(false);
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 250);
    }
  }, [startOffset, topSpacerHeight, selectedCategory, isSlidingLoading]);

  // IntersectionObserver for down trigger (attached to 15th item: index 14)
  useEffect(() => {
    const sentinel = downSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          slideForward();
        }
      },
      { rootMargin: '450px 0px 450px 0px', threshold: 0.05 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feedItems, slideForward]);

  // IntersectionObserver for up trigger (attached to index 2 when startOffset > 0)
  useEffect(() => {
    const sentinel = upSentinelRef.current;
    if (!sentinel || startOffset <= 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          slideBackward();
        }
      },
      { rootMargin: '300px 0px 300px 0px', threshold: 0.05 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [feedItems, startOffset, slideBackward]);

  // Reset to beginning
  const handleResetToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadInitialBatch(selectedCategory);
  };

  // Follow toggle handler
  const handleToggleFollow = async (userId: string) => {
    const itemIdx = feedItems.findIndex((it) => it.author.id === userId);
    if (itemIdx === -1) return;

    const currentFollowing = feedItems[itemIdx].actions.following;

    try {
      if (currentFollowing) {
        await api.unfollowUser(userId);
        showToast('Вы отписались', 'info');
      } else {
        await api.followUser(userId);
        showToast('Вы подписались', 'success');
      }

      setFeedItems((prev) => {
        const updated = prev.map((item) =>
          item.author.id === userId
            ? {
                ...item,
                actions: { ...item.actions, following: !currentFollowing },
                author: {
                  ...item.author,
                  followers_count:
                    (item.author.followers_count || 0) + (currentFollowing ? -1 : 1),
                },
              }
            : item
        );
        updateMemoryCache(updated, startOffset, topSpacerHeight, selectedCategory);
        return updated;
      });
    } catch (err: any) {
      showToast(err?.message || 'Ошибка подписки', 'error');
    }
  };

  return (
    <div className="pb-24">
      {/* Category Filter Chips Rail */}
      <div className="sticky top-[53px] z-20 bg-[#FAF8F5]/90 backdrop-blur-md px-1 py-2 mb-2 border-b border-[#EDE8F3]">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#6B5B95] text-white shadow-xs'
                    : 'bg-white/80 text-[#554D63] border border-[#EDE8F3] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {startOffset > 0 && (
            <button
              onClick={handleResetToTop}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#6B5B95] hover:text-[#2D2738] px-2.5 py-1 rounded-full bg-white border border-[#EDE8F3] shrink-0 cursor-pointer shadow-2xs active:scale-95"
              title="В начало ленты"
            >
              <ArrowUp className="w-3 h-3" />
              <span>В начало</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Spacer representing evicted items for smooth continuous scroll */}
      {topSpacerHeight > 0 && (
        <div
          style={{ height: `${topSpacerHeight}px` }}
          aria-hidden="true"
          className="w-full pointer-events-none"
        />
      )}

      {/* Feed Items List (Strictly 20 items in DOM) */}
      <div className="space-y-4">
        {initialLoading && feedItems.length === 0 ? (
          <div className="p-12 text-center text-[#7E748E]">
            <div className="w-8 h-8 border-2 border-[#6B5B95] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Мгновенная загрузка ленты...
          </div>
        ) : feedItems.length > 0 ? (
          <>
            {feedItems.map((item, index) => {
              // Attach trigger sentinel to the 15th item (index 14)
              const isDownTrigger = index === TRIGGER_DOWN_INDEX;
              // Attach upward sentinel to the 3rd item (index 2)
              const isUpTrigger = index === TRIGGER_UP_INDEX && startOffset > 0;

              return (
                <div
                  key={`feed_item_${startOffset + index}_${item.reference.id}`}
                  ref={
                    isDownTrigger
                      ? downSentinelRef
                      : isUpTrigger
                      ? upSentinelRef
                      : undefined
                  }
                  className="relative"
                >
                  <FeedItem
                    item={item}
                    onWant={onWant}
                    onOpenUser={onOpenUser || onOpenMaster || (() => {})}
                    onOpenReference={onOpenReference}
                    onOpenWork={onOpenWork}
                    onToggleFollow={handleToggleFollow}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-16 moon-card rounded-3xl border border-[#EDE8F3] p-6 text-[#7E748E]">
            <Sparkles className="w-8 h-8 mx-auto text-[#6B5B95] mb-2" />
            <h3 className="font-semibold text-sm text-[#2D2738]">
              Пока нет публикаций в этой категории
            </h3>
            <p className="text-xs mt-1">Опубликуйте первый референс или работу мастера</p>
          </div>
        )}
      </div>
    </div>
  );
};
