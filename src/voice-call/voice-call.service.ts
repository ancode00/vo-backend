import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoiceCall } from './voice-call.schema';
import { CreateVoiceCallDto } from './dto/create-voice-call.dto';
import { UpdateVoiceCallDto } from './dto/update-voice-call.dto';

@Injectable()
export class VoiceCallService {
  constructor(
    @InjectModel(VoiceCall.name, 'mainConnection') // use your existing DB connection
    private readonly voiceCallModel: Model<VoiceCall>,
  ) {}

  async create(createDto: CreateVoiceCallDto): Promise<VoiceCall> {
    const newCall = new this.voiceCallModel(createDto);
    return newCall.save();
  }

  async findAll(): Promise<VoiceCall[]> {
    return this.voiceCallModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByStatus(status: string): Promise<VoiceCall[]> {
    return this.voiceCallModel.find({ status }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<VoiceCall> {
    const call = await this.voiceCallModel.findById(id).exec();
    if (!call) {
      throw new NotFoundException('Voice Call not found');
    }
    return call;
  }

  async updateStatus(
    id: string,
    updateDto: UpdateVoiceCallDto,
  ): Promise<VoiceCall> {
    const call = await this.voiceCallModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!call) {
      throw new NotFoundException('Voice Call not found');
    }
    return call;
  }
}
