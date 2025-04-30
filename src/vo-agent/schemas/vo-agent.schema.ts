import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class VOAgent extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ type: [String], required: true }) languages: string[];
  @Prop({
    required: true,
    enum: [
      'Professional',
      'Friendly',
      'Casual',
      'Formal',
      'Enthusiastic',
      'Serious',
      'Empathic',
    ],
  })
  style: string;
  @Prop({ required: true }) voiceId: string;

  @Prop() description: string;
  @Prop({ default: 'none' }) knowledgeBase: string;
  @Prop({ type: [String], default: [] }) knowledgeBaseData: string[];
  @Prop({ default: 'Hello, how can I assist you today?' }) greeting: string;
  @Prop({
    default: "I'm sorry, I didn't understand that. Could you please rephrase?",
  })
  fallback: string;
  @Prop({ default: 'default' }) pauseHandling: string;
  @Prop({ default: 5 }) pauseTimeout: number;
  @Prop({ type: [String], default: ['goodbye', 'bye', 'end call'] })
  endCallPhrases: string[];

  @Prop() behavioralPrompt: string; // ✅ 🆕 added
}

export const VOAgentSchema = SchemaFactory.createForClass(VOAgent);
