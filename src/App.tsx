/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Calendar as CalendarIcon, 
  Bell, 
  User, 
  Menu, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Award,
  ClipboardList
} from "lucide-react";
import { Profile, HRData, Task, Notification, DailyReport } from "./types";
import { 
  initialProfiles, 
  initialHRData, 
  initialTasks, 
  initialNotifications,
  initialDailyReports
} from "./mockData";

// Components
import LoginView from "./components/LoginView";
import AnalyticsView from "./components/AnalyticsView";
import TeamView from "./components/TeamView";
import CalendarView from "./components/CalendarView";
import TaskDetailsView from "./components/TaskDetailsView";
import NotificationsView from "./components/NotificationsView";
import ProfileView from "./components/ProfileView";
import ReportsView from "./components/ReportsView";

// Supabase Direct Integration
import { 
  getSupabaseCredentials, 
  fetchProfilesFromSupabase, 
  fetchHRDataFromSupabase, 
  fetchTasksFromSupabase, 
  saveTaskToSupabase, 
  saveProfileToSupabase,
  saveHRDataToSupabase,
  saveDailyReportToSupabase,
  deleteTaskFromSupabase,
  fetchNotificationsFromSupabase, 
  fetchDailyReportsFromSupabase 
} from "./lib/supabase";

type ActiveViewType = 'login' | 'dashboard' | 'team' | 'calendar' | 'notifications' | 'profile' | 'task-details' | 'reports';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<ActiveViewType>('login');
  const [currentRole, setCurrentRole] = useState<'admin' | 'leader' | 'member'>('admin');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("vasrouse_theme");
    return stored ? stored === "dark" : true;
  });
  
  // Data States
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [hrData, setHrData] = useState<Record<string, HRData>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Selected active profile state
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem("vasrouse_active_profile_id") || "";
  });

  // Load data directly from Supabase if configured, or fallback to LocalStorage/mockData
  const loadSupabaseData = async () => {
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) {
      return false;
    }

    try {
      const [spProfiles, spHR, spTasks, spNotifs, spReports] = await Promise.all([
        fetchProfilesFromSupabase().catch(() => null),
        fetchHRDataFromSupabase().catch(() => null),
        fetchTasksFromSupabase().catch(() => null),
        fetchNotificationsFromSupabase().catch(() => null),
        fetchDailyReportsFromSupabase().catch(() => null)
      ]);

      if (spProfiles !== null) {
        setProfiles(spProfiles);
        localStorage.setItem("vasrouse_profiles", JSON.stringify(spProfiles));
      }

      if (spHR !== null) {
        const hrMap: Record<string, HRData> = {};
        spHR.forEach(item => {
          hrMap[item.id_perfil] = item;
        });
        setHrData(hrMap);
        localStorage.setItem("vasrouse_hrData", JSON.stringify(hrMap));
      }

      if (spTasks !== null) {
        setTasks(spTasks);
        localStorage.setItem("vasrouse_tasks", JSON.stringify(spTasks));
      }

      if (spNotifs !== null) {
        setNotifications(spNotifs);
        localStorage.setItem("vasrouse_notifs", JSON.stringify(spNotifs));
      }

      if (spReports !== null) {
        setDailyReports(spReports);
        localStorage.setItem("vasrouse_reports", JSON.stringify(spReports));
      }

      return true;
    } catch (err) {
      console.error('Error fetching direct Supabase data:', err);
      return false;
    }
  };

  // Load and initialize data from Supabase or LocalStorage/mockData
  useEffect(() => {
    const initData = async () => {
      const synced = await loadSupabaseData();
      if (!synced) {
        const storedProfiles = localStorage.getItem("vasrouse_profiles");
        const storedHR = localStorage.getItem("vasrouse_hrData");
        const storedTasks = localStorage.getItem("vasrouse_tasks");
        const storedNotifs = localStorage.getItem("vasrouse_notifs");
        const storedReports = localStorage.getItem("vasrouse_reports");

        if (storedProfiles) {
          const parsed: Profile[] = JSON.parse(storedProfiles);
          const cleanProfiles = parsed.filter(p => !['ana-silva', 'carlos-mendes', 'sofia-costa', 'alex-mercer'].includes(p.id));
          setProfiles(cleanProfiles);
        }
        if (storedHR) {
          const parsedHR = JSON.parse(storedHR);
          delete parsedHR['ana-silva'];
          delete parsedHR['carlos-mendes'];
          delete parsedHR['sofia-costa'];
          delete parsedHR['alex-mercer'];
          setHrData(parsedHR);
        }
        if (storedTasks) {
          const parsedTasks: Task[] = JSON.parse(storedTasks);
          const cleanTasks = parsedTasks.filter(t => !['task-rebranding', 'task-mobile', 'task-checkout'].includes(t.id));
          setTasks(cleanTasks);
        }
        if (storedNotifs) {
          const parsedNotifs: Notification[] = JSON.parse(storedNotifs);
          const cleanNotifs = parsedNotifs.filter(n => !['notif-1', 'notif-2', 'notif-3', 'notif-4'].includes(n.id));
          setNotifications(cleanNotifs);
        }
        if (storedReports) {
          const parsedReports: DailyReport[] = JSON.parse(storedReports);
          const cleanReports = parsedReports.filter(r => !['report-1', 'report-2'].includes(r.id));
          setDailyReports(cleanReports);
        }
      } else {
        // Clear cached local storage mock profile keys to keep live database state pure
        const storedProfiles = localStorage.getItem("vasrouse_profiles");
        if (storedProfiles && storedProfiles.includes("ana-silva")) {
          localStorage.removeItem("vasrouse_profiles");
          localStorage.removeItem("vasrouse_hrData");
          localStorage.removeItem("vasrouse_tasks");
          localStorage.removeItem("vasrouse_notifs");
          localStorage.removeItem("vasrouse_reports");
        }
      }

      const storedLoggedIn = localStorage.getItem("vasrouse_is_logged_in");
      const storedRole = localStorage.getItem("vasrouse_current_role");

      if (storedLoggedIn === "true") {
        setIsLoggedIn(true);
        setActiveView(localStorage.getItem("vasrouse_last_view") as ActiveViewType || 'dashboard');
      }
      
      if (storedRole) {
        setCurrentRole(storedRole as any);
      }
    };

    initData();
  }, []);


  // Save states to LocalStorage on modifications
  const handleUpdateProfiles = (updated: Profile[]) => {
    setProfiles(updated);
    localStorage.setItem("vasrouse_profiles", JSON.stringify(updated));
  };

  const handleUpdateTasks = (updated: Task[]) => {
    setTasks(updated);
    localStorage.setItem("vasrouse_tasks", JSON.stringify(updated));
  };

  const handleUpdateNotifications = (updated: Notification[]) => {
    setNotifications(updated);
    localStorage.setItem("vasrouse_notifs", JSON.stringify(updated));
  };

  const handleUpdateDailyReports = (updated: DailyReport[]) => {
    setDailyReports(updated);
    localStorage.setItem("vasrouse_reports", JSON.stringify(updated));
  };

  const handleAddDailyReport = (newReport: DailyReport) => {
    const updated = [newReport, ...dailyReports];
    handleUpdateDailyReports(updated);

    // Automatically update the status of each task mentioned in the report items
    let updatedTasks = [...tasks];
    newReport.itens.forEach(item => {
      updatedTasks = updatedTasks.map(t => {
        if (t.id === item.id_tarefa) {
          return { ...t, status: item.status };
        }
        return t;
      });
    });
    handleUpdateTasks(updatedTasks);

    // Generate a notification for the feed so other users know a report was submitted
    const newNotif: Notification = {
      id: "notif-report-" + Date.now(),
      tipo: "status",
      subtipo: "Relatório Diário",
      titulo: `Relatório Diário - ${newReport.nome_usuario}`,
      texto: `${newReport.nome_usuario} submeteu um relatório de progresso para a data ${newReport.data}.`,
      data: "Agora mesmo",
      lida: false
    };
    handleUpdateNotifications([newNotif, ...notifications]);
  };


  const handleUpdateHRData = (updated: Record<string, HRData>) => {
    setHrData(updated);
    localStorage.setItem("vasrouse_hrData", JSON.stringify(updated));
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("vasrouse_theme", next ? "dark" : "light");
      return next;
    });
  };

  const handleLoginSuccess = async (email: string) => {
    setIsLoggedIn(true);
    const userPrefix = email.split('@')[0].toLowerCase();
    const formattedName = userPrefix
      .split(/[\._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Find matching profile by email prefix, full email or name
    let match = profiles.find(p => 
      p.id.toLowerCase() === userPrefix || 
      p.name.toLowerCase().includes(userPrefix) ||
      p.id.toLowerCase() === email.toLowerCase()
    );

    // If no profile exists for this email user, register a new real profile in state & Supabase
    if (!match) {
      const isFirstUser = profiles.length === 0;
      match = {
        id: userPrefix || `user-${Date.now()}`,
        name: formattedName || email,
        funcao: isFirstUser ? "Administrador / Director" : "Colaborador",
        nivel_acesso: isFirstUser ? "admin" : "member",
        aniversario: "Não especificado",
        residencia: "Angola",
        horario: "08:00 - 17:00",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName || email)}&background=5A52A3&color=fff`
      };

      const updatedProfiles = [...profiles, match];
      setProfiles(updatedProfiles);
      localStorage.setItem("vasrouse_profiles", JSON.stringify(updatedProfiles));
      await saveProfileToSupabase(match).catch(err => console.error("Error saving profile to Supabase:", err));
    }

    if (match) {
      setActiveProfileId(match.id);
      localStorage.setItem("vasrouse_active_profile_id", match.id);
      setCurrentRole(match.nivel_acesso);
      localStorage.setItem("vasrouse_current_role", match.nivel_acesso);
    }

    localStorage.setItem("vasrouse_is_logged_in", "true");
    setActiveView('dashboard');
    localStorage.setItem("vasrouse_last_view", 'dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveView('login');
    localStorage.setItem("vasrouse_is_logged_in", "false");
    localStorage.setItem("vasrouse_last_view", "login");
  };

  const changeView = (view: ActiveViewType) => {
    setActiveView(view);
    localStorage.setItem("vasrouse_last_view", view);
  };

  const handleRoleChange = (role: 'admin' | 'leader' | 'member') => {
    setCurrentRole(role);
    localStorage.setItem("vasrouse_current_role", role);
    
    if (activeProfile) {
      const updatedProfiles = profiles.map(p => {
        if (p.id === activeProfile.id) {
          const updated = { ...p, nivel_acesso: role };
          saveProfileToSupabase(updated).catch(err => console.error("Error saving profile to Supabase:", err));
          return updated;
        }
        return p;
      });
      handleUpdateProfiles(updatedProfiles);
    }
  };

  // Add a brand new member
  const handleAddMember = (newProfile: Profile, newHR?: HRData) => {
    const updatedProfiles = [...profiles, newProfile];
    handleUpdateProfiles(updatedProfiles);
    saveProfileToSupabase(newProfile).catch(err => console.error("Error saving profile to Supabase:", err));

    if (newHR) {
      const updatedHR = { ...hrData, [newProfile.id]: newHR };
      handleUpdateHRData(updatedHR);
      saveHRDataToSupabase(newHR).catch(err => console.error("Error saving HR data to Supabase:", err));
    }
  };

  // Update specific single task (e.g. comments, progress, status, attachments)
  const handleUpdateSingleTask = (updatedTask: Task) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    handleUpdateTasks(updated);
    saveTaskToSupabase(updatedTask).catch(err => console.error("Error saving task to Supabase:", err));
  };

  const handleAddTask = (newTask: Task) => {
    const updated = [...tasks, newTask];
    handleUpdateTasks(updated);
    saveTaskToSupabase(newTask).catch(err => console.error("Error saving new task to Supabase:", err));
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, lida: true }));
    handleUpdateNotifications(updated);
  };

  // Handles clicking "Ver Tarefa" or "Responder" inside notifications panel
  const handleNotificationAction = (taskId: string, actionType: 'view' | 'reply') => {
    setSelectedTaskId(taskId);
    changeView('task-details');
    // If reply action, it'll focus the comment box inside details automatically
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    changeView('task-details');
  };

  // Calculate stats
  const unreadNotifCount = notifications.filter(n => !n.lida).length;

  const defaultProfile: Profile = {
    id: activeProfileId || "user",
    name: "Utilizador",
    funcao: "Membro",
    nivel_acesso: currentRole || "member",
    aniversario: "Não especificado",
    residencia: "Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Utilizador&background=5A52A3&color=fff"
  };

  const activeProfile = 
    profiles.find(p => p.id === activeProfileId) || 
    profiles[0] || 
    defaultProfile;

  if (!isLoggedIn || activeView === 'login') {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const activeTask = tasks.find(t => t.id === selectedTaskId) || tasks[0] || null;

  return (
    <div id="app-workspace-canvas" className={`min-h-screen bg-background text-on-background flex flex-col md:flex-row pb-24 md:pb-0 pt-16 md:pt-0 ${!isDarkMode ? 'light-theme' : ''}`}>
      
      {/* 1. Mobile Top Header Bar */}
      <header className="fixed top-0 w-full z-40 md:hidden bg-surface-dim/85 backdrop-blur-md border-b border-white/10 flex justify-between items-center h-16 px-4">
        <button 
          onClick={() => changeView('profile')}
          className="text-on-surface-variant hover:bg-white/5 active:scale-95 transition-transform flex items-center justify-center w-12 h-12 rounded-full"
        >
          <Menu size={22} />
        </button>
        
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => changeView('dashboard')}>
          <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2H22L12 22L2 2Z" fill="#5A52A3"></path>
            <path d="M6 6H18L12 18L6 6Z" fill="#FCD15A"></path>
          </svg>
          <span className="text-sm font-bold tracking-tight uppercase">
            Vasrouse <span className="italic text-secondary font-light">Creative</span>
          </span>
        </div>

        {/* Profile Avatar click */}
        <button 
          onClick={() => changeView('profile')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-variant border border-outline-variant overflow-hidden shrink-0 active:scale-95 transition-all"
        >
          <img 
            src={activeProfile?.avatar} 
            alt={activeProfile?.name} 
            className="w-full h-full object-cover" 
          />
        </button>
      </header>

      {/* 2. Desktop Side Navigation Sidebar */}
      <nav id="desktop-sidebar" className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 border-r border-white/10 bg-[#16161F]/85 backdrop-blur-xl z-40 p-6">
        
        {/* Brand Header */}
        <div className="mb-8 flex items-center gap-2 cursor-pointer" onClick={() => changeView('dashboard')}>
          <svg fill="none" height="28" viewBox="0 0 24 24" width="28" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2H22L12 22L2 2Z" fill="#5A52A3"></path>
            <path d="M6 6H18L12 18L6 6Z" fill="#FCD15A"></path>
          </svg>
          <h1 className="font-bold text-white text-base tracking-tight uppercase leading-none">
            Vasrouse <span className="italic text-secondary font-light block mt-0.5 text-xs">Creative</span>
          </h1>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex flex-col gap-1.5 flex-1">
          <button
            onClick={() => changeView('dashboard')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
              activeView === 'dashboard' 
                ? "bg-[#5A52A3]/25 text-[#c6bfff] border border-[#5A52A3]/30" 
                : "text-on-surface-variant hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => changeView('team')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
              activeView === 'team' 
                ? "bg-[#5A52A3]/25 text-[#c6bfff] border border-[#5A52A3]/30" 
                : "text-on-surface-variant hover:bg-white/5 hover:text-white"
            }`}
          >
            <Users size={16} />
            <span>Team</span>
          </button>

          <button
            onClick={() => changeView('calendar')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
              activeView === 'calendar' 
                ? "bg-[#5A52A3]/25 text-[#c6bfff] border border-[#5A52A3]/30" 
                : "text-on-surface-variant hover:bg-white/5 hover:text-white"
            }`}
          >
            <CalendarIcon size={16} />
            <span>Calendário</span>
          </button>

          <button
            onClick={() => changeView('reports')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
              activeView === 'reports' 
                ? "bg-[#5A52A3]/25 text-[#c6bfff] border border-[#5A52A3]/30" 
                : "text-on-surface-variant hover:bg-white/5 hover:text-white"
            }`}
          >
            <ClipboardList size={16} />
            <span>Relatórios</span>
          </button>

          <button
            onClick={() => changeView('notifications')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider text-left cursor-pointer relative ${
              activeView === 'notifications' 
                ? "bg-[#5A52A3]/25 text-[#c6bfff] border border-[#5A52A3]/30" 
                : "text-on-surface-variant hover:bg-white/5 hover:text-white"
            }`}
          >
            <Bell size={16} />
            <span>Notifications</span>
            {unreadNotifCount > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-[#5a52a3] flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <button
            onClick={() => changeView('profile')}
            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider text-left cursor-pointer ${
              activeView === 'profile' 
                ? "bg-[#5A52A3]/25 text-[#c6bfff] border border-[#5A52A3]/30" 
                : "text-on-surface-variant hover:bg-white/5 hover:text-white"
            }`}
          >
            <User size={16} />
            <span>Perfil</span>
          </button>
        </div>

        {/* Desktop Active User Card Widget (Bottom of sidebar) */}
        <div 
          onClick={() => changeView('profile')}
          className="pt-4 border-t border-white/10 flex items-center gap-3.5 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors mt-auto"
        >
          <div className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant overflow-hidden shrink-0 shadow-md">
            <img 
              src={activeProfile?.avatar} 
              alt={activeProfile?.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{activeProfile?.name}</p>
            <p className="text-[10px] text-on-surface-variant truncate font-semibold capitalize flex items-center gap-1 mt-0.5">
              <ShieldCheck size={10} className="text-secondary" />
              {currentRole} Access
            </p>
          </div>
        </div>

      </nav>

      {/* 3. Main Workspace Router Content canvas */}
      <main id="main-content-scroll" className="flex-1 md:ml-[260px] p-4 sm:p-6 md:p-8 min-h-screen overflow-y-auto w-full max-w-7xl mx-auto animate-fadeIn">
        {activeView === 'dashboard' && (
          <AnalyticsView 
            profiles={profiles} 
            tasks={tasks} 
            activeProfile={activeProfile} 
          />
        )}
        
        {activeView === 'team' && (
          <TeamView 
            profiles={profiles} 
            hrData={hrData} 
            currentRole={currentRole} 
            onAddMember={handleAddMember} 
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateSingleTask}
            notifications={notifications}
            onUpdateNotifications={handleUpdateNotifications}
          />
        )}
        
        {activeView === 'calendar' && (
          <CalendarView 
            tasks={tasks} 
            profiles={profiles} 
            currentRole={currentRole}
            onTaskClick={handleTaskClick} 
            onAddTask={handleAddTask}
          />
        )}
        
        {activeView === 'task-details' && (
          <TaskDetailsView 
            task={activeTask} 
            profiles={profiles} 
            activeProfile={activeProfile} 
            onBack={() => changeView('calendar')} 
            onUpdateTask={handleUpdateSingleTask}
          />
        )}
        
        {activeView === 'notifications' && (
          <NotificationsView 
            notifications={notifications} 
            onMarkAllRead={handleMarkAllNotificationsRead} 
            onNotificationAction={handleNotificationAction}
          />
        )}
        
        {activeView === 'profile' && (
          <ProfileView 
            activeProfile={activeProfile} 
            currentRole={currentRole} 
            onRoleChange={handleRoleChange} 
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onUpdateProfile={(name, title, aniversario, residencia, horario, avatar) => {
              if (!activeProfile) return;
              const updated = profiles.map(p => p.id === activeProfile.id ? { ...p, name, funcao: title, aniversario, residencia, horario, avatar } : p);
              handleUpdateProfiles(updated);
              const updatedProf = updated.find(p => p.id === activeProfile.id);
              if (updatedProf) saveProfileToSupabase(updatedProf).catch(err => console.error("Error updating profile in Supabase:", err));
            }}
          />
        )}

        {activeView === 'reports' && (
          <ReportsView 
            reports={dailyReports} 
            tasks={tasks} 
            profiles={profiles} 
            activeProfile={activeProfile} 
            onAddReport={handleAddDailyReport} 
          />
        )}
      </main>

      {/* 4. Mobile Bottom Tabbed Navigation Bar */}
      <nav id="mobile-tabbar" className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 pb-safe bg-[#16161F]/85 backdrop-blur-xl border-t border-white/10 z-40 text-on-surface-variant">
        <button 
          onClick={() => changeView('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer ${
            activeView === 'dashboard' ? "text-primary scale-110 font-bold" : "text-on-surface-variant"
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px] mt-1 font-semibold">Dashboard</span>
        </button>

        <button 
          onClick={() => changeView('team')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer ${
            activeView === 'team' ? "text-primary scale-110 font-bold" : "text-on-surface-variant"
          }`}
        >
          <Users size={20} />
          <span className="text-[10px] mt-1 font-semibold">Equipa</span>
        </button>

        <button 
          onClick={() => changeView('calendar')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer ${
            activeView === 'calendar' || activeView === 'task-details' ? "text-primary scale-110 font-bold" : "text-on-surface-variant"
          }`}
        >
          <CalendarIcon size={20} />
          <span className="text-[10px] mt-1 font-semibold">Calendário</span>
        </button>

        <button 
          onClick={() => changeView('reports')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer ${
            activeView === 'reports' ? "text-primary scale-110 font-bold" : "text-on-surface-variant"
          }`}
        >
          <ClipboardList size={20} />
          <span className="text-[10px] mt-1 font-semibold">Relatórios</span>
        </button>

        <button 
          onClick={() => changeView('notifications')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer relative ${
            activeView === 'notifications' ? "text-primary scale-110 font-bold" : "text-on-surface-variant"
          }`}
        >
          <Bell size={20} />
          <span className="text-[10px] mt-1 font-semibold">Alertas</span>
          {unreadNotifCount > 0 && (
            <div className="absolute top-2 right-6 w-2 h-2 rounded-full bg-primary animate-ping" />
          )}
        </button>

        <button 
          onClick={() => changeView('profile')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all cursor-pointer ${
            activeView === 'profile' ? "text-primary scale-110 font-bold" : "text-on-surface-variant"
          }`}
        >
          <User size={20} />
          <span className="text-[10px] mt-1 font-semibold">Perfil</span>
        </button>
      </nav>

    </div>
  );
}
