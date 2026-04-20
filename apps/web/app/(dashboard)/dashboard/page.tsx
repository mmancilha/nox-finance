import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { greetingFromHour } from '@/lib/format';

import { AgentCard } from './_components/AgentCard';
import { CompanheiroChat } from './_components/CompanheiroChat';

export interface AgentInsightData {
  id: string;
  agent_type: 'sentinela' | 'oraculo' | 'norte' | 'companheiro';
  content: string;
  tokens_used: number;
  model_used: string;
  metadata_json: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

const AGENT_META = {
  sentinela: { label: 'Sentinela', icon: '🔰', description: 'Vigilância em tempo real' },
  oraculo: { label: 'Oráculo', icon: '🔮', description: 'Análise semanal' },
  norte: { label: 'Norte', icon: '🧭', description: 'Coach diário' },
} as const;

async function fetchInsights(accessToken: string): Promise<AgentInsightData[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents/insights?limit=12`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as AgentInsightData[];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/entrar');

  const firstName =
    session.user.name?.split(' ')[0] ?? session.user.email?.split('@')[0] ?? 'por aí';

  const hour = new Date().getHours();
  const greeting = greetingFromHour(hour);

  const allInsights = await fetchInsights(session.accessToken);

  const agentTypes = ['sentinela', 'oraculo', 'norte'] as const;

  const latestByAgent = agentTypes.map((type) => ({
    type,
    insight: allInsights.find((i) => i.agent_type === type) ?? null,
  }));

  return (
    <main className="bg-nox-bg text-nox-txt min-h-screen">
      {/* Header */}
      <div className="border-nox-border border-b px-6 py-5 md:px-10">
        <p className="text-nox-accent mb-1 text-[11px] font-medium uppercase tracking-widest">
          {greeting}
        </p>
        <h1 className="text-[36px] font-extrabold leading-tight tracking-[-0.03em]">
          {firstName} 👋
        </h1>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        {/* Seção dos 3 agentes de background */}
        <section className="mb-10">
          <h2 className="text-nox-txt3 mb-4 text-[11px] font-medium uppercase tracking-widest">
            Agentes ativos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {latestByAgent.map(({ type, insight }) => (
              <AgentCard
                key={type}
                agentType={type}
                meta={AGENT_META[type]}
                insight={insight}
                accessToken={session.accessToken}
              />
            ))}
          </div>
        </section>

        {/* Companheiro — chat */}
        <section>
          <h2 className="text-nox-txt3 mb-4 text-[11px] font-medium uppercase tracking-widest">
            💬 Companheiro
          </h2>
          <CompanheiroChat accessToken={session.accessToken} />
        </section>
      </div>
    </main>
  );
}
