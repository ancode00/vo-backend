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

  // ✅ Route for Big Voice Config (voice styles + 11Labs)
  @Get('voice-config')
  async getVoiceConfig() {
    return this.voAgentService.getVoiceConfig();
  }

  // ✅ Route for Default Voice Config (your simple one)
  @Get('default-voice-config')
  getDefaultVoiceConfig() {
    return this.voAgentService.getDefaultVoiceConfig();
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
