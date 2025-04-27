export class CreateVOAgentDto {
  name: string;
  language: string;
  style: string; // Voice style: Professional, Friendly, Casual, etc.
  voiceId: string; // ElevenLabs Voice ID: Rachel, Bella, etc.

  description?: string;
  knowledgeBase?: string;
  knowledgeBaseData?: string[];
  greeting?: string;
  fallback?: string;
  pauseHandling?: string;
  pauseTimeout?: number;
  endCallPhrases?: string[];
}
