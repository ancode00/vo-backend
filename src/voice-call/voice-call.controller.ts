import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Put,
  Patch,
} from '@nestjs/common';
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

  @Patch(':id')
  async updateAndMaybeTranscribe(
    @Param('id') id: string,
    @Body() updateDto: UpdateVoiceCallDto,
  ) {
    const updatedCall = await this.voiceCallService.update(id, updateDto);

    let transcript: string | null = null;
    if (updateDto.recordingUrl) {
      const callWithTranscript = await this.voiceCallService.transcribeCall(id);
      transcript = callWithTranscript?.transcript || null;
    }

    return {
      message: 'Call updated successfully',
      transcript,
      call: updatedCall,
    };
  }

  @Patch(':id/transcribe')
  async manualTranscription(@Param('id') id: string) {
    const call = await this.voiceCallService.transcribeCall(id);
    return {
      message: call
        ? 'Transcript updated'
        : 'Call not found or no recordingUrl',
      transcript: call?.transcript || null,
    };
  }
}
