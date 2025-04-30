import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VOAgent, VOAgentSchema } from './schemas/vo-agent.schema';
import { VoAgentController } from './vo-agent.controller';
import { VoAgentService } from './vo-agent.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VOAgent.name, schema: VOAgentSchema }]),
  ],
  controllers: [VoAgentController],
  providers: [VoAgentService],
})
export class VoAgentModule {}
