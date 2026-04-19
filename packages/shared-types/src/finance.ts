/**
 * Tipos do domínio financeiro do Nox.
 * Mantenha em sincronia com apps/api/schemas/finance.py.
 */

export type TransactionType = 'debit' | 'credit';

export type SyncStatus = 'active' | 'syncing' | 'error' | 'needs_reconnect';

export type BankAccountType = 'checking' | 'savings' | 'credit_card' | 'investment';

export interface Category {
  id: string;
  userId: string | null;
  name: string;
  icon: string | null;
  color: string | null;
  type: TransactionType;
  parentId: string | null;
  monthlyBudget: number | null;
  isSystem: boolean;
}

export interface BankAccount {
  id: string;
  userId: string;
  pluggyItemId: string;
  pluggyAccountId: string;
  institutionName: string;
  accountType: BankAccountType;
  accountNumberMasked: string | null;
  lastSyncAt: string | null;
  syncStatus: SyncStatus;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  bankAccountId: string;
  pluggyTransactionId: string;
  amount: number;
  description: string;
  merchantName: string | null;
  categoryId: string | null;
  transactionDate: string; // ISO date (YYYY-MM-DD)
  type: TransactionType;
  aiCategoryConfidence: number | null;
  isRecurring: boolean;
  tags: string[];
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  category: string | null;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
}
