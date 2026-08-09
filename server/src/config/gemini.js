import { GoogleGenAI } from '@google/genai';
import { ENV } from './env.js';

export const ai = ENV.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY })
  : null;

export const GEMINI_MODELS = {
  FLASH: 'gemini-3.6-flash',
  FLASH_3_5: 'gemini-3.5-flash',
  FLASH_LATEST: 'gemini-flash-latest',
  FLASH_LITE_LATEST: 'gemini-flash-lite-latest',
  FLASH_2_0: 'gemini-2.0-flash',
};

export const MODEL_FALLBACK_LIST = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash',
];
