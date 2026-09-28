import React, { useState } from 'react';
import { Reference } from '../../types/domain';
import { api } from '../../services/apiClient';
import { Modal, Button } from '../design-system';
import { Sparkles } from 'lucide-react';

interface CreateReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (ref: Reference) => void;
}

const PRESET_REF_PHOTOS = [
  'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
];

export const CreateReferenceModal: React.FC<CreateReferenceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_REF_PHOTOS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Стрижки & Барбер');
  const [tagsInput, setTagsInput] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activePhoto = customPhotoUrl.trim() || selectedPhoto;

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      const newRef = await api.createReference({
        title: title.trim(),
        category,
        source_url: sourceUrl.trim() || undefined,
        tags: tags.length > 0 ? tags : [category.split('&')[0].trim()],
        media: [
          {
            id: `med_ref_${Date.now()}`,
            owner_id: 'current',
            type: 'image',
            url: activePhoto,
            thumbnail_url: activePhoto,
            width: 800,
            height: 600,
            mime_type: 'image/jpeg',
          },
        ],
      });

      onSuccess(newRef);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Ошибка добавления референса');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Новый референс желаемого результата">
      <div className="space-y-4">
        {/* Photo Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
            Изображение желаемого результата *
          </label>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#EFEAE2] mb-2">
            <img src={activePhoto} alt="Selected" className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-6 gap-2 mb-2">
            {PRESET_REF_PHOTOS.map((url, i) => (
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

          <input
            type="text"
            value={customPhotoUrl}
            onChange={(e) => setCustomPhotoUrl(e.target.value)}
            placeholder="Или ссылка на фото: https://..."
            className="w-full h-10 px-3.5 rounded-xl border border-[#E7DFD5] bg-white text-xs text-[#1C1917]"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1917] mb-1">
            Название желаемого образа *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Миндальный маникюр с жемчужной втиркой"
            className="w-full h-11 px-3.5 rounded-xl border border-[#E7DFD5] bg-white text-sm text-[#1C1917]"
          />
        </div>

        {/* Category */}
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

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1917] mb-1">
            Теги (через запятую)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Фейд, Кроп, Короткие, Текстура"
            className="w-full h-11 px-3.5 rounded-xl border border-[#E7DFD5] bg-white text-sm text-[#1C1917]"
          />
        </div>

        <div className="pt-2 flex gap-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="want"
            size="md"
            className="flex-1"
            disabled={submitting || !title.trim()}
            onClick={handleSubmit}
          >
            {submitting ? 'Публикация...' : 'Опубликовать'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
