import React, { useState, useEffect } from 'react';
import {
  Work,
  Reference,
  User,
  WantRequest,
} from './types/domain';
import { api } from './services/apiClient';
import { MarketplaceFeedView } from './components/feed/MarketplaceFeedView';
import { WantBottomSheet } from './components/feed/WantBottomSheet';
import { UnifiedUserProfileView } from './components/profile/UnifiedUserProfileView';
import { ActivityView } from './components/activity/ActivityView';
import { SearchDiscoveryView } from './components/search/SearchDiscoveryView';
import { SchoolListView } from './components/school/SchoolListView';
import { SchoolDetailView } from './components/school/SchoolDetailView';
import { CertificateModal } from './components/certificate/CertificateModal';
import { WorkDetailModal } from './components/work/WorkDetailModal';
import { ReferenceDetailModal } from './components/reference/ReferenceDetailModal';
import { CreateWorkModal } from './components/create/CreateWorkModal';
import { CreateReferenceModal } from './components/create/CreateReferenceModal';
import { FunnelAnalyticsModal } from './components/analytics/FunnelAnalyticsModal';
import { AcceptanceTestModal } from './components/tests/AcceptanceTestModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { BottomNav, NavTab } from './components/navigation/BottomNav';
import { TopBar } from './components/navigation/TopBar';
import { Modal, Button, ToastProvider, useToast } from './components/design-system';
import { Briefcase, Sparkles } from 'lucide-react';

function MainApp() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  // Active detail views & modals
  const [activeWantTarget, setActiveWantTarget] = useState<{
    work: Work;
    reference: Reference;
    author: User;
  } | null>(null);

  const [activeWorkId, setActiveWorkId] = useState<string | null>(null);
  const [activeReferenceId, setActiveReferenceId] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeSelectedWorkId, setActiveSelectedWorkId] = useState<string | null>(null);
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null);

  // Certificate Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certVerifyToken, setCertVerifyToken] = useState<string | undefined>(undefined);

  // Create Modals
  const [isCreateChoiceOpen, setIsCreateChoiceOpen] = useState(false);
  const [isCreateWorkOpen, setIsCreateWorkOpen] = useState(false);
  const [isCreateRefOpen, setIsCreateRefOpen] = useState(false);

  // System Modals
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Initial load
  const loadInitialData = async () => {
    try {
      const meRes = await api.getMe();
      setCurrentUser(meRes.user);

      const notifs = await api.getNotifications();
      setUnreadNotifications(notifs.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Switch active demo persona (User Switcher)
  const handleSwitchUser = async (targetUserId: string) => {
    try {
      const res = await api.switchUser(targetUserId);
      setCurrentUser(res.current_user);
      setFeedRefreshKey((k) => k + 1);
      showToast(`Пользователь: ${res.current_user.name}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Ошибка переключения пользователя', 'error');
    }
  };

  // Want trigger
  const handleWant = (work: Work, reference: Reference, author: User) => {
    setActiveWantTarget({ work, reference, author });
  };

  // Navigate to user profile from work card (Home Page -> UserProfile)
  const handleOpenUserFromWork = (userId: string, workId?: string) => {
    setActiveUserId(userId);
    setActiveSelectedWorkId(workId || null);
  };

  const handleWantSuccess = (wantRequest: WantRequest) => {
    setUnreadNotifications((prev) => prev + 1);
    showToast('Запрос «Хочу» отправлен автору!', 'success');
  };

  const openVerifyCertificate = (token?: string) => {
    setCertVerifyToken(token);
    setIsCertModalOpen(true);
  };

  return (
    <div className="min-h-screen text-[#2D2738] flex justify-center relative">
      {/* Mobile-first centered shell container */}
      <main className="w-full max-w-md min-h-screen flex flex-col border-x border-[#EDE8F3]/70 bg-[#FAF8F5]/95 shadow-2xl relative pb-20">
        {/* PERSISTENT TOP BAR */}
        <TopBar
          currentUser={currentUser}
          onOpenSearch={() => setActiveTab('search')}
          onLogoClick={() => setActiveTab('home')}
        />

        {/* MAIN BODY PER ACTIVE TAB - KEPT IN MEMORY FOR INSTANT 0ms SWITCHING */}
        <div className="flex-1 p-3 sm:p-4">
          {/* TAB 1: VISUAL MARKETPLACE GRID (HOME) */}
          <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
            <MarketplaceFeedView
              key={feedRefreshKey}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onWant={handleWant}
              onOpenUser={handleOpenUserFromWork}
              currentUser={currentUser}
            />
          </div>

          {/* TAB 2: SCHOOLS & ACADEMIES */}
          <div style={{ display: activeTab === 'schools' ? 'block' : 'none' }}>
            {activeSchoolId ? (
              <SchoolDetailView
                schoolId={activeSchoolId}
                onBack={() => setActiveSchoolId(null)}
                onSelectMaster={(uId) => setActiveUserId(uId)}
                onSelectWork={(wId) => setActiveWorkId(wId)}
                onOpenVerifyModal={openVerifyCertificate}
              />
            ) : (
              <SchoolListView
                onSelectSchool={(sId) => setActiveSchoolId(sId)}
                onOpenVerifyModal={openVerifyCertificate}
              />
            )}
          </div>

          {/* TAB 3: SEARCH / DISCOVERY */}
          <div style={{ display: activeTab === 'search' ? 'block' : 'none' }}>
            <SearchDiscoveryView
              onSelectUser={(uId) => setActiveUserId(uId)}
              onSelectMaster={(uId) => setActiveUserId(uId)}
              onSelectWork={(wId) => setActiveWorkId(wId)}
              onSelectReference={(rId) => setActiveReferenceId(rId)}
            />
          </div>

          {/* TAB 4: ACTIVITY (Wants Queue & Notifications) */}
          <div style={{ display: activeTab === 'activity' ? 'block' : 'none' }}>
            <ActivityView
              onSelectWork={(wId) => setActiveWorkId(wId)}
              onSelectUser={(uId) => setActiveUserId(uId)}
              onSelectMaster={(uId) => setActiveUserId(uId)}
              onSelectReference={(rId) => setActiveReferenceId(rId)}
            />
          </div>

          {/* TAB 5: UNIFIED USER PROFILE (Single Unified Profile) */}
          <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
            <UnifiedUserProfileView
              key={`unified_profile_${currentUser?.id}`}
              userId={currentUser?.id}
              onSelectWork={(wId) => setActiveWorkId(wId)}
              onSelectReference={(rId) => setActiveReferenceId(rId)}
              onSelectUser={(uId) => setActiveUserId(uId)}
              onSelectMaster={(uId) => setActiveUserId(uId)}
              onSelectSchool={(sId) => setActiveSchoolId(sId)}
              onCreateWork={() => setIsCreateWorkOpen(true)}
              onCreateReference={() => setIsCreateRefOpen(true)}
              onVerifyCertificate={(tok) => {
                setCertVerifyToken(tok);
                setIsCertModalOpen(true);
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* PERSISTENT BOTTOM NAVIGATION (FIXED TO DISPLAY VIEWPORT) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab === 'create') {
            setIsCreateChoiceOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        unreadCount={unreadNotifications}
      />

      {/* MODAL 1: CREATE CHOICE (Work vs Reference) */}
      <Modal
        isOpen={isCreateChoiceOpen}
        onClose={() => setIsCreateChoiceOpen(false)}
        title="Что вы хотите опубликовать?"
      >
        <div className="space-y-3">
          <button
            onClick={() => {
              setIsCreateChoiceOpen(false);
              setIsCreateWorkOpen(true);
            }}
            className="w-full p-4 rounded-2xl bg-white border border-[#EDE8F3] flex items-center gap-3.5 text-left hover:border-[#6B5B95] transition-all cursor-pointer shadow-xs group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FAF8FD] text-[#6B5B95] group-hover:bg-[#6B5B95] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#2D2738]">Новая работа</div>
              <div className="text-xs text-[#7E748E] mt-0.5">
                Опубликуйте реальное выполнение работы с привязкой к референсу, цене и описанию
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setIsCreateChoiceOpen(false);
              setIsCreateRefOpen(true);
            }}
            className="w-full p-4 rounded-2xl bg-white border border-[#EDE8F3] flex items-center gap-3.5 text-left hover:border-[#6B5B95] transition-all cursor-pointer shadow-xs group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FAF8FD] text-[#6B5B95] group-hover:bg-[#6B5B95] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#2D2738]">Новый референс</div>
              <div className="text-xs text-[#7E748E] mt-0.5">
                Опубликуйте желаемый образ стрижки, маникюра или макияжа, который хотите найти
              </div>
            </div>
          </button>
        </div>
      </Modal>

      {/* MODAL 2: CREATE WORK */}
      <CreateWorkModal
        isOpen={isCreateWorkOpen}
        onClose={() => setIsCreateWorkOpen(false)}
        onSuccess={(newWork) => {
          setFeedRefreshKey((k) => k + 1);
          setActiveWorkId(newWork.id);
        }}
      />

      {/* MODAL 3: CREATE REFERENCE */}
      <CreateReferenceModal
        isOpen={isCreateRefOpen}
        onClose={() => setIsCreateRefOpen(false)}
        onSuccess={(newRef) => {
          setFeedRefreshKey((k) => k + 1);
          setActiveReferenceId(newRef.id);
        }}
      />

      {/* MODAL 4: «ХОЧУ» BOTTOM SHEET */}
      <WantBottomSheet
        isOpen={Boolean(activeWantTarget)}
        onClose={() => setActiveWantTarget(null)}
        work={activeWantTarget?.work || null}
        reference={activeWantTarget?.reference || null}
        author={activeWantTarget?.author || null}
        onWantSuccess={handleWantSuccess}
      />

      {/* MODAL 5: WORK DETAIL */}
      <WorkDetailModal
        workId={activeWorkId}
        onClose={() => setActiveWorkId(null)}
        onWant={handleWant}
        onOpenUser={(uId) => setActiveUserId(uId)}
        onOpenMaster={(uId) => setActiveUserId(uId)}
        onOpenReference={(rId) => setActiveReferenceId(rId)}
        onWorkDeleted={() => setFeedRefreshKey((k) => k + 1)}
      />

      {/* MODAL 6: REFERENCE DETAIL */}
      <ReferenceDetailModal
        referenceId={activeReferenceId}
        onClose={() => setActiveReferenceId(null)}
        onSelectWork={(wId) => setActiveWorkId(wId)}
        onSelectMaster={(uId) => setActiveUserId(uId)}
        onWant={handleWant}
      />

      {/* MODAL 7: UNIFIED PROFILE MODAL (Viewing someone else's profile) */}
      {activeUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2738]/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] bg-[#FAF8F5] sm:rounded-3xl shadow-2xl overflow-y-auto border border-[#EDE8F3] relative">
            <UnifiedUserProfileView
              userId={activeUserId}
              selectedWorkId={activeSelectedWorkId}
              onBack={() => {
                setActiveUserId(null);
                setActiveSelectedWorkId(null);
              }}
              onSelectWork={(wId) => setActiveWorkId(wId)}
              onSelectReference={(rId) => setActiveReferenceId(rId)}
              onSelectUser={(uId) => {
                setActiveUserId(uId);
                setActiveSelectedWorkId(null);
              }}
              onSelectMaster={(uId) => {
                setActiveUserId(uId);
                setActiveSelectedWorkId(null);
              }}
              onSelectSchool={(sId) => setActiveSchoolId(sId)}
              onCreateWork={() => setIsCreateWorkOpen(true)}
              onCreateReference={() => setIsCreateRefOpen(true)}
              onVerifyCertificate={(tok) => {
                setCertVerifyToken(tok);
                setIsCertModalOpen(true);
              }}
              onWant={handleWant}
            />
          </div>
        </div>
      )}

      {/* MODAL 8: CERTIFICATE VERIFICATION REGISTRY */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        initialToken={certVerifyToken}
        onSelectUser={(uId) => setActiveUserId(uId)}
        onSelectMaster={(uId) => setActiveUserId(uId)}
      />

      {/* MODAL 9: FUNNEL ANALYTICS */}
      <FunnelAnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* MODAL 10: ACCEPTANCE TESTS RUNNER */}
      <AcceptanceTestModal
        isOpen={isTestsOpen}
        onClose={() => setIsTestsOpen(false)}
      />

      {/* MODAL 11: SETTINGS */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenTests={() => setIsTestsOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
