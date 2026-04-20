export type RiskProfile = 'conservador' | 'moderado' | 'arrojado';

export interface OnboardingData {
  preferredName?: string;
  avatarEmoji?: string;
  goalName?: string;
  goalAmount?: number;
  goalDeadline?: string;
  riskProfile?: RiskProfile;
  skipBankConnection?: boolean;
}
