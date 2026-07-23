/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile, HRData, Task, Notification, DailyReport } from '../types';

// Read credentials from env or localStorage if dynamically set by user
export const getSupabaseCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('SUPABASE_URL') || '' : '';
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('SUPABASE_ANON_KEY') || '' : '';

  const url = localUrl || envUrl;
  const key = localKey || envKey;

  return {
    url: url.trim(),
    key: key.trim(),
    isConfigured: Boolean(url && key && url !== 'https://your-project.supabase.co')
  };
};

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    lastUrl = url;
    lastKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
};

export const saveSupabaseCredentials = (url: string, key: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('SUPABASE_URL', url.trim());
    localStorage.setItem('SUPABASE_ANON_KEY', key.trim());
  }
  cachedClient = null; // reset cache
};

export const clearSupabaseCredentials = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('SUPABASE_URL');
    localStorage.removeItem('SUPABASE_ANON_KEY');
  }
  cachedClient = null;
};

// Database helper functions for direct sync when Supabase is connected
export const fetchProfilesFromSupabase = async (): Promise<Profile[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles from Supabase:', error);
    throw error;
  }
  return data as Profile[];
};

export const fetchHRDataFromSupabase = async (): Promise<HRData[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.from('hr_data').select('*');
  if (error) {
    console.error('Error fetching HR data from Supabase:', error);
    throw error;
  }
  return data as HRData[];
};

export const fetchTasksFromSupabase = async (): Promise<Task[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('tasks')
    .select('*, attachments(*), comments(*)');

  if (error) {
    console.error('Error fetching tasks from Supabase:', error);
    throw error;
  }
  return data as unknown as Task[];
};

export const saveTaskToSupabase = async (task: Task): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  const { error } = await client.from('tasks').upsert({
    id: task.id.startsWith('task-') ? undefined : task.id,
    titulo: task.titulo,
    descricao: task.descricao,
    id_responsavel: task.id_responsavel,
    prazo: task.prazo,
    tempo_inicio: task.tempo_inicio,
    tempo_fim: task.tempo_fim,
    status: task.status,
    progresso: task.progresso,
    prioridade: task.prioridade,
    projeto: task.projeto
  });

  if (error) {
    console.error('Error saving task to Supabase:', error);
    return false;
  }
  return true;
};

export const fetchNotificationsFromSupabase = async (userId?: string): Promise<Notification[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  let query = client.from('notifications').select('*').order('created_at', { ascending: false });
  if (userId) {
    query = query.eq('id_destinatario', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching notifications from Supabase:', error);
    throw error;
  }
  return data as unknown as Notification[];
};

export const fetchDailyReportsFromSupabase = async (): Promise<DailyReport[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('daily_reports')
    .select('*, daily_report_items(*)');

  if (error) {
    console.error('Error fetching daily reports from Supabase:', error);
    throw error;
  }

  // Map database response to DailyReport interface
  return (data || []).map((report: any) => ({
    id: report.id,
    id_usuario: report.id_usuario,
    nome_usuario: report.nome_usuario,
    avatar_usuario: report.avatar_usuario,
    data: report.data,
    itens: (report.daily_report_items || []).map((item: any) => ({
      id: item.id,
      id_tarefa: item.id_tarefa,
      titulo_tarefa: item.titulo_tarefa,
      status: item.status,
      observacoes: item.observacoes || '',
      anexo: item.anexo
    }))
  }));
};

export const saveProfileToSupabase = async (profile: Profile): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  const { error } = await client.from('profiles').upsert({
    id: profile.id,
    name: profile.name,
    funcao: profile.funcao,
    nivel_acesso: profile.nivel_acesso,
    aniversario: profile.aniversario,
    residencia: profile.residencia,
    horario: profile.horario,
    avatar: profile.avatar
  });

  if (error) {
    console.error('Error saving profile to Supabase:', error);
    return false;
  }
  return true;
};

export const saveHRDataToSupabase = async (hrItem: HRData): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  const { error } = await client.from('hr_data').upsert({
    id_perfil: hrItem.id_perfil,
    salario: hrItem.salario,
    data_contratacao: hrItem.data_contratacao,
    iban: hrItem.iban,
    contrato: hrItem.contrato
  });

  if (error) {
    console.error('Error saving HR data to Supabase:', error);
    return false;
  }
  return true;
};

export const saveNotificationToSupabase = async (notif: Notification, id_destinatario?: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  const { error } = await client.from('notifications').upsert({
    id: notif.id.startsWith('notif-') ? undefined : notif.id,
    id_destinatario: id_destinatario || 'ana-silva',
    tipo: notif.tipo,
    subtipo: notif.subtipo,
    titulo: notif.titulo,
    texto: notif.texto,
    lida: notif.lida,
    meta: notif.meta
  });

  if (error) {
    console.error('Error saving notification to Supabase:', error);
    return false;
  }
  return true;
};

export const saveDailyReportToSupabase = async (report: DailyReport): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { data: insertedReport, error: repErr } = await client
      .from('daily_reports')
      .upsert({
        id_usuario: report.id_usuario,
        nome_usuario: report.nome_usuario,
        avatar_usuario: report.avatar_usuario,
        data: report.data
      })
      .select()
      .single();

    if (repErr || !insertedReport) {
      console.error('Error saving daily report to Supabase:', repErr);
      return false;
    }

    if (report.itens && report.itens.length > 0) {
      const itemsToInsert = report.itens.map(item => ({
        id_relatorio: insertedReport.id,
        id_tarefa: item.id_tarefa,
        titulo_tarefa: item.titulo_tarefa,
        status: item.status,
        observacoes: item.observacoes,
        anexo: item.anexo
      }));

      const { error: itemErr } = await client
        .from('daily_report_items')
        .upsert(itemsToInsert);

      if (itemErr) {
        console.error('Error saving daily report items to Supabase:', itemErr);
      }
    }

    return true;
  } catch (err) {
    console.error('Error in saveDailyReportToSupabase:', err);
    return false;
  }
};

export const deleteTaskFromSupabase = async (taskId: string): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  const { error } = await client.from('tasks').delete().eq('id', taskId);
  if (error) {
    console.error('Error deleting task from Supabase:', error);
    return false;
  }
  return true;
};


