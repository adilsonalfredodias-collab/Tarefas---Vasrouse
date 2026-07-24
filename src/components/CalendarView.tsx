/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Calendar as CalendarIcon, Clock, CheckCircle2, PlayCircle, Clock3, Filter, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Task, Profile, Attendance } from "../types";

interface CalendarViewProps {
  tasks: Task[];
  profiles: Profile[];
  currentRole: 'admin' | 'leader' | 'member';
  activeProfileId?: string;
  onTaskClick: (taskId: string) => void;
  onAddTask: (newTask: Task) => void;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function CalendarView({ tasks, profiles, currentRole, activeProfileId, onTaskClick, onAddTask }: CalendarViewProps) {
  // Calendar state set to 2026
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 6 = Julho (0-indexed)
  const [selectedDay, setSelectedDay] = useState(23); // 23 de Julho de 2026
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('semana');
  const [statusFilter, setStatusFilter] = useState<'todas' | 'in_progress' | 'pending' | 'completed'>('todas');

  const [showAddEventModal, setShowAddModal] = useState(false);
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  // Filter allowed assignees based on RBAC rules
  const allowedAssignees = profiles.filter(p => {
    const isSelf = p.id === activeProfileId;
    if (currentRole === 'admin') {
      return true; // Admin can assign to self, leaders, and members
    }
    if (currentRole === 'leader') {
      const isTargetAdmin = p.nivel_acesso === 'admin';
      const isTargetLeader = p.nivel_acesso === 'leader';
      return isSelf || (!isTargetAdmin && !isTargetLeader);
    }
    if (currentRole === 'member') {
      return isSelf; // Member can ONLY assign to self
    }
    return isSelf;
  });

  // Add event form fields
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventAssignee, setEventAssignee] = useState(activeProfileId || allowedAssignees[0]?.id || profiles[0]?.id || "");
  const [eventPriority, setEventPriority] = useState<'Baixa' | 'Média' | 'Alta'>("Alta");
  const [eventProj, setEventProj] = useState("Vasrouse OS");
  const [eventHour, setEventHour] = useState("09:00");
  const [eventDate, setEventDate] = useState(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate 7-day week array surrounding selectedDay
  const getWeekDays = () => {
    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
    const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const startDay = Math.max(1, selectedDay - 3);
    const week = [];

    for (let i = 0; i < 7; i++) {
      const dayNum = startDay + i;
      if (dayNum <= daysInCurrentMonth) {
        const dateObj = new Date(currentYear, currentMonth, dayNum);
        const label = dayLabels[dateObj.getDay()];
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

        // Check if there are tasks on this day
        const dayDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        const dayTasks = tasks.filter(t => t.prazo && t.prazo.startsWith(dayDateStr));

        week.push({
          num: dayNum,
          label,
          isWeekend,
          hasTasks: dayTasks.length > 0,
          taskCount: dayTasks.length
        });
      }
    }
    return week;
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;

    const newTask: Task = {
      id: "task-" + Date.now(),
      titulo: eventTitle,
      descricao: eventDesc || "Sem descrição.",
      id_responsavel: eventAssignee || profiles[0]?.id || "",
      prazo: eventDate,
      tempo_inicio: eventHour,
      status: "pending",
      progresso: 0,
      prioridade: eventPriority,
      projeto: eventProj || "Vasrouse OS",
      anexos: [],
      comentarios: []
    };

    onAddTask(newTask);
    setShowAddModal(false);

    // Reset form
    setEventTitle("");
    setEventDesc("");
    setEventPriority("Alta");
    setEventProj("Vasrouse OS");
    setEventHour("09:00");
  };

  // Filter tasks based on view mode and status filter
  const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  const filteredByDateTasks = tasks.filter(t => {
    if (!t.prazo) return true;
    if (viewMode === 'dia') {
      return t.prazo.startsWith(selectedDateStr);
    }
    if (viewMode === 'semana') {
      return t.prazo.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
    }
    // Month view
    return t.prazo.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
  });

  const finalFilteredTasks = filteredByDateTasks.filter(t => {
    if (statusFilter === 'todas') return true;
    if (statusFilter === 'pending') return t.status === 'pending' || t.status === 'review';
    return t.status === statusFilter;
  });

  const inProgressTasks = finalFilteredTasks.filter(t => t.status === "in_progress");
  const pendingTasks = finalFilteredTasks.filter(t => t.status === "pending" || t.status === "review");
  const completedTasks = finalFilteredTasks.filter(t => t.status === "completed");

  return (
    <div id="calendar-container" className="space-y-6">
      
      {/* View Header with 2026 Year & Month Controls */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Calendário</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary border border-primary/20 text-xs font-bold">
              Ano 2026
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button 
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
              title="Mês Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-semibold text-white">
              {MONTH_NAMES[currentMonth]} de {currentYear}
            </p>
            <button 
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
              title="Próximo Mês"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Dia / Semana / Mês) & New Event Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#16161F] border border-white/10 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('dia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'dia'
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('semana')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'semana'
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('mes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'mes'
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              Mês
            </button>
          </div>

          <button
            onClick={() => {
              setEventDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`);
              setEventAssignee(activeProfileId || allowedAssignees[0]?.id || profiles[0]?.id || "");
              setShowAddModal(true);
            }}
            className="bg-primary-container text-white h-10 px-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md text-xs font-bold uppercase tracking-wider"
          >
            <Plus size={16} />
            <span>Novo Evento</span>
          </button>
        </div>
      </section>

      {/* Date Navigation Grid based on View Mode */}
      {viewMode === 'semana' && (
        <section className="overflow-x-auto no-scrollbar pb-2">
          <div className="flex gap-2.5 min-w-max md:grid md:grid-cols-7 md:w-full">
            {getWeekDays().map(d => {
              const isActive = d.num === selectedDay;

              return (
                <button
                  key={d.num}
                  onClick={() => setSelectedDay(d.num)}
                  className={`flex flex-col items-center justify-center w-20 h-20 md:w-auto rounded-xl border transition-all ${
                    isActive 
                      ? "bg-primary-container text-white border-primary-container shadow-[0_0_15px_rgba(90,82,163,0.3)] scale-[1.02]" 
                      : "bg-[#16161F] border-white/5 hover:border-primary-container/40 text-on-surface-variant"
                  } ${d.isWeekend ? "opacity-60" : ""}`}
                >
                  <span className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${isActive ? "text-[#d7d1ff]" : "text-on-surface-variant"}`}>
                    {d.label}
                  </span>
                  <span className="text-lg font-bold text-white">
                    {d.num}
                  </span>
                  {d.hasTasks && (
                    <span className="mt-1 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-secondary text-surface text-black">
                      {d.taskCount} {d.taskCount === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {viewMode === 'mes' && (
        <section className="bg-[#16161F] border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <span key={day} className="text-xs font-bold text-on-surface-variant uppercase tracking-wider py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Empty padding cells for first day of week */}
            {Array.from({ length: getFirstDayOfWeek(currentYear, currentMonth) }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 bg-transparent"></div>
            ))}
            {/* Days of month */}
            {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTasks = tasks.filter(t => t.prazo && t.prazo.startsWith(dateStr));
              const isSelected = dayNum === selectedDay;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-12 rounded-lg p-1 flex flex-col items-center justify-between border transition-all ${
                    isSelected
                      ? "bg-primary-container text-white border-primary-container"
                      : "bg-[#0D0D11]/50 border-white/5 hover:border-white/20 text-on-surface-variant"
                  }`}
                >
                  <span className="text-xs font-bold">{dayNum}</span>
                  {dayTasks.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-secondary shadow-sm mb-1"></span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Task Status Filters Bar */}
      <section className="flex flex-wrap items-center justify-between gap-3 bg-[#16161F] border border-white/5 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-primary" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Filtrar Estado:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter('todas')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'todas'
                ? "bg-white/15 text-white border border-white/20"
                : "text-on-surface-variant hover:text-white bg-transparent"
            }`}
          >
            Todas ({filteredByDateTasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'in_progress'
                ? "bg-secondary/20 text-secondary border border-secondary/30"
                : "text-on-surface-variant hover:text-white bg-transparent"
            }`}
          >
            Em Progresso ({filteredByDateTasks.filter(t => t.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'pending'
                ? "bg-error/20 text-error border border-error/30"
                : "text-on-surface-variant hover:text-white bg-transparent"
            }`}
          >
            Pendentes ({filteredByDateTasks.filter(t => t.status === 'pending' || t.status === 'review').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'completed'
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-on-surface-variant hover:text-white bg-transparent"
            }`}
          >
            Concluídas ({filteredByDateTasks.filter(t => t.status === 'completed').length})
          </button>
        </div>
      </section>

      {/* Main Task Lists Grouped by Status */}
      <div className="space-y-6">
        
        {finalFilteredTasks.length === 0 ? (
          <div className="bg-[#16161F] border border-white/5 rounded-xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto flex items-center justify-center text-on-surface-variant">
              <CalendarIcon size={24} />
            </div>
            <h3 className="text-base font-semibold text-white">Nenhuma tarefa agendada</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              Não existem tarefas para o período selecionado ({selectedDay} de {MONTH_NAMES[currentMonth]} de {currentYear}). Use o botão "Novo Evento" para agendar atividades.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Section 1: Em Progresso / A Executar */}
            {(statusFilter === 'todas' || statusFilter === 'in_progress') && inProgressTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <PlayCircle size={18} className="text-secondary" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    A Executar / Em Progresso ({inProgressTasks.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inProgressTasks.map(t => (
                    <TaskCalendarCard key={t.id} task={t} profiles={profiles} onTaskClick={onTaskClick} />
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Pendentes / Em Análise */}
            {(statusFilter === 'todas' || statusFilter === 'pending') && pendingTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Clock3 size={18} className="text-error" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Pendentes ({pendingTasks.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingTasks.map(t => (
                    <TaskCalendarCard key={t.id} task={t} profiles={profiles} onTaskClick={onTaskClick} />
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Concluídas */}
            {(statusFilter === 'todas' || statusFilter === 'completed') && completedTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Concluídas ({completedTasks.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedTasks.map(t => (
                    <TaskCalendarCard key={t.id} task={t} profiles={profiles} onTaskClick={onTaskClick} />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* New Event Scheduling Dialog */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-[#0D0D11]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#16161F] border border-white/10 rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon size={20} className="text-secondary" />
              Agendar Novo Evento / Tarefa
            </h3>
            <p className="text-xs text-on-surface-variant">Defina a data e horário para a execução no calendário (Ano 2026).</p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Título da Tarefa</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                  placeholder="Ex: Reunião de Planeamento Estratégico"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Descrição</label>
                <textarea 
                  rows={2}
                  className="w-full bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-primary-container resize-none"
                  placeholder="Explique resumidamente o objetivo ou escopo..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Data</label>
                  <input 
                    type="date" 
                    required
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Horário</label>
                  <input 
                    type="time" 
                    required
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    value={eventHour}
                    onChange={(e) => setEventHour(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Responsável</label>
                <select 
                  className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-2 focus:outline-none focus:border-primary-container"
                  value={eventAssignee}
                  onChange={(e) => setEventAssignee(e.target.value)}
                >
                  {allowedAssignees.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.id === activeProfileId ? "(Você)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Prioridade</label>
                  <select 
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-2 focus:outline-none"
                    value={eventPriority}
                    onChange={(e) => setEventPriority(e.target.value as any)}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta (Urgente)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Projeto</label>
                  <input 
                    type="text" 
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none"
                    placeholder="Vasrouse OS"
                    value={eventProj}
                    onChange={(e) => setEventProj(e.target.value)}
                  />
                </div>
              </div>

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
                  className="flex-1 h-10 bg-primary-container text-white font-bold text-sm rounded-lg hover:brightness-110 transition-all"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Tracking Section */}
      <section className="bg-[#16161F] border border-white/5 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock size={18} className="text-secondary" />
            Registo de Assiduidade
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const now = new Date();
                const newAttendance: Attendance = {
                  id: `att-${Date.now()}`,
                  id_usuario: activeProfileId || "",
                  data: selectedDateStr,
                  hora_entrada: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                };
                setAttendances(prev => [...prev, newAttendance]);
              }}
              className="bg-secondary text-surface text-xs font-bold px-3 py-1.5 rounded-lg hover:brightness-110"
            >
              Registrar Entrada
            </button>
            <button 
              onClick={() => {
                const now = new Date();
                const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                setAttendances(prev => prev.map(a => a.data === selectedDateStr && a.id_usuario === activeProfileId && !a.hora_saida ? {...a, hora_saida: time} : a));
              }}
              className="bg-primary-container text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:brightness-110"
            >
              Registrar Saída
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {attendances
            .filter(a => (currentRole === 'admin' || currentRole === 'leader' || a.id_usuario === activeProfileId) && a.data === selectedDateStr)
            .map(a => {
              const user = profiles.find(p => p.id === a.id_usuario);
              return (
                <div key={a.id} className="flex items-center justify-between p-3 bg-[#0D0D11]/50 rounded-lg border border-white/5">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-on-surface-variant" />
                    <span className="text-xs text-white font-medium">{user?.name || "Desconhecido"}</span>
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Entrada: {a.hora_entrada} | Saída: {a.hora_saida || "--:--"}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

    </div>
  );
}

interface TaskCalendarCardProps {
  key?: React.Key;
  task: Task;
  profiles: Profile[];
  onTaskClick: (id: string) => void;
}

function TaskCalendarCard({ task, profiles, onTaskClick }: TaskCalendarCardProps) {
  const assignee = profiles.find(p => p.id === task.id_responsavel);
  const isCompleted = task.status === 'completed';
  const isInProgress = task.status === 'in_progress';

  return (
    <div 
      onClick={() => onTaskClick(task.id)}
      className="bg-[#16161F] border border-white/5 hover:border-white/15 rounded-xl p-4 transition-all cursor-pointer hover:scale-[1.01] space-y-3"
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-white text-sm hover:text-secondary transition-colors line-clamp-1">
          {task.titulo}
        </h4>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
          isCompleted 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : isInProgress
            ? "bg-secondary/10 text-secondary border border-secondary/20"
            : "bg-error/10 text-error border border-error/20"
        }`}>
          {isCompleted ? "Concluída" : isInProgress ? "Em Progresso" : "Pendente"}
        </span>
      </div>

      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
        {task.descricao}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-primary" />
          <span>{task.prazo || "Sem prazo"}</span>
        </div>

        {assignee && (
          <div className="flex items-center gap-1.5">
            <img src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full object-cover" />
            <span className="text-[11px] font-medium text-white">{assignee.name.split(" ")[0]}</span>
          </div>
        )}

      </div>
    </div>
  );
}
