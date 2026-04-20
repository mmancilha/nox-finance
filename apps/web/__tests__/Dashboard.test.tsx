import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentCard } from '../app/(dashboard)/dashboard/_components/AgentCard';
import { CompanheiroChat } from '../app/(dashboard)/dashboard/_components/CompanheiroChat';
import type { AgentInsightData } from '../app/(dashboard)/dashboard/page';

// ── AgentCard ─────────────────────────────────────────────────────────────

describe('AgentCard', () => {
  const baseMeta = {
    label: 'Sentinela',
    icon: '🔰',
    description: 'Vigilância em tempo real',
  };

  it('renderiza empty state quando insight é null', () => {
    render(<AgentCard agentType="sentinela" meta={baseMeta} insight={null} accessToken="tok" />);
    expect(screen.getByText(/aguardando dados/i)).toBeInTheDocument();
  });

  it('renderiza conteúdo do insight quando presente', () => {
    const insight: AgentInsightData = {
      id: '1',
      agent_type: 'sentinela',
      content: 'Notei uma duplicata',
      tokens_used: 10,
      model_used: 'gpt-4o-mini',
      metadata_json: null,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    render(<AgentCard agentType="sentinela" meta={baseMeta} insight={insight} accessToken="tok" />);
    expect(screen.getByText('Notei uma duplicata')).toBeInTheDocument();
  });

  it('não exibe badge quando insight já está lido', () => {
    const insight: AgentInsightData = {
      id: '2',
      agent_type: 'norte',
      content: 'Você está no caminho certo!',
      tokens_used: 5,
      model_used: 'gpt-4o-mini',
      metadata_json: null,
      is_read: true,
      created_at: new Date().toISOString(),
    };
    const { container } = render(
      <AgentCard agentType="norte" meta={baseMeta} insight={insight} accessToken="tok" />,
    );
    // Badge é um span com bg-nox-accent — não deve existir se is_read=true
    expect(container.querySelector('.bg-nox-accent.size-2')).toBeNull();
  });
});

// ── CompanheiroChat ────────────────────────────────────────────────────────

describe('CompanheiroChat', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('renderiza a mensagem inicial do Companheiro', () => {
    render(<CompanheiroChat accessToken="tok" />);
    expect(screen.getByText(/sou o companheiro/i)).toBeInTheDocument();
  });

  it('input fica desabilitado durante streaming', async () => {
    // fetch nunca resolve (simula streaming infinito)
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    render(<CompanheiroChat accessToken="tok" />);
    const textarea = screen.getByPlaceholderText(/pergunte/i);

    fireEvent.change(textarea, { target: { value: 'oi' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(textarea).toBeDisabled();
    });
  });

  it('exibe mensagem do usuário imediatamente ao enviar', async () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => {}));

    render(<CompanheiroChat accessToken="tok" />);
    const textarea = screen.getByPlaceholderText(/pergunte/i);

    fireEvent.change(textarea, { target: { value: 'Qual meu gasto esse mês?' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Qual meu gasto esse mês?')).toBeInTheDocument();
    });
  });

  it('não envia quando input está vazio', () => {
    render(<CompanheiroChat accessToken="tok" />);
    const btn = screen.getByRole('button', { name: /enviar mensagem/i });
    expect(btn).toBeDisabled();
  });
});
