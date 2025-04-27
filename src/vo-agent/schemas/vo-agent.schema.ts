import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class VOAgent extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ type: [String], required: true }) languages: string[]; // ✅ multiple languages
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
  style: string; // ✅ only allowed styles
  @Prop({ required: true }) voiceId: string; // ✅ picked from 11Labs

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
}

export const VOAgentSchema = SchemaFactory.createForClass(VOAgent);
