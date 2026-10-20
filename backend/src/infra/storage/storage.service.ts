import {
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { APP_ENV, type AppEnv } from '../../config/env';

export interface PresignedUpload {
  url: string;
  fields: Record<string, string>;
  expiresInSeconds: number;
}

export interface StoredObjectInfo {
  size: number;
  contentType?: string;
}

/** Storage port used by MediaService; swapped for a fake in tests. */
export abstract class StorageService {
  abstract isConfigured(): boolean;
  abstract createPresignedUpload(
    key: string,
    contentType: string,
    maxBytes: number,
  ): Promise<PresignedUpload>;
  abstract headObject(key: string): Promise<StoredObjectInfo | null>;
  abstract deleteObject(key: string): Promise<void>;
  abstract publicUrl(key: string): string;
}

const UPLOAD_EXPIRY_SECONDS = 300;

@Injectable()
export class S3StorageService extends StorageService {
  private readonly client?: S3Client;

  constructor(@Inject(APP_ENV) private readonly env: AppEnv) {
    super();
    if (env.s3.bucket && env.s3.region) {
      // Credentials come from the default AWS provider chain (env vars, IAM role).
      this.client = new S3Client({
        region: env.s3.region,
        endpoint: env.s3.endpoint,
        forcePathStyle: !!env.s3.endpoint,
      });
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  private requireClient(): S3Client {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Media storage is not configured (set AWS_REGION and S3_BUCKET)',
      );
    }
    return this.client;
  }

  async createPresignedUpload(
    key: string,
    contentType: string,
    maxBytes: number,
  ): Promise<PresignedUpload> {
    const { url, fields } = await createPresignedPost(this.requireClient(), {
      Bucket: this.env.s3.bucket!,
      Key: key,
      Conditions: [
        ['content-length-range', 1, maxBytes],
        ['eq', '$Content-Type', contentType],
      ],
      Fields: { 'Content-Type': contentType },
      Expires: UPLOAD_EXPIRY_SECONDS,
    });
    return { url, fields, expiresInSeconds: UPLOAD_EXPIRY_SECONDS };
  }

  async headObject(key: string): Promise<StoredObjectInfo | null> {
    try {
      const out = await this.requireClient().send(
        new HeadObjectCommand({ Bucket: this.env.s3.bucket!, Key: key }),
      );
      return { size: out.ContentLength ?? 0, contentType: out.ContentType };
    } catch (error) {
      const status = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;
      if (status === 404 || status === 403) return null;
      throw error;
    }
  }

  async deleteObject(key: string): Promise<void> {
    await this.requireClient().send(
      new DeleteObjectCommand({ Bucket: this.env.s3.bucket!, Key: key }),
    );
  }

  publicUrl(key: string): string {
    const base =
      this.env.s3.publicBaseUrl ??
      `https://${this.env.s3.bucket}.s3.${this.env.s3.region}.amazonaws.com`;
    return `${base}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }
}
