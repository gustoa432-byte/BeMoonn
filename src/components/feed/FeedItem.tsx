import React, { useState } from 'react';
import { FeedItemResponse, Work, Reference, User } from '../../types/domain';
import { MediaImage, Avatar, WantButton, FollowButton } from '../design-system';
import { Clock, Bookmark } from 'lucide-react';

interface FeedItemProps {
  item: FeedItemResponse;
  onWant: (work: Work, reference: Reference, author: User) => void;
  onOpenUser: (userId: string) => void;
  onOpenMaster?: (userId: string) => void; // alias
  onOpenReference: (referenceId: string) => void;
  onOpenWork: (workId: string) => void;
  onToggleFollow: (userId: string) => void;
}

export const FeedItem: React.FC<FeedItemProps> = ({
  item,
  onWant,
  onOpenUser,
  onOpenMaster,
  onOpenReference,
  onOpenWork,
  onToggleFollow,
}) => {
  const { reference, works, actions } = item;
  const rawAuthor = item.author || (item as any).master;
  const author: User = rawAuthor || {
    id: works?.[0]?.author_id || reference?.author_id || '',
    name: works?.[0]?.author_name || reference?.author_name || 'Специалист',
    avatar: works?.[0]?.author_avatar || '',
  };

  const handleOpenUser = (userId: string) => {
    if (!userId) return;
    if (onOpenUser) onOpenUser(userId);
    else if (onOpenMaster) onOpenMaster(userId);
  };

  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0);
  const activeWork: Work | undefined = works?.[selectedWorkIndex] || works?.[0];
  const [isSaved, setIsSaved] = useState(false);

  const prof = author?.professional;

  return (
    <article className="moon-card rounded-3xl border border-[#EDE8F3] shadow-xs overflow-hidden mb-5 transition-all bg-white">
      {/* 1. REFERENCE HEADER & MAIN IMAGE (Object of Desire) */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#6B5B95]">
              Референс
            </span>
            <span className="text-[#A59CB5]" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-[#7E748E] font-medium truncate max-w-[200px]">
              {reference.category}
            </span>
          </div>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="text-[#7E748E] hover:text-[#2D2738] p-1 cursor-pointer transition-colors"
            title={isSaved ? 'Сохранено в избранное' : 'Сохранить референс'}
          >
            <Bookmark
              className={`w-4 h-4 ${isSaved ? 'fill-[#E07A5F] text-[#E07A5F]' : ''}`}
            />
          </button>
        </div>

        <h2
          onClick={() => onOpenReference(reference.id)}
          className="text-base font-bold text-[#2D2738] hover:text-[#6B5B95] cursor-pointer transition-colors line-clamp-2 mb-3"
        >
          {reference.title}
        </h2>
      </div>

      {/* Large Reference Image */}
      <div
        className="relative cursor-pointer group"
        onClick={() => onOpenReference(reference.id)}
      >
        <MediaImage
          src={reference.media[0]?.url || ''}
          alt={reference.title}
          aspectRatio="4/3"
          fallbackColor={reference.media[0]?.fallback_color}
        />
        <div className="absolute bottom-3 left-3 bg-[#2D2738]/75 backdrop-blur-md text-[#FAF8F5] text-[11px] px-3 py-1 rounded-full font-medium shadow-sm">
          Желаемый образ
        </div>
      </div>

      {/* 2. AUTHOR IDENTITY & PROOF OF EXECUTION */}
      <div className="p-4 pt-4">
        {/* Author Row */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#EDE8F3]">
          <div
            onClick={() => author?.id && handleOpenUser(author.id)}
            className="flex items-center gap-2.5 cursor-pointer group min-w-0"
          >
            <Avatar src={author?.avatar} name={author?.name || 'Автор'} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-[#2D2738] group-hover:text-[#6B5B95] transition-colors truncate">
                  {author?.name || 'Автор'}
                </span>
                {prof?.profession && (
                  <>
                    <span className="text-[11px] text-[#A59CB5]">·</span>
                    <span className="text-xs text-[#7E748E] truncate">{prof.profession}</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-[#847B91] truncate">
                {prof?.city || 'Москва'} {prof?.place?.place_name ? `· ${prof.place.place_name}` : ''}
              </div>
            </div>
          </div>

          <FollowButton
            isFollowing={actions?.following || false}
            onToggle={() => author?.id && onToggleFollow(author.id)}
          />
        </div>

        {/* 3. REAL WORKS CAROUSEL */}
        {works.length > 0 ? (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#2D2738]">
                Реальные работы автора ({works.length})
              </span>
              <span className="text-[11px] text-[#7E748E]">
                {selectedWorkIndex + 1} из {works.length}
              </span>
            </div>

            {/* Horizontal thumbnails rail */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {works.map((work, idx) => {
                const isSelected = idx === selectedWorkIndex;
                const thumb = work.media[0]?.thumbnail_url || work.media[0]?.url;
                return (
                  <button
                    key={work.id}
                    onClick={() => setSelectedWorkIndex(idx)}
                    className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#6B5B95] scale-[1.02] shadow-sm'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={work.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                );
              })}
            </div>

            {/* Selected Work Details */}
            {activeWork && (
              <div className="mt-3 p-3.5 bg-[#FAF8FD] rounded-2xl border border-[#EDE8F3]">
                <div
                  onClick={() => onOpenWork(activeWork.id)}
                  className="font-bold text-xs text-[#2D2738] hover:text-[#6B5B95] cursor-pointer truncate"
                >
                  {activeWork.title}
                </div>
                <div className="text-[11px] text-[#6E6779] line-clamp-2 mt-1">
                  {activeWork.description}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#EDE8F3]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#2D2738] tabular-nums">
                      {activeWork.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-[#A59CB5]">·</span>
                    <span className="text-xs text-[#7E748E] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeWork.duration} мин
                    </span>
                  </div>

                  <WantButton
                    onClick={() => onWant(activeWork, reference, author)}
                    size="sm"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 p-4 bg-[#FAF8FD] rounded-2xl text-center text-xs text-[#7E748E]">
            Пока нет привязанных выполненных работ
          </div>
        )}
      </div>
    </article>
  );
};
