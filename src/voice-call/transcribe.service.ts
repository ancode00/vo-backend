import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface ElevenLabsTranscriptionResponse {
  text: string;
}

@Injectable()
export class TranscribeService {
  async transcribeFromUrl(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      const elevenRes = await axios.post<ElevenLabsTranscriptionResponse>(
        'https://api.elevenlabs.io/v1/speech-to-text',
        response.data,
        {
          headers: {
            'Content-Type': 'audio/mpeg',
            'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          },
        },
      );

      return elevenRes.data.text; // ✅ now it's strongly typed
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[Transcription Error]', error.message);
      return '';
    }
  }
}
