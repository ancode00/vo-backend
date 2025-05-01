import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpeakerSegment = {
  text: string;
  speaker: string;
  start: number;
  end: number;
};

export type TranscriptData = {
  summary: string;
  speakers: SpeakerSegment[];
  silence: any[];
  sentiment: any[];
  crosstalk: any[];
};

export type TranscriptInsights = {
  escalation: 'Low' | 'Medium' | 'High';
  csat: 'Positive' | 'Neutral' | 'Negative';
  vulnerable: boolean;
  redFlags: string[];
};

@Schema({ timestamps: true })
export class VoiceCall extends Document {
  @Prop({ required: true })
  agentId: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({
    enum: ['Live', 'Completed', 'Failed', 'Retried', 'Voicemail'], // ✅ added 'Voicemail'
    default: 'Live',
  })
  status: string;

  @Prop({ type: Object, default: null })
  transcript: TranscriptData | null;

  @Prop({ type: Object, default: null })
  insights?: TranscriptInsights | null;

  @Prop()
  recordingUrl: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  duration: number;

  @Prop() // ✅ optional but useful
  endedAt?: Date;
}

export const VoiceCallSchema = SchemaFactory.createForClass(VoiceCall);
