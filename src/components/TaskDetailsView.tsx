/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ArrowLeft, MoreVertical, Calendar, Folder, Users, Paperclip, Send, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { Task, Profile, Comment, Attachment } from "../types";

interface TaskDetailsViewProps {
  task: Task;
  profiles: Profile[];
  activeProfile: Profile;
  onBack: () => void;
  onUpdateTask: (updatedTask: Task) => void;
}

export default function TaskDetailsView({ task, profiles, activeProfile, onBack, onUpdateTask }: TaskDetailsViewProps) {
  const [commentText, setCommentText] = useState("");
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [newAttName, setNewAttName] = useState("");
  const [newAttType, setNewAttType] = useState<'image' | 'file'>("file");

  if (!task) {
    return (
      <div className="p-12 text-center space-y-4 bg-[#16161F] border border-white/5 rounded-2xl max-w-lg mx-auto mt-10">
        <h3 className="text-lg font-bold text-white">Nenhuma tarefa selecionada</h3>
        <p className="text-xs text-on-surface-variant">Crie ou selecione uma tarefa no calendário para visualizar os detalhes.</p>
        <button 
          onClick={onBack}
          className="px-5 py-2.5 bg-[#5A52A3] hover:bg-[#4E4693] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
        >
          Voltar ao Calendário
        </button>
      </div>
    );
  }

  // Format ISO string date beautifully
  const formatTaskDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "24 Out, 2023";
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: "comm-" + Date.now(),
      id_autor: activeProfile?.id || "user",
      nome_autor: activeProfile?.name || "Usuário",
      avatar_autor: activeProfile?.avatar || "",
      data: "Agora mesmo",
      texto: commentText
    };

    const updatedTask: Task = {
      ...task,
      comentarios: [...task.comentarios, newComment]
    };

    onUpdateTask(updatedTask);
    setCommentText("");
  };

  const handleAddAttachmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttName.trim()) return;

    const newAtt: Attachment = {
      id: "att-" + Date.now(),
      nome: newAttName + (newAttType === "image" ? ".png" : ".pdf"),
      tamanho: "850 KB",
      tipo: newAttType
    };

    const updatedTask: Task = {
      ...task,
      anexos: [...task.anexos, newAtt]
    };

    onUpdateTask(updatedTask);
    setNewAttName("");
    setShowAddAttachment(false);
  };

  const handleStatusChange = (status: Task['status']) => {
    // Automatically calculate start and end stamps
    let tempo_inicio = task.tempo_inicio;
    let tempo_fim = task.tempo_fim;

    if (status === "in_progress" && !tempo_inicio) {
      tempo_inicio = new Date().toISOString();
    }
    if (status === "completed") {
      tempo_fim = new Date().toISOString();
    }

    const updatedTask: Task = {
      ...task,
      status,
      progresso: status === "completed" ? 100 : task.progresso === 100 ? 50 : task.progresso,
      tempo_inicio,
      tempo_fim
    };
    onUpdateTask(updatedTask);
  };

  const handleProgressChange = (prog: number) => {
    const updatedTask: Task = {
      ...task,
      progresso: prog,
      status: prog === 100 ? "completed" : prog > 0 ? "in_progress" : "pending"
    };
    onUpdateTask(updatedTask);
  };

  return (
    <div id="task-details-container" className="max-w-4xl mx-auto bg-[#0D0D11] min-h-screen pb-24 text-on-background relative flex flex-col">
      
      {/* View Sticky Sub-Header with Action Triggers */}
      <header className="sticky top-0 z-40 bg-surface-dim/85 backdrop-blur-md border-b border-white/10 flex items-center h-16 px-4">
        <button 
          onClick={onBack}
          aria-label="Voltar"
          className="flex items-center justify-center w-12 h-12 text-on-surface-variant hover:bg-white/5 rounded-full transition-all active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="ml-3 font-semibold text-white text-lg flex-1 truncate">Detalhes da Tarefa</h1>
        <button 
          aria-label="Mais Opções"
          className="flex items-center justify-center w-12 h-12 text-on-surface-variant hover:bg-white/5 rounded-full transition-all active:scale-95"
        >
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Main Panel Content Area */}
      <div className="p-4 sm:p-6 space-y-6 flex-1">
        
        {/* Task Header Information */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <h2 className="font-bold text-white text-xl md:text-2xl leading-tight">
              {task.titulo}
            </h2>
            <span className="self-start inline-flex items-center justify-center px-3 py-1 bg-primary-container text-on-primary-container rounded-sm font-semibold text-xs whitespace-nowrap">
              {task.prioridade === "Alta" ? "Alta Prioridade" : task.prioridade === "Média" ? "Média Prioridade" : "Prioridade Comum"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-on-surface-variant text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-primary" />
              <span>Vence em {formatTaskDate(task.prazo)}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-outline-variant hidden md:block"></div>
            <div className="flex items-center gap-1.5">
              <Folder size={16} className="text-secondary" />
              <span>{task.projeto} Project</span>
            </div>
          </div>

          {/* Assignees list */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Responsáveis</span>
            <div className="flex -space-x-2">
              {profiles.filter(p => p.id === task.id_responsavel).map(p => (
                <img 
                  key={p.id}
                  src={p.avatar} 
                  alt={p.name} 
                  className="w-8 h-8 rounded-full border-2 border-[#0D0D11] object-cover" 
                />
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#0D0D11] bg-surface-container-high flex items-center justify-center text-xs font-medium text-on-surface-variant">
                +2
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic status and progress managers */}
        <section className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Estado Operacional</span>
            
            <div className="flex flex-wrap gap-1.5">
              {(["pending", "in_progress", "review", "completed"] as const).map(st => {
                const isCurrent = task.status === st;
                const label = st === "pending" ? "Pendente" : st === "in_progress" ? "Em Curso" : st === "review" ? "Em Revisão" : "Concluída";
                const activeStyle = st === "completed" 
                  ? "bg-green-500/20 text-green-300 border-green-500/30" 
                  : st === "review" 
                  ? "bg-primary-container/40 text-white border-primary-container" 
                  : st === "in_progress" 
                  ? "bg-secondary/20 text-secondary border-secondary/30" 
                  : "bg-white/5 text-on-surface-variant border-white/5";

                return (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isCurrent ? activeStyle : "bg-transparent border-white/5 text-on-surface-variant hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-3">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Grau de Execução</span>
              <span className="font-bold text-white">{task.progresso}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              step="5"
              className="w-full accent-primary bg-background h-1.5 rounded-lg appearance-none cursor-pointer"
              value={task.progresso}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
            />
          </div>
        </section>

        {/* Task Description */}
        <section className="bg-surface-container p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Descrição</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-normal whitespace-pre-wrap">
            {task.descricao}
          </p>
        </section>

        {/* Attachments Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Anexos</h3>
            <button 
              onClick={() => setShowAddAttachment(!showAddAttachment)}
              className="text-primary hover:text-white transition-colors font-bold text-xs flex items-center gap-1"
            >
              <Paperclip size={14} />
              <span>Adicionar</span>
            </button>
          </div>

          {showAddAttachment && (
            <form onSubmit={handleAddAttachmentSubmit} className="p-4 bg-surface-container rounded-xl border border-primary-container/30 flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] text-on-surface-variant block uppercase font-bold">Nome do Anexo</label>
                <input 
                  type="text"
                  required
                  placeholder="ex: especificação-figma"
                  className="w-full h-9 bg-background border border-white/10 text-xs rounded-lg px-2.5 text-white"
                  value={newAttName}
                  onChange={(e) => setNewAttName(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-28 space-y-1">
                <label className="text-[10px] text-on-surface-variant block uppercase font-bold">Tipo</label>
                <select
                  className="w-full h-9 bg-background border border-white/10 text-xs rounded-lg px-2 text-white"
                  value={newAttType}
                  onChange={(e) => setNewAttType(e.target.value as any)}
                >
                  <option value="file">Ficheiro (PDF)</option>
                  <option value="image">Imagem (PNG)</option>
                </select>
              </div>
              <button 
                type="submit"
                className="h-9 px-4 bg-primary-container text-white text-xs font-bold rounded-lg hover:brightness-110 w-full sm:w-auto"
              >
                Anexar
              </button>
            </form>
          )}

          {/* Bento-style Attachments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {task.anexos.map(att => (
              <div 
                key={att.id} 
                className="bg-surface-container rounded-xl border border-white/5 p-4 flex items-center gap-3.5 hover:border-primary-container/40 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded bg-[#0D0D11] flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-white transition-all">
                  {att.tipo === "image" ? <ImageIcon size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{att.nome}</p>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{att.tamanho}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comments Feed section */}
        <section className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Feed de Comentários</h3>
          
          <div className="space-y-5">
            {task.comentarios.length === 0 ? (
              <div className="p-6 bg-surface-container/20 rounded-xl text-center text-xs text-on-surface-variant border border-white/5">
                Não há comentários neste prazo. Comece o debate abaixo!
              </div>
            ) : (
              task.comentarios.map(comm => (
                <div key={comm.id} className="flex gap-3">
                  <img 
                    src={comm.avatar_autor} 
                    alt={comm.nome_autor} 
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5 border border-white/5" 
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className="font-semibold text-xs text-white">{comm.nome_autor}</span>
                      <span className="text-[10px] text-on-surface-variant">{comm.data}</span>
                    </div>
                    <div className="bg-[#16161F] p-3 rounded-xl rounded-tl-none border border-white/5 inline-block max-w-full">
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {comm.texto}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {/* Sticky Comment Input Area at the bottom */}
      <div className="sticky bottom-0 z-40 bg-surface-dim/95 backdrop-blur-md border-t border-white/10 p-4 mt-auto">
        <form onSubmit={handlePostComment} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative bg-surface-container rounded-lg border border-white/10 focus-within:border-primary-container transition-colors">
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-white text-xs p-3.5 pr-10 resize-none min-h-[44px] max-h-[120px] rounded-lg focus:outline-none"
              placeholder="Adicionar um comentário..."
              rows={1}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePostComment(e);
                }
              }}
            />
            <div className="absolute bottom-2.5 right-3 flex items-center">
              <button 
                type="button"
                className="p-1 text-on-surface-variant hover:text-white transition-colors"
                title="Anexar ficheiro"
              >
                <Paperclip size={16} />
              </button>
            </div>
          </div>
          
          <button 
            type="submit"
            className="h-11 px-5 bg-primary-container text-white rounded-lg font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center flex-shrink-0 gap-1.5"
          >
            <Send size={14} />
            <span>Enviar</span>
          </button>
        </form>
      </div>

    </div>
  );
}
