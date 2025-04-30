import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as FormData from 'form-data';

interface ElevenLabsTranscriptionResponse {
  text: string;
}

@Injectable()
export class TranscribeService {
  async transcribeFromUrl(url: string): Promise<string> {
    try {
      // Step 1: Download audio from URL
      const audioResponse: AxiosResponse<ArrayBuffer> = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      // Step 2: Prepare multipart/form-data
      const formData = new FormData();
      formData.append('file', Buffer.from(audioResponse.data), {
        filename: 'audio.mp3',
        contentType: 'audio/mpeg',
      });
      formData.append('model_id', 'scribe-v1');

      // Step 3: POST to ElevenLabs API
      const elevenRes: AxiosResponse<ElevenLabsTranscriptionResponse> =
        await axios.post(
          'https://api.elevenlabs.io/v1/speech-to-text',
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
