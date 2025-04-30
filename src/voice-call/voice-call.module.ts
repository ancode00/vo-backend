import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceCall, VoiceCallSchema } from './voice-call.schema';
import { VoiceCallService } from './voice-call.service';
import { VoiceCallController } from './voice-call.controller';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: VoiceCall.name, schema: VoiceCallSchema }],
      'mainConnection', // use your current DB connection
    ),
  ],
  controllers: [VoiceCallController],
  providers: [VoiceCallService],
})
export class VoiceCallModule {}
