import { parseAiResponse, validateResumeUpload } from '../utils/resumeProcessing';

describe('resume processing helpers', () => {
  it('rejects unsupported files', () => {
    const result = validateResumeUpload({
      originalname: 'resume.txt',
      mimetype: 'text/plain',
      size: 100,
      buffer: Buffer.from('testing'),
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
  });

  it('parses json from ai content', () => {
    const parsed = parseAiResponse('{"resume_score": 80, "matched_jobs": []}');
    expect(parsed.resume_score).toBe(80);
  });

  it('rejects malformed ai payloads', () => {
    expect(() => parseAiResponse('not-json')).toThrow('malformed response');
  });
});
