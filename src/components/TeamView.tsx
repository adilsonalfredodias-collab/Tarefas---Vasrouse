/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, ChevronDown, Award, Calendar, Home, CreditCard, ShieldCheck, Mail, Phone, Users, Landmark } from "lucide-react";
import { Profile, HRData } from "../types";

interface TeamViewProps {
  profiles: Profile[];
  hrData: Record<string, HRData>;
  currentRole: 'admin' | 'leader' | 'member';
  onAddMember: (newProfile: Profile, newHR?: HRData) => void;
}

export default function TeamView({ profiles, hrData, currentRole, onAddMember }: TeamViewProps) {
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIbanProfile, setSelectedIbanProfile] = useState<{ name: string; iban: string } | null>(null);

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
  const canSeeDetails = currentRole === 'admin' || currentRole === 'leader';
  const canSeeAdminInfo = currentRole === 'admin';

  return (
    <div id="team-container" className="space-y-6">
      
      {/* View Header */}
      <section className="flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestão da Equipa</h1>
          <p className="text-sm text-on-surface-variant mt-1">Visão geral e administração de membros.</p>
        </div>
        
        {/* Only leaders/admins can add members */}
        {(currentRole === 'admin' || currentRole === 'leader') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="h-12 px-5 bg-[#FCD15A] hover:bg-[#ebc24c] text-[#0D0D11] rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <Plus size={18} />
            <span>Novo Membro</span>
          </button>
        )}
      </section>

      {/* Team Members Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(p => {
          const isOpen = !!openAccordions[p.id];
          const hr = hrData[p.id];

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
                    <span className="text-on-surface-variant text-[11px] font-medium">
                      {p.horario}
                    </span>
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
                  
                  {/* Basic Details: restricted by RBAC or personal profile */}
                  {canSeeDetails ? (
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
                  ) : (
                    <div className="p-3 bg-[#0D0D11]/30 rounded-lg text-xs text-on-surface-variant text-center border border-white/5">
                      🔒 Detalhes adicionais visíveis apenas para Líderes e Administradores.
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
                    isOpen && !canSeeAdminInfo && canSeeDetails && (
                      <div className="p-3 bg-error-container/5 border border-error/15 rounded-lg text-xs text-[#ffb4ab] text-center flex items-center justify-center gap-1.5">
                        <span>⚠️ Bloco financeiro restrito ao Administrador (RH).</span>
                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          );
        })}
      </section>

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
