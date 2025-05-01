import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceCall, VoiceCallSchema } from './voice-call.schema';
import { VoiceCallService } from './voice-call.service';
import { VoiceCallController } from './voice-call.controller';
import { TranscribeService } from './transcribe.service';
import { AssemblyService } from './assembly.service'; // ✅ Added
import { AiAnalysisService } from '../ai-analysis/ai-analysis.service'; // ✅ Added

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VoiceCall.name, schema: VoiceCallSchema },
    ]),
  ],
  controllers: [VoiceCallController],
  providers: [
    VoiceCallService,
    TranscribeService,
    AssemblyService, // ✅ Transcription & diarization
    AiAnalysisService, // ✅ AI insights (CSAT, escalation, etc.)
  ],
  exports: [VoiceCallService], // Optional: used if other modules consume it
})
export class VoiceCallModule {}
