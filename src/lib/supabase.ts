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
  try {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client.from('profiles').select('*');
    if (error) {
      console.warn('Notice: Could not fetch profiles from Supabase:', error.message || error);
      return null;
    }
    return data as Profile[];
  } catch (err) {
    console.warn('Notice: Exception fetching profiles from Supabase:', err);
    return null;
  }
};

export const fetchHRDataFromSupabase = async (): Promise<HRData[] | null> => {
  try {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client.from('hr_data').select('*');
    if (error) {
      console.warn('Notice: Could not fetch HR data from Supabase:', error.message || error);
      return null;
    }
    return data as HRData[];
  } catch (err) {
    console.warn('Notice: Exception fetching HR data from Supabase:', err);
    return null;
  }
};

export const fetchTasksFromSupabase = async (): Promise<Task[] | null> => {
  try {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('tasks')
      .select('*, attachments(*), comments(*)');

    if (error) {
      console.warn('Notice: Could not fetch tasks from Supabase:', error.message || error);
      return null;
    }
    return data as unknown as Task[];
  } catch (err) {
    console.warn('Notice: Exception fetching tasks from Supabase:', err);
    return null;
  }
};

export const saveTaskToSupabase = async (task: Task): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client) return false;

    const taskPayload: Record<string, any> = {
      id: task.id,
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
    };

    const { error } = await client.from('tasks').upsert(taskPayload);

    if (error) {
      console.warn('Notice: Could not sync task to Supabase:', error.message || error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Notice: Exception saving task to Supabase:', err?.message || err);
    return false;
  }
};

export const fetchNotificationsFromSupabase = async (userId?: string): Promise<Notification[] | null> => {
  try {
    const client = getSupabaseClient();
    if (!client) return null;

    let query = client.from('notifications').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('id_destinatario', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Notice: Could not fetch notifications from Supabase:', error.message || error);
      return null;
    }
    return data as unknown as Notification[];
  } catch (err) {
    console.warn('Notice: Exception fetching notifications from Supabase:', err);
    return null;
  }
};

export const fetchDailyReportsFromSupabase = async (): Promise<DailyReport[] | null> => {
  try {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('daily_reports')
      .select('*, daily_report_items(*)');

    if (error) {
      console.warn('Notice: Could not fetch daily reports from Supabase:', error.message || error);
      return null;
    }

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
  } catch (err) {
    console.warn('Notice: Exception fetching daily reports from Supabase:', err);
    return null;
  }
};

export const saveProfileToSupabase = async (profile: Profile): Promise<boolean> => {
  try {
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
      console.warn('Notice: Could not sync profile to Supabase:', error.message || error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Notice: Exception saving profile to Supabase:', err?.message || err);
    return false;
  }
};

export const saveHRDataToSupabase = async (hrItem: HRData): Promise<boolean> => {
  try {
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
      console.warn('Notice: Could not sync HR data to Supabase:', error.message || error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Notice: Exception saving HR data to Supabase:', err?.message || err);
    return false;
  }
};

export const saveNotificationToSupabase = async (notif: Notification, id_destinatario?: string): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('notifications').upsert({
      id: notif.id,
      id_destinatario: id_destinatario || 'system',
      tipo: notif.tipo,
      subtipo: notif.subtipo,
      titulo: notif.titulo,
      texto: notif.texto,
      lida: notif.lida,
      meta: notif.meta
    });

    if (error) {
      console.warn('Notice: Could not sync notification to Supabase:', error.message || error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Notice: Exception saving notification to Supabase:', err?.message || err);
    return false;
  }
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
      console.warn('Notice: Could not sync daily report to Supabase:', repErr?.message || repErr);
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
        console.warn('Notice: Could not sync daily report items to Supabase:', itemErr?.message || itemErr);
      }
    }

    return true;
  } catch (err) {
    console.warn('Notice: Exception in saveDailyReportToSupabase:', err);
    return false;
  }
};
export const saveAttendanceToSupabase = async (attendance: Attendance): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('attendances').upsert({
      id: attendance.id,
      id_usuario: attendance.id_usuario,
      data: attendance.data,
      hora_entrada: attendance.hora_entrada,
      hora_saida: attendance.hora_saida
    });

    if (error) {
      console.warn('Notice: Could not sync attendance to Supabase:', error.message || error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Notice: Exception saving attendance to Supabase:', err?.message || err);
    return false;
  }
};

export const deleteTaskFromSupabase = async (taskId: string): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    if (!client) return false;

    const { error } = await client.from('tasks').delete().eq('id', taskId);
    if (error) {
      console.warn('Notice: Could not delete task from Supabase:', error.message || error);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Notice: Exception deleting task from Supabase:', err?.message || err);
    return false;
  }
};


