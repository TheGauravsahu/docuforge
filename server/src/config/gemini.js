import { GoogleGenAI } from '@google/genai';
import { ENV } from './env.js';

export const ai = ENV.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY })
  : null;

export const GEMINI_MODELS = {
  FLASH: 'gemini-2.0-flash',
  PRO: 'gemini-1.5-pro',
};
