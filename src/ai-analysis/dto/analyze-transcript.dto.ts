import { IsString } from 'class-validator';

export class AnalyzeTranscriptDto {
  @IsString()
  transcript: string;
}
