import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TranscribeService {
  private readonly logger = new Logger(TranscribeService.name);

  async transcribeFromUrl(url: string): Promise<string> {
    const tempFile = path.join('/tmp', `temp-${uuid()}.wav`);
    try {
      const writer = fs.createWriteStream(tempFile);
      const response = await axios.get<unknown>(url, {
        responseType: 'stream',
      });

      (response.data as NodeJS.ReadableStream).pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      return await this.transcribeLocalFile(tempFile);
    } catch (err) {
      const error = err as AxiosError;
      this.logger.error(
        'Transcription from URL failed',
        error?.response?.data || error.message,
      );
      throw new Error('Transcription from URL failed');
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }

  async transcribeLocalFile(filePath: string): Promise<string> {
    try {
      const form = new FormData();
      form.append('model_id', 'scribe_v1');
      form.append('file', fs.createReadStream(filePath));

      const response = await axios.post<{ text: string }>(
        'https://api.elevenlabs.io/v1/speech-to-text',
        form,
        {
          headers: {
            'xi-api-key': 'sk_976f8b17e8f8841ef12a663b243e23620faf295b00cca28e',
            ...form.getHeaders(),
          },
        },
      );

      this.logger.log('Transcription successful:', response.data.text);
      return response.data.text;
    } catch (err) {
      const error = err as AxiosError;
      this.logger.error(
        'Transcription failed',
        error?.response?.data || error.message,
      );
      throw new Error(
        'Transcription failed: ' +
          (error?.response?.data?.message || error.message),
      );
    }
  }
}
