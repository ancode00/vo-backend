import { PartialType } from '@nestjs/mapped-types';
import { CreateVOAgentDto } from './create-vo-agent.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateVOAgentDto extends PartialType(CreateVOAgentDto) {}
