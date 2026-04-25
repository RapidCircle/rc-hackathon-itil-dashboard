import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import FlowChart from './components/FlowChart';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import AddProcessModal from './components/AddProcessModal';
import ThemeSwatch from './components/ThemeSwatch';
import SearchPanel from './components/SearchPanel';
import EditProfileModal from './components/EditProfileModal';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { seedIfEmpty } from './utils/seedData';
import { getProcesses, setProcesses } from './utils/storage';
import { searchProcesses } from './utils/search';
import type { ProcessData, ProcessSearchResult } from './types/process';
import { BRANDING, ROLE_BADGE_STYLES, ROLE_LABELS } from './constants/branding';

// Seed default admin + processes into localStorage on first load
seedIfEmpty();

const ADMIN_MODE_KEY = 'itil_admin_mode';

type AdminMode = 'view' | 'edit';
type AppView = 'dashboard' | 'process';

export default function App() {
  const { currentUser, logout } = useAuth();
  const { themeName, setThemeName, themeOptions, applyRoleDefaultTheme, appearanceMode, toggleAppearanceMode } = useTheme();
  const [processes, setProcessesState] = useState<ProcessData[]>(() => getProcesses());
  const [activeProcessKey, setActiveProcessKey] = useState<string>(() => {
    const procs = getProcesses();
    return procs.length > 0 ? procs[0].key : '';
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAddProcess, setShowAddProcess] = useState(false);
  const [showThemeSwatch, setShowThemeSwatch] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'current'>('all');
  const [focusNodeId, setFocusNodeId] = useState<string | undefined>(undefined);
  const [focusNonce, setFocusNonce] = useState(0);
  const [adminMode, setAdminMode] = useState<AdminMode>(() => {
    const saved = localStorage.getItem(ADMIN_MODE_KEY);
    return saved === 'edit' ? 'edit' : 'view';
  });
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentUser) {
      applyRoleDefaultTheme(currentUser.role);
    }
  }, [currentUser, applyRoleDefaultTheme]);

  useEffect(() => {
    localStorage.setItem(ADMIN_MODE_KEY, adminMode);
  }, [adminMode]);

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setAdminMode('view');
    }
  }, [currentUser]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  const handleProcessUpdate = useCallback((updatedProcess: ProcessData) => {
    setProcessesState(prev => {
      const updated = prev.map(p => (p.key === updatedProcess.key ? updatedProcess : p));
      setProcesses(updated);
      return updated;
    });
  }, []);

  const handleAddProcess = useCallback((newProcess: ProcessData) => {
    setProcessesState(prev => {
      const updated = [...prev, newProcess];
      setProcesses(updated);
      return updated;
    });
    setActiveProcessKey(newProcess.key);
    setShowAddProcess(false);
  }, []);

  const handleDeleteProcess = useCallback((key: string) => {
    setProcessesState(prev => {
      const updated = prev.filter(p => p.key !== key);
      setProcesses(updated);
      setActiveProcessKey(curr => (curr === key && updated.length > 0 ? updated[0].key : curr));
      return updated;
    });
  }, []);

  if (!currentUser) return <LoginPage />;

  const current = processes.find(p => p.key === activeProcessKey) ?? processes[0];
  const isAdmin = currentUser.role === 'admin';
  const isEditMode = isAdmin && adminMode === 'edit';

  const filteredSearchProcesses = useMemo(() => {
    if (searchScope === 'current' && current) {
      return [current];
    }
    return processes;
  }, [searchScope, processes, current]);

  const searchResults = useMemo(
    () => searchProcesses(filteredSearchProcesses, searchQuery),
    [filteredSearchProcesses, searchQuery],
  );

  const handleSelectSearchResult = useCallback(
    (result: ProcessSearchResult) => {
      setActiveView('process');
      setActiveProcessKey(result.processKey);
      setFocusNodeId(result.nodeId);
      setFocusNonce(prev => prev + 1);
      setShowSearchPanel(false);
    },
    [],
  );

  const handleSelectProcess = useCallback((key: string) => {
    setActiveView('process');
    setActiveProcessKey(key);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleOpenDashboard = useCallback(() => {
    setActiveView('dashboard');
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--rc-primary-100)] bg-white/95 backdrop-blur-sm transition-transform duration-200 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        {/* Logo */}
        <div className="px-5 py-4 border-b border-[var(--rc-primary-100)]">
          <img src={BRANDING.logoPath} alt="RapidCircle" className="h-8 w-auto mb-3" />
          <h1 className="text-lg font-bold text-[var(--rc-primary-900)] leading-tight">{BRANDING.appName}</h1>
          <p className="text-xs text-[var(--rc-muted)] mt-0.5 font-asap">{BRANDING.sidebarSubtitle}</p>
        </div>

        {/* Process list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Process navigation">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2 font-asap">Overview</p>
          <button
            onClick={handleOpenDashboard}
            aria-label="Open dashboard overview"
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
              activeView === 'dashboard'
                ? 'bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)] border border-[var(--rc-primary-100)] shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:text-gray-900'
            }`}
          >
            <span className="text-lg">🏠</span>
            Dashboard
          </button>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2 font-asap">Processes</p>
          {processes.map(proc => (
            <button
              key={proc.key}
              onClick={() => handleSelectProcess(proc.key)}
              aria-label={`Switch to ${proc.info.title}`}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                activeProcessKey === proc.key
                  ? 'bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)] border border-[var(--rc-primary-100)] shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{proc.icon}</span>
              {proc.info.title}
            </button>
          ))}
        </nav>

        {/* Stats */}
        {current && (
          <div className="p-4 border-t border-[var(--rc-primary-100)]">
            <div className="bg-gradient-to-br from-[var(--rc-primary-50)] to-white rounded-lg p-3 border border-[var(--rc-primary-100)]">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2 font-asap">Current Process</p>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Nodes</span>
                <span className="font-semibold text-gray-900">{current.nodes.length}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Connections</span>
                <span className="font-semibold text-gray-900">{current.edges.length}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Decisions</span>
                <span className="font-semibold text-gray-900">
                  {current.nodes.filter(n => String(n.data.label).includes('?')).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel button */}
        <div className="px-4 pb-3 space-y-2">
          {isEditMode && (
            <button
              onClick={() => setShowAdminPanel(true)}
              aria-label="Open admin panel"
              className="w-full px-3 py-2 rounded-lg text-sm font-medium text-[var(--rc-primary-900)] bg-[var(--rc-primary-50)] hover:bg-[var(--rc-primary-100)] border border-[var(--rc-primary-100)] transition-colors flex items-center gap-2"
            >
              <span>⚙️</span> {BRANDING.adminPanelLabel}
            </button>
          )}

          {isAdmin && !isEditMode && (
            <div className="px-3 py-2 rounded-lg text-xs text-gray-600 bg-white border border-[var(--rc-primary-100)] font-asap">
              View mode active. Switch to Edit mode from top-right controls to manage users or process data.
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="px-4 py-3 border-t border-[var(--rc-primary-100)]">
          <div className="flex items-center justify-between mb-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{currentUser.name}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ROLE_BADGE_STYLES[currentUser.role]}`}>
                {ROLE_LABELS[currentUser.role]}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 text-center font-asap tracking-wide">{BRANDING.footerText}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden" aria-label="Main content">
        {(activeView === 'dashboard' || current) && (
          <>
            {/* Header */}
            <header className="border-b border-[var(--rc-primary-100)] bg-white/85 px-4 py-3 backdrop-blur-sm sm:px-6">
              <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open sidebar"
                    className="rounded-lg border border-[var(--rc-primary-100)] bg-white px-3 py-2 text-sm font-medium text-[var(--rc-primary-900)] hover:bg-[var(--rc-primary-50)] lg:hidden"
                  >
                    ☰
                  </button>
                  {activeView === 'dashboard' ? (
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)] px-3 py-1 text-xs font-semibold text-[var(--rc-primary-900)]">
                        Dashboard Overview
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-[var(--rc-primary-900)]">Welcome back, {currentUser.name.split(' ')[0]}</h2>
                        <p className="max-w-3xl text-sm text-gray-600 font-asap">Select a module below to get started.</p>
                      </div>
                    </div>
                  ) : current ? (
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${current.color}`}>
                        {current.icon} {current.info.title}
                      </span>
                      <p className="max-w-3xl text-sm text-gray-600 font-asap">{current.info.description}</p>
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">
                  <div className="w-full sm:w-72">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        setShowSearchPanel(true);
                      }}
                      onFocus={() => setShowSearchPanel(true)}
                      placeholder={activeView === 'dashboard' ? 'Search ITIL modules' : 'Search all processes'}
                      aria-label="Search process content"
                      className="w-full rounded-lg border border-[var(--rc-primary-100)] bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSearchPanel(true)}
                    className="rounded-lg border border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)] px-3 py-2 text-xs font-medium text-[var(--rc-primary-900)] hover:bg-white transition-colors"
                  >
                    Search
                  </button>

                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setShowUserMenu(prev => !prev)}
                      className="w-full rounded-lg border border-[var(--rc-primary-100)] bg-white px-3 py-2 text-xs font-medium text-[var(--rc-primary-900)] hover:bg-[var(--rc-primary-50)] transition-colors sm:w-auto"
                    >
                      {currentUser.name} ▾
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 rc-card shadow-xl p-3 space-y-3 z-30">
                        <div className="pb-2 border-b border-[var(--rc-primary-100)]">
                          <p className="text-xs font-semibold text-gray-800 truncate">{currentUser.name}</p>
                          <p className="text-[11px] text-gray-500 truncate font-asap">{currentUser.email}</p>
                        </div>

                        <div>
                          <label htmlFor="header-user-theme" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1 font-asap">
                            Theme
                          </label>
                          <select
                            id="header-user-theme"
                            aria-label="Select app theme"
                            value={themeName}
                            onChange={e => setThemeName(e.target.value as typeof themeName)}
                            className="w-full px-2.5 py-1.5 border border-[var(--rc-primary-100)] rounded-lg text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                          >
                            {themeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={toggleAppearanceMode}
                          aria-label={appearanceMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                          className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--rc-primary-900)] bg-white border border-[var(--rc-primary-100)] hover:bg-[var(--rc-primary-50)] transition-colors text-left"
                        >
                          {appearanceMode === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowThemeSwatch(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--rc-primary-900)] bg-white border border-[var(--rc-primary-100)] hover:bg-[var(--rc-primary-50)] transition-colors text-left"
                        >
                          🎨 Theme Preview
                        </button>

                        {isAdmin && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1 font-asap">Admin Mode</p>
                            <div className="inline-flex w-full rounded-lg border border-[var(--rc-primary-100)] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setAdminMode('view')}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                                  adminMode === 'view'
                                    ? 'bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)]'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminMode('edit')}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium border-l border-[var(--rc-primary-100)] transition-colors ${
                                  adminMode === 'edit'
                                    ? 'bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)]'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setShowEditProfile(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--rc-primary-900)] bg-white border border-[var(--rc-primary-100)] hover:bg-[var(--rc-primary-50)] transition-colors text-left"
                        >
                          Edit Profile
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-left"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {activeView === 'dashboard' ? (
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                  <section className="dashboard-hero rc-card overflow-hidden p-5 sm:p-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="max-w-2xl">
                        <span className="inline-flex items-center rounded-full border border-white/50 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--rc-primary-900)] font-asap">
                          ITIL Cockpit
                        </span>
                        <h3 className="mt-4 text-2xl font-bold text-[var(--rc-primary-950)] sm:text-3xl">Interactive process flows, checklists, and role-based guidance</h3>
                        <p className="mt-3 max-w-xl text-sm text-slate-700 font-asap">
                          Use the dashboard to jump into active modules, review SLA health, and continue process work from the last selected ITIL flow.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => current && handleSelectProcess(current.key)}
                            className="rc-primary-btn rounded-lg px-4 py-2 text-sm font-medium"
                          >
                            {current ? 'Resume module' : 'Open module'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowSearchPanel(true)}
                            className="rounded-lg border border-[var(--rc-primary-100)] bg-white px-4 py-2 text-sm font-medium text-[var(--rc-primary-900)] hover:bg-[var(--rc-primary-50)]"
                          >
                            Explore modules
                          </button>
                        </div>
                      </div>

                      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-3 xl:max-w-xl">
                        <div className="dashboard-stat-card">
                          <p className="dashboard-stat-label">Modules</p>
                          <p className="dashboard-stat-value">{processes.length}</p>
                          <p className="dashboard-stat-meta">Published in the cockpit</p>
                        </div>
                        <div className="dashboard-stat-card">
                          <p className="dashboard-stat-label">Total Steps</p>
                          <p className="dashboard-stat-value">{processes.reduce((sum, process) => sum + process.nodes.length, 0)}</p>
                          <p className="dashboard-stat-meta">Across all ITIL flows</p>
                        </div>
                        <div className="dashboard-stat-card">
                          <p className="dashboard-stat-label">Active Theme</p>
                          <p className="dashboard-stat-value text-lg">{themeOptions.find(option => option.value === themeName)?.label ?? themeName}</p>
                          <p className="dashboard-stat-meta">{appearanceMode === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.8fr]">
                    <div className="rc-card p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500 font-asap">ITIL Modules</p>
                          <h3 className="mt-1 text-lg font-bold text-[var(--rc-primary-900)]">Pick a module</h3>
                        </div>
                        <span className="rounded-full border border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)] px-3 py-1 text-xs font-semibold text-[var(--rc-primary-900)]">
                          {processes.length} available
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {processes.map(process => {
                          const isCurrentModule = process.key === activeProcessKey;
                          return (
                            <article key={process.key} className="dashboard-module-card">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-xl ${process.color}`}>
                                    {process.icon}
                                  </div>
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="text-base font-semibold text-slate-900">{process.info.title}</h4>
                                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                        MVP
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600 font-asap">{process.info.description}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 font-asap">Total Steps</p>
                                  <p className="mt-1 text-sm font-semibold text-slate-900">{process.nodes.length}</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 font-asap">SLA Compliance</p>
                                  <p className="mt-1 text-sm font-semibold text-slate-900">{process.info.metrics.slaCompliance}</p>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-3">
                                <p className="text-xs text-slate-500 font-asap">
                                  {process.info.metrics.averageResolutionTime} average resolution time
                                </p>
                                <button
                                  type="button"
                                  onClick={() => handleSelectProcess(process.key)}
                                  className="rounded-lg border border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)] px-3 py-2 text-xs font-semibold text-[var(--rc-primary-900)] hover:bg-white"
                                >
                                  {isCurrentModule ? 'Resume module' : 'Open module'}
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <section className="rc-card p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500 font-asap">Focused Module</p>
                        {current ? (
                          <div className="mt-3 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-xl ${current.color}`}>
                                {current.icon}
                              </div>
                              <div>
                                <h4 className="text-base font-semibold text-slate-900">{current.info.title}</h4>
                                <p className="text-xs text-slate-500 font-asap">Last selected module</p>
                              </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <p className="text-xs text-slate-600 font-asap">{current.info.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectProcess(current.key)}
                              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            >
                              Open {current.info.title}
                            </button>
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500 font-asap">No process is currently selected.</p>
                        )}
                      </section>

                      <section className="rc-card p-5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500 font-asap">Operational Notes</p>
                        <ul className="mt-3 space-y-3 text-sm text-slate-600 font-asap">
                          <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Use global search to jump directly to nodes, SLA targets, and edge labels.</li>
                          <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Switch admin mode to Edit when you need to manage process data or update guidance notes.</li>
                          <li className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Exports and animation controls remain available inside each process flow view.</li>
                        </ul>
                      </section>
                    </div>
                  </section>
                </div>
              </div>
            ) : current ? (
              <div className="flex-1 overflow-hidden">
                <FlowChart
                  key={activeProcessKey}
                  initialNodes={current.nodes}
                  initialEdges={current.edges}
                  processInfo={current.info}
                  isEditable={isEditMode}
                  focusNodeId={focusNodeId}
                  highlightNodeIds={focusNodeId ? [focusNodeId] : []}
                  highlightNonce={focusNonce}
                  onUpdate={updatedData => handleProcessUpdate({ ...current, ...updatedData })}
                />
              </div>
            ) : null}
          </>
        )}
      </main>

      {/* Admin Panel overlay */}
      {showAdminPanel && (
        <AdminPanel
          processes={processes}
          onDeleteProcess={handleDeleteProcess}
          onClose={() => setShowAdminPanel(false)}
          onOpenAddProcess={() => {
            setShowAdminPanel(false);
            setShowAddProcess(true);
          }}
        />
      )}

      {/* Add Process modal */}
      {showAddProcess && (
        <AddProcessModal
          onClose={() => setShowAddProcess(false)}
          onAdd={handleAddProcess}
        />
      )}

      {/* Theme preview overlay */}
      {showThemeSwatch && (
        <ThemeSwatch onClose={() => setShowThemeSwatch(false)} />
      )}

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}

      {showSearchPanel && (
        <SearchPanel
          isOpen={showSearchPanel}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          scope={searchScope}
          onScopeChange={setSearchScope}
          results={searchResults}
          activeProcessTitle={current?.info.title ?? 'Current process'}
          onSelectResult={handleSelectSearchResult}
          onClose={() => setShowSearchPanel(false)}
        />
      )}
    </div>
  );
}
