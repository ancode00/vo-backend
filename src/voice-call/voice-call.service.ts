import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoiceCall } from './voice-call.schema';
import { CreateVoiceCallDto } from './dto/create-voice-call.dto';
import { UpdateVoiceCallDto } from './dto/update-voice-call.dto';
import { TranscribeService } from './transcribe.service';
import { AxiosError } from 'axios';

@Injectable()
export class VoiceCallService {
  private readonly logger = new Logger(VoiceCallService.name);

  constructor(
    @InjectModel(VoiceCall.name)
    private readonly voiceCallModel: Model<VoiceCall>,
    private readonly transcribeService: TranscribeService,
  ) {}

  async create(dto: CreateVoiceCallDto): Promise<VoiceCall> {
    const voiceCall = await this.voiceCallModel.create(dto);

    if (dto.recordingUrl) {
      try {
        const transcript = await this.transcribeService.transcribeFromUrl(
          dto.recordingUrl,
        );
        voiceCall.transcript = transcript;
        await voiceCall.save();
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        const message =
          error?.response?.data?.message || error?.message || 'Unknown error';
        this.logger.error('Transcription during create failed', message);
      }
    }

    return voiceCall;
  }

  findAll() {
    return this.voiceCallModel.find().exec();
  }

  findOne(id: string) {
    return this.voiceCallModel.findById(id).exec();
  }

  update(id: string, dto: UpdateVoiceCallDto) {
    return this.voiceCallModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  remove(id: string) {
    return this.voiceCallModel.findByIdAndDelete(id).exec();
  }

  findByStatus(status: string) {
    return this.voiceCallModel.find({ status }).exec();
  }

  updateStatus(id: string, dto: Partial<{ status: string }>) {
    return this.voiceCallModel
      .findByIdAndUpdate(id, { status: dto.status }, { new: true })
      .exec();
  }

  async transcribeCall(id: string): Promise<VoiceCall | null> {
    const call = await this.voiceCallModel.findById(id);
    if (!call || !call.recordingUrl) return null;

    try {
      const transcript = await this.transcribeService.transcribeFromUrl(
        call.recordingUrl,
      );
      call.transcript = transcript;
      await call.save();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error?.response?.data?.message || error?.message || 'Unknown error';
      this.logger.error(`Transcription for call ${id} failed`, message);
    }

    return call;
  }
}
