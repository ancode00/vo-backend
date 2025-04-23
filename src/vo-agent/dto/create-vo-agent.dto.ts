export class CreateVOAgentDto {
  name: string;
  language: string;
  style: string;
  description?: string;
  knowledgeBase?: string;
  knowledgeBaseData?: string[];
  greeting?: string;
  fallback?: string;
  pauseHandling?: string;
  pauseTimeout?: number;
  endCallPhrases?: string[];
}
