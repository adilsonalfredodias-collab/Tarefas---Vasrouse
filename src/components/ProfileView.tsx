/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, 
  Bell, 
  Lock, 
  Moon, 
  LogOut, 
  Edit3, 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Check,
  Smartphone,
  Key,
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Watch,
  X,
  AlertTriangle
} from "lucide-react";
import { Profile } from "../types";

interface ProfileViewProps {
  activeProfile: Profile;
  currentRole: 'admin' | 'leader' | 'member';
  onRoleChange: (role: 'admin' | 'leader' | 'member') => void;
  onLogout: () => void;
  onUpdateProfile: (
    name: string, 
    title: string, 
    aniversario: string, 
    residencia: string, 
    horario: string, 
    avatar: string
  ) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop", // Ana Silva
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop", // Sofia Costa
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop", // Carlos Mendes
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop", // Custom Fem 1
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop", // Custom Masc 1
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&auto=format&fit=crop"  // Custom Fem 2
];

export default function ProfileView({ 
  activeProfile, 
  currentRole, 
  onRoleChange, 
  onLogout,
  onUpdateProfile,
  isDarkMode,
  onToggleDarkMode
}: ProfileViewProps) {
  
  // Navigation for sub-menus
  const [activeTab, setActiveTab] = useState<'none' | 'account' | 'notifications' | 'privacy'>('none');
  
  // Feedback Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const profile = activeProfile || {
    id: "user",
    name: "Utilizador",
    funcao: "Colaborador",
    nivel_acesso: currentRole,
    aniversario: "Não especificado",
    residencia: "Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Utilizador&background=5A52A3&color=fff"
  };

  // 1. Account Settings States
  const [editName, setEditName] = useState(profile.name || "Utilizador");
  const [editTitle, setEditTitle] = useState(profile.funcao || "Colaborador");
  const [editAniversario, setEditAniversario] = useState(profile.aniversario || "1994-04-12");
  const [editResidencia, setEditResidencia] = useState(profile.residencia || "Luanda, Angola");
  const [editHorario, setEditHorario] = useState(profile.horario || "08:00 - 17:00");
  const [editAvatar, setEditAvatar] = useState(profile.avatar || "");

  // 2. Notification Preferences States
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifMentions, setNotifMentions] = useState(true);

  // 3. Privacy & Security States
  // Password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 2FA Flow
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  
  // Connected Devices List
  const [connectedSessions, setConnectedSessions] = useState([
    { id: "sess-1", device: "Chrome 124 on Linux (Ubuntu)", location: "Luanda, Angola", status: "Sessão Atual", ip: "197.231.18.9" },
    { id: "sess-2", device: "Workspace OS Client v1.2", location: "Luanda, Angola", status: "Ativo há 2 horas", ip: "197.231.18.15" },
    { id: "sess-3", device: "Safari on iPhone 15 Pro", location: "Benguela, Angola", status: "Ativo há 3 dias", ip: "102.223.4.11" }
  ]);

  // Account Form Submission
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editTitle.trim()) {
      showToast("Nome e Função são campos obrigatórios!");
      return;
    }
    onUpdateProfile(
      editName, 
      editTitle, 
      editAniversario, 
      editResidencia, 
      editHorario, 
      editAvatar
    );
    showToast("Definições da conta gravadas com sucesso!");
    setActiveTab('none');
  };

  // Notification Preferences Saving
  const handleSaveNotifications = () => {
    showToast("Preferências de notificação salvas com sucesso!");
    setActiveTab('none');
  };

  // Password Update
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Insira a palavra-passe atual.");
      return;
    }
    if (newPassword.length < 6) {
      showToast("A nova palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("As palavras-passe introduzidas não coincidem!");
      return;
    }
    
    // Simulate successful password change
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Palavra-passe atualizada com sucesso!");
  };

  // 2FA PIN Validation
  const handleValidate2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFACode.trim().length !== 6) {
      showToast("O código de autenticação deve ter exatamente 6 dígitos.");
      return;
    }
    setIs2FAEnabled(true);
    setShow2FASetup(false);
    setTwoFACode("");
    showToast("Autenticação de 2 Fatores (2FA) ATIVADA com sucesso!");
  };

  // Revoke device sessions
  const handleRevokeSessions = () => {
    // Keep only the current session
    setConnectedSessions(connectedSessions.filter(s => s.id === "sess-1"));
    showToast("Todas as outras sessões foram terminadas e revogadas!");
  };

  return (
    <div id="profile-container" className="max-w-3xl mx-auto space-y-6 pb-12 relative">
      
      {/* Toast Notification banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#5A52A3] border border-[#c6bfff]/30 text-white font-semibold text-xs py-3 px-6 rounded-xl shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 size={16} className="text-secondary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Back header when inside a sub-menu */}
      {activeTab !== 'none' && (
        <button
          onClick={() => {
            setActiveTab('none');
            // Reset temp values
            setEditName(profile.name);
            setEditTitle(profile.funcao);
            setEditAvatar(profile.avatar);
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-white transition-colors cursor-pointer bg-[#16161F]/60 border border-white/5 py-1.5 px-3 rounded-lg hover:bg-[#16161F] select-none"
        >
          <ArrowLeft size={14} />
          Voltar às Configurações
        </button>
      )}

      {/* ======================= CASE 1: NO TAB SELECTED (MAIN PROFILE VIEW) ======================= */}
      {activeTab === 'none' && (
        <>
          {/* Profile Header Block */}
          <section className="flex flex-col items-center text-center space-y-4 pt-2">
            
            {/* Large Avatar container */}
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full border border-white/10 overflow-hidden shadow-lg bg-[#16161F]/80 flex items-center justify-center p-1 group">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full rounded-full object-cover" 
              />
              <button 
                onClick={() => setActiveTab('account')}
                aria-label="Editar Nome"
                className="absolute bottom-2 right-2 bg-[#5a52a3] hover:bg-[#4E4693] text-white p-2.5 rounded-full transition-all border border-white/10 flex items-center justify-center cursor-pointer active:scale-90 shadow-md"
              >
                <Edit3 size={15} />
              </button>
            </div>

            <div className="text-center">
              <h1 className="font-bold text-white text-2xl md:text-3xl mb-1">{profile.name}</h1>
              <p className="text-sm text-on-surface-variant">{profile.funcao}</p>
              
              <div className="mt-2.5 flex justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/20 text-primary border border-primary/20 text-xs font-semibold gap-1.5 shadow-sm">
                  <CheckCircle2 size={13} className="text-secondary" />
                  <span>Pro Member</span>
                </span>
                
                {is2FAEnabled && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-semibold gap-1.5 shadow-sm">
                    <ShieldCheck size={13} />
                    <span>2FA Ativo</span>
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Quick Profile Bio Grid info */}
          <section className="bg-[#16161F] border border-white/5 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-3 bg-[#0D0D11]/40 p-3 rounded-xl border border-white/5">
              <MapPin size={16} className="text-[#c6bfff] shrink-0" />
              <div>
                <span className="text-[10px] text-on-surface-variant block">Residência</span>
                <span className="text-white font-semibold truncate">{profile.residencia || "Luanda, Angola"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#0D0D11]/40 p-3 rounded-xl border border-white/5">
              <Watch size={16} className="text-[#c6bfff] shrink-0" />
              <div>
                <span className="text-[10px] text-on-surface-variant block">Horário de Trabalho</span>
                <span className="text-white font-semibold truncate">{profile.horario || "08:00 - 17:00"}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#0D0D11]/40 p-3 rounded-xl border border-white/5">
              <Bell size={16} className="text-[#c6bfff] shrink-0" />
              <div>
                <span className="text-[10px] text-on-surface-variant block">Aniversário</span>
                <span className="text-white font-semibold truncate">{profile.aniversario || "12 de Abril"}</span>
              </div>
            </div>
          </section>

          {/* RBAC Tester Section - Interactive Role Switcher */}
          <section className="bg-surface-container/60 border border-secondary/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-secondary/15 rounded-lg text-secondary border border-secondary/25">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Simulador de Permissões (RBAC Tester)</h3>
                <p className="text-xs text-on-surface-variant">Altere o nível de privilégio do seu utilizador para testar o comportamento do Workspace OS.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {(['admin', 'leader', 'member'] as const).map(role => {
                const isSelected = currentRole === role;
                const label = role === 'admin' ? "Admin (RH)" : role === 'leader' ? "Leader (Equipa)" : "Member";
                const desc = role === 'admin' ? "Acesso total" : role === 'leader' ? "Acesso médio" : "Acesso básico";
                
                return (
                  <button
                    key={role}
                    onClick={() => onRoleChange(role)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer h-20 ${
                      isSelected 
                        ? "bg-primary-container/20 border-primary-container text-white shadow-lg" 
                        : "bg-[#16161F]/40 border-white/5 text-on-surface-variant hover:border-white/10"
                    }`}
                  >
                    <span className="text-xs font-bold block">{label}</span>
                    <span className="text-[10px] opacity-75">{desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Settings Options List */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-4 mb-1">Configurações</h2>
            
            <div className="bg-[#16161F] border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 shadow-xl">
              
              {/* Account Settings Trigger */}
              <button 
                onClick={() => setActiveTab('account')} 
                className="w-full text-left flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0D0D11]/60 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Configurações da Conta</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Gerencie seus dados pessoais, morada, aniversário e avatar</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Notification Preferences Trigger */}
              <button 
                onClick={() => setActiveTab('notifications')} 
                className="w-full text-left flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0D0D11]/60 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Preferências de Notificação</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Defina alertas push, resumos diários por email e prazos</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Privacy & Security Trigger */}
              <button 
                onClick={() => setActiveTab('privacy')} 
                className="w-full text-left flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0D0D11]/60 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Privacidade e Segurança</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Modificar palavra-passe, segurança de dois fatores (2FA) e sessões</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Dark Mode toggle switch */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0D0D11]/60 flex items-center justify-center text-on-surface-variant">
                    <Moon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Modo Escuro / Claro</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Alternar tema do workspace diurno/noturno</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isDarkMode} 
                    onChange={onToggleDarkMode}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-[#353439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A52A3]" />
                </label>
              </div>

            </div>
          </section>

          {/* Logout button */}
          <section className="w-full mt-4">
            <button
              onClick={onLogout}
              className="w-full h-12 rounded-lg border border-error hover:bg-error/10 text-error font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sair da Conta</span>
            </button>
          </section>
        </>
      )}

      {/* ======================= CASE 2: ACCOUNT SETTINGS VIEW ======================= */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="bg-[#16161F] border border-[#5a52a3]/20 rounded-2xl p-5 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 bg-[#5A52A3]/15 rounded-xl text-primary border border-[#5A52A3]/20">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Configurações da Conta</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Mantenha os seus dados de identificação e informações de contacto atualizados.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Choose Profile Picture */}
            <div>
              <label className="block text-[11px] font-bold text-[#c6bfff] uppercase tracking-wider mb-2">Avatar do Utilizador</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0D0D11]/40 p-4 rounded-xl border border-white/5">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#5A52A3] shrink-0">
                  <img src={editAvatar} alt="Profile Avatar Selection" className="w-full h-full object-cover" />
                </div>
                
                <div className="space-y-2 w-full">
                  <p className="text-[10px] text-on-surface-variant">Selecione uma imagem de perfil predefinida para aplicar instantaneamente:</p>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((av, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setEditAvatar(av)}
                        className={`aspect-square rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          editAvatar === av ? "border-secondary scale-110 shadow-lg shadow-black/25" : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <img src={av} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* General Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-3 focus:outline-none focus:border-[#5A52A3] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Função / Cargo</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-3 focus:outline-none focus:border-[#5A52A3] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Aniversário</label>
                <input
                  type="text"
                  placeholder="Ex: 12 de Abril ou YYYY-MM-DD"
                  value={editAniversario}
                  onChange={(e) => setEditAniversario(e.target.value)}
                  className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-3 focus:outline-none focus:border-[#5A52A3] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Horário de Trabalho</label>
                <input
                  type="text"
                  placeholder="Ex: 08:00 - 17:00"
                  value={editHorario}
                  onChange={(e) => setEditHorario(e.target.value)}
                  className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-3 focus:outline-none focus:border-[#5A52A3] transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Residência / Morada</label>
                <input
                  type="text"
                  placeholder="Ex: Luanda, Angola"
                  value={editResidencia}
                  onChange={(e) => setEditResidencia(e.target.value)}
                  className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-3 focus:outline-none focus:border-[#5A52A3] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Form Action buttons */}
          <div className="flex gap-3 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('none')}
              className="flex-1 h-10 bg-transparent hover:bg-white/5 border border-white/10 text-xs font-semibold rounded-lg text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 h-10 bg-primary-container hover:brightness-110 text-white text-xs font-bold rounded-lg transition-all active:scale-[0.99] cursor-pointer"
            >
              Gravar Alterações
            </button>
          </div>
        </form>
      )}

      {/* ======================= CASE 3: NOTIFICATION PREFERENCES VIEW ======================= */}
      {activeTab === 'notifications' && (
        <div className="bg-[#16161F] border border-[#5a52a3]/20 rounded-2xl p-5 space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 bg-[#5A52A3]/15 rounded-xl text-primary border border-[#5A52A3]/20">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Preferências de Notificação</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Escolha os canais e a frequência dos alertas de trabalho no Workspace OS.</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Toggle 1 */}
            <div className="flex items-start justify-between p-3.5 bg-[#0D0D11]/30 rounded-xl border border-white/5">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Notificações em Tempo Real (Push)</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">Mostra balões visuais e emite pequenos alertas sonoros no canto do ecrã ao receber novas atividades.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                <input 
                  type="checkbox" 
                  checked={notifPush} 
                  onChange={() => setNotifPush(!notifPush)}
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-[#353439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5A52A3]" />
              </label>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-start justify-between p-3.5 bg-[#0D0D11]/30 rounded-xl border border-white/5">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">E-mails de Resumo de Atividades</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">Enviar uma mensagem de e-mail diária consolidada com as tarefas pendentes, relatórios submetidos pela equipa e comentários.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                <input 
                  type="checkbox" 
                  checked={notifEmail} 
                  onChange={() => setNotifEmail(!notifEmail)}
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-[#353439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5A52A3]" />
              </label>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-start justify-between p-3.5 bg-[#0D0D11]/30 rounded-xl border border-white/5">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Lembretes Automáticos de Prazo</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">Avisar-me 24 horas antes do limite de entrega de qualquer uma das minhas tarefas ativas que estejam atrasadas ou pendentes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                <input 
                  type="checkbox" 
                  checked={notifReminders} 
                  onChange={() => setNotifReminders(!notifReminders)}
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-[#353439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5A52A3]" />
              </label>
            </div>

            {/* Toggle 4 */}
            <div className="flex items-start justify-between p-3.5 bg-[#0D0D11]/30 rounded-xl border border-white/5">
              <div className="space-y-0.5 pr-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Notificar Menções em Tarefas</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">Enviar um aviso urgente quando um membro ou líder me mencionar diretamente num comentário de tarefa (@ana-silva).</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                <input 
                  type="checkbox" 
                  checked={notifMentions} 
                  onChange={() => setNotifMentions(!notifMentions)}
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-[#353439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5A52A3]" />
              </label>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex gap-3 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('none')}
              className="flex-1 h-10 bg-transparent hover:bg-white/5 border border-white/10 text-xs font-semibold rounded-lg text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveNotifications}
              className="flex-1 h-10 bg-primary-container hover:brightness-110 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Gravar Preferências
            </button>
          </div>
        </div>
      )}

      {/* ======================= CASE 4: PRIVACY & SECURITY VIEW ======================= */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Main Card: Privacy & Security Header */}
          <div className="bg-[#16161F] border border-white/10 rounded-2xl p-5 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <div className="p-2 bg-[#5A52A3]/15 rounded-xl text-primary border border-[#5A52A3]/20">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Privacidade e Segurança</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Gerencie os seus dados de acesso, configure mecanismos de dupla segurança e visualize sessões ativas.</p>
              </div>
            </div>

            {/* Sub-block 1: Change Password Form */}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#c6bfff] uppercase tracking-wider mb-2">
                <Key size={14} />
                <span>Alterar Palavra-passe</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase mb-1">Palavra-passe Atual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none focus:border-[#5A52A3]"
                    placeholder="******"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase mb-1">Nova Palavra-passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none focus:border-[#5A52A3]"
                    placeholder="Pelo menos 6 carateres"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase mb-1">Confirmar Nova Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none focus:border-[#5A52A3]"
                    placeholder="Pelo menos 6 carateres"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="h-9 px-4 bg-[#5a52a3]/20 hover:bg-[#5a52a3]/35 text-[#c6bfff] border border-[#5a52a3]/30 text-xs font-bold rounded-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                Atualizar Palavra-passe
              </button>
            </form>

            {/* Sub-block 2: Multi-Factor Authentication (2FA) */}
            <div className="border-t border-white/5 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#c6bfff] uppercase tracking-wider">
                    <ShieldCheck size={14} className="text-secondary" />
                    <span>Autenticação de Dois Fatores (2FA)</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">Proteja a sua conta exigindo um PIN temporário gerado no telemóvel ao fazer login.</p>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={is2FAEnabled}
                    onChange={() => {
                      if (is2FAEnabled) {
                        setIs2FAEnabled(false);
                        showToast("Autenticação de 2 Fatores desativada.");
                      } else {
                        setShow2FASetup(true);
                      }
                    }}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-5 bg-[#353439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5A52A3]" />
                </label>
              </div>

              {/* 2FA SETUP MODAL INLINE COMPONENT */}
              {show2FASetup && (
                <div className="bg-[#0D0D11]/60 p-4 rounded-xl border border-secondary/20 space-y-4 animate-fadeIn">
                  <div className="flex items-start justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-[#ebc24c] uppercase tracking-wide">Configurar 2FA Seguro</span>
                    <button onClick={() => setShow2FASetup(false)} className="text-on-surface-variant hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Simulated QR Code Generator in pure CSS */}
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-white/10 shrink-0 w-32 h-32 mx-auto">
                      <div className="grid grid-cols-6 gap-0.5 w-24 h-24 bg-white">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-full h-full ${
                              (i % 2 === 0 && i % 3 === 0) || i < 6 || i % 7 === 0 || i > 30 ? "bg-black" : "bg-white"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        1. Abra a sua aplicação de autenticação preferida (ex: <strong>Google Authenticator</strong> ou <strong>Authy</strong>).
                      </p>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        2. Aponte a câmara do seu telemóvel para o código QR ou introduza manualmente a chave de segurança: <code className="text-secondary font-mono bg-white/5 px-1 py-0.5 rounded text-[10px]">VASROUSE-SECURE-KEY-2026</code>
                      </p>
                      
                      <form onSubmit={handleValidate2FA} className="flex gap-2">
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Introduza o código PIN de 6 dígitos"
                          value={twoFACode}
                          onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                          className="w-full h-9 bg-background border border-white/10 text-white text-xs rounded-lg px-2.5 font-mono text-center tracking-widest focus:outline-none focus:border-[#5A52A3]"
                        />
                        <button
                          type="submit"
                          className="px-4 h-9 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shrink-0 transition-colors"
                        >
                          Validar e Ativar
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Connected Devices List Panel */}
          <div className="bg-[#16161F] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#c6bfff] uppercase tracking-wider">
                <Smartphone size={14} className="text-primary" />
                <span>Sessões e Dispositivos Ativos</span>
              </div>
              
              {connectedSessions.length > 1 && (
                <button
                  type="button"
                  onClick={handleRevokeSessions}
                  className="text-[10px] text-red-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X size={10} />
                  Revogar Outros Dispositivos
                </button>
              )}
            </div>

            <div className="divide-y divide-white/5">
              {connectedSessions.map((session) => (
                <div key={session.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0D0D11] border border-white/5 text-on-surface-variant rounded-lg shrink-0">
                      <Smartphone size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{session.device}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {session.location} • <span className="font-mono">{session.ip}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                    session.id === "sess-1" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-white/5 text-on-surface-variant border border-white/5"
                  }`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
            
            {connectedSessions.length > 1 && (
              <div className="bg-[#121219] p-3 rounded-xl border border-amber-500/10 flex items-start gap-2.5 text-[11px] text-on-surface-variant">
                <AlertTriangle className="text-secondary shrink-0" size={14} />
                <p className="leading-relaxed">
                  Se detetar algum dispositivo ou endereço IP desconhecido nesta lista de acessos, revogue as ligações imediatamente e altere a sua palavra-passe para garantir que mais ninguém consegue aceder ao seu workspace.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Back Button */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveTab('none')}
              className="px-6 h-10 bg-transparent hover:bg-white/5 border border-white/10 text-xs font-semibold rounded-lg text-white cursor-pointer"
            >
              Concluído
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
