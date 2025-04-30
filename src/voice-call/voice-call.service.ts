import axios, { AxiosError, AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as FormData from 'form-data';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

interface TranscriptionResponse {
  text: string;
}

@Injectable()
export class TranscribeService {
  private readonly logger = new Logger(TranscribeService.name);

  async transcribeFromUrl(url: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const tempFile = path.join('/tmp', `temp-${uuid()}.wav`);
    try {
      // Download file with response type stream
      const response: AxiosResponse<NodeJS.ReadableStream> = await axios.get(
        url,
        {
          responseType: 'stream',
        },
      );

      // Save stream to file
      await new Promise<void>((resolve, reject) => {
        const writer = fs.createWriteStream(tempFile);
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Transcribe downloaded file
      return await this.transcribeLocalFile(tempFile);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Unknown error';
      this.logger.error('Transcribe from URL failed', errorMessage);
      throw new Error('Failed to transcribe from URL: ' + errorMessage);
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  async transcribeLocalFile(filePath: string): Promise<string> {
    const form = new FormData();
    form.append('model_id', 'scribe_v1');
    form.append('file', fs.createReadStream(filePath));

    const response: AxiosResponse<TranscriptionResponse> = await axios.post(
      'https://api.elevenlabs.io/v1/speech-to-text',
      form,
      {
        headers: {
          'xi-api-key': 'sk_976f8b17e8f8841ef12a663b243e23620faf295b00cca28e',
          ...form.getHeaders(),
        },
      },
    );

    return response.data.text;
  }
}
