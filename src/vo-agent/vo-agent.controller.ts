import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoAgentService } from './vo-agent.service';
import { CreateVOAgentDto } from './dto/create-vo-agent.dto';
import { UpdateVOAgentDto } from './dto/update-vo-agent.dto';

@Controller('voice-agent')
export class VoAgentController {
  constructor(private readonly voAgentService: VoAgentService) {}

  // Create agent with optional file upload
  @Post()
  @UseInterceptors(FileInterceptor('knowledgeBaseData'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateVOAgentDto,
  ) {
    return this.voAgentService.create(createDto, file);
  }

  // Get all agents
  @Get()
  findAll() {
    return this.voAgentService.findAll();
  }

  // Create agent with file explicitly (alt route)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async createWithFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateVOAgentDto,
  ) {
    return this.voAgentService.create(createDto, file);
  }

  // Create agent without file, possibly with URL
  @Post('url')
  async createWithUrl(@Body() createDto: CreateVOAgentDto) {
    return this.voAgentService.create(createDto);
  }

  // Fetch dynamic voice config (languages, voices, etc.)
  @Get('voice-config')
  async getVoiceConfig() {
    return this.voAgentService.getVoiceConfig();
  }

  // Get static fallback config
  @Get('default-voice-config')
  getDefaultVoiceConfig() {
    return this.voAgentService.getDefaultVoiceConfig();
  }

  // Clone a new voice using uploaded audio
  @Post('clone-voice')
  @UseInterceptors(FileInterceptor('file'))
  async cloneVoice(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    return this.voAgentService.cloneVoice(file, name);
  }

  // Get agent by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voAgentService.findOne(id);
  }

  // Update agent by ID
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateVOAgentDto) {
    return this.voAgentService.update(id, updateDto);
  }

  // Delete agent by ID
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.voAgentService.remove(id);
  }
}
