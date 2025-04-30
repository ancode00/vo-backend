import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface ElevenLabsTranscriptionResponse {
  text?: string;
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

      // ✅ Log full response for debugging
      console.log('[ElevenLabs Response]', elevenRes.data);

      // ✅ Return fallback text if transcription is missing
      return elevenRes.data.text || 'No transcription available.';
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error(
          '[Transcription Error]',
          err.response?.data || err.message,
        );
      } else if (err instanceof Error) {
        console.error('[Transcription Error]', err.message);
      } else {
        console.error('[Transcription Error]', 'Unknown error occurred');
      }
      return 'Transcription failed.';
    }

    return 'Transcription failed.';
  }
}
