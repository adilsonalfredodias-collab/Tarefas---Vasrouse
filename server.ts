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

    let aiResponse;
    try {
      aiResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    } catch (aiErr: any) {
      console.warn("Gemini API call failed, falling back to smart local suggestions:", aiErr?.message || aiErr);
      const backupSuggestions = getBackupSuggestions(role, name, tasks, completedCount);
      return res.json({
        source: "fallback",
        suggestions: backupSuggestions
      });
    }

    const text = aiResponse?.text;
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
    console.warn("Using smart fallback suggestions due to Gemini API rate limit or error:", error?.message || error);
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
  if (!tasks || tasks.length === 0) {
    return [
      {
        category: "Início de Trabalho",
        title: "Registo de Tarefas",
        description: `Olá ${name}! O seu Workspace está configurado a partir do zero. Crie as suas primeiras tarefas no Calendário para iniciar o acompanhamento.`
      },
      {
        category: "Organização",
        title: "Atribuição de Responsabilidades",
        description: "Adicione prazos e etapas aos seus projetos para gerar métricas e estatísticas de produtividade em tempo real."
      },
      {
        category: "Relatórios",
        title: "Acompanhamento Diário",
        description: "Utilize a secção de Relatórios Diários para registar o progresso do trabalho e manter a equipa alinhada."
      }
    ];
  }

  const isDev = role?.toLowerCase().includes("dev") || role?.toLowerCase().includes("engineer");
  const isDesigner = role?.toLowerCase().includes("design") || role?.toLowerCase().includes("art");
  const isManager = role?.toLowerCase().includes("manager") || role?.toLowerCase().includes("mgr") || role?.toLowerCase().includes("diretor");

  const list = [];

  if (isDev) {
    list.push({
      category: "Prioridade",
      title: "Consolidação de Código",
      description: "Foque em concluir as tarefas de desenvolvimento em aberto antes de iniciar novos blocos de código."
    });
    list.push({
      category: "Foco",
      title: "Blocos de Trabalho Focado",
      description: "Organize o seu tempo em blocos ininterruptos com pausas estratégicas para manter a eficiência nas entregas."
    });
    list.push({
      category: "Técnico",
      title: "Revisão e Testes",
      description: "Garanta que todo o código submetido tem testes adequados e cumpre os padrões de qualidade da equipa."
    });
  } else if (isDesigner) {
    list.push({
      category: "Design",
      title: "Consistência Visual",
      description: "Revise a aplicação dos componentes e tokens visuais para garantir uma experiência consistente."
    });
    list.push({
      category: "Colaboração",
      title: "Alinhamento de Requisitos",
      description: "Valide os protótipos e assets visuais com os responsáveis do projeto antes do envio final."
    });
    list.push({
      category: "Bem-estar",
      title: "Pausas de Foco",
      description: "Faça pausas regulares para manter a clareza visual e o nível de precisão criativa."
    });
  } else if (isManager) {
    list.push({
      category: "Prioridade",
      title: "Acompanhamento de Prazos",
      description: `Com ${tasks.length} tarefa(s) registada(s), monitorize os prazos das entregas críticas da semana.`
    });
    list.push({
      category: "Equipa",
      title: "Sincronização Diária",
      description: "Acompanhe os relatórios diários submetidos pela equipa para identificar e resolver bloqueios."
    });
    list.push({
      category: "Planeamento",
      title: "Distribuição de Carga",
      description: `A taxa de conclusão atual é de ${completedCount} tarefa(s) concluída(s). Garanta o equilíbrio da carga de trabalho.`
    });
  } else {
    list.push({
      category: "Foco",
      title: "Planeamento Diário",
      description: "Inicie o dia revisando o seu calendário e definindo as prioridades para manter as entregas sob controlo."
    });
    list.push({
      category: "Organização",
      title: "Fluxo de Trabalho",
      description: "Mantenha o estado das suas tarefas atualizado no sistema para transparência de toda a equipa."
    });
    list.push({
      category: "Bem-estar",
      title: "Ritmo Saudável",
      description: "Mantenha o equilíbrio do seu horário laboral e registe o progresso com precisão."
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
