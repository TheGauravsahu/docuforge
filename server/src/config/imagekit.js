import ImageKit from '@imagekit/nodejs';
import { ENV } from './env.js';

let imagekitClient = null;

if (ENV.IMAGEKIT_PRIVATE_KEY) {
  try {
    imagekitClient = new ImageKit({
      publicKey: ENV.IMAGEKIT_PUBLIC_KEY,
      privateKey: ENV.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: ENV.IMAGEKIT_URL_ENDPOINT,
    });
    console.log('[ImageKit] SDK initialized successfully.');
  } catch (err) {
    console.warn('[ImageKit] SDK initialization warning:', err.message);
  }
} else {
  console.log('[ImageKit] IMAGEKIT_PRIVATE_KEY not set — using local base64 fallback for uploaded images.');
}

export const uploadToImageKit = async ({ file, fileName, folder = '/docuforge' }) => {
  if (imagekitClient) {
    try {
      const response = await imagekitClient.files.upload({
        file, // base64 data string or buffer/stream
        fileName: fileName || `upload_${Date.now()}.png`,
        folder,
      });
      if (response && response.url) {
        return response.url;
      }
    } catch (err) {
      console.error('[ImageKit Upload Error]', err.message || err);
    }
  }

  // Fallback to Data URL if ImageKit API key is not configured or fails
  return file.startsWith('data:') ? file : `data:image/png;base64,${file}`;
};
