import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as FormData from 'form-data';
import * as path from 'path';

interface ElevenLabsTranscriptionResponse {
  text: string;
}

@Injectable()
export class TranscribeService {
  async transcribeFromUrl(url: string): Promise<string> {
    try {
      // 1. Download audio file
      const audioResponse: AxiosResponse<ArrayBuffer> = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      // 2. Prepare multipart form
      const formData = new FormData();
      formData.append('file', Buffer.from(audioResponse.data), {
        filename: path.basename(url) || 'audio.mp3',
        contentType: 'audio/mpeg',
      });
      formData.append('model_id', 'whisper-1'); // or 'scribe-v1' if applicable
      formData.append('language', 'en'); // optional
      formData.append('output_format', 'json'); // required

      // 3. Send transcription request
      const elevenRes = await axios.post<ElevenLabsTranscriptionResponse>(
        'https://api.elevenlabs.io/v1/speech-to-text/convert', // ✅ CORRECT ENDPOINT
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          },
        },
      );

      return elevenRes.data.text;
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: unknown };
        message?: string;
      };
      console.error(
        '[Transcription Error]',
        error.response?.data || error.message,
      );
      return '';
    }
  }
}
