import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class VoiceCall extends Document {
  @Prop({ required: true }) agentId: string;
  @Prop({ required: true }) phoneNumber: string;
  @Prop({ enum: ['Live', 'Completed', 'Failed', 'Retried'], default: 'Live' })
  status: string;
  @Prop() transcript: string; // Store transcript text
  @Prop() recordingUrl: string; // Audio file URL
  @Prop({ default: 0 }) retryCount: number;
  @Prop() duration: number; // In seconds
}

export const VoiceCallSchema = SchemaFactory.createForClass(VoiceCall);
