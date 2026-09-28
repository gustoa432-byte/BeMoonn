import React, { useState, useEffect } from 'react';
import { Reference, Work, User } from '../../types/domain';
import { api } from '../../services/apiClient';
import { Modal, Avatar, WantButton } from '../design-system';
import { Clock, Sparkles } from 'lucide-react';

interface ReferenceDetailModalProps {
  referenceId: string | null;
  onClose: () => void;
  onSelectWork: (workId: string) => void;
  onSelectUser?: (userId: string) => void;
  onSelectMaster?: (userId: string) => void;
  onWant: (work: Work, reference: Reference, author: User) => void;
}

export const ReferenceDetailModal: React.FC<ReferenceDetailModalProps> = ({
  referenceId,
  onClose,
  onSelectWork,
  onSelectUser,
  onSelectMaster,
  onWant,
}) => {
  const [data, setData] = useState<{ reference: Reference; works: Work[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenAuthor = (authorId: string) => {
    onClose();
    if (onSelectUser) onSelectUser(authorId);
    else if (onSelectMaster) onSelectMaster(authorId);
  };

  useEffect(() => {
    if (!referenceId) {
      setData(null);
      return;
    }
    setLoading(true);
    api.getReference(referenceId)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [referenceId]);

  if (!referenceId) return null;

  return (
    <Modal
      isOpen={Boolean(referenceId)}
      onClose={onClose}
      title={data?.reference.title || 'Референс желаемого результата'}
    >
      {loading || !data ? (
        <div className="p-8 text-center text-[#78716C]">Загрузка референса...</div>
      ) : (
        <div className="space-y-4">
          {/* Main Reference Photo */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFEAE2] relative">
            <img
              src={data.reference.media[0]?.url}
              alt={data.reference.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
              Желаемый результат
            </div>
          </div>

          <div>
            <div className="text-xs text-[#D9532F] font-bold uppercase tracking-wider">
              {data.reference.category}
            </div>
            <h2 className="text-lg font-bold text-[#1C1917] mt-1">{data.reference.title}</h2>
            <div className="text-xs text-[#78716C] mt-1">
              Автор публикации: {data.reference.author_name}
            </div>
          </div>

          {/* Tags */}
          {data.reference.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {data.reference.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#57534E] border border-[#EFEAE2]"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Real works section */}
          <div className="pt-2 border-t border-[#F2ECE4]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1C1917] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D9532F]" />
                Кто из специалистов это делает ({data.works.length})
              </h3>
            </div>

            {data.works.length > 0 ? (
              <div className="space-y-3">
                {data.works.map((work) => {
                  const authorId = work.author_id || work.master_id || '';
                  const authorName = work.author_name || work.master_name || 'Специалист';
                  const authorProfession = work.author_profession || work.master_profession;

                  return (
                    <div
                      key={work.id}
                      className="p-3 bg-white rounded-2xl border border-[#EFEAE2] shadow-xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => authorId && handleOpenAuthor(authorId)}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <Avatar name={authorName} size="sm" />
                          <div>
                            <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#D9532F] truncate">
                              {authorName}
                            </div>
                            {authorProfession && (
                              <div className="text-[10px] text-[#78716C]">{authorProfession}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-[#1C1917] tabular-nums">
                          {work.price.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          onClose();
                          onSelectWork(work.id);
                        }}
                        className="flex items-center gap-3 p-2 bg-[#FAF8F5] rounded-xl cursor-pointer hover:bg-[#F2ECE4] transition-colors"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#EFEAE2] shrink-0">
                          <img
                            src={work.media[0]?.thumbnail_url || work.media[0]?.url}
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-[#1C1917] truncate">
                            {work.title}
                          </div>
                          <div className="text-[11px] text-[#78716C] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{work.duration} минут</span>
                          </div>
                        </div>
                      </div>

                      <WantButton
                        fullWidth
                        size="sm"
                        onClick={async () => {
                          if (!authorId) return;
                          onClose();
                          try {
                            const u = await api.getUser(authorId);
                            onWant(work, data.reference, u.user);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-2xl border border-[#EFEAE2] text-xs text-[#78716C]">
                Специалисты еще не добавили реальные работы к этому образу
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
