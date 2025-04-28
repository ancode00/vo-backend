export class CreateVOAgentDto {
  name: string;
  languages: string[];
  style:
    | 'Professional'
    | 'Friendly'
    | 'Casual'
    | 'Formal'
    | 'Enthusiastic'
    | 'Serious'
    | 'Empathic';
  voiceId: string;

  description?: string;
  knowledgeBase?: string;
  knowledgeBaseData?: string[];
  greeting?: string;
  fallback?: string;
  pauseHandling?: string;
  pauseTimeout?: number;
  endCallPhrases?: string[];
  systemPrompt?: string; // ✅ 🆕 New addition
  behavioralPrompt?: string; // ✅ 🆕 New addition
}
