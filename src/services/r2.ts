import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getR2Credentials } from './secureStore';

let s3Client: S3Client | null = null;
let currentBucket: string | null = null;

export const getS3Client = async () => {
  if (s3Client) return { client: s3Client, bucket: currentBucket! };

  const creds = await getR2Credentials();
  if (!creds || !creds.endpoint || !creds.accessKey || !creds.secretKey || !creds.bucket) {
    throw new Error('R2 Credentials not fully configured');
  }

  // Ensure endpoint has protocol
  let endpoint = creds.endpoint;
  if (!endpoint.startsWith('http')) {
    endpoint = `https://${endpoint}`;
  }

  s3Client = new S3Client({
    region: 'auto',
    endpoint: endpoint,
    credentials: {
      accessKeyId: creds.accessKey,
      secretAccessKey: creds.secretKey,
    },
    // R2 requires this for some operations depending on the bucket name style
    forcePathStyle: true, 
  });

  currentBucket = creds.bucket;
  return { client: s3Client, bucket: currentBucket };
};

export const fetchSchema = async () => {
  const { client, bucket } = await getS3Client();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: 'schema/akasha-schema.json',
  });

  const response = await client.send(command);
  const str = await response.Body?.transformToString();
  if (!str) {
    throw new Error('Schema body is empty');
  }
  
  return JSON.parse(str);
};
