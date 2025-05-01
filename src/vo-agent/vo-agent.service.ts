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
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class VoAgentService {
  constructor(
    @InjectModel(VOAgent.name)
    private readonly voAgentModel: Model<VOAgent>,
  ) {}

  getDefaultVoiceConfig() {
    return {
      voice: 'default',
      language: 'en-US',
      speed: 'normal',
    };
  }

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

    const agent = new this.voAgentModel({
      name: createDto.name,
      languages: createDto.languages,
      style: createDto.style,
      voiceId: createDto.voiceId,
      description: createDto.description,
      knowledgeBase: createDto.knowledgeBase,
      knowledgeBaseData: createDto.knowledgeBaseData,
      greeting: createDto.greeting,
      fallback: createDto.fallback,
      pauseHandling: createDto.pauseHandling,
      pauseTimeout: createDto.pauseTimeout,
      endCallPhrases: createDto.endCallPhrases,
      behavioralPrompt: createDto.behavioralPrompt,
      systemPrompt: createDto.systemPrompt,
    });

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

  async getVoiceConfig(): Promise<{
    voiceStyles: string[];
    availableLanguages: string[];
    elevenLabsVoices: {
      id: string;
      name: string;
      language: string;
    }[];
    groupedByLanguage: Record<string, { id: string; name: string }[]>;
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

    const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
    const ELEVEN_LABS_VOICES_URL = 'https://api.elevenlabs.io/v1/voices';

    let elevenLabsVoices: {
      id: string;
      name: string;
      language: string;
    }[] = [];

    if (ELEVEN_LABS_API_KEY) {
      try {
        const response = await axios.get<{
          voices: {
            voice_id: string;
            name: string;
            labels?: { language?: string; accent?: string };
          }[];
        }>(ELEVEN_LABS_VOICES_URL, {
          headers: {
            'xi-api-key': ELEVEN_LABS_API_KEY,
          },
        });

        elevenLabsVoices = response.data.voices.map((voice) => {
          const lang = voice.labels?.language?.toLowerCase();
          const fallbackLang = this.guessLanguageFromName(voice.name);
          return {
            id: voice.voice_id,
            name: voice.name,
            language: lang && lang !== 'unknown' ? lang : fallbackLang,
          };
        });
      } catch (error) {
        console.error(
          'Error fetching ElevenLabs voices:',
          error.response?.data || error.message,
        );
      }
    }

    const availableLanguages = Array.from(
      new Set(
        elevenLabsVoices
          .map((v) => v.language)
          .filter((lang) => lang && lang !== 'unknown'),
      ),
    );

    const groupedByLanguage: Record<string, { id: string; name: string }[]> =
      {};
    for (const voice of elevenLabsVoices) {
      if (!groupedByLanguage[voice.language]) {
        groupedByLanguage[voice.language] = [];
      }
      groupedByLanguage[voice.language].push({
        id: voice.id,
        name: voice.name,
      });
    }

    return {
      voiceStyles,
      availableLanguages,
      elevenLabsVoices,
      groupedByLanguage,
    };
  }

  private guessLanguageFromName(name: string): string {
    const lowered = name.toLowerCase();
    if (lowered.includes('hindi') || lowered.includes('indian')) return 'hi';
    if (lowered.includes('arabic') || lowered.includes('ar')) return 'ar';
    if (lowered.includes('german')) return 'de';
    if (lowered.includes('french')) return 'fr';
    if (lowered.includes('spanish')) return 'es';
    if (lowered.includes('english')) return 'en';
    if (lowered.includes('japanese')) return 'ja';
    if (lowered.includes('portuguese')) return 'pt';
    if (lowered.includes('italian')) return 'it';
    if (lowered.includes('korean')) return 'ko';
    return 'unknown';
  }

  async cloneVoice(
    file: Express.Multer.File,
    name: string,
  ): Promise<{
    message: string;
    voiceId?: string;
  }> {
    const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
    const ELEVEN_LABS_CLONE_URL = 'https://api.elevenlabs.io/v1/voices/add';

    if (!ELEVEN_LABS_API_KEY) {
      throw new BadRequestException('ElevenLabs API Key missing');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('files', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    try {
      const response = await axios.post(ELEVEN_LABS_CLONE_URL, formData, {
        headers: {
          ...formData.getHeaders(),
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
      });

      return {
        message: 'Voice cloned successfully',
        voiceId: response.data.voice_id,
      };
    } catch (error) {
      console.error(
        'Error cloning voice:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Voice cloning failed');
    }
  }
}
