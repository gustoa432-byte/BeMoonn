import React, { useState, useEffect } from 'react';
import {
  User,
  Work,
  Review,
  Certificate,
  ClientHistoryItem,
  WantRequest,
  Reference,
  WorkConsentRequest,
  WorkConsentPermissions,
} from '../../types/domain';
import { api } from '../../services/apiClient';
import { Avatar, Button, FollowButton, IconButton, Modal, useToast } from '../design-system';
import {
  MapPin,
  Calendar,
  ExternalLink,
  Briefcase,
  Star,
  Settings,
  Plus,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Award,
  ShieldCheck,
  Camera,
  CheckCircle,
  RotateCcw,
  Layers,
  Heart,
  BookOpen,
  Building,
  Check,
  X,
  UserCheck,
  Lock,
  Globe,
} from 'lucide-react';

interface UnifiedUserProfileViewProps {
  userId?: string;
  masterId?: string; // Backwards-compatible alias
  selectedWorkId?: string | null;
  onBack?: () => void;
  onSelectWork: (workId: string) => void;
  onSelectReference?: (referenceId: string) => void;
  onSelectUser?: (userId: string) => void;
  onSelectMaster?: (userId: string) => void; // alias
  onSelectSchool?: (schoolId: string) => void;
  onCreateWork?: () => void;
  onCreateReference?: () => void;
  onVerifyCertificate?: (token: string) => void;
  onOpenSettings?: () => void;
  onWant?: (work: Work, reference: Reference, author: User) => void;
}

export const UnifiedUserProfileView: React.FC<UnifiedUserProfileViewProps> = ({
  userId,
  masterId,
  selectedWorkId,
  onBack,
  onSelectWork,
  onSelectReference,
  onSelectUser,
  onSelectMaster,
  onSelectSchool,
  onCreateWork,
  onCreateReference,
  onVerifyCertificate,
  onOpenSettings,
  onWant,
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  // Content items
  const [works, setWorks] = useState<Work[]>([]);
  const [wants, setWants] = useState<WantRequest[]>([]);
  const [clientHistory, setClientHistory] = useState<ClientHistoryItem[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [certificates, setCertificates] = useState<
    (Certificate & { school_name?: string; school_logo?: string })[]
  >([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ownedSchools, setOwnedSchools] = useState<any[]>([]);

  // Consents (Private: for owner only)
  const [consentRequests, setConsentRequests] = useState<WorkConsentRequest[]>([]);
  const [consentOptions, setConsentOptions] = useState<
    Record<string, { save_to_history: boolean; publish_photo: boolean; show_client_name: boolean }>
  >({});
  const [processingConsent, setProcessingConsent] = useState<string | null>(null);

  // Social stats
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [ratingAvg, setRatingAvg] = useState('5.0');

  // Highlighted work (when opening from a work card)
  const [highlightedWorkId, setHighlightedWorkId] = useState<string | null>(selectedWorkId || null);

  useEffect(() => {
    if (selectedWorkId) {
      setHighlightedWorkId(selectedWorkId);
    }
  }, [selectedWorkId]);

  // Navigation tab inside Unified Profile
  type TabType = 'works' | 'references' | 'wants' | 'history' | 'education' | 'reviews' | 'school';
  const [activeTab, setActiveTab] = useState<TabType>('works');
  const [wantsSubTab, setWantsSubTab] = useState<'active' | 'completed'>('active');

  // Modals for editing Place and Booking Destination
  const [isEditPlaceOpen, setIsEditPlaceOpen] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [placeCity, setPlaceCity] = useState('');
  const [placeAddress, setPlaceAddress] = useState('');

  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState<
    'external' | 'dikidi' | 'telegram' | 'whatsapp' | 'phone'
  >('external');
  const [bookingUrl, setBookingUrl] = useState('');
  const [bookingLabel, setBookingLabel] = useState('');

  // Add/Edit Profession Modal (Capability Layer)
  const [isAddProfessionOpen, setIsAddProfessionOpen] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState('Barber');
  const [customTitle, setCustomTitle] = useState('');
  const [customCity, setCustomCity] = useState('Москва');
  const [customSpecializations, setCustomSpecializations] = useState('');
  const [customBookingUrl, setCustomBookingUrl] = useState('');
  const [customPlaceName, setCustomPlaceName] = useState('');

  // Today's Work modal (creating result after client visit)
  const [isTodayWorkOpen, setIsTodayWorkOpen] = useState(false);
  const [todayClient, setTodayClient] = useState('usr_anna');
  const [todayTitle, setTodayTitle] = useState('Nude Almond (Классика)');
  const [todayPhoto, setTodayPhoto] = useState(
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=720&q=75'
  );
  const [todayPrice, setTodayPrice] = useState('2800');
  const [todayDuration, setTodayDuration] = useState('60');
  const [todayNote, setTodayNote] = useState('Аппаратный маникюр, укрепление базой');
  const [todaySaveToHistory, setTodaySaveToHistory] = useState(true);
  const [todayPublishPhoto, setTodayPublishPhoto] = useState(false);
  const [submittingTodayWork, setSubmittingTodayWork] = useState(false);

  // Helper for navigating to other user
  const navigateToUser = (targetId: string) => {
    if (onSelectUser) {
      onSelectUser(targetId);
    } else if (onSelectMaster) {
      onSelectMaster(targetId);
    }
  };

  // Load everything for this User
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const meRes = await api.getMe();
      const me = meRes.user;
      setCurrentUser(me);

      const targetUserId = userId || masterId || me.id;
      const userIsOwner = targetUserId === me.id;
      setIsOwner(userIsOwner);

      if (userIsOwner) {
        // Viewing Own Profile
        setProfileUser(me);
        setOwnedSchools(meRes.owned_schools || []);

        if (me?.professional?.place) {
          setPlaceName(me.professional.place.place_name);
          setPlaceCity(me.professional.place.city);
          setPlaceAddress(me.professional.place.address);
        }
        if (me?.professional?.booking_destination) {
          setBookingType(me.professional.booking_destination.type);
          setBookingUrl(me.professional.booking_destination.url);
          setBookingLabel(me.professional.booking_destination.label);
        }

        // Parallel load of all content for owner
        const [userData, wantsRes, historyRes, consentsRes] = await Promise.all([
          api.getUser(me.id),
          api.getWants().catch(() => []),
          api.getClientHistory(me.id).catch(() => []),
          api.getConsentRequests().catch(() => []),
        ]);

        setWorks(userData?.works || []);
        setReferences(userData?.references || []);
        setReviews(userData?.reviews || []);
        setCertificates(userData?.certificates || []);
        setFollowersCount(me?.followers_count || userData?.stats?.followers_count || 0);
        setRatingAvg(userData?.stats?.rating_avg || '5.0');
        setWants(wantsRes);
        setClientHistory(historyRes);
        setConsentRequests(consentsRes.filter((c: any) => c.status === 'pending'));

        // Default tab: works if user has works/profession, otherwise references
        if (userData?.works?.length > 0 || me?.professional) {
          setActiveTab('works');
        } else if (userData?.references?.length > 0) {
          setActiveTab('references');
        } else if (wantsRes.length > 0) {
          setActiveTab('wants');
        } else {
          setActiveTab('history');
        }
      } else {
        // Viewing Another User's Profile
        const userData = await api.getUser(targetUserId);
        if (!userData || !userData.user) {
          throw new Error('Пользователь не найден');
        }
        setProfileUser(userData.user);
        setWorks(userData.works || []);
        setReferences(userData.references || []);
        setReviews(userData.reviews || []);
        setCertificates(userData.certificates || []);
        setFollowersCount(userData.stats?.followers_count || 0);
        setRatingAvg(userData.stats?.rating_avg || '5.0');
        setIsFollowing(userData.is_following);

        // Fetch public history/schools if any
        const [schoolsRes, historyRes] = await Promise.all([
          api.getSchools().catch(() => []),
          api.getClientHistory(targetUserId).catch(() => []),
        ]);
        setOwnedSchools(schoolsRes.filter((s) => s.owner_id === targetUserId));
        setClientHistory(historyRes.filter((h) => h.confirmed_by_client));

        if (userData?.works?.length > 0 || userData?.user?.professional) {
          setActiveTab('works');
        } else {
          setActiveTab('references');
        }
      }
    } catch (err: any) {
      console.error('Error loading unified profile:', err);
      showToast(err?.message || 'Ошибка загрузки профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [userId, masterId]);

  const handleToggleFollow = async () => {
    if (!profileUser) return;
    try {
      if (isFollowing) {
        const res = await api.unfollowUser(profileUser.id);
        setIsFollowing(res.following);
        setFollowersCount(res.followers_count);
        showToast(`Вы отписались от ${profileUser.name}`, 'info');
      } else {
        const res = await api.followUser(profileUser.id);
        setIsFollowing(res.following);
        setFollowersCount(res.followers_count);
        showToast(`Вы подписались на ${profileUser.name}`, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Ошибка подписки', 'error');
    }
  };

  // Add / Update Profession (Capability Layer)
  const handleSaveProfession = async () => {
    if (!currentUser) return;
    try {
      const res = await api.updateUserProfession(currentUser.id, {
        profession: selectedProfession,
        title: customTitle || `${selectedProfession} · Профессионал`,
        city: customCity,
        specializations: customSpecializations
          ? customSpecializations.split(',').map((s) => s.trim())
          : [selectedProfession],
        booking_url: customBookingUrl || 'https://t.me/bemoon_booking',
        place_name: customPlaceName || 'Студия красоты',
      });
      setIsAddProfessionOpen(false);
      showToast(`Профессиональный профиль «${selectedProfession}» активирован!`, 'success');
      loadProfileData();
    } catch (err: any) {
      showToast(err?.message || 'Ошибка сохранения профессии', 'error');
    }
  };

  // Save Place
  const handleSavePlace = async () => {
    if (!currentUser) return;
    try {
      await api.updateUserPlace(currentUser.id, {
        place_name: placeName,
        city: placeCity,
        address: placeAddress,
      });
      setIsEditPlaceOpen(false);
      showToast('Место работы обновлено', 'success');
      loadProfileData();
    } catch (err: any) {
      showToast(err?.message || 'Ошибка обновления места', 'error');
    }
  };

  // Save Booking
  const handleSaveBooking = async () => {
    if (!currentUser) return;
    try {
      await api.updateUserBooking(currentUser.id, {
        type: bookingType,
        url: bookingUrl,
        label: bookingLabel || 'Записаться',
      });
      setIsEditBookingOpen(false);
      showToast('Канал записи сохранен', 'success');
      loadProfileData();
    } catch (err: any) {
      showToast(err?.message || 'Ошибка сохранения канала записи', 'error');
    }
  };

  // Today's Work submission
  const handleSubmitTodayWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayTitle.trim()) {
      showToast('Укажите название работы', 'error');
      return;
    }
    try {
      setSubmittingTodayWork(true);
      await api.createClientHistory({
        client_user_id: todayClient,
        title: todayTitle,
        photo_url: todayPhoto,
        price: Number(todayPrice) || 2500,
        duration: Number(todayDuration) || 60,
        note: todayNote,
        save_to_history: todaySaveToHistory,
        publish_photo: todayPublishPhoto,
        show_client_name: true,
      });

      setIsTodayWorkOpen(false);
      showToast(
        todayPublishPhoto
          ? 'Работа сохранена в истории, клиенту отправлен запрос на публикацию'
          : 'Работа сохранена в истории визитов',
        'success'
      );
      loadProfileData();
    } catch (err: any) {
      showToast(err?.message || 'Ошибка добавления работы', 'error');
    } finally {
      setSubmittingTodayWork(false);
    }
  };

  // Consent Response
  const handleConsentAction = async (consentId: string, action: 'grant' | 'reject') => {
    try {
      setProcessingConsent(consentId);
      const perms = consentOptions[consentId] || {
        save_to_history: true,
        publish_photo: action === 'grant',
        show_client_name: true,
      };

      await api.respondConsentRequest(consentId, action, perms);
      setConsentRequests((prev) => prev.filter((c) => c.id !== consentId));
      showToast(
        action === 'grant'
          ? 'Публикация разрешена! Работа добавлена в портфолио с пометкой [Подтверждено]'
          : 'Публикация отклонена. Работа останется скрытой.',
        action === 'grant' ? 'success' : 'info'
      );
      loadProfileData();
    } catch (err: any) {
      showToast(err?.message || 'Ошибка обработки согласия', 'error');
    } finally {
      setProcessingConsent(null);
    }
  };

  // Repeat Action
  const handleRepeatClick = async (item: ClientHistoryItem) => {
    try {
      const res = await api.repeatHistory(item.id);
      showToast('Формирование запроса на повтор...', 'success');
      if (res.action_url) {
        window.open?.(res.action_url, '_blank');
      }
    } catch (err: any) {
      showToast(err?.message || 'Ошибка повтора', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#6B5B95] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#7E748E] font-medium">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="p-8 text-center text-[#7E748E]">
        <p>Пользователь не найден</p>
        {onBack && (
          <Button variant="secondary" size="sm" onClick={onBack} className="mt-4">
            Назад
          </Button>
        )}
      </div>
    );
  }

  const activeWants = wants.filter((w) => w.status === 'created' || w.status === 'seen');
  const prof = profileUser?.professional;
  const currentPlace = prof?.place;
  const booking = prof?.booking_destination;

  return (
    <div className="space-y-4 pb-12">
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <div className="flex items-center justify-between gap-2 p-1">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#EDE8F3] text-xs font-semibold text-[#554D63] hover:bg-[#FAF8FD] transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Назад</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B5B95] uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Профиль</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isOwner && onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-full bg-white border border-[#EDE8F3] flex items-center justify-center text-[#554D63] hover:text-[#2D2738] hover:border-[#6B5B95] transition-all cursor-pointer shadow-2xs"
              title="Настройки аккаунта"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {!isOwner && (
            <FollowButton
              isFollowing={isFollowing}
              followersCount={followersCount}
              onToggle={handleToggleFollow}
            />
          )}
        </div>
      </div>

      {/* 2. UNIFIED USER CARD (HERO) */}
      <div className="moon-card p-5 rounded-3xl border border-[#EDE8F3] bg-white shadow-xs relative overflow-hidden">
        <div className="flex items-start gap-4">
          <Avatar
            src={profileUser.avatar}
            name={profileUser.name}
            size="lg"
            className="ring-2 ring-[#EDE8F3] ring-offset-2 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-[#2D2738] truncate">{profileUser.name}</h1>
              {prof?.profession && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF8FD] text-[#6B5B95] border border-[#EDE8F3]">
                  {prof.profession}
                </span>
              )}
            </div>

            {/* City · Studio · Rating */}
            <div className="text-xs text-[#7E748E] mt-1 flex items-center gap-1.5 flex-wrap">
              <span>{prof?.city || 'Москва'}</span>
              {currentPlace?.place_name && (
                <>
                  <span className="text-[#A59CB5]" aria-hidden="true">·</span>
                  <span className="font-medium text-[#2D2738]">{currentPlace.place_name}</span>
                </>
              )}
              <span className="text-[#A59CB5]" aria-hidden="true">·</span>
              <span className="font-bold text-[#2D2738] flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{ratingAvg}</span>
              </span>
            </div>

            <p className="text-xs text-[#6E6779] mt-1 leading-relaxed">
              {profileUser.bio || 'Пользователь BE&MOON'}
            </p>

            {/* Quick Booking Button in Hero for Visitors */}
            {!isOwner && (booking?.url || prof) && (
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={booking?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-full bg-[#6B5B95] text-white text-xs font-bold hover:bg-[#584880] transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>Записаться</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Specialization Tags if User has profession */}
            {prof?.specializations && prof.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {prof.specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF8F5] text-[#554D63] border border-[#EDE8F3]"
                  >
                    #{spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STATS BAR: Works, Desires, Followers, Rating */}
        <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-[#EDE8F3] text-center">
          <div>
            <div className="text-sm font-bold text-[#2D2738] tabular-nums">{works.length}</div>
            <div className="text-[10px] text-[#7E748E]">Работы</div>
          </div>
          <div>
            <div className="text-sm font-bold text-[#2D2738] tabular-nums">{references.length}</div>
            <div className="text-[10px] text-[#7E748E]">Желания</div>
          </div>
          <div>
            <div className="text-sm font-bold text-[#2D2738] tabular-nums">{followersCount}</div>
            <div className="text-[10px] text-[#7E748E]">Подписчики</div>
          </div>
          <div>
            <div className="text-sm font-bold text-[#2D2738] flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-[#E07A5F] text-[#E07A5F]" />
              <span>{ratingAvg}</span>
            </div>
            <div className="text-[10px] text-[#7E748E]">{reviews.length} отзывов</div>
          </div>
        </div>

        {/* OWNER BANNER: If user doesn't have profession, offer 1-click unlock */}
        {isOwner && !prof && (
          <div className="mt-4 p-3.5 bg-[#FAF8FD] rounded-2xl border border-[#EDE8F3] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#6B5B95] text-white flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#2D2738]">Предоставляете бьюти-услуги?</div>
                <div className="text-[10px] text-[#7E748E]">
                  Добавьте профессию, чтобы принимать записи и публиковать работы
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddProfessionOpen(true)}
              className="shrink-0"
            >
              Добавить
            </Button>
          </div>
        )}
      </div>

      {/* 2.1 SPOTLIGHT: ВЫБРАННАЯ РАБОТА (REFERENCE → BEFORE → AFTER) */}
      {(() => {
        const selectedWork = works.find((w) => w.id === highlightedWorkId);
        if (!selectedWork) return null;

        const otherWorks = works.filter((w) => w.id !== highlightedWorkId);
        const isPortfolio = Boolean(selectedWork.is_portfolio_model || selectedWork.price === 0);

        return (
          <div className="space-y-3">
            <div className="moon-card p-4 rounded-3xl border-2 border-[#6B5B95]/30 bg-white shadow-sm space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6B5B95]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B5B95]">
                    Выбранная работа
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setHighlightedWorkId(null)}
                  className="text-[11px] font-semibold text-[#7E748E] hover:text-[#2D2738] cursor-pointer"
                >
                  Скрыть
                </button>
              </div>

              {/* Work Title & Price */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#2D2738] truncate">{selectedWork.title}</h3>
                  {selectedWork.description && (
                    <p className="text-xs text-[#6E6779] mt-0.5 line-clamp-2">{selectedWork.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {isPortfolio ? (
                    <div>
                      <span className="text-sm font-extrabold text-[#E07A5F]">0 ₽</span>
                      <div className="text-[10px] font-bold text-[#6B5B95]">Для портфолио</div>
                    </div>
                  ) : (
                    <div className="text-sm font-extrabold text-[#2D2738] tabular-nums">
                      {selectedWork.price.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                  <div className="text-[10px] text-[#7E748E] flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{selectedWork.duration} мин</span>
                  </div>
                </div>
              </div>

              {/* 3 SLIDES: REFERENCE → BEFORE → AFTER */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* 1. REFERENCE */}
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold text-[#6B5B95] uppercase tracking-wider truncate">
                    1. Референс
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF8FD] border border-[#EDE8F3] relative">
                    {selectedWork.reference_image ? (
                      <img
                        src={selectedWork.reference_image}
                        alt="Желаемый образ"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-[#7E748E]">
                        Без референса
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. BEFORE */}
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold text-[#554D63] uppercase tracking-wider truncate">
                    2. До
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF8FD] border border-[#EDE8F3] relative">
                    {selectedWork.before_image ? (
                      <img
                        src={selectedWork.before_image}
                        alt="Фото до работы"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-[#7E748E]">
                        Фото «До» нет
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. AFTER */}
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider truncate">
                    3. После
                  </div>
                  <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF8FD] border border-[#EDE8F3] relative ring-2 ring-[#2E7D32]/40">
                    {selectedWork.after_image || selectedWork.media?.[0]?.url ? (
                      <img
                        src={selectedWork.after_image || selectedWork.media[0].url}
                        alt="Результат работы"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-[#7E748E]">
                        Результат
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking CTA for this work */}
              <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#EDE8F3]">
                <div className="text-xs text-[#7E748E]">
                  Мастер: <span className="font-bold text-[#2D2738]">{profileUser.name}</span>
                </div>
                <Button
                  variant="want"
                  size="sm"
                  onClick={() => {
                    if (onWant && profileUser) {
                      const ref: Reference = {
                        id: selectedWork.reference_id || `ref_${selectedWork.id}`,
                        author_id: selectedWork.author_id,
                        author_name: profileUser.name,
                        source_type: 'curated',
                        title: selectedWork.reference_title || selectedWork.title,
                        category: selectedWork.category,
                        tags: selectedWork.specializations || [],
                        media: [
                          {
                            id: `m_${selectedWork.id}`,
                            owner_id: selectedWork.author_id,
                            type: 'image',
                            url: selectedWork.after_image || selectedWork.media?.[0]?.url || '',
                            thumbnail_url: selectedWork.after_image || selectedWork.media?.[0]?.url || '',
                            width: 800,
                            height: 800,
                            mime_type: 'image/jpeg',
                          },
                        ],
                        created_at: selectedWork.created_at,
                      };
                      onWant(selectedWork, ref, profileUser);
                    } else if (booking?.url) {
                      window.open?.(booking.url, '_blank');
                    }
                  }}
                >
                  Записаться на эту работу
                </Button>
              </div>
            </div>

            {/* 2.2 ДРУГИЕ РАБОТЫ МАСТЕРА */}
            {otherWorks.length > 0 && (
              <div className="moon-card p-4 rounded-3xl border border-[#EDE8F3] bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#2D2738]">
                    Другие работы мастера ({otherWorks.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {otherWorks.map((w) => {
                    const thumb = w.after_image || w.media?.[0]?.thumbnail_url || w.media?.[0]?.url;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setHighlightedWorkId(w.id)}
                        className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-[#EDE8F3] hover:border-[#6B5B95] transition-all cursor-pointer group"
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={w.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#FAF8FD] flex items-center justify-center text-[10px] text-[#7E748E]">
                            Работа
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1 text-[9px] font-bold text-white truncate text-left">
                          {w.price === 0 ? '0 ₽' : `${w.price} ₽`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* 3. CAPABILITY LAYER: PLACE & BOOKING (Only if user has profession) */}
      {prof && (
        <div className="space-y-3">
          {/* Current Place */}
          <div className="moon-card p-4 rounded-3xl border border-[#EDE8F3] bg-white shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF8FD] border border-[#EDE8F3] flex items-center justify-center text-[#6B5B95] shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#6B5B95] tracking-wider uppercase">
                    Текущее место работы
                  </div>
                  <div className="text-sm font-bold text-[#2D2738] mt-0.5">
                    {currentPlace?.place_name || 'Индивидуальная практика'}
                  </div>
                  <div className="text-xs text-[#7E748E] mt-0.5">
                    {currentPlace?.city || prof.city || 'Москва'}
                    {currentPlace?.address ? `, ${currentPlace.address}` : ''}
                  </div>
                </div>
              </div>

              {isOwner && (
                <button
                  onClick={() => setIsEditPlaceOpen(true)}
                  className="text-xs text-[#6B5B95] font-semibold hover:underline cursor-pointer"
                >
                  Изменить
                </button>
              )}
            </div>
          </div>

          {/* Booking Button */}
          {booking?.url && (
            <div className="moon-card p-3.5 rounded-2xl border border-[#EDE8F3] bg-white shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                <span className="text-[#6E6779]">Канал прямой записи:</span>
                <span className="font-bold text-[#2D2738]">{booking.label || 'Онлайн'}</span>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    onClick={() => setIsEditBookingOpen(true)}
                    className="text-[11px] text-[#6B5B95] font-medium hover:underline"
                  >
                    Настроить
                  </button>
                )}
                <a
                  href={booking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#6B5B95] text-white text-xs font-bold hover:bg-[#584880] transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>{booking.label || 'Записаться'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. PENDING CONSENTS (Owner only: Private incoming publication requests) */}
      {isOwner && consentRequests.length > 0 && (
        <div className="moon-card p-4 rounded-3xl border border-[#EDE8F3] bg-[#FAF8FD] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6B5B95]" />
              <h3 className="text-xs font-bold text-[#2D2738]">
                Запросы на согласие публикации ({consentRequests.length})
              </h3>
            </div>
            <span className="text-[10px] text-[#7E748E]">Section 6, 7</span>
          </div>

          <div className="space-y-3">
            {consentRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-3.5 rounded-2xl border border-[#EDE8F3] shadow-xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={req.work_image}
                    alt={req.work_title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#7E748E]">
                      Мастер: <span className="font-bold text-[#2D2738]">{req.provider_name}</span>
                    </div>
                    <div className="text-sm font-bold text-[#2D2738] truncate mt-0.5">
                      {req.work_title}
                    </div>
                    <div className="text-[11px] text-[#6E6779] mt-0.5">
                      Мастер запрашивает разрешение на публикацию вашего фото в своём портфолио
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EDE8F3]">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={processingConsent === req.id}
                    onClick={() => handleConsentAction(req.id, 'reject')}
                  >
                    Отклонить
                  </Button>
                  <Button
                    variant="want"
                    size="sm"
                    disabled={processingConsent === req.id}
                    onClick={() => handleConsentAction(req.id, 'grant')}
                    icon={Check}
                  >
                    Разрешить публикацию
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. UNIFIED TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveTab('works')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'works'
              ? 'bg-[#2D2738] text-white shadow-xs'
              : 'bg-white border border-[#EDE8F3] text-[#554D63] hover:bg-[#FAF8FD]'
          }`}
        >
          Работы ({works.length})
        </button>

        <button
          onClick={() => setActiveTab('references')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'references'
              ? 'bg-[#2D2738] text-white shadow-xs'
              : 'bg-white border border-[#EDE8F3] text-[#554D63] hover:bg-[#FAF8FD]'
          }`}
        >
          Референсы ({references.length})
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('wants')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'wants'
                ? 'bg-[#2D2738] text-white shadow-xs'
                : 'bg-white border border-[#EDE8F3] text-[#554D63] hover:bg-[#FAF8FD]'
            }`}
          >
            ХОЧУ ({activeWants.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'history'
              ? 'bg-[#2D2738] text-white shadow-xs'
              : 'bg-white border border-[#EDE8F3] text-[#554D63] hover:bg-[#FAF8FD]'
          }`}
        >
          История визитов ({clientHistory.length})
        </button>

        {certificates.length > 0 && (
          <button
            onClick={() => setActiveTab('education')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'education'
                ? 'bg-[#2D2738] text-white shadow-xs'
                : 'bg-white border border-[#EDE8F3] text-[#554D63] hover:bg-[#FAF8FD]'
            }`}
          >
            Обучение ({certificates.length})
          </button>
        )}

        {reviews.length > 0 && (
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'reviews'
                ? 'bg-[#2D2738] text-white shadow-xs'
                : 'bg-white border border-[#EDE8F3] text-[#554D63] hover:bg-[#FAF8FD]'
            }`}
          >
            Отзывы ({reviews.length})
          </button>
        )}

        {ownedSchools.length > 0 && (
          <button
            onClick={() => setActiveTab('school')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'school'
                ? 'bg-[#2D2738] text-white shadow-xs'
                : 'bg-white border border-[#EDE8F3] text-[#554D63] hover:bg-[#FAF8FD]'
            }`}
          >
            Школа ({ownedSchools.length})
          </button>
        )}
      </div>

      {/* 6. TAB CONTENT */}
      {/* TAB: WORKS */}
      {activeTab === 'works' && (
        <div className="space-y-3">
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Camera}
                onClick={() => setIsTodayWorkOpen(true)}
                className="flex-1"
              >
                Визит клиента [Today's Work]
              </Button>
              {onCreateWork && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={onCreateWork}
                  className="flex-1"
                >
                  Опубликовать работу
                </Button>
              )}
            </div>
          )}

          {works.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {works.map((work) => (
                <div
                  key={work.id}
                  onClick={() => onSelectWork(work.id)}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#EDE8F3] shadow-xs hover:shadow-md transition-all cursor-pointer relative"
                >
                  <div className="aspect-[4/5] bg-[#FAF8FD] relative overflow-hidden">
                    <img
                      src={work.media[0]?.thumbnail_url || work.media[0]?.url}
                      alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {work.confirmed_by_client && (
                      <div className="absolute top-2 left-2 bg-[#2D2738]/85 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 shadow-2xs">
                        <CheckCircle className="w-3 h-3 text-[#52B788]" />
                        Подтверждено
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-[#2D2738] truncate">{work.title}</h4>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#7E748E]">
                      <span className="font-semibold text-[#2D2738] tabular-nums">
                        {work.price.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="tabular-nums">{work.duration} мин</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-[#EDE8F3] p-6 text-[#7E748E]">
              <Camera className="w-8 h-8 mx-auto text-[#B0A6C0] mb-2 opacity-50" />
              <h4 className="font-semibold text-sm text-[#2D2738]">Работ пока нет</h4>
              <p className="text-xs mt-1">Опубликованные созидательные работы отображаются здесь</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: REFERENCES (Desires) */}
      {activeTab === 'references' && (
        <div className="space-y-3">
          {isOwner && onCreateReference && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={onCreateReference}
              >
                Сохранить новый референс
              </Button>
            </div>
          )}

          {references.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  onClick={() => onSelectReference && onSelectReference(ref.id)}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#EDE8F3] shadow-xs hover:shadow-md transition-all cursor-pointer relative"
                >
                  <div className="aspect-[4/3] bg-[#FAF8FD] relative overflow-hidden">
                    <img
                      src={ref.media[0]?.thumbnail_url || ref.media[0]?.url}
                      alt={ref.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isOwner && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded-full text-[10px] shadow-2xs">
                        {ref.is_private ? (
                          <span title="Приватный"><Lock className="w-3 h-3 text-[#7E748E]" /></span>
                        ) : (
                          <span title="Публичный"><Globe className="w-3 h-3 text-[#2E7D32]" /></span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] font-bold text-[#6B5B95] uppercase tracking-wider">
                      {ref.category}
                    </div>
                    <h4 className="text-xs font-bold text-[#2D2738] truncate mt-0.5">
                      {ref.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-[#EDE8F3] p-6 text-[#7E748E]">
              <Sparkles className="w-8 h-8 mx-auto text-[#B0A6C0] mb-2 opacity-50" />
              <h4 className="font-semibold text-sm text-[#2D2738]">Нет сохраненных референсов</h4>
              <p className="text-xs mt-1">
                Сохраняйте ориентиры и желаемые образы для будущих преображений
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: WANTS (Owner only) */}
      {activeTab === 'wants' && isOwner && (
        <div className="space-y-3">
          {activeWants.length > 0 ? (
            activeWants.map((want) => (
              <div
                key={want.id}
                className="bg-white rounded-3xl p-4 border border-[#EDE8F3] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF7EE] text-[#2E7D32]">
                    Ожидает визита
                  </span>
                  <span className="text-[11px] text-[#7E748E] tabular-nums">
                    {new Date(want.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="w-16 h-16 rounded-xl overflow-hidden bg-[#EDE8F3] shrink-0 cursor-pointer"
                    onClick={() => onSelectWork(want.work_id)}
                  >
                    <img
                      src={want.work_image || want.reference_image}
                      alt={want.work_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs text-[#7E748E] hover:text-[#6B5B95] cursor-pointer truncate"
                      onClick={() => navigateToUser(want.provider_user_id)}
                    >
                      Мастер: <span className="font-semibold text-[#2D2738]">{want.provider_name}</span>
                    </div>
                    <div
                      className="text-sm font-bold text-[#2D2738] truncate cursor-pointer hover:text-[#6B5B95] mt-0.5"
                      onClick={() => onSelectWork(want.work_id)}
                    >
                      {want.work_title}
                    </div>
                    <div className="text-xs text-[#7E748E] mt-0.5">
                      Референс: {want.reference_title}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EDE8F3] text-xs">
                  <span className="font-bold text-[#2D2738] tabular-nums">
                    {want.work_price.toLocaleString('ru-RU')} ₽ · {want.work_duration} мин
                  </span>
                  <span className="text-xs text-[#6B5B95] font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    В процессе
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-[#EDE8F3] p-6 text-[#7E748E]">
              <Clock className="w-8 h-8 mx-auto text-[#B0A6C0] mb-2" />
              <h4 className="font-semibold text-sm text-[#2D2738]">Нет активных желаний</h4>
              <p className="text-xs mt-1">
                Нажмите «ХОЧУ» на понравившейся работе в ленте, чтобы зафиксировать образ
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: HISTORY (Visits) */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {clientHistory.length > 0 ? (
            clientHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-4 border border-[#EDE8F3] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B5B95] bg-[#FAF8FD] px-2.5 py-0.5 rounded-full border border-[#EDE8F3]">
                    {item.date_formatted || item.performed_at?.slice(0, 10)}
                  </span>
                  {item.confirmed_by_client && (
                    <span className="text-[11px] font-semibold text-[#2E7D32] bg-[#EDF7ED] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Подтверждено
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={item.photo_url || item.reference_image}
                    alt={item.work_title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs text-[#7E748E] hover:text-[#6B5B95] cursor-pointer"
                      onClick={() => navigateToUser(item.provider_user_id)}
                    >
                      Мастер: <span className="font-semibold text-[#2D2738]">{item.provider_name}</span>
                    </div>
                    <div className="text-sm font-bold text-[#2D2738] truncate mt-0.5">
                      {item.work_title}
                    </div>
                    <div className="text-xs text-[#7E748E] mt-0.5">
                      Референс: {item.reference_title}
                    </div>
                    {item.note && (
                      <div className="text-[11px] text-[#6E6779] mt-1 italic">«{item.note}»</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EDE8F3]">
                  <span className="font-bold text-xs text-[#2D2738] tabular-nums">
                    {item.work_price.toLocaleString('ru-RU')} ₽ · {item.work_duration} мин
                  </span>
                  <Button
                    variant="want"
                    size="sm"
                    onClick={() => handleRepeatClick(item)}
                    className="gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Повторить
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-3xl border border-[#EDE8F3] p-6 text-[#7E748E]">
              <Calendar className="w-8 h-8 mx-auto text-[#B0A6C0] mb-2 opacity-50" />
              <h4 className="font-semibold text-sm text-[#2D2738]">История визитов пуста</h4>
              <p className="text-xs mt-1">Завершенные услуги будут фиксироваться здесь</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: EDUCATION (Certificates) */}
      {activeTab === 'education' && (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-4 rounded-3xl bg-white border border-[#EDE8F3] shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8FD] border border-[#EDE8F3] flex items-center justify-center text-[#6B5B95]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D2738]">{cert.course_title}</div>
                    <div className="text-[11px] text-[#7E748E]">{cert.school_name}</div>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#7E748E] bg-[#FAF8FD] px-2 py-0.5 rounded-full border border-[#EDE8F3]">
                  {cert.certificate_number}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EDE8F3] text-xs">
                <span className="text-[#7E748E]">
                  Выдан: {new Date(cert.issued_at).toLocaleDateString('ru-RU')}
                </span>
                {onVerifyCertificate && (
                  <button
                    onClick={() => onVerifyCertificate(cert.verification_token)}
                    className="text-[#6B5B95] font-semibold hover:underline flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Верифицировать
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-3xl bg-white border border-[#EDE8F3] shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar src={rev.client_avatar} name={rev.client_name} size="sm" />
                  <span className="text-xs font-bold text-[#2D2738]">{rev.client_name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#2D2738]">
                  <Star className="w-3.5 h-3.5 fill-[#E07A5F] text-[#E07A5F]" />
                  <span>{rev.rating}.0</span>
                </div>
              </div>
              <p className="text-xs text-[#554D63] leading-relaxed">{rev.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB: OWNED SCHOOLS */}
      {activeTab === 'school' && (
        <div className="space-y-3">
          {ownedSchools.map((sch) => (
            <div
              key={sch.id}
              onClick={() => onSelectSchool && onSelectSchool(sch.id)}
              className="p-4 rounded-3xl bg-white border border-[#EDE8F3] shadow-xs hover:border-[#6B5B95] transition-all cursor-pointer flex items-center gap-3.5"
            >
              <img src={sch.logo} alt={sch.name} className="w-12 h-12 rounded-2xl object-cover" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#2D2738]">{sch.name}</h4>
                <div className="text-xs text-[#7E748E] mt-0.5">
                  {sch.city} · {sch.graduates_count} выпускников
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7E748E]" />
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD / EDIT PROFESSION (CAPABILITY LAYER) */}
      <Modal
        isOpen={isAddProfessionOpen}
        onClose={() => setIsAddProfessionOpen(false)}
        title="Профессиональная специализация"
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#7E748E]">
            Укажите вашу профессию для активации профессионального слоя возможностей:
          </p>

          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Профессия</label>
            <select
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] bg-white text-xs"
            >
              <option value="Barber">Barber / Мужской мастер</option>
              <option value="Nail Artist">Nail Artist / Мастер маникюра</option>
              <option value="Brow & Lash Artist">Brow & Lash Artist / Брови & Ресницы</option>
              <option value="Colorist">Colorist / Колорист</option>
              <option value="Cosmetologist">Cosmetologist / Косметолог</option>
              <option value="Makeup Artist">Makeup Artist / Визажист</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">
              Профессиональный заголовок
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Top Barber & Educator"
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Город</label>
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">
              Специализации (через запятую)
            </label>
            <input
              type="text"
              value={customSpecializations}
              onChange={(e) => setCustomSpecializations(e.target.value)}
              placeholder="Fade, Кроп, Борода"
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">
              Ссылка для записи (Telegram / Dikidi / WhatsApp)
            </label>
            <input
              type="text"
              value={customBookingUrl}
              onChange={(e) => setCustomBookingUrl(e.target.value)}
              placeholder="https://t.me/..."
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setIsAddProfessionOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="want" size="sm" fullWidth onClick={handleSaveProfession}>
              Активировать
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: EDIT PLACE */}
      <Modal
        isOpen={isEditPlaceOpen}
        onClose={() => setIsEditPlaceOpen(false)}
        title="Место работы"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Название места</label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Город</label>
            <input
              type="text"
              value={placeCity}
              onChange={(e) => setPlaceCity(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Адрес</label>
            <input
              type="text"
              value={placeAddress}
              onChange={(e) => setPlaceAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>
          <div className="pt-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setIsEditPlaceOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="want" size="sm" fullWidth onClick={handleSavePlace}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: EDIT BOOKING */}
      <Modal
        isOpen={isEditBookingOpen}
        onClose={() => setIsEditBookingOpen(false)}
        title="Канал прямой записи"
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Тип канала</label>
            <select
              value={bookingType}
              onChange={(e: any) => setBookingType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] bg-white text-xs"
            >
              <option value="external">Внешний сайт</option>
              <option value="dikidi">DIKIDI</option>
              <option value="telegram">Telegram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Телефон</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">URL ссылки</label>
            <input
              type="text"
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Текст на кнопке</label>
            <input
              type="text"
              value={bookingLabel}
              onChange={(e) => setBookingLabel(e.target.value)}
              placeholder="Записаться"
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>
          <div className="pt-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setIsEditBookingOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="want" size="sm" fullWidth onClick={handleSaveBooking}>
              Сохранить
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: TODAY'S WORK (Client Visit Log) */}
      <Modal
        isOpen={isTodayWorkOpen}
        onClose={() => setIsTodayWorkOpen(false)}
        title="Зафиксировать визит клиента [Today's Work]"
      >
        <form onSubmit={handleSubmitTodayWork} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Клиент</label>
            <select
              value={todayClient}
              onChange={(e) => setTodayClient(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] bg-white text-xs"
            >
              <option value="usr_anna">Анна Романова</option>
              <option value="usr_roman">Роман Белов</option>
              <option value="usr_elena">Елена Соколова</option>
              <option value="usr_alexei">Алексей Морозов</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">
              Название выполненной услуги
            </label>
            <input
              type="text"
              value={todayTitle}
              onChange={(e) => setTodayTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Стоимость (₽)</label>
              <input
                type="number"
                value={todayPrice}
                onChange={(e) => setTodayPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#2D2738] mb-1">
                Длительность (мин)
              </label>
              <input
                type="number"
                value={todayDuration}
                onChange={(e) => setTodayDuration(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D2738] mb-1">Заметка о работе</label>
            <textarea
              value={todayNote}
              onChange={(e) => setTodayNote(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl border border-[#EDE8F3] text-xs"
            />
          </div>

          <div className="pt-2 border-t border-[#EDE8F3] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={todaySaveToHistory}
                onChange={(e) => setTodaySaveToHistory(e.target.checked)}
                className="rounded text-[#6B5B95]"
              />
              <span className="text-[11px] text-[#2D2738]">
                Сохранить в истории клиента (позволяет клиенту повторить услугу)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={todayPublishPhoto}
                onChange={(e) => setTodayPublishPhoto(e.target.checked)}
                className="rounded text-[#6B5B95]"
              />
              <span className="text-[11px] text-[#2D2738]">
                Запросить согласие клиента на публикацию фото в портфолио
              </span>
            </label>
          </div>

          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setIsTodayWorkOpen(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="want"
              size="sm"
              fullWidth
              disabled={submittingTodayWork}
            >
              {submittingTodayWork ? 'Сохранение...' : 'Зафиксировать'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
