import { useState, useEffect } from 'react';
import { School } from '../../types/domain';
import { api } from '../../services/apiClient';
import {
  GraduationCap,
  MapPin,
  Users,
  BookOpen,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SchoolListViewProps {
  onSelectSchool: (schoolId: string) => void;
  onOpenVerifyModal?: () => void;
}

export function SchoolListView({ onSelectSchool, onOpenVerifyModal }: SchoolListViewProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpec, setSelectedSpec] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState('');

  const specializations = ['Все', 'Стрижки & Барбер', 'Nail-кутюрье', 'Колористика', 'Визаж'];

  useEffect(() => {
    loadSchools();
  }, [selectedSpec]);

  const loadSchools = async () => {
    setLoading(true);
    try {
      const data = await api.getSchools(selectedSpec === 'Все' ? undefined : selectedSpec);
      setSchools(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Hero Moonlight Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 moon-card border border-[#E9E4F0] bg-gradient-to-br from-[#FAF8FD] via-[#F4ECF8]/40 to-[#EBF3FA]/50">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#6B5B95]/10 text-[#6B5B95] mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Академическая экосистема BE&MOON</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display text-[#2D2738] leading-tight">
            Школы, курсы и верифицированные выпускники
          </h2>
          <p className="text-xs md:text-sm text-[#6E6779] mt-2 leading-relaxed">
            Сертификаты школ привязываются прямо в профессиональный паспорт мастера, подтверждая
            квалификацию для клиентов.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {onOpenVerifyModal && (
              <button
                onClick={onOpenVerifyModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#6B5B95] text-white hover:bg-[#58355E] transition-colors shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-[#FDF6E2]" />
                <span>Реестр верификации сертификатов</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient Moon Decoration */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-gradient-to-tr from-[#FDF6E2]/60 to-[#F4ECF8]/30 blur-2xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8299]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск академии по названию или городу..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white/90 border border-[#EDE8F3] text-xs text-[#2D2738] placeholder-[#9D95A8] focus:outline-none focus:ring-2 focus:ring-[#6B5B95]/20 focus:border-[#6B5B95]"
          />
        </div>

        {/* Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedSpec === spec
                  ? 'bg-[#6B5B95] text-white shadow-xs'
                  : 'bg-white/80 border border-[#EDE8F3] text-[#554D63] hover:bg-white'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Schools List */}
      {loading ? (
        <div className="py-16 text-center text-[#78716C]">
          <div className="w-8 h-8 border-2 border-[#6B5B95] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Загрузка школ и программ...</p>
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="py-16 text-center moon-card rounded-3xl p-8">
          <GraduationCap className="w-10 h-10 mx-auto text-[#A59CB5] mb-2" />
          <h3 className="text-sm font-bold text-[#2D2738]">Школы не найдены</h3>
          <p className="text-xs text-[#6E6779] mt-1">Попробуйте изменить запрос или категорию</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchools.map((school) => (
            <div
              key={school.id}
              onClick={() => onSelectSchool(school.id)}
              className="group moon-card rounded-3xl overflow-hidden border border-[#EDE8F3] hover:border-[#6B5B95]/40 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Cover & Logo Header */}
              <div className="relative h-32 bg-[#EFEAF2] overflow-hidden">
                <img
                  src={school.cover_media}
                  alt={school.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Logo */}
                <div className="absolute bottom-3 left-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-white/50 overflow-hidden">
                    <img
                      src={school.logo}
                      alt={school.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 drop-shadow-xs">
                      {school.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FDF6E2] fill-[#6B5B95]" />
                    </h3>
                    <div className="text-[11px] text-white/85 flex items-center gap-1 drop-shadow-xs">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {school.city}, {school.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-[#554D63] line-clamp-2 leading-relaxed">
                  {school.description}
                </p>

                {/* Specialization Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {school.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F4ECF8] text-[#6B5B95]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Key Metrics: Section 13 Highlights */}
                <div className="pt-2 border-t border-[#F0EBF5] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[#554D63]">
                      <Users className="w-3.5 h-3.5 text-[#6B5B95]" />
                      <span className="font-bold text-[#2D2738]">{school.graduates_count}</span>
                      <span className="text-[11px] text-[#7E748E]">выпускников</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#554D63]">
                      <BookOpen className="w-3.5 h-3.5 text-[#E07A5F]" />
                      <span className="font-bold text-[#2D2738]">{school.courses_count}</span>
                      <span className="text-[11px] text-[#7E748E]">курсов</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#6B5B95] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Подробнее</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
