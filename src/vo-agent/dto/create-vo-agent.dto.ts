export class CreateVOAgentDto {
  name: string;
  language: string;
  style: string; // Voice style: Professional, Friendly, Casual, etc.
  voiceId?: string; // ✅ Made optional to avoid validation error during initial creation

  description?: string;
  knowledgeBase?: string;
  knowledgeBaseData?: string[];
  greeting?: string;
  fallback?: string;
  pauseHandling?: string;
  pauseTimeout?: number;
  endCallPhrases?: string[];
}
