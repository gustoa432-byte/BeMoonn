import React, { useState, useEffect } from 'react';
import { Reference, Work } from '../../types/domain';
import { api } from '../../services/apiClient';
import { Modal, Button, IconButton } from '../design-system';
import { Upload, Check, Sparkles, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (work: Work) => void;
}

const PRESET_WORK_PHOTOS = [
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
];

export const CreateWorkModal: React.FC<CreateWorkModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [references, setReferences] = useState<Reference[]>([]);

  // Form state
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_WORK_PHOTOS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Стрижки & Барбер');
  const [price, setPrice] = useState('2500');
  const [duration, setDuration] = useState('45');
  const [selectedRefId, setSelectedRefId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      api.getReferences().then((refs) => {
        setReferences(refs);
        if (refs[0]) setSelectedRefId(refs[0].id);
      }).catch(() => {});
    }
  }, [isOpen]);

  const activePhoto = customPhotoUrl.trim() || selectedPhoto;

  const handleSubmit = async () => {
    if (!title.trim() || !selectedRefId) return;

    try {
      setSubmitting(true);
      const newWork = await api.createWork({
        title: title.trim(),
        description: description.trim(),
        category,
        price: Number(price) || 0,
        duration: Number(duration) || 45,
        reference_id: selectedRefId,
        specializations: [category.split('&')[0].trim()],
        media: [
          {
            id: `med_${Date.now()}`,
            owner_id: 'current',
            type: 'image',
            url: activePhoto,
            thumbnail_url: activePhoto,
            width: 800,
            height: 800,
            mime_type: 'image/jpeg',
          },
        ],
      });

      onSuccess(newWork);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Ошибка публикации работы');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Публикация работы · Шаг ${step} из 4`}
    >
      <div className="space-y-4">
        {/* Step indicator */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-[#D9532F]' : 'bg-[#E7DFD5]'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: MEDIA (Photos of real execution) */}
        {step === 1 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#1C1917]">
              1. Реальные фотографии работы
            </h4>
            <p className="text-xs text-[#78716C]">
              Загрузите фото реального выполнения или выберите из галереи портфолио
            </p>

            <div className="aspect-square rounded-2xl overflow-hidden bg-[#EFEAE2]">
              <img src={activePhoto} alt="Selected" className="w-full h-full object-cover" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Или вставьте прямую ссылку на фото
              </label>
              <input
                type="text"
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-11 px-3.5 rounded-xl border border-[#E7DFD5] bg-white text-xs text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                Готовые образцы съемки
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_WORK_PHOTOS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(url);
                      setCustomPhotoUrl('');
                    }}
                    className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer ${
                      activePhoto === url ? 'border-[#D9532F]' : 'border-transparent opacity-75'
                    }`}
                  >
                    <img src={url} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setStep(2)}
              className="mt-2"
            >
              Далее к описанию
            </Button>
          </div>
        )}

        {/* STEP 2: TITLE & CATEGORY */}
        {step === 2 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#1C1917]">2. Название и категория</h4>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Название работы *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Текстурный кроп + оформление бороды"
                className="w-full h-11 px-3.5 rounded-xl border border-[#E7DFD5] bg-white text-sm text-[#1C1917]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-[#E7DFD5] bg-white text-sm text-[#1C1917]"
              >
                <option value="Стрижки & Барбер">Стрижки & Барбер</option>
                <option value="Ногти & Маникюр">Ногти & Маникюр</option>
                <option value="Брови & Ресницы">Брови & Ресницы</option>
                <option value="Макияж">Макияж</option>
                <option value="Уход">Уход</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Детали и нюансы работы
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Особенности волос/кожи, использованные средства, форма среза..."
                className="w-full p-3 rounded-xl border border-[#E7DFD5] bg-white text-sm text-[#1C1917]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="md" onClick={() => setStep(1)}>
                Назад
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={!title.trim()}
                onClick={() => setStep(3)}
              >
                Далее к условиям
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PRICE & DURATION */}
        {step === 3 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#1C1917]">3. Стоимость и время</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2500"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E7DFD5] bg-white text-sm text-[#1C1917]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Длительность (мин) *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="45"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E7DFD5] bg-white text-sm text-[#1C1917]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="md" onClick={() => setStep(2)}>
                Назад
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setStep(4)}
              >
                Далее к привязке референса
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: ATTACH REFERENCE (The core of BE&MOON model) */}
        {step === 4 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#1C1917]">
              4. Привязка к исходному референсу
            </h4>
            <p className="text-xs text-[#78716C]">
              Работа мастера в BE&MOON всегда привязывается к визуальному образу (Референсу),
              чтобы клиенты видели доказательство выполнения.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
              {references.map((r) => {
                const isSelected = selectedRefId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRefId(r.id)}
                    className={`p-2.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#D9532F] bg-[#FAF8F5] shadow-xs'
                        : 'border-[#EFEAE2] bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#EFEAE2] shrink-0">
                      <img
                        src={r.media[0]?.thumbnail_url || r.media[0]?.url}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#1C1917] truncate">{r.title}</div>
                      <div className="text-[10px] text-[#D9532F] font-semibold uppercase mt-0.5">
                        {r.category}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#D9532F] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="md" onClick={() => setStep(3)}>
                Назад
              </Button>
              <Button
                variant="want"
                size="md"
                fullWidth
                disabled={submitting || !selectedRefId}
                onClick={handleSubmit}
              >
                {submitting ? 'Публикация...' : 'Опубликовать работу'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
