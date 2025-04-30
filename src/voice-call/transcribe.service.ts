import { Readable } from 'stream';
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

type ElevenLabsTranscriptResponse = {
  text: string;
  language_code?: string;
  language_probability?: number;
};

@Injectable()
export class TranscribeService {
  private readonly logger = new Logger(TranscribeService.name);

  async transcribeLocalFile(filePath: string): Promise<string> {
    try {
      const form = new FormData();
      form.append('model_id', 'scribe_v1');
      form.append('file', fs.createReadStream(filePath));

      const response: AxiosResponse<ElevenLabsTranscriptResponse> =
        await axios.post('https://api.elevenlabs.io/v1/speech-to-text', form, {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
            ...form.getHeaders(),
          },
        });

      this.logger.log(`Transcription success: ${response.data.text}`);
      return response.data.text;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error?.response?.data?.message || error.message || 'Unknown error';
      this.logger.error('Transcription failed', errorMessage);
      throw new Error(`Transcription failed: ${errorMessage}`);
    }
  }

  async transcribeFromUrl(url: string): Promise<string> {
    try {
      const tempFilePath = path.join(
        os.tmpdir(),
        `audio-${crypto.randomUUID()}.mp3`,
      );

      const writer = fs.createWriteStream(tempFilePath);

      const response = await axios.get(url, {
        responseType: 'stream',
      });

      await new Promise<void>((resolve, reject) => {
        (response.data as Readable).pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const text = await this.transcribeLocalFile(tempFilePath);

      fs.unlink(tempFilePath, () => {}); // clean up
      return text;
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error?.response?.data?.message || error.message || 'Unknown error';
      this.logger.error('Transcription from URL failed', errorMessage);
      throw new Error(`Transcription from URL failed: ${errorMessage}`);
    }
  }
}
