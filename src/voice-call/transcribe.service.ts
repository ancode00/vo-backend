import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

interface ElevenLabsTranscriptionResponse {
  text: string;
}

@Injectable()
export class TranscribeService {
  async transcribeFromUrl(url: string): Promise<string> {
    try {
      const audioResponse = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
      });

      const sttResponse = await axios.post<ElevenLabsTranscriptionResponse>(
        'https://api.elevenlabs.io/v1/speech-to-text',
        audioResponse.data,
        {
          headers: {
            'Content-Type': 'audio/wav',
            'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
          },
        },
      );

      return sttResponse.data.text;
    } catch (err) {
      const error = err as AxiosError;
      const errorMsg =
        error.response && typeof error.response.data === 'string'
          ? error.response.data
          : error.message;

      console.error('[Transcription Error]', errorMsg);
      return '';
    }
  }
}
