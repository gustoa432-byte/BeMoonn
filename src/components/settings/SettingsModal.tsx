import React, { useState, useEffect } from 'react';
import { Modal, Button, useToast, Avatar } from '../design-system';
import {
  Bell,
  Moon,
  Zap,
  Trash2,
  CheckCircle2,
  Database,
  User as UserIcon,
  ShieldCheck,
  Sparkles,
  Sliders,
  Check,
  Layers,
} from 'lucide-react';
import { User } from '../../types/domain';
import { offlineStorage } from '../../services/offlineStorage';

export interface AppSettings {
  pushNotifications: boolean;
  wantUpdates: boolean;
  newWorksAlerts: boolean;
  soundAlerts: boolean;
  highContrast: boolean;
  compactFeed: boolean;
  inMemoryCaching: boolean;
  analyticsOptIn: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  pushNotifications: true,
  wantUpdates: true,
  newWorksAlerts: true,
  soundAlerts: false,
  highContrast: false,
  compactFeed: false,
  inMemoryCaching: true,
  analyticsOptIn: true,
};

const SETTINGS_STORAGE_KEY = 'bemoon_app_settings_v1';

// Global in-memory cache for instant 0ms access
let inMemorySettingsCache: AppSettings = (() => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_SETTINGS;
})();

export function getCachedSettings(): AppSettings {
  return inMemorySettingsCache;
}

interface ProfileOption {
  id: string;
  name: string;
  title: string;
  badge: string;
  avatar: string;
  description: string;
}

const DEMO_PROFILES: ProfileOption[] = [
  {
    id: 'usr_anna',
    name: 'Анна Романова',
    title: 'Анна Романова · Эстетика & Тренды',
    badge: 'Пользователь',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=75',
    description: 'Поиск референсов, желания «Хочу», история визитов',
  },
  {
    id: 'usr_roman',
    name: 'Роман Белов',
    title: 'Роман Белов · Мужской стиль',
    badge: 'Пользователь',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=75',
    description: 'Точные стрижки, фейд, борода, история визитов',
  },
  {
    id: 'usr_alexei',
    name: 'Алексей Морозов',
    title: 'Алексей Морозов · Barber & Основатель школы',
    badge: 'Barber',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=75',
    description: 'Studio Chop-Chop, чистый фейд, Академия барберинга',
  },
  {
    id: 'usr_elena',
    name: 'Елена Соколова',
    title: 'Елена Соколова · Nail-кутюрье & Преподаватель',
    badge: 'Nail-мастер',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=75',
    description: 'Moon Nail Lab, японский маникюр, выдача дипломов Академии',
  },
  {
    id: 'usr_sofia',
    name: 'София Ветрова',
    title: 'София Ветрова · Brow & Lash Artist',
    badge: 'Brow Artist',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=75',
    description: 'Sfera Space, ламинирование, пудровое напыление, natural look',
  },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: (newSettings: AppSettings) => void;
  currentUser?: User | null;
  activeRole?: string; // Backwards compatible optional prop
  onSwitchUser?: (targetUserId: string) => void;
  onSwitchRole?: (targetRole?: any, targetUserId?: string) => void; // Backwards compatible
  onOpenAnalytics?: () => void;
  onOpenTests?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
  currentUser,
  onSwitchUser,
  onSwitchRole,
  onOpenAnalytics,
  onOpenTests,
}) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(inMemorySettingsCache);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'memory' | 'tools'>('profile');
  const [cacheSize, setCacheSize] = useState('3.8 MB');

  useEffect(() => {
    setSettings(inMemorySettingsCache);
  }, [isOpen]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    inMemorySettingsCache = updated;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
    if (onSettingsChanged) {
      onSettingsChanged(updated);
    }
  };

  const handleClearCache = async () => {
    try {
      await offlineStorage.clearAllData();
      setCacheSize('0 KB');
      showToast('Оперативная память и кэш очищены', 'success');
    } catch (err) {
      showToast('Ошибка очистки кэша', 'error');
    }
  };

  const handleSelectProfile = (profile: ProfileOption) => {
    if (onSwitchUser) {
      onSwitchUser(profile.id);
    } else if (onSwitchRole) {
      onSwitchRole(undefined, profile.id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Настройки и профиль" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Navigation Tabs inside Settings */}
        <div className="flex items-center gap-1 p-1 bg-[#F3EEF8] rounded-2xl text-xs font-semibold text-[#7E748E]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'profile'
                ? 'bg-white text-[#2D2738] shadow-xs'
                : 'hover:text-[#2D2738]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Пользователь</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'notifications'
                ? 'bg-white text-[#2D2738] shadow-xs'
                : 'hover:text-[#2D2738]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Оповещения</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'memory'
                ? 'bg-white text-[#2D2738] shadow-xs'
                : 'hover:text-[#2D2738]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Память</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'tools'
                ? 'bg-white text-[#2D2738] shadow-xs'
                : 'hover:text-[#2D2738]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Опции</span>
          </button>
        </div>

        {/* TAB 1: USER DEMO PERSONA SELECTION */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Current Active Persona Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-[#F2ECF7] border border-[#E4DDEB] shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#7E748E] uppercase tracking-wider">
                  Текущий аккаунт
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-[#FAF4ED] text-[#B87333] border-[#F0E4D5]">
                  {currentUser?.professional?.profession || 'User'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Avatar
                  src={
                    currentUser?.avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=75'
                  }
                  name={currentUser?.name || 'Пользователь'}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-[#2D2738] truncate">
                    {currentUser?.name || 'Пользователь'}
                  </h4>
                  <p className="text-xs text-[#7E748E] truncate">
                    {currentUser?.email || 'user@bemoon.app'}
                  </p>
                </div>
              </div>
            </div>

            {/* Curated Platform Personas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2D2738]">
                  Выбрать пользователя (демо-аккаунт):
                </label>
                <span className="text-[10px] text-[#7E748E]">5 персон экосистемы</span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {DEMO_PROFILES.map((p) => {
                  const isSelected = currentUser?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProfile(p)}
                      className={`w-full text-left p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#F5F0FB] border-[#6B5B95] shadow-xs ring-1 ring-[#6B5B95]/30'
                          : 'bg-white border-[#EDE8F3] hover:border-[#D8CEE3] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar src={p.avatar} name={p.name} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-[#2D2738] truncate">
                              {p.name}
                            </span>
                            {p.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAF4ED] text-[#B87333]">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#7E748E] truncate">{p.title}</p>
                          <p className="text-[10px] text-[#A59CB5] truncate">{p.description}</p>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#6B5B95] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-[#D8CEE3] flex items-center justify-center shrink-0 text-transparent hover:border-[#6B5B95]">
                          <Check className="w-3.5 h-3.5 text-transparent" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EDE8F3]">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#2D2738]">Запросы «Хочу»</div>
                <div className="text-[11px] text-[#7E748E]">
                  Мгновенный пуш при обновлении статуса записи и брони
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.wantUpdates}
                onChange={(e) => updateSetting('wantUpdates', e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#6B5B95] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EDE8F3]">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#2D2738]">Новинки избранных мастеров</div>
                <div className="text-[11px] text-[#7E748E]">
                  Оповещать о новых работах авторов, на которых вы подписаны
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.newWorksAlerts}
                onChange={(e) => updateSetting('newWorksAlerts', e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#6B5B95] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EDE8F3]">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#2D2738]">Звуковой сигнал</div>
                <div className="text-[11px] text-[#7E748E]">
                  Короткий лунный тон при получении ответа мастера
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundAlerts}
                onChange={(e) => updateSetting('soundAlerts', e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#6B5B95] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 3: IN-MEMORY CACHE */}
        {activeTab === 'memory' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-white border border-[#EDE8F3] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D2738]">Мгновенный переход (0ms)</div>
                    <div className="text-[10px] text-[#7E748E]">
                      Скользящий буфер (20 записей) в оперативной памяти
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#2E7D32]">Активно</span>
              </div>
              <p className="text-[11px] text-[#7E748E] leading-relaxed">
                Лента, профили и медиа-активы предзагружаются в фоновом режиме, исключая ступенчатую подгрузку и рывки.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EDE8F3]">
              <div>
                <div className="text-xs font-bold text-[#2D2738]">Локальный кэш референсов</div>
                <div className="text-[11px] text-[#7E748E]">Занято: {cacheSize}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={Trash2}
                onClick={handleClearCache}
                className="text-xs text-[#C62828] border-[#FCE8E6] hover:bg-[#FCE8E6]"
              >
                Очистить
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM TOOLS */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EDE8F3] text-[11px] text-[#7E748E] space-y-1">
              <div className="font-bold text-[#2D2738] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6B5B95]" />
                <span>Защита прав владения</span>
              </div>
              <p>
                Только автор работы или референса может вносить изменения. Ссылка на источник валидируется.
              </p>
            </div>

            {(onOpenTests || onOpenAnalytics) && (
              <div className="pt-2 border-t border-[#EDE8F3] space-y-2">
                <div className="text-[11px] font-bold text-[#7E748E] uppercase tracking-wider">
                  Инструменты платформы
                </div>
                <div className="flex gap-2">
                  {onOpenTests && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onOpenTests();
                      }}
                      className="flex-1 text-xs"
                    >
                      Тесты (Acceptance)
                    </Button>
                  )}
                  {onOpenAnalytics && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onOpenAnalytics();
                      }}
                      className="flex-1 text-xs"
                    >
                      Воронка
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={onClose}>
            Готово
          </Button>
        </div>
      </div>
    </Modal>
  );
};
