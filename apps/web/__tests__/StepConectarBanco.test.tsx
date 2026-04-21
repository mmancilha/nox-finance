import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { StepConectarBanco } from '../app/(dashboard)/onboarding/_components/StepConectarBanco';

const mockFetch = vi.fn();

describe('StepConectarBanco', () => {
  const props = {
    accessToken: 'test-jwt-token',
    onFinish: vi.fn(),
    onSkip: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renderiza estado inicial corretamente', () => {
    render(<StepConectarBanco {...props} />);
    expect(screen.getByRole('button', { name: /Conectar meu banco/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fazer isso depois/i })).toBeInTheDocument();
  });

  it('chama onSkip ao clicar em "Fazer isso depois"', () => {
    render(<StepConectarBanco {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Fazer isso depois/i }));
    expect(props.onSkip).toHaveBeenCalledOnce();
  });

  it('exibe erro quando GET /banks/connect-token falha', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);

    render(<StepConectarBanco {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Conectar meu banco/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Erro ao gerar token de conexão/i);
    });
  });

  it('botões ficam disabled durante loading', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(<StepConectarBanco {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /Conectar meu banco/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Preparando/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Fazer isso depois/i })).toBeDisabled();
    });
  });
});
