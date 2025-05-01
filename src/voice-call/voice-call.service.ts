import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoiceCall, TranscriptData } from './voice-call.schema';
import { CreateVoiceCallDto } from './dto/create-voice-call.dto';
import { UpdateVoiceCallDto } from './dto/update-voice-call.dto';
import { AssemblyService, AssemblyTranscript } from './assembly.service';
import {
  AiAnalysisService,
  TranscriptInsights,
} from '../ai-analysis/ai-analysis.service';
import { AxiosError } from 'axios';

@Injectable()
export class VoiceCallService {
  private readonly logger = new Logger(VoiceCallService.name);

  constructor(
    @InjectModel(VoiceCall.name)
    private readonly voiceCallModel: Model<VoiceCall>,
    private readonly assemblyService: AssemblyService,
    private readonly aiAnalysisService: AiAnalysisService,
  ) {}

  async create(dto: CreateVoiceCallDto): Promise<VoiceCall> {
    const voiceCall = await this.voiceCallModel.create(dto);

    if (dto.recordingUrl) {
      try {
        const result: AssemblyTranscript =
          await this.assemblyService.transcribeAudio(dto.recordingUrl);

        const fullTranscript: TranscriptData = {
          summary: result.summary,
          speakers: result.speakers,
          silence: result.silence,
          sentiment: result.sentiment,
          crosstalk: result.crosstalk,
        };

        voiceCall.transcript = fullTranscript;

        const fullText = result.speakers
          .map((s) => `${s.speaker}: ${s.text}`)
          .join('\n');

        const insights: TranscriptInsights =
          await this.aiAnalysisService.analyzeTranscript(fullText);
        voiceCall.insights = insights;

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
      const result: AssemblyTranscript =
        await this.assemblyService.transcribeAudio(call.recordingUrl);

      const fullTranscript: TranscriptData = {
        summary: result.summary,
        speakers: result.speakers,
        silence: result.silence,
        sentiment: result.sentiment,
        crosstalk: result.crosstalk,
      };

      call.transcript = fullTranscript;

      const fullText = result.speakers
        .map((s) => `${s.speaker}: ${s.text}`)
        .join('\n');

      const insights: TranscriptInsights =
        await this.aiAnalysisService.analyzeTranscript(fullText);
      call.insights = insights;

      await call.save();
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const message =
        error?.response?.data?.message || error?.message || 'Unknown error';
      this.logger.error(`Transcription for call ${id} failed`, message);
    }

    return call;
  }

  async getInsightsSummary(): Promise<{
    totalCalls: number;
    escalatedCalls: number;
    negativeCSAT: number;
    vulnerableCustomers: number;
  }> {
    const [totalCalls, escalatedCalls, negativeCSAT, vulnerableCustomers] =
      await Promise.all([
        this.voiceCallModel.countDocuments(),
        this.voiceCallModel.countDocuments({ 'insights.escalation': 'High' }),
        this.voiceCallModel.countDocuments({ 'insights.csat': 'Negative' }),
        this.voiceCallModel.countDocuments({ 'insights.vulnerable': true }),
      ]);

    return {
      totalCalls,
      escalatedCalls,
      negativeCSAT,
      vulnerableCustomers,
    };
  }
}
