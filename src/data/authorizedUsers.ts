import { Profile, HRData, Task } from "../types";

export interface AuthorizedUser {
  email: string;
  id: string;
  name: string;
  funcao: string;
  nivel_acesso: 'admin' | 'leader' | 'member';
  aniversario: string;
  residencia: string;
  horario: string;
  avatar: string;
}

export const AUTHORIZED_USERS: AuthorizedUser[] = [
  {
    email: "adilsondias.admin@vasrouse.ao",
    id: "adilsondias.admin",
    name: "Adilson Dias",
    funcao: "Administrador",
    nivel_acesso: "admin",
    aniversario: "15 de Maio",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Adilson+Dias&background=5A52A3&color=fff"
  },
  {
    email: "beatrizquengue.admin.ass@vasrouse.ao",
    id: "beatrizquengue.admin.ass",
    name: "Beatriz Quengue",
    funcao: "Assistente Administrativa",
    nivel_acesso: "leader",
    aniversario: "22 de Outubro",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Beatriz+Quengue&background=FCD15A&color=000"
  },
  {
    email: "claudiocateco.gr@vasrouse.ao",
    id: "claudiocateco.gr",
    name: "Cláudio Cateco",
    funcao: "Gestor de Relacionamento",
    nivel_acesso: "member",
    aniversario: "10 de Março",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Claudio+Cateco&background=2C2C38&color=fff"
  },
  {
    email: "elizabethpamela.jorn@vasrouse.ao",
    id: "elizabethpamela.jorn",
    name: "Elizabeth Pâmela",
    funcao: "Jornalista",
    nivel_acesso: "member",
    aniversario: "04 de Setembro",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Elizabeth+Pamela&background=2C2C38&color=fff"
  },
  {
    email: "emersonmicanda.design@vasrouse.ao",
    id: "emersonmicanda.design",
    name: "Emerson Micanda",
    funcao: "Designer",
    nivel_acesso: "member",
    aniversario: "18 de Novembro",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Emerson+Micanda&background=2C2C38&color=fff"
  },
  {
    email: "estefaneainocencio.gr@vasrouse.ao",
    id: "estefaneainocencio.gr",
    name: "Estéfanea Inocêncio",
    funcao: "Gestora de Relacionamento",
    nivel_acesso: "member",
    aniversario: "30 de Julho",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Estefanea+Inocencio&background=2C2C38&color=fff"
  },
  {
    email: "jorgedealmeida.admin@vasrouse.ao",
    id: "jorgedealmeida.admin",
    name: "Jorge de Almeida",
    funcao: "Administrador",
    nivel_acesso: "admin",
    aniversario: "02 de Janeiro",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Jorge+de+Almeida&background=5A52A3&color=fff"
  },
  {
    email: "katianagregorio.gr@vasrouse.ao",
    id: "katianagregorio.gr",
    name: "Katiana Gregório",
    funcao: "Gestora de Relacionamento",
    nivel_acesso: "member",
    aniversario: "14 de Fevereiro",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Katiana+Gregorio&background=2C2C38&color=fff"
  },
  {
    email: "manueldomingos.coord@vasrouse.ao",
    id: "manueldomingos.coord",
    name: "Manuel Domingos",
    funcao: "Coordenador",
    nivel_acesso: "leader",
    aniversario: "08 de Agosto",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Manuel+Domingos&background=FCD15A&color=000"
  },
  {
    email: "osvaldogregorio.gr@vasrouse.ao",
    id: "osvaldogregorio.gr",
    name: "Osvaldo Gregório",
    funcao: "Gestor de Relacionamento",
    nivel_acesso: "member",
    aniversario: "19 de Dezembro",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Osvaldo+Gregorio&background=2C2C38&color=fff"
  },
  {
    email: "tatianatavares.gr@vasrouse.ao",
    id: "tatianatavares.gr",
    name: "Tatiana Tavares",
    funcao: "Gestora de Relacionamento",
    nivel_acesso: "member",
    aniversario: "25 de Abril",
    residencia: "Luanda, Angola",
    horario: "08:00 - 17:00",
    avatar: "https://ui-avatars.com/api/?name=Tatiana+Tavares&background=2C2C38&color=fff"
  }
];

export const defaultAuthorizedProfiles: Profile[] = AUTHORIZED_USERS.map(u => ({
  id: u.id,
  name: u.name,
  funcao: u.funcao,
  nivel_acesso: u.nivel_acesso,
  aniversario: u.aniversario,
  residencia: u.residencia,
  horario: u.horario,
  avatar: u.avatar
}));

export const defaultAuthorizedTasks: Task[] = [
  {
    id: "task-1",
    titulo: "Supervisão da Equipa e Estratégia Q3",
    descricao: "Alinhamento das diretrizes de gestão e revisão das entregas dos projetos da Vasrouse Creative.",
    id_responsavel: "adilsondias.admin",
    prazo: "2026-08-15",
    status: "in_progress",
    progresso: 65,
    prioridade: "Alta",
    projeto: "Vasrouse OS",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-2",
    titulo: "Organização de Processos Administrativos",
    descricao: "Acompanhamento da documentação interna, contratos e fluxo financeiro da empresa.",
    id_responsavel: "beatrizquengue.admin.ass",
    prazo: "2026-08-10",
    status: "in_progress",
    progresso: 80,
    prioridade: "Alta",
    projeto: "Administração",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-3",
    titulo: "Atendimento e Acompanhamento de Clientes",
    descricao: "Gestão de relacionamentos e apresentação de relatórios de satisfação de clientes corporativos.",
    id_responsavel: "claudiocateco.gr",
    prazo: "2026-08-12",
    status: "pending",
    progresso: 30,
    prioridade: "Média",
    projeto: "Gestão de Clientes",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-4",
    titulo: "Redação de Artigos e Comunicação Institucional",
    descricao: "Produção de conteúdos jornalísticos, comunicados oficiais e revisão de publicações.",
    id_responsavel: "elizabethpamela.jorn",
    prazo: "2026-08-08",
    status: "in_progress",
    progresso: 50,
    prioridade: "Média",
    projeto: "Comunicação",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-5",
    titulo: "Desenvolvimento da Identidade Visual e UI",
    descricao: "Criação de materiais gráficos, assets digitais e interfaces visuais para marcas parceiras.",
    id_responsavel: "emersonmicanda.design",
    prazo: "2026-08-14",
    status: "in_progress",
    progresso: 75,
    prioridade: "Alta",
    projeto: "Design Studio",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-6",
    titulo: "Prospecção e Relacionamento com Parceiros",
    descricao: "Acompanhamento contínuo da carteira de clientes e reporte de métricas de engajamento.",
    id_responsavel: "estefaneainocencio.gr",
    prazo: "2026-08-18",
    status: "completed",
    progresso: 100,
    prioridade: "Média",
    projeto: "Gestão de Clientes",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-7",
    titulo: "Auditoria Estratégica e Expansão de Operações",
    descricao: "Análise de métricas de desempenho e planeamento de novos mercados para a Vasrouse.",
    id_responsavel: "jorgedealmeida.admin",
    prazo: "2026-08-20",
    status: "in_progress",
    progresso: 40,
    prioridade: "Alta",
    projeto: "Estratégia",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-8",
    titulo: "Acompanhamento de Satisfação de Clientes",
    descricao: "Contacto periódico e gestão do suporte aos parceiros institucionais.",
    id_responsavel: "katianagregorio.gr",
    prazo: "2026-08-11",
    status: "pending",
    progresso: 25,
    prioridade: "Baixa",
    projeto: "Gestão de Clientes",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-9",
    titulo: "Coordenação Geral e Distribuição de Tarefas",
    descricao: "Acompanhamento dos prazos das equipas e facilitação dos fluxos de trabalho internos.",
    id_responsavel: "manueldomingos.coord",
    prazo: "2026-08-09",
    status: "in_progress",
    progresso: 85,
    prioridade: "Alta",
    projeto: "Coordenação",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-10",
    titulo: "Qualificação de Leads e Gestão de Propostas",
    descricao: "Análise de novos contactos comerciais e elaboração de propostas de serviço.",
    id_responsavel: "osvaldogregorio.gr",
    prazo: "2026-08-13",
    status: "in_progress",
    progresso: 60,
    prioridade: "Média",
    projeto: "Gestão de Clientes",
    comentarios: [],
    anexos: []
  },
  {
    id: "task-11",
    titulo: "Fidelização de Contas Chave",
    descricao: "Elaboração de relatórios de acompanhamento para contas de elevado impacto.",
    id_responsavel: "tatianatavares.gr",
    prazo: "2026-08-16",
    status: "review",
    progresso: 90,
    prioridade: "Alta",
    projeto: "Gestão de Clientes",
    comentarios: [],
    anexos: []
  }
];
