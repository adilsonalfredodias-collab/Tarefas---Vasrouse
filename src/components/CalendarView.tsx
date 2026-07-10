/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, AlertCircle, Video, MoreVertical, Calendar as CalendarIcon, Clock, Layers } from "lucide-react";
import { Task, Profile } from "../types";

interface CalendarViewProps {
  tasks: Task[];
  profiles: Profile[];
  currentRole: 'admin' | 'leader' | 'member';
  onTaskClick: (taskId: string) => void;
  onAddTask: (newTask: Task) => void;
}

export default function CalendarView({ tasks, profiles, currentRole, onTaskClick, onAddTask }: CalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState(17); // Default is Ter 17
  const [showAddEventModal, setShowAddModal] = useState(false);

  // Add event form fields
  const [eventTitle, setEventEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventAssignee, setEventAssignee] = useState(profiles[0]?.id || "");
  const [eventPriority, setEventPriority] = useState<'Baixa' | 'Média' | 'Alta'>("Alta");
  const [eventProj, setEventProj] = useState("Nexus");
  const [eventHour, setEventHour] = useState("09:00");
  const [eventDate, setEventDate] = useState(`2026-07-${String(selectedDay).padStart(2, '0')}`);

  const days = [
    { num: 16, label: "Seg", dots: [] },
    { num: 17, label: "Ter", dots: ["white"] }, // Active/Today
    { num: 18, label: "Qua", dots: ["red"] },
    { num: 19, label: "Qui", dots: ["yellow", "purple"] },
    { num: 20, label: "Sex", dots: [] },
    { num: 21, label: "Sáb", dots: [], weekend: true },
    { num: 22, label: "Dom", dots: [], weekend: true },
  ];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;

    const newTask: Task = {
      id: "task-" + Date.now(),
      titulo: eventTitle,
      descricao: eventDesc || "Sem descrição.",
      id_responsavel: eventAssignee || profiles[0]?.id,
      prazo: `${eventDate}T${eventHour}:00.000Z`,
      status: "pending",
      progresso: 0,
      prioridade: eventPriority,
      projeto: eventProj || "Nexus",
      anexos: [],
      comentarios: []
    };

    onAddTask(newTask);
    setShowAddModal(false);

    // Reset form
    setEventEventTitle("");
    setEventDesc("");
    setEventPriority("Alta");
    setEventProj("Nexus");
    setEventHour("09:00");
  };

  return (
    <div id="calendar-container" className="space-y-6">
      
      {/* View Header */}
      <section className="flex justify-between items-end mb-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendário</h1>
          <p className="text-sm text-on-surface-variant mt-1">Outubro 2023</p>
        </div>

        {/* Create event trigger button */}
        {(currentRole === 'admin' || currentRole === 'leader') && (
          <button
            onClick={() => {
              setEventDate(`2026-07-${String(selectedDay).padStart(2, '0')}`);
              setShowAddModal(true);
            }}
            className="bg-primary-container text-white h-12 px-4 sm:px-5 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-md"
          >
            <Plus size={18} />
            <span className="hidden sm:inline font-semibold text-xs uppercase tracking-wider">Novo Evento</span>
          </button>
        )}
      </section>

      {/* Horizontal Date Picker */}
      <section className="overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2.5 min-w-max md:grid md:grid-cols-7 md:w-full">
          {days.map(d => {
            const isActive = d.num === selectedDay;
            const isWeekend = d.weekend;

            return (
              <button
                key={d.num}
                onClick={() => setSelectedDay(d.num)}
                className={`flex flex-col items-center justify-center w-16 h-20 md:w-auto rounded-xl border transition-all ${
                  isActive 
                    ? "bg-primary-container text-white border-primary-container shadow-[0_0_15px_rgba(90,82,163,0.3)] scale-[1.02]" 
                    : "bg-[#16161F] border-white/5 hover:border-primary-container/40 text-on-surface-variant"
                } ${isWeekend ? "opacity-60" : ""}`}
              >
                <span className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${isActive ? "text-[#d7d1ff]" : "text-on-surface-variant"}`}>
                  {d.label}
                </span>
                <span className="text-lg font-bold text-white">
                  {d.num}
                </span>
                
                {/* Specific active indicator dots */}
                {d.dots.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {d.dots.map((dot, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full ${
                          dot === "white" ? "bg-white" :
                          dot === "red" ? "bg-error" :
                          dot === "yellow" ? "bg-secondary" : "bg-primary"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Timeline list of Critical Deadlines */}
        <section className="md:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-error" />
              Prazos Críticos
            </h3>
            <span className="text-xs text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full border border-white/5">
              Dia {selectedDay}
            </span>
          </div>

          <div className="relative pl-1">
            {/* Timeline Vertical linking bar */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-outline-variant/30 z-0"></div>

            {/* List of critical task events mapped from our operational list */}
            {tasks.map((t, idx) => {
              // Custom colors for nodes based on priority / status
              const isUrgent = t.prioridade === "Alta";
              const isMeeting = t.titulo.toLowerCase().includes("review") || t.titulo.toLowerCase().includes("sprint");
              const isDesign = !isUrgent && !isMeeting;

              const nodeColor = isUrgent ? "border-error" : isMeeting ? "border-secondary" : "border-primary";
              const nodeGlow = isUrgent ? "shadow-[0_0_10px_rgba(255,180,171,0.3)]" : isMeeting ? "shadow-[0_0_10px_rgba(235,194,76,0.3)]" : "shadow-[0_0_10px_rgba(198,191,255,0.3)]";

              // Find assignee avatar
              const assignee = profiles.find(p => p.id === t.id_responsavel);

              return (
                <div key={t.id} className="flex relative items-start gap-4 mb-8 last:mb-0 group z-10">
                  
                  {/* Time label */}
                  <div className="w-12 pt-1.5 flex-shrink-0 text-right">
                    <span className="text-[11px] font-semibold text-on-surface-variant block">
                      {idx === 0 ? "09:00" : idx === 1 ? "11:30" : "14:00"}
                    </span>
                    {idx === 1 && (
                      <span className="text-[10px] text-on-surface-variant opacity-50 block mt-0.5">
                        12:30
                      </span>
                    )}
                  </div>

                  {/* Circular Node */}
                  <div className="w-4 h-12 flex items-start justify-center flex-shrink-0 pt-2">
                    <div className={`w-3.5 h-3.5 rounded-full bg-[#16161F] border-2 ${nodeColor} ${nodeGlow} z-10`} />
                  </div>

                  {/* Deadline Card */}
                  <div 
                    onClick={() => onTaskClick(t.id)}
                    className="flex-1 bg-[#16161F] border border-white/5 hover:border-white/15 rounded-xl p-5 hover:scale-[1.01] hover:shadow-2xl transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-white text-base group-hover:text-secondary transition-colors truncate">
                        {t.titulo}
                      </h4>
                      <button className="text-on-surface-variant hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
                      {t.descricao}
                    </p>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {isUrgent ? (
                          <span className="px-2 py-0.5 rounded bg-error/10 text-error border border-error/20 text-[10px] font-bold">
                            Urgente
                          </span>
                        ) : isMeeting ? (
                          <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-bold">
                            Reunião
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                            Design
                          </span>
                        )}
                        
                        <span className="px-2 py-0.5 rounded bg-[#1f1f23] text-on-surface-variant border border-white/5 text-[10px] font-bold uppercase tracking-wider">
                          Proj: {t.projeto}
                        </span>
                        
                        {isMeeting && (
                          <span className="px-2 py-0.5 rounded bg-[#1f1f23] text-on-surface-variant border border-white/5 text-[10px] font-bold flex items-center gap-1">
                            <Video size={10} />
                            Sala A
                          </span>
                        )}
                      </div>

                      {/* Member avatars */}
                      {assignee && (
                        <div className="flex -space-x-1.5 flex-shrink-0">
                          <img 
                            src={assignee.avatar} 
                            alt={assignee.name} 
                            className="w-7 h-7 rounded-full object-cover border-2 border-[#16161F]" 
                          />
                          {isUrgent && (
                            <div className="w-7 h-7 rounded-full border-2 border-[#16161F] bg-[#1f1f23] flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                              +2
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Bento style desktop widgets */}
        <section className="hidden md:flex flex-col gap-6 col-span-4 mt-12">
          
          {/* Mini Calendar Context */}
          <div className="bg-[#16161F] border border-white/10 rounded-xl p-5 space-y-4">
            <h4 className="font-semibold text-white text-sm tracking-tight flex items-center gap-2">
              <CalendarIcon size={16} className="text-primary" />
              Visão Geral
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#0D0D11]/40 rounded-lg p-3 border border-white/5">
                <span className="text-3xl font-extrabold text-error block">3</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium tracking-wide">Prazos Hoje</span>
              </div>
              <div className="bg-[#0D0D11]/40 rounded-lg p-3 border border-white/5">
                <span className="text-3xl font-extrabold text-primary block">{tasks.length + 9}</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-medium tracking-wide">Na Semana</span>
              </div>
            </div>
          </div>

          {/* Tomorrow Preview Teaser Widget */}
          <div className="bg-[#16161F] border border-white/10 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-white text-sm tracking-tight flex items-center gap-2">
              <Clock size={16} className="text-secondary" />
              Amanhã
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-2 bg-[#0D0D11]/30 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <span className="text-xs text-white font-medium">Sprint Planning</span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-semibold">10:00</span>
              </li>
              <li className="flex items-center justify-between p-2 bg-[#0D0D11]/30 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-xs text-white font-medium">Sync Devs</span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-semibold">14:30</span>
              </li>
            </ul>
          </div>
        </section>

      </div>

      {/* New Event Scheduling Dialog */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-[#0D0D11]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#16161F] border border-white/10 rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon size={20} className="text-secondary" />
              Agendar Novo Evento / Prazo
            </h3>
            <p className="text-xs text-on-surface-variant">Insira os dados operacionais e de prazo para o dia selecionado (Outubro {selectedDay}).</p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Título do Evento</label>
                <input 
                  type="text" 
                  required
                  className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                  placeholder="Design Review: Revisão Geral"
                  value={eventTitle}
                  onChange={(e) => setEventEventTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Descrição</label>
                <textarea 
                  rows={2}
                  className="w-full bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg p-3 focus:outline-none focus:border-primary-container resize-none"
                  placeholder="Explique resumidamente os tópicos que serão tratados..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Data de Entrega</label>
                  <input 
                    type="date" 
                    required
                    className="w-full h-10 bg-[#0D0D11] border border-white/10 text-white text-sm rounded-lg px-3 focus:outline-none focus:border-primary-container"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Horário de Entrega</label>
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
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
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
                    placeholder="Nexus"
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

    </div>
  );
}
