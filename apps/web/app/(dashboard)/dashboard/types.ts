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
