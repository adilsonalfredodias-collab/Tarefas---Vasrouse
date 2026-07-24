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

export const defaultAuthorizedTasks: Task[] = [];
