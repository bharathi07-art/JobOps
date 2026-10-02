export type EmailAutomationFrequency = 'monthly' | 'yearly' | 'inferred';

export interface EmailAutomationSettings {
  emailAutomationEnabled: boolean;
  emailAutomationMaxResults: number;
  emailAutomationSearchTime: string; // HH:mm
  emailAutomationFrequency: EmailAutomationFrequency;
}

