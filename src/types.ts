/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  id: string;
  name: string;
  funcao: string;
  nivel_acesso: 'admin' | 'leader' | 'member';
  aniversario: string; // MM-DD or YYYY-MM-DD
  residencia: string;
  horario: string;
  avatar: string;
}

export interface HRData {
  id_perfil: string;
  salario: number;
  data_contratacao: string;
  iban: string;
  contrato: string;
}

export interface Task {
  id: string;
  titulo: string;
  descricao: string;
  id_responsavel: string;
  prazo: string; // ISO String
  tempo_inicio?: string; // ISO String
  tempo_fim?: string; // ISO String
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  progresso: number; // 0 to 100
  prioridade: 'Baixa' | 'Média' | 'Alta';
  projeto: string;
  anexos: Attachment[];
  comentarios: Comment[];
}

export interface Attachment {
  id: string;
  nome: string;
  tamanho: string;
  tipo: 'image' | 'file' | 'pdf' | 'json';
}

export interface Comment {
  id: string;
  id_autor: string;
  nome_autor: string;
  avatar_autor: string;
  data: string; // e.g. "Há 2 horas" or ISO string
  texto: string;
}

export interface Notification {
  id: string;
  tipo: 'task' | 'mention' | 'status';
  subtipo?: string; // e.g. "Nova Tarefa", "Menção", "Status"
  titulo: string;
  texto: string;
  data: string; // e.g. "Há 10 min"
  lida: boolean;
  meta?: {
    id_tarefa?: string;
    nome_projeto?: string;
    autor?: string;
    avatar_autor?: string;
    comentario?: string;
  };
}

export interface UserSession {
  currentUser: Profile;
  hrData?: HRData;
}

export interface DailyReportItem {
  id: string;
  id_tarefa: string;
  titulo_tarefa: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  observacoes: string;
  anexo?: string; // base64 image data url
}

export interface DailyReport {
  id: string;
  id_usuario: string;
  nome_usuario: string;
  avatar_usuario: string;
  data: string; // "YYYY-MM-DD"
  itens: DailyReportItem[];
}

