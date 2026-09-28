import { useState, useEffect } from 'react';
import { School, Course, SchoolPost, SchoolGraduateView } from '../../types/domain';
import { api } from '../../services/apiClient';
import {
  GraduationCap,
  MapPin,
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  Briefcase,
  Share2,
} from 'lucide-react';

interface SchoolDetailViewProps {
  schoolId: string;
  onBack: () => void;
  onSelectUser?: (userId: string) => void;
  onSelectMaster?: (userId: string) => void;
  onSelectWork: (workId: string) => void;
  onOpenVerifyModal?: (prefillToken?: string) => void;
}

export function SchoolDetailView({
  schoolId,
  onBack,
  onSelectUser,
  onSelectMaster,
  onSelectWork,
  onOpenVerifyModal,
}: SchoolDetailViewProps) {
  const [data, setData] = useState<{
    school: School;
    courses: Course[];
    posts: SchoolPost[];
    stats: { graduates_count: number; courses_count: number; instructors_count: number };
  } | null>(null);
  const [graduates, setGraduates] = useState<SchoolGraduateView[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'graduates' | 'posts' | 'about'>('courses');
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, [schoolId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schoolRes, gradsRes] = await Promise.all([
        api.getSchool(schoolId),
        api.getSchoolGraduates(schoolId),
      ]);
      setData(schoolRes);
      setGraduates(gradsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-24 text-center text-[#78716C]">
        <div className="w-8 h-8 border-2 border-[#6B5B95] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs">Загрузка академии...</p>
      </div>
    );
  }

  const { school, courses, posts, stats } = data;

  const handleEnrollClick = (course: Course) => {
    setSelectedCourseForEnroll(course);
    setEnrollSuccess(false);
  };

  const handleConfirmEnroll = () => {
    setEnrollSuccess(true);
    setTimeout(() => {
      setSelectedCourseForEnroll(null);
      setEnrollSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#554D63] hover:text-[#2D2738] bg-white/80 border border-[#EDE8F3] px-3 py-1.5 rounded-full transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Назад к списку школ</span>
        </button>

        <div className="flex items-center gap-2">
          {onOpenVerifyModal && (
            <button
              onClick={() => onOpenVerifyModal()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B5B95] bg-[#F4ECF8] hover:bg-[#EAE0F0] px-3 py-1.5 rounded-full transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Проверить диплом</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="moon-card rounded-3xl overflow-hidden border border-[#EDE8F3]">
        {/* Cover */}
        <div className="relative h-44 sm:h-56 bg-[#EFEAF2] overflow-hidden">
          <img
            src={school.cover_media}
            alt={school.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Info Area */}
        <div className="p-6 relative">
          {/* Floating Logo */}
          <div className="absolute -top-12 left-6 w-20 h-20 rounded-2xl bg-white p-1.5 shadow-lg border-2 border-white overflow-hidden">
            <img
              src={school.logo}
              alt={school.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="pt-8 sm:pt-4 sm:pl-24 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-[#2D2738]">
                  {school.name}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-[#6B5B95] fill-[#FDF6E2]" />
              </div>
              <p className="text-xs sm:text-sm text-[#6E6779] mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" />
                <span>
                  {school.city}, {school.address}
                </span>
                {school.website && (
                  <>
                    <span>·</span>
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6B5B95] hover:underline flex items-center gap-0.5"
                    >
                      <span>Сайт</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-4 bg-[#FAF8FD] border border-[#EDE8F3] px-4 py-2.5 rounded-2xl">
              <div className="text-center">
                <div className="text-sm font-bold text-[#2D2738]">{stats.graduates_count}</div>
                <div className="text-[10px] text-[#7E748E] font-medium">Выпускников</div>
              </div>
              <div className="w-px h-6 bg-[#E3DCEB]" />
              <div className="text-center">
                <div className="text-sm font-bold text-[#2D2738]">{stats.courses_count}</div>
                <div className="text-[10px] text-[#7E748E] font-medium">Курсов</div>
              </div>
              <div className="w-px h-6 bg-[#E3DCEB]" />
              <div className="text-center">
                <div className="text-sm font-bold text-[#2D2738]">{stats.instructors_count}</div>
                <div className="text-[10px] text-[#7E748E] font-medium">Кураторов</div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs sm:text-sm text-[#4A4257] leading-relaxed max-w-3xl">
            {school.description}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-[#EDE8F3] bg-[#FCFBFD] px-6 flex gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-3.5 text-xs font-bold transition-colors relative whitespace-nowrap ${
              activeTab === 'courses' ? 'text-[#6B5B95]' : 'text-[#7E748E] hover:text-[#2D2738]'
            }`}
          >
            Программы обучения ({courses.length})
            {activeTab === 'courses' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B5B95] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('graduates')}
            className={`py-3.5 text-xs font-bold transition-colors relative whitespace-nowrap ${
              activeTab === 'graduates' ? 'text-[#6B5B95]' : 'text-[#7E748E] hover:text-[#2D2738]'
            }`}
          >
            Выпускники & Работы ({graduates.length})
            {activeTab === 'graduates' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B5B95] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3.5 text-xs font-bold transition-colors relative whitespace-nowrap ${
              activeTab === 'posts' ? 'text-[#6B5B95]' : 'text-[#7E748E] hover:text-[#2D2738]'
            }`}
          >
            Журнал & Бэкстейдж ({posts.length})
            {activeTab === 'posts' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B5B95] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`py-3.5 text-xs font-bold transition-colors relative whitespace-nowrap ${
              activeTab === 'about' ? 'text-[#6B5B95]' : 'text-[#7E748E] hover:text-[#2D2738]'
            }`}
          >
            Кураторы & Контакты
            {activeTab === 'about' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B5B95] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#2D2738]">Актуальные курсы и наборы</h3>
            <span className="text-xs text-[#7E748E]">Официальная сертификация BE&MOON</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="moon-card rounded-3xl p-5 border border-[#EDE8F3] flex flex-col justify-between space-y-4 hover:border-[#6B5B95]/30 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBF3FA] text-[#4A90E2]">
                      {course.format === 'offline' ? 'Очный интенсив' : 'Онлайн + практика'}
                    </span>
                    <span className="text-[11px] font-medium text-[#7E748E] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#2D2738]">{course.title}</h4>
                  <p className="text-xs text-[#554D63] mt-1.5 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Cohort tag */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#6B5B95] font-semibold bg-[#F4ECF8] px-3 py-1.5 rounded-xl w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ближайший поток: {course.next_cohort}</span>
                  </div>

                  {/* Syllabus preview */}
                  {course.syllabus && course.syllabus.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="text-[11px] font-bold text-[#7E748E] uppercase tracking-wider">
                        Программа курса:
                      </div>
                      <ul className="text-xs text-[#4A4257] space-y-0.5 list-disc list-inside">
                        {course.syllabus.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="truncate">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#F0EBF5] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#7E748E]">Стоимость обучения</div>
                    <div className="text-base font-bold font-display text-[#2D2738]">
                      {course.price.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnrollClick(course)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6B5B95] text-white hover:bg-[#58355E] transition-colors shadow-xs"
                  >
                    Подать заявку
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. GRADUATES TAB (Core loop: Master gets verified diploma, Client sees real works) */}
      {activeTab === 'graduates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl moon-card-warm border border-[#F5EDE4] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#2D2738]">
                Зал выпускников и подтвержденные портфолио
              </h4>
              <p className="text-[11px] text-[#7E748E] mt-0.5">
                Мастера, успешно сдавшие выпускной экзамен академии и получившие подтвержденный диплом
              </p>
            </div>
            <div className="text-xs font-bold text-[#6B5B95] bg-white px-3 py-1.5 rounded-xl border border-[#EDE8F3]">
              {graduates.length} сертифицировано
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {graduates.map((grad) => (
              <div
                key={grad.user_id}
                className="moon-card rounded-3xl p-5 border border-[#EDE8F3] space-y-4"
              >
                {/* Master Header */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => {
                      const targetId = grad.user_id || grad.master_id;
                      if (!targetId) return;
                      if (onSelectUser) onSelectUser(targetId);
                      else if (onSelectMaster) onSelectMaster(targetId);
                    }}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <img
                      src={grad.avatar}
                      alt={grad.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#E9E4F0]"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#2D2738] group-hover:text-[#6B5B95] transition-colors flex items-center gap-1">
                        <span>{grad.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6B5B95] fill-[#FDF6E2]" />
                      </div>
                      <div className="text-xs text-[#7E748E]">{grad.profession}</div>
                      {grad.current_place && (
                        <div className="text-[11px] text-[#554D63] flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-[#E07A5F]" />
                          <span>{grad.current_place}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Certificate Badge */}
                  <button
                    onClick={() => onOpenVerifyModal && onOpenVerifyModal(grad.verification_token)}
                    className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-[#FAF8FD] border border-[#E3DCEB] text-[#6B5B95] hover:bg-[#F4ECF8] transition-colors"
                  >
                    {grad.certificate_number}
                  </button>
                </div>

                {/* Course Completed Info */}
                <div className="bg-[#FAF8FD] p-2.5 rounded-xl border border-[#F0EBF5] text-xs">
                  <span className="text-[#7E748E]">Окончил курс: </span>
                  <span className="font-semibold text-[#2D2738]">{grad.course_title}</span>
                </div>

                {/* Published Works Showcase */}
                {grad.works && grad.works.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold text-[#7E748E] mb-2">
                      Реальные работы мастера:
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {grad.works.map((work) => (
                        <div
                          key={work.id}
                          onClick={() => onSelectWork(work.id)}
                          className="aspect-square rounded-xl overflow-hidden bg-[#EFEAF2] cursor-pointer group relative border border-[#EDE8F3]"
                        >
                          <img
                            src={work.media[0]?.thumbnail_url || work.media[0]?.url}
                            alt={work.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Profile link */}
                {(grad.user_id || grad.master_id) && (
                  <button
                    onClick={() => {
                      const targetId = grad.user_id || grad.master_id;
                      if (!targetId) return;
                      if (onSelectUser) onSelectUser(targetId);
                      else if (onSelectMaster) onSelectMaster(targetId);
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-white border border-[#EDE8F3] text-[#2D2738] hover:bg-[#FAF8FD] hover:border-[#6B5B95]/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Перейти в профиль</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#6B5B95]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="moon-card rounded-3xl p-5 border border-[#EDE8F3] space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={school.logo}
                  alt={school.name}
                  className="w-9 h-9 rounded-xl object-cover border border-[#E9E4F0]"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#2D2738]">{post.title}</h4>
                  <div className="text-[10px] text-[#7E748E]">
                    {new Date(post.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#4A4257] leading-relaxed">{post.text}</p>

              {post.media && post.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden pt-1">
                  {post.media.map((m, idx) => (
                    <img
                      key={idx}
                      src={m.url}
                      alt={post.title}
                      className="w-full h-44 object-cover rounded-xl"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. ABOUT TAB */}
      {activeTab === 'about' && (
        <div className="space-y-4">
          {/* Instructors */}
          <div className="moon-card rounded-3xl p-5 border border-[#EDE8F3] space-y-3">
            <h3 className="text-sm font-bold text-[#2D2738] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6B5B95]" />
              Ведущие преподаватели & Кураторы
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {school.instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8FD] border border-[#F0EBF5]"
                >
                  <img
                    src={inst.avatar}
                    alt={inst.name}
                    className="w-11 h-11 rounded-xl object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#2D2738]">{inst.name}</div>
                    <div className="text-[11px] text-[#7E748E]">{inst.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accreditation Notice */}
          <div className="moon-card-warm rounded-3xl p-5 border border-[#F5EDE4] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D2738]">
              <ShieldCheck className="w-4 h-4 text-[#6B5B95]" />
              Стандарт аккредитации BE&MOON
            </div>
            <p className="text-xs text-[#554D63] leading-relaxed">
              Все выданные сертификаты заносятся в распределенный криптографический реестр платформы
              BE&MOON. Подлинность диплома может быть мгновенно подтверждена любым клиентом по
              уникальному токену или номеру.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: ENROLLMENT CONFIRMATION */}
      {selectedCourseForEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="moon-card w-full max-w-md rounded-3xl p-6 border border-[#EDE8F3] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#2D2738]">
              Заявка на обучение: {selectedCourseForEnroll.title}
            </h3>
            <p className="text-xs text-[#6E6779]">
              Академия свяжется с вами для согласования даты начала потока ({selectedCourseForEnroll.next_cohort}).
            </p>

            <div className="bg-[#FAF8FD] p-3 rounded-2xl border border-[#EDE8F3] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7E748E]">Длительность:</span>
                <span className="font-semibold text-[#2D2738]">{selectedCourseForEnroll.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E748E]">Формат:</span>
                <span className="font-semibold text-[#2D2738]">
                  {selectedCourseForEnroll.format === 'offline' ? 'Очный интенсив' : 'Онлайн'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E748E]">Стоимость:</span>
                <span className="font-bold text-[#2D2738]">
                  {selectedCourseForEnroll.price.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            {enrollSuccess ? (
              <div className="p-3 bg-[#EBF7EE] text-[#2E7D32] rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Заявка успешно отправлена!</span>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setSelectedCourseForEnroll(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#EDE8F3] text-xs font-semibold text-[#554D63] hover:bg-white"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirmEnroll}
                  className="flex-1 py-2.5 rounded-xl bg-[#6B5B95] text-white text-xs font-semibold hover:bg-[#58355E] transition-colors"
                >
                  Подтвердить заявку
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
