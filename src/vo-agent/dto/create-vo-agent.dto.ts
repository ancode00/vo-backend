export class CreateVOAgentDto {
  name: string;
  languages: string[]; // ✅ Multiple languages
  style:
    | 'Professional'
    | 'Friendly'
    | 'Casual'
    | 'Formal'
    | 'Enthusiastic'
    | 'Serious'
    | 'Empathic'; // ✅ restricted to styles
  voiceId: string; // ✅ Pick from ElevenLabs

  description?: string;
  knowledgeBase?: string;
  knowledgeBaseData?: string[];
  greeting?: string;
  fallback?: string;
  pauseHandling?: string;
  pauseTimeout?: number;
  endCallPhrases?: string[];
}
