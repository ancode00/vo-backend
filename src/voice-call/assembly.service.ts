import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';

interface AssemblyUploadResponse {
  upload_url: string;
}

interface TranscriptInitResponse {
  id: string;
}

interface TranscriptPollingResponse {
  status: 'queued' | 'processing' | 'completed' | 'error';
  error?: string;
  summary?: string;
  words?: {
    text: string;
    speaker: string;
    start: number;
    end: number;
  }[];
  sentiment_analysis_results?: any[];
  silence?: any[];
  crosstalk?: any[];
}

export type AssemblyTranscript = {
  summary: string;
  speakers: {
    text: string;
    speaker: string;
    start: number;
    end: number;
  }[];
  silence: any[];
  sentiment: any[];
  crosstalk: any[];
};

@Injectable()
export class AssemblyService {
  private readonly apiKey = process.env.ASSEMBLYAI_API_KEY as string;

  async transcribeAudio(filePath: string): Promise<AssemblyTranscript> {
    const fileStream = fs.createReadStream(filePath);

    // 1. Upload audio to AssemblyAI
    const uploadRes: AxiosResponse<AssemblyUploadResponse> = await axios({
      method: 'post',
      url: 'https://api.assemblyai.com/v2/upload',
      headers: {
        authorization: this.apiKey,
        'transfer-encoding': 'chunked',
      },
      data: fileStream,
    });

    const audioUrl = uploadRes.data.upload_url;

    // 2. Request transcription
    const transcriptRes: AxiosResponse<TranscriptInitResponse> =
      await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        {
          audio_url: audioUrl,
          speaker_labels: true,
          iab_categories: true,
          auto_chapters: true,
          dual_channel: false,
          punctuate: true,
          sentiment_analysis: true,
          redact_pii: false,
          summarization: true,
        },
        {
          headers: {
            authorization: this.apiKey,
          },
        },
      );

    const transcriptId = transcriptRes.data.id;

    // 3. Poll for completion
    let transcript: TranscriptPollingResponse;
    while (true) {
      const pollingRes: AxiosResponse<TranscriptPollingResponse> =
        await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              authorization: this.apiKey,
            },
          },
        );

      transcript = pollingRes.data;

      if (transcript.status === 'completed') break;
      if (transcript.status === 'error') {
        throw new Error(transcript.error ?? 'Unknown transcription error');
      }

      await new Promise((r) => setTimeout(r, 3000));
    }

    // 4. Return structured result
    return {
      summary: transcript.summary ?? '',
      speakers: transcript.words ?? [],
      silence: transcript.silence ?? [],
      sentiment: transcript.sentiment_analysis_results ?? [],
      crosstalk: transcript.crosstalk ?? [],
    };
  }
}
