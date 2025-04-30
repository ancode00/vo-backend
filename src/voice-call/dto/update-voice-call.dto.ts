export class UpdateVoiceCallDto {
  status?: 'Live' | 'Completed' | 'Failed' | 'Retried';
  transcript?: string;
  recordingUrl?: string;
  retryCount?: number;
  duration?: number;
}
