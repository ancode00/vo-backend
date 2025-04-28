export class CreateVOAgentDto {
  name: string;
  languages: string[]; // ✅ Accepts multiple languages now

  style:
    | 'Professional'
    | 'Friendly'
    | 'Casual'
    | 'Formal'
    | 'Enthusiastic'
    | 'Serious'
    | 'Empathic'; // ✅ Voice style choice

  voiceId: string; // ✅ ElevenLabs voice ID

  description?: string;
  knowledgeBase?: string;
  knowledgeBaseData?: string[];
  greeting?: string;
  fallback?: string;
  pauseHandling?: string;
  pauseTimeout?: number;
  endCallPhrases?: string[];

  systemPrompt?: string; // ✅ Added for system-level behavior instructions
  behavioralPrompt?: string; // ✅ Added for user-facing behavior instructions
}
