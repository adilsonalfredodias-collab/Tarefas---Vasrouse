/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Task, Profile } from "../types";
import { CheckCircle, Clock, PlayCircle } from "lucide-react";

interface DashboardViewProps {
  tasks: Task[];
  activeProfile: Profile;
  onTaskClick: (taskId: string) => void;
}

export default function DashboardView({ tasks, activeProfile, onTaskClick }: DashboardViewProps) {
  const myTasks = tasks.filter(t => t.id_responsavel === activeProfile.id);

  const pendingTasks = myTasks.filter(t => t.status === "pending" || t.status === "review");
  const inProgressTasks = myTasks.filter(t => t.status === "in_progress");
  const completedTasks = myTasks.filter(t => t.status === "completed");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Meu Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#16161F] border border-white/10 rounded-xl p-6">
          <h3 className="text-sm text-on-surface-variant uppercase tracking-wider mb-2">Pendentes</h3>
          <p className="text-3xl font-bold text-white">{pendingTasks.length}</p>
        </div>
        <div className="bg-[#16161F] border border-white/10 rounded-xl p-6">
          <h3 className="text-sm text-on-surface-variant uppercase tracking-wider mb-2">Em Progresso</h3>
          <p className="text-3xl font-bold text-white">{inProgressTasks.length}</p>
        </div>
        <div className="bg-[#16161F] border border-white/10 rounded-xl p-6">
          <h3 className="text-sm text-on-surface-variant uppercase tracking-wider mb-2">Concluídas</h3>
          <p className="text-3xl font-bold text-white">{completedTasks.length}</p>
        </div>
      </div>

      <section className="bg-[#16161F] border border-white/10 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Minhas Tarefas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTasks.map(task => (
            <div 
              key={task.id}
              onClick={() => onTaskClick(task.id)}
              className="bg-[#0D0D11]/50 border border-white/5 rounded-lg p-4 cursor-pointer hover:border-primary-container/30 transition-all"
            >
              <h4 className="font-semibold text-white">{task.titulo}</h4>
              <p className="text-xs text-on-surface-variant mt-1">{task.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
