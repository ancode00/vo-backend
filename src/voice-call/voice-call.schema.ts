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
    enum: ['Live', 'Completed', 'Failed', 'Retried'],
    default: 'Live',
  })
  status: string;

  @Prop({
    type: {
      summary: { type: String },
      speakers: [
        {
          text: { type: String },
          speaker: { type: String },
          start: { type: Number },
          end: { type: Number },
        },
      ],
      silence: { type: [Object] },
      sentiment: { type: [Object] },
      crosstalk: { type: [Object] },
    },
    default: null,
  })
  transcript: TranscriptData | null;

  @Prop({ type: Object, default: null })
  insights?: TranscriptInsights | null;

  @Prop()
  recordingUrl: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  duration: number;
}

export const VoiceCallSchema = SchemaFactory.createForClass(VoiceCall);
