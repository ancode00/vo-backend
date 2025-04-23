import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VOAgent } from './schemas/vo-agent.schema';
import { CreateVOAgentDto } from './dto/create-vo-agent.dto';
import { UpdateVOAgentDto } from './dto/update-vo-agent.dto';
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VoAgentService {
  constructor(
    @InjectModel(VOAgent.name, 'mainConnection')
    private readonly voAgentModel: Model<VOAgent>,
  ) {}

  async create(createDto: CreateVOAgentDto): Promise<VOAgent> {
    const agent = new this.voAgentModel(createDto);
    return await agent.save();
  }

  async findAll(): Promise<VOAgent[]> {
    return await this.voAgentModel.find().exec();
  }

  async findOne(id: string): Promise<VOAgent> {
    const agent = await this.voAgentModel.findById(id).exec();
    if (!agent) {
      throw new NotFoundException('VO Agent not found');
    }
    return agent;
  }

  async update(id: string, updateDto: UpdateVOAgentDto): Promise<VOAgent> {
    const agent = await this.voAgentModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

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

  async uploadKnowledgeFile(
    id: string,
    file: unknown, // Accepts any type safely
  ): Promise<{
    message: string;
    agentId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    localPath: string;
  }> {
    const agent = await this.findOne(id);

    // Type guard to ensure the file is a valid Express.Multer.File
    if (
      !file ||
      typeof file !== 'object' ||
      !('originalname' in file) ||
      !('size' in file) ||
      !('mimetype' in file) ||
      !('buffer' in file)
    ) {
      throw new BadRequestException('Invalid file object');
    }

    if (
      !file ||
      typeof file !== 'object' ||
      !('originalname' in file) ||
      !('size' in file) ||
      !('mimetype' in file) ||
      !('buffer' in file)
    ) {
      throw new BadRequestException('Invalid file object');
    }

    const castedFile = file as Express.Multer.File;
    const originalname: string = castedFile.originalname;
    const size: number = castedFile.size;
    const mimetype: string = castedFile.mimetype;
    const buffer: Buffer = castedFile.buffer;

    const uploadDir = path.join(__dirname, '../../uploads');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const ext = path.extname(originalname);
    const base = path.basename(originalname, ext);
    const fileName = `${base}-${timestamp}${ext}`;
    const savePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(savePath, buffer);

    return {
      message: 'File uploaded and saved locally',
      agentId: String(agent._id),
      fileName,
      fileSize: size,
      mimeType: mimetype,
      localPath: savePath,
    };
  }

  async uploadKnowledgeUrl(
    id: string,
    url: unknown,
  ): Promise<{
    message: string;
    agentId: string;
    url: string;
  }> {
    const agent = await this.findOne(id);

    if (typeof url !== 'string' || !url.trim()) {
      throw new BadRequestException('Invalid or missing URL');
    }

    return {
      message: 'URL saved successfully',
      agentId: String(agent._id),
      url,
    };
  }
}
