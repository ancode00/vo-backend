import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoiceCall } from './voice-call.schema';
import { CreateVoiceCallDto } from './dto/create-voice-call.dto';
import { UpdateVoiceCallDto } from './dto/update-voice-call.dto';
import { TranscribeService } from './transcribe.service';

@Injectable()
export class VoiceCallService {
  constructor(
    @InjectModel(VoiceCall.name)
    private readonly voiceCallModel: Model<VoiceCall>,
    private readonly transcribeService: TranscribeService,
  ) {}

  async create(dto: CreateVoiceCallDto) {
    const voiceCall = await this.voiceCallModel.create(dto);

    if (dto.recordingUrl) {
      const transcript = await this.transcribeService.transcribeFromUrl(
        dto.recordingUrl,
      );
      voiceCall.transcript = transcript;
      await voiceCall.save();
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

  async transcribeCall(id: string) {
    const call = await this.voiceCallModel.findById(id);
    if (!call || !call.recordingUrl) return null;

    const transcript = await this.transcribeService.transcribeFromUrl(
      call.recordingUrl,
    );
    call.transcript = transcript;
    await call.save();

    return call;
  }
}
