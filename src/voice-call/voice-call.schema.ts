import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

type SpeakerSegment = {
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

  @Prop()
  recordingUrl: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  duration: number;
}

export const VoiceCallSchema = SchemaFactory.createForClass(VoiceCall);
