import React, { useState, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Send,
  Eye,
  User as UserIcon
} from "lucide-react";
import { Task, Profile, DailyReport, DailyReportItem } from "../types";

interface ReportsViewProps {
  reports: DailyReport[];
  tasks: Task[];
  profiles: Profile[];
  activeProfile: Profile;
  onAddReport: (newReport: DailyReport) => void;
}

export default function ReportsView({
  reports,
  tasks,
  profiles,
  activeProfile,
  onAddReport
}: ReportsViewProps) {
  // Navigation & UI States
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  
  // Form States for creating a Daily Report
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  // List of items currently being added to the pending report
  const [pendingItems, setPendingItems] = useState<DailyReportItem[]>([]);
  
  // Single task-entry form states
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [itemStatus, setItemStatus] = useState<'pending' | 'in_progress' | 'review' | 'completed'>('in_progress');
  const [itemObservations, setItemObservations] = useState<string>("");
  const [itemAnexo, setItemAnexo] = useState<string>(""); // base64 string
  const [itemAnexoName, setItemAnexoName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Modal State for zooming attachments
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // File Upload base64 Conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem (PNG, JPG, etc).");
        return;
      }
      setItemAnexoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setItemAnexo(base64String);
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add individual task report entry to current pending report
  const handleAddPendingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      alert("Por favor, selecione uma tarefa.");
      return;
    }

    const taskObj = tasks.find(t => t.id === selectedTaskId);
    if (!taskObj) return;

    // Check if task is already in pending report
    if (pendingItems.some(item => item.id_tarefa === selectedTaskId)) {
      alert("Já adicionou um relatório para esta tarefa hoje. Pode atualizar a entrada existente removendo-a e adicionando de novo.");
      return;
    }

    const newItem: DailyReportItem = {
      id: "item-" + Math.random().toString(36).substring(2, 9),
      id_tarefa: selectedTaskId,
      titulo_tarefa: taskObj.titulo,
      status: itemStatus,
      observacoes: itemObservations || "Nenhuma observação detalhada.",
      anexo: itemAnexo || undefined
    };

    setPendingItems([...pendingItems, newItem]);
    
    // Clear task form states (retaining report-date)
    setSelectedTaskId("");
    setItemStatus("in_progress");
    setItemObservations("");
    setItemAnexo("");
    setItemAnexoName("");
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove individual task entry from pending list
  const handleRemovePendingItem = (itemId: string) => {
    setPendingItems(pendingItems.filter(item => item.id !== itemId));
  };

  // Submit complete Daily Report
  const handleSubmitReport = () => {
    if (pendingItems.length === 0) {
      alert("Adicione pelo menos uma entrada de tarefa ao relatório diário antes de submeter.");
      return;
    }

    const newReport: DailyReport = {
      id: "report-" + Date.now(),
      id_usuario: activeProfile.id,
      nome_usuario: activeProfile.name,
      avatar_usuario: activeProfile.avatar,
      data: reportDate,
      itens: pendingItems
    };

    onAddReport(newReport);
    
    // Reset Form & Close
    setPendingItems([]);
    setShowAddForm(false);
    
    // Reset to today
    setReportDate(new Date().toISOString().split("T")[0]);
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchUser = filterUser === "all" || r.id_usuario === filterUser;
    const matchDate = !filterDate || r.data === filterDate;
    return matchUser && matchDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            Concluído
          </span>
        );
      case "review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
            <Clock size={12} />
            Em Revisão
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-[#5a52a3]/20 text-[#c6bfff] border border-[#5a52a3]/30">
            <Clock size={12} />
            Em Progresso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/10">
            <AlertCircle size={12} />
            Pendente
          </span>
        );
    }
  };

  // Pre-fill user's own tasks for easy reporting
  const userTasks = tasks.filter(t => t.id_responsavel === activeProfile.id);
  const otherTasks = tasks.filter(t => t.id_responsavel !== activeProfile.id);

  return (
    <div id="daily-reports-dashboard" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Relatórios Diários</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Registe o progresso diário das suas tarefas, comunique atualizações de status e anexe capturas de ecrã ou fotos.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#5A52A3] hover:bg-[#4E4693] text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-black/10 self-start sm:self-center"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? "Cancelar" : "Novo Relatório Diário"}
        </button>
      </div>

      {/* Report Creation Form Panel */}
      {showAddForm && (
        <div id="new-report-panel" className="bg-[#1C1C26] border border-[#5a52a3]/25 rounded-2xl p-5 shadow-2xl animate-fadeIn space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <FileText className="text-secondary" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Criar Relatório do Dia</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1: Date and Task Info Input */}
            <div className="md:col-span-1 bg-[#121219] p-4 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-[#c6bfff] uppercase tracking-wider mb-2">1. Adicionar Entrada</h4>
              
              <div>
                <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Data do Relatório</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 text-on-surface-variant" size={14} />
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg focus:outline-none focus:border-[#5A52A3] transition-all"
                  />
                </div>
              </div>

              <form onSubmit={handleAddPendingItem} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Tarefa Relacionada</label>
                  <select
                    required
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none focus:border-[#5A52A3]"
                  >
                    <option value="">-- Escolha uma Tarefa --</option>
                    
                    {userTasks.length > 0 && (
                      <optgroup label="As minhas tarefas">
                        {userTasks.map(t => (
                          <option key={t.id} value={t.id}>{t.titulo} ({t.projeto})</option>
                        ))}
                      </optgroup>
                    )}
                    
                    {otherTasks.length > 0 && (
                      <optgroup label="Outras tarefas da equipa">
                        {otherTasks.map(t => (
                          <option key={t.id} value={t.id}>{t.titulo} ({t.projeto})</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Novo Status da Tarefa</label>
                  <select
                    value={itemStatus}
                    onChange={(e) => setItemStatus(e.target.value as any)}
                    className="w-full h-9 bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg px-2.5 focus:outline-none focus:border-[#5A52A3]"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="review">Em Revisão</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Observações / Trabalho Feito</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="O que realizou nesta tarefa? Algum impedimento ou comentário adicional?"
                    value={itemObservations}
                    onChange={(e) => setItemObservations(e.target.value)}
                    className="w-full bg-[#0D0D11] border border-white/10 text-white text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#5A52A3] transition-all resize-none"
                  />
                </div>

                {/* Upload Image Section */}
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Adicionar Imagem (Anexo)</label>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-9 bg-[#1E1E26] hover:bg-[#252530] border border-dashed border-white/10 hover:border-[#5A52A3] text-white text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <ImageIcon size={14} className="text-secondary" />
                      {itemAnexoName ? "Mudar Imagem" : "Carregar Imagem"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {previewImage && (
                      <div className="relative mt-1 border border-white/10 rounded-lg overflow-hidden h-24 w-full bg-[#0D0D11]">
                        <img src={previewImage} alt="Anexo Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setItemAnexo("");
                            setItemAnexoName("");
                            setPreviewImage(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    {itemAnexoName && (
                      <p className="text-[10px] text-on-surface-variant truncate font-mono text-center">{itemAnexoName}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-9 bg-primary-container hover:brightness-110 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus size={14} />
                  Adicionar ao Relatório
                </button>
              </form>
            </div>

            {/* Step 2: Live compilation list of the report */}
            <div className="md:col-span-2 flex flex-col justify-between bg-[#121219] p-4 rounded-xl border border-white/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-[#c6bfff] uppercase tracking-wider">
                    2. Resumo das Tarefas do Dia ({pendingItems.length})
                  </h4>
                  <span className="text-[10px] text-on-surface-variant font-mono">Data: {reportDate}</span>
                </div>

                {pendingItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-on-surface-variant space-y-2">
                    <FileText size={32} className="opacity-20" />
                    <p className="text-xs font-medium">Nenhuma tarefa adicionada a este relatório diário ainda.</p>
                    <p className="text-[10px] max-w-[280px]">Preencha a secção à esquerda e clique em "Adicionar ao Relatório" para incluir as suas tarefas de hoje.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {pendingItems.map((item, index) => (
                      <div key={item.id} className="bg-[#1C1C26] p-3 rounded-lg border border-white/5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 animate-fadeIn">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-white bg-white/5 px-2 py-0.5 rounded">
                              Entrada #{index + 1}
                            </span>
                            <span className="text-xs font-semibold text-[#c6bfff] truncate">
                              {item.titulo_tarefa}
                            </span>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-xs text-on-surface-variant break-words">
                            {item.observacoes}
                          </p>
                          {item.anexo && (
                            <div className="flex items-center gap-1.5 text-[10px] text-secondary font-mono">
                              <ImageIcon size={11} />
                              Imagem anexada com sucesso
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemovePendingItem(item.id)}
                          className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg self-end sm:self-start transition-colors"
                          title="Remover Entrada"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pendingItems.length > 0 && (
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                      <img src={activeProfile.avatar} alt={activeProfile.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      Submetendo como: <strong className="text-white font-semibold">{activeProfile.name}</strong>
                    </span>
                  </div>

                  <button
                    onClick={handleSubmitReport}
                    className="w-full sm:w-auto h-9 px-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    <Send size={13} />
                    Submeter Relatório Diário Completo
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Filters Section */}
      <div id="reports-filters-bar" className="bg-[#1C1C26] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 self-start">
          <Filter size={16} className="text-secondary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Filtrar Relatórios</h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* User selector */}
          <div className="flex items-center gap-1.5 bg-[#0D0D11] border border-white/10 px-2 rounded-lg h-9">
            <UserIcon size={12} className="text-on-surface-variant" />
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="bg-transparent border-none text-white text-xs focus:outline-none cursor-pointer h-full"
            >
              <option value="all">Todos os Colaboradores</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-[#0D0D11] border border-white/10 px-2.5 rounded-lg h-9">
            <Calendar size={12} className="text-on-surface-variant" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Filtrar por data"
              className="bg-transparent border-none text-white text-xs focus:outline-none cursor-pointer h-full"
            />
            {filterDate && (
              <button 
                onClick={() => setFilterDate("")}
                className="text-on-surface-variant hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-[#1C1C26] border border-white/5 rounded-2xl py-16 px-4 flex flex-col items-center justify-center text-center text-on-surface-variant space-y-3">
            <FileText size={40} className="opacity-15 text-white" />
            <p className="text-sm font-semibold">Nenhum relatório diário encontrado.</p>
            <p className="text-xs max-w-[340px]">
              {filterUser !== "all" || filterDate 
                ? "Tente limpar os filtros para visualizar outros relatórios de progresso da equipa." 
                : "Seja o primeiro a registar as suas tarefas hoje clicando no botão 'Novo Relatório Diário' acima!"
              }
            </p>
            {(filterUser !== "all" || filterDate) && (
              <button
                onClick={() => {
                  setFilterUser("all");
                  setFilterDate("");
                }}
                className="text-xs font-semibold text-secondary hover:underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div 
              key={report.id} 
              className="bg-[#1C1C26] border border-white/5 hover:border-white/10 rounded-2xl p-4 sm:p-5 transition-all shadow-md space-y-4 animate-fadeIn"
            >
              {/* Report Author Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shadow-md shrink-0">
                    <img 
                      src={report.avatar_usuario} 
                      alt={report.nome_usuario} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {report.nome_usuario}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-on-surface-variant font-medium mt-0.5">
                      Submeteu relatório de atividades
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono bg-[#0D0D11] border border-white/10 px-3 py-1 rounded-lg self-start sm:self-center">
                  <Calendar size={12} className="text-secondary" />
                  <span>
                    {new Date(report.data + "T12:00:00").toLocaleDateString("pt-PT", {
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Task entries listed task by task */}
              <div className="divide-y divide-white/5">
                {report.itens.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Column 1: Task and status */}
                    <div className="md:col-span-1 space-y-1.5">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Tarefa</p>
                      <h5 className="text-xs font-bold text-white tracking-tight break-words">
                        {item.titulo_tarefa}
                      </h5>
                      <div className="pt-0.5">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    {/* Column 2: Observations */}
                    <div className="md:col-span-2 space-y-1.5">
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Observações & Notas</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed break-words whitespace-pre-wrap">
                        {item.observacoes}
                      </p>
                    </div>

                    {/* Column 3: Attachment if any */}
                    <div className="md:col-span-1 space-y-1.5">
                      {item.anexo ? (
                        <div className="space-y-1.5">
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Anexo</p>
                          <div 
                            onClick={() => setZoomedImage(item.anexo || null)}
                            className="group relative h-20 w-full sm:w-36 rounded-lg overflow-hidden border border-white/10 bg-[#0D0D11] cursor-pointer"
                          >
                            <img 
                              src={item.anexo} 
                              alt="Anexo de Tarefa" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye size={16} className="text-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center text-[11px] text-on-surface-variant italic">
                          Sem anexo.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Expanded Image Zoom Modal */}
      {zoomedImage && (
        <div 
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl border border-white/10 bg-[#0D0D11]">
            <img 
              src={zoomedImage} 
              alt="Anexo em tamanho real" 
              className="max-w-full max-h-[80vh] object-contain" 
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-2 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
