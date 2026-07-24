/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, ChevronDown, Award, Calendar, Home, CreditCard, ShieldCheck, Mail, Phone, Users, Landmark, Clock, Play, CheckCircle2, AlertCircle, Activity, UserCheck, BarChart3, FileText, ClipboardList } from "lucide-react";
import { Profile, HRData, Task, Notification } from "../types";

interface TeamViewProps {
  profiles: Profile[];
  hrData: Record<string, HRData>;
  currentRole: 'admin' | 'leader' | 'member';
  activeProfileId?: string;
  onAddMember: (newProfile: Profile, newHR?: HRData) => void;
  tasks: Task[];
  onAddTask: (newTask: Task) => void;
  onUpdateTask: (updatedTask: Task) => void;
  notifications: Notification[];
  onUpdateNotifications: (updated: Notification[]) => void;
}

export default function TeamView({ profiles, hrData, currentRole, activeProfileId, onAddMember, tasks, onAddTask, onUpdateTask, notifications, onUpdateNotifications }: TeamViewProps) {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIbanProfile, setSelectedIbanProfile] = useState<{ name: string; iban: string } | null>(null);

  // Task assignment form state per member
  const [assigningToMemberId, setAssigningToMemberId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskProject, setTaskProject] = useState("Nexus");
  const [taskPriority, setTaskPriority] = useState<'Baixa' | 'Média' | 'Alta'>("Média");
  const [taskDeadline, setTaskDeadline] = useState("");

  // New member form fields
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberAccess, setNewMemberAccess] = useState<'admin' | 'leader' | 'member'>("member");
  const [newMemberBirthday, setNewMemberBirthday] = useState("");
  const [newMemberResidence, setNewMemberResidence] = useState("");
  const [newMemberHours, setNewMemberHours] = useState("09:00 - 18:00");
  const [newMemberSalary, setNewMemberSalary] = useState("2000");
  const [newMemberSubsidies, setNewMemberSubsidies] = useState("150");
  const [newMemberContract, setNewMemberContract] = useState("Efetivo");
  const [newMemberIban, setNewMemberIban] = useState("PT50 0033 0000 ");

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberRole) return;

    const newId = newMemberName.toLowerCase().replace(/\s+/g, "-");
    const newProfile: Profile = {
      id: newId,
      name: newMemberName,
      funcao: newMemberRole,
      nivel_acesso: newMemberAccess,
      aniversario: newMemberBirthday || "01 Jan",
      residencia: newMemberResidence || "Lisboa, Portugal",
      horario: newMemberHours || "09:00 - 18:00",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" // default avatar
    };

    let newHR: HRData | undefined = undefined;
    if (newMemberAccess === 'admin' || currentRole === 'admin') {
      newHR = {
        id_perfil: newId,
        salario: Number(newMemberSalary) || 2000,
        data_contratacao: new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" }),
        iban: newMemberIban || "PT50 0033 0000 0000 0000 0000 0",
        contrato: newMemberContract || "Efetivo"
      };
    }

    onAddMember(newProfile, newHR);
    setShowAddModal(false);

    // Reset fields
    setNewMemberName("");
    setNewMemberRole("");
    setNewMemberAccess("member");
    setNewMemberBirthday("");
    setNewMemberResidence("");
    setNewMemberHours("09:00 - 18:00");
    setNewMemberSalary("2000");
    setNewMemberSubsidies("150");
    setNewMemberContract("Efetivo");
    setNewMemberIban("PT50 0033 0000 ");
  };

  // RBAC restrictions for seeing detail blocks
  const canSeePersonalInfo = currentRole === 'admin';
  const canSeeAdminInfo = currentRole === 'admin';

  // Group profiles into 3 distinct role columns
  const adminProfiles = profiles.filter(p => p.nivel_acesso === 'admin');

  const leaderProfiles = profiles.filter(p => p.nivel_acesso === 'leader');

  const memberProfiles = profiles.filter(p => p.nivel_acesso !== 'admin' && p.nivel_acesso !== 'leader');

  return (
    <div id="team-container" className="space-y-6">
      
      {/* View Header */}
      <section className="flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestão da Equipa</h1>
          <p className="text-sm text-on-surface-variant mt-1">Visão geral e administração de membros.</p>
        </div>
        
        {/* Only administrators can add new team members */}
        {currentRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="h-12 px-5 bg-[#FCD15A] hover:bg-[#ebc24c] text-[#0D0D11] rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <Plus size={18} />
            <span>Novo Membro</span>
          </button>
        )}
      </section>

      {/* Real-time Team Activity Board (Admins and Leaders only) */}
      {(currentRole === 'admin' || currentRole === 'leader') && (
        <section id="real-time-activity-board" className="bg-[#16161F]/90 border border-white/10 rounded-xl p-5 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A52A3]/10 rounded-full filter blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-[#FCD15A] animate-pulse" />
                Atividade em Tempo Real da Equipa
              </h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Visão instantânea do foco diário e das tarefas que os colaboradores estão a desenvolver.</p>
            </div>
            
            {/* Status Summary */}
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {tasks.filter(t => t.status === 'in_progress').length} Em Curso
              </span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {tasks.filter(t => t.status === 'pending').length} Pendentes
              </span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                {tasks.filter(t => t.status === 'review').length} Em Revisão
              </span>
              <span className="bg-white/5 text-gray-300 border border-white/10 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                {tasks.filter(t => t.status === 'completed').length} Concluídas
              </span>
            </div>
          </div>

          {/* Subordinates Focus Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profiles
              .filter(p => {
                const isTargetAdmin = p.nivel_acesso === 'admin';
                if (isTargetAdmin && currentRole !== 'admin') {
                  return false; // Only admins can see real-time activities of administrators
                }
                return true;
              })
              .map(p => {
              const activeTasks = tasks.filter(t => t.id_responsavel === p.id && t.status === 'in_progress');
              const pendingCount = tasks.filter(t => t.id_responsavel === p.id && t.status === 'pending').length;
              const hasActive = activeTasks.length > 0;

              return (
                <div 
                  key={`focus-${p.id}`} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    hasActive 
                      ? "bg-[#5A52A3]/10 border-[#5A52A3]/30 shadow-md" 
                      : "bg-[#0D0D11]/40 border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={p.avatar} 
                        alt={p.name} 
                        className="w-9 h-9 rounded-full object-cover border border-white/10" 
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#16161F] ${
                        hasActive ? "bg-emerald-400" : "bg-gray-500"
                      }`}></span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                      <p className="text-[9px] text-on-surface-variant truncate">{p.funcao}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5">
                    {hasActive ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold uppercase tracking-wide">
                          <span className="flex items-center gap-1">
                            <Clock size={10} className="animate-spin-slow" />
                            Em Progresso
                          </span>
                          <span>{activeTasks[0].progresso}%</span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate" title={activeTasks[0].titulo}>
                          {activeTasks[0].titulo}
                        </p>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${activeTasks[0].progresso}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                        <span className="flex items-center gap-1 text-[9px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                          Em Pausa / Sem Atividade
                        </span>
                        {pendingCount > 0 && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            {pendingCount} Pendentes
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Team Members Helper Function */}
      {(() => {
        const renderProfileCard = (p: Profile) => {
          const isOpen = !!openAccordions[p.id];
          const hr = hrData[p.id];
          const isTargetAdmin = p.nivel_acesso === 'admin';
          const isTargetLeader = p.nivel_acesso === 'leader';
          const isTargetSelf = p.id === activeProfileId;

          // Ninguém, a não ser os próprios administradores, pode ver as atividades dos administradores.
          const canSeeTasksForThisProfile = isTargetAdmin ? (currentRole === 'admin') : true;

          let canAssignTask = false;
          if (currentRole === 'admin') {
            canAssignTask = true; // Admin can assign to self, leaders, and members
          } else if (currentRole === 'leader') {
            canAssignTask = isTargetSelf || (!isTargetAdmin && !isTargetLeader); // Leader can assign to self and members
          } else if (currentRole === 'member') {
            canAssignTask = isTargetSelf; // Member can ONLY assign to self
          }

          return (
            <div 
              key={p.id} 
              className="bg-[#16161F]/90 border border-white/10 rounded-xl p-5 flex flex-col gap-4 shadow-xl hover:border-white/20 transition-all relative overflow-hidden"
            >
              {/* Subtle glassmorphism decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full filter blur-xl pointer-events-none"></div>

              {/* Card Header Info */}
              <div className="flex items-center gap-4 relative z-10">
                <img 
                  src={p.avatar} 
                  alt={p.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/10" 
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base truncate">{p.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="bg-primary-container/30 text-primary border border-primary/20 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider h-6 flex items-center">
                      {p.funcao}
                    </span>
                    {(p.nivel_acesso === 'admin' ? currentRole === 'admin' : (currentRole !== 'member' || p.id === activeProfileId)) && (
                      <span className="text-on-surface-variant text-[11px] font-medium">
                        {p.horario}
                      </span>
                    )}
                  </div>
                </div>

                {/* Accordion toggle indicator */}
                <button 
                  onClick={() => toggleAccordion(p.id)}
                  aria-label="Expandir detalhes"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white transition-all transform duration-300"
                >
                  <ChevronDown size={18} className={`transform transition-transform duration-300 ${isOpen ? "rotate-180 text-secondary" : ""}`} />
                </button>
              </div>

              {/* Accordion Content Block */}
              {isOpen && (
                <div className="border-t border-white/5 pt-4 space-y-4 animate-fadeIn">
                  
                  {/* Basic Personal Details: restricted strictly to Admin */}
                  {canSeePersonalInfo && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#0D0D11]/30 p-2.5 rounded-lg border border-white/5">
                        <span className="text-on-surface-variant block mb-1">Contratação</span>
                        <span className="text-white font-semibold flex items-center gap-1">
                          <Calendar size={12} className="text-primary" />
                          {hr?.data_contratacao || "12 Fev 2021"}
                        </span>
                      </div>
                      <div className="bg-[#0D0D11]/30 p-2.5 rounded-lg border border-white/5">
                        <span className="text-on-surface-variant block mb-1">Aniversário</span>
                        <span className="text-white font-semibold flex items-center gap-1">
                          <Award size={12} className="text-secondary" />
                          {p.aniversario}
                        </span>
                      </div>
                      <div className="col-span-2 bg-[#0D0D11]/30 p-2.5 rounded-lg border border-white/5">
                        <span className="text-on-surface-variant block mb-1">Residência</span>
                        <span className="text-white font-semibold flex items-center gap-1">
                          <Home size={12} className="text-primary" />
                          {p.residencia}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* REGISTO DE ATIVIDADES E TAREFAS EM TEMPO REAL */}
                  {canSeeTasksForThisProfile ? (
                    <div className="bg-[#0D0D11]/30 border border-white/5 rounded-lg p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <ClipboardList size={14} className="text-[#5A52A3]" />
                          Tarefas & Atividades Diárias
                        </h4>
                        
                        {canAssignTask && (
                          <button
                            onClick={() => {
                              if (assigningToMemberId === p.id) {
                                setAssigningToMemberId(null);
                              } else {
                                setAssigningToMemberId(p.id);
                                setTaskDeadline(new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0]);
                              }
                            }}
                            className="text-[11px] font-bold text-[#FCD15A] hover:text-[#ebc24c] flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/5 transition-all hover:bg-white/10 cursor-pointer"
                          >
                            <Plus size={11} />
                            <span>Atribuir Tarefa</span>
                          </button>
                        )}
                      </div>

                      {/* Add Task Inline Form */}
                      {assigningToMemberId === p.id && (
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!taskTitle.trim()) return;
                            
                            const newTask: Task = {
                              id: "task-" + Date.now(),
                              titulo: taskTitle,
                              descricao: taskDesc || "Sem descrição adicional",
                              id_responsavel: p.id,
                              prazo: taskDeadline ? new Date(taskDeadline).toISOString() : new Date(Date.now() + 5*24*60*60*1000).toISOString(),
                              status: 'pending',
                              progresso: 0,
                              prioridade: taskPriority,
                              projeto: taskProject || "Nexus",
                              anexos: [],
                              comentarios: []
                            };
                            
                            onAddTask(newTask);
                            
                            // Real-time Notification
                            const newNotif: Notification = {
                              id: "notif-assign-" + Date.now(),
                              tipo: 'task',
                              subtipo: 'Nova Tarefa',
                              titulo: 'Nova Tarefa Atribuída',
                              texto: `Foi-lhe atribuída a tarefa "${taskTitle}" no projeto "${taskProject}" por um Administrador.`,
                              data: 'Agora mesmo',
                              lida: false,
                              meta: {
                                id_tarefa: newTask.id,
                                nome_projeto: taskProject
                              }
                            };
                            onUpdateNotifications([newNotif, ...notifications]);
                            
                            // Clear states
                            setTaskTitle("");
                            setTaskDesc("");
                            setTaskProject("Nexus");
                            setTaskPriority("Média");
                            setAssigningToMemberId(null);
                          }} 
                          className="bg-[#0D0D11]/60 border border-white/10 rounded-lg p-3 space-y-2.5 animate-fadeIn text-left"
                        >
                          <div className="text-[10px] font-bold text-secondary uppercase">Nova Tarefa para {p.name}</div>
                          
                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="text-[10px] text-on-surface-variant block mb-1">Título</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="Desenhar ecrã principal..."
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                className="w-full h-8 bg-[#0D0D11] border border-white/10 rounded text-white px-2.5 text-xs focus:outline-none focus:border-[#5A52A3]"
                              />
                            </div>
                            
                            <div>
                              <label className="text-[10px] text-on-surface-variant block mb-1">Descrição</label>
                              <textarea 
                                placeholder="Instruções e metas..."
                                value={taskDesc}
                                onChange={(e) => setTaskDesc(e.target.value)}
                                className="w-full bg-[#0D0D11] border border-white/10 rounded text-white p-2 text-xs focus:outline-none focus:border-[#5A52A3] h-12 resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-on-surface-variant block mb-1">Projeto</label>
                                <input 
                                  type="text" 
                                  placeholder="Nexus"
                                  value={taskProject}
                                  onChange={(e) => setTaskProject(e.target.value)}
                                  className="w-full h-8 bg-[#0D0D11] border border-white/10 rounded text-white px-2 text-xs focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-on-surface-variant block mb-1">Prioridade</label>
                                <select 
                                  value={taskPriority}
                                  onChange={(e) => setTaskPriority(e.target.value as any)}
                                  className="w-full h-8 bg-[#0D0D11] border border-white/10 rounded text-white px-2 text-xs focus:outline-none"
                                >
                                  <option value="Baixa">Baixa</option>
                                  <option value="Média">Média</option>
                                  <option value="Alta">Alta</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-on-surface-variant block mb-1">Prazo de Entrega</label>
                              <input 
                                type="date" 
                                value={taskDeadline}
                                onChange={(e) => setTaskDeadline(e.target.value)}
                                className="w-full h-8 bg-[#0D0D11] border border-white/10 rounded text-white px-2 text-xs focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1.5">
                            <button 
                              type="button" 
                              onClick={() => setAssigningToMemberId(null)}
                              className="flex-1 h-8 bg-transparent border border-white/10 hover:bg-white/5 rounded text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button 
                              type="submit" 
                              className="flex-1 h-8 bg-[#FCD15A] text-[#0D0D11] hover:bg-[#ebc24c] font-bold rounded text-xs transition-all cursor-pointer"
                            >
                              Atribuir
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Subordinate's Tasks List */}
                      <div className="space-y-2 text-left">
                        {tasks.filter(t => t.id_responsavel === p.id).length === 0 ? (
                          <div className="text-center py-4 text-xs text-on-surface-variant bg-[#0D0D11]/20 border border-dashed border-white/5 rounded-lg">
                            Nenhuma tarefa atribuída ou em desenvolvimento de momento.
                          </div>
                        ) : (
                          tasks.filter(t => t.id_responsavel === p.id).map(t => {
                            let statusBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                            let statusLabel = "Pendente";
                            if (t.status === 'in_progress') {
                              statusBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                              statusLabel = "Em Curso";
                            } else if (t.status === 'review') {
                              statusBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                              statusLabel = "Revisão";
                            } else if (t.status === 'completed') {
                              statusBadgeColor = "bg-white/5 text-gray-400 border-white/10";
                              statusLabel = "Concluída";
                            }

                            let priorityBadgeColor = "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ";
                            if (t.prioridade === 'Alta') {
                              priorityBadgeColor += "bg-error-container/10 text-[#ffb4ab] border-error/15";
                            } else if (t.prioridade === 'Média') {
                              priorityBadgeColor += "bg-amber-500/10 text-amber-400 border-amber-500/20";
                            } else {
                              priorityBadgeColor += "bg-white/5 text-gray-400 border-white/10";
                            }

                            return (
                              <div key={t.id} className="bg-[#0D0D11]/40 border border-white/5 rounded-lg p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[10px] font-bold bg-[#5A52A3]/20 text-[#c6bfff] border border-[#5A52A3]/30 px-1.5 py-0.5 rounded">
                                        {t.projeto}
                                      </span>
                                      <span className={priorityBadgeColor}>
                                        {t.prioridade}
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-semibold text-white mt-1.5 leading-snug">{t.titulo}</h5>
                                    <p className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-1">{t.descricao}</p>
                                  </div>

                                  <div className="text-right flex flex-col items-end gap-1 shrink-0">
                                    <span className={`text-[10px] border px-2 py-0.5 rounded font-bold uppercase tracking-wider ${statusBadgeColor}`}>
                                      {statusLabel}
                                    </span>
                                    <span className="text-[9px] text-on-surface-variant">
                                      Prazo: {new Date(t.prazo).toLocaleDateString("pt-PT", { day: 'numeric', month: 'short' })}
                                    </span>
                                  </div>
                                </div>

                                {/* Active Progress Management and Status Selection */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                                  {/* Progress Control */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-on-surface-variant font-medium">Progresso:</span>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const nextProg = Math.max(0, t.progresso - 10);
                                        onUpdateTask({ 
                                          ...t, 
                                          progresso: nextProg, 
                                          status: nextProg === 100 ? 'completed' : (nextProg > 0 && t.status === 'pending' ? 'in_progress' : t.status) 
                                        });
                                      }}
                                      className="w-5 h-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs flex items-center justify-center rounded cursor-pointer transition-all active:scale-90"
                                    >
                                      -
                                    </button>
                                    <span className="text-[11px] text-white font-mono w-7 text-center font-bold">{t.progresso}%</span>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const nextProg = Math.min(100, t.progresso + 10);
                                        onUpdateTask({ 
                                          ...t, 
                                          progresso: nextProg, 
                                          status: nextProg === 100 ? 'completed' : (t.status === 'pending' ? 'in_progress' : t.status) 
                                        });
                                      }}
                                      className="w-5 h-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs flex items-center justify-center rounded cursor-pointer transition-all active:scale-90"
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Status Select */}
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-on-surface-variant font-medium">Alterar:</span>
                                    <select
                                      value={t.status}
                                      onChange={(e) => {
                                        const newStatus = e.target.value as any;
                                        let newProg = t.progresso;
                                        let tempStart = t.tempo_inicio;
                                        let tempEnd = t.tempo_fim;

                                        if (newStatus === 'completed') {
                                          newProg = 100;
                                          tempEnd = new Date().toISOString();
                                        } else if (newStatus === 'in_progress') {
                                          tempStart = new Date().toISOString();
                                          if (newProg === 100) newProg = 90;
                                          if (newProg === 0) newProg = 10;
                                        } else if (newStatus === 'pending') {
                                          newProg = 0;
                                        }

                                        onUpdateTask({
                                          ...t,
                                          status: newStatus,
                                          progresso: newProg,
                                          tempo_inicio: tempStart,
                                          tempo_fim: tempEnd
                                        });

                                        // Push status update notification
                                        const newNotif: Notification = {
                                          id: "notif-status-" + Date.now(),
                                          tipo: 'status',
                                          subtipo: 'Status Alterado',
                                          titulo: 'Status da Tarefa Atualizado',
                                          texto: `O status da tarefa "${t.titulo}" foi atualizado para ${e.target.value} por um Líder de Equipa.`,
                                          data: 'Agora mesmo',
                                          lida: false,
                                          meta: {
                                            id_tarefa: t.id,
                                            nome_projeto: t.projeto
                                          }
                                        };
                                        onUpdateNotifications([newNotif, ...notifications]);
                                      }}
                                      className="bg-[#0D0D11] text-[11px] text-white border border-white/10 rounded px-2 py-1 focus:outline-none cursor-pointer focus:border-secondary"
                                    >
                                      <option value="pending">Pendente</option>
                                      <option value="in_progress">Em Curso</option>
                                      <option value="review">Em Revisão</option>
                                      <option value="completed">Concluída</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#0D0D11]/40 border border-white/5 rounded-lg text-xs text-on-surface-variant text-center flex items-center justify-center gap-1.5">
                      <span>🔒 As atividades dos administradores são visíveis exclusivamente para Administradores.</span>
                    </div>
                  )}

                  {/* ADMIN Block / Bloco Financeiro e Contratual: STRICTLY restricted to Admin */}
                  {canSeeAdminInfo ? (
                    <div className="bg-surface-container-high border border-secondary/25 rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        Admin Info
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-on-surface-variant block mb-0.5">Salário Base</span>
                          <span className="text-white font-bold">{hr?.salario?.toLocaleString("pt-PT") || "2.800"} Kz</span>
                        </div>
                        <div>
                          <span className="text-on-surface-variant block mb-0.5">Subsídios</span>
                          <span className="text-white font-bold">250 Kz</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-on-surface-variant block mb-0.5">Contrato</span>
                          <span className="text-white font-semibold bg-[#0D0D11]/40 px-2 py-0.5 rounded border border-white/5 inline-block mt-0.5">
                            {hr?.contrato || "Efetivo"}
                          </span>
                        </div>
                      </div>

                      {hr?.iban && (
                        <button 
                          onClick={() => setSelectedIbanProfile({ name: p.name, iban: hr.iban })}
                          className="h-9 mt-2 w-full border border-outline hover:border-secondary/50 text-white rounded-lg text-xs font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-1.5"
                        >
                          <Landmark size={12} className="text-secondary" />
                          Ver IBAN
                        </button>
                      )}
                    </div>
                  ) : (
                    isOpen && !canSeeAdminInfo && (
                      <div className="p-3 bg-error-container/5 border border-error/15 rounded-lg text-xs text-[#ffb4ab] text-center flex items-center justify-center gap-1.5">
                        <span>⚠️ Bloco financeiro restrito ao Administrador (RH).</span>
                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          );
        };

        return (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Administradores */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#16161F] border border-white/10 p-3.5 rounded-xl shadow-md">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-secondary" />
                  Administradores
                </h3>
                <span className="bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {adminProfiles.length}
                </span>
              </div>
              <div className="space-y-4">
                {adminProfiles.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6 bg-[#16161F]/40 rounded-xl border border-white/5">Sem administradores de momento.</p>
                ) : (
                  adminProfiles.map(p => renderProfileCard(p))
                )}
              </div>
            </div>

            {/* Column 2: Líderes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#16161F] border border-white/10 p-3.5 rounded-xl shadow-md">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-[#FCD15A]" />
                  Líderes
                </h3>
                <span className="bg-[#FCD15A]/10 text-[#FCD15A] border border-[#FCD15A]/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {leaderProfiles.length}
                </span>
              </div>
              <div className="space-y-4">
                {leaderProfiles.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6 bg-[#16161F]/40 rounded-xl border border-white/5">Sem líderes registados.</p>
                ) : (
                  leaderProfiles.map(p => renderProfileCard(p))
                )}
              </div>
            </div>

            {/* Column 3: Membros */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#16161F] border border-white/10 p-3.5 rounded-xl shadow-md">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  Membros
                </h3>
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {memberProfiles.length}
                </span>
              </div>
              <div className="space-y-4">
                {memberProfiles.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6 bg-[#16161F]/40 rounded-xl border border-white/5">Sem membros registados.</p>
                ) : (
                  memberProfiles.map(p => renderProfileCard(p))
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* New Member Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0D0D11]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#16161F] border border-white/10 rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users size={22} className="text-secondary" />
              Registar Novo Membro
            </h2>
            <p className="text-xs text-on-surface-variant">Insira as informações profissionais e dados gerais do novo membro da equipa.</p>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    placeholder="Ana Silva"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Cargo / Função</label>
                  <input 
                    type="text" 
                    required
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    placeholder="Senior Developer"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Aniversário</label>
                  <input 
                    type="text" 
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    placeholder="05 Mar"
                    value={newMemberBirthday}
                    onChange={(e) => setNewMemberBirthday(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Nível de Acesso (RBAC)</label>
                  <select 
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    value={newMemberAccess}
                    onChange={(e) => setNewMemberAccess(e.target.value as any)}
                  >
                    <option value="member">Member (Membro Equipa)</option>
                    <option value="leader">Leader (Líder Equipa)</option>
                    <option value="admin">Admin (Administrador)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Horário Laboral</label>
                  <input 
                    type="text" 
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    value={newMemberHours}
                    onChange={(e) => setNewMemberHours(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Local de Residência</label>
                  <input 
                    type="text" 
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    placeholder="Porto, Portugal"
                    value={newMemberResidence}
                    onChange={(e) => setNewMemberResidence(e.target.value)}
                  />
                </div>
              </div>

              {/* Salary information fields only editable if Admin */}
              {canSeeAdminInfo && (
                <div className="bg-surface-container-high/60 border border-secondary/20 rounded-lg p-4 space-y-3">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={14} />
                    Dados de Recursos Humanos (Admin Only)
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Salário Base (Kz)</label>
                      <input 
                        type="number" 
                        className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none"
                        value={newMemberSalary}
                        onChange={(e) => setNewMemberSalary(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Subsídios (Kz)</label>
                      <input 
                        type="number" 
                        className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none"
                        value={newMemberSubsidies}
                        onChange={(e) => setNewMemberSubsidies(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Tipo de Contrato</label>
                      <input 
                        type="text" 
                        className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none"
                        placeholder="Efetivo"
                        value={newMemberContract}
                        onChange={(e) => setNewMemberContract(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-on-surface-variant mb-1">IBAN de Pagamento</label>
                    <input 
                      type="text" 
                      className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none"
                      placeholder="PT50 0033 0000 ..."
                      value={newMemberIban}
                      onChange={(e) => setNewMemberIban(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-10 bg-transparent border border-white/10 hover:bg-white/5 text-white text-sm rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#FCD15A] text-[#0D0D11] hover:bg-[#ebc24c] font-bold text-sm rounded-lg transition-all"
                >
                  Registar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IBAN Safe Viewer Modal */}
      {selectedIbanProfile && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#16161F] border border-secondary/20 rounded-xl p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Landmark className="text-secondary" size={20} />
              IBAN de Colaborador
            </h3>
            <p className="text-xs text-on-surface-variant">Consulte as coordenadas bancárias de <strong>{selectedIbanProfile.name}</strong> para processamento salarial seguro.</p>
            
            <div className="bg-[#0D0D11] p-4 rounded-lg border border-white/5 flex items-center justify-between font-mono text-sm tracking-wider text-secondary selection:bg-secondary/20">
              <span>{selectedIbanProfile.iban}</span>
            </div>

            <button
              onClick={() => setSelectedIbanProfile(null)}
              className="w-full h-10 bg-[#FCD15A] text-[#0D0D11] hover:bg-[#ebc24c] font-bold text-sm rounded-lg transition-all"
            >
              Fechar Consulta
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
