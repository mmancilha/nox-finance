import { FaqAccordion, type FaqItemData } from '@/components/marketing/FaqAccordion';
import { Button } from '@/components/ui/Button';

const faqItems: FaqItemData[] = [
  {
    question: 'O Nox é seguro? Preciso compartilhar minha senha do banco?',
    answer:
      'Não, nunca. O Nox usa o Open Finance, protocolo regulamentado pelo Banco Central, que permite leitura das suas transações sem que você precise compartilhar nenhuma senha. É o mesmo nível de segurança que os apps dos próprios bancos usam.',
  },
  {
    question: 'O Nox consegue fazer transferências ou pagamentos?',
    answer:
      'Não. O Nox tem acesso apenas de leitura às suas contas. Ele vê, analisa e te informa, mas não movimenta nenhum centavo. Isso é por design: separamos completamente a inteligência financeira da movimentação de dinheiro.',
  },
  {
    question: 'Quais bancos são compatíveis?',
    answer:
      'Todos que aderiram ao Open Finance Brasil, incluindo Nubank, Itaú, Bradesco, Santander, Banco do Brasil, Caixa, C6 Bank, Inter, BTG, XP, e mais de 200 outras instituições. A lista cresce conforme o Banco Central expande o programa.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim, sem burocracia. Planos mensais cancelam no fim do mês vigente. Planos anuais têm garantia de 30 dias, se não gostar, devolvemos o valor integral. Você também pode pedir exclusão completa dos seus dados a qualquer momento.',
  },
  {
    question: 'Como funciona a IA do Nox?',
    answer:
      'A IA analisa seus padrões de gastos ao longo do tempo e gera insights personalizados, não genéricos. Ela identifica anomalias (cobranças duplicadas, gastos acima da média), projeta tendências e responde perguntas em linguagem natural. Quanto mais você usa, mais ela aprende sobre você.',
  },
  {
    question: 'Tem versão para desktop também?',
    answer:
      'Sim! O Nox tem app mobile (iOS e Android) e versão web completa. Tudo sincronizado em tempo real. Você pode usar onde preferir, mas a maioria dos usuários acaba preferindo o mobile pela praticidade.',
  },
  {
    question: 'O plano grátis tem limite de uso?',
    answer:
      'O plano Básico conecta 1 conta bancária e mantém histórico de 3 meses, para sempre, sem custo. Não tem limite de transações dentro dessa conta. Para múltiplas contas, histórico completo e IA avançada, você precisa do Pro ou Premium.',
  },
];

const steps = [
  {
    title: 'Conecte pelo Open Finance',
    description:
      'Autorize suas instituições com o protocolo regulado pelo Banco Central. Sem compartilhar senha, só consentimento seguro.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="text-nox-accent h-10 w-10" aria-hidden>
        <rect x="8" y="14" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M16 22h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Eu organizo e monitoro 24h',
    description:
      'Categorização automática dos gastos e detecção de padrões enquanto você vive, sem planilha e sem esforço manual.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="text-nox-accent h-10 w-10" aria-hidden>
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" />
        <path d="M24 16v10l7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Alertas antes da surpresa',
    description:
      'Insights e avisos no momento certo: cobranças duplicadas, estouro de orçamento e oportunidades de economia.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="text-nox-accent h-10 w-10" aria-hidden>
        <path
          d="M14 30c0-8 4-14 10-18 6 4 10 10 10 18v4H14v-4z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M20 34h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const agents = [
  {
    name: 'Sentinela',
    badge: 'Tempo real',
    description:
      'Detecta gastos anômalos, cobranças duplicadas e assinaturas esquecidas sempre que uma nova transação chega.',
  },
  {
    name: 'Oráculo',
    badge: 'Semanal · domingo 20h',
    description:
      'Análise mensal, padrões de gastos e previsão do fechamento, o bastidor que antecipa o mês.',
  },
  {
    name: 'Norte',
    badge: 'Diário · 8h',
    description:
      'Monitora suas metas e orçamentos e avisa quando o ritmo não fecha com o que você planejou.',
  },
  {
    name: 'Companheiro',
    badge: 'Sob demanda',
    description:
      'Chat em linguagem natural para perguntas do dia a dia, direto, amigo e sempre em português.',
  },
] as const;

export default function MarketingHomePage() {
  return (
    <main className="bg-nox-bg text-nox-txt">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-32 md:pb-28 md:pt-40">
        <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />
        <div className="relative z-[1] mx-auto max-w-4xl text-center">
          <div className="rounded-pill mb-7 inline-flex items-center gap-2 border border-[color:var(--accent-soft-border)] bg-[color:var(--accent-soft-bg)] px-3.5 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="bg-nox-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              <span className="bg-nox-accent relative inline-flex h-1.5 w-1.5 rounded-full" />
            </span>
            <span className="text-label text-nox-accent uppercase">
              Agentes financeiros autônomos
            </span>
          </div>

          <h1 className="text-h1 text-nox-txt md:text-hero font-extrabold tracking-tight">
            Enquanto você dorme,
            <br />
            eu cuido do seu dinheiro.
          </h1>

          <p className="text-body text-nox-txt2 mx-auto mt-8 max-w-xl font-light">
            Conecta suas contas, entendo seus padrões e te aviso antes do problema aparecer. Sem
            planilha, sem esforço.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/cadastro" variant="primary" size="lg">
              Começar agora
            </Button>
            <Button href="#como-funciona" variant="ghost" size="lg">
              Ver como funciona
            </Button>
          </div>

          <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div className="flex -space-x-2">
              <span className="border-nox-bg bg-nox-accent inline-block h-8 w-8 rounded-full border-2" />
              <span className="border-nox-bg bg-nox-txt inline-block h-8 w-8 rounded-full border-2" />
              <span className="border-nox-bg bg-nox-txt2 inline-block h-8 w-8 rounded-full border-2" />
              <span className="border-nox-bg bg-nox-txt3 inline-block h-8 w-8 rounded-full border-2" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-caption text-nox-accent tracking-wider">★★★★★</p>
              <p className="text-caption text-nox-txt3">
                Mais de 2.400 usuários já conectaram seus bancos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section
        id="como-funciona"
        className="border-nox-border2 scroll-mt-24 border-t px-6 py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <span className="text-label text-nox-accent mb-4 block uppercase">Como funciona</span>
          <h2 className="text-h2 text-nox-txt font-extrabold tracking-tight">
            Três passos. Zero fricção.
          </h2>
          <p className="text-body text-nox-txt2 mt-4 max-w-2xl font-light">
            Do consentimento ao insight, tudo automático, no ritmo da sua vida.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.title}
                className="border-nox-border bg-nox-bg2 hover:border-nox-border rounded-2xl border p-6 transition-colors"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-h3 text-nox-txt font-bold">{step.title}</h3>
                <p className="text-body text-nox-txt2 mt-3 font-light">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Agentes */}
      <section
        id="agentes"
        className="border-nox-border2 scroll-mt-24 border-t px-6 py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <span className="text-label text-nox-accent mb-4 block uppercase">Os 4 agentes</span>
          <h2 className="text-h2 text-nox-txt font-extrabold tracking-tight">
            Um time trabalhando enquanto você descansa.
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {agents.map((agent) => (
              <article
                key={agent.name}
                className="border-nox-border bg-nox-bg2 rounded-2xl border p-6"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="text-h3 text-nox-txt font-bold">{agent.name}</h3>
                  <span className="rounded-pill border-nox-border2 bg-nox-bg text-caption text-nox-txt2 border px-3 py-1">
                    {agent.badge}
                  </span>
                </div>
                <p className="text-body text-nox-txt2 font-light">{agent.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="border-nox-border2 scroll-mt-24 border-t px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <span className="text-label text-nox-accent mb-4 block uppercase">Preços</span>
          <h2 className="text-h2 text-nox-txt font-extrabold tracking-tight">
            Simples. Transparente. Sem surpresa na fatura.
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Grátis */}
            <article className="border-nox-border2 bg-nox-bg2 flex flex-col rounded-2xl border p-8">
              <p className="text-label text-nox-txt3 uppercase">Grátis</p>
              <p className="text-nox-txt mt-4 text-[52px] font-extrabold leading-none tracking-tight">
                R$0
              </p>
              <p className="text-caption text-nox-txt3 mt-2">Para começar sem cartão</p>
              <ul className="text-body text-nox-txt2 mt-8 flex flex-1 flex-col gap-3 font-light">
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> 1 banco conectado
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> 1 agente (Companheiro)
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> 3 meses de histórico
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> 30 mensagens/mês no chat
                </li>
              </ul>
              <Button href="/cadastro" variant="ghost" className="mt-8 w-full">
                Começar grátis
              </Button>
            </article>

            {/* Pro */}
            <article className="border-nox-accent bg-nox-bg2 shadow-nav relative flex flex-col rounded-2xl border-2 p-8">
              <p className="text-label text-nox-accent uppercase">Pro</p>
              <p className="text-nox-txt mt-4 text-[52px] font-extrabold leading-none tracking-tight">
                R$29
                <span className="text-h3 text-nox-txt2 align-top">/mês</span>
              </p>
              <p className="text-caption text-nox-txt3 mt-2">O equilíbrio para quem leva a sério</p>
              <ul className="text-body text-nox-txt2 mt-8 flex flex-1 flex-col gap-3 font-light">
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> 5 bancos conectados
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> 3 agentes ativos
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> 24 meses de histórico
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> Chat ilimitado com o Companheiro
                </li>
              </ul>
              <Button href="/cadastro" variant="primary" className="mt-8 w-full">
                Assinar Pro
              </Button>
            </article>

            {/* Premium */}
            <article className="border-nox-border2 bg-nox-bg2 flex flex-col rounded-2xl border p-8">
              <p className="text-label text-nox-txt3 uppercase">Premium</p>
              <p className="text-nox-txt mt-4 text-[52px] font-extrabold leading-none tracking-tight">
                R$89
                <span className="text-h3 text-nox-txt2 align-top">/mês</span>
              </p>
              <p className="text-caption text-nox-txt3 mt-2">Poder total + canais extras</p>
              <ul className="text-body text-nox-txt2 mt-8 flex flex-1 flex-col gap-3 font-light">
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> Bancos ilimitados
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> 4 agentes + customização
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> Histórico ilimitado
                </li>
                <li className="flex gap-2">
                  <span className="text-nox-accent">✓</span> Notificações via WhatsApp
                </li>
              </ul>
              <Button href="/cadastro" variant="ghost" className="mt-8 w-full">
                Falar com vendas
              </Button>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-nox-border2 scroll-mt-24 border-t px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-pill text-label text-nox-accent mb-6 inline-flex items-center gap-2 border border-[color:var(--accent-soft-border)] bg-[color:var(--accent-soft-bg)] px-3.5 py-1.5 uppercase">
            FAQ
          </div>
          <h2 className="text-h2 text-nox-txt font-extrabold tracking-tight">
            Perguntas
            <br />
            frequentes.
          </h2>
          <div className="mt-12">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>
    </main>
  );
}
