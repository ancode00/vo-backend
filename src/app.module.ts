import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { VoAgentModule } from './vo-agent/vo-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI as string, {
      connectionName: 'mainConnection',
    }),
    VoAgentModule,
  ],
})
export class AppModule {}
