import * as fs from 'fs';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

const cloudStorage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_CLIENT_EMAIL,
    private_key: process.env.GCP_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = cloudStorage.bucket(process.env.GCP_STORAGE_BUCKET_NAME as string);

export const generateReadSignedUrl = async (fileKey: string) => {
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  } as const;

  const [url] = await cloudStorage
    .bucket(process.env.GCP_STORAGE_BUCKET_NAME as string)
    .file(fileKey)
    .getSignedUrl(options);

  return url;
};

export const getFileInfo = async ({ fileKey, createdAt }: { fileKey: string; createdAt: Date }) => {
  const expires = createdAt.getTime() + 7 * 24 * 60 * 60 * 1000; // 作成日から7日後まで
  const options = {
    version: 'v4',
    action: 'read',
    expires: expires,
  } as const;

  const file = cloudStorage.bucket(process.env.GCP_STORAGE_BUCKET_NAME as string).file(fileKey);

  const [url] = await file.getSignedUrl(options);
  const [metadata] = await file.getMetadata();
  const size = Number(metadata.size); // byte単位の文字列, e.g) '9122'
  const mimeType = metadata.contentType;
  return { url, expireAt: new Date(expires), size, mimeType };
};

export const uploadToGCS = ({
  filepath,
  originalFilename,
  mimetype,
}: {
  filepath: string;
  originalFilename: string | null;
  mimetype: string | null;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileKey = uuidv4();
    const ref = bucket.file(fileKey);
    const readStream = fs.createReadStream(filepath);
    const writeStream = ref.createWriteStream({ metadata: { contentType: mimetype || undefined } });
    readStream.pipe(writeStream);

    writeStream.on('error', (err) => {
      console.error(err.message);
      reject('アップロードに失敗しました');
    });

    // endはread完了したとき
    writeStream.on('finish', async () => {
      // 書き込みストリームがデータの出力を完了
      await ref.setMetadata({ metadata: { originalFilename: originalFilename || 'unknown' } });
      resolve(fileKey);
    });
  });
};

export const deleteFile = (fileKey: string) => {
  return bucket.file(fileKey).delete();
};
