import React, { useState, useEffect } from 'react';
import { WantRequest, Notification, User } from '../../types/domain';
import { api } from '../../services/apiClient';
import { Avatar, Button } from '../design-system';
import {
  Bell,
  Sparkles,
  Eye,
  Check,
} from 'lucide-react';

interface ActivityViewProps {
  onSelectWork: (workId: string) => void;
  onSelectUser?: (userId: string) => void;
  onSelectMaster?: (userId: string) => void;
  onSelectReference: (refId: string) => void;
}

// In-memory cache for instant opening (0ms)
let activityMemoryCache: {
  currentUser: User | null;
  notifications: Notification[];
  receivedWants: WantRequest[];
  lastLoaded: number;
} = {
  currentUser: null,
  notifications: [],
  receivedWants: [],
  lastLoaded: 0,
};

export const ActivityView: React.FC<ActivityViewProps> = ({
  onSelectWork,
  onSelectUser,
  onSelectMaster,
  onSelectReference,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(activityMemoryCache.currentUser);
  const [notifications, setNotifications] = useState<Notification[]>(activityMemoryCache.notifications);
  const [receivedWants, setReceivedWants] = useState<WantRequest[]>(activityMemoryCache.receivedWants);
  const [loading, setLoading] = useState(!activityMemoryCache.currentUser);

  const handleOpenUser = (userId?: string) => {
    if (!userId) return;
    if (onSelectUser) onSelectUser(userId);
    else if (onSelectMaster) onSelectMaster(userId);
  };

  const loadData = async (silent = false) => {
    try {
      if (!silent && !activityMemoryCache.currentUser) {
        setLoading(true);
      }
      const me = await api.getMe();
      const notifs = await api.getNotifications();
      const allWants = await api.getWants();
      const incoming = allWants.filter((w) => w.provider_user_id === me.user.id);

      // Update in-memory cache
      activityMemoryCache = {
        currentUser: me.user,
        notifications: notifs,
        receivedWants: incoming,
        lastLoaded: Date.now(),
      };

      setCurrentUser(me.user);
      setNotifications(notifs);
      setReceivedWants(incoming);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have cache, refresh silently; otherwise initial load
    loadData(!!activityMemoryCache.currentUser);
  }, []);

  const handleUpdateWantStatus = async (
    wantId: string,
    status: 'seen' | 'completed' | 'cancelled'
  ) => {
    try {
      await api.updateWantStatus(wantId, status);
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Ошибка обновления статуса');
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="p-8 text-center text-[#78716C]">
        <div className="w-8 h-8 border-2 border-[#D9532F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Загрузка активности...
      </div>
    );
  }

  const showIncomingSection = receivedWants.length > 0 || !!currentUser?.professional;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 border-b border-[#EFEAE2]">
        <h1 className="text-lg font-bold text-[#1C1917]">Активность</h1>
        <p className="text-xs text-[#78716C]">
          {showIncomingSection
            ? 'Входящие запросы «Хочу» и системные уведомления'
            : 'Уведомления о ваших запросах и обновлениях мастеров'}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* INCOMING WANT REQUESTS QUEUE */}
        {showIncomingSection && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D9532F]" />
                Входящие запросы «Хочу» ({receivedWants.length})
              </h2>
            </div>

            {receivedWants.length > 0 ? (
              <div className="space-y-3">
                {receivedWants.map((want) => (
                  <div
                    key={want.id}
                    className={`bg-white rounded-3xl p-4 border transition-all shadow-xs ${
                      want.status === 'created'
                        ? 'border-[#D9532F]/50 ring-1 ring-[#D9532F]/20'
                        : 'border-[#EFEAE2]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => handleOpenUser(want.user_id || (want as any).client_id)}
                      >
                        <Avatar
                          name={want.client_name}
                          src={want.client_avatar}
                          size="sm"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#1C1917] group-hover:text-[#D9532F] transition-colors">
                            {want.client_name} хочет этот результат
                          </div>
                          <div className="text-[10px] text-[#A8A29E] tabular-nums">
                            {new Date(want.created_at).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            , {new Date(want.created_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>

                      {want.status === 'created' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9532F]/10 text-[#D9532F]">
                          Новый
                        </span>
                      )}
                      {want.status === 'seen' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E5F6FD] text-[#0288D1]">
                          В обработке
                        </span>
                      )}
                      {want.status === 'completed' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EDF7ED] text-[#2E7D32]">
                          Выполнено
                        </span>
                      )}
                    </div>

                    {/* Reference & Work thumbnails */}
                    <div className="flex items-center gap-3 p-2.5 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] my-2.5">
                      <div
                        className="w-14 h-14 rounded-xl overflow-hidden bg-[#EFEAE2] shrink-0 cursor-pointer"
                        onClick={() => onSelectReference(want.reference_id)}
                      >
                        <img
                          src={want.reference_image}
                          alt={want.reference_title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] text-[#78716C]">
                          Желаемый референс:{' '}
                          <span className="font-semibold text-[#1C1917]">{want.reference_title}</span>
                        </div>
                        <div
                          className="text-xs font-bold text-[#1C1917] hover:text-[#D9532F] cursor-pointer truncate mt-0.5"
                          onClick={() => onSelectWork(want.work_id)}
                        >
                          Работа: {want.work_title}
                        </div>
                        <div className="text-[11px] text-[#78716C] mt-0.5">
                          {want.work_price.toLocaleString('ru-RU')} ₽ · {want.work_duration} мин
                        </div>
                      </div>
                    </div>

                    {/* Client contact info & note */}
                    {want.client_contact && (
                      <div className="text-xs text-[#57534E] mb-2 flex items-center gap-1.5">
                        <span className="text-[#78716C]">Связь:</span>
                        <span className="font-semibold text-[#1C1917]">{want.client_contact}</span>
                      </div>
                    )}
                    {want.client_note && (
                      <div className="text-xs bg-[#F7F3EE] p-2.5 rounded-xl text-[#57534E] mb-3 italic">
                        «{want.client_note}»
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#F2ECE4]">
                      {want.status === 'created' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleUpdateWantStatus(want.id, 'seen')}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Принять в работу
                        </Button>
                      )}

                      {want.status !== 'completed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleUpdateWantStatus(want.id, 'completed')}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Отметить выполненным
                        </Button>
                      )}

                      {want.status === 'completed' && (
                        <div className="w-full text-center text-xs text-[#2E7D32] font-semibold py-1">
                          Заказ завершен · Клиент может оставить отзыв
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-3xl border border-[#EFEAE2] p-4 text-[#78716C] text-xs">
                Пока нет новых запросов «Хочу». Когда пользователь выберет вашу работу в ленте, запрос
                появится здесь.
              </div>
            )}
          </section>
        )}

        {/* GENERAL NOTIFICATIONS LIST */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#78716C]" />
              Уведомления
            </h2>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-2.5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    !notif.is_read ? 'border-[#D9532F]/30 bg-[#FFFDFB]' : 'border-[#EFEAE2]'
                  }`}
                  onClick={() => api.markNotificationRead(notif.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold text-[#1C1917]">{notif.title}</div>
                    <span className="text-[10px] text-[#A8A29E] shrink-0 tabular-nums">
                      {new Date(notif.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-1 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-3xl border border-[#EFEAE2] p-4 text-[#78716C] text-xs">
              Все уведомления прочитаны
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
