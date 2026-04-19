/**
 * Tipos relativos aos 4 agentes do Nox.
 * Mantenha em sincronia com apps/api/schemas/agents.py.
 */

export const AGENT_NAMES = ['sentinela', 'oraculo', 'norte', 'companheiro'] as const;
export type AgentName = (typeof AGENT_NAMES)[number];

export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

export type InsightType =
  | 'duplicate_charge'
  | 'anomaly'
  | 'forgotten_subscription'
  | 'goal_progress'
  | 'budget_overrun'
  | 'weekly_summary'
  | 'monthly_forecast'
  | 'savings_opportunity';

export interface Insight {
  id: string;
  userId: string;
  agentName: AgentName;
  type: InsightType;
  title: string;
  description: string;
  priority: InsightPriority;
  isRead: boolean;
  actionUrl: string | null;
  dataJson: Record<string, unknown>;
  generatedAt: string; // ISO 8601
}

export interface AgentConfig {
  id: string;
  userId: string;
  agentName: AgentName;
  isEnabled: boolean;
  monthlyTokenBudget: number;
  tokensUsedThisMonth: number;
  lastRunAt: string | null;
  settings: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed: number | null;
  createdAt: string;
}
