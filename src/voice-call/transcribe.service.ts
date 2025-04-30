import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';

interface ElevenLabsResponse {
  text: string;
}

@Injectable()
export class TranscribeService {
  async transcribeFromUrl(url: string): Promise<string> {
    try {
      // Step 1: Download the audio file from the URL
      const audioResponse: AxiosResponse<ArrayBuffer> = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      // Step 2: Create form-data and append the .wav file
      const form = new FormData();
      form.append('file', Buffer.from(audioResponse.data), {
        filename: 'audio.wav',
        contentType: 'audio/wav',
      });

      // Step 3: Send the request to ElevenLabs
      const response: AxiosResponse<ElevenLabsResponse> = await axios.post(
        'https://api.elevenlabs.io/v1/speech-to-text/convert',
        form,
        {
          headers: {
            ...form.getHeaders(),
            'xi-api-key': process.env.ELEVENLABS_API_KEY ?? '',
          },
        },
      );

      return response.data.text;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[Transcription Error]', error.message);
      return '';
    }
  }
}
