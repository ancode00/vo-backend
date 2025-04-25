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
  @UseInterceptors(FileInterceptor('file'))
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

  // ✅ Upload PDF/Word File
  @Post(':id/upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadKnowledgeFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new Error('No file uploaded');
    return this.voAgentService.uploadKnowledgeFile(id, file);
  }

  // ✅ Upload KB from a Web URL
  @Post(':id/upload-url')
  // eslint-disable-next-line prettier/prettier
  async uploadKnowledgeUrl(
    @Param('id') id: string,
    @Body('url') url: string,
  ) {
    return this.voAgentService.uploadKnowledgeUrl(id, url);
  }
}
