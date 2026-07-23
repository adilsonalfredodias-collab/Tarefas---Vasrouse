import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely to avoid crashing if the API key is not configured yet
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// 1. API: Focus Suggestions powered by Gemini AI
app.post("/api/focus-suggestions", async (req, res) => {
  try {
    const { role, name, tasks, completedCount } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // Return high-quality, simulated, role-specific suggestions if no API key is set
      const backupSuggestions = getBackupSuggestions(role, name, tasks, completedCount);
      return res.json({
        source: "simulated",
        suggestions: backupSuggestions
      });
    }

    const taskSummary = tasks && tasks.length > 0 
      ? tasks.map((t: any) => `- [${t.status}] ${t.titulo} (${t.prioridade}): ${t.descricao}`).join("\n")
      : "Sem tarefas ativas de momento.";

    const prompt = `Analise o perfil de trabalho deste membro do Workspace OS e forneça recomendações de foco de produtividade inteligentes e acionáveis.
Membro: ${name}
Função: ${role}
Tarefas concluídas nesta semana: ${completedCount || 0}
Tarefas em andamento/pendentes:\n${taskSummary}

Forneça um JSON contendo um array "suggestions" com exatamente 3 sugestões estruturadas. Cada sugestão deve ser um objeto com:
1. "category": categoria curta (ex: "Foco", "Bem-estar", "Prioridade", "Técnico").
2. "title": título curto, direto e motivador.
3. "description": uma recomendação prática e detalhada de 1 ou 2 frases em Português.

Responda APENAS com o JSON válido, sem markdown extra.`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = aiResponse.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({
        source: "gemini",
        suggestions: parsed.suggestions || []
      });
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini API notice:", error?.message || error);
    // Fallback to simulated data if there is an API or parse failure
    const { role, name, tasks, completedCount } = req.body;
    const backupSuggestions = getBackupSuggestions(role, name, tasks, completedCount);
    res.json({
      source: "fallback",
      suggestions: backupSuggestions
    });
  }
});

// Helper for high-quality fallback/backup suggestions
function getBackupSuggestions(role: string, name: string, tasks: any[], completedCount: number) {
  const isDev = role?.toLowerCase().includes("dev") || role?.toLowerCase().includes("engineer");
  const isDesigner = role?.toLowerCase().includes("design") || role?.toLowerCase().includes("art");
  const isManager = role?.toLowerCase().includes("manager") || role?.toLowerCase().includes("mgr") || role?.toLowerCase().includes("diretor");

  const list = [];

  if (isDev) {
    list.push({
      category: "Prioridade",
      title: "Consolidação de Código",
      description: "Foque em fechar as pull requests pendentes antes de iniciar novos blocos de código para evitar desvio de prazo nos tokens visuais."
    });
    list.push({
      category: "Foco",
      title: "Blocos Pomodoro de 50 min",
      description: "Seu cronograma atual tem tarefas de alta complexidade. Use foco ininterrupto com pausas estratégicas para manter a taxa de entrega em 94%."
    });
    list.push({
      category: "Técnico",
      title: "Otimização do Repositório",
      description: "As variáveis de elevação (glassmorphism) exigem renderização limpa. Certifique-se de sincronizar as paletas do modo escuro com o Style Dictionary."
    });
  } else if (isDesigner) {
    list.push({
      category: "Design",
      title: "Consistência de Tokens",
      description: "Revise o contraste do 'surface-container-high' para passar com folga nos testes de acessibilidade do Figma no modo escuro."
    });
    list.push({
      category: "Colaboração",
      title: "Feedback dos Desenvolvedores",
      description: "Abra um canal rápido com a equipa de dev para validar a exportação do arquivo 'tokens_v2.json' e evitar gargalos de integração."
    });
    list.push({
      category: "Bem-estar",
      title: "Pausa Criativa",
      description: "Descanse a visão de telas OLED a cada 2 horas para revigorar sua criatividade e garantir precisão nos detalhes de layout."
    });
  } else if (isManager) {
    list.push({
      category: "Prioridade",
      title: "Monitoramento de Prazos",
      description: "Há 3 prazos críticos agendados para hoje. Certifique-se de que a entrega V1 do rebranding está na mesa de revisão até as 11:30."
    });
    list.push({
      category: "Equipa",
      title: "Sincronização Diária",
      description: "Aproveite a reunião de Design Review para alinhar as prioridades semanais com Carlos e Sofia e manter o ritmo do projeto Nexus."
    });
    list.push({
      category: "Planeamento",
      title: "Sugestões de Foco",
      description: "Com 142 tarefas concluídas na equipa, o foco deve ser manter o engajamento e definir metas realistas para o próximo sprint."
    });
  } else {
    list.push({
      category: "Foco",
      title: "Planeamento Diário",
      description: "Inicie o dia revisando o seu calendário e definindo as 3 prioridades absolutas para manter as entregas sob controlo."
    });
    list.push({
      category: "Organização",
      title: "Limpeza de Caixa",
      description: "Responda às menções urgentes e marque as notificações lidas para limpar seu Workspace OS e reduzir a fadiga mental."
    });
    list.push({
      category: "Bem-estar",
      title: "Ritmo Saudável",
      description: "Mantenha o equilíbrio do seu horário laboral e registre as horas dedicadas com precisão para análises de produtividade corretas."
    });
  }
  return list;
}

// 2. Setup Vite / Production handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
