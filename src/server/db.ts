/**
 * Relational In-Memory Database for BE&MOON
 * Pure "One Person = One User" Architecture
 *
 * Concepts:
 * - NO db.masters or db.clients tables exist.
 * - All persons are Users stored in `db.users`.
 * - Professional specialization is a capability layer (`user.professional`).
 * - Work belongs to User (`author_id`).
 * - Place belongs to User (`owner_id`).
 * - Follow connects User to User (`follower_id` -> `followed_user_id`).
 * - Client History records service relationships between Users (`client_user_id` <-> `provider_user_id`).
 * - Wants record service requests between Users (`client_user_id` -> `provider_user_id`).
 */

import {
  User,
  Place,
  ProfessionalHistoryItem,
  Reference,
  Work,
  Follow,
  WantRequest,
  Review,
  Notification,
  DomainEvent,
  DomainEventType,
  School,
  Course,
  Enrollment,
  Certificate,
  SchoolPost,
  AuditLog,
  ClientHistoryItem,
  WorkConsentRequest,
} from '../types/domain';

class Database {
  users: Map<string, User> = new Map();
  places: Map<string, Place> = new Map();
  professionalHistories: Map<string, ProfessionalHistoryItem> = new Map();
  references: Map<string, Reference> = new Map();
  works: Map<string, Work> = new Map();
  follows: Map<string, Follow> = new Map(); // key: `${follower_id}:${followed_user_id}`
  wantRequests: Map<string, WantRequest> = new Map();
  reviews: Map<string, Review> = new Map();
  notifications: Map<string, Notification> = new Map();
  events: DomainEvent[] = [];
  schools: Map<string, School> = new Map();
  courses: Map<string, Course> = new Map();
  enrollments: Map<string, Enrollment> = new Map();
  certificates: Map<string, Certificate> = new Map();
  schoolPosts: Map<string, SchoolPost> = new Map();
  auditLogs: AuditLog[] = [];
  clientHistories: Map<string, ClientHistoryItem> = new Map();
  workConsents: Map<string, WorkConsentRequest> = new Map();

  constructor() {
    this.seed();
  }

  // --- Audit Logger ---
  logAudit(
    actor_id: string,
    actor_name: string,
    action: string,
    entity_type: string,
    entity_id: string,
    old_value?: any,
    new_value?: any,
    reason?: string
  ): AuditLog {
    const entry: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      actor_id,
      actor_name,
      action,
      entity_type,
      entity_id,
      old_value,
      new_value,
      reason,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  // --- Event Logger ---
  logEvent(
    actor_id: string,
    entity_type: string,
    entity_id: string,
    event_type: DomainEventType,
    metadata: Record<string, any> = {}
  ): DomainEvent {
    const event: DomainEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      actor_id,
      entity_type,
      entity_id,
      event_type,
      metadata,
      created_at: new Date().toISOString(),
    };
    this.events.unshift(event);
    return event;
  }

  // --- Notification Helper ---
  createNotification(
    user_id: string,
    type: Notification['type'],
    title: string,
    message: string,
    entity_type: Notification['entity_type'],
    entity_id: string,
    metadata: Record<string, any> = {}
  ): Notification {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      user_id,
      type,
      title,
      message,
      entity_type,
      entity_id,
      is_read: false,
      metadata,
      created_at: new Date().toISOString(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  seed() {
    // 1. Users
    const userAlexei: User = {
      id: 'usr_alexei',
      email: 'alexei.barber@bemoon.app',
      phone: '+7 999 123-45-67',
      name: 'Алексей Морозов',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=75',
      bio: 'Барбер с 8-летним стажем. Специализируюсь на текстурных стрижках и чистом фейде.',
      followers_count: 1284,
      has_school: true,
      created_at: '2025-01-10T10:00:00Z',
    };

    const userElena: User = {
      id: 'usr_elena',
      email: 'elena.nails@bemoon.app',
      phone: '+7 999 234-56-78',
      name: 'Елена Соколова',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=75',
      bio: 'Nail-кутюрье. Эстетика минимализма, японский маникюр, чистые формы.',
      followers_count: 2450,
      has_school: false,
      created_at: '2025-01-15T11:30:00Z',
    };

    const userSofia: User = {
      id: 'usr_sofia',
      email: 'sofia.brows@bemoon.app',
      phone: '+7 999 345-67-89',
      name: 'София Ветрова',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=75',
      bio: 'Ламимейкер & brow artist. Натуральность, деликатная коррекция, здоровый блеск.',
      followers_count: 890,
      has_school: false,
      created_at: '2025-02-01T09:15:00Z',
    };

    const userAnna: User = {
      id: 'usr_anna',
      email: 'anna.client@bemoon.app',
      phone: '+7 999 876-54-32',
      name: 'Анна Романова',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=75',
      bio: 'Ищу вдохновение и проверенных мастеров, ценящих аккуратность и стиль.',
      followers_count: 84,
      has_school: false,
      created_at: '2025-02-10T14:00:00Z',
    };

    const userRoman: User = {
      id: 'usr_roman',
      email: 'roman.client@bemoon.app',
      phone: '+7 999 765-43-21',
      name: 'Роман Белов',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=75',
      bio: 'Ценю время и форму стрижки, которая держится больше месяца.',
      followers_count: 42,
      has_school: false,
      created_at: '2025-02-12T16:20:00Z',
    };

    const userAcademy: User = {
      id: 'usr_academy',
      email: 'valeria@bemoon.academy',
      phone: '+7 999 555-44-33',
      name: 'Валерия Родионова',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=75',
      bio: 'Основатель BE&MOON Academy, международный судья и куратор курсов высшего мастерства.',
      followers_count: 3120,
      has_school: true,
      created_at: '2024-01-01T00:00:00Z',
    };

    // 2. Places (Owned by Users)
    const placeAlexei: Place = {
      id: 'plc_alexei_1',
      owner_id: userAlexei.id,
      place_name: 'Studio Chop-Chop',
      city: 'Москва',
      address: 'ул. Большая Никитская, 14',
      booking_url: 'https://dikidi.net/ru/profile/chop-chop-nikitskaya',
      is_current: true,
      created_at: '2025-01-10T10:00:00Z',
    };

    const placeElena: Place = {
      id: 'plc_elena_1',
      owner_id: userElena.id,
      place_name: 'Moon Nail Lab',
      city: 'Москва',
      address: 'Покровский бульвар, 8',
      booking_url: 'https://t.me/elena_sokolova_nails',
      is_current: true,
      created_at: '2025-01-15T11:30:00Z',
    };

    const placeSofia: Place = {
      id: 'plc_sofia_1',
      owner_id: userSofia.id,
      place_name: 'Sfera Beauty Space',
      city: 'Санкт-Петербург',
      address: 'Каменноостровский пр-т, 26',
      booking_url: 'https://wa.me/79993456789',
      is_current: true,
      created_at: '2025-02-01T09:15:00Z',
    };

    [placeAlexei, placeElena, placeSofia].forEach((p) => this.places.set(p.id, p));

    // 3. Professional History Items (Owned by Users)
    const historyAlexei: ProfessionalHistoryItem[] = [
      {
        id: 'hist_alexei_1',
        user_id: userAlexei.id,
        period: '2024 — наст. время',
        place_name: 'Studio Chop-Chop',
        city: 'Москва',
        role_title: 'Senior Barber',
        is_current: true,
        created_at: '2024-03-01T00:00:00Z',
      },
      {
        id: 'hist_alexei_2',
        user_id: userAlexei.id,
        period: '2022 — 2024',
        place_name: 'Boy Cut Flacon',
        city: 'Москва',
        role_title: 'Top Barber',
        is_current: false,
        created_at: '2022-01-15T00:00:00Z',
      },
      {
        id: 'hist_alexei_3',
        user_id: userAlexei.id,
        period: '2019 — 2022',
        place_name: 'OldBoy Barbershop',
        city: 'Казань',
        role_title: 'Barber & Educator',
        is_current: false,
        created_at: '2019-09-01T00:00:00Z',
      },
    ];

    const historyElena: ProfessionalHistoryItem[] = [
      {
        id: 'hist_elena_1',
        user_id: userElena.id,
        period: '2025 — наст. время',
        place_name: 'Moon Nail Lab',
        city: 'Москва',
        role_title: 'Основатель & Nail-стилист',
        is_current: true,
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'hist_elena_2',
        user_id: userElena.id,
        period: '2022 — 2024',
        place_name: 'Mahash Spa & Nails',
        city: 'Москва',
        role_title: 'Мастер премиум-сервиса',
        is_current: false,
        created_at: '2022-04-01T00:00:00Z',
      },
    ];

    const historySofia: ProfessionalHistoryItem[] = [
      {
        id: 'hist_sofia_1',
        user_id: userSofia.id,
        period: '2024 — наст. время',
        place_name: 'Sfera Beauty Space',
        city: 'Санкт-Петербург',
        role_title: 'Ведущий Brow & Lash мастер',
        is_current: true,
        created_at: '2024-01-10T00:00:00Z',
      },
      {
        id: 'hist_sofia_2',
        user_id: userSofia.id,
        period: '2021 — 2023',
        place_name: 'Brow Bar Moscow',
        city: 'Москва',
        role_title: 'Brow Artist',
        is_current: false,
        created_at: '2021-08-01T00:00:00Z',
      },
    ];

    [...historyAlexei, ...historyElena, ...historySofia].forEach((h) =>
      this.professionalHistories.set(h.id, h)
    );

    // 4. Attach Professional Capability Layer to Users with Beauty Professions
    userAlexei.professional = {
      profession: 'Barber',
      title: 'Top Barber & Educator',
      city: 'Москва',
      place: placeAlexei,
      booking_destination: {
        type: 'dikidi',
        url: 'https://dikidi.net/ru/profile/chop-chop-nikitskaya',
        label: 'Записаться в Dikidi',
      },
      specializations: ['Кроп', 'Low Fade', 'Taper', 'Борода', 'Классика'],
      professional_history: historyAlexei,
    };

    userElena.professional = {
      profession: 'Nail Artist',
      title: 'Мастер японского эко-маникюра',
      city: 'Москва',
      place: placeElena,
      booking_destination: {
        type: 'telegram',
        url: 'https://t.me/elena_sokolova_nails',
        label: 'Написать в Telegram',
      },
      specializations: ['Glazed Chrome', 'Японский маникюр', 'Миндаль', 'Нюд'],
      professional_history: historyElena,
    };

    userSofia.professional = {
      profession: 'Brow & Lash Artist',
      title: 'Эксперт натурального взгляда',
      city: 'Санкт-Петербург',
      place: placeSofia,
      booking_destination: {
        type: 'whatsapp',
        url: 'https://wa.me/79993456789?text=Здравствуйте,%20хочу%20записаться%20через%20BE&MOON',
        label: 'Написать в WhatsApp',
      },
      specializations: ['Ламинирование ресниц', 'Пудровые брови', 'Осветление', 'Макияж без макияжа'],
      professional_history: historySofia,
    };

    userAcademy.professional = {
      profession: 'Art Director',
      title: 'Главный куратор BE&MOON Academy',
      city: 'Москва',
      booking_destination: {
        type: 'external',
        url: 'https://bemoon.academy/admissions',
        label: 'Поступить в Академию',
      },
      specializations: ['Колористика', 'Стрижки & Барбер', 'Nail-кутюрье'],
      professional_history: [],
    };

    // Save users
    [userAlexei, userElena, userSofia, userAnna, userRoman, userAcademy].forEach((u) =>
      this.users.set(u.id, u)
    );

    // 5. References (Desires / Inspiration - Owned by User)
    const ref1: Reference = {
      id: 'ref_crop',
      author_id: userRoman.id,
      author_name: userRoman.name,
      source_type: 'curated',
      source_url: 'https://editorial-archive.com/hair/textured-crop-2026',
      title: 'Текстурный кроп с мягким переходом (Mid Fade)',
      category: 'Стрижки & Барбер',
      tags: ['Кроп', 'Mid Fade', 'Текстура', 'Короткая стрижка'],
      media: [
        {
          id: 'med_ref1_1',
          owner_id: userRoman.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=240&q=75',
          width: 1200,
          height: 900,
          mime_type: 'image/jpeg',
          alt: 'Текстурный кроп с четким контуром и градиентом фейд',
          fallback_color: '#38302B',
        },
      ],
      created_at: '2025-02-14T10:00:00Z',
    };

    const ref2: Reference = {
      id: 'ref_chrome',
      author_id: userAnna.id,
      author_name: userAnna.name,
      source_type: 'user_upload',
      source_url: 'https://be-moon.app/ref/chrome-milky',
      title: 'Glazed Milky Chrome на мягкий овал',
      category: 'Ногти & Маникюр',
      tags: ['Glazed', 'Chrome', 'Молочный', 'Минимализм'],
      media: [
        {
          id: 'med_ref2_1',
          owner_id: userAnna.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=240&q=75',
          width: 1200,
          height: 900,
          mime_type: 'image/jpeg',
          alt: 'Молочный маникюр с деликатной жемчужной втиркой',
          fallback_color: '#E8DED2',
        },
      ],
      created_at: '2025-02-15T12:00:00Z',
    };

    const ref3: Reference = {
      id: 'ref_brows',
      author_id: userSofia.id,
      author_name: userSofia.name,
      source_type: 'user_upload',
      source_url: 'https://be-moon.app/ref/feather-brows',
      title: 'Воздушная ламинация бровей с сохранением природной плотности',
      category: 'Брови & Ресницы',
      tags: ['Ламинирование', 'Натуральные брови', 'Укладка', 'Dewy look'],
      media: [
        {
          id: 'med_ref3_1',
          owner_id: userSofia.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=240&q=75',
          width: 1200,
          height: 900,
          mime_type: 'image/jpeg',
          alt: 'Натурально уложенные пушистые брови и сияющая кожа',
          fallback_color: '#CBBBAA',
        },
      ],
      created_at: '2025-02-16T14:30:00Z',
    };

    const ref4: Reference = {
      id: 'ref_butterfly',
      author_id: userAlexei.id,
      author_name: userAlexei.name,
      source_type: 'curated',
      source_url: 'https://editorial-archive.com/hair/layers-90s',
      title: 'Объемные слои в стиле 90-х с челкой-шторкой',
      category: 'Стрижки & Барбер',
      tags: ['Слои', 'Челка-шторка', 'Объем', 'Брашинг'],
      media: [
        {
          id: 'med_ref4_1',
          owner_id: userAlexei.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=240&q=75',
          width: 1200,
          height: 900,
          mime_type: 'image/jpeg',
          alt: 'Воздушная слоистая стрижка с мягкими локонами у лица',
          fallback_color: '#4A3B32',
        },
      ],
      created_at: '2025-02-18T09:00:00Z',
    };

    [ref1, ref2, ref3, ref4].forEach((r) => this.references.set(r.id, r));

    // 6. Works (Real Executions - Owned by User)
    const work1: Work = {
      id: 'wrk_crop_alexei_1',
      author_id: userAlexei.id,
      author_name: userAlexei.name,
      author_profession: userAlexei.professional?.profession,
      author_avatar: userAlexei.avatar,
      reference_id: ref1.id,
      reference_title: ref1.title,
      reference_image: ref1.media[0]?.url || ref1.media[0]?.thumbnail_url,
      before_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=720&q=75',
      after_image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=720&q=75',
      rating: 4.9,
      distance_km: 2.4,
      client_user_id: userRoman.id,
      client_name: userRoman.name,
      performed_at: '2026-09-18T12:00:00Z',
      title: 'Текстурный кроп',
      description: 'Выполнено на густой прямой волос. Сделан мягкий Mid Skin Fade, текстура проработана слайсингом. Укладка матовой глиной.',
      category: 'Стрижки & Барбер',
      specializations: ['Кроп', 'Mid Fade', 'Борода'],
      price: 2500,
      duration: 50,
      status: 'published',
      consent_status: 'granted',
      confirmed_by_client: true,
      media: [
        {
          id: 'med_w1_1',
          owner_id: userAlexei.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Вид сбоку: переход фейда и четкая линия виска',
        },
        {
          id: 'med_w1_2',
          owner_id: userAlexei.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Вид сверху: объемная текстура кропа',
        },
      ],
      created_at: '2025-02-14T15:00:00Z',
      updated_at: '2025-02-14T15:00:00Z',
    };

    const work2: Work = {
      id: 'wrk_crop_alexei_2',
      author_id: userAlexei.id,
      author_name: userAlexei.name,
      author_profession: userAlexei.professional?.profession,
      author_avatar: userAlexei.avatar,
      reference_id: ref1.id,
      reference_title: ref1.title,
      reference_image: ref1.media[0]?.url || ref1.media[0]?.thumbnail_url,
      before_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=75',
      after_image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=720&q=75',
      rating: 5.0,
      distance_km: 1.8,
      is_portfolio_model: true,
      title: 'Мужской полубокс',
      description: 'Чистый Taper Fade без утяжеления затылка. Ищу модель для контента портфолио.',
      category: 'Стрижки & Барбер',
      specializations: ['Полубокс', 'Taper'],
      price: 0,
      duration: 45,
      status: 'published',
      media: [
        {
          id: 'med_w2_1',
          owner_id: userAlexei.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Работа Алексея: полубокс с естественной челкой',
        },
      ],
      created_at: '2025-02-16T11:00:00Z',
      updated_at: '2025-02-16T11:00:00Z',
    };

    const work3: Work = {
      id: 'wrk_chrome_elena_1',
      author_id: userElena.id,
      author_name: userElena.name,
      author_profession: userElena.professional?.profession,
      author_avatar: userElena.avatar,
      reference_id: ref2.id,
      reference_title: ref2.title,
      reference_image: ref2.media[0]?.url || ref2.media[0]?.thumbnail_url,
      before_image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=720&q=75',
      after_image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=720&q=75',
      rating: 5.0,
      distance_km: 3.1,
      client_user_id: userAnna.id,
      client_name: userAnna.name,
      performed_at: '2026-09-23T14:00:00Z',
      title: 'Glazed Donut (Хайли Бибер)',
      description: 'Аппаратный маникюр без режущих инструментов. Выравнивание базой, полупрозрачный нюд и жемчужная пудра.',
      category: 'Ногти & Маникюр',
      specializations: ['Glazed Chrome', 'Миндаль'],
      price: 3200,
      duration: 75,
      status: 'published',
      consent_status: 'granted',
      confirmed_by_client: true,
      media: [
        {
          id: 'med_w3_1',
          owner_id: userElena.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Реальная работа: глянцевый блик и безупречная кутикула',
        },
        {
          id: 'med_w3_2',
          owner_id: userElena.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Деталь блика при дневном свете',
        },
      ],
      created_at: '2025-02-15T16:00:00Z',
      updated_at: '2025-02-15T16:00:00Z',
    };

    const work4: Work = {
      id: 'wrk_brows_sofia_1',
      author_id: userSofia.id,
      author_name: userSofia.name,
      author_profession: userSofia.professional?.profession,
      author_avatar: userSofia.avatar,
      reference_id: ref3.id,
      reference_title: ref3.title,
      reference_image: ref3.media[0]?.url || ref3.media[0]?.thumbnail_url,
      before_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=720&q=75',
      after_image: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=720&q=75',
      rating: 4.8,
      distance_km: 1.5,
      title: 'Ламинирование бровей',
      description: 'Составы на основе аминокислот без пересушивания волоска. Коррекция воском и пинцетом по естественной анатомии.',
      category: 'Брови & Ресницы',
      specializations: ['Ламинирование', 'Пудровые брови'],
      price: 2800,
      duration: 60,
      status: 'published',
      media: [
        {
          id: 'med_w4_1',
          owner_id: userSofia.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Результат работы: ухоженные, естественно направленные брови',
        },
      ],
      created_at: '2025-02-17T13:00:00Z',
      updated_at: '2025-02-17T13:00:00Z',
    };

    const work5: Work = {
      id: 'wrk_fade_alexei_3',
      author_id: userAlexei.id,
      author_name: userAlexei.name,
      author_profession: userAlexei.professional?.profession,
      author_avatar: userAlexei.avatar,
      reference_id: ref1.id,
      reference_title: ref1.title,
      reference_image: ref1.media[0]?.url || ref1.media[0]?.thumbnail_url,
      before_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=720&q=75',
      after_image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=720&q=75',
      rating: 4.9,
      distance_km: 2.4,
      title: 'Low Fade',
      description: 'Низкий чистый фейд с сохранением массы на макушке.',
      category: 'Стрижки & Барбер',
      specializations: ['Low Fade', 'Фейд'],
      price: 2600,
      duration: 50,
      status: 'published',
      media: [
        {
          id: 'med_w5_1',
          owner_id: userAlexei.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Низкий скин фейд',
        },
      ],
      created_at: '2025-02-18T10:00:00Z',
      updated_at: '2025-02-18T10:00:00Z',
    };

    const work6: Work = {
      id: 'wrk_model_elena_2',
      author_id: userElena.id,
      author_name: userElena.name,
      author_profession: userElena.professional?.profession,
      author_avatar: userElena.avatar,
      reference_id: ref2.id,
      reference_title: ref2.title,
      reference_image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=720&q=75',
      before_image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=720&q=75',
      after_image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=720&q=75',
      rating: 4.9,
      distance_km: 3.1,
      is_portfolio_model: true,
      title: 'Японский эко-маникюр',
      description: 'Полировка минеральной пастой и пчелиным воском. Ищу модель для фотосъемки.',
      category: 'Ногти & Маникюр',
      specializations: ['Японский маникюр', 'Глянец'],
      price: 0,
      duration: 60,
      status: 'published',
      media: [
        {
          id: 'med_w6_1',
          owner_id: userElena.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Эко-маникюр для портфолио',
        },
      ],
      created_at: '2025-02-19T11:00:00Z',
      updated_at: '2025-02-19T11:00:00Z',
    };

    const work7: Work = {
      id: 'wrk_lashes_sofia_2',
      author_id: userSofia.id,
      author_name: userSofia.name,
      author_profession: userSofia.professional?.profession,
      author_avatar: userSofia.avatar,
      reference_id: '',
      before_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=720&q=75',
      after_image: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=720&q=75',
      rating: 4.9,
      distance_km: 1.5,
      title: 'Ламинирование ресниц',
      description: 'Глубокий изгиб L-завиток и кератиновое наполнение волосков.',
      category: 'Брови & Ресницы',
      specializations: ['Ламинирование ресниц', 'Lash Lift'],
      price: 2500,
      duration: 50,
      status: 'published',
      media: [
        {
          id: 'med_w7_1',
          owner_id: userSofia.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Ламинирование ресниц результат',
        },
      ],
      created_at: '2025-02-20T14:00:00Z',
      updated_at: '2025-02-20T14:00:00Z',
    };

    const work8: Work = {
      id: 'wrk_taper_alexei_4',
      author_id: userAlexei.id,
      author_name: userAlexei.name,
      author_profession: userAlexei.professional?.profession,
      author_avatar: userAlexei.avatar,
      reference_id: '',
      after_image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=720&q=75',
      rating: 4.8,
      distance_km: 2.4,
      title: 'Классический Taper',
      description: 'Легкий тейпер по височной зоне и затылку без потери длины.',
      category: 'Стрижки & Барбер',
      specializations: ['Taper', 'Классика'],
      price: 2400,
      duration: 40,
      status: 'published',
      media: [
        {
          id: 'med_w8_1',
          owner_id: userAlexei.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 1000,
          mime_type: 'image/jpeg',
          alt: 'Классический Taper результат',
        },
      ],
      created_at: '2025-02-21T16:00:00Z',
      updated_at: '2025-02-21T16:00:00Z',
    };

    [work1, work2, work3, work4, work5, work6, work7, work8].forEach((w) => this.works.set(w.id, w));

    // 7. Follows (User follows User directly)
    const followsList: Follow[] = [
      { id: 'flw_1', follower_id: userAnna.id, followed_user_id: userAlexei.id, created_at: '2025-02-12T10:00:00Z' },
      { id: 'flw_2', follower_id: userAnna.id, followed_user_id: userElena.id, created_at: '2025-02-13T11:00:00Z' },
      { id: 'flw_3', follower_id: userAlexei.id, followed_user_id: userElena.id, created_at: '2025-02-14T12:00:00Z' },
      { id: 'flw_4', follower_id: userElena.id, followed_user_id: userAlexei.id, created_at: '2025-02-15T13:00:00Z' },
      { id: 'flw_5', follower_id: userRoman.id, followed_user_id: userAlexei.id, created_at: '2025-02-16T14:00:00Z' },
    ];
    followsList.forEach((f) => this.follows.set(`${f.follower_id}:${f.followed_user_id}`, f));

    // 8. Want Requests (Client User wants a result from Provider User)
    const want1: WantRequest = {
      id: 'wnt_initial_1',
      client_user_id: userAnna.id,
      client_name: userAnna.name,
      client_avatar: userAnna.avatar,
      client_contact: '+7 999 876-54-32 (Telegram: @anna_rom)',
      client_note: 'Хочу аккуратный миндаль и такой же жемчужный блик в субботу',
      provider_user_id: userElena.id,
      provider_name: userElena.name,
      reference_id: ref2.id,
      reference_title: ref2.title,
      reference_image: ref2.media[0]?.thumbnail_url,
      work_id: work3.id,
      work_title: work3.title,
      work_price: work3.price,
      work_duration: work3.duration,
      work_image: work3.media[0]?.thumbnail_url,
      status: 'completed',
      has_review: true,
      completed_work_id: work3.id,
      completed_at: '2026-09-23T14:00:00Z',
      repeat_count: 1,
      created_at: '2025-02-18T10:00:00Z',
      updated_at: '2025-02-19T14:00:00Z',
    };
    this.wantRequests.set(want1.id, want1);
    work3.want_request_id = want1.id;

    // 9. Reviews
    const review1: Review = {
      id: 'rev_initial_1',
      client_user_id: userAnna.id,
      client_name: userAnna.name,
      client_avatar: userAnna.avatar,
      provider_user_id: userElena.id,
      want_request_id: want1.id,
      rating: 5,
      text: 'Елена сделала точно так, как на референсе! Никакой толщины, покрытие носилось идеально 3 недели.',
      status: 'published',
      created_at: '2025-02-19T15:00:00Z',
    };
    this.reviews.set(review1.id, review1);

    // 10. Client History Items (Service Relationships Between Users)
    // Anna with Elena
    const histAnna1: ClientHistoryItem = {
      id: 'hist_cli_anna_1',
      client_user_id: userAnna.id,
      provider_user_id: userElena.id,
      provider_name: userElena.name,
      provider_profession: userElena.professional?.profession,
      provider_avatar: userElena.avatar,
      provider_city: userElena.professional?.city,
      provider_booking: userElena.professional?.booking_destination!,
      work_id: work3.id,
      work_title: 'Nude Almond (Хайли Бибер Glazed Donut)',
      work_price: work3.price,
      work_duration: work3.duration,
      photo_url: work3.media[0].url,
      reference_id: ref2.id,
      reference_title: ref2.title,
      reference_image: ref2.media[0]?.thumbnail_url,
      performed_at: '2026-09-23T14:00:00Z',
      date_formatted: '23.09',
      consent_status: 'granted',
      confirmed_by_client: true,
      can_repeat: true,
      want_request_id: want1.id,
      note: 'Мягкий овал, жемчужная пудра без утолщения',
      created_at: '2026-09-23T14:30:00Z',
    };

    const histAnna2: ClientHistoryItem = {
      id: 'hist_cli_anna_2',
      client_user_id: userAnna.id,
      provider_user_id: userElena.id,
      provider_name: userElena.name,
      provider_profession: userElena.professional?.profession,
      provider_avatar: userElena.avatar,
      provider_city: userElena.professional?.city,
      provider_booking: userElena.professional?.booking_destination!,
      work_id: 'wrk_french_prev',
      work_title: 'French (Жемчужный втирочный френч)',
      work_price: 2900,
      work_duration: 75,
      photo_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=720&q=75',
      reference_id: 'ref_ext_2',
      reference_title: 'Жемчужный втирочный френч на идеальный миндаль',
      reference_image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=240&q=75',
      performed_at: '2026-08-05T12:00:00Z',
      date_formatted: '05.08',
      consent_status: 'granted',
      confirmed_by_client: true,
      can_repeat: true,
      note: 'Классическая улыбка, каучуковая база',
      created_at: '2026-08-05T13:00:00Z',
    };

    const histAnna3: ClientHistoryItem = {
      id: 'hist_cli_anna_3',
      client_user_id: userAnna.id,
      provider_user_id: userElena.id,
      provider_name: userElena.name,
      provider_profession: userElena.professional?.profession,
      provider_avatar: userElena.avatar,
      provider_city: userElena.professional?.city,
      provider_booking: userElena.professional?.booking_destination!,
      work_id: 'wrk_square_prev',
      work_title: 'Short Square (Глубокий винный оттенок)',
      work_price: 2700,
      work_duration: 70,
      photo_url: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=720&q=75',
      reference_id: 'ref_ext_12',
      reference_title: 'Глубокий винный оттенок на коротких ногтях с мягким квадратом',
      reference_image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=240&q=75',
      performed_at: '2026-06-28T16:00:00Z',
      date_formatted: '28.06',
      consent_status: 'granted',
      confirmed_by_client: true,
      can_repeat: true,
      note: 'Мягкий квадрат, Luxio бордо',
      created_at: '2026-06-28T17:00:00Z',
    };

    // User Alexei (Barber) is simultaneously a Client of User Elena (Nail Artist)
    const histAlexei1: ClientHistoryItem = {
      id: 'hist_cli_alexei_1',
      client_user_id: userAlexei.id,
      provider_user_id: userElena.id,
      provider_name: userElena.name,
      provider_profession: userElena.professional?.profession,
      provider_avatar: userElena.avatar,
      provider_city: userElena.professional?.city,
      provider_booking: userElena.professional?.booking_destination!,
      work_id: 'wrk_masura_alexei',
      work_title: 'Японский эко-маникюр без покрытия',
      work_price: 2500,
      work_duration: 60,
      photo_url: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=720&q=75',
      reference_id: 'ref_ext_17',
      reference_title: 'Японский эко-маникюр Masura без химического покрытия',
      reference_image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=240&q=75',
      performed_at: '2026-09-14T15:00:00Z',
      date_formatted: '14.09',
      consent_status: 'granted',
      confirmed_by_client: true,
      can_repeat: true,
      note: 'Чистый уход для рук мастера перед съемками',
      created_at: '2026-09-14T16:00:00Z',
    };

    // User Elena (Nail Artist) is simultaneously a Client of User Alexei (Barber)
    const histElena1: ClientHistoryItem = {
      id: 'hist_cli_elena_1',
      client_user_id: userElena.id,
      provider_user_id: userAlexei.id,
      provider_name: userAlexei.name,
      provider_profession: userAlexei.professional?.profession,
      provider_avatar: userAlexei.avatar,
      provider_city: userAlexei.professional?.city,
      provider_booking: userAlexei.professional?.booking_destination!,
      work_id: 'wrk_butterfly_elena',
      work_title: 'Объемные слои в стиле 90-х с челкой-шторкой',
      work_price: 3500,
      work_duration: 60,
      photo_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=720&q=75',
      reference_id: ref4.id,
      reference_title: ref4.title,
      reference_image: ref4.media[0]?.thumbnail_url,
      performed_at: '2026-09-10T11:00:00Z',
      date_formatted: '10.09',
      consent_status: 'granted',
      confirmed_by_client: true,
      can_repeat: true,
      note: 'Воздушные слои на брашинг',
      created_at: '2026-09-10T12:00:00Z',
    };

    // User Roman is a Client of User Alexei
    const histRoman1: ClientHistoryItem = {
      id: 'hist_cli_roman_1',
      client_user_id: userRoman.id,
      provider_user_id: userAlexei.id,
      provider_name: userAlexei.name,
      provider_profession: userAlexei.professional?.profession,
      provider_avatar: userAlexei.avatar,
      provider_city: userAlexei.professional?.city,
      provider_booking: userAlexei.professional?.booking_destination!,
      work_id: work1.id,
      work_title: work1.title,
      work_price: work1.price,
      work_duration: work1.duration,
      photo_url: work1.media[0].url,
      reference_id: ref1.id,
      reference_title: ref1.title,
      reference_image: ref1.media[0]?.thumbnail_url,
      performed_at: '2026-09-18T12:00:00Z',
      date_formatted: '18.09',
      consent_status: 'granted',
      confirmed_by_client: true,
      can_repeat: true,
      note: 'Mid fade, укладка матовой глиной',
      created_at: '2026-09-18T13:00:00Z',
    };

    [histAnna1, histAnna2, histAnna3, histAlexei1, histElena1, histRoman1].forEach((h) =>
      this.clientHistories.set(h.id, h)
    );

    // 11. Publication Consent Request (Client User <-> Provider User)
    const workPendingConsent: Work = {
      id: 'wrk_pending_consent_1',
      author_id: userAlexei.id,
      author_name: userAlexei.name,
      author_profession: userAlexei.professional?.profession,
      author_avatar: userAlexei.avatar,
      reference_id: ref1.id,
      reference_title: ref1.title,
      reference_image: ref1.media[0]?.thumbnail_url,
      client_user_id: userRoman.id,
      client_name: userRoman.name,
      performed_at: '2026-09-23T08:00:00Z',
      title: 'Low Skin Fade с четкой окантовкой бороды',
      description: 'Чистый дымчатый переход с распариванием горячим полотенцем. Укладка пастой.',
      category: 'Стрижки & Барбер',
      specializations: ['Low Fade', 'Борода'],
      price: 2800,
      duration: 50,
      status: 'pending_consent',
      consent_status: 'pending',
      confirmed_by_client: false,
      media: [
        {
          id: 'med_pending_1',
          owner_id: userAlexei.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=240&q=75',
          width: 800,
          height: 800,
          mime_type: 'image/jpeg',
          alt: 'Результат работы: Low Fade',
        },
      ],
      created_at: '2026-09-23T08:10:00Z',
      updated_at: '2026-09-23T08:10:00Z',
    };
    this.works.set(workPendingConsent.id, workPendingConsent);

    const consentRequest1: WorkConsentRequest = {
      id: 'req_consent_1',
      work_id: workPendingConsent.id,
      work_title: workPendingConsent.title,
      work_image: workPendingConsent.media[0].url,
      provider_user_id: userAlexei.id,
      provider_name: userAlexei.name,
      provider_avatar: userAlexei.avatar,
      client_user_id: userRoman.id,
      client_name: userRoman.name,
      client_avatar: userRoman.avatar,
      reference_id: ref1.id,
      reference_title: ref1.title,
      reference_image: ref1.media[0]?.thumbnail_url,
      status: 'pending',
      permissions: {
        save_to_history: true,
        publish_photo: false,
        show_client_name: true,
      },
      created_at: '2026-09-23T08:15:00Z',
    };
    this.workConsents.set(consentRequest1.id, consentRequest1);

    this.createNotification(
      userRoman.id,
      'consent_request',
      'Запрос на публикацию работы',
      `Алексей Морозов хочет добавить результат «${workPendingConsent.title}» в профиль`,
      'consent_request',
      consentRequest1.id,
      {
        consent_id: consentRequest1.id,
        work_id: workPendingConsent.id,
        provider_user_id: userAlexei.id,
        provider_name: userAlexei.name,
        photo_url: consentRequest1.work_image,
      }
    );

    // 12. Schools & Education Ecosystem
    const schoolBemoon: School = {
      id: 'sch_bemoon',
      owner_id: userAcademy.id,
      name: 'BE&MOON Academy',
      logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80',
      cover_media: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
      description: 'Институт прогрессивного бьюти-образования. Готовим мастеров нового поколения: от чистой формы и анатомической постановки руки до личного бренда.',
      city: 'Москва',
      address: 'Столешников переулок, 12',
      website: 'https://bemoon.academy',
      contact_url: 'https://t.me/bemoon_academy',
      booking_url: 'https://bemoon.academy/admissions',
      status: 'active',
      specializations: ['Стрижки & Барбер', 'Nail-кутюрье', 'Брови & Ресницы', 'Колористика'],
      graduates_count: 1248,
      courses_count: 3,
      instructors: [
        {
          id: 'inst_1',
          name: 'Валерия Родионова',
          role: 'Chief Curator & Art Director',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        },
        {
          id: 'inst_2',
          name: 'Марк Левин',
          role: 'Lead Barber Educator',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        },
        {
          id: 'inst_3',
          name: 'Ольга Киселева',
          role: 'Nail Architecture Instructor',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
        },
      ],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    const schoolChopChop: School = {
      id: 'sch_chopchop',
      owner_id: userAlexei.id,
      name: 'Chop-Chop Education',
      logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80',
      cover_media: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
      description: 'Школа мужской классической стрижки и чистого фейда. Преподаем английскую геометрию и скорость работы без потери чистоты линии.',
      city: 'Москва',
      address: 'ул. Большая Никитская, 14',
      website: 'https://chopchop.me/school',
      contact_url: 'https://t.me/chopchop_school',
      booking_url: 'https://chopchop.me/school',
      status: 'active',
      specializations: ['Стрижки & Барбер', 'Борода', 'Fade', 'Английская классика'],
      graduates_count: 840,
      courses_count: 2,
      instructors: [
        {
          id: 'inst_cc1',
          name: 'Алексей Морозов',
          role: 'Senior Barber & Mentor',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        },
      ],
      created_at: '2023-06-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    };

    [schoolBemoon, schoolChopChop].forEach((s) => this.schools.set(s.id, s));

    // Courses
    const courseBarber: Course = {
      id: 'crs_barber_pro',
      school_id: schoolBemoon.id,
      school_name: schoolBemoon.name,
      title: 'Архитектура формы: Современный Fade и Кроп',
      description: 'Интенсив по чистой геометрии стрижек, работе со сложным направлением роста волос и созданию мягких дымчатых переходов.',
      format: 'offline',
      duration: '6 недель (120 ак. часов)',
      price: 65000,
      next_cohort: '15 октября 2025',
      specializations: ['Кроп', 'Mid Fade', 'Skin Fade', 'Текстура'],
      instructor_ids: ['inst_2'],
      graduates_count: 420,
      syllabus: [
        'Анализ формы черепа и текстуры волос',
        'Английские техники сведения на нет',
        'Работа филировочной бритвой и текстурирование',
        'Финальный стайлинг и фотосессия для портфолио',
      ],
      created_at: '2024-02-01T00:00:00Z',
    };

    const courseNails: Course = {
      id: 'crs_nail_couture',
      school_id: schoolBemoon.id,
      school_name: schoolBemoon.name,
      title: 'Эстетика тихой роскоши: Японский эко-маникюр & Glazed Chrome',
      description: 'Флагманский курс по работе с натуральной ногтевой пластиной без агрессивного опила.',
      format: 'offline',
      duration: '4 недели (80 ак. часов)',
      price: 48000,
      next_cohort: '20 октября 2025',
      specializations: ['Glazed Chrome', 'Японский маникюр', 'Миндаль', 'Нюд'],
      instructor_ids: ['inst_3'],
      graduates_count: 512,
      syllabus: [
        'Безопасный аппаратный маникюр без режущих фрез',
        'Эко-пасты и составы с пчелиным воском',
        'Втирки и хромированные эффекты без сколов',
        'Постановка света для макро-фотографий',
      ],
      created_at: '2024-02-15T00:00:00Z',
    };

    const courseBrows: Course = {
      id: 'crs_brow_lash',
      school_id: schoolBemoon.id,
      school_name: schoolBemoon.name,
      title: 'Ламинирование и анатомия натурального взгляда',
      description: 'Курс для мастеров, стремящихся к естественному результату без перечерненных бровей и склеенных ресниц.',
      format: 'hybrid',
      duration: '3 недели (60 ак. часов)',
      price: 32000,
      next_cohort: '1 ноября 2025',
      specializations: ['Ламинирование', 'Пудровые брови', 'Dewy look'],
      instructor_ids: ['inst_1'],
      graduates_count: 316,
      syllabus: [
        'Анатомия волоса и работа со связками дисульфидов',
        'Подбор валиков под анатомию века',
        'Колористика мягких оттенков',
        'Уход после процедуры',
      ],
      created_at: '2024-03-01T00:00:00Z',
    };

    [courseBarber, courseNails, courseBrows].forEach((c) => this.courses.set(c.id, c));

    // Certificates (Issued to Users)
    const certAlexei: Certificate = {
      id: 'cert_alexei_1',
      school_id: schoolBemoon.id,
      school_name: schoolBemoon.name,
      course_id: courseBarber.id,
      course_title: courseBarber.title,
      graduate_id: userAlexei.id,
      graduate_name: userAlexei.name,
      graduate_avatar: userAlexei.avatar,
      certificate_number: 'BM-ACAD-2024-0042',
      title: 'Сертификат экспертного уровня: Top Barber & Shape Architect',
      issued_at: '2024-05-18T12:00:00Z',
      status: 'issued',
      verification_token: 'vtok_alexei_bm2024',
      verification_url: 'https://be-moon.app/verify/vtok_alexei_bm2024',
      created_at: '2024-05-18T12:00:00Z',
    };

    const certElena: Certificate = {
      id: 'cert_elena_1',
      school_id: schoolBemoon.id,
      school_name: schoolBemoon.name,
      course_id: courseNails.id,
      course_title: courseNails.title,
      graduate_id: userElena.id,
      graduate_name: userElena.name,
      graduate_avatar: userElena.avatar,
      certificate_number: 'BM-ACAD-2025-0104',
      title: 'Сертификат мастера высшей квалификации: Couture Nail Stylist',
      issued_at: '2025-01-20T14:30:00Z',
      status: 'issued',
      verification_token: 'vtok_elena_bm2025',
      verification_url: 'https://be-moon.app/verify/vtok_elena_bm2025',
      created_at: '2025-01-20T14:30:00Z',
    };

    const certSofia: Certificate = {
      id: 'cert_sofia_1',
      school_id: schoolBemoon.id,
      school_name: schoolBemoon.name,
      course_id: courseBrows.id,
      course_title: courseBrows.title,
      graduate_id: userSofia.id,
      graduate_name: userSofia.name,
      graduate_avatar: userSofia.avatar,
      certificate_number: 'BM-ACAD-2024-0318',
      title: 'Сертификат мастера: Natural Look & Lamination Artist',
      issued_at: '2024-11-10T16:00:00Z',
      status: 'issued',
      verification_token: 'vtok_sofia_bm2024',
      verification_url: 'https://be-moon.app/verify/vtok_sofia_bm2024',
      created_at: '2024-11-10T16:00:00Z',
    };

    [certAlexei, certElena, certSofia].forEach((c) => this.certificates.set(c.id, c));

    // Connect verified education to User professional layers
    if (userAlexei.professional) {
      userAlexei.professional.education = [
        {
          id: 'edu_alexei_1',
          school_id: schoolBemoon.id,
          school_name: schoolBemoon.name,
          school_logo: schoolBemoon.logo,
          course_id: courseBarber.id,
          course_title: courseBarber.title,
          certificate_id: certAlexei.id,
          certificate_number: certAlexei.certificate_number,
          verification_token: certAlexei.verification_token,
          issued_at: certAlexei.issued_at,
          status: 'verified',
        },
      ];
    }

    if (userElena.professional) {
      userElena.professional.education = [
        {
          id: 'edu_elena_1',
          school_id: schoolBemoon.id,
          school_name: schoolBemoon.name,
          school_logo: schoolBemoon.logo,
          course_id: courseNails.id,
          course_title: courseNails.title,
          certificate_id: certElena.id,
          certificate_number: certElena.certificate_number,
          verification_token: certElena.verification_token,
          issued_at: certElena.issued_at,
          status: 'verified',
        },
      ];
    }

    if (userSofia.professional) {
      userSofia.professional.education = [
        {
          id: 'edu_sofia_1',
          school_id: schoolBemoon.id,
          school_name: schoolBemoon.name,
          school_logo: schoolBemoon.logo,
          course_id: courseBrows.id,
          course_title: courseBrows.title,
          certificate_id: certSofia.id,
          certificate_number: certSofia.certificate_number,
          verification_token: certSofia.verification_token,
          issued_at: certSofia.issued_at,
          status: 'verified',
        },
      ];
    }

    // Enrollments
    const enrollAlexei: Enrollment = {
      id: 'enr_alexei_1',
      school_id: schoolBemoon.id,
      course_id: courseBarber.id,
      course_title: courseBarber.title,
      user_id: userAlexei.id,
      user_name: userAlexei.name,
      user_avatar: userAlexei.avatar,
      status: 'verified',
      started_at: '2024-04-01T00:00:00Z',
      completed_at: '2024-05-18T12:00:00Z',
      verified_at: '2024-05-18T12:00:00Z',
      verified_by: userAcademy.id,
      certificate_id: certAlexei.id,
      created_at: '2024-03-25T00:00:00Z',
    };

    const enrollElena: Enrollment = {
      id: 'enr_elena_1',
      school_id: schoolBemoon.id,
      course_id: courseNails.id,
      course_title: courseNails.title,
      user_id: userElena.id,
      user_name: userElena.name,
      user_avatar: userElena.avatar,
      status: 'verified',
      started_at: '2024-12-15T00:00:00Z',
      completed_at: '2025-01-20T14:30:00Z',
      verified_at: '2025-01-20T14:30:00Z',
      verified_by: userAcademy.id,
      certificate_id: certElena.id,
      created_at: '2024-12-01T00:00:00Z',
    };

    const enrollSofia: Enrollment = {
      id: 'enr_sofia_1',
      school_id: schoolBemoon.id,
      course_id: courseBrows.id,
      course_title: courseBrows.title,
      user_id: userSofia.id,
      user_name: userSofia.name,
      user_avatar: userSofia.avatar,
      status: 'verified',
      started_at: '2024-10-15T00:00:00Z',
      completed_at: '2024-11-10T16:00:00Z',
      verified_at: '2024-11-10T16:00:00Z',
      verified_by: userAcademy.id,
      certificate_id: certSofia.id,
      created_at: '2024-10-01T00:00:00Z',
    };

    [enrollAlexei, enrollElena, enrollSofia].forEach((e) => this.enrollments.set(e.id, e));

    // School Posts
    const post1: SchoolPost = {
      id: 'sp_1',
      school_id: schoolBemoon.id,
      school_name: schoolBemoon.name,
      school_logo: schoolBemoon.logo,
      title: 'Открыт весенний набор в группу «Архитектура формы & Fade»',
      text: 'Только 8 мест на поток. Практика на реальных моделях с первого занятия.',
      type: 'course',
      course_id: courseBarber.id,
      status: 'published',
      media: [
        {
          id: 'msp_1',
          owner_id: userAcademy.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 800,
          mime_type: 'image/jpeg',
        },
      ],
      created_at: '2025-02-10T10:00:00Z',
    };

    const post2: SchoolPost = {
      id: 'sp_2',
      school_id: schoolBemoon.id,
      school_name: schoolBemoon.name,
      school_logo: schoolBemoon.logo,
      title: 'Выпуск группы Nail Couture: 100% подтвержденная сертификация',
      text: 'Поздравляем выпускников январского потока!',
      type: 'student_work',
      course_id: courseNails.id,
      status: 'published',
      media: [
        {
          id: 'msp_2',
          owner_id: userAcademy.id,
          type: 'image',
          url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=720&q=75',
          thumbnail_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=240&q=75',
          width: 1000,
          height: 800,
          mime_type: 'image/jpeg',
        },
      ],
      created_at: '2025-02-14T12:00:00Z',
    };

    [post1, post2].forEach((p) => this.schoolPosts.set(p.id, p));

    // Audit logs
    this.logAudit(
      userAcademy.id,
      userAcademy.name,
      'school.created',
      'school',
      schoolBemoon.id,
      null,
      { name: schoolBemoon.name },
      'Первичная регистрация академии'
    );
    this.logAudit(
      userAcademy.id,
      userAcademy.name,
      'certificate.issued',
      'certificate',
      certElena.id,
      null,
      { graduate: userElena.name, number: certElena.certificate_number },
      'Успешная сдача выпускного экзамена'
    );

    // Initial domain events
    this.logEvent(userAnna.id, 'reference', ref2.id, 'reference.viewed');
    this.logEvent(userAnna.id, 'work', work3.id, 'work.viewed');
    this.logEvent(userAnna.id, 'user', userElena.id, 'user.viewed');
    this.logEvent(userAnna.id, 'want_request', want1.id, 'want.created');
    this.logEvent(userElena.id, 'want_request', want1.id, 'want.completed');
    this.logEvent(userAnna.id, 'review', review1.id, 'review.created');

    // Seed extended feed works and references
    this.seedExtendedFeedData([userAlexei, userElena, userSofia], [userAnna, userRoman]);
  }

  private seedExtendedFeedData(providers: User[], regularUsers: User[]) {
    const templates = [
      {
        title: 'Текстурный малле с микро-челкой и мягким переходом',
        category: 'Стрижки & Барбер',
        tags: ['Малле', 'Текстура', 'Микро-челка', 'Гранж'],
        img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=720&q=75',
        thumb: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=240&q=75',
        workTitle: 'Малле в гранж-стилистике с ручной филировкой',
        workDesc: 'Индивидуально подобрана форма под овал лица. Укладка текстурирующей пастой.',
        price: 3200,
        duration: 50,
      },
      {
        title: 'Жемчужный втирочный френч на идеальный миндаль',
        category: 'Ногти & Маникюр',
        tags: ['Жемчуг', 'Френч', 'Миндаль', 'Quiet Luxury'],
        img: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=720&q=75',
        thumb: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=240&q=75',
        workTitle: 'Комбинированный маникюр + жемчужный френч',
        workDesc: 'Выравнивание каучуковой базой, глубокий срез кутикулы аппаратом, ультратонкая линия улыбки.',
        price: 2900,
        duration: 75,
      },
      {
        title: 'Ламинирование бровей с кератином и сывороткой шелка',
        category: 'Брови & Ресницы',
        tags: ['Ламинирование', 'Кератин', 'Естественность', 'Brow Lift'],
        img: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=720&q=75',
        thumb: 'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?auto=format&fit=crop&w=240&q=75',
        workTitle: 'Коллагеновое ламинирование бровей + коррекция воском',
        workDesc: 'Брови остаются мягкими и подвижными, волоски послушно укладываются щеточкой.',
        price: 2600,
        duration: 45,
      },
      {
        title: 'Clean Girl влажный макияж с деликатным персиковым тинтом',
        category: 'Макияж',
        tags: ['Clean Girl', 'Nude', 'Влажный блеск', 'Персик'],
        img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=720&q=75',
        thumb: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=75',
        workTitle: 'Дневной сияющий макияж с эффектом стеклянной кожи',
        workDesc: 'Увлажняющая база с гиалуроновой кислотой, легкий кремовый тон, кремовые румяна.',
        price: 3500,
        duration: 60,
      },
      {
        title: 'Глубокий лимфодренажный массаж лица кварцевым Гуаша',
        category: 'Уход',
        tags: ['Гуаша', 'Лимфодренаж', 'Скульптурирование', 'Овал лица'],
        img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=720&q=75',
        thumb: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=240&q=75',
        workTitle: 'Скульптурно-буккальный массаж + сыворотка с пептидами',
        workDesc: 'Снятие гипертонуса жевательных мышц, моделирование скуловой зоны и четкий овал.',
        price: 4200,
        duration: 60,
      },
      {
        title: 'Low Skin Fade с четкой окантовкой бороды острым лезвием',
        category: 'Стрижки & Барбер',
        tags: ['Low Fade', 'Борода', 'Опасная бритва', 'Классика'],
        img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=720&q=75',
        thumb: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=240&q=75',
        workTitle: 'Low Fade + комплексное моделирование бороды',
        workDesc: 'Распаривание горячим полотенцем с эфирными маслами кедра, чистый дымчатый переход.',
        price: 2800,
        duration: 60,
      },
      {
        title: 'Молочный омбре с каплями жидкого серебра',
        category: 'Ногти & Маникюр',
        tags: ['Ombre', 'Серебро', 'Nail Art', 'Минимализм'],
        img: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=720&q=75',
        thumb: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=240&q=75',
        workTitle: 'Градиент аэрографом на молочной базе + металлический акцент',
        workDesc: 'Безупречный переход без полос, топовое покрытие без сколов до 4 недель.',
        price: 3100,
        duration: 80,
      },
      {
        title: 'LED-наращивание ресниц: невесомый эффект мокрых ресниц',
        category: 'Брови & Ресницы',
        tags: ['LED ресницы', 'Мокрый эффект', 'Лучики', 'Ультралегкие'],
        img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=720&q=75',
        thumb: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=240&q=75',
        workTitle: 'Инновационное LED наращивание: эффект Wet Lashes 2D',
        workDesc: 'Моментальная полимеризация лучом, гипоаллергенно, можно умываться сразу после процедуры.',
        price: 3800,
        duration: 90,
      },
    ];

    for (let i = 0; i < 60; i++) {
      const tmpl = templates[i % templates.length];
      const provider = providers[i % providers.length];
      const author = regularUsers[i % regularUsers.length];
      const refId = `ref_ext_${i + 1}`;
      const workId = `wrk_ext_${i + 1}`;

      const reference: Reference = {
        id: refId,
        author_id: author.id,
        author_name: author.name,
        source_type: i % 2 === 0 ? 'curated' : 'user_upload',
        source_url: `https://be-moon.app/ref/curated-${i + 1}`,
        title: `${tmpl.title} #${i + 1}`,
        category: tmpl.category,
        tags: tmpl.tags,
        is_private: false,
        media: [
          {
            id: `med_ref_ext_${i + 1}`,
            owner_id: author.id,
            type: 'image',
            url: tmpl.img,
            thumbnail_url: tmpl.thumb,
            width: 1200,
            height: 900,
            mime_type: 'image/jpeg',
            alt: tmpl.title,
            fallback_color: '#4A3B32',
          },
        ],
        created_at: new Date(Date.now() - (i + 1) * 3600 * 1000 * 4).toISOString(),
      };

      const work: Work = {
        id: workId,
        author_id: provider.id,
        author_name: provider.name,
        author_profession: provider.professional?.profession,
        author_avatar: provider.avatar,
        reference_id: reference.id,
        reference_title: reference.title,
        reference_image: tmpl.thumb,
        title: `${tmpl.workTitle} (#${i + 1})`,
        description: tmpl.workDesc,
        category: tmpl.category,
        specializations: tmpl.tags,
        price: tmpl.price + (i % 5) * 200,
        duration: tmpl.duration,
        status: 'published',
        media: [
          {
            id: `med_wrk_ext_${i + 1}`,
            owner_id: provider.id,
            type: 'image',
            url: tmpl.img,
            thumbnail_url: tmpl.thumb,
            width: 1000,
            height: 1000,
            mime_type: 'image/jpeg',
            alt: tmpl.workTitle,
          },
        ],
        created_at: new Date(Date.now() - (i + 1) * 3600 * 1000 * 3).toISOString(),
        updated_at: new Date(Date.now() - (i + 1) * 3600 * 1000 * 3).toISOString(),
      };

      this.references.set(reference.id, reference);
      this.works.set(work.id, work);
    }
  }

  reset() {
    this.users.clear();
    this.places.clear();
    this.professionalHistories.clear();
    this.references.clear();
    this.works.clear();
    this.follows.clear();
    this.wantRequests.clear();
    this.reviews.clear();
    this.notifications.clear();
    this.events = [];
    this.schools.clear();
    this.courses.clear();
    this.enrollments.clear();
    this.certificates.clear();
    this.schoolPosts.clear();
    this.auditLogs = [];
    this.clientHistories.clear();
    this.workConsents.clear();
    this.seed();
  }
}

export const db = new Database();
