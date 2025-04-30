import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceCall, VoiceCallSchema } from './voice-call.schema';
import { VoiceCallService } from './voice-call.service';
import { VoiceCallController } from './voice-call.controller';
import { TranscribeService } from './transcribe.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VoiceCall.name, schema: VoiceCallSchema },
    ]),
  ],
  controllers: [VoiceCallController],
  providers: [VoiceCallService, TranscribeService],
  exports: [VoiceCallService], // Optional: Export if needed by other modules
})
export class VoiceCallModule {}
