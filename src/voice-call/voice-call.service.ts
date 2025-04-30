import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoiceCall } from './voice-call.schema';
import { CreateVoiceCallDto } from './dto/create-voice-call.dto';
import { UpdateVoiceCallDto } from './dto/update-voice-call.dto';

@Injectable()
export class VoiceCallService {
  constructor(
    @InjectModel(VoiceCall.name)
    private readonly voiceCallModel: Model<VoiceCall>,
  ) {}

  create(dto: CreateVoiceCallDto) {
    return this.voiceCallModel.create(dto);
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
}
