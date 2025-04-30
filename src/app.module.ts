import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceCallModule } from './voice-call/voice-call.module';
import { VoAgentModule } from './vo-agent/vo-agent.module'; // ✅ Import this

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    VoiceCallModule,
    VoAgentModule, // ✅ Register this module
  ],
})
export class AppModule {}
