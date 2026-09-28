import React, { useState, useEffect } from 'react';
import { User, Work, Reference } from '../../types/domain';
import { api } from '../../services/apiClient';
import { Avatar } from '../design-system';
import { Search, MapPin, Clock, Sparkles } from 'lucide-react';

interface SearchDiscoveryViewProps {
  onSelectUser?: (userId: string) => void;
  onSelectMaster?: (userId: string) => void;
  onSelectWork: (workId: string) => void;
  onSelectReference: (refId: string) => void;
}

const CATEGORIES = [
  'Все',
  'Стрижки & Барбер',
  'Ногти & Маникюр',
  'Брови & Ресницы',
  'Макияж',
  'Уход',
];

export const SearchDiscoveryView: React.FC<SearchDiscoveryViewProps> = ({
  onSelectUser,
  onSelectMaster,
  onSelectWork,
  onSelectReference,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'works' | 'references'>('all');
  const [results, setResults] = useState<{
    users: User[];
    works: Work[];
    references: Reference[];
  }>({
    users: [],
    works: [],
    references: [],
  });
  const [loading, setLoading] = useState(false);

  const handleOpenUser = (userId: string) => {
    if (onSelectUser) onSelectUser(userId);
    else if (onSelectMaster) onSelectMaster(userId);
  };

  const doSearch = async () => {
    try {
      setLoading(true);
      const res = await api.search(query, activeTab);
      let filteredWorks = res.works;
      let filteredRefs = res.references;
      if (selectedCategory !== 'Все') {
        filteredWorks = filteredWorks.filter((w) => w.category === selectedCategory);
        filteredRefs = filteredRefs.filter((r) => r.category === selectedCategory);
      }
      setResults({
        users: res.users || [],
        works: filteredWorks || [],
        references: filteredRefs || [],
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch();
    }, 200);
    return () => clearTimeout(timer);
  }, [query, activeTab, selectedCategory]);

  return (
    <div className="pb-24">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-20 bg-[#FAF8F5]/90 backdrop-blur-md px-4 pt-3 pb-2 border-b border-[#EFEAE2] space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A8A29E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск мастера, стиля, стрижки или услуги..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white border border-[#E7DFD5] text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-hidden focus:border-[#D9532F]"
          />
        </div>

        {/* Tab filters (Все / Пользователи / Работы / Референсы) */}
        <div className="flex border-b border-[#EFEAE2]">
          {[
            { id: 'all', label: 'Все' },
            { id: 'users', label: 'Пользователи' },
            { id: 'works', label: 'Работы' },
            { id: 'references', label: 'Референсы' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 text-xs font-semibold tracking-wide transition-colors relative cursor-pointer ${
                activeTab === tab.id ? 'text-[#1C1917]' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D9532F]" />
              )}
            </button>
          ))}
        </div>

        {/* Category horizontal rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1C1917] text-[#FAF8F5]'
                  : 'bg-white text-[#57534E] border border-[#EFEAE2] hover:bg-[#F2ECE4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results content */}
      <div className="p-4 space-y-6">
        {loading && (
          <div className="text-center py-6 text-xs text-[#78716C]">Поиск...</div>
        )}

        {/* 1. USERS & PROFESSIONALS SECTION */}
        {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3">
              Пользователи & Специалисты ({results.users.length})
            </div>
            <div className="space-y-2.5">
              {results.users.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleOpenUser(u.id)}
                  className="bg-white p-3.5 rounded-2xl border border-[#EFEAE2] flex items-center justify-between cursor-pointer hover:border-[#D9532F]/50 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={u.name} src={u.avatar} size="md" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#1C1917] truncate flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {u.professional?.profession && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#D9532F]/10 text-[#D9532F]">
                            {u.professional.profession}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#78716C] truncate mt-0.5">
                        {u.professional?.title || u.bio || 'Участник сообщества'}
                      </div>
                      <div className="text-[11px] text-[#A8A29E] flex items-center gap-1 mt-0.5">
                        {u.professional?.city && (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{u.professional.city}</span>
                            <span>·</span>
                          </>
                        )}
                        <span>{u.followers_count || 0} подписчиков</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. REAL WORKS SECTION */}
        {(activeTab === 'all' || activeTab === 'works') && results.works.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3">
              Реальные работы ({results.works.length})
            </div>
            <div className="grid grid-cols-2 gap-3">
              {results.works.map((w) => (
                <div
                  key={w.id}
                  onClick={() => onSelectWork(w.id)}
                  className="bg-white rounded-2xl overflow-hidden border border-[#EFEAE2] shadow-xs cursor-pointer group"
                >
                  <div className="aspect-square bg-[#EFEAE2] relative overflow-hidden">
                    <img
                      src={w.media[0]?.thumbnail_url || w.media[0]?.url}
                      alt={w.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md font-bold tabular-nums">
                      {w.price.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-[#1C1917] truncate">{w.title}</div>
                    <div className="text-[11px] text-[#78716C] mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{w.duration} мин</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. REFERENCES SECTION */}
        {(activeTab === 'all' || activeTab === 'references') && results.references.length > 0 && (
          <section>
            <div className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-3">
              Референсы желаемых образов ({results.references.length})
            </div>
            <div className="grid grid-cols-2 gap-3">
              {results.references.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onSelectReference(r.id)}
                  className="bg-white rounded-2xl overflow-hidden border border-[#EFEAE2] shadow-xs cursor-pointer group"
                >
                  <div className="aspect-[4/3] bg-[#EFEAE2] relative overflow-hidden">
                    <img
                      src={r.media[0]?.thumbnail_url || r.media[0]?.url}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-[#1C1917] line-clamp-1">{r.title}</div>
                    <div className="text-[10px] text-[#D9532F] font-semibold uppercase mt-0.5">
                      {r.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading &&
          results.users.length === 0 &&
          results.works.length === 0 &&
          results.references.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#EFEAE2] p-6 text-[#78716C]">
              <Search className="w-8 h-8 mx-auto text-[#C6BEB4] mb-2" />
              <h4 className="font-semibold text-sm text-[#1C1917]">Ничего не найдено</h4>
              <p className="text-xs mt-1">Попробуйте изменить запрос или выбрать другую категорию</p>
            </div>
          )}
      </div>
    </div>
  );
};
