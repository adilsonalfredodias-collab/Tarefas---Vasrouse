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
  UserCheck 
} from "lucide-react";
import { Profile } from "../types";

interface ProfileViewProps {
  activeProfile: Profile;
  currentRole: 'admin' | 'leader' | 'member';
  onRoleChange: (role: 'admin' | 'leader' | 'member') => void;
  onLogout: () => void;
  onUpdateProfile: (name: string, title: string) => void;
}

export default function ProfileView({ 
  activeProfile, 
  currentRole, 
  onRoleChange, 
  onLogout,
  onUpdateProfile
}: ProfileViewProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(activeProfile.name);
  const [editTitle, setEditTitle] = useState(activeProfile.funcao);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editTitle.trim()) return;
    onUpdateProfile(editName, editTitle);
    setEditing(false);
  };

  return (
    <div id="profile-container" className="max-w-3xl mx-auto space-y-8 pb-12">
      
      {/* Profile Header Block */}
      <section className="flex flex-col items-center text-center space-y-4 pt-4">
        
        {/* Large Avatar container with edit hover action */}
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full border border-white/10 overflow-hidden shadow-lg bg-[#16161F]/80 flex items-center justify-center p-1 group">
          <img 
            src={activeProfile.avatar} 
            alt={activeProfile.name} 
            className="w-full h-full rounded-full object-cover" 
          />
          <button 
            onClick={() => setEditing(true)}
            aria-label="Editar Nome"
            className="absolute bottom-2 right-2 bg-primary-container text-white p-2 rounded-full hover:bg-inverse-primary transition-colors border border-white/10 flex items-center justify-center cursor-pointer active:scale-90"
          >
            <Edit3 size={16} />
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile} className="bg-[#16161F] p-4 rounded-xl border border-white/10 space-y-3 w-full max-w-sm">
            <div>
              <label className="block text-[10px] text-on-surface-variant text-left uppercase font-bold mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full h-9 bg-background border border-white/10 text-white text-xs rounded-lg px-2.5"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-on-surface-variant text-left uppercase font-bold mb-1">Cargo / Função</label>
              <input
                type="text"
                required
                className="w-full h-9 bg-background border border-white/10 text-white text-xs rounded-lg px-2.5"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 h-8 bg-transparent border border-white/10 text-xs rounded-lg text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 h-8 bg-primary-container text-white text-xs font-bold rounded-lg hover:brightness-110"
              >
                Gravar
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <h1 className="font-bold text-white text-2xl md:text-3xl mb-1">{activeProfile.name}</h1>
            <p className="text-sm text-on-surface-variant">{activeProfile.funcao}</p>
            
            <div className="mt-2.5 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/20 text-primary border border-primary/20 text-xs font-semibold gap-1.5 shadow-sm">
                <CheckCircle2 size={13} className="text-secondary" />
                <span>Pro Member</span>
              </span>
            </div>
          </div>
        )}
      </section>

      {/* RBAC Tester Section - Interactive Role Switcer */}
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
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-4 mb-2">Configurações</h2>
        
        <div className="bg-[#16161F] border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5 shadow-xl">
          
          {/* Account Settings */}
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D11]/60 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <User size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Configurações da Conta</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Gerencie seus dados pessoais</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-on-surface-variant" />
          </a>

          {/* Notification Preferences */}
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D11]/60 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <Bell size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Preferências de Notificação</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Defina como quer ser avisado</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-on-surface-variant" />
          </a>

          {/* Privacy & Security */}
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D11]/60 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Privacidade e Segurança</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Senhas, 2FA e dispositivos</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-on-surface-variant" />
          </a>

          {/* Dark Mode toggle switch */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0D0D11]/60 flex items-center justify-center text-on-surface-variant">
                <Moon size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Modo Escuro</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Alternar tema do workspace</p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isDarkMode} 
                onChange={() => setIsDarkMode(!isDarkMode)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-[#353439] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container" />
            </label>
          </div>

        </div>
      </section>

      {/* Logout button */}
      <section className="w-full mt-6">
        <button
          onClick={onLogout}
          className="w-full h-12 rounded-lg border border-error hover:bg-error/10 text-error font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <LogOut size={16} />
          <span>Sair da Conta</span>
        </button>
      </section>

    </div>
  );
}
