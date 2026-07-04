import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export interface ResumeFileLike {
  originalname?: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
}

export interface ResumeValidationResult {
  ok: boolean;
  message?: string;
  status?: number;
  file?: ResumeFileLike;
}

const hasAllowedExtension = (filename = ''): boolean => {
  const normalized = filename.toLowerCase();
  return normalized.endsWith('.pdf') || normalized.endsWith('.docx');
};

export const validateResumeUpload = (file: ResumeFileLike | undefined): ResumeValidationResult => {
  if (!file) {
    return { ok: false, message: 'Resume file is required.', status: 400 };
  }

  const size = file.size ?? 0;
  const buffer = file.buffer;

  if (!buffer || buffer.length === 0) {
    return { ok: false, message: 'Uploaded file appears to be empty.', status: 400 };
  }

  if (size > MAX_RESUME_SIZE_BYTES) {
    return { ok: false, message: 'Resume file must be 5MB or smaller.', status: 413 };
  }

  if (!ALLOWED_RESUME_MIME_TYPES.has(file.mimetype || '') && !hasAllowedExtension(file.originalname || '')) {
    return { ok: false, message: 'Only PDF and DOCX resume files are supported.', status: 400 };
  }

  return { ok: true, file };
};

export const extractResumeText = async (file: ResumeFileLike): Promise<string> => {
  const mimeType = file.mimetype || '';
  const buffer = file.buffer;

  if (!buffer || buffer.length === 0) {
    throw new Error('Uploaded file appears to be empty.');
  }

  if (mimeType === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = typeof result?.text === 'string' ? result.text.trim() : '';
    if (!text) {
      throw new Error('The uploaded PDF could not be read. Please try another file.');
    }
    return text;
  }

  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const parsed = await mammoth.extractRawText({ buffer });
    const text = typeof parsed?.value === 'string' ? parsed.value.trim() : '';
    if (!text) {
      throw new Error('The uploaded DOCX file could not be read. Please try another file.');
    }
    return text;
  }

  throw new Error('Only PDF and DOCX resume files are supported.');
};

export const parseAiResponse = (raw: string): any => {
  if (!raw || typeof raw !== 'string') {
    throw new Error('The AI response was empty.');
  }

  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('The AI response was invalid.');
    }
    return parsed;
  } catch (error) {
    throw new Error('The AI returned a malformed response. Please try again.');
  }
};
