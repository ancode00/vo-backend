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

  @Post()
  @UseInterceptors(FileInterceptor('knowledgeBaseData'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateVOAgentDto,
  ) {
    return this.voAgentService.create(createDto, file);
  }

  @Get()
  findAll() {
    return this.voAgentService.findAll();
  }

  // ✨ Move this route ABOVE dynamic ID route
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async createWithFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateVOAgentDto,
  ) {
    return this.voAgentService.create(createDto, file);
  }

  @Post('url')
  async createWithUrl(@Body() createDto: CreateVOAgentDto) {
    return this.voAgentService.create(createDto);
  }

  // ✨ Added new /voice-style API
  @Post('voice-style')
  async getVoiceStyles() {
    return this.voAgentService.getVoiceStylesAndVoices();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voAgentService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateVOAgentDto) {
    return this.voAgentService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.voAgentService.remove(id);
  }
}
