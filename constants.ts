import { SupportedLanguage } from './types';

export const PROGRAMMING_LANGUAGES: SupportedLanguage[] = Object.values(SupportedLanguage);

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";

export const GEMINI_API_KEY_ERROR_MESSAGE = "Error: Gemini API key (process.env.API_KEY) is not configured. Please set it up to use the AI Code Reviewer.";
