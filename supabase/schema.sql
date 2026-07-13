-- =========================================================================
-- WORKSPACE OS - SUPABASE DATABASE SCHEMA (POSTGRESQL)
-- 2026 Vasrouse Creative - Todos os direitos reservados.
-- =========================================================================
-- Este ficheiro contém todo o script SQL para criar as tabelas, índices,
-- triggers de integridade e políticas de segurança (RLS - Row Level Security)
-- adequadas para colar diretamente no Editor de SQL do seu painel Supabase.
-- =========================================================================

-- Ativar extensões necessárias (como gerador de UUIDs e criptografia se necessário)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. TABELA DE PERFIS DE UTILIZADORES (Sincronizado com auth.users do Supabase)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    funcao TEXT NOT NULL DEFAULT 'Colaborador',
    nivel_acesso TEXT NOT NULL DEFAULT 'member' CHECK (nivel_acesso IN ('admin', 'leader', 'member')),
    aniversario TEXT, -- Guarda aniversário em formato "MM-DD" ou "YYYY-MM-DD"
    residencia TEXT DEFAULT 'Luanda, Angola',
    horario TEXT DEFAULT '08:00 - 17:00',
    avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS para Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 2. TABELA DE DADOS DE RECURSOS HUMANOS (Apenas visível para Admins/Gestores)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.hr_data (
    id_perfil UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    salario NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    data_contratacao DATE DEFAULT CURRENT_DATE NOT NULL,
    iban TEXT NOT NULL,
    contrato TEXT DEFAULT 'Efetivo' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS para Dados de RH
ALTER TABLE public.hr_data ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 3. TABELA DE TAREFAS (Tasks)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    id_responsavel UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    prazo TIMESTAMP WITH TIME ZONE, -- Prazo limite de entrega da tarefa
    tempo_inicio TIMESTAMP WITH TIME ZONE, -- Registo de início do temporizador
    tempo_fim TIMESTAMP WITH TIME ZONE, -- Registo de término do temporizador
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed')),
    progresso INTEGER NOT NULL DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
    prioridade TEXT NOT NULL DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta')),
    projeto TEXT NOT NULL DEFAULT 'Geral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS para Tarefas
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 4. TABELA DE ANEXOS DAS TAREFAS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tarefa UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    tamanho TEXT NOT NULL, -- Ex: "4.2 MB"
    tipo TEXT NOT NULL CHECK (tipo IN ('image', 'file', 'pdf', 'json')),
    url TEXT, -- Link para o Supabase Storage Bucket de arquivos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS para Anexos
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 5. TABELA DE COMENTÁRIOS DAS TAREFAS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tarefa UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    id_autor UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    nome_autor TEXT NOT NULL,
    avatar_autor TEXT NOT NULL,
    texto TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS para Comentários
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 6. TABELA DE NOTIFICAÇÕES DOS UTILIZADORES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_destinatario UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('task', 'mention', 'status')),
    subtipo TEXT DEFAULT 'Nova Tarefa',
    titulo TEXT NOT NULL,
    texto TEXT NOT NULL,
    lida BOOLEAN DEFAULT FALSE NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb, -- Guarda metadados flexíveis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar RLS para Notificações
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 7. TABELA DE DIÁRIO DE BORDO (Daily Reports)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nome_usuario TEXT NOT NULL,
    avatar_usuario TEXT NOT NULL,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_daily_user_date UNIQUE (id_usuario, data)
);

-- Ativar RLS para Relatórios Diários
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 8. TABELA DE ITENS DO DIÁRIO DE BORDO
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.daily_report_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_report UUID NOT NULL REFERENCES public.daily_reports(id) ON DELETE CASCADE,
    id_tarefa UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    titulo_tarefa TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'review', 'completed')),
    observacoes TEXT,
    anexo TEXT -- Pode ser url ou string base64 compactada
);

-- Ativar RLS para Itens de Relatório
ALTER TABLE public.daily_report_items ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- TRIGGERS DE SEGURANÇA E SINCRO: AUTHENTICATION -> PROFILES
-- =========================================================================
-- Esta função cria automaticamente um perfil público na tabela public.profiles
-- sempre que um novo utilizador se regista no sistema de autenticação (Auth)
-- do Supabase.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_funcao TEXT;
  v_nivel_acesso TEXT;
  v_avatar TEXT;
BEGIN
  -- Default Values
  v_name := COALESCE(new.raw_user_meta_data->>'name', 'Colaborador Novo');
  v_funcao := COALESCE(new.raw_user_meta_data->>'funcao', 'Membro da Equipa');
  v_nivel_acesso := COALESCE(new.raw_user_meta_data->>'nivel_acesso', 'member');
  v_avatar := COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop');

  -- Pre-configured Admins
  IF lower(new.email) = 'jorgedealmeida.admin@vasrouse.ao' THEN
    v_name := 'Jorge de Almeida';
    v_funcao := 'Administrador Principal';
    v_nivel_acesso := 'admin';
    v_avatar := 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop';
  ELSIF lower(new.email) = 'adilsondias.admin@vasrouse.ao' THEN
    v_name := 'Adilson Dias';
    v_funcao := 'Administrador de Sistemas';
    v_nivel_acesso := 'admin';
    v_avatar := 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop';

  -- Pre-configured Leaders (Líderes/Coordenadores)
  ELSIF lower(new.email) = 'manueldomingos.coord@vasrouse.ao' THEN
    v_name := 'Manuel Domingos';
    v_funcao := 'Coordenador de Projetos';
    v_nivel_acesso := 'leader';
    v_avatar := 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop';
  ELSIF lower(new.email) = 'beatrizquengue.admin.ass@vasrouse.ao' THEN
    v_name := 'Beatriz Quengue';
    v_funcao := 'Assistente de Administração';
    v_nivel_acesso := 'leader';
    v_avatar := 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop';

  -- Pre-configured Members (Membros)
  ELSIF lower(new.email) = 'elizabethpamela.jorn@vasrouse.ao' THEN
    v_name := 'Elizabeth Pamela';
    v_funcao := 'Jornalista';
    v_nivel_acesso := 'member';
    v_avatar := 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
  ELSIF lower(new.email) = 'emersonmicanda.design@vasrouse.ao' THEN
    v_name := 'Emerson Micanda';
    v_funcao := 'Web Designer';
    v_nivel_acesso := 'member';
    v_avatar := 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop';
  ELSIF lower(new.email) = 'tatianatavares.gr@vasrouse.ao' THEN
    v_name := 'Tatiana Tavares';
    v_funcao := 'Gestora de Redes Sociais';
    v_nivel_acesso := 'member';
    v_avatar := 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop';
  ELSIF lower(new.email) = 'katianagregorio.gr@vasrouse.ao' THEN
    v_name := 'Katiana Gregório';
    v_funcao := 'Gestora de Redes Sociais';
    v_nivel_acesso := 'member';
    v_avatar := 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop';
  ELSIF lower(new.email) = 'estefaneainocencio.gr@vasrouse.ao' THEN
    v_name := 'Estefaneia Inocêncio';
    v_funcao := 'Gestora de Redes Sociais';
    v_nivel_acesso := 'member';
    v_avatar := 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=256&auto=format&fit=crop';
  ELSIF lower(new.email) = 'osvaldogregorio.gr@vasrouse.ao' THEN
    v_name := 'Osvaldo Gregório';
    v_funcao := 'Gestor de Redes Sociais';
    v_nivel_acesso := 'member';
    v_avatar := 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop';
  ELSIF lower(new.email) = 'claudiocateco.gr@vasrouse.ao' THEN
    v_name := 'Cláudio Cateco';
    v_funcao := 'Gestor de Redes Sociais';
    v_nivel_acesso := 'member';
    v_avatar := 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=256&auto=format&fit=crop';
  END IF;

  INSERT INTO public.profiles (id, name, funcao, nivel_acesso, avatar, aniversario, residencia, horario)
  VALUES (
    new.id,
    v_name,
    v_funcao,
    v_nivel_acesso,
    v_avatar,
    '12 de Abril',
    'Luanda, Angola',
    '08:00 - 17:00'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    funcao = EXCLUDED.funcao,
    nivel_acesso = EXCLUDED.nivel_acesso,
    avatar = EXCLUDED.avatar;

  -- Se for admin ou leader, cria automaticamente um registo de RH padrão para que não dê erro ao carregar as finanças/contratos
  IF v_nivel_acesso IN ('admin', 'leader') THEN
    INSERT INTO public.hr_data (id_perfil, salario, data_contratacao, iban, contrato)
    VALUES (
      new.id,
      CASE WHEN v_nivel_acesso = 'admin' THEN 750000.00 ELSE 450000.00 END,
      CURRENT_DATE,
      'AO06.0040.0000.1234.5678.9012.3',
      'Efetivo'
    ) ON CONFLICT (id_perfil) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Associa a função ao trigger na tabela auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================================
-- TRIGGERS PARA ATUALIZAR AUTOMATICAMENTE O CAMPO 'updated_at'
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE OR REPLACE TRIGGER update_hr_data_modtime
    BEFORE UPDATE ON public.hr_data
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE OR REPLACE TRIGGER update_tasks_modtime
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();


-- =========================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS) - SUPABASE SECURITY CODES
-- =========================================================================

-- Limpeza Dinâmica de Políticas Antigas: Evita erros de duplicação caso o script seja executado múltiplas vezes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('profiles', 'hr_data', 'tasks', 'comments', 'attachments', 'notifications', 'daily_reports', 'daily_report_items')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 1. Políticas da Tabela Profiles
DROP POLICY IF EXISTS "Utilizadores podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Utilizadores podem ver todos os perfis" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Utilizadores podem editar o seu próprio perfil" ON public.profiles;
CREATE POLICY "Utilizadores podem editar o seu próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Políticas da Tabela HR Data (Segurança Crítica)
DROP POLICY IF EXISTS "Admins e Leaders podem ver dados de RH" ON public.hr_data;
CREATE POLICY "Admins e Leaders podem ver dados de RH" ON public.hr_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.nivel_acesso IN ('admin', 'leader')
        )
    );

DROP POLICY IF EXISTS "Apenas Admins podem atualizar dados de RH" ON public.hr_data;
CREATE POLICY "Apenas Admins podem atualizar dados de RH" ON public.hr_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.nivel_acesso = 'admin'
        )
    );

-- 3. Políticas da Tabela Tasks
DROP POLICY IF EXISTS "Qualquer utilizador autenticado pode ver tarefas" ON public.tasks;
CREATE POLICY "Qualquer utilizador autenticado pode ver tarefas" ON public.tasks
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Membros podem atualizar tarefas em que estão associados ou se forem Admins/Leaders" ON public.tasks;
CREATE POLICY "Membros podem atualizar tarefas em que estão associados ou se forem Admins/Leaders" ON public.tasks
    FOR UPDATE USING (
        auth.uid() = id_responsavel OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.nivel_acesso IN ('admin', 'leader')
        )
    );

DROP POLICY IF EXISTS "Admins e Leaders podem gerir totalmente as tarefas" ON public.tasks;
CREATE POLICY "Admins e Leaders podem gerir totalmente as tarefas" ON public.tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.nivel_acesso IN ('admin', 'leader')
        )
    );

-- 4. Políticas da Tabela Comments
DROP POLICY IF EXISTS "Todos podem ler comentários de tarefas" ON public.comments;
CREATE POLICY "Todos podem ler comentários de tarefas" ON public.comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Qualquer utilizador autenticado pode comentar" ON public.comments;
CREATE POLICY "Qualquer utilizador autenticado pode comentar" ON public.comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "O autor pode remover ou atualizar o próprio comentário" ON public.comments;
CREATE POLICY "O autor pode remover ou atualizar o próprio comentário" ON public.comments
    FOR ALL USING (auth.uid() = id_autor);

-- 5. Políticas da Tabela Attachments
DROP POLICY IF EXISTS "Todos podem ver ficheiros anexados" ON public.attachments;
CREATE POLICY "Todos podem ver ficheiros anexados" ON public.attachments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserir anexo se tiver permissão" ON public.attachments;
CREATE POLICY "Inserir anexo se tiver permissão" ON public.attachments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Políticas da Tabela Notifications
DROP POLICY IF EXISTS "Utilizadores vêem apenas as suas próprias notificações" ON public.notifications;
CREATE POLICY "Utilizadores vêem apenas as suas próprias notificações" ON public.notifications
    FOR SELECT USING (auth.uid() = id_destinatario);

DROP POLICY IF EXISTS "Utilizadores podem marcar as suas notificações como lidas" ON public.notifications;
CREATE POLICY "Utilizadores podem marcar as suas notificações como lidas" ON public.notifications
    FOR UPDATE USING (auth.uid() = id_destinatario);

-- 7. Políticas para Relatórios Diários
DROP POLICY IF EXISTS "Utilizadores podem visualizar relatórios de todos" ON public.daily_reports;
CREATE POLICY "Utilizadores podem visualizar relatórios de todos" ON public.daily_reports
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Utilizadores podem inserir e modificar os seus próprios relatórios" ON public.daily_reports;
CREATE POLICY "Utilizadores podem inserir e modificar os seus próprios relatórios" ON public.daily_reports
    FOR ALL USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "Utilizadores podem ler todos os itens de relatórios" ON public.daily_report_items;
CREATE POLICY "Utilizadores podem ler todos os itens de relatórios" ON public.daily_report_items
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserir e modificar itens se pertencerem ao seu relatório" ON public.daily_report_items;
CREATE POLICY "Inserir e modificar itens se pertencerem ao seu relatório" ON public.daily_report_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.daily_reports
            WHERE daily_reports.id = id_report
            AND daily_reports.id_usuario = auth.uid()
        )
    );

-- =========================================================================
-- ÍNDICES DE PERFORMANCE PARA PESQUISA RÁPIDA
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_responsavel ON public.tasks(id_responsavel);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_tarefa ON public.comments(id_tarefa);
CREATE INDEX IF NOT EXISTS idx_attachments_tarefa ON public.attachments(id_tarefa);
CREATE INDEX IF NOT EXISTS idx_notifications_destinatario ON public.notifications(id_destinatario, lida);
CREATE INDEX IF NOT EXISTS idx_daily_reports_usuario ON public.daily_reports(id_usuario, data);


-- =========================================================================
-- 9. FUNÇÕES DE ATRIBUIÇÃO DE CARGOS E HIERARQUIA (RBAC UTILITIES)
-- =========================================================================
-- Estas funções auxiliam os administradores a atribuir níveis de acesso de
-- forma segura e rápida diretamente pelo editor de SQL do Supabase.

-- Função para alterar o nível de acesso de um utilizador usando o seu EMAIL
CREATE OR REPLACE FUNCTION public.set_user_role_by_email(target_email TEXT, new_role TEXT)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Validar a role introduzida
    IF new_role NOT IN ('admin', 'leader', 'member') THEN
        RETURN 'Erro: Nível de acesso inválido. Escolha entre: admin, leader ou member.';
    END IF;

    -- Obter o ID do utilizador com base no email registado no módulo Auth do Supabase
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RETURN 'Erro: Nenhum utilizador foi encontrado com o e-mail: ' || target_email;
    END IF;

    -- Atualizar o nível de acesso correspondente no perfil público
    UPDATE public.profiles 
    SET nivel_acesso = new_role
    WHERE id = target_user_id;

    RETURN 'Sucesso: O utilizador ' || target_email || ' agora tem o nível de acesso: ' || new_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Função para alterar o nível de acesso de um utilizador usando o seu UUID (User ID)
CREATE OR REPLACE FUNCTION public.set_user_role_by_id(target_uid UUID, new_role TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Validar a role introduzida
    IF new_role NOT IN ('admin', 'leader', 'member') THEN
        RETURN 'Erro: Nível de acesso inválido. Escolha entre: admin, leader ou member.';
    END IF;

    -- Atualizar o nível de acesso correspondente no perfil público
    UPDATE public.profiles 
    SET nivel_acesso = new_role
    WHERE id = target_uid;

    IF NOT FOUND THEN
        RETURN 'Erro: Nenhum perfil foi encontrado com o ID: ' || target_uid;
    END IF;

    RETURN 'Sucesso: O perfil com ID ' || target_uid || ' foi atualizado para: ' || new_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================================================================
-- EXEMPLOS DE CONSULTAS E COMANDOS ÚTEIS PARA O EDITOR DE SQL DO SUPABASE:
-- =========================================================================
/*
    -- 1. VISUALIZAR TODOS OS UTILIZADORES REGISTADOS E OS SEUS ACESSOS:
    SELECT p.id, p.name, p.funcao, p.nivel_acesso, u.email, p.created_at
    FROM public.profiles p
    JOIN auth.users u ON p.id = u.id
    ORDER BY p.nivel_acesso, p.name;

    -- 2. TORNAR UM UTILIZADOR ADMINISTRADOR (Acesso total às finanças, RH, tarefas, etc.):
    SELECT public.set_user_role_by_email('seu-email@dominio.com', 'admin');

    -- 3. TORNAR UM UTILIZADOR LÍDER DE EQUIPA (Acesso intermédio e gestão de relatórios/tarefas):
    SELECT public.set_user_role_by_email('lider@dominio.com', 'leader');

    -- 4. ATRIBUIR ACESSO SIMPLES A UM COLABORADOR (Membro padrão):
    SELECT public.set_user_role_by_email('membro@dominio.com', 'member');
*/


-- =========================================================================
-- 10. SINCRONIZAÇÃO RETROATIVA DE UTILIZADORES JÁ REGISTADOS (BACKFILL)
-- =========================================================================
-- Esta função procura todos os utilizadores já registados na tabela auth.users
-- do Supabase e atualiza retroativamente as suas informações públicas
-- (nome, função, avatar e nível de acesso) para coincidir com a lista oficial.

CREATE OR REPLACE FUNCTION public.backfill_existing_users()
RETURNS TEXT AS $$
DECLARE
    r RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR r IN SELECT id, email FROM auth.users LOOP
        -- Admins
        IF lower(r.email) = 'jorgedealmeida.admin@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Jorge de Almeida', 
                funcao = 'Administrador Principal', 
                nivel_acesso = 'admin', 
                avatar = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            
            INSERT INTO public.hr_data (id_perfil, salario, iban, contrato) 
            VALUES (r.id, 750000.00, 'AO06.0040.0000.1234.5678.9012.3', 'Efetivo') 
            ON CONFLICT (id_perfil) DO NOTHING;
            
            v_count := v_count + 1;
            
        ELSIF lower(r.email) = 'adilsondias.admin@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Adilson Dias', 
                funcao = 'Administrador de Sistemas', 
                nivel_acesso = 'admin', 
                avatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            
            INSERT INTO public.hr_data (id_perfil, salario, iban, contrato) 
            VALUES (r.id, 750000.00, 'AO06.0040.0000.1234.5678.9012.3', 'Efetivo') 
            ON CONFLICT (id_perfil) DO NOTHING;
            
            v_count := v_count + 1;
            
        -- Leaders (Coordenadores / Assistentes)
        ELSIF lower(r.email) = 'manueldomingos.coord@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Manuel Domingos', 
                funcao = 'Coordenador de Projetos', 
                nivel_acesso = 'leader', 
                avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            
            INSERT INTO public.hr_data (id_perfil, salario, iban, contrato) 
            VALUES (r.id, 450000.00, 'AO06.0040.0000.1234.5678.9012.3', 'Efetivo') 
            ON CONFLICT (id_perfil) DO NOTHING;
            
            v_count := v_count + 1;
            
        ELSIF lower(r.email) = 'beatrizquengue.admin.ass@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Beatriz Quengue', 
                funcao = 'Assistente de Administração', 
                nivel_acesso = 'leader', 
                avatar = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            
            INSERT INTO public.hr_data (id_perfil, salario, iban, contrato) 
            VALUES (r.id, 450000.00, 'AO06.0040.0000.1234.5678.9012.3', 'Efetivo') 
            ON CONFLICT (id_perfil) DO NOTHING;
            
            v_count := v_count + 1;

        -- Members (Colaboradores / Redes Sociais / Designers)
        ELSIF lower(r.email) = 'elizabethpamela.jorn@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Elizabeth Pamela', 
                funcao = 'Jornalista', 
                nivel_acesso = 'member', 
                avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            v_count := v_count + 1;
            
        ELSIF lower(r.email) = 'emersonmicanda.design@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Emerson Micanda', 
                funcao = 'Web Designer', 
                nivel_acesso = 'member', 
                avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            v_count := v_count + 1;
            
        ELSIF lower(r.email) = 'tatianatavares.gr@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Tatiana Tavares', 
                funcao = 'Gestora de Redes Sociais', 
                nivel_acesso = 'member', 
                avatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            v_count := v_count + 1;
            
        ELSIF lower(r.email) = 'katianagregorio.gr@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Katiana Gregório', 
                funcao = 'Gestora de Redes Sociais', 
                nivel_acesso = 'member', 
                avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            v_count := v_count + 1;
            
        ELSIF lower(r.email) = 'estefaneainocencio.gr@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Estefaneia Inocêncio', 
                funcao = 'Gestora de Redes Sociais', 
                nivel_acesso = 'member', 
                avatar = 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            v_count := v_count + 1;
            
        ELSIF lower(r.email) = 'osvaldogregorio.gr@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Osvaldo Gregório', 
                funcao = 'Gestor de Redes Sociais', 
                nivel_acesso = 'member', 
                avatar = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            v_count := v_count + 1;
            
        ELSIF lower(r.email) = 'claudiocateco.gr@vasrouse.ao' THEN
            UPDATE public.profiles 
            SET name = 'Cláudio Cateco', 
                funcao = 'Gestor de Redes Sociais', 
                nivel_acesso = 'member', 
                avatar = 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=256&auto=format&fit=crop' 
            WHERE id = r.id;
            v_count := v_count + 1;
        END IF;
    END LOOP;
    
    RETURN 'Sucesso: ' || v_count || ' perfis já registados foram sincronizados com as novas funções e cargos.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executa a sincronização retroativa automaticamente
SELECT public.backfill_existing_users();

