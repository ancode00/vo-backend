import { Test, TestingModule } from '@nestjs/testing';
import { VoAgentController } from './vo-agent.controller';

describe('VoAgentController', () => {
  let controller: VoAgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoAgentController],
    }).compile();

    controller = module.get<VoAgentController>(VoAgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
