import { Module } from '@nestjs/common';
import { VoiceCallModule } from './voice-call/voice-call.module';

@Module({
  imports: [
    VoiceCallModule, // 👈 add this line
  ],
})
export class AppModule {} // 👈 dummy comment to trigger rebuild
