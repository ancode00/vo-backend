import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VOAgent } from './schemas/vo-agent.schema';
import { CreateVOAgentDto } from './dto/create-vo-agent.dto';
import { UpdateVOAgentDto } from './dto/update-vo-agent.dto';

@Injectable()
export class VoAgentService {
  constructor(
    @InjectModel(VOAgent.name, 'mainConnection')
    private voAgentModel: Model<VOAgent>,
  ) {}

  async create(createDto: CreateVOAgentDto): Promise<VOAgent> {
    const agent = new this.voAgentModel(createDto);
    return agent.save();
  }

  async findAll(): Promise<VOAgent[]> {
    return this.voAgentModel.find().exec();
  }

  async findOne(id: string): Promise<VOAgent> {
    const agent = await this.voAgentModel.findById(id).exec();
    if (!agent) {
      throw new NotFoundException('VO Agent not found');
    }
    return agent;
  }

  async update(id: string, updateDto: UpdateVOAgentDto): Promise<VOAgent> {
    const agent = await this.voAgentModel.findByIdAndUpdate(id, updateDto, {
      new: true,
    });
    if (!agent) {
      throw new NotFoundException('VO Agent to update not found');
    }
    return agent;
  }

  async remove(id: string): Promise<VOAgent> {
    const agent = await this.voAgentModel.findByIdAndDelete(id).exec();
    if (!agent) {
      throw new NotFoundException('VO Agent to delete not found');
    }
    return agent;
  }

  async uploadKnowledgeFile(id: string, file: Express.Multer.File) {
    const agent = await this.findOne(id);

    return {
      message: 'File uploaded successfully',
      agentId: agent._id,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };
  }

  async uploadKnowledgeUrl(id: string, url: string) {
    const agent = await this.findOne(id);

    return {
      message: 'URL saved successfully',
      agentId: agent._id,
      url,
    };
  }
}
