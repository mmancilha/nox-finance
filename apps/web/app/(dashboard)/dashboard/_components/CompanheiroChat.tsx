'use client';

import { useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

interface CompanheiroChatProps {
  accessToken: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function CompanheiroChat({ accessToken }: CompanheiroChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o Companheiro, seu assistente financeiro. Como posso te ajudar hoje?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Substitui o último item da lista sem acessar por índice (noUncheckedIndexedAccess)
  const replaceLast = (msgs: Message[], next: Message): Message[] =>
    msgs.length > 0 ? [...msgs.slice(0, -1), next] : msgs;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const history = messages.slice(-10).map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsStreaming(true);

    // Placeholder do assistente — vai sendo preenchido pelo streaming
    setMessages((prev) => [...prev, { role: 'assistant', content: '', streaming: true }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_URL}/agents/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message: text, history }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('Resposta inválida');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const lines = raw.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data) as { content: string };
            fullContent += parsed.content;
            setMessages((prev) =>
              replaceLast(prev, {
                role: 'assistant',
                content: fullContent,
                streaming: true,
              }),
            );
          } catch {
            // chunk malformado — ignorar
          }
        }
      }

      // Finaliza: remove a flag streaming
      setMessages((prev) => replaceLast(prev, { role: 'assistant', content: fullContent }));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessages((prev) =>
        replaceLast(prev, {
          role: 'assistant',
          content: 'Desculpe, tive um problema técnico. Tente novamente.',
        }),
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div
      className="border-nox-border bg-nox-bg2 flex flex-col rounded-2xl border"
      style={{ height: '420px' }}
    >
      {/* Mensagens */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <span className="mr-2 mt-1 shrink-0 text-base">🌙</span>}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] font-light leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-nox-accent text-nox-bg rounded-br-sm font-medium'
                  : 'bg-nox-bg3 text-nox-txt rounded-bl-sm'
              }`}
            >
              {msg.content}
              {msg.streaming === true && (
                <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-current opacity-70" />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-nox-border border-t p-4">
        <div className="border-nox-border bg-nox-bg3 focus-within:border-nox-accent flex items-end gap-3 rounded-xl border px-4 py-3 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre suas finanças..."
            rows={1}
            disabled={isStreaming}
            className="text-nox-txt placeholder:text-nox-txt3 flex-1 resize-none bg-transparent text-[15px] font-light outline-none disabled:opacity-50"
            style={{ maxHeight: '100px' }}
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!input.trim() || isStreaming}
            className="bg-nox-accent text-nox-bg flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar mensagem"
          >
            ↑
          </button>
        </div>
        <p className="text-nox-txt3 mt-2 text-center text-[13px]">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
