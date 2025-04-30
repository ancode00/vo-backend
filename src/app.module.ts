import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceCallModule } from './voice-call/voice-call.module';

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI!), VoiceCallModule],
})
export class AppModule {}
