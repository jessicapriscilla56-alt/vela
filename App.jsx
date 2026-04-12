import { useState, useRef, useEffect } from "react";

const V = {
  bg: "#0C0E14", surface: "#13151E", surface2: "#1A1D29", surface3: "#212535",
  border: "#2A2E40", border2: "#363B52",
  amber: "#F0A500", amberDim: "rgba(240,165,0,0.10)", amberGlow: "rgba(240,165,0,0.05)",
  teal: "#2DD4BF", tealDim: "rgba(45,212,191,0.10)",
  rose: "#FB7185", roseDim: "rgba(251,113,133,0.10)",
  indigo: "#818CF8", indigoDim: "rgba(129,140,248,0.10)",
  text: "#F0F2F8", text2: "#6B7194", text3: "#363B52",
};

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
  if (prioridade) tasks.do.push(prioridade.substring(0, 55));
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

const SISTEMA = `Você é o Vela, um copiloto de liderança para líderes de CS (Customer Success) e CX (Customer Experience) em startups brasileiras. Você foi criado com base no livro "Liderança Customer Centric" e na metodologia da autora.

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
- Máximo de 500 palavras por resposta`;

async function gerarFeedback(desafio, sev, cargo, tempo, tipoComp, historico) {
  const sevMap = { dev: "desenvolvimento (tom: curioso, encorajador)", at: "atenção (tom: direto, construtivo)", crit: "crítico (tom: firme, claro)", dem: "pré-demissão (tom: transparente, sério)" };
  const tempoMap = { novo: "menos de 3 meses na equipe", medio: "3 a 12 meses na equipe", senior: "mais de 1 ano na equipe" };
  const compMap = { entrega: "entrega e resultado", relacionamento: "relacionamento interpessoal", autonomia: "autonomia e iniciativa", comunicacao: "comunicação", padrao: "comportamento geral" };

  const prompt = `${SISTEMA}

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

  const prompt = `${SISTEMA}

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

  const prompt = `${SISTEMA}

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

async function gerarAnaliseIndicador(indicador, foco) {
  const focoMap = { churn: "Churn (taxa de cancelamento)", nps: "NPS (Net Promoter Score)", csat: "CSAT (satisfação por interação)", expansao: "Expansão de receita (MRR expansion)", onboarding: "Onboarding (ativação de clientes)", retencao: "Retenção (renovações e permanência)" };

  const prompt = `${SISTEMA}

MÓDULO: Cockpit — Análise de Indicador

INDICADOR: ${focoMap[foco] || foco}

SITUAÇÃO DESCRITA PELO LÍDER:
"${indicador}"

Analise essa situação do ponto de vista de liderança de CS/CX. Inclua:
1. Diagnóstico — o que o indicador está revelando de verdade (vá além do óbvio)
2. Causas prováveis — as 3 mais comuns para esse cenário específico
3. Onde focar o tempo agora — o que o líder deveria fazer nos próximos 7 dias
4. Micro-processo para essa semana — uma ação concreta e específica
5. Pergunta estratégica — uma pergunta que o líder deveria se fazer

Seja específico ao que foi descrito. Não dê respostas genéricas sobre o indicador — responda ao contexto real.`;

  return await chamarClaude(prompt);
}

async function gerarAnaliseCrise(problema, gravidade, quantos, jaFez) {
  const gravMap = { insatisfeito: "cliente insatisfeito", travado: "cliente travado/impedido de operar", churn: "risco real de churn", confirmado: "churn confirmado" };
  const quantosMap = { um: "1 cliente afetado", varios: "múltiplos clientes afetados", sistemico: "problema sistêmico" };

  const prompt = `${SISTEMA}

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
  <div onClick={onClick} style={{ background: V.surface, border: `1px solid ${V.border}`, borderRadius: 14, padding: 18, marginBottom: 12, cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>
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
    style={{ width: "100%", background: disabled || loading ? V.surface3 : `linear-gradient(135deg, ${V.amber}, #D4920A)`, color: disabled || loading ? V.text2 : "#0C0E14", border: "none", borderRadius: 10, padding: "14px", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, cursor: disabled || loading ? "not-allowed" : "pointer", transition: "all 0.2s", ...style }}>
    {loading ? "⏳ Gerando..." : children}
  </button>
);

const BtnSecondary = ({ children, onClick, style }) => (
  <button onClick={onClick} style={{ background: "transparent", border: `1.5px solid ${V.border2}`, color: V.text2, borderRadius: 9, padding: "11px 16px", fontFamily: "inherit", fontSize: 14, cursor: "pointer", ...style }}>{children}</button>
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

const ResultBox = ({ text, modulo = "" }) => {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(null); // null | 'up' | 'down'
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

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
    <div style={{ background: V.amberGlow, border: `1px solid ${V.amber}30`, borderLeft: `3px solid ${V.amber}`, borderRadius: 12, padding: 18, marginTop: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: V.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>✦ Resultado</div>
      <div style={{ color: V.text, fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap", fontWeight: 400 }}>{text}</div>

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
    </div>
  );
};

const PreBadge = ({ text = "Pré-preenchido do check-in — ajuste se quiser" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: V.amberGlow, border: `1px solid ${V.amber}20`, borderRadius: 8, marginBottom: 14, fontSize: 11, color: V.amber, fontWeight: 500 }}>
    ◈ {text}
  </div>
);

// ── PRINCÍPIO DA SEMANA ──
function PrincipioDaSemana() {
  const semana = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const p = PRINCIPIOS[semana % PRINCIPIOS.length];
  return (
    <div style={{ padding: "14px 16px", background: V.amberGlow, border: `1px solid ${V.amber}20`, borderRadius: 12, marginBottom: 20 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: V.amber, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: "monospace" }}>◈</span> Princípio da semana
      </div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: V.text, lineHeight: 1.5, marginBottom: 6 }}>
        "{p.frase}"
      </div>
      <div style={{ fontSize: 10, color: V.text2 }}>— {p.cap} · Liderança Customer Centric</div>
    </div>
  );
}

// ── CHECKIN ──
function CheckinFlow({ onComplete, isUpdate }) {
  const [modo, setModo] = useState(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [curr, setCurr] = useState("");
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recState, setRecState] = useState("idle");
  const recognitionRef = useRef(null);

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

  const startRec = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setRecState("fallback"); return; }
    const r = new SR();
    r.lang = "pt-BR"; r.continuous = true; r.interimResults = false;
    let acc = "";
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) acc += e.results[i][0].transcript + " ";
      }
      setTranscript(acc);
    };
    r.onerror = () => setRecState("fallback");
    r.onend = () => setRecState(prev => prev === "recording" ? "done" : prev);
    r.start();
    recognitionRef.current = r;
    setRecState("recording");
    setTranscript("");
  };

  const stopRec = () => { recognitionRef.current?.stop(); setRecState("done"); };

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
    };
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
            <div style={{ color: V.text2, fontSize: 12, lineHeight: 1.7 }}>Feito para ser rápido — 4 perguntas para atualizar seus números e contexto da semana. Todos os módulos vão refletir o novo contexto.</div>
          </div>
        ) : (
          <div>
            <div style={{ padding: "12px 16px", background: V.amberGlow, border: `1px solid ${V.amber}20`, borderRadius: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: V.amber, fontWeight: 700, marginBottom: 4 }}>Configuração inicial — feita uma vez</div>
              <div style={{ color: V.text2, fontSize: 12, lineHeight: 1.7 }}>Vamos entender quem você é e como está sua operação. Com isso, todos os módulos ficam pré-preenchidos com seu contexto. Leva cerca de 3 minutos.</div>
            </div>
            <div style={{ fontSize: 11, color: V.text2, textAlign: "center" }}>Depois use o <span style={{ color: V.teal }}>check-out semanal</span> para atualizar a cada semana</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
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
              <div style={{ fontSize: 13, color: V.text, lineHeight: 1.7, maxHeight: 100, overflowY: "auto", fontStyle: "italic" }}>"{transcript}"</div>
            </Card>
          )}
          {recState === "done" && transcript && (
            <BtnPrimary onClick={() => processText(transcript)} loading={processing}>✦ Preencher tudo automaticamente</BtnPrimary>
          )}
          <div style={{ textAlign: "center", color: V.text3, fontSize: 11, margin: "16px 0 10px" }}>— ou digite abaixo —</div>
        </>
      )}

      <div style={{ marginBottom: 14 }}>
        <Label>Descreva livremente sua semana</Label>
        <TextArea value={transcript} onChange={e => setTranscript(e.target.value)} rows={5}
          placeholder="Ex: Oi, sou a Mariana, Head of CS na Startup X. Time de 8 pessoas. NPS 38, churn 3.2%. Semana difícil — QBR na quinta com 3 contas em risco e preciso dar um feedback difícil para meu CS sênior..." />
      </div>
      {transcript && <BtnPrimary onClick={() => processText(transcript)} loading={processing}>✦ Preencher tudo automaticamente</BtnPrimary>}
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
        <TextArea value={curr} onChange={e => setCurr(e.target.value)} rows={4} placeholder={q.placeholder}
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) next(); }} autoFocus />
        <div style={{ fontSize: 10, color: V.text3, marginTop: 5 }}>⌘ + Enter para avançar</div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {step > 0 && <BtnSecondary onClick={() => { setStep(s => s - 1); setCurr(answers[QUESTIONS[step - 1].id] || ""); }}>←</BtnSecondary>}
        <BtnPrimary onClick={next} loading={processing && step === QUESTIONS.length - 1} style={{ flex: 1 }}>
          {step < QUESTIONS.length - 1 ? "Próxima →" : "✦ Preencher tudo"}
        </BtnPrimary>
      </div>

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

// ── COCKPIT — Análise de Indicadores ──
function CockpitPage({ dados }) {
  const [indicador, setIndicador] = useState("");
  const [foco, setFoco] = useState(() => LS.get("cockpit_foco", "churn"));
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState(() => LS.get("cockpit_historico", []));

  const FOCOS = [
    { value: "churn", label: "📉 Churn", desc: "Taxa de cancelamento" },
    { value: "nps", label: "⭐ NPS", desc: "Satisfação e lealdade" },
    { value: "csat", label: "💬 CSAT", desc: "Satisfação por interação" },
    { value: "expansao", label: "📈 Expansão", desc: "Receita de expansão" },
    { value: "onboarding", label: "🚀 Onboarding", desc: "Ativação de clientes" },
    { value: "retencao", label: "🔒 Retenção", desc: "Renovações e permanência" },
  ];

  const focoAtual = FOCOS.find(f => f.value === foco);

  const gerarAnalise = async () => {
    if (!indicador.trim()) { alert("Descreva o indicador primeiro."); return; }
    setLoading(true);
    try {
      const texto = await gerarAnaliseIndicador(indicador, foco);
      setResult(texto);
      const novoHistorico = [{ foco: focoAtual?.label, texto: indicador.substring(0, 50), resultado: texto }, ...historico].slice(0, 5);
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
        Descreva o que está acontecendo com seu indicador. O Vela traz diagnóstico, causas prováveis e plano de ação.
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

        <div style={{ marginBottom: 16 }}>
          <Label>O que está acontecendo com {focoAtual?.label.split(" ").slice(1).join(" ")}?</Label>
          <VoiceTextArea value={indicador} onChange={e => setIndicador(e.target.value)} rows={4}
            placeholder={`Ex: Meu ${focoAtual?.desc.toLowerCase()} caiu de X para Y nos últimos 30 dias. Tivemos 3 situações específicas de... O time está fazendo... Eu suspeito que o problema está em...`} />
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
            const r = await gerarFeedback(desafio, sev, cargo, tempo, tipoComp, historico);
            setResult(r);
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
      const r = await gerarAnaliseCrise(problema, gravidade, quantos, jaFez);
      setResult(r);
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

  const handleComplete = (d) => {
    setDados(d);
    LS.set("dados", d);
    setOverlay(null);
    setPage("cockpit");
    LS.set("page", "cockpit");
  };

  const handleNav = (p) => {
    setPage(p);
    LS.set("page", p);
  };

  const pageMap = {
    home: <HomePage dados={dados} onCheckin={() => setOverlay("checkin")} onUpdate={() => setOverlay("update")} onNav={handleNav} />,
    cockpit: <CockpitPage dados={dados} />,
    matriz: <MatrizPage dados={dados} />,
    feedback: <FeedbackPage dados={dados} />,
    crise: <CrisePage dados={dados} />,
    narrativa: <NarrativaPage dados={dados} />,
  };

  return (
    <div style={{ background: V.bg, color: V.text, fontFamily: "'DM Sans', system-ui, sans-serif", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      <div style={{ background: V.surface, borderBottom: `1px solid ${V.border}`, padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${V.amber}, #D4920A)`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontFamily: "monospace", color: "#0C0E14", fontWeight: 700 }}>◎</div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 16, letterSpacing: -0.3, flex: 1 }}>Vela</div>
        {dados && (
          <button onClick={() => setOverlay("update")}
            style={{ background: V.tealDim, border: `1px solid ${V.teal}25`, color: V.teal, borderRadius: 8, padding: "5px 11px", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600 }}>
            ◈ Check-out
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 14px", WebkitOverflowScrolling: "touch" }}>
        {pageMap[page]}
        <div style={{ height: 40 }} />
      </div>

      <div style={{ background: V.surface, borderTop: `1px solid ${V.border}`, display: "flex", flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => handleNav(n.id)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "10px 2px", background: "none", border: "none", color: page === n.id ? V.amber : V.text3, cursor: "pointer", fontFamily: "monospace", borderTop: page === n.id ? `2px solid ${V.amber}` : "2px solid transparent", transition: "color 0.15s" }}>
            <span style={{ fontSize: 17, lineHeight: 1 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{n.label}</span>
          </button>
        ))}
      </div>

      {overlay && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(12,14,20,0.94)", zIndex: 200, display: "flex", flexDirection: "column", backdropFilter: "blur(8px)" }}>
          <div style={{ background: V.surface, borderBottom: `1px solid ${V.border}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 16, flex: 1 }}>Vela</div>
            <button onClick={() => setOverlay(null)} style={{ background: "none", border: "none", color: V.text2, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Fechar ×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
            <CheckinFlow onComplete={handleComplete} isUpdate={overlay === "update"} />
            <div style={{ height: 24 }} />
          </div>
        </div>
      )}
    </div>
  );
}
