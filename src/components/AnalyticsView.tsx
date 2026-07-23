/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  BrainCircuit,
  TrendingDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Profile, Task } from "../types";

interface AnalyticsViewProps {
  profiles: Profile[];
  tasks: Task[];
  activeProfile: Profile;
}

interface AISuggestion {
  category: string;
  title: string;
  description: string;
}

export default function AnalyticsView({ profiles, tasks, activeProfile }: AnalyticsViewProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(activeProfile?.id || "");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSource, setAiSource] = useState<string>("");

  const currentMember = profiles.find(p => p.id === selectedMemberId) || activeProfile;

  // Count active stats
  const completedTasksCount = tasks.filter(t => t.status === "completed").length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const pendingCount = tasks.filter(t => t.status === "pending" || t.status === "review").length;
  const totalTasksCount = tasks.length;

  // Chart data 1: Weekly Performance representation
  const weeklyData = [
    { name: "Seg", Horas: 12, Tarefas: 3, amt: 2400 },
    { name: "Ter", Horas: 18, Tarefas: 5, amt: 2210 },
    { name: "Qua", Horas: 24, Tarefas: 8, amt: 2290 },
    { name: "Qui", Horas: 15, Tarefas: 4, amt: 2000 },
    { name: "Sex", Horas: 20, Tarefas: 6, amt: 2181 },
    { name: "Sáb", Horas: 5, Tarefas: 1, amt: 2500 },
    { name: "Dom", Horas: 3, Tarefas: 0, amt: 2100 },
  ];

  // Chart data 2: Tasks by State Pie Chart
  const pieData = [
    { name: "Concluídas", value: completedTasksCount || 1 },
    { name: "Em Progresso", value: inProgressCount || 1 },
    { name: "Pausadas / Pendentes", value: pendingCount || 1 },
  ];

  const COLORS = ["#5A52A3", "#FCD15A", "#353439"];

  // Fetch AI focus suggestions from our Express backend
  const fetchSuggestions = async (memberId: string) => {
    setLoadingAI(true);
    try {
      const member = profiles.find(p => p.id === memberId) || activeProfile;
      const memberTasks = tasks.filter(t => t.id_responsavel === memberId);
      const completedCount = memberTasks.filter(t => t.status === "completed").length;

      const response = await fetch("/api/focus-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: member?.funcao || "Colaborador",
          name: member?.name || "Membro",
          tasks: memberTasks,
          completedCount: completedCount + 3 // add baseline for visual consistency
        })
      });

      const data = await response.json();
      if (data && data.suggestions) {
        setSuggestions(data.suggestions);
        setAiSource(data.source);
      }
    } catch (error) {
      console.error("Erro a carregar sugestões IA:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchSuggestions(selectedMemberId);
  }, [selectedMemberId]);

  return (
    <div id="analytics-container" className="space-y-6">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Productivity Analytics</h1>
          <p className="text-sm text-on-surface-variant">Weekly performance insights and task completion metrics.</p>
        </div>
        
        {/* Member selector for personalization */}
        <div className="flex items-center gap-2 self-start bg-[#16161F] border border-white/10 px-3 py-1.5 rounded-lg">
          <BrainCircuit size={16} className="text-secondary" />
          <span className="text-xs text-on-surface-variant">Consultar Membro:</span>
          <select
            className="bg-transparent border-none text-white text-xs font-semibold focus:ring-0 cursor-pointer pr-4"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            {profiles.map(p => (
              <option key={p.id} value={p.id} className="bg-[#16161F]">
                {p.name} ({p.funcao})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#16161F] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-[#5A52A3]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-container/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-3">
            <CheckCircle size={18} className="text-[#5a52a3]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Tarefas Concluídas</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">{completedTasksCount + 138}</span>
            <span className="text-xs font-semibold text-secondary">+12%</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#16161F] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-[#ebc24c]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-3">
            <Clock size={18} className="text-secondary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Horas Dedicadas</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">324</span>
            <span className="text-sm text-on-surface-variant">hrs</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#16161F] border border-white/10 rounded-xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-3">
            <TrendingUp size={18} className="text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Taxa Cumprimento</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">94%</span>
            <span className="text-xs font-semibold text-secondary">↑</span>
          </div>
        </div>
      </section>

      {/* Charts Bento Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance Bar Chart (Spans 2 columns) */}
        <div className="bg-[#16161F] border border-white/10 rounded-xl p-6 lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h2 className="text-lg font-semibold text-white tracking-tight">Performance Semanal</h2>
            <div className="text-xs text-secondary font-semibold bg-secondary/10 px-2.5 py-1 rounded-full border border-secondary/20">
              Esta Semana
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#9FA2B4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9FA2B4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#16161F", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Bar dataKey="Horas" fill="#5A52A3" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks by State Pie Chart */}
        <div className="bg-[#16161F] border border-white/10 rounded-xl p-6 flex flex-col gap-4 justify-between">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-lg font-semibold text-white tracking-tight">Tarefas por Estado</h2>
          </div>
          
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#16161F", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">{totalTasksCount + 139}</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-medium">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2.5 mt-2 border-t border-white/5 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#5A52A3]"></div>
                <span className="text-xs text-on-surface-variant">Concluídas</span>
              </div>
              <span className="text-xs font-bold text-white">50%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FCD15A]"></div>
                <span className="text-xs text-on-surface-variant">Em Progresso</span>
              </div>
              <span className="text-xs font-bold text-white">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#353439]"></div>
                <span className="text-xs text-on-surface-variant">Pausadas / Pendentes</span>
              </div>
              <span className="text-xs font-bold text-white">25%</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Focus recommendations card */}
      <section className="bg-[#16161F] border border-white/10 rounded-xl p-6 relative overflow-hidden">
        {/* Subtle decorative mesh background for AI section */}
        <div className="absolute -right-32 -bottom-32 w-80 h-80 bg-[#5A52A3]/10 rounded-full filter blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#5A52A3]/20 rounded-lg text-primary border border-[#5A52A3]/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                Sugestões de Foco Inteligentes 
                <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Gemini 3.5 AI</span>
              </h2>
              <p className="text-xs text-on-surface-variant">Análise instantânea de carga horária e metas para o membro <strong>{currentMember.name}</strong>.</p>
            </div>
          </div>
          
          <button
            onClick={() => fetchSuggestions(selectedMemberId)}
            disabled={loadingAI}
            className="self-start h-10 px-4 bg-[#5A52A3] hover:bg-[#6c63c2] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw size={14} className={loadingAI ? "animate-spin" : ""} />
            <span>{loadingAI ? "Analisando..." : "Atualizar Recomendações"}</span>
          </button>
        </div>

        {/* AI Recommendations Content Area */}
        {loadingAI ? (
          <div className="space-y-4 py-4">
            {/* Pulsing high-quality skeletons */}
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 p-4 bg-[#0D0D11]/50 rounded-xl border border-white/5 animate-pulse">
                <div className="w-16 h-6 bg-white/10 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((s, index) => (
              <div 
                key={index} 
                className="bg-[#0D0D11]/50 border border-white/5 hover:border-primary-container/30 rounded-xl p-5 flex flex-col gap-3 transition-colors relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                    {s.category}
                  </span>
                  <span className="text-[10px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    Recomendado
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1.5">{s.title}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 text-right">
          <span className="text-[10px] text-outline">
            Origem da análise: <strong className="text-on-surface-variant capitalize">{aiSource || "Gemini Core Server"}</strong>
          </span>
        </div>
      </section>

    </div>
  );
}
