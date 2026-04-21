'use client';

import { useState } from 'react';

import { formatDate } from '@/lib/format';

import type { AgentInsightData } from '../types';

interface AgentMeta {
  label: string;
  icon: string;
  description: string;
}

interface AgentCardProps {
  agentType: string;
  meta: AgentMeta;
  insight: AgentInsightData | null;
  accessToken: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function AgentCard({ agentType: _agentType, meta, insight, accessToken }: AgentCardProps) {
  const [isRead, setIsRead] = useState(insight?.is_read ?? true);
  const [marking, setMarking] = useState(false);

  const markAsRead = async () => {
    if (!insight || isRead || marking) return;
    setMarking(true);
    try {
      await fetch(`${API_URL}/agents/insights/${insight.id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setIsRead(true);
    } catch {
      // fallback silencioso — UI já atualizada otimisticamente
    } finally {
      setMarking(false);
    }
  };

  const isClickable = Boolean(insight && !isRead);

  return (
    <div
      className="border-nox-border bg-nox-bg2 hover:border-nox-txt3 relative flex flex-col gap-3 rounded-2xl border p-5 transition-colors duration-200"
      onClick={() => void markAsRead()}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) void markAsRead();
      }}
      style={{ cursor: isClickable ? 'pointer' : 'default' }}
    >
      {/* Badge não-lido */}
      {insight && !isRead && (
        <span className="bg-nox-accent absolute right-4 top-4 size-2 rounded-full" />
      )}

      {/* Header do agente */}
      <div className="flex items-center gap-3">
        <span className="bg-nox-bg3 border-nox-border flex size-9 items-center justify-center rounded-xl border text-lg">
          {meta.icon}
        </span>
        <div>
          <p className="text-nox-txt text-[14px] font-semibold leading-none">{meta.label}</p>
          <p className="text-nox-txt3 mt-0.5 text-[13px]">{meta.description}</p>
        </div>
      </div>

      {/* Conteúdo do insight */}
      {insight ? (
        <>
          <div
            className="rounded-xl p-3"
            style={{
              background: 'rgba(240,120,84,0.07)',
              border: '1px solid rgba(240,120,84,0.18)',
            }}
          >
            <p className="text-nox-txt text-[13px] font-light leading-relaxed">{insight.content}</p>
          </div>
          <p className="text-nox-txt3 text-[13px]">{formatDate(insight.created_at)}</p>
        </>
      ) : (
        <div className="border-nox-border rounded-xl border border-dashed p-4 text-center">
          <p className="text-nox-txt3 text-[13px]">Aguardando dados para gerar insights.</p>
        </div>
      )}
    </div>
  );
}
