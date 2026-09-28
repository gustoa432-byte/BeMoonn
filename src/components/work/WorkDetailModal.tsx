import React, { useState, useEffect } from 'react';
import { Work, User, Reference } from '../../types/domain';
import { api } from '../../services/apiClient';
import { Modal, Button, Avatar, WantButton } from '../design-system';
import { Clock, MapPin, Sparkles, Trash2 } from 'lucide-react';

interface WorkDetailModalProps {
  workId: string | null;
  onClose: () => void;
  onWant: (work: Work, reference: Reference, author: User) => void;
  onOpenUser?: (userId: string) => void;
  onOpenMaster?: (userId: string) => void; // alias
  onOpenReference: (referenceId: string) => void;
  onWorkDeleted?: () => void;
}

export const WorkDetailModal: React.FC<WorkDetailModalProps> = ({
  workId,
  onClose,
  onWant,
  onOpenUser,
  onOpenMaster,
  onOpenReference,
  onWorkDeleted,
}) => {
  const [data, setData] = useState<{
    work: Work;
    author: User;
    reference: Reference;
  } | null>(null);
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const handleOpenUser = (userId: string) => {
    if (onOpenUser) onOpenUser(userId);
    else if (onOpenMaster) onOpenMaster(userId);
  };

  useEffect(() => {
    if (!workId) {
      setData(null);
      return;
    }
    setLoading(true);
    api
      .getWork(workId)
      .then(async (res: any) => {
        const authorUser = res.author || res.master;
        setData({
          work: res.work,
          author: authorUser,
          reference: res.reference,
        });
        const me = await api.getMe();
        setIsOwner(me.user.id === res.work.author_id);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [workId]);

  if (!workId) return null;

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите скрыть эту работу?')) return;
    try {
      await api.deleteWork(workId);
      onClose();
      if (onWorkDeleted) onWorkDeleted();
    } catch (err: any) {
      alert(err?.message || 'Ошибка удаления');
    }
  };

  const prof = data?.author?.professional;

  return (
    <Modal isOpen={Boolean(workId)} onClose={onClose} title={data?.work.title || 'Работа автора'}>
      {loading || !data ? (
        <div className="p-8 text-center text-[#7E748E]">Загрузка работы...</div>
      ) : (
        <div className="space-y-4">
          {/* Photos Carousel */}
          <div className="space-y-2">
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF8FD]">
              <img
                src={data.work.media[activeMediaIdx]?.url || data.work.media[0]?.url}
                alt={data.work.title}
                className="w-full h-full object-cover"
              />
            </div>
            {data.work.media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {data.work.media.map((med, idx) => (
                  <button
                    key={med.id || idx}
                    onClick={() => setActiveMediaIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer shrink-0 ${
                      activeMediaIdx === idx ? 'border-[#6B5B95]' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img
                      src={med.thumbnail_url || med.url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Author Info Strip */}
          <div
            onClick={() => {
              onClose();
              handleOpenUser(data.author.id);
            }}
            className="flex items-center justify-between p-3 bg-white rounded-2xl border border-[#EDE8F3] cursor-pointer hover:border-[#6B5B95]/50 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Avatar src={data.author.avatar} name={data.author.name} size="md" />
              <div>
                <div className="text-sm font-bold text-[#2D2738]">{data.author.name}</div>
                {prof?.profession && (
                  <div className="text-xs text-[#6B5B95]">{prof.profession}</div>
                )}
              </div>
            </div>
            <div className="text-xs text-[#7E748E] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {prof?.city || 'Москва'}
            </div>
          </div>

          {/* Work Specs */}
          <div className="p-3.5 bg-white rounded-2xl border border-[#EDE8F3] flex items-center justify-between">
            <div>
              <div className="text-xs text-[#7E748E]">Стоимость</div>
              <div className="text-lg font-bold text-[#2D2738] tabular-nums">
                {data.work.price.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#7E748E]">Время работы</div>
              <div className="text-sm font-semibold text-[#2D2738] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#7E748E]" />
                {data.work.duration} минут
              </div>
            </div>
          </div>

          {/* Description */}
          {data.work.description && (
            <div className="p-3.5 bg-white rounded-2xl border border-[#EDE8F3]">
              <div className="text-xs font-bold text-[#7E748E] uppercase mb-1">
                Детали выполнения
              </div>
              <p className="text-xs text-[#554D63] leading-relaxed">{data.work.description}</p>
            </div>
          )}

          {/* Attached Reference Link */}
          {data.reference && (
            <div
              onClick={() => {
                onClose();
                onOpenReference(data.reference.id);
              }}
              className="p-3 bg-[#FAF8FD] rounded-2xl border border-[#EDE8F3] flex items-center justify-between cursor-pointer hover:bg-[#F2EDF8] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6B5B95]" />
                <div>
                  <div className="text-[10px] text-[#7E748E] uppercase font-bold">
                    Выполнено по референсу
                  </div>
                  <div className="text-xs font-bold text-[#2D2738] truncate max-w-[240px]">
                    {data.reference.title}
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#6B5B95] font-semibold">Открыть</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            {isOwner ? (
              <Button
                variant="secondary"
                size="md"
                fullWidth
                icon={Trash2}
                onClick={handleDelete}
                className="text-[#C62828]"
              >
                Скрыть работу
              </Button>
            ) : (
              <WantButton
                onClick={() => {
                  onClose();
                  onWant(data.work, data.reference, data.author);
                }}
                fullWidth
                size="lg"
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
