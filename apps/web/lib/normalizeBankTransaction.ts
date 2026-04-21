/** Normaliza resposta da API de transações (campos Pluggy / SQLAlchemy → UI). */

export type NormalizedTransaction = {
  id: string;
  description: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category_name: string | null;
  date: string;
  merchant_name: string | null;
};

export type BankTransactionApi = {
  id: string;
  amount: number | string;
  description?: string | null;
  merchant_name?: string | null;
  transaction_date?: string;
  date?: string;
  type: string;
  category_name?: string | null;
  tags?: string[];
};

export function normalizeBankTransaction(tx: BankTransactionApi): NormalizedTransaction {
  const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount);
  const description =
    (tx.description ?? tx.merchant_name ?? 'Sem descrição').trim() || 'Sem descrição';
  const rawDate = tx.transaction_date ?? tx.date ?? '';
  const dateStr = typeof rawDate === 'string' ? rawDate : String(rawDate);
  const date = dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;

  return {
    id: String(tx.id),
    description,
    amount: Number.isFinite(amount) ? amount : 0,
    type: tx.type === 'CREDIT' ? 'CREDIT' : 'DEBIT',
    category_name: tx.category_name ?? (tx.tags?.[0] ? String(tx.tags[0]) : null),
    date,
    merchant_name: tx.merchant_name ?? null,
  };
}
