export class CreateVoiceCallDto {
  agentId: string;
  phoneNumber: string;
  status?: 'Live' | 'Completed' | 'Failed' | 'Retried'; // Optional, defaults to Live
  transcript?: string;
  recordingUrl?: string;
  retryCount?: number;
  duration?: number;
}
