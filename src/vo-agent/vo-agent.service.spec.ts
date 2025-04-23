import { Test, TestingModule } from '@nestjs/testing';
import { VoAgentService } from './vo-agent.service';

describe('VoAgentService', () => {
  let service: VoAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VoAgentService],
    }).compile();

    service = module.get<VoAgentService>(VoAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
