import React, { useState } from 'react';
import { Work, Reference, User, WantRequest } from '../../types/domain';
import { BottomSheet, Button, useToast } from '../design-system';
import { api } from '../../services/apiClient';
import { Clock, CheckCircle2, ExternalLink } from 'lucide-react';

interface WantBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  work: Work | null;
  reference: Reference | null;
  author?: User | null;
  master?: any | null; // backward-compatible alias
  onWantSuccess?: (wantRequest: WantRequest) => void;
}

export const WantBottomSheet: React.FC<WantBottomSheetProps> = ({
  isOpen,
  onClose,
  work,
  reference,
  author,
  master,
  onWantSuccess,
}) => {
  const provider = author || master;
  const { showToast } = useToast();
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedWant, setSubmittedWant] = useState<WantRequest | null>(null);
  const [bookingDestination, setBookingDestination] = useState<{
    type: string;
    url: string;
    label: string;
  } | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSubmittedWant(null);
      setBookingDestination(null);
      setIsDuplicate(false);
      api
        .getMe()
        .then((res) => {
          if (res.user.phone) setContact(res.user.phone);
          else if (res.user.email) setContact(res.user.email);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!work || !reference || !provider) return null;

  const providerName = provider?.name || provider?.title || 'Мастер';
  const providerCity = provider?.professional?.city || provider?.city || 'Москва';

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await api.sendWant({
        work_id: work.id,
        client_contact: contact.trim() || undefined,
        client_note: note.trim() || undefined,
      });

      setSubmittedWant(res.want_request);
      setBookingDestination(res.booking);
      setIsDuplicate(res.is_duplicate);

      if (onWantSuccess) {
        onWantSuccess(res.want_request);
      }
      showToast('Запрос успешно сформирован!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Ошибка отправки запроса', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={submittedWant ? 'Запрос отправлен' : 'Хочу получить этот результат'}
      subtitle={
        submittedWant
          ? 'Мастер получил ваше обращение'
          : `Мастер: ${providerName} · ${providerCity}`
      }
    >
      {!submittedWant ? (
        <div className="space-y-4">
          {/* Reference & Work Pair Preview */}
          <div className="grid grid-cols-2 gap-2.5 bg-white p-3 rounded-2xl border border-[#EDE8F3]">
            {/* Desired Reference */}
            <div>
              <div className="text-[10px] uppercase font-bold text-[#6B5B95] mb-1">
                Что вы хотите (Референс)
              </div>
              <div className="rounded-xl overflow-hidden aspect-[4/3] bg-[#FAF8FD]">
                <img
                  src={reference.media[0]?.thumbnail_url || reference.media[0]?.url}
                  alt={reference.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs font-medium text-[#2D2738] mt-1 line-clamp-1">
                {reference.title}
              </div>
            </div>

            {/* Master's Work */}
            <div>
              <div className="text-[10px] uppercase font-bold text-[#7E748E] mb-1">
                Как сделает {providerName}
              </div>
              <div className="rounded-xl overflow-hidden aspect-[4/3] bg-[#FAF8FD]">
                <img
                  src={work.media[0]?.thumbnail_url || work.media[0]?.url}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs font-medium text-[#2D2738] mt-1 line-clamp-1">
                {work.title}
              </div>
            </div>
          </div>

          {/* Pricing & Duration Bar */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#EDE8F3]">
            <div>
              <div className="text-xs text-[#7E748E]">Стоимость у мастера</div>
              <div className="text-lg font-bold text-[#2D2738] tabular-nums">
                {work.price.toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#7E748E]">Длительность</div>
              <div className="text-sm font-semibold text-[#2D2738] flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5 text-[#7E748E]" />
                {work.duration} минут
              </div>
            </div>
          </div>

          {/* Contact & Note Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#2D2738] mb-1">
                Ваш контакт для связи
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+7 (___) ___-__-__ или Telegram"
                className="w-full h-11 px-3.5 rounded-xl border border-[#EDE8F3] bg-white text-sm text-[#2D2738] placeholder:text-[#7E748E] focus:outline-hidden focus:border-[#6B5B95]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2D2738] mb-1">
                Комментарий или пожелание (необязательно)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Например: удобно в субботу днем..."
                className="w-full p-3 rounded-xl border border-[#EDE8F3] bg-white text-sm text-[#2D2738] placeholder:text-[#7E748E] focus:outline-hidden focus:border-[#6B5B95]"
              />
            </div>
          </div>

          {/* Core Submit Button */}
          <Button
            variant="want"
            size="lg"
            fullWidth
            disabled={loading}
            onClick={handleSubmit}
            className="mt-2"
          >
            {loading ? 'Отправка...' : 'Подтвердить «Хочу»'}
          </Button>

          <p className="text-[11px] text-[#7E748E] text-center">
            Мастер получит ваш референс и выбранную работу в свои уведомления
          </p>
        </div>
      ) : (
        /* SUCCESS & DIRECT BOOKING BRIDGE */
        <div className="text-center py-2 space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#EBF7EE] text-[#2E7D32] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-[#2D2738]">
              {isDuplicate ? 'Запрос уже сохранен' : 'Запрос успешно отправлен!'}
            </h4>
            <p className="text-xs text-[#7E748E] mt-1 max-w-sm mx-auto leading-relaxed">
              Мастер {providerName} получил карточку с вашим референсом «{reference.title}». Теперь
              вы можете записаться напрямую.
            </p>
          </div>

          {bookingDestination && (
            <div className="bg-white p-4 rounded-2xl border border-[#EDE8F3] space-y-3">
              <div className="text-xs text-[#7E748E] font-medium">
                Канал прямой записи:
              </div>
              <a
                href={bookingDestination.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 px-6 text-sm font-semibold rounded-2xl bg-[#6B5B95] text-white hover:bg-[#58355E] shadow-md shadow-[#6B5B95]/20 active:scale-[0.98] transition-all flex items-center justify-center"
              >
                <span>{bookingDestination.label || 'Перейти к записи'}</span>
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          )}

          <div className="pt-2">
            <Button variant="secondary" size="md" fullWidth onClick={onClose}>
              Вернуться в ленту
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
