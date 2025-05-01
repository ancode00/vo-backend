import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceCallModule } from './voice-call/voice-call.module';
import { VoAgentModule } from './vo-agent/vo-agent.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    VoiceCallModule,
    VoAgentModule,
  ],
})
export class AppModule {}
