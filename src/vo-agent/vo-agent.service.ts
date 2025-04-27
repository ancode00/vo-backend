/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import axios from 'axios'; // Added axios for calling Eleven Labs API

@Injectable()
export class VoAgentService {
  constructor(
    @InjectModel(VOAgent.name, 'mainConnection')
    private readonly voAgentModel: Model<VOAgent>,
  ) {}

  async processKnowledgeFile(file: Express.Multer.File): Promise<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    localPath: string;
    parsedData: string[];
  }> {
    const uploadDir = path.join(__dirname, '../../uploads');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const fileName = `${base}-${timestamp}${ext}`;
    const savePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(savePath, file.buffer);

    const parsedData = file.buffer
      .toString('utf-8')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      fileName,
      fileSize: file.size,
      mimeType: file.mimetype,
      localPath: savePath,
      parsedData,
    };
  }

  async create(
    createDto: CreateVOAgentDto,
    file?: Express.Multer.File,
  ): Promise<VOAgent> {
    if (file) {
      const kb = await this.processKnowledgeFile(file);
      createDto.knowledgeBase = kb.localPath;
      createDto.knowledgeBaseData = kb.parsedData;
    }
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
    file: unknown,
  ): Promise<{
    message: string;
    agentId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    localPath: string;
  }> {
    const agent = await this.findOne(id);

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
    const uploadDir = path.join(__dirname, '../../uploads');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const ext = path.extname(castedFile.originalname);
    const base = path.basename(castedFile.originalname, ext);
    const fileName = `${base}-${timestamp}${ext}`;
    const savePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(savePath, castedFile.buffer);

    return {
      message: 'File uploaded and saved locally',
      agentId: String(agent._id),
      fileName,
      fileSize: castedFile.size,
      mimeType: castedFile.mimetype,
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

  // ✅ NEW Functionality: Fetch Voice Styles + 11Labs Voices
  async getVoiceStylesAndVoices(): Promise<{
    voiceStyles: string[];
    elevenLabsVoices: { id: string; name: string }[];
  }> {
    const voiceStyles = [
      'Professional',
      'Friendly',
      'Casual',
      'Formal',
      'Enthusiastic',
      'Serious',
      'Empathic',
    ];

    const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY; // Store your API Key in environment variables
    const ELEVEN_LABS_VOICES_URL = 'https://api.elevenlabs.io/v1/voices';

    let elevenLabsVoices = [];

    if (ELEVEN_LABS_API_KEY) {
      try {
        const response = await axios.get(ELEVEN_LABS_VOICES_URL, {
          headers: {
            'xi-api-key': ELEVEN_LABS_API_KEY,
          },
        });

        elevenLabsVoices = response.data.voices.map((voice) => ({
          id: voice.voice_id,
          name: voice.name,
        }));
      } catch (error) {
        console.error('Error fetching ElevenLabs voices:', error.message);
      }
    }

    return {
      voiceStyles,
      elevenLabsVoices,
    };
  }
}
