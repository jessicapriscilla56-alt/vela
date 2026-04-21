import { useState, useRef, useEffect } from "react";

// ── SUPABASE ──
const SUPABASE_URL = "https://infqprbswnjtzontvuez.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZnFwcmJzd25qdHpvbnR2dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODM3MTQsImV4cCI6MjA5MjM1OTcxNH0.T9cxiCbMzsA-vb9O016_VjMPQY4sBxiIT0rg2UkQDaM";

const sb = {
  async getSession() {
    const hash = window.location.hash;
    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        localStorage.setItem("sb_token", token);
        window.location.hash = "";
        return token;
      }
    }
    return localStorage.getItem("sb_token");
  },
  async getUser(token) {
    if (!token) return null;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) { localStorage.removeItem("sb_token"); return null; }
    return res.json();
  },
  async signOut() {
    const token = localStorage.getItem("sb_token");
    if (token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
      });
    }
    localStorage.removeItem("sb_token");
    localStorage.removeItem("sb_refresh");
  },
  async salvarDados(userId, key, value) {
    const token = localStorage.getItem("sb_token");
    if (!token) return;
    await fetch(`${SUPABASE_URL}/rest/v1/user_data`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({ user_id: userId, key, value: JSON.stringify(value) })
    });
  },
  async carregarDados(userId, key) {
    const token = localStorage.getItem("sb_token");
    if (!token) return null;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_data?user_id=eq.${userId}&key=eq.${key}&select=value`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    try { return JSON.parse(data[0].value); } catch { return data[0].value; }
  }
};

// Tela de login
function LoginScreen() {
  const [modo, setModo] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const V = TEMAS.escuro;

  const entrar = async () => {
    if (!email.trim() || !senha.trim()) { setErro("Preencha e-mail e senha."); return; }
    setLoading(true); setErro("");
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha })
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error_description || data.msg || "E-mail ou senha incorretos."); setLoading(false); return; }
      localStorage.setItem("sb_token", data.access_token);
      localStorage.setItem("sb_refresh", data.refresh_token || "");
      window.location.reload();
    } catch (e) { setErro("Erro de conexão. Tente novamente."); }
    setLoading(false);
  };

  const cadastrar = async () => {
    if (!email.trim() || !senha.trim()) { setErro("Preencha e-mail e senha."); return; }
    if (senha.length < 6) { setErro("A senha precisa ter pelo menos 6 caracteres."); return; }
    setLoading(true); setErro("");
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha })
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error_description || data.msg || "Erro ao criar conta."); setLoading(false); return; }
      if (data.access_token) {
        localStorage.setItem("sb_token", data.access_token);
        localStorage.setItem("sb_refresh", data.refresh_token || "");
        window.location.reload();
      } else {
        setSucesso("Conta criada! Verifique seu e-mail para confirmar o acesso.");
      }
    } catch (e) { setErro("Erro de conexão. Tente novamente."); }
    setLoading(false);
  };

  return (
    <div style={{ background: V.bg, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ width: "100%", maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: `linear-gradient(135deg, #F5A800, #C8880A)`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontFamily: "monospace", color: "#080A0F", fontWeight: 700, margin: "0 auto 16px", boxShadow: "0 4px 20px rgba(240,165,0,0.3)" }}>◎</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: V.text, marginBottom: 6, letterSpacing: -1 }}>Vela</div>
          <div style={{ fontSize: 13, color: V.text2 }}>Copiloto do líder de CS e CX</div>
        </div>

        {/* Princípio */}
        <div style={{ marginBottom: 28, padding: "16px 18px", background: `linear-gradient(135deg, rgba(240,165,0,0.06), rgba(240,165,0,0.02))`, border: `1px solid rgba(240,165,0,0.15)`, borderRadius: 14 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, fontStyle: "italic", color: V.text, lineHeight: 1.6, marginBottom: 6 }}>
            "Clareza é uma das maiores formas de respeito que um líder pode oferecer ao time."
          </div>
          <div style={{ fontSize: 10, color: V.text2 }}>— Liderança Customer Centric</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: V.surface2, borderRadius: 10, padding: 3, marginBottom: 20 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setModo(m); setErro(""); setSucesso(""); }}
              style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, background: modo === m ? V.surface : "transparent", color: modo === m ? V.text : V.text2, fontFamily: "inherit", fontSize: 13, fontWeight: modo === m ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {/* Campos */}
        <div style={{ marginBottom: 12 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Seu e-mail"
            style={{ width: "100%", background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 10, padding: "13px 14px", color: V.text, fontFamily: "inherit", fontSize: 15, outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "#F5A800"}
            onBlur={e => e.target.style.borderColor = V.border} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="Senha (mínimo 6 caracteres)"
            onKeyDown={e => e.key === "Enter" && (modo === "login" ? entrar() : cadastrar())}
            style={{ width: "100%", background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 10, padding: "13px 14px", color: V.text, fontFamily: "inherit", fontSize: 15, outline: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "#F5A800"}
            onBlur={e => e.target.style.borderColor = V.border} />
        </div>

        {erro && <div style={{ background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#FB7185", marginBottom: 12 }}>{erro}</div>}
        {sucesso && <div style={{ background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#2DD4BF", marginBottom: 12 }}>{sucesso}</div>}

        <button onClick={modo === "login" ? entrar : cadastrar} disabled={loading}
          style={{ width: "100%", background: loading ? V.surface3 : `linear-gradient(135deg, #F5A800, #C8880A)`, color: loading ? V.text2 : "#080A0F", border: "none", borderRadius: 12, padding: "14px", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 20px rgba(240,165,0,0.25)", transition: "all 0.2s" }}>
          {loading ? "Aguarde..." : modo === "login" ? "✦ Entrar" : "✦ Criar minha conta"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: V.text3, lineHeight: 1.6 }}>
          Seus dados ficam seguros e vinculados ao seu e-mail.
        </div>
      </div>
    </div>
  );
}

const TEMAS = {
  escuro: {
    bg: "#1C1E24", surface: "#24262E", surface2: "#2C2F38", surface3: "#343740",
    border: "#3A3D48", border2: "#46495A",
    amber: "#F0A500", amberDim: "rgba(240,165,0,0.10)", amberGlow: "rgba(240,165,0,0.06)",
    teal: "#2DD4BF", tealDim: "rgba(45,212,191,0.10)",
    rose: "#FB7185", roseDim: "rgba(251,113,133,0.10)",
    indigo: "#818CF8", indigoDim: "rgba(129,140,248,0.10)",
    text: "#F0F2F8", text2: "#9098B8", text3: "#5A6080",
    navInativo: "#6870A0",
    gradCard: "linear-gradient(145deg, #26282F 0%, #222530 100%)",
    gradHeader: "linear-gradient(180deg, #242630 0%, #1E2028 100%)",
    gradNav: "linear-gradient(0deg, #1A1C22 0%, #22242C 100%)",
    shadowCard: "0 2px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04)",
    shadowAmber: "0 0 20px rgba(240,165,0,0.08)",
  },
  claro: {
    bg: "#F5F5F0", surface: "#FFFFFF", surface2: "#F0EFE8", surface3: "#E8E7DF",
    border: "#E0DED5", border2: "#C8C6BC",
    amber: "#D4920A", amberDim: "rgba(212,146,10,0.10)", amberGlow: "rgba(212,146,10,0.05)",
    teal: "#0D9488", tealDim: "rgba(13,148,136,0.10)",
    rose: "#E11D48", roseDim: "rgba(225,29,72,0.10)",
    indigo: "#4F46E5", indigoDim: "rgba(79,70,229,0.10)",
    text: "#1A1A2E", text2: "#5A5A7A", text3: "#9A9AB0",
    navInativo: "#5A5A7A",
  },
};

let V = TEMAS.escuro;

// ── CONTEÚDO DO LIVRO ──
const PRINCIPIOS = [
  { frase: "Fato não tem defesa. Julgamento tem.", cap: "Capítulo 4 — Feedback" },
  { frase: "Progresso primeiro. Ordem vem depois.", cap: "Capítulo 7 — Trocar a roda com o carro andando" },
  { frase: "Autonomia sem abandono.", cap: "Capítulo 9 — Autonomia sem abandono" },
  { frase: "O maior teste de uma liderança é o que acontece quando você não está.", cap: "Capítulo 1 — Construir do zero" },
  { frase: "Tornar-se desnecessário não é o fim da liderança. É a prova de que ela funcionou.", cap: "Capítulo 10 — O líder que se torna desnecessário" },
  { frase: "Resultado sem gente não existe. Gente sem liderança não se transforma.", cap: "Parte 2 — Pessoas, times e cultura" },
  { frase: "Liderança intencional é agir hoje com base no que você quer que exista amanhã.", cap: "Capítulo 11 — Liderança intencional" },
  { frase: "Quando o líder oscila, o time perde referência. Quando o líder se regula, o time encontra chão.", cap: "Capítulo 3 — Autoliderança" },
  { frase: "O que você construiu não é uma operação. É gente.", cap: "Parte 4 — O legado de quem lidera" },
  { frase: "Clareza é uma das maiores formas de respeito que um líder pode oferecer ao time.", cap: "Parte 2 — Pessoas, times e cultura" },
  { frase: "Você não será lembrado pelos processos que criou. Será lembrado pelo que as pessoas que você desenvolveu se tornaram.", cap: "Capítulo 12 — Ver outros fazendo o que você ensinou" },
  { frase: "Comportamento enraizado não muda com uma conversa. Muda com evidência, com tempo e com alguém que acredita na transformação antes da própria pessoa acreditar.", cap: "Capítulo 4 — Feedback" },
];

const CHECKIN_FULL = [
  { id: "nome", emoji: "◉", title: "Qual seu nome e cargo?", sub: "Como podemos te chamar?", placeholder: "Ex: Mariana, Head of CS" },
  { id: "empresa", emoji: "◈", title: "Onde você trabalha e qual o tamanho do seu time?", sub: "Empresa e contexto da operação", placeholder: "Ex: Startup SaaS B2B, time de 8 pessoas em 3 frentes" },
  { id: "metricas", emoji: "◆", title: "Quais são seus números atuais?", sub: "NPS, churn, CSAT, MRR — o que você tiver", placeholder: "Ex: NPS 38, churn 3.2%, CSAT 4.1, MRR expansão R$24k" },
  { id: "semana", emoji: "◇", title: "Como está sua semana?", sub: "O que está acontecendo, o que está pesando mais", placeholder: "Ex: QBR na quinta com 3 contas em risco, time sobrecarregado..." },
  { id: "desafio", emoji: "▷", title: "Qual seu maior desafio de liderança agora?", sub: "Com o time, processos ou stakeholders", placeholder: "Ex: Preciso dar um feedback difícil para meu CS sênior que não está entregando..." },
  { id: "prioridade", emoji: "✦", title: "Se você pudesse resolver uma coisa essa semana, o que seria?", sub: "O que, se resolvido, muda o jogo", placeholder: "Ex: Fechar as renovações em aberto antes do fim do mês..." },
  { id: "estilo", emoji: "◎", title: "Como você se descreve como líder?", sub: "Seu estilo, seus pontos fortes e seus maiores desafios recorrentes", placeholder: "Ex: Sou muito direta, prefiro autonomia no time, tenho dificuldade com conversas difíceis e tendência a resolver tudo sozinha..." },
  { id: "cultura", emoji: "◑", title: "Como é a cultura da sua empresa?", sub: "Valores, jeito de trabalhar, código de conduta — cole aqui se quiser", placeholder: "Ex: Empresa de alto crescimento, cultura de ownership, feedback direto, foco em resultado. Valorizamos transparência e velocidade sobre perfeição..." },
];

const CHECKIN_UPDATE = [
  { id: "metricas", emoji: "◆", title: "Como estão seus números essa semana?", sub: "NPS, churn, CSAT — o que mudou", placeholder: "Ex: NPS subiu para 41, churn 2.8%, CSAT 4.3..." },
  { id: "semana", emoji: "◇", title: "Como foi sua semana?", sub: "O que aconteceu, o que avançou, o que pesou", placeholder: "Ex: Fechei 3 renovações, perdi 1 conta grande, time está mais leve..." },
  { id: "prioridade", emoji: "✦", title: "Qual sua prioridade número 1 agora?", sub: "O que precisa acontecer esta semana", placeholder: "Ex: Alinhar plano de expansão com o CEO..." },
  { id: "desafio", emoji: "▷", title: "Algum desafio de liderança essa semana?", sub: "Com o time, stakeholders ou você mesmo", placeholder: "Ex: Time desmotivado após meta não batida..." },
];

// Perguntas de crise do livro (Cap. 9)
const PERGUNTAS_CRISE = [
  "O que exatamente aconteceu? (entenda o problema com precisão antes de agir)",
  "Qual é o impacto real para o cliente? (o cliente ficou insatisfeito ou está impedido de operar?)",
  "Esse problema é pontual ou pode ser estrutural? (pode se repetir?)",
  "Existe alguma forma de reduzir o impacto agora? (solução temporária enquanto resolve de verdade)",
  "O que precisa mudar para que isso não aconteça novamente? (causa raiz)",
];

function parseMetrics(text) {
  const t = text || "";
  return {
    nps: parseInt(t.match(/nps\s*[:\-]?\s*(-?\d+)/i)?.[1] ?? "42"),
    churn: parseFloat(t.match(/churn\s*[:\-]?\s*([\d.]+)/i)?.[1] ?? "3.2"),
    csat: parseFloat(t.match(/csat\s*[:\-]?\s*([\d.]+)/i)?.[1] ?? "4.1"),
    mrr: parseFloat(t.match(/(?:mrr|expans)[^\d]*([\d.,]+)/i)?.[1]?.replace(",", ".") ?? "24500"),
  };
}

function gerarTarefas(semana, prioridade, desafio) {
  const s = (semana || "").toLowerCase();
  const tasks = { do: [], sc: [], de: [], el: [] };

  // Só adiciona prioridade se for curta e parecer uma tarefa real
  const prioLimpa = (prioridade || "").trim();
  if (prioLimpa && prioLimpa.length < 80 && !prioLimpa.includes("meu nome") && !prioLimpa.includes("trabalho na") && !prioLimpa.includes("equipe de")) {
    tasks.do.push(prioLimpa.substring(0, 55));
  }

  if (s.includes("risco") || s.includes("churn") || s.includes("reno")) tasks.do.push("Contato direto com contas em risco");
  if (s.includes("qbr") || s.includes("reunião") || s.includes("board")) tasks.do.push("Preparar apresentação executiva");
  if (desafio) tasks.sc.push("Conversa de feedback com liderado");
  tasks.sc.push("Bloco estratégico — 60min protegido");
  if (s.includes("time") || s.includes("equipe")) tasks.sc.push("1:1 com membros do time");
  tasks.de.push("Relatórios operacionais de rotina");
  if (s.includes("ticket") || s.includes("suporte")) tasks.de.push("Triagem de tickets de suporte");
  tasks.el.push("Reuniões sem pauta ou decisão clara");
  return tasks;
}

// ── API DO CLAUDE ──
async function chamarClaude(prompt) {
  const key = import.meta.env.VITE_ANTHROPIC_KEY;
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || "Erro na API");
  return data.content[0].text;
}

function getSistema(dados) {
  const perfil = dados?.estiloLideranca ? `\nPERFIL DESTA LÍDER:\n${dados.estiloLideranca}` : "";
  const cultura = dados?.culturaEmpresa ? `\nCULTURA DA EMPRESA:\n${dados.culturaEmpresa}` : "";
  return `Você é o Vela, um copiloto de liderança para líderes de CS (Customer Success) e CX (Customer Experience) em startups brasileiras. Você foi criado com base no livro "Liderança Customer Centric" e na metodologia da autora.

Princípios que guiam todas as suas respostas:
- "Fato não tem defesa. Julgamento tem." — sempre baseie análises em comportamentos e dados concretos, nunca em impressões
- "Autonomia sem abandono." — estimule a autonomia sem abandonar o liderado
- "Progresso primeiro. Ordem vem depois." — priorize ação antes da perfeição
- "Liderança intencional é agir hoje com base no que você quer que exista amanhã."
- "O que você construiu não é uma operação. É gente."

Seu estilo:
- Direto, sem rodeios, sem introduções genéricas
- Respostas práticas e acionáveis — o líder precisa saber o que fazer
- Linguagem profissional mas humana, em português brasileiro
- Estruture as respostas com seções claras usando ✦ como marcador
- Máximo de 500 palavras por resposta${perfil}${cultura}`;
}

// Mantém SISTEMA como fallback sem perfil
const SISTEMA = getSistema(null);

async function gerarFeedback(desafio, sev, cargo, tempo, tipoComp, historico, dados) {
  const sevMap = { dev: "desenvolvimento (tom: curioso, encorajador)", at: "atenção (tom: direto, construtivo)", crit: "crítico (tom: firme, claro)", dem: "pré-demissão (tom: transparente, sério)" };
  const tempoMap = { novo: "menos de 3 meses na equipe", medio: "3 a 12 meses na equipe", senior: "mais de 1 ano na equipe" };
  const compMap = { entrega: "entrega e resultado", relacionamento: "relacionamento interpessoal", autonomia: "autonomia e iniciativa", comunicacao: "comunicação", padrao: "comportamento geral" };

  const prompt = `${getSistema(dados)}

MÓDULO: Estruturação de Feedback

CONTEXTO DO LIDERADO:
- Cargo: ${cargo || "não informado"}
- Tempo na equipe: ${tempoMap[tempo]}
- Tipo de comportamento a abordar: ${compMap[tipoComp] || compMap.padrao}
- Histórico: ${historico === "primeira" ? "primeira vez que esse comportamento aparece" : "comportamento recorrente — já houve conversas anteriores"}
- Criticidade: ${sevMap[sev]}

SITUAÇÃO DESCRITA PELO LÍDER:
"${desafio}"

Com base no framework Fato → Impacto → Futuro do livro Liderança Customer Centric, estruture uma preparação completa para essa conversa de feedback. Inclua:
1. Como preparar a conversa (o que reunir antes)
2. Abertura sugerida (frase de abertura adaptada ao perfil e criticidade)
3. Núcleo do feedback (aplicando Fato → Impacto → Futuro à situação específica descrita)
4. Perguntas de escuta ativa adaptadas ao perfil
5. Como fechar com acordo claro

Lembre: fato não tem defesa. Se o líder ainda está no campo da impressão, oriente-o a encontrar o fato concreto.`;

  return await chamarClaude(prompt);
}

async function gerarNarrativa(dados, aud, obj, tone, tamanhoTime, momentoEmpresa) {
  const { metricas, contextoSemana, rawMetricas } = dados;
  const audMap = { board: "Board e C-Level", ceo: "CEO e Founder", vp: "VP de Produto", inv: "Investidores" };
  const objMap = { res: "apresentar o resultado do período", apr: "justificar um investimento em CS/CX", alert: "comunicar um risco que exige ação", exp: "apresentar oportunidade de expansão de receita" };
  const toneMap = { ot: "otimista — destacando momentum e oportunidades", neu: "neutro — apresentando o quadro real com equilíbrio", urg: "urgente — comunicando risco e necessidade de decisão imediata" };

  const prompt = `${getSistema(dados)}

MÓDULO: Narrativa para Diretoria

AUDIÊNCIA: ${audMap[aud]}
OBJETIVO: ${objMap[obj]}
TOM: ${toneMap[tone]}
TAMANHO DO TIME: ${tamanhoTime === "pequeno" ? "até 5 pessoas" : tamanhoTime === "medio" ? "6 a 15 pessoas" : "mais de 15 pessoas"}
MOMENTO DA EMPRESA: ${momentoEmpresa === "early" ? "early stage" : momentoEmpresa === "crescendo" ? "crescimento" : "escala"}

DADOS E CONTEXTO:
${rawMetricas || ""}
${contextoSemana ? `Contexto da semana: ${contextoSemana}` : ""}
NPS: ${metricas?.nps ?? "não informado"} | Churn: ${metricas?.churn ?? "não informado"}% | CSAT: ${metricas?.csat ?? "não informado"} | MRR Expansão: R$${metricas?.mrr ?? "não informado"}

Construa uma narrativa executiva que traduza esses dados técnicos em linguagem de negócio para ${audMap[aud]}. O objetivo é ${objMap[obj]}. Mostre o impacto no negócio, não só os números. Inclua um próximo passo recomendado claro.`;

  return await chamarClaude(prompt);
}

async function gerarPriorizacao(dados, tamanhoTime, momentoEmpresa, tipoSemana) {
  const { contextoSemana, prioridade, desafioLideranca } = dados;
  const semanaMap = { estrategico: "calma/estratégica", normal: "normal", atarefado: "muito cheia/atarefada", crise: "em crise" };

  const prompt = `${getSistema(dados)}

MÓDULO: Próximos Movimentos — Priorização Semanal

CONTEXTO DO LÍDER:
- Tipo de semana: ${semanaMap[tipoSemana] || "normal"}
- Tamanho do time: ${tamanhoTime === "pequeno" ? "até 5 pessoas" : tamanhoTime === "medio" ? "6 a 15 pessoas" : "mais de 15 pessoas"}
- Momento da empresa: ${momentoEmpresa === "early" ? "early stage" : momentoEmpresa === "crescendo" ? "crescimento" : "escala"}
- Prioridade declarada: ${prioridade || "não informada"}
- Desafio de liderança atual: ${desafioLideranca || "não informado"}
- Contexto da semana: ${contextoSemana || "não informado"}

Com base na Matriz de Eisenhower aplicada à liderança de CS/CX, estruture os 3 movimentos mais importantes dessa semana para esse líder. Seja específico ao contexto descrito — não genérico. Inclua também o que delegar, o que eliminar e uma pergunta estratégica que o líder deveria se fazer essa semana.`;

  return await chamarClaude(prompt);
}

async function gerarAnaliseIndicador(indicador, foco, dados) {
  const focoMap = { churn: "Churn (taxa de cancelamento)", nps: "NPS (Net Promoter Score)", csat: "CSAT (satisfação por interação)", expansao: "Expansão de receita (MRR expansion)", onboarding: "Onboarding (ativação de clientes)", retencao: "Retenção (renovações e permanência)" };

  const segmentacaoNPS = `
METODOLOGIA DE ANÁLISE DE NPS:
- Nunca analise o NPS como um número único — identifique onde está concentrado o problema
- Segmentações prioritárias: por momento do ciclo de vida (0-90 dias, 6m, 1 ano+), por decisor vs usuário operacional, por responsável de CS, por região ou segmento
- NEUTROS são a maior oportunidade: converter neutro em promotor é muito mais eficiente do que converter detrator. Aponte ações específicas para os neutros.
- Detratores raramente viram promotores — foco em estabilizar e entender a causa raiz`;

  const segmentacaoChurn = `
METODOLOGIA DE ANÁLISE DE CHURN:
- Sempre categorize por motivo: financeiro, engajamento do sócio, engajamento da equipe, problema de produto, questão pessoal/interna do cliente
- Identifique em qual momento do ciclo de vida o churn está concentrado — isso revela se é problema de onboarding, de valor ou de relacionamento
- Use os padrões encontrados para antecipar quais novos contratos vão precisar de atenção maior desde o início
- Micro ações são mais eficazes do que uma ação grande — sugira 3 a 5 ações pequenas e específicas`;

  const metodologia = foco === "nps" ? segmentacaoNPS : foco === "churn" ? segmentacaoChurn : "";

  const temPlanilha = indicador.includes("DADOS DO ARQUIVO");

  const prompt = `${getSistema(dados)}

MÓDULO: Cockpit — Análise de Indicador

INDICADOR: ${focoMap[foco] || foco}
${metodologia}

SITUAÇÃO DESCRITA PELO LÍDER:
"${indicador}"

${temPlanilha ? "O líder subiu uma planilha com dados reais. Analise os dados disponíveis e identifique padrões, concentrações e segmentações que o líder provavelmente não está vendo." : ""}

Estruture a resposta assim:

✦ DIAGNÓSTICO
O que está acontecendo de verdade — vá além do óbvio.

✦ SEGMENTAÇÕES QUE REVELAM MAIS
Quais recortes mostrariam onde está concentrado o problema. ${temPlanilha ? "Use os dados da planilha para identificar padrões reais." : "Oriente o líder sobre quais dados coletar para segmentar melhor."}

✦ MICRO AÇÕES PRIORITÁRIAS
3 a 5 ações pequenas e específicas, ordenadas por impacto. Cada uma com: o quê, com quem, em quanto tempo.

✦ ATENÇÃO PARA NOVOS CONTRATOS
Com base nos padrões, quais perfis de cliente vão precisar de atenção redobrada desde o início.

✦ PERGUNTA ESTRATÉGICA
Uma pergunta que o líder deveria se fazer essa semana.`;

  return await chamarClaude(prompt);
}

async function gerarAnaliseCrise(problema, gravidade, quantos, jaFez, dados) {
  const gravMap = { insatisfeito: "cliente insatisfeito", travado: "cliente travado/impedido de operar", churn: "risco real de churn", confirmado: "churn confirmado" };
  const quantosMap = { um: "1 cliente afetado", varios: "múltiplos clientes afetados", sistemico: "problema sistêmico" };

  const prompt = `${getSistema(dados)}

MÓDULO: Gestão de Crise

SITUAÇÃO:
- O que aconteceu: "${problema}"
- Tipo: ${gravMap[gravidade] || gravidade}
- Escala: ${quantosMap[quantos] || quantos}
- O que já foi feito: ${jaFez || "nada ainda"}

Com base nas 5 dimensões de gestão de crise do livro Liderança Customer Centric, estruture um diagnóstico e plano de resposta completo. Seja direto — o líder está sob pressão e precisa saber o que fazer agora. Inclua urgência, impacto real, se é pontual ou estrutural, ação imediata e causa raiz para depois que estabilizar.`;

  return await chamarClaude(prompt);
}

// Mantém funções síncronas como fallback se API não estiver disponível
function gerarFeedbackSync(desafio, sev, cargo, tempo, tipoComp, historico) {
  return `PERFIL: ${cargo || "Liderado"} · ${tempo === "novo" ? "Menos de 3 meses" : tempo === "medio" ? "3 a 12 meses" : "Mais de 1 ano"}\n\nANTES DA CONVERSA\nPrepare exemplos concretos. Reserve 45-60min sem interrupção.\n\nNÚCLEO — Fato → Impacto → Futuro\n"Observei que [FATO]. Isso gerou [IMPACTO]. O que preciso ver diferente é [COMPORTAMENTO ESPERADO]."\n\nSituação: "${desafio.substring(0, 100)}..."\n\nFato não tem defesa. Julgamento tem.`;
}

// ── COMPONENTES ──
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background: V.gradCard || V.surface, border: `1px solid ${V.border}`, borderRadius: 16, padding: 20, marginBottom: 12, cursor: onClick ? "pointer" : "default", boxShadow: V.shadowCard, transition: "border-color 0.2s, box-shadow 0.2s", ...style }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 9, fontWeight: 700, color: V.amber, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: 14, height: 1, background: V.amber }} />{children}
  </div>
);

const PageTitle = ({ children, accent }) => (
  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6, lineHeight: 1.2 }}>
    {children}{accent && <span style={{ color: V.amber }}> {accent}</span>}
  </div>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 600, color: V.text2, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 5 }}>{children}</div>
);

const Input = ({ style, ...props }) => (
  <input style={{ width: "100%", background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 9, padding: "11px 13px", color: V.text, fontFamily: "inherit", fontSize: 15, outline: "none", boxSizing: "border-box", ...style }}
    onFocus={e => e.target.style.borderColor = V.amber} onBlur={e => e.target.style.borderColor = V.border} {...props} />
);

const TextArea = ({ rows = 4, style, ...props }) => (
  <textarea rows={rows} style={{ width: "100%", background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 9, padding: "11px 13px", color: V.text, fontFamily: "inherit", fontSize: 15, resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box", ...style }}
    onFocus={e => e.target.style.borderColor = V.amber} onBlur={e => e.target.style.borderColor = V.border} {...props} />
);

// TextArea com microfone
function VoiceTextArea({ rows = 4, value, onChange, placeholder, style }) {
  const [rec, setRec] = useState("idle");
  const recRef = useRef(null);
  const accRef = useRef(""); // acumula texto entre pausas automáticas do iOS
  const activeRef = useRef(false); // controla se o usuário ainda quer gravar

  const startRec = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "pt-BR"; r.continuous = true; r.interimResults = false;
    r.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) t += e.results[i][0].transcript + " ";
      }
      if (t) {
        accRef.current += t;
        onChange({ target: { value: (value || "") + accRef.current } });
      }
    };
    r.onend = () => {
      // iOS para automaticamente — se o usuário não clicou em parar, reinicia
      if (activeRef.current) {
        try { r.start(); } catch {}
      } else {
        setRec("idle");
      }
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" && activeRef.current) {
        try { r.start(); } catch {}
      } else {
        activeRef.current = false;
        setRec("idle");
      }
    };
    r.start();
    recRef.current = r;
  };

  const toggle = () => {
    if (rec === "recording") {
      activeRef.current = false;
      recRef.current?.stop();
      accRef.current = "";
      setRec("idle");
      return;
    }
    accRef.current = "";
    activeRef.current = true;
    setRec("recording");
    startRec();
  };

  return (
    <div style={{ position: "relative" }}>
      <textarea rows={rows} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", background: V.surface2, border: `1px solid ${rec === "recording" ? V.rose : V.border}`, borderRadius: 9, padding: "11px 42px 11px 13px", color: V.text, fontFamily: "inherit", fontSize: 15, resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box", ...style }}
        onFocus={e => e.target.style.borderColor = rec === "recording" ? V.rose : V.amber}
        onBlur={e => e.target.style.borderColor = rec === "recording" ? V.rose : V.border} />
      <button onClick={toggle}
        style={{ position: "absolute", right: 10, top: 10, width: 28, height: 28, borderRadius: 8, border: "none", background: rec === "recording" ? V.rose : V.surface3, color: rec === "recording" ? "#fff" : V.text2, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        {rec === "recording" ? "⏹" : "🎙"}
      </button>
    </div>
  );
}

const Sel = ({ children, style, ...props }) => (
  <select style={{ width: "100%", background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 9, padding: "11px 13px", color: V.text, fontFamily: "inherit", fontSize: 15, outline: "none", boxSizing: "border-box", ...style }} {...props}>{children}</select>
);

const BtnPrimary = ({ children, onClick, disabled, loading, style }) => (
  <button onClick={onClick} disabled={disabled || loading}
    style={{ width: "100%", background: disabled || loading ? V.surface3 : `linear-gradient(135deg, #F5A800, #C8880A)`, color: disabled || loading ? V.text2 : "#080A0F", border: "none", borderRadius: 12, padding: "15px", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, cursor: disabled || loading ? "not-allowed" : "pointer", transition: "all 0.25s", boxShadow: disabled || loading ? "none" : "0 4px 20px rgba(240,165,0,0.25), 0 1px 0 rgba(255,255,255,0.1) inset", letterSpacing: "0.2px", ...style }}>
    {loading ? "⏳ Gerando..." : children}
  </button>
);

const BtnSecondary = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{ background: "transparent", border: `1px solid ${V.border2}`, color: V.text2, borderRadius: 10, padding: "11px 16px", fontFamily: "inherit", fontSize: 14, cursor: "pointer", transition: "border-color 0.2s, color 0.2s", ...style }}>{children}</button>
);

const Pills = ({ options, value, onChange }) => (
  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
    {options.map(o => (
      <button key={o.value} onClick={() => onChange(o.value)}
        style={{ padding: "8px 14px", border: `1.5px solid ${value === o.value ? V.amber : V.border}`, borderRadius: 20, background: value === o.value ? V.amberDim : V.surface2, color: value === o.value ? V.amber : V.text2, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}>
        {o.label}
      </button>
    ))}
  </div>
);

const ResultBox = ({ text, modulo = "", promptOriginal = "" }) => {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [followUpResult, setFollowUpResult] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const enviarFollowUp = async () => {
    if (!followUp.trim()) return;
    setFollowUpLoading(true);
    try {
      const prompt = `${SISTEMA}\n\nANÁLISE ANTERIOR:\n${text}\n\nPERGUNTA DE APROFUNDAMENTO:\n"${followUp}"\n\nResponda de forma direta e específica à pergunta, mantendo o contexto da análise anterior. Seja objetivo — máximo de 300 palavras.`;
      const r = await chamarClaude(prompt);
      setFollowUpResult(r);
      setFollowUp("");
    } catch (e) {
      setFollowUpResult("Erro ao gerar. Tente novamente.");
    }
    setFollowUpLoading(false);
  };

  if (!text) return null;

  const handleRating = (val) => {
    setRating(val);
    if (val === "down") setShowFeedback(true);
    if (val === "up") {
      // Em produção: salvar no banco { modulo, rating: 'up', timestamp }
      setFeedbackSent(true);
    }
  };

  const enviarFeedback = () => {
    // Em produção: salvar no banco { modulo, rating: 'down', feedback, timestamp }
    setFeedbackSent(true);
    setShowFeedback(false);
  };

  return (
    <div style={{ background: `linear-gradient(145deg, rgba(240,165,0,0.04) 0%, rgba(8,10,15,0.8) 100%)`, border: `1px solid rgba(240,165,0,0.18)`, borderLeft: `2px solid ${V.amber}`, borderRadius: 14, padding: 18, marginTop: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: V.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>✦ Resultado</div>
      <MarkdownText text={text} />

      {/* Ações */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${V.border}` }}>
        <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          style={{ background: "none", border: `1px solid ${V.border2}`, color: V.text2, cursor: "pointer", fontSize: 12, fontFamily: "inherit", padding: "6px 12px", borderRadius: 7, transition: "color 0.15s" }}>
          {copied ? "✓ Copiado!" : "📋 Copiar"}
        </button>

        <div style={{ flex: 1 }} />

        {/* Avaliação */}
        {!feedbackSent ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: V.text2 }}>Foi útil?</span>
            <button onClick={() => handleRating("up")}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${rating === "up" ? V.teal : V.border}`, background: rating === "up" ? V.tealDim : "transparent", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
              👍
            </button>
            <button onClick={() => handleRating("down")}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${rating === "down" ? V.rose : V.border}`, background: rating === "down" ? V.roseDim : "transparent", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
              👎
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: V.teal, fontWeight: 500 }}>
            {rating === "up" ? "✓ Ótimo! Obrigado." : "✓ Feedback enviado."}
          </div>
        )}
      </div>

      {/* Campo de feedback negativo */}
      {showFeedback && !feedbackSent && (
        <div style={{ marginTop: 14, padding: "14px", background: V.surface2, borderRadius: 10, border: `1px solid ${V.border}` }}>
          <div style={{ fontSize: 11, color: V.text2, marginBottom: 8 }}>O que faltou ou poderia ser melhor?</div>
          <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
            placeholder="Ex: A análise foi muito genérica, não considerou o contexto que descrevi. Faltou sugerir ações mais específicas para..."
            style={{ width: "100%", background: V.surface, border: `1px solid ${V.border}`, borderRadius: 8, padding: "10px 12px", color: V.text, fontFamily: "inherit", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => { setShowFeedback(false); setRating(null); }}
              style={{ flex: 1, background: "none", border: `1px solid ${V.border}`, color: V.text2, borderRadius: 8, padding: "9px", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
              Cancelar
            </button>
            <button onClick={enviarFeedback}
              style={{ flex: 2, background: V.amber, border: "none", color: "#0C0E14", borderRadius: 8, padding: "9px", cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13, fontWeight: 700 }}>
              Enviar feedback
            </button>
          </div>
        </div>
      )}

      {/* ── CONTINUAR A CONVERSA ── */}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${V.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: V.text2, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>◈ Aprofundar ou tirar dúvida</div>
        <div style={{ position: "relative" }}>
          <textarea value={followUp} onChange={e => setFollowUp(e.target.value)} rows={2}
            placeholder="Ex: Como abordo isso se o liderado reagir com defensividade? Pode detalhar mais o ponto 2?"
            style={{ width: "100%", background: V.surface2, border: `1px solid ${V.border}`, borderRadius: 9, padding: "10px 42px 10px 12px", color: V.text, fontFamily: "inherit", fontSize: 13, resize: "none", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviarFollowUp(); } }} />
          <button onClick={enviarFollowUp} disabled={followUpLoading || !followUp.trim()}
            style={{ position: "absolute", right: 8, bottom: 8, width: 28, height: 28, borderRadius: 8, border: "none", background: followUp.trim() ? V.amber : V.surface3, color: followUp.trim() ? "#0C0E14" : V.text2, cursor: followUp.trim() ? "pointer" : "not-allowed", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {followUpLoading ? "⏳" : "↑"}
          </button>
        </div>
        <div style={{ fontSize: 10, color: V.text3, marginTop: 4 }}>Enter para enviar · Shift+Enter para nova linha</div>
      </div>

      {/* Resultado do follow-up */}
      {followUpResult && (
        <div style={{ marginTop: 12, background: V.surface2, border: `1px solid ${V.border}`, borderLeft: `3px solid ${V.teal}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: V.teal, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>◈ Continuação</div>
          <MarkdownText text={followUpResult} />
          <button onClick={() => setFollowUpResult("")}
            style={{ marginTop: 10, background: "none", border: "none", color: V.text2, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>
            ✕ Fechar
          </button>
        </div>
      )}
    </div>
  );
};

const PreBadge = ({ text = "Pré-preenchido do check-in — ajuste se quiser" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: V.amberGlow, border: `1px solid ${V.amber}20`, borderRadius: 8, marginBottom: 14, fontSize: 11, color: V.amber, fontWeight: 500 }}>
    ◈ {text}
  </div>
);

// ── RENDERIZADOR DE MARKDOWN ──
function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Linha em branco
    if (!line.trim()) { i++; continue; }

    // Título com ✦ ou # 
    if (line.startsWith("✦ ") || line.startsWith("# ")) {
      const content = line.replace(/^✦ |^# /, "");
      elements.push(
        <div key={i} style={{ fontSize: 10, fontWeight: 700, color: V.amber, letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 18, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 16, height: 1, background: V.amber }} />
          {content.replace(/\*\*/g, "")}
        </div>
      );
      i++; continue;
    }

    // Subtítulo ##
    if (line.startsWith("## ")) {
      const content = line.replace(/^## /, "");
      elements.push(
        <div key={i} style={{ fontSize: 12, fontWeight: 700, color: V.text, marginTop: 14, marginBottom: 5 }}>
          {content.replace(/\*\*/g, "")}
        </div>
      );
      i++; continue;
    }

    // Separador ---
    if (line.trim() === "---" || line.trim() === "---") {
      elements.push(<div key={i} style={{ height: 1, background: V.border, margin: "12px 0" }} />);
      i++; continue;
    }

    // Item de lista com - ou •
    if (line.match(/^[-•]\s/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-•]\s/)) {
        items.push(lines[i].replace(/^[-•]\s/, "").replace(/\*\*(.*?)\*\*/g, "$1"));
        i++;
      }
      elements.push(
        <div key={`list-${i}`} style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0" }}>
          {items.map((item, j) => (
            <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: V.amber, fontSize: 10, marginTop: 3, flexShrink: 0 }}>✦</span>
              <span style={{ color: V.text2, fontSize: 13, lineHeight: 1.7 }}>{item}</span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Item numerado 1. 2. etc
    if (line.match(/^\d+\.\s/)) {
      const items = [];
      let num = 1;
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push({ n: num++, text: lines[i].replace(/^\d+\.\s/, "").replace(/\*\*(.*?)\*\*/g, "$1") });
        i++;
      }
      elements.push(
        <div key={`num-${i}`} style={{ display: "flex", flexDirection: "column", gap: 8, margin: "8px 0" }}>
          {items.map((item, j) => (
            <div key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: V.amber, fontSize: 11, fontWeight: 700, flexShrink: 0, minWidth: 16, marginTop: 1 }}>{item.n}.</span>
              <span style={{ color: V.text, fontSize: 13, lineHeight: 1.7 }}>{item.text}</span>
            </div>
          ))}
        </div>
      );
      continue;
    }

    // Texto normal — renderiza **bold** inline
    const formatted = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `__BOLD__${m}__ENDBOLD__`);
    const parts = formatted.split(/(\_\_BOLD\_\_.*?\_\_ENDBOLD\_\_)/);
    elements.push(
      <p key={i} style={{ color: V.text2, fontSize: 13, lineHeight: 1.8, margin: "3px 0" }}>
        {parts.map((p, j) => {
          if (p.startsWith("__BOLD__")) {
            return <strong key={j} style={{ color: V.text, fontWeight: 600 }}>{p.replace(/__BOLD__|__ENDBOLD__/g, "")}</strong>;
          }
          return p.replace(/\*(.*?)\*/g, "$1");
        })}
      </p>
    );
    i++;
  }

  return <div>{elements}</div>;
}

// ── PRINCÍPIO DA SEMANA ──
function PrincipioDaSemana() {
  const semana = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const p = PRINCIPIOS[semana % PRINCIPIOS.length];
  return (
    <div style={{ padding: "16px 18px", background: `linear-gradient(135deg, rgba(240,165,0,0.06) 0%, rgba(240,165,0,0.02) 100%)`, border: `1px solid rgba(240,165,0,0.15)`, borderRadius: 14, marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: V.amber, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, opacity: 0.85 }}>
        <span style={{ fontFamily: "monospace" }}>◈</span> Princípio da semana
      </div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: V.text, lineHeight: 1.6, marginBottom: 8, fontStyle: "italic" }}>
        "{p.frase}"
      </div>
      <div style={{ fontSize: 10, color: V.text2, letterSpacing: "0.2px" }}>— {p.cap} · Liderança Customer Centric</div>
    </div>
  );
}

// ── CHECKIN ──
function CheckinFlow({ onComplete, isUpdate, dadosExistentes }) {
  const [modo, setModo] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [curr, setCurr] = useState("");
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recState, setRecState] = useState("idle");
  const recognitionRef = useRef(null);
  const [estiloCheckin, setEstiloCheckin] = useState(dadosExistentes?.estiloLideranca || LS.get("checkin_estilo", ""));
  const [culturaCheckin, setCulturaCheckin] = useState(dadosExistentes?.culturaEmpresa || LS.get("checkin_cultura", ""));

  const QUESTIONS = isUpdate ? CHECKIN_UPDATE : CHECKIN_FULL;
  const q = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const buildDados = (resps) => {
    const metrics = parseMetrics(resps.metricas);
    return {
      perfil: { nome: resps.nome || "", empresa: resps.empresa || "" },
      metricas: { nps: metrics.nps, churn: metrics.churn, csat: metrics.csat, mrr: metrics.mrr },
      contextoSemana: resps.semana || "",
      desafioLideranca: resps.desafio || "",
      prioridade: resps.prioridade || "",
      rawMetricas: resps.metricas || "",
      tarefasMatriz: gerarTarefas(resps.semana, resps.prioridade, resps.desafio),
      estiloLideranca: estiloCheckin || resps.estilo || "",
      culturaEmpresa: culturaCheckin || resps.cultura || "",
    };
  };

  const next = () => {
    if (!curr.trim()) { alert("Responda antes de continuar."); return; }
    const newA = { ...answers, [q.id]: curr };
    setAnswers(newA);
    setCurr("");
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      setProcessing(true);
      setTimeout(() => { onComplete(buildDados(newA)); setProcessing(false); }, 900);
    }
  };

  const activeRecRef = useRef(false);

  const startRec = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setRecState("fallback"); return; }
    const r = new SR();
    r.lang = "pt-BR"; r.continuous = true; r.interimResults = false;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          setTranscript(prev => prev + e.results[i][0].transcript + " ");
        }
      }
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" && activeRecRef.current) {
        try { r.start(); } catch {}
      } else {
        activeRecRef.current = false;
        setRecState("fallback");
      }
    };
    r.onend = () => {
      if (activeRecRef.current) {
        try { r.start(); } catch {}
      } else {
        setRecState(prev => prev === "recording" ? "done" : prev);
      }
    };
    r.start();
    recognitionRef.current = r;
    activeRecRef.current = true;
    setRecState("recording");
  };

  const stopRec = () => {
    activeRecRef.current = false;
    recognitionRef.current?.stop();
    setRecState("done");
  };

  const processText = (text) => {
    if (!text?.trim()) return;
    setProcessing(true);
    const resps = {
      nome: text.match(/(?:me chamo|sou (?:a |o )?|meu nome é\s*)([A-Za-zÀ-ú]+)/i)?.[1] || "Líder CS",
      empresa: text.match(/(?:trabalho (?:na|em|no)\s*)([^,.]+)/i)?.[1] || "",
      metricas: text,
      semana: text.substring(0, 200),
      desafio: text.match(/(?:desafio|feedback|problema|dificuldade)[^.!?]*/i)?.[0] || text.substring(0, 100),
      prioridade: text.match(/(?:prioridade|resolver|focar)[^.!?]*/i)?.[0] || text.substring(0, 80),
      estilo: estiloCheckin,
      cultura: culturaCheckin,
    };
    // Salva estilo e cultura no localStorage imediatamente
    if (estiloCheckin) LS.set("checkin_estilo", estiloCheckin);
    if (culturaCheckin) LS.set("checkin_cultura", culturaCheckin);
    setTimeout(() => { onComplete(buildDados(resps)); setProcessing(false); }, 800);
  };

  if (!modo) return (
    <div>
      <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, marginBottom: 10, letterSpacing: -0.5 }}>
          {isUpdate ? "Check-out semanal" : "Bem-vindo ao"} <span style={{ color: V.amber }}>{isUpdate ? "" : "Vela"}</span>
        </div>
        {isUpdate ? (
          <div style={{ padding: "12px 16px", background: V.tealDim, border: `1px solid ${V.teal}25`, borderRadius: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: V.teal, fontWeight: 700, marginBottom: 4 }}>Atualização semanal</div>
            <div style={{ color: V.text2, fontSize: 12, lineHeight: 1.7 }}>Feito para ser rápido — 4 perguntas para atualizar seus números e contexto da semana.</div>
          </div>
        ) : (
          <div>
            <div style={{ padding: "12px 16px", background: V.amberGlow, border: `1px solid ${V.amber}20`, borderRadius: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: V.amber, fontWeight: 700, marginBottom: 4 }}>Configuração inicial — feita uma vez</div>
              <div style={{ color: V.text2, fontSize: 12, lineHeight: 1.7 }}>Vamos entender quem você é. Com isso, todos os módulos ficam personalizados para o seu contexto.</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {[
          { m: "texto", icon: "◉", title: "Responder por texto", sub: `${QUESTIONS.length} perguntas. O Vela preenche tudo automaticamente.`, c: V.amber },
          { m: "audio", icon: "◈", title: "Falar por áudio", sub: "Fale livremente. O Vela interpreta e distribui nos módulos.", c: V.teal },
        ].map(opt => (
          <button key={opt.m} onClick={() => setModo(opt.m)}
            style={{ background: V.surface, border: `1.5px solid ${V.border}`, borderRadius: 14, padding: "18px 16px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${opt.c}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: opt.c, flexShrink: 0, fontFamily: "monospace" }}>{opt.icon}</div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 16, color: V.text, marginBottom: 4 }}>{opt.title}</div>
              <div style={{ fontSize: 12, color: V.text2, lineHeight: 1.5 }}>{opt.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {!isUpdate && (
        <div style={{ borderTop: `1px solid ${V.border}`, paddingTop: 20 }}>
          <div style={{ background: `linear-gradient(135deg, rgba(240,165,0,0.06), rgba(240,165,0,0.02))`, border: `1px solid rgba(240,165,0,0.15)`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: V.amber, fontWeight: 700, marginBottom: 4, letterSpacing: "0.5px" }}>✦ Personaliza todas as respostas do Vela</div>
            <div style={{ fontSize: 11, color: V.text2, lineHeight: 1.6 }}>Quanto mais contexto você der sobre seu estilo e sua empresa, mais específicas ficam as análises.</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ color: V.amber, fontFamily: "monospace", fontSize: 16 }}>◎</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: V.text }}>Meu estilo de liderança</div>
                <div style={{ fontSize: 11, color: V.text2 }}>Como você lidera, pontos fortes, desafios recorrentes</div>
              </div>
            </div>
            <VoiceTextArea
              value={estiloCheckin}
              onChange={e => { setEstiloCheckin(e.target.value); LS.set("checkin_estilo", e.target.value); }}
              rows={3}
              placeholder="Ex: Sou direta, prefiro dar autonomia antes de intervir. Ponto forte: estruturar processos. Dificuldade: conversas de confronto..."
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ color: V.indigo, fontFamily: "monospace", fontSize: 16 }}>◈</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: V.text }}>Cultura da empresa</div>
                <div style={{ fontSize: 11, color: V.text2 }}>Valores, jeito de trabalhar, contexto do negócio</div>
              </div>
            </div>
            <VoiceTextArea
              value={culturaCheckin}
              onChange={e => { setCulturaCheckin(e.target.value); LS.set("checkin_cultura", e.target.value); }}
              rows={3}
              placeholder="Ex: Startup B2B SaaS em crescimento, cultura de ownership, feedback direto, velocidade sobre perfeição..."
            />
          </div>
        </div>
      )}
    </div>
  );

  if (modo === "audio") return (
    <div>
      <button onClick={() => { setModo(null); setRecState("idle"); setTranscript(""); }} style={{ background: "none", border: "none", color: V.text2, cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 20, padding: 0 }}>← Voltar</button>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <SectionLabel>Modo áudio</SectionLabel>
        <PageTitle accent="sua semana">Fale sobre</PageTitle>
        <div style={{ color: V.text2, fontSize: 12, lineHeight: 1.7, maxWidth: 280, margin: "8px auto 0" }}>
          Fale naturalmente: nome, cargo, métricas, o que está pesando, desafios de liderança e prioridades.
        </div>
      </div>

      {recState !== "fallback" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              {recState === "recording" && (
                <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `2px solid ${V.rose}30`, animation: "pulse 1.5s ease-in-out infinite" }} />
              )}
              <button onClick={recState === "recording" ? stopRec : startRec}
                style={{ width: 76, height: 76, borderRadius: "50%", border: "none", background: recState === "recording" ? V.rose : recState === "done" ? V.teal : V.amber, color: "#0C0E14", fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, boxShadow: `0 0 0 8px ${recState === "recording" ? V.roseDim : V.amberDim}`, transition: "all 0.3s", fontFamily: "monospace" }}>
                {recState === "recording" ? "⏹" : recState === "done" ? "✓" : "◉"}
              </button>
            </div>
            <div style={{ fontSize: 12, color: recState === "recording" ? V.rose : V.text2, fontWeight: 600 }}>
              {recState === "recording" ? "● Gravando — toque para parar" : recState === "done" ? "Gravação concluída" : "Toque para começar"}
            </div>
          </div>
          {transcript && (
            <Card style={{ marginBottom: 14, borderColor: `${V.teal}30` }}>
              <div style={{ fontSize: 10, color: V.teal, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>Transcrição</div>
              <div style={{ fontSize: 13, color: V.text, lineHeight: 1.7, maxHeight: 120, overflowY: "auto", fontStyle: "italic" }}>"{transcript}"</div>
              <div style={{ fontSize: 10, color: V.text2, marginTop: 8 }}>Você pode editar o texto acima antes de salvar</div>
            </Card>
          )}
          {recState === "done" && transcript && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <BtnPrimary onClick={() => processText(transcript)} loading={processing}>✦ Salvar e continuar</BtnPrimary>
              <BtnSecondary onClick={() => { setTranscript(""); setRecState("idle"); }}>Gravar novamente</BtnSecondary>
            </div>
          )}
          {recState === "idle" && !transcript && (
            <div style={{ textAlign: "center", color: V.text3, fontSize: 11, margin: "16px 0 10px" }}>— ou digite abaixo —</div>
          )}
        </>
      )}

      <div style={{ marginBottom: 14 }}>
        <Label>Descreva livremente sua semana</Label>
        <VoiceTextArea value={transcript} onChange={e => setTranscript(e.target.value)} rows={5}
          placeholder="Ex: Oi, sou a Mariana, Head of CS na Startup X. Time de 8 pessoas. NPS 38, churn 3.2%. Semana difícil — QBR na quinta com 3 contas em risco e preciso dar um feedback difícil para meu CS sênior..." />
      </div>
      {transcript && recState !== "done" && <BtnPrimary onClick={() => processText(transcript)} loading={processing}>✦ Salvar e continuar</BtnPrimary>}
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.1);opacity:0.1}}`}</style>
    </div>
  );

  return (
    <div>
      <button onClick={() => { setModo(null); setStep(0); setAnswers({}); setCurr(""); }} style={{ background: "none", border: "none", color: V.text2, cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 16, padding: 0 }}>← Voltar</button>

      <div style={{ marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 10, color: V.text2, fontWeight: 600 }}>{isUpdate ? "Check-out" : "Check-in"} · {step + 1}/{QUESTIONS.length}</span>
          <span style={{ fontSize: 10, color: V.amber, fontWeight: 700 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 2, background: V.surface3, borderRadius: 1 }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${V.amber}, ${V.teal})`, borderRadius: 1, width: `${progress}%`, transition: "width 0.4s" }} />
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
          {QUESTIONS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 1, background: i < step ? V.amber : i === step ? `${V.amber}50` : V.surface3, transition: "background 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ width: 50, height: 50, borderRadius: 13, background: V.amberDim, border: `1px solid ${V.amber}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: V.amber, marginBottom: 16, fontFamily: "monospace" }}>{q.emoji}</div>
        <SectionLabel>{isUpdate ? "Check-out semanal" : "Check-in"}</SectionLabel>
        <PageTitle>{q.title}</PageTitle>
        <div style={{ fontSize: 12, color: V.text2, lineHeight: 1.5, marginTop: 4 }}>{q.sub}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <VoiceTextArea value={curr} onChange={e => setCurr(e.target.value)} rows={4} placeholder={q.placeholder} />
        <div style={{ fontSize: 10, color: V.text3, marginTop: 5 }}>⌘ + Enter para avançar</div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {step > 0 && <BtnSecondary onClick={() => { setStep(s => s - 1); setCurr(answers[QUESTIONS[step - 1].id] || ""); }}>←</BtnSecondary>}
        <BtnPrimary onClick={next} loading={processing && step === QUESTIONS.length - 1} style={{ flex: 1 }}>
          {step < QUESTIONS.length - 1 ? "Salvar e continuar →" : "✦ Concluir e salvar"}
        </BtnPrimary>
      </div>

      {step > 0 && (
        <div style={{ marginTop: 16, padding: "10px 12px", background: V.tealDim, border: `1px solid ${V.teal}25`, borderRadius: 9 }}>
          <div style={{ fontSize: 11, color: V.teal, fontWeight: 600 }}>✓ {step} {step === 1 ? "resposta salva" : "respostas salvas"}</div>
        </div>
      )}

      {step > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 10, color: V.text3, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Respondido</div>
          {QUESTIONS.slice(0, step).map((pq, i) => (
            <div key={i} onClick={() => { setStep(i); setCurr(answers[pq.id] || ""); }}
              style={{ padding: "10px 12px", background: V.surface2, borderRadius: 9, marginBottom: 6, cursor: "pointer", border: `1px solid ${V.border}` }}>
              <div style={{ fontSize: 10, color: V.text2, marginBottom: 2, fontFamily: "monospace" }}>{pq.emoji} {pq.title}</div>
              <div style={{ fontSize: 12, color: V.text }}>{(answers[pq.id] || "").substring(0, 65)}{(answers[pq.id] || "").length > 65 ? "…" : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── HOME ──
function HomePage({ dados, onCheckin, onUpdate, onNav }) {
  const temDados = !!dados;
  return (
    <div>
      <div style={{ padding: "4px 0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${V.amber}, #D4920A)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontFamily: "monospace", color: "#0C0E14", fontWeight: 700 }}>◎</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Vela</div>
            <div style={{ fontSize: 9, color: V.text2, letterSpacing: "1px", textTransform: "uppercase" }}>Copiloto do líder de CS/CX</div>
          </div>
        </div>

        {temDados ? (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, letterSpacing: -0.5, marginBottom: 4 }}>
              Olá, <span style={{ color: V.amber }}>{dados.perfil?.nome?.split(",")[0]?.trim() || "Líder"}</span>
            </div>
            <div style={{ color: V.text2, fontSize: 12 }}>{dados.perfil?.empresa?.split(",")[0] || "CS/CX"}</div>
          </div>
        ) : (
          <div>
            <SectionLabel>Seu copiloto</SectionLabel>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, letterSpacing: -0.8, marginBottom: 4 }}>Lidere com mais</div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: V.amber, marginBottom: 8 }}>clareza.</div>
            <div style={{ color: V.text2, fontSize: 13, lineHeight: 1.7 }}>Para líderes de CS e CX em startups. Menos operação, mais estratégia.</div>
          </div>
        )}
      </div>

      <PrincipioDaSemana />

      {temDados && dados.metricas && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { l: "NPS", v: dados.metricas.nps, c: dados.metricas.nps >= 40 ? V.amber : V.rose },
            { l: "Churn", v: `${dados.metricas.churn}%`, c: dados.metricas.churn <= 3 ? V.teal : V.rose },
            { l: "CSAT", v: `${dados.metricas.csat}/5`, c: dados.metricas.csat >= 4 ? V.teal : V.rose },
          ].map(m => (
            <div key={m.l} style={{ background: V.surface, border: `1px solid ${V.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: V.text2, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>{m.l}</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: m.c }}>{m.v}</div>
            </div>
          ))}
        </div>
      )}

      {!temDados ? (
        <BtnPrimary onClick={onCheckin}>✦ Fazer check-in e começar</BtnPrimary>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {[
            { icon: "◆", label: "Cockpit", sub: "Analisar indicador", id: "cockpit", color: V.amber },
            { icon: "◇", label: "Prioridades", sub: `${(dados.tarefasMatriz?.do?.length || 0)} urgentes`, id: "matriz", color: V.teal },
            { icon: "▷", label: "Feedback", sub: dados.desafioLideranca ? "Pré-preenchido" : "Aguardando", id: "feedback", color: V.indigo },
            { icon: "⚡", label: "Gestão de Crise", sub: "Diagnóstico rápido", id: "crise", color: V.rose },
            { icon: "✦", label: "Narrativa", sub: dados.rawMetricas ? "Dados prontos" : "Aguardando", id: "narrativa", color: V.amber },
          ].map(m => (
            <button key={m.id} onClick={() => onNav(m.id)}
              style={{ background: V.surface, border: `1px solid ${V.border}`, borderRadius: 13, padding: "15px 13px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "border-color 0.2s" }}>
              <div style={{ fontSize: 20, color: m.color, fontFamily: "monospace", marginBottom: 7 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: V.text, marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: m.sub.includes("Pré") ? V.teal : V.text2 }}>{m.sub}</div>
            </button>
          ))}
        </div>
      )}

      {temDados && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          <button onClick={onUpdate}
            style={{ background: V.surface, border: `1px solid ${V.border}`, borderRadius: 12, padding: "13px 15px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: V.tealDim, display: "flex", alignItems: "center", justifyContent: "center", color: V.teal, fontFamily: "monospace", fontSize: 16 }}>◈</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: V.text, marginBottom: 2 }}>Check-out semanal</div>
              <div style={{ fontSize: 11, color: V.text2 }}>Atualizar métricas e contexto</div>
            </div>
          </button>
          <button onClick={() => onNav("historico")}
            style={{ background: V.surface, border: `1px solid ${V.border}`, borderRadius: 12, padding: "13px 15px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: V.indigoDim, display: "flex", alignItems: "center", justifyContent: "center", color: V.indigo, fontFamily: "monospace", fontSize: 15 }}>◑</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: V.text, marginBottom: 2 }}>Histórico de análises</div>
              <div style={{ fontSize: 11, color: V.text2 }}>{LS.get("vela_historico", []).length} análises salvas</div>
            </div>
          </button>
          <button onClick={() => onNav("perfil")}
            style={{ background: V.surface, border: `1px solid ${V.border}`, borderRadius: 12, padding: "13px 15px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: V.amberDim, display: "flex", alignItems: "center", justifyContent: "center", color: V.amber, fontFamily: "monospace", fontSize: 15 }}>◎</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: V.text, marginBottom: 2 }}>Meu perfil de liderança</div>
              <div style={{ fontSize: 11, color: dados?.estiloLideranca ? V.teal : V.text2 }}>{dados?.estiloLideranca ? "✓ Configurado" : "Personalizar respostas"}</div>
            </div>
          </button>
          <button onClick={onCheckin}
            style={{ background: "transparent", border: `1px solid ${V.border}`, borderRadius: 12, padding: "11px 15px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: V.surface3, display: "flex", alignItems: "center", justifyContent: "center", color: V.text2, fontFamily: "monospace", fontSize: 15 }}>◉</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: V.text, marginBottom: 2 }}>Refazer check-in completo</div>
              <div style={{ fontSize: 11, color: V.text2 }}>Reconfigurar tudo do zero</div>
            </div>
          </button>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${V.border}` }}>
        <button onClick={() => { if (window.confirm("Limpar todos os dados do Vela?")) { LS.clear(); window.location.reload(); } }}
          style={{ background: "none", border: "none", color: V.text3, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>
          ◈ Limpar dados locais
        </button>
      </div>
    </div>
  );
}

// ── SALVAR ANÁLISE NO HISTÓRICO ──
function salvarNoHistorico(modulo, resumo, resultado) {
  const historico = LS.get("vela_historico", []);
  const novaEntrada = {
    id: Date.now(),
    modulo,
    resumo: resumo.substring(0, 80),
    resultado,
    data: new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
  const atualizado = [novaEntrada, ...historico].slice(0, 50);
  LS.set("vela_historico", atualizado);
}

// ── HISTÓRICO PAGE ──
// ── PERFIL DE LIDERANÇA ──
function PerfilPage({ dados, onBack, onSave }) {
  const [estilo, setEstilo] = useState(dados?.estiloLideranca || "");
  const [cultura, setCultura] = useState(dados?.culturaEmpresa || "");
  const [saved, setSaved] = useState(false);

  const salvar = () => {
    onSave({ estiloLideranca: estilo, culturaEmpresa: cultura });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: V.text2, cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 20, padding: 0 }}>← Voltar</button>
      <SectionLabel>Contexto permanente</SectionLabel>
      <PageTitle accent="de Liderança">Meu Perfil</PageTitle>
      <div style={{ color: V.text2, fontSize: 12, marginBottom: 20, lineHeight: 1.7 }}>
        Essas informações são usadas em <strong style={{ color: V.text }}>todas as análises</strong> para personalizar as respostas ao seu estilo e contexto.
      </div>

      <div style={{ padding: "12px 14px", background: V.amberGlow, border: `1px solid ${V.amber}20`, borderRadius: 10, marginBottom: 20, fontSize: 12, color: V.text2, lineHeight: 1.7 }}>
        <span style={{ color: V.amber, fontWeight: 700 }}>Como usar: </span>Quanto mais específico, mais personalizada a resposta. Cole o código de cultura da empresa, descreva seu estilo com exemplos reais.
      </div>

      <Card>
        <Label>Meu estilo de liderança</Label>
        <div style={{ fontSize: 11, color: V.text2, marginBottom: 10, lineHeight: 1.6 }}>Como você lidera, seus pontos fortes, seus desafios recorrentes, como prefere se comunicar com o time.</div>
        <VoiceTextArea value={estilo} onChange={e => setEstilo(e.target.value)} rows={5}
          placeholder="Ex: Sou direta e objetiva, prefiro dar autonomia ao time antes de intervir. Meu ponto forte é estruturar processos em caos. Tenho dificuldade com conversas de confronto e tendência a assumir tudo quando o time trava..." />
      </Card>

      <Card>
        <Label>Cultura e valores da empresa</Label>
        <div style={{ fontSize: 11, color: V.text2, marginBottom: 10, lineHeight: 1.6 }}>Cole o código de cultura, manifesto de liderança ou descreva como a empresa trabalha. Pode ser longo — o Vela vai usar apenas o que for relevante.</div>
        <VoiceTextArea value={cultura} onChange={e => setCultura(e.target.value)} rows={6}
          placeholder="Ex: Empresa de alto crescimento com cultura de ownership. Valorizamos transparência radical, velocidade sobre perfeição e feedback direto. Líderes são esperados a desenvolver seus times e não criar dependência..." />
      </Card>

      <BtnPrimary onClick={salvar}>{saved ? "✓ Salvo!" : "✦ Salvar perfil"}</BtnPrimary>
    </div>
  );
}

function HistoricoPage({ onBack }) {
  const [historico, setHistorico] = useState([]);
  const [aberto, setAberto] = useState(null);

  useEffect(() => {
    setHistorico(LS.get("vela_historico", []));
  }, []);

  const moduloConfig = {
    cockpit: { icon: "◆", color: V.amber, label: "Cockpit" },
    feedback: { icon: "▷", color: V.indigo, label: "Feedback" },
    matriz: { icon: "◇", color: V.teal, label: "Prioridades" },
    crise: { icon: "⚡", color: V.rose, label: "Crise" },
    narrativa: { icon: "✦", color: V.amber, label: "Narrativa" },
  };

  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: V.text2, cursor: "pointer", fontSize: 13, fontFamily: "inherit", marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
        ← Voltar
      </button>
      <SectionLabel>Sua jornada</SectionLabel>
      <PageTitle accent="de Análises">Histórico</PageTitle>
      <div style={{ color: V.text2, fontSize: 12, marginBottom: 20 }}>Todas as análises geradas, em ordem cronológica.</div>

      {historico.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: V.text2, fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>◑</div>
          Nenhuma análise ainda. Gere sua primeira análise em qualquer módulo — ela aparece aqui automaticamente.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {historico.map(h => {
            const cfg = moduloConfig[h.modulo] || { icon: "◈", color: V.amber, label: h.modulo };
            const isAberto = aberto === h.id;
            return (
              <div key={h.id} style={{ background: V.surface, border: `1px solid ${isAberto ? cfg.color + "40" : V.border}`, borderRadius: 13, overflow: "hidden", transition: "border-color 0.2s" }}>
                <button onClick={() => setAberto(isAberto ? null : h.id)}
                  style={{ width: "100%", background: "none", border: "none", padding: "14px 15px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${cfg.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, fontFamily: "monospace", fontSize: 14, flexShrink: 0 }}>{cfg.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{cfg.label}</span>
                      <span style={{ fontSize: 10, color: V.text2 }}>· {h.data}</span>
                    </div>
                    <div style={{ fontSize: 12, color: V.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.resumo}</div>
                  </div>
                  <span style={{ color: V.text2, fontSize: 12, flexShrink: 0 }}>{isAberto ? "▲" : "▼"}</span>
                </button>
                {isAberto && (
                  <div style={{ padding: "0 15px 15px", borderTop: `1px solid ${V.border}` }}>
                    <div style={{ paddingTop: 12 }}><MarkdownText text={h.resultado} /></div>
                    <button onClick={() => navigator.clipboard?.writeText(h.resultado)}
                      style={{ marginTop: 10, background: "none", border: `1px solid ${V.border}`, color: V.text2, borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>
                      📋 Copiar análise
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


function CockpitPage({ dados }) {
  const [indicador, setIndicador] = useState("");
  const [foco, setFoco] = useState(() => LS.get("cockpit_foco", "churn"));
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState(() => LS.get("cockpit_historico", []));
  const [arquivo, setArquivo] = useState(null);
  const [dadosArquivo, setDadosArquivo] = useState(null);
  const [loadingArquivo, setLoadingArquivo] = useState(false);
  const fileRef = useRef(null);

  const FOCOS = [
    { value: "churn", label: "📉 Churn", desc: "Taxa de cancelamento" },
    { value: "nps", label: "⭐ NPS", desc: "Satisfação e lealdade" },
    { value: "csat", label: "💬 CSAT", desc: "Satisfação por interação" },
    { value: "expansao", label: "📈 Expansão", desc: "Receita de expansão" },
    { value: "onboarding", label: "🚀 Onboarding", desc: "Ativação de clientes" },
    { value: "retencao", label: "🔒 Retenção", desc: "Renovações e permanência" },
  ];

  const focoAtual = FOCOS.find(f => f.value === foco);

  const lerArquivo = async (file) => {
    setLoadingArquivo(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let preview = "";

      if (ext === "csv") {
        const text = await file.text();
        const linhas = text.split("\n").slice(0, 50);
        preview = linhas.join("\n");
      } else if (ext === "xlsx" || ext === "xls") {
        const buffer = await file.arrayBuffer();
        const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm");
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const csv = XLSX.utils.sheet_to_csv(ws);
        const linhas = csv.split("\n").slice(0, 50);
        preview = linhas.join("\n");
      } else if (ext === "pdf") {
        const buffer = await file.arrayBuffer();
        const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        let texto = "";
        // Extrai TODAS as páginas
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pagTexto = content.items.map(item => item.str).join(" ");
          texto += `\n--- Página ${i} ---\n${pagTexto}`;
        }

        // Se o PDF não tem texto extraível (escaneado), tenta OCR
        if (texto.replace(/---.*---/g, "").trim().length < 100) {
          const Tesseract = await import("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js");
          let ocrTexto = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
            const { data: { text } } = await Tesseract.recognize(canvas, "por");
            ocrTexto += `\n--- Página ${i} (OCR) ---\n${text}`;
          }
          texto = ocrTexto;
        }

        preview = texto.substring(0, 8000);
      }

      setArquivo(file.name);
      setDadosArquivo(preview);
    } catch (e) {
      alert("Erro ao ler o arquivo. Certifique-se que é um CSV, Excel ou PDF válido.");
    }
    setLoadingArquivo(false);
  };

  const gerarAnalise = async () => {
    if (!indicador.trim() && !dadosArquivo) { alert("Descreva o indicador ou suba um arquivo."); return; }
    setLoading(true);
    try {
      const contextoArquivo = dadosArquivo ? `\n\nDADOS DO ARQUIVO (${arquivo}):\n${dadosArquivo.substring(0, 3000)}` : "";
      const texto = await gerarAnaliseIndicador(indicador + contextoArquivo, foco, dados);
      setResult(texto);
      const novoHistorico = [{ foco: focoAtual?.label, texto: indicador.substring(0, 50) || arquivo, resultado: texto }, ...historico].slice(0, 5);
      setHistorico(novoHistorico);
      LS.set("cockpit_historico", novoHistorico);
    } catch (e) {
      setResult("Erro ao gerar análise. Verifique sua conexão e tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div>
      <SectionLabel>Análise estratégica</SectionLabel>
      <PageTitle accent="de Indicadores">Cockpit</PageTitle>
      <div style={{ color: V.text2, fontSize: 12, marginBottom: 20 }}>
        Descreva o que está acontecendo ou suba sua planilha. O Vela identifica segmentações, causas e micro ações.
      </div>

      {dados?.contextoSemana && (
        <Card style={{ borderColor: `${V.amber}20`, background: V.amberGlow, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: V.amber, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>Contexto do check-in</div>
          <div style={{ fontSize: 12, color: V.text, lineHeight: 1.7 }}>{dados.contextoSemana}</div>
        </Card>
      )}

      <Card>
        <div style={{ marginBottom: 14 }}>
          <Label>Qual indicador você quer analisar?</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 4 }}>
            {FOCOS.map(f => (
              <button key={f.value} onClick={() => { setFoco(f.value); LS.set("cockpit_foco", f.value); }}
                style={{ padding: "10px 8px", border: `1.5px solid ${foco === f.value ? V.amber : V.border}`, borderRadius: 10, background: foco === f.value ? V.amberDim : V.surface2, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                <div style={{ fontSize: 15, marginBottom: 3 }}>{f.label.split(" ")[0]}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: foco === f.value ? V.amber : V.text, marginBottom: 1 }}>{f.label.split(" ").slice(1).join(" ")}</div>
                <div style={{ fontSize: 9, color: V.text2 }}>{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload de planilha */}
        <div style={{ marginBottom: 16 }}>
          <Label>Suba sua planilha (opcional)</Label>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf" style={{ display: "none" }}
            onChange={e => e.target.files[0] && lerArquivo(e.target.files[0])} />
          {!dadosArquivo ? (
            <button onClick={() => fileRef.current?.click()}
              style={{ width: "100%", padding: "14px", border: `1.5px dashed ${V.border2}`, borderRadius: 10, background: V.surface2, cursor: "pointer", fontFamily: "inherit", color: V.text2, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loadingArquivo ? "⏳ Lendo arquivo... (PDFs escaneados podem demorar mais)" : "📊 Subir CSV, Excel ou PDF"}
            </button>
          ) : (
            <div style={{ padding: "12px 14px", background: V.tealDim, border: `1px solid ${V.teal}25`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: V.teal, fontWeight: 700, marginBottom: 2 }}>📊 {arquivo}</div>
                <div style={{ fontSize: 10, color: V.text2 }}>{dadosArquivo.includes("OCR") ? "📄 PDF escaneado — texto extraído via OCR" : `${dadosArquivo.split("---").filter(l => l.includes("Página") || l.includes("linhas")).length || dadosArquivo.split("\n").length} blocos carregados — o Vela vai identificar os segmentos`}</div>
              </div>
              <button onClick={() => { setArquivo(null); setDadosArquivo(null); }}
                style={{ background: "none", border: "none", color: V.text2, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>×</button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>{dadosArquivo ? "Adicione contexto sobre o indicador (opcional)" : `O que está acontecendo com ${focoAtual?.label.split(" ").slice(1).join(" ")}?`}</Label>
          <VoiceTextArea value={indicador} onChange={e => setIndicador(e.target.value)} rows={dadosArquivo ? 2 : 4}
            placeholder={dadosArquivo
              ? "Ex: Quero entender onde está concentrado o problema e quais ações priorizar..."
              : `Ex: Meu ${focoAtual?.desc.toLowerCase()} caiu de X para Y nos últimos 30 dias. Tivemos 3 situações específicas de...`} />
        </div>

        <BtnPrimary onClick={gerarAnalise} loading={loading}>✦ Analisar e receber plano de ação</BtnPrimary>
        <ResultBox text={result} modulo="cockpit" />
      </Card>

      {historico.length > 0 && (
        <Card>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Análises anteriores</div>
          {historico.map((h, i) => (
            <div key={i} onClick={() => setResult(h.resultado)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: V.surface2, borderRadius: 9, marginBottom: 6, cursor: "pointer", border: `1px solid ${V.border}` }}>
              <span style={{ fontSize: 13, color: V.amber, fontFamily: "monospace" }}>◆</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: V.amber, fontWeight: 600, marginBottom: 2 }}>{h.foco}</div>
                <div style={{ fontSize: 11, color: V.text2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.texto}...</div>
              </div>
              <span style={{ fontSize: 10, color: V.text3 }}>Ver →</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ── MATRIZ ──
function MatrizPage({ dados }) {
  const [tasks, setTasks] = useState(() => LS.get("matriz_tasks", { do: [], sc: [], de: [], el: [] }));
  const [input, setInput] = useState("");
  const [quad, setQuad] = useState("do");
  const [ctx, setCtx] = useState(() => LS.get("matriz_ctx", ""));
  const [tipoSemana, setTipoSemana] = useState(() => LS.get("matriz_tipo", "normal"));
  const [tamanhoTime, setTamanhoTime] = useState(() => LS.get("matriz_time", "medio"));
  const [momentoEmpresa, setMomentoEmpresa] = useState(() => LS.get("matriz_momento", "crescendo"));
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (dados?.tarefasMatriz && !seeded) {
      const saved = LS.get("matriz_tasks", null);
      if (!saved || (saved.do.length === 0 && saved.sc.length === 0)) {
        setTasks(dados.tarefasMatriz);
        LS.set("matriz_tasks", dados.tarefasMatriz);
      }
      setSeeded(true);
    }
    if (dados?.contextoSemana && !LS.get("matriz_ctx", "")) {
      setCtx(dados.contextoSemana);
      LS.set("matriz_ctx", dados.contextoSemana);
    }
  }, [dados]);

  const updateTasks = (newTasks) => { setTasks(newTasks); LS.set("matriz_tasks", newTasks); };
  const updateCtx = (v) => { setCtx(v); LS.set("matriz_ctx", v); };
  const updateTipoSemana = (v) => { setTipoSemana(v); LS.set("matriz_tipo", v); };
  const updateTamanhoTime = (v) => { setTamanhoTime(v); LS.set("matriz_time", v); };
  const updateMomento = (v) => { setMomentoEmpresa(v); LS.set("matriz_momento", v); };

  const addTask = () => {
    if (!input.trim()) return;
    const newTasks = { ...tasks, [quad]: [...tasks[quad], input.trim()] };
    updateTasks(newTasks);
    setInput("");
  };

  const quads = [
    { key: "do", label: "Fazer agora", icon: "✦", sub: "Urgente + Importante", color: V.amber },
    { key: "sc", label: "Programar", icon: "◇", sub: "Importante, não urgente", color: V.teal },
    { key: "de", label: "Delegar", icon: "▷", sub: "Urgente, não importante", color: V.indigo },
    { key: "el", label: "Eliminar", icon: "◈", sub: "Nem urgente nem importante", color: V.text3 },
  ];

  return (
    <div>
      <SectionLabel>Priorização</SectionLabel>
      <PageTitle accent="Movimentos">Próximos</PageTitle>
      {seeded && <div style={{ marginBottom: 16, fontSize: 11, color: V.teal }}>◈ Tarefas sugeridas com base no seu check-in</div>}

      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Nova tarefa..."
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTask(); } }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Sel value={quad} onChange={e => setQuad(e.target.value)} style={{ flex: 1 }}>
              {quads.map(q => <option key={q.key} value={q.key}>{q.icon} {q.label}</option>)}
            </Sel>
            <button onClick={addTask} style={{ background: `linear-gradient(135deg, ${V.amber}, #D4920A)`, color: "#0C0E14", border: "none", borderRadius: 9, padding: "12px 16px", cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, fontWeight: 700 }}>+ Add</button>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {quads.map(q => (
          <div key={q.key} style={{ background: V.surface, border: `1px solid ${V.border}`, borderTop: `2px solid ${q.color}`, borderRadius: 13, padding: 13, minHeight: 130 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
              <span style={{ color: q.color, fontFamily: "monospace", fontSize: 13 }}>{q.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: q.color, letterSpacing: "0.5px", textTransform: "uppercase" }}>{q.label}</span>
            </div>
            <div style={{ fontSize: 9, color: V.text2, marginBottom: 10 }}>{q.sub}</div>
            {tasks[q.key].length === 0 && <div style={{ fontSize: 10, color: V.text3, fontStyle: "italic" }}>Vazio</div>}
            {tasks[q.key].map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 5, padding: "6px 8px", borderRadius: 7, background: V.surface2, marginBottom: 5, fontSize: 11, color: V.text, lineHeight: 1.4, border: `1px solid ${V.border}` }}>
                <span style={{ flex: 1 }}>{t}</span>
                <button onClick={() => { const n = { ...tasks, [q.key]: tasks[q.key].filter((_, j) => j !== i) }; updateTasks(n); }}
                  style={{ background: "none", border: "none", color: V.text3, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Card>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 15, marginBottom: 3 }}>Análise estratégica da semana</div>
        <div style={{ color: V.text2, fontSize: 11, marginBottom: 14 }}>Quanto mais contexto, mais específica a recomendação.</div>
        {dados?.contextoSemana && <PreBadge />}

        <div style={{ marginBottom: 13 }}>
          <Label>Como está essa semana?</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 8 }}>
            {[
              { v: "estrategico", l: "🧘 Semana calma" },
              { v: "normal", l: "⚡ Semana normal" },
              { v: "atarefado", l: "🔥 Semana cheia" },
              { v: "crise", l: "🚨 Em crise" },
            ].slice(0, 4).map(o => (
              <button key={o.v} onClick={() => updateTipoSemana(o.v)}
                style={{ padding: "9px 6px", border: `1.5px solid ${tipoSemana === o.v ? V.amber : V.border}`, borderRadius: 9, background: tipoSemana === o.v ? V.amberDim : V.surface2, color: tipoSemana === o.v ? V.amber : V.text2, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit", textAlign: "center" }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 13 }}>
          <div>
            <Label>Tamanho do time</Label>
            <Sel value={tamanhoTime} onChange={e => updateTamanhoTime(e.target.value)}>
              <option value="pequeno">Até 5 pessoas</option>
              <option value="medio">6 a 15 pessoas</option>
              <option value="grande">Mais de 15</option>
            </Sel>
          </div>
          <div>
            <Label>Momento da empresa</Label>
            <Sel value={momentoEmpresa} onChange={e => updateMomento(e.target.value)}>
              <option value="early">Early stage</option>
              <option value="crescendo">Crescendo</option>
              <option value="escalando">Escalando</option>
            </Sel>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <Label>Contexto da semana</Label>
          <VoiceTextArea value={ctx} onChange={e => updateCtx(e.target.value)} rows={3}
            placeholder="O que está acontecendo? O que está pesando mais? Quais são as principais demandas?" />
        </div>

        <BtnPrimary onClick={async () => {
          setLoading(true);
          try {
            const r = await gerarPriorizacao({ ...dados, contextoSemana: ctx }, tamanhoTime, momentoEmpresa, tipoSemana);
            setResult(r);
            salvarNoHistorico("matriz", ctx || "Priorização semanal", r);
          } catch (e) { setResult("Erro ao gerar. Verifique sua conexão."); }
          setLoading(false);
        }} loading={loading}>✦ Receber recomendação estratégica</BtnPrimary>
        <ResultBox text={result} modulo="matriz" />
      </Card>
    </div>
  );
}

// ── FEEDBACK ──
function FeedbackPage({ dados }) {
  const [sev, setSev] = useState("at");
  const [desafio, setDesafio] = useState("");
  const [cargo, setCargo] = useState("");
  const [tempo, setTempo] = useState("medio");
  const [tipoComp, setTipoComp] = useState("padrao");
  const [historico, setHistorico] = useState("primeira");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (dados?.desafioLideranca) setDesafio(dados.desafioLideranca); }, [dados]);

  return (
    <div>
      <SectionLabel>People</SectionLabel>
      <PageTitle accent="Inteligente">Feedback</PageTitle>
      <div style={{ color: V.text2, fontSize: 12, marginBottom: 18 }}>Framework Fato → Impacto → Futuro. Quanto mais contexto, mais específica a resposta.</div>

      <div style={{ padding: "12px 14px", background: V.amberGlow, border: `1px solid ${V.amber}20`, borderRadius: 10, marginBottom: 16, fontSize: 12, color: V.text2, lineHeight: 1.7 }}>
        <span style={{ color: V.amber, fontWeight: 700 }}>Princípio: </span>"Fato não tem defesa. Julgamento tem. Você está falando do que a pessoa fez — ou de quem ela é?"
      </div>

      <Card>
        {dados?.desafioLideranca && <PreBadge />}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 13 }}>
          <div><Label>Cargo</Label><Input value={cargo} onChange={e => setCargo(e.target.value)} placeholder="CS Sênior, Analista..." /></div>
          <div><Label>Tempo na equipe</Label>
            <Sel value={tempo} onChange={e => setTempo(e.target.value)}>
              <option value="novo">Menos de 3 meses</option>
              <option value="medio">3 a 12 meses</option>
              <option value="senior">Mais de 1 ano</option>
            </Sel>
          </div>
        </div>

        <div style={{ marginBottom: 13 }}>
          <Label>Tipo de comportamento</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[
              { v: "entrega", l: "📦 Entrega / Resultado" },
              { v: "relacionamento", l: "🤝 Relacionamento" },
              { v: "autonomia", l: "🧭 Autonomia" },
              { v: "comunicacao", l: "💬 Comunicação" },
            ].map(o => (
              <button key={o.v} onClick={() => setTipoComp(o.v)}
                style={{ padding: "9px 10px", border: `1.5px solid ${tipoComp === o.v ? V.amber : V.border}`, borderRadius: 9, background: tipoComp === o.v ? V.amberDim : V.surface2, color: tipoComp === o.v ? V.amber : V.text2, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", textAlign: "left" }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 13 }}>
          <Label>Histórico desse comportamento</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[
              { v: "primeira", l: "🆕 Primeira vez" },
              { v: "recorrente", l: "🔁 Padrão recorrente" },
            ].map(o => (
              <button key={o.v} onClick={() => setHistorico(o.v)}
                style={{ padding: "9px 10px", border: `1.5px solid ${historico === o.v ? V.amber : V.border}`, borderRadius: 9, background: historico === o.v ? V.amberDim : V.surface2, color: historico === o.v ? V.amber : V.text2, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 13 }}>
          <Label>Descreva a situação</Label>
          <VoiceTextArea value={desafio} onChange={e => setDesafio(e.target.value)} rows={4}
            placeholder="Ex: Ela está entregando abaixo do esperado nas renovações. Já dei feedbacks informais mas não mudou. Tenho 3 exemplos concretos desta semana..." />
        </div>

        <div style={{ marginBottom: 18 }}>
          <Label>Criticidade</Label>
          <Pills value={sev} onChange={setSev} options={[
            { value: "dev", label: "🌱 Desenvolvimento" },
            { value: "at", label: "⚠️ Atenção" },
            { value: "crit", label: "🔴 Crítico" },
            { value: "dem", label: "🚨 Pré-demissão" },
          ]} />
        </div>

        <BtnPrimary onClick={async () => {
          if (!desafio.trim()) { alert("Descreva a situação."); return; }
          setLoading(true);
          try {
            const r = await gerarFeedback(desafio, sev, cargo, tempo, tipoComp, historico, dados);
            setResult(r);
            salvarNoHistorico("feedback", desafio, r);
          } catch (e) { setResult("Erro ao gerar. Verifique sua conexão."); }
          setLoading(false);
        }} loading={loading}>✦ Estruturar feedback</BtnPrimary>
        <ResultBox text={result} modulo="feedback" />
      </Card>
    </div>
  );
}

// ── GESTÃO DE CRISE ──
function CrisePage({ dados }) {
  const [problema, setProblema] = useState("");
  const [gravidade, setGravidade] = useState("atencao");
  const [quantos, setQuantos] = useState("um");
  const [jaFez, setJaFez] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const gerarAnalise = async () => {
    if (!problema.trim()) { alert("Descreva o problema primeiro."); return; }
    setLoading(true);
    try {
      const r = await gerarAnaliseCrise(problema, gravidade, quantos, jaFez, dados);
      setResult(r);
      salvarNoHistorico("crise", problema, r);
    } catch (e) { setResult("Erro ao gerar. Verifique sua conexão."); }
    setLoading(false);
  };

  return (
    <div>
      <SectionLabel>Operação</SectionLabel>
      <PageTitle accent="de Crise">Gestão</PageTitle>
      <div style={{ color: V.text2, fontSize: 12, marginBottom: 18 }}>Descreva o problema. Quanto mais contexto, mais específico o diagnóstico.</div>

      <div style={{ padding: "12px 14px", background: V.roseDim, border: `1px solid ${V.rose}25`, borderRadius: 10, marginBottom: 16, fontSize: 12, color: V.text2, lineHeight: 1.7 }}>
        <span style={{ color: V.rose, fontWeight: 700 }}>Quando usar: </span>Um problema sério apareceu. Antes de reagir, descreva aqui — o Vela te ajuda a pensar antes de agir.
      </div>

      <Card>
        <div style={{ marginBottom: 13 }}>
          <Label>O que está acontecendo?</Label>
          <VoiceTextArea value={problema} onChange={e => setProblema(e.target.value)} rows={4}
            placeholder="Descreva o problema: o que aconteceu, quando, qual cliente, o que o cliente está sentindo ou pedindo..." />
        </div>

        <div style={{ marginBottom: 13 }}>
          <Label>Tipo da situação</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[
              { v: "insatisfeito", l: "😤 Cliente insatisfeito" },
              { v: "travado", l: "🚫 Cliente travado / impedido" },
              { v: "churn", l: "⚠️ Risco de churn" },
              { v: "confirmado", l: "💔 Churn confirmado" },
            ].map(o => (
              <button key={o.v} onClick={() => setGravidade(o.v)}
                style={{ padding: "9px 10px", border: `1.5px solid ${gravidade === o.v ? V.rose : V.border}`, borderRadius: 9, background: gravidade === o.v ? V.roseDim : V.surface2, color: gravidade === o.v ? V.rose : V.text2, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", textAlign: "left" }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 13 }}>
          <Label>Escala do impacto</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
            {[
              { v: "um", l: "1 cliente" },
              { v: "varios", l: "Múltiplos" },
              { v: "sistemico", l: "🚨 Sistêmico" },
            ].map(o => (
              <button key={o.v} onClick={() => setQuantos(o.v)}
                style={{ padding: "9px 8px", border: `1.5px solid ${quantos === o.v ? V.rose : V.border}`, borderRadius: 9, background: quantos === o.v ? V.roseDim : V.surface2, color: quantos === o.v ? V.rose : V.text2, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", textAlign: "center" }}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>O que você já fez até agora? (opcional)</Label>
          <VoiceTextArea value={jaFez} onChange={e => setJaFez(e.target.value)} rows={2}
            placeholder="Ex: Já entrei em contato com o cliente, estou aguardando retorno do time técnico..." />
        </div>

        <BtnPrimary onClick={gerarAnalise} loading={loading}>✦ Analisar e estruturar resposta</BtnPrimary>
        <ResultBox text={result} modulo="crise" />
        {result && (
          <button onClick={() => { setProblema(""); setResult(""); setJaFez(""); setGravidade("atencao"); setQuantos("um"); }}
            style={{ width: "100%", background: "none", border: `1px solid ${V.border}`, color: V.text2, borderRadius: 9, padding: "11px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, marginTop: 10 }}>
            Nova análise
          </button>
        )}
      </Card>
    </div>
  );
}

// ── NARRATIVA ──
function NarrativaPage({ dados }) {
  const [aud, setAud] = useState("board");
  const [obj, setObj] = useState("res");
  const [tone, setTone] = useState("ot");
  const [tamanhoTime, setTamanhoTime] = useState("medio");
  const [momentoEmpresa, setMomentoEmpresa] = useState("crescendo");
  const [editDados, setEditDados] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Usa só as métricas — não o contexto completo do check-in
    if (dados?.metricas) {
      const m = dados.metricas;
      const metricasFormatadas = [
        m.nps ? `NPS: ${m.nps}` : "",
        m.churn ? `Churn: ${m.churn}%` : "",
        m.csat ? `CSAT: ${m.csat}` : "",
        m.mrr ? `MRR Expansão: R$${m.mrr}` : "",
      ].filter(Boolean).join(" · ");
      if (metricasFormatadas) setEditDados(metricasFormatadas);
    } else if (dados?.rawMetricas) {
      setEditDados(dados.rawMetricas);
    }
  }, [dados]);

  const gerar = async () => {
    if (!editDados.trim()) { alert("Adicione seus dados primeiro."); return; }
    setLoading(true);
    try {
      const r = await gerarNarrativa({ ...dados, rawMetricas: editDados }, aud, obj, tone, tamanhoTime, momentoEmpresa);
      setResult(r);
      salvarNoHistorico("narrativa", editDados, r);
    } catch (e) { setResult("Erro ao gerar. Verifique sua conexão."); }
    setLoading(false);
  };

  return (
    <div>
      <SectionLabel>Executivo</SectionLabel>
      <PageTitle>Narrativa para <span style={{ color: V.amber }}>Diretoria</span></PageTitle>
      <div style={{ color: V.text2, fontSize: 12, marginBottom: 18 }}>
        {dados?.rawMetricas ? "✅ Métricas importadas do check-in." : "Dados técnicos → linguagem de receita, expansão e retenção."}
      </div>

      <div style={{ padding: "12px 14px", background: V.amberGlow, border: `1px solid ${V.amber}20`, borderRadius: 10, marginBottom: 16, fontSize: 12, color: V.text2, lineHeight: 1.7 }}>
        <span style={{ color: V.amber, fontWeight: 700 }}>Dica: </span>Mostre o impacto, não só o dado. A diretoria não quer NPS — quer saber o que NPS significa para a receita.
      </div>

      <Card>
        {dados?.rawMetricas && <PreBadge text="Métricas importadas do check-in — ajuste se necessário" />}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 13 }}>
          <div><Label>Audiência</Label>
            <Sel value={aud} onChange={e => setAud(e.target.value)}>
              <option value="board">Board / C-Level</option>
              <option value="ceo">CEO / Founder</option>
              <option value="vp">VP / Produto</option>
              <option value="inv">Investidores</option>
            </Sel>
          </div>
          <div><Label>Objetivo</Label>
            <Sel value={obj} onChange={e => setObj(e.target.value)}>
              <option value="res">Apresentar resultado</option>
              <option value="apr">Pedir aprovação</option>
              <option value="alert">Comunicar risco</option>
              <option value="exp">Oportunidade expansão</option>
            </Sel>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 13 }}>
          <div><Label>Tamanho do time</Label>
            <Sel value={tamanhoTime} onChange={e => setTamanhoTime(e.target.value)}>
              <option value="pequeno">Até 5 pessoas</option>
              <option value="medio">6 a 15 pessoas</option>
              <option value="grande">Mais de 15</option>
            </Sel>
          </div>
          <div><Label>Momento da empresa</Label>
            <Sel value={momentoEmpresa} onChange={e => setMomentoEmpresa(e.target.value)}>
              <option value="early">Early stage</option>
              <option value="crescendo">Crescendo</option>
              <option value="escalando">Escalando</option>
            </Sel>
          </div>
        </div>

        <div style={{ marginBottom: 13 }}>
          <Label>Seus dados e contexto</Label>
          <VoiceTextArea value={editDados} onChange={e => setEditDados(e.target.value)} rows={5}
            placeholder="Ex: NPS 38, churn 3.2%, CSAT 4.1/5. Tivemos 2 churns acima de R$5k por problema de onboarding. MRR expansão em R$24k..." />
        </div>

        <div style={{ marginBottom: 18 }}>
          <Label>Tom da narrativa</Label>
          <Pills value={tone} onChange={setTone} options={[
            { value: "ot", label: "🚀 Otimista" },
            { value: "neu", label: "⚖️ Neutro" },
            { value: "urg", label: "⚡ Urgente" },
          ]} />
        </div>

        <BtnPrimary onClick={gerar} loading={loading}>✦ Converter para linguagem executiva</BtnPrimary>
        <ResultBox text={result} modulo="narrativa" />
      </Card>
    </div>
  );
}

// ── STORAGE HELPERS ──
const LS = {
  get: (key, fallback = null) => {
    try { const v = localStorage.getItem("vela_" + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set: (key, value) => {
    try { localStorage.setItem("vela_" + key, JSON.stringify(value)); } catch {}
  },
  clear: () => {
    try { Object.keys(localStorage).filter(k => k.startsWith("vela_")).forEach(k => localStorage.removeItem(k)); } catch {}
  },
};

// ── APP ──
const NAV = [
  { id: "home", icon: "◎", label: "Início" },
  { id: "cockpit", icon: "◆", label: "Cockpit" },
  { id: "matriz", icon: "◇", label: "Matriz" },
  { id: "feedback", icon: "▷", label: "Feedback" },
  { id: "crise", icon: "⚡", label: "Crise" },
  { id: "narrativa", icon: "✦", label: "Narrativa" },
];

export default function App() {
  const [page, setPage] = useState(() => LS.get("page", "home"));
  const [dados, setDados] = useState(() => LS.get("dados", null));
  const [overlay, setOverlay] = useState(null);
  const [tema, setTema] = useState(() => LS.get("tema", "escuro"));
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Autenticação
  useEffect(() => {
    const init = async () => {
      const token = await sb.getSession();
      if (token) {
        const u = await sb.getUser(token);
        if (u) {
          setUser(u);
          // Migra dados do localStorage para o Supabase se existirem
          const dadosLocal = LS.get("dados", null);
          if (dadosLocal) {
            await sb.salvarDados(u.id, "dados", dadosLocal);
          }
          // Carrega dados do Supabase
          const dadosRemoto = await sb.carregarDados(u.id, "dados");
          if (dadosRemoto) {
            setDados(dadosRemoto);
            LS.set("dados", dadosRemoto);
          }
        }
      }
      setAuthLoading(false);
    };
    init();
  }, []);

  // Atualiza V globalmente quando tema muda
  V = TEMAS[tema] || TEMAS.escuro;

  const toggleTema = () => {
    const novoTema = tema === "escuro" ? "claro" : "escuro";
    setTema(novoTema);
    LS.set("tema", novoTema);
  };

  const handleComplete = async (d) => {
    setDados(d);
    LS.set("dados", d);
    if (user) await sb.salvarDados(user.id, "dados", d);
    setOverlay(null);
    setPage("cockpit");
    LS.set("page", "cockpit");
  };

  const handleNav = (p) => {
    setPage(p);
    LS.set("page", p);
  };

  if (authLoading) return (
    <div style={{ background: TEMAS.escuro.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, background: `linear-gradient(135deg, #F5A800, #C8880A)`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontFamily: "monospace", color: "#080A0F", margin: "0 auto 12px" }}>◎</div>
        <div style={{ color: TEMAS.escuro.text2, fontSize: 12 }}>Carregando...</div>
      </div>
    </div>
  );

  if (!user) return <LoginScreen />;

  const pageMap = {
    home: <HomePage dados={dados} onCheckin={() => setOverlay("checkin")} onUpdate={() => setOverlay("update")} onNav={handleNav} />,
    cockpit: <CockpitPage dados={dados} />,
    matriz: <MatrizPage dados={dados} />,
    feedback: <FeedbackPage dados={dados} />,
    crise: <CrisePage dados={dados} />,
    narrativa: <NarrativaPage dados={dados} />,
    historico: <HistoricoPage onBack={() => handleNav("home")} />,
    perfil: <PerfilPage dados={dados} onBack={() => handleNav("home")} onSave={(updates) => {
      const novo = { ...dados, ...updates };
      setDados(novo);
      LS.set("vela_dados", novo);
    }} />,
  };

  return (
    <div style={{ background: V.bg, color: V.text, fontFamily: "'DM Sans', system-ui, sans-serif", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A3050; border-radius: 3px; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.1);opacity:0.1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        button:active { transform: scale(0.98); }
      `}</style>

      {/* Header */}
      <div style={{ background: V.gradHeader || V.surface, borderBottom: `1px solid ${V.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, backdropFilter: "blur(12px)" }}>
        <div style={{ width: 30, height: 30, background: `linear-gradient(135deg, #F5A800, #C8880A)`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontFamily: "monospace", color: "#080A0F", fontWeight: 700, boxShadow: "0 2px 8px rgba(240,165,0,0.3)" }}>◎</div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 17, letterSpacing: -0.5, flex: 1, color: V.text }}>Vela</div>

        <button onClick={toggleTema}
          style={{ background: V.surface2, border: `1px solid ${V.border}`, color: V.text2, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, marginRight: 4, transition: "all 0.2s" }}>
          {tema === "escuro" ? "☀️" : "🌙"}
        </button>

        {/* Avatar do usuário */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${V.border2}` }} alt="avatar" />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: V.surface3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: V.text2, border: `1.5px solid ${V.border2}` }}>
                {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
              </div>
            )}
            <button onClick={async () => { await sb.signOut(); setUser(null); }}
              style={{ background: "none", border: "none", color: V.text3, cursor: "pointer", fontSize: 11, fontFamily: "inherit", padding: "2px 4px" }}>
              Sair
            </button>
          </div>
        )}

        {dados && (
          <button onClick={() => setOverlay("update")}
            style={{ background: V.tealDim, border: `1px solid ${V.teal}30`, color: V.teal, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, letterSpacing: "0.3px" }}>
            ◈ Check-out
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", WebkitOverflowScrolling: "touch", animation: "fadeIn 0.3s ease" }}>
        {pageMap[page]}
        <div style={{ height: 48 }} />
      </div>

      {/* Nav */}
      <div style={{ background: V.gradNav || V.surface, borderTop: `1px solid ${V.border}`, display: "flex", flexShrink: 0, paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => handleNav(n.id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: "12px 2px 10px", background: "none", border: "none", color: page === n.id ? V.amber : V.navInativo, cursor: "pointer", fontFamily: "monospace", borderTop: page === n.id ? `1.5px solid ${V.amber}` : "1.5px solid transparent", transition: "color 0.2s", position: "relative" }}>
            {page === n.id && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 24, height: 1, background: V.amber, borderRadius: 1, boxShadow: "0 0 8px rgba(240,165,0,0.6)" }} />}
            <span style={{ fontSize: 16, lineHeight: 1, transition: "transform 0.2s", transform: page === n.id ? "scale(1.1)" : "scale(1)" }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: page === n.id ? 700 : 500, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.3px" }}>{n.label}</span>
          </button>
        ))}
      </div>

      {overlay && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,10,15,0.96)", zIndex: 200, display: "flex", flexDirection: "column", backdropFilter: "blur(12px)", animation: "fadeIn 0.2s ease" }}>
          <div style={{ background: V.surface, borderBottom: `1px solid ${V.border}`, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, background: `linear-gradient(135deg, #F5A800, #C8880A)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontFamily: "monospace", color: "#080A0F", fontWeight: 700 }}>◎</div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 16, flex: 1 }}>Vela</div>
            <button onClick={() => setOverlay(null)} style={{ background: V.surface2, border: `1px solid ${V.border}`, color: V.text2, cursor: "pointer", fontFamily: "inherit", fontSize: 12, borderRadius: 8, padding: "5px 12px" }}>Fechar ×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
            <CheckinFlow onComplete={handleComplete} isUpdate={overlay === "update"} dadosExistentes={dados} />
            <div style={{ height: 24 }} />
          </div>
        </div>
      )}
    </div>
  );
}
