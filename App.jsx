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

// ── FUNÇÕES DE GERAÇÃO COM CONTEXTO REAL ──

function gerarFeedback(desafio, sev, cargo, tempo, tipoComp, historico) {
  const isJunior = tempo === "novo" || cargo.toLowerCase().includes("júnior") || cargo.toLowerCase().includes("junior") || cargo.toLowerCase().includes("analista");
  const isSenior = tempo === "senior" || cargo.toLowerCase().includes("sênior") || cargo.toLowerCase().includes("senior") || cargo.toLowerCase().includes("especialista") || cargo.toLowerCase().includes("coordenador");
  const isPrimeiraVez = historico === "primeira";
  const isRecorrente = historico === "recorrente";

  const aberturas = {
    dev: {
      junior: `"Quero conversar sobre algo que percebi e que vai te ajudar muito a crescer aqui. Pode ser que você ainda não tenha clareza sobre isso, e tudo bem — é exatamente para isso que estou aqui."`,
      senior: `"Quero conversar sobre algo que percebi. Dado o seu nível de maturidade, acredito que você vai entender o que preciso trazer — e que vai usar isso para crescer ainda mais."`,
      padrao: `"Quero conversar sobre algo que percebi e que vai te ajudar a crescer ainda mais aqui."`,
    },
    at: {
      junior: `"Preciso te dar um retorno importante. Você está crescendo aqui, e exatamente por isso preciso ser honesta sobre algo que está atrapalhando esse crescimento."`,
      senior: `"Preciso te dar um retorno importante. Dada a sua experiência, sei que você consegue ouvir isso com abertura — e que tem tudo para virar esse jogo."`,
      padrao: `"Preciso te dar um retorno importante. Quero que seja uma conversa construtiva — não de julgamento."`,
    },
    crit: {
      junior: `"Vou ser direto porque me importo com o seu desenvolvimento. Chegamos a um ponto em que, se isso não mudar, vai comprometer a sua trajetória aqui."`,
      senior: `"Vou ser direto porque me importo com você e com o time. Para alguém com a sua experiência, o que estou vendo não faz sentido — e preciso entender o que está acontecendo de verdade."`,
      padrao: `"Vou ser direto porque me importo com você e com o time. Chegamos a um ponto que exige uma conversa franca."`,
    },
    dem: {
      junior: `"Esta é uma conversa muito séria. Quero ser transparente: estamos em um momento crítico, e o que acontecer nas próximas semanas vai determinar o seu futuro aqui."`,
      senior: `"Esta é uma conversa difícil, mas necessária. Você tem experiência suficiente para entender a gravidade — e para decidir se quer virar esse jogo."`,
      padrao: `"Esta é uma conversa difícil, mas necessária. Quero ser transparente sobre onde estamos e o que precisa mudar."`,
    },
  };

  const nivel = isJunior ? "junior" : isSenior ? "senior" : "padrao";
  const abertura = aberturas[sev][nivel];

  const contextoHistorico = isPrimeiraVez
    ? `\nEsta é a primeira vez que você traz esse tema — o tom deve ser de abertura e curiosidade, não de cobrança. A pessoa pode genuinamente não ter percebido o impacto.`
    : isRecorrente
    ? `\nEste comportamento é recorrente. Isso muda a abordagem: você já teve conversas anteriores, então esta precisa ser mais diretiva. Chegue com os fatos documentados, seja claro sobre o que muda agora e qual é o prazo.`
    : "";

  const focoTipo = {
    entrega: `Foco em entrega: conecte o comportamento ao impacto nos resultados do time e do cliente. Seja específico sobre o que "entregar bem" significa nesse contexto — muitas vezes o problema é falta de clareza de expectativa, não falta de vontade.`,
    relacionamento: `Foco em relacionamento: comportamentos de relacionamento são os mais difíceis de dar feedback — porque a pessoa raramente vê como os outros a percebem. Use registros concretos: situações específicas, reações observáveis de colegas. Crie o espelho antes de cobrar a mudança.`,
    autonomia: `Foco em autonomia: pergunte antes de afirmar. A falta de autonomia pode vir de insegurança (precisa de estímulo), de ambiente anterior controlador (precisa de permissão explícita) ou de preguiça intelectual (precisa de cobrança). Entender qual é define a abordagem.`,
    comunicacao: `Foco em comunicação: seja extremamente específico — "sua comunicação precisa melhorar" não ajuda ninguém. Traga o exemplo exato: o e-mail, a reunião, a frase. Mostre o impacto percebido e o que seria diferente.`,
    padrao: `Seja específico sobre o comportamento observado — não sobre quem a pessoa é, mas sobre o que ela fez ou deixou de fazer.`,
  }[tipoComp] || `Seja específico sobre o comportamento observado — não sobre quem a pessoa é, mas sobre o que ela fez ou deixou de fazer.`;

  return `PERFIL DA CONVERSA\n${cargo ? `Liderado: ${cargo}` : ""}${tempo === "novo" ? " · Menos de 3 meses" : tempo === "medio" ? " · 3 a 12 meses" : " · Mais de 1 ano"} · Nível: ${isJunior ? "Júnior/Iniciante" : isSenior ? "Sênior/Especialista" : "Pleno"}${contextoHistorico}\n\nANTES DA CONVERSA\nPrepare exemplos concretos — situações específicas, não impressões. Reserve 45-60min sem interrupção. ${isJunior ? "Com perfil júnior: seja mais didático, explique o porquê de cada expectativa. Muitas vezes o problema é falta de referência, não falta de vontade." : isSenior ? "Com perfil sênior: vá direto ao ponto. Profissionais experientes valorizam objetividade — rodeios soam como falta de coragem." : "Entre com curiosidade, não com julgamento."}\n\nABERTURA SUGERIDA\n${abertura}\n\nNÚCLEO — Framework Fato → Impacto → Futuro\n${focoTipo}\n\n"Observei que [FATO ESPECÍFICO]. Isso gerou [IMPACTO concreto no time/cliente/resultado]. O que preciso ver diferente é [COMPORTAMENTO ESPERADO com clareza]."\n\nSituação descrita: "${desafio.substring(0, 120)}${desafio.length > 120 ? "..." : ""}"\n→ Encontre o fato concreto (data, situação, comportamento observável)\n→ Descreva o impacto real — no cliente, no time ou na operação\n→ Defina exatamente o que espera ver diferente\n\nFato não tem defesa. Julgamento tem.\n\nESCUTA ATIVA\n${isJunior
    ? `— "O que você entendeu que era esperado de você nessa situação?"\n— "O que te faltou para conseguir fazer diferente?"\n— "O que você precisaria de mim para chegar lá?"`
    : isSenior
    ? `— "Como você avalia o que aconteceu?"\n— "O que você faria diferente sabendo do impacto que gerou?"\n— "O que está te impedindo de operar no nível que você é capaz?"`
    : `— "O que você acha que está causando isso?"\n— "O que você precisa de mim para mudar essa situação?"\n— "Tem algo acontecendo que eu não estou vendo?"`}\n\nQuando houver resistência: "Entendo o que você está trazendo. E dentro de tudo isso, o que você faria diferente daqui pra frente?"\n\nACORDO E PRÓXIMOS PASSOS\n${isRecorrente
    ? `Esta conversa precisa terminar com um acordo claro e documentado — não genérico. "A partir de agora, o que muda é [X específico]. Vou acompanhar [Y indicador] por [Z semanas]. Se não mudar, precisaremos tomar uma decisão diferente. Você concorda?"`
    : `"O que vamos fazer diferente a partir de agora é ___. Revisamos em ___ semanas. Você concorda?" Documente imediatamente após a conversa.`}\n\nSINAIS DE ALERTA\n${sev === "dem"
    ? `— Esta conversa precisa ter uma data-limite clara. Sem mudança no prazo combinado → decisão formal\n— Se a pessoa se comprometer mas não mudar → o problema não é de compreensão, é de escolha`
    : `— Sem mudança em 2 semanas → nova conversa mais diretiva\n— Comportamento enraizado → múltiplas conversas com evidências crescentes\n— Mudança positiva → reconheça publicamente`}`;
}

function gerarNarrativa(dados, aud, obj, tone, tamanhoTime, momentoEmpresa) {
  const { metricas, contextoSemana, rawMetricas } = dados;
  const audMap = { board: "Board e C-Level", ceo: "CEO e Founder", vp: "VP de Produto", inv: "Investidores" };
  const nps = metricas?.nps ?? 42;
  const churn = metricas?.churn ?? 3.2;
  const mrr = metricas?.mrr ?? 24500;
  const csat = metricas?.csat ?? 4.1;

  const introMap = {
    ot: { board: "Os indicadores do período confirmam que a operação de CS/CX está entregando crescimento sustentável", ceo: "Os dados mostram que a estratégia de retenção está gerando resultado concreto", vp: "As métricas do período indicam que a experiência do cliente está se traduzindo em valor de produto", inv: "Os indicadores de retenção e expansão demonstram tração consistente no modelo de receita recorrente" },
    neu: { board: "Os indicadores do período apresentam um quadro misto que requer atenção e decisão estratégica", ceo: "Os dados revelam oportunidades claras de melhoria que, se adressadas, têm impacto direto na receita", vp: "As métricas de experiência mostram lacunas específicas que afetam retenção e crescimento", inv: "Os indicadores apontam para um momento de ajuste estratégico antes de escalar" },
    urg: { board: "Os sinais da operação indicam uma janela crítica: sem ação nas próximas semanas, o impacto financeiro será mensurável", ceo: "Os dados revelam um risco real de receita que exige decisão imediata — não monitoramento", vp: "As métricas de experiência estão sinalizando problemas que, se não tratados agora, se tornam estruturais", inv: "Os indicadores exigem atenção urgente: o custo de não agir agora é maior que o custo de agir" },
  };

  const timeSizeNote = tamanhoTime === "pequeno"
    ? `Time de CS/CX enxuto — cada pessoa tem impacto desproporcional. As métricas refletem decisões individuais tanto quanto processos.`
    : tamanhoTime === "medio"
    ? `Com um time de tamanho médio, os indicadores já refletem padrões de processo — não só performance individual.`
    : `Operação de maior escala — os indicadores refletem a maturidade dos processos e da cultura de CS/CX construída.`;

  const momentoNote = momentoEmpresa === "early"
    ? `Empresa em estágio inicial: a audiência sabe que os números ainda estão sendo construídos — o que importa é a direção e a velocidade de aprendizado.`
    : momentoEmpresa === "crescendo"
    ? `Empresa em crescimento: a audiência vai comparar os indicadores com o ritmo de expansão — mostre que retenção e crescimento estão andando juntos.`
    : `Empresa em escala: a audiência vai querer ver eficiência — menos custo por cliente retido, mais expansão por conta ativa.`;

  const objMap = {
    res: `apresentar o resultado do período`,
    apr: `justificar um investimento em CS/CX`,
    alert: `comunicar um risco que exige ação`,
    exp: `apresentar uma oportunidade de expansão de receita`,
  };

  return `✦ CONTEXTO EXECUTIVO — Para ${audMap[aud]}\n${introMap[tone][aud]}, com impacto direto nos pilares de retenção e crescimento de receita recorrente.\n\n✦ O QUE OS NÚMEROS DIZEM\nNPS ${nps >= 50 ? `em ${nps} — zona de promotores, com potencial real de expansão via indicação` : nps >= 20 ? `em ${nps} — zona neutra, o que significa clientes que ficam mas não crescem` : `em ${nps} — zona de risco, sinal de que a experiência não está sustentando a relação`}. Churn de ${churn}% ${churn <= 2 ? "— abaixo da média de mercado, operação saudável" : churn <= 5 ? "— dentro da zona de atenção, exige monitoramento ativo" : "— acima do tolerável, com impacto direto no MRR líquido"}. CSAT ${csat >= 4.5 ? `${csat}/5 — excelência na interação` : csat >= 3.5 ? `${csat}/5 — bom, mas com margem de melhoria identificada` : `${csat}/5 — abaixo do esperado, impactando retenção`}.\n\n✦ TRADUÇÃO PARA ${audMap[aud].toUpperCase()}\nPara ${objMap[obj]}: ${contextualNarrativa(aud, obj, tone, nps, churn, mrr, contextoSemana)}\n\n✦ CONTEXTO DA OPERAÇÃO\n${timeSizeNote} ${momentoNote}\n\n${contextoSemana ? `Situação atual: ${contextoSemana.substring(0, 150)}${contextoSemana.length > 150 ? "..." : ""}` : rawMetricas ? `Dados base: ${rawMetricas.substring(0, 150)}` : ""}\n\n✦ PRÓXIMO PASSO RECOMENDADO\n${obj === "apr" ? `Aprovação necessária: definir as 3 alavancas prioritárias de retenção e expansão para o próximo trimestre, com orçamento e ownership claro. ROI estimado: cada 1% de redução no churn equivale a R$${Math.round(mrr * 0.4).toLocaleString("pt-BR")} de receita preservada.` : obj === "alert" ? `Ação urgente: alinhar plano de resposta nas próximas 72 horas. Sem intervenção, o impacto projetado é de R$${Math.round(mrr * churn / 100 * 3).toLocaleString("pt-BR")} em risco no próximo trimestre.` : obj === "exp" ? `Oportunidade de expansão: os clientes com NPS acima de 8 representam o pool mais qualificado para upsell. Com abordagem estruturada, potencial de expansão de ${Math.round(mrr * 0.15).toLocaleString("pt-BR")} em MRR incremental.` : `Proposta: alinhar as 3 alavancas prioritárias em sessão de 90min com as lideranças nas próximas 2 semanas.`}`;
}

function contextualNarrativa(aud, obj, tone, nps, churn, mrr, ctx) {
  if (obj === "alert") return `O sinal está claro e o custo de não agir agora é maior que o custo de agir. ${ctx ? `A situação descrita — "${ctx.substring(0, 80)}..." — precisa de resposta estruturada, não de monitoramento.` : "Cada semana sem ação aumenta o risco de churn em cascata."}`;
  if (obj === "apr") return `O investimento em CS/CX tem ROI mensurável: reduzir churn em 1% equivale a preservar receita recorrente, enquanto expandir base ativa é 5x mais barato que adquirir. ${nps < 30 ? "Com NPS na zona de risco, o investimento agora evita custo maior de recuperação." : "Com a base atual, o momento é de acelerar — não de manter."}`;
  if (obj === "exp") return `Os clientes com maior NPS e menor churn são o pool natural de expansão. A oportunidade não está em prospecção — está dentro da base atual, esperando a conversa certa no momento certo.`;
  return `${nps >= 40 && churn <= 4 ? "A operação está performando dentro do esperado para o estágio da empresa, com fundamentos sólidos para o próximo ciclo de crescimento." : "Os indicadores revelam oportunidades específicas que, se tratadas, têm impacto direto na receita e na sustentabilidade do crescimento."}`;
}

function gerarPriorizacao(dados, tamanhoTime, momentoEmpresa, tipoSemana) {
  const { contextoSemana, prioridade } = dados;
  const isAtarefado = tipoSemana === "atarefado";
  const isCrise = tipoSemana === "crise";
  const isEstrategico = tipoSemana === "estrategico";

  const intro = isCrise
    ? `Semana de crise exige clareza acima de tudo. O risco é reagir a tudo e avançar em nada. Antes de qualquer ação, respire: o que aqui é urgente de verdade — e o que está parecendo urgente porque todo mundo está gritando ao mesmo tempo?`
    : isAtarefado
    ? `Semana cheia é o momento em que a Matriz de Eisenhower mais importa — e mais é ignorada. O urgente vai gritar. O importante vai esperar em silêncio. Seu papel como líder é não deixar o silêncio vencer.`
    : `Semana mais calma é oportunidade rara. Não desperdice reagindo a pequenos ruídos. É o momento certo para o que é importante e não urgente — o que define o futuro, não só apaga o presente.`;

  const timeNote = tamanhoTime === "pequeno"
    ? `\nTime pequeno: sua atenção é escassa e cada hora mal alocada tem custo desproporcional. Delegar bem é sobrevivência, não gestão.`
    : tamanhoTime === "grande"
    ? `\nTime grande: seu papel é cada vez menos executar e cada vez mais garantir que as pessoas certas têm clareza, recursos e autonomia para executar sem você.`
    : "";

  return `${intro}${timeNote}\n\n✦ SEUS 3 MOVIMENTOS DESSA SEMANA\n\n1. ${prioridade ? `"${prioridade.substring(0, 70)}" — você mesmo disse que isso é o que mais importa. Bloqueie tempo hoje, antes de qualquer reunião. Se isso não acontecer hoje, quando vai acontecer?` : "Antes de qualquer coisa: qual é a única coisa que, se resolvida essa semana, tornaria todo o resto mais fácil ou desnecessário? Bloqueie tempo para isso primeiro."}\n\n2. ${isCrise ? `Em crise: comunicação proativa é a diferença entre liderar a narrativa e ser surpreendido. Quem precisa saber o que está acontecendo — antes de perguntar? Envie agora.` : `Comunicação proativa. ${contextoSemana ? `"${contextoSemana.substring(0, 60)}..." — quem precisa de um update sobre isso antes de perguntar?` : "Quem no seu entorno está tomando decisão com informação incompleta porque você não comunicou ainda?"} Transparência não gera caos. Gera comprometimento.`}\n\n3. ${isEstrategico ? `Semana estratégica: use esse espaço para o que não tem urgência mas define o futuro — desenvolvimento de pessoas, revisão de processos, planejamento de 90 dias. O que você vem adiando porque "não tem tempo"?` : `60 minutos sem agenda. Sem Slack, sem reunião, sem e-mail. É no quadrante do importante não urgente que mora a liderança intencional. Coloque no calendário agora — como reunião com você mesmo.`}\n\n✦ O QUE DELEGAR AGORA\n${tamanhoTime === "pequeno" ? `Time pequeno não significa fazer tudo você — significa escolher o que só você pode fazer e delegar o resto com critério claro.` : `Mapeie o que pode ser feito com 80% da qualidade por alguém do time.`} Ao delegar: responsável + prazo + critério de sucesso — em uma mensagem. Sem esses três, não é delegação, é terceirização de problema.\n\n✦ O QUE ELIMINAR SEM CULPA\n${isCrise ? `Em crise: elimine tudo que não tem relação direta com estabilizar a situação. Reuniões de rotina? Reagenda. Relatórios não urgentes? Pausa. O que pode esperar uma semana, espera.` : `Reunião sem pauta ou decisão clara? Cancela. Relatório que ninguém lê? Para. Processo que existe porque "sempre foi assim"? Questiona. Você tem permissão.`}\n\n✦ PERGUNTA ESTRATÉGICA\n${isCrise ? `"O que dessa crise está revelando sobre um processo ou estrutura que precisa mudar — e que eu posso resolver agora enquanto estou com isso em mente?"` : `"Se eu saísse amanhã, o que na minha operação pararia — e o que continuaria funcionando?" A segunda lista é o que você já construiu. A primeira é o trabalho que ainda falta."`}`;
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
      <div style={{ textAlign: "center", padding: "8px 0 28px" }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, marginBottom: 10, letterSpacing: -0.5 }}>
          {isUpdate ? "Check-out" : "Bem-vindo ao"} <span style={{ color: V.amber }}>Vela</span>
        </div>
        <div style={{ color: V.text2, fontSize: 13, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
          {isUpdate ? "Atualize seu contexto. Todos os módulos refletem sua semana atual." : "Seu copiloto de liderança em CS e CX. Responda algumas perguntas ou fale por áudio."}
        </div>
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

  const gerarAnalise = () => {
    if (!indicador.trim()) { alert("Descreva o indicador primeiro."); return; }
    setLoading(true);
    setTimeout(() => {
      const analises = {
        churn: `DIAGNÓSTICO — CHURN\n\n✦ O QUE O NÚMERO ESTÁ DIZENDO\n${indicador.substring(0, 120)}...\nChurn elevado raramente é sobre o produto. Quase sempre é sobre o que aconteceu — ou não aconteceu — na jornada do cliente antes do cancelamento. O sinal chegou antes. Alguém precisava ter visto.\n\n✦ CAUSAS PROVÁVEIS A INVESTIGAR\n1. Falha no onboarding — o cliente nunca ativou de verdade\n2. Lacuna de valor percebido — usa o produto, mas não vê retorno\n3. Mudança interna no cliente — troca de gestor, corte de budget\n4. Concorrente com proposta mais clara\n5. Problema de relacionamento — ninguém estava próximo o suficiente\n\n✦ ONDE FOCAR SEU TEMPO AGORA\n— Mapeie os últimos churns: qual foi o último contato antes do cancelamento?\n— Identifique os clientes com perfil similar que ainda estão ativos: aborde antes\n— Crie uma régua de saúde: quais sinais aparecem 60-90 dias antes do churn?\n\n✦ MICRO-PROCESSO PARA ESSA SEMANA\nListe os 3 clientes com maior risco de churn. Agende contato direto — não automático. Descubra o que eles estão sentindo antes de perguntar sobre renovação.\n\n✦ PERGUNTA ESTRATÉGICA\n"Quando foi a última vez que um cliente nos contou o que estava sentindo — sem ser numa pesquisa?"`,

        nps: `DIAGNÓSTICO — NPS\n\n✦ O QUE O NÚMERO ESTÁ DIZENDO\n${indicador.substring(0, 120)}...\nNPS é um sintoma, não uma causa. Um número baixo diz que há algo sistêmico. Um número alto diz que você está no caminho certo — mas não para.\n\n✦ CAUSAS PROVÁVEIS A INVESTIGAR\n1. Detratores — qual é o padrão de reclamação? Produto, atendimento ou expectativa não atendida?\n2. Neutros — são os mais perigosos: estão aqui hoje, podem ir amanhã\n3. Promotores — você está aproveitando isso? Indicações, cases, expansão?\n\n✦ ONDE FOCAR SEU TEMPO AGORA\n— Fale com os detratores. Não para defender, para entender\n— Mapeie o que os promotores têm em comum: perfil, uso, relacionamento\n— Crie uma ação específica para mover neutros para promotores\n\n✦ MICRO-PROCESSO PARA ESSA SEMANA\nEscolha 2 detratores e agende uma conversa de escuta — sem agenda de vendas. Pergunte: "O que precisaria mudar para você nos recomendar?"\n\n✦ PERGUNTA ESTRATÉGICA\n"Meu time sabe o que os promotores têm em comum — e está replicando isso ativamente?"`,

        csat: `DIAGNÓSTICO — CSAT\n\n✦ O QUE O NÚMERO ESTÁ DIZENDO\n${indicador.substring(0, 120)}...\nCSAT mede o momento. É o termômetro da interação. Quando está baixo, algo específico no atendimento ou na entrega não está funcionando — e quase sempre tem um padrão.\n\n✦ CAUSAS PROVÁVEIS A INVESTIGAR\n1. Tempo de resposta acima do esperado\n2. Primeira resposta que não resolve — cliente precisa voltar\n3. Tom da comunicação — tecnicamente correto, humanamente frio\n4. Falta de autonomia do time para resolver na hora\n5. Expectativa não alinhada no início da jornada\n\n✦ ONDE FOCAR SEU TEMPO AGORA\n— Abra as interações com nota baixa: qual é o padrão?\n— Observe se o problema é de processo ou de habilidade\n— Use os registros como espelho com o time — não como punição\n\n✦ MICRO-PROCESSO PARA ESSA SEMANA\nEscolha 5 interações com nota baixa. Leve para o time e pergunte: "O que o cliente sentiu nesse momento?" Deixe o time ver o impacto antes de propor solução.\n\n✦ PERGUNTA ESTRATÉGICA\n"Meu time entende a diferença entre resolver o problema e cuidar do cliente?"`,

        expansao: `DIAGNÓSTICO — EXPANSÃO DE RECEITA\n\n✦ O QUE O NÚMERO ESTÁ DIZENDO\n${indicador.substring(0, 120)}...\nExpansão baixa quase sempre significa que o cliente não está vendo valor suficiente para querer mais. Ou que ninguém está tendo a conversa certa na hora certa.\n\n✦ CAUSAS PROVÁVEIS A INVESTIGAR\n1. Cliente não ativou todos os recursos que já tem\n2. Nenhum momento estruturado para conversa de valor\n3. Time de CS não se sente confortável com conversa comercial\n4. Falta de visibilidade do ROI que o cliente já obteve\n5. Timing errado — expandir antes de consolidar gera churn\n\n✦ ONDE FOCAR SEU TEMPO AGORA\n— Identifique clientes com alto uso e alta satisfação: esses são os candidatos naturais à expansão\n— Construa o argumento de valor com dados do cliente — não do produto\n— Prepare o time para a conversa: não é venda, é evolução do sucesso\n\n✦ MICRO-PROCESSO PARA ESSA SEMANA\nMapeie os 5 clientes com maior potencial de expansão. Para cada um, monte uma visão de valor: o que eles alcançaram com você até aqui? Essa é a base da conversa.\n\n✦ PERGUNTA ESTRATÉGICA\n"Meu time sabe mostrar o valor que já entregou — antes de pedir para o cliente expandir?"`,

        onboarding: `DIAGNÓSTICO — ONBOARDING\n\n✦ O QUE O NÚMERO ESTÁ DIZENDO\n${indicador.substring(0, 120)}...\nOnboarding fraco é o início do churn. O cliente que não ativa nos primeiros 30-60 dias raramente vira promotor. E a janela para mudar isso é curta.\n\n✦ CAUSAS PROVÁVEIS A INVESTIGAR\n1. Expectativa criada na venda não se reflete no produto real\n2. Processo longo demais antes do primeiro valor percebido\n3. Cliente não tem clareza do que precisa fazer para ter sucesso\n4. Falta de acompanhamento humano nos momentos críticos\n5. Time de CS não envolvido cedo o suficiente\n\n✦ ONDE FOCAR SEU TEMPO AGORA\n— Mapeie o "first value moment": quando o cliente percebe pela primeira vez que valeu a pena?\n— Reduza o tempo até esse momento — tudo antes é fricção\n— Identifique os clientes que nunca chegaram lá e entenda o porquê\n\n✦ MICRO-PROCESSO PARA ESSA SEMANA\nEscolha 3 clientes que cancelaram nos primeiros 90 dias. Reconstrua a jornada deles: quando a experiência começou a desandar?\n\n✦ PERGUNTA ESTRATÉGICA\n"Meu cliente sabe exatamente o que precisa fazer nos próximos 30 dias para ter sucesso com a gente?"`,

        retencao: `DIAGNÓSTICO — RETENÇÃO\n\n✦ O QUE O NÚMERO ESTÁ DIZENDO\n${indicador.substring(0, 120)}...\nRetenção é o resultado de tudo que aconteceu antes da renovação. Se está baixa, o problema não está na conversa de renovação — está na jornada.\n\n✦ CAUSAS PROVÁVEIS A INVESTIGAR\n1. Valor percebido não acompanhou o preço pago\n2. Ausência de contato proativo — cliente se sentiu sozinho\n3. Mudança de interlocutor no cliente sem transição cuidadosa\n4. Problema não resolvido que ficou esquecido\n5. Concorrente abordou antes de você renovar\n\n✦ ONDE FOCAR SEU TEMPO AGORA\n— Mapeie a frequência de contato com contas próximas de renovar\n— Construa um business review antes da janela de renovação — não depois\n— Identifique o interlocutor real: quem decide a renovação?\n\n✦ MICRO-PROCESSO PARA ESSA SEMANA\nListe todas as renovações dos próximos 60 dias. Para cada conta: qual foi o último contato proativo? Se foi há mais de 30 dias, aja agora.\n\n✦ PERGUNTA ESTRATÉGICA\n"Meu cliente sabe o valor que obteve conosco nesse período — ou só vai lembrar quando eu mostrar na reunião de renovação?"`,
      };

      const texto = analises[foco] || analises.churn;
      setResult(texto);
      const novoHistorico = [{ foco: focoAtual?.label, texto: indicador.substring(0, 50), resultado: texto }, ...historico].slice(0, 5);
      setHistorico(novoHistorico);
      LS.set("cockpit_historico", novoHistorico);
      setLoading(false);
    }, 1100);
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
          <TextArea value={indicador} onChange={e => setIndicador(e.target.value)} rows={4}
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
          <TextArea value={ctx} onChange={e => updateCtx(e.target.value)} rows={3}
            placeholder="O que está acontecendo? O que está pesando mais? Quais são as principais demandas?" />
        </div>

        <BtnPrimary onClick={() => {
          setLoading(true);
          setTimeout(() => { setResult(gerarPriorizacao({ ...dados, contextoSemana: ctx }, tamanhoTime, momentoEmpresa, tipoSemana)); setLoading(false); }, 1000);
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
          <TextArea value={desafio} onChange={e => setDesafio(e.target.value)} rows={4}
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

        <BtnPrimary onClick={() => {
          if (!desafio.trim()) { alert("Descreva a situação."); return; }
          setLoading(true);
          setTimeout(() => { setResult(gerarFeedback(desafio, sev, cargo, tempo, tipoComp, historico)); setLoading(false); }, 1000);
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

  const gerarAnalise = () => {
    if (!problema.trim()) { alert("Descreva o problema primeiro."); return; }
    setLoading(true);

    const gravMap = {
      insatisfeito: { label: "Cliente insatisfeito", urgencia: "moderada", risco: "reputação e relacionamento" },
      travado: { label: "Cliente travado / impedido de operar", urgencia: "MÁXIMA", risco: "operação do cliente comprometida" },
      churn: { label: "Risco real de churn", urgencia: "alta", risco: "perda de receita recorrente" },
      confirmado: { label: "Churn confirmado", urgencia: "pós-crise", risco: "recuperação e aprendizado" },
    };
    const quantosMap = { um: "1 cliente afetado", varios: "múltiplos clientes afetados", sistemico: "problema sistêmico — todos os clientes em risco" };
    const g = gravMap[gravidade];

    const isConfirmado = gravidade === "confirmado";
    const isSistemico = quantos === "sistemico";

    setTimeout(() => {
      setResult(`DIAGNÓSTICO — Urgência ${g.urgencia.toUpperCase()}\n${quantosMap[quantos]} · ${g.label}\n\n✦ O QUE ACONTECEU\n"${problema.substring(0, 180)}${problema.length > 180 ? "..." : ""}"\n\nRisco principal: ${g.risco}. ${isSistemico ? "ATENÇÃO: problema sistêmico — outros clientes provavelmente estão sendo afetados sem ter reportado ainda." : ""}\n\n✦ IMPACTO REAL\n${gravidade === "insatisfeito" ? "O cliente ficou insatisfeito — isso afeta o relacionamento e aumenta o risco de churn futuro. Não é emergência operacional, mas exige resposta humana e ágil. O silêncio aqui é o maior inimigo." : gravidade === "travado" ? "O cliente está impedido de operar — isso é emergência. Cada hora conta. A resposta precisa ser imediata, com um ponto de contato claro e updates frequentes até resolver." : gravidade === "churn" ? "Há risco real de perder essa conta. Neste momento, não tente 'vender' a permanência — entenda o que está por trás. O churn quase nunca é sobre o último problema. É a gota d'água de algo que foi se acumulando." : "O churn foi confirmado. O momento agora é de entender o que aconteceu — não para recuperar essa conta, mas para evitar a próxima. E de sair bem: como o cliente se sente ao sair diz muito sobre a sua marca."}\n\n✦ PONTUAL OU ESTRUTURAL?\n${jaFez ? `O que você já fez: "${jaFez.substring(0, 100)}". ` : ""}${isSistemico ? "Com múltiplos clientes afetados, isso é estrutural. Resolver caso a caso não é suficiente — o processo que gerou isso precisa mudar." : "Antes de concluir que é pontual, pergunte: isso já aconteceu antes, mesmo que de forma diferente? Se sim, é estrutural disfarçado de caso isolado."}\n\n✦ AÇÃO IMEDIATA — PRÓXIMAS ${gravidade === "travado" ? "2 HORAS" : "24 HORAS"}\n${gravidade === "travado" || isSistemico
        ? `1. Acione quem pode resolver tecnicamente AGORA\n2. Comunique o cliente com transparência: "Identificamos o problema, estamos trabalhando. Atualização em X horas."\n3. Defina um único ponto de contato — o cliente não pode ficar sem resposta\n4. Update a cada ${gravidade === "travado" ? "1-2 horas" : "4 horas"} até resolver`
        : gravidade === "confirmado"
        ? `1. Faça uma conversa de saída real — não protocolar. O que você pode aprender?\n2. Garanta que a saída seja boa: o ex-cliente pode ser um promotor ou um detrator\n3. Documente as causas raiz com a equipe\n4. Identifique clientes com perfil similar que podem estar no mesmo caminho`
        : `1. Responda ao cliente com empatia e sem defensividade\n2. Assuma o problema — mesmo que não seja 100% seu\n3. Dê um prazo realista para resolução\n4. Cumpra o prazo ou comunique antes`}\n\n✦ CAUSA RAIZ — DEPOIS DE ESTABILIZAR\nO que precisa mudar para que isso não aconteça novamente? Envolva quem participou da situação — não como punição, como aprendizado. Quando as pessoas enxergam o impacto real no cliente, tomam decisões melhores da próxima vez.\n\n✦ PRINCÍPIO\n"Progresso primeiro. Ordem vem depois." Estabilize agora. Estruture depois. Mas não deixe a estrutura para nunca.`);
      setLoading(false);
    }, 900);
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
          <TextArea value={problema} onChange={e => setProblema(e.target.value)} rows={4}
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
          <TextArea value={jaFez} onChange={e => setJaFez(e.target.value)} rows={2}
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
  useEffect(() => { if (dados?.rawMetricas) setEditDados(dados.rawMetricas); }, [dados]);

  const gerar = () => {
    if (!editDados.trim()) { alert("Adicione seus dados primeiro."); return; }
    setLoading(true);
    setTimeout(() => { setResult(gerarNarrativa({ ...dados, rawMetricas: editDados }, aud, obj, tone, tamanhoTime, momentoEmpresa)); setLoading(false); }, 1000);
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
          <TextArea value={editDados} onChange={e => setEditDados(e.target.value)} rows={5}
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
        <div style={{ height: 24 }} />
      </div>

      <div style={{ background: V.surface, borderTop: `1px solid ${V.border}`, display: "flex", flexShrink: 0 }}>
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
