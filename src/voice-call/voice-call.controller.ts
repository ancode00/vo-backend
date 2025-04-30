import { Controller, Get, Post, Param, Body, Query, Put } from '@nestjs/common';
import { VoiceCallService } from './voice-call.service';
import { CreateVoiceCallDto } from './dto/create-voice-call.dto';
import { UpdateVoiceCallDto } from './dto/update-voice-call.dto';

@Controller('voice-calls')
export class VoiceCallController {
  constructor(private readonly voiceCallService: VoiceCallService) {}

  @Post()
  create(@Body() createDto: CreateVoiceCallDto) {
    return this.voiceCallService.create(createDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    if (status) {
      return this.voiceCallService.findByStatus(status);
    }
    return this.voiceCallService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.voiceCallService.findOne(id);
  }

  @Put(':id/update-status')
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateVoiceCallDto) {
    return this.voiceCallService.updateStatus(id, updateDto);
  }
}
