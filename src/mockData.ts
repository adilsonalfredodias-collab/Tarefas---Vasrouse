import { Profile, HRData, Task, Notification } from "./types";

export const initialProfiles: Profile[] = [
  {
    id: "ana-silva",
    name: "Ana Silva",
    funcao: "Lead Designer",
    nivel_acesso: "admin", // Matches her view as admin/pro
    aniversario: "05 Mar",
    residencia: "Lisboa, Portugal",
    horario: "09:00 - 18:00",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
  },
  {
    id: "carlos-mendes",
    name: "Carlos Mendes",
    funcao: "Senior Dev",
    nivel_acesso: "member",
    aniversario: "22 Nov",
    residencia: "Porto, Portugal",
    horario: "10:00 - 19:00",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
  },
  {
    id: "sofia-costa",
    name: "Sofia Costa",
    funcao: "Project Mgr",
    nivel_acesso: "leader",
    aniversario: "10 Set",
    residencia: "Coimbra, Portugal",
    horario: "09:30 - 18:30",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop"
  },
  {
    id: "alex-mercer",
    name: "Alex Mercer",
    funcao: "Lead Designer",
    nivel_acesso: "leader",
    aniversario: "14 Jun",
    residencia: "Braga, Portugal",
    horario: "09:00 - 18:00",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop"
  }
];

export const initialHRData: Record<string, HRData> = {
  "ana-silva": {
    id_perfil: "ana-silva",
    salario: 2800,
    data_contratacao: "12 Fev 2021",
    iban: "PT50 0033 0000 1234 5678 9012 3",
    contrato: "Efetivo"
  },
  "carlos-mendes": {
    id_perfil: "carlos-mendes",
    salario: 3200,
    data_contratacao: "01 Ago 2022",
    iban: "PT50 0033 0000 8765 4321 0987 6",
    contrato: "Termo Certo"
  },
  "sofia-costa": {
    id_perfil: "sofia-costa",
    salario: 2500,
    data_contratacao: "15 Jan 2023",
    iban: "PT50 0033 0000 5555 4444 3333 2",
    contrato: "Prestação Serv."
  },
  "alex-mercer": {
    id_perfil: "alex-mercer",
    salario: 2900,
    data_contratacao: "18 Out 2020",
    iban: "PT50 0033 0000 9999 8888 7777 6",
    contrato: "Efetivo"
  }
};

export const initialTasks: Task[] = [
  {
    id: "task-rebranding",
    titulo: "Entrega V1 - Rebranding",
    descricao: "Revisão final com o cliente antes do deploy na staging. Garantir que as diretrizes visuais estão respeitadas em todos os ecrãs.",
    id_responsavel: "ana-silva",
    prazo: "2026-07-24T09:00:00.000Z",
    tempo_inicio: "2026-07-15T09:00:00.000Z",
    status: "review",
    progresso: 85,
    prioridade: "Alta",
    projeto: "Nexus",
    anexos: [
      { id: "att-1", nome: "paleta_dark.png", tamanho: "1.2 MB", tipo: "image" },
      { id: "att-2", nome: "tokens_v2.json", tamanho: "45 KB", tipo: "json" }
    ],
    comentarios: [
      {
        id: "comm-1",
        id_autor: "ana-silva",
        nome_autor: "Ana Silva",
        avatar_autor: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop",
        data: "Há 2 horas",
        texto: "Concluí a primeira passagem pelas cores de superfície. Alguém pode revisar o contraste do `surface-container-high`?"
      },
      {
        id: "comm-2",
        id_autor: "carlos-mendes",
        nome_autor: "Carlos Mendes",
        avatar_autor: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
        data: "Há 30 minutos",
        texto: "Verifiquei agora. O contraste está passando em AA, mas talvez devamos escurecer um pouco o fundo principal para dar mais destaque. Vou abrir um PR com uma sugestão."
      }
    ]
  },
  {
    id: "task-mobile",
    titulo: "Design Review: App Mobile",
    descricao: "Revisar fluxos de onboarding e layouts principais do novo aplicativo móvel da Vasrouse Creative.",
    id_responsavel: "sofia-costa",
    prazo: "2026-07-25T11:30:00.000Z",
    tempo_inicio: "2026-07-18T10:00:00.000Z",
    status: "in_progress",
    progresso: 50,
    prioridade: "Média",
    projeto: "Mobile App",
    anexos: [],
    comentarios: []
  },
  {
    id: "task-checkout",
    titulo: "Wireframes Checkout",
    descricao: "Finalizar user flow e protótipo interativo do carrinho de compras e ecrã de pagamento.",
    id_responsavel: "ana-silva",
    prazo: "2026-07-26T14:00:00.000Z",
    status: "pending",
    progresso: 0,
    prioridade: "Alta",
    projeto: "E-Commerce",
    anexos: [],
    comentarios: []
  }
];

export const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    tipo: "task",
    subtipo: "Nova Tarefa",
    titulo: "Revisão de UI - App Mobile",
    texto: "Sarah Connor atribuiu a você a tarefa 'Revisão de UI - App Mobile' no projeto Nexus Redesign.",
    data: "Há 10 min",
    lida: false,
    meta: {
      id_tarefa: "task-mobile",
      nome_projeto: "Nexus Redesign",
      autor: "Sarah Connor"
    }
  },
  {
    id: "notif-2",
    tipo: "mention",
    subtipo: "Menção",
    titulo: "Comentário em Feedback do Cliente - Sprint 3",
    texto: "Elena Rodriguez mencionou você em um comentário na thread 'Feedback do Cliente - Sprint 3'.",
    data: "Há 45 min",
    lida: false,
    meta: {
      id_tarefa: "task-rebranding",
      autor: "Elena Rodriguez",
      comentario: "@Alex, pode confirmar se as margens estão seguindo o grid de 8px nesta tela?"
    }
  },
  {
    id: "notif-3",
    tipo: "status",
    subtipo: "Status Atualizado",
    titulo: "Status do projeto Campanha Q3 alterado",
    texto: "O status do projeto 'Campanha Q3' foi alterado para Em Revisão por Marcus Vance.",
    data: "Ontem, 14:30",
    lida: true,
    meta: {
      autor: "Marcus Vance"
    }
  },
  {
    id: "notif-4",
    tipo: "status",
    subtipo: "Tarefa Concluída",
    titulo: "Configurar Repositório Assets concluído",
    texto: "A tarefa 'Configurar Repositório Assets' que você estava acompanhando foi concluída.",
    data: "2 dias atrás",
    lida: true
  }
];

export const initialDailyReports = [
  {
    id: "report-1",
    id_usuario: "carlos-mendes",
    nome_usuario: "Carlos Mendes",
    avatar_usuario: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
    data: "2026-07-09",
    itens: [
      {
        id: "item-1",
        id_tarefa: "task-rebranding",
        titulo_tarefa: "Entrega V1 - Rebranding",
        status: "review",
        observacoes: "Adicionei as correções solicitadas pela Ana na paleta de cores primárias. O contraste AA foi atingido com sucesso em todos os botões de ação primária e secundária.",
        anexo: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop"
      }
    ]
  },
  {
    id: "report-2",
    id_usuario: "sofia-costa",
    nome_usuario: "Sofia Costa",
    avatar_usuario: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&auto=format&fit=crop",
    data: "2026-07-09",
    itens: [
      {
        id: "item-2",
        id_tarefa: "task-mobile",
        titulo_tarefa: "Design Review: App Mobile",
        status: "in_progress",
        observacoes: "Realizei o alinhamento matinal com a equipa técnica para validar a viabilidade dos fluxos de animação do onboarding. Ajustámos a transição de ecrãs.",
        anexo: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format&fit=crop"
      }
    ]
  }
];

