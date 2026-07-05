import { validateJobUrl, validateMatchedJobs } from '../../utils/urlValidator';
import axios from 'axios';

// Mock axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('urlValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateJobUrl', () => {
    it('should return false for null or undefined URL', async () => {
      expect(await validateJobUrl(null)).toBe(false);
      expect(await validateJobUrl(undefined)).toBe(false);
      expect(await validateJobUrl('')).toBe(false);
    });

    it('should return true for a 200 OK response on HEAD request', async () => {
      mockedAxios.head.mockResolvedValueOnce({ status: 200 } as any);
      const result = await validateJobUrl('https://example.com/job-123');
      expect(result).toBe(true);
      expect(mockedAxios.head).toHaveBeenCalledWith('https://example.com/job-123', expect.objectContaining({
        timeout: 4000,
        maxRedirects: 5,
        validateStatus: expect.any(Function),
      }));
    });

    it('should return true for 3xx redirect response on HEAD request', async () => {
      mockedAxios.head.mockResolvedValueOnce({ status: 301 } as any);
      const result = await validateJobUrl('https://example.com/job-123');
      expect(result).toBe(true);
    });

    it('should return false for 404 Not Found on HEAD request', async () => {
      mockedAxios.head.mockResolvedValueOnce({ status: 404 } as any);
      const result = await validateJobUrl('https://example.com/job-404');
      expect(result).toBe(false);
    });

    it('should return false for 500 server error on HEAD request', async () => {
      mockedAxios.head.mockResolvedValueOnce({ status: 500 } as any);
      const result = await validateJobUrl('https://example.com/error');
      expect(result).toBe(false);
    });

    it('should retry with GET when HEAD returns 405 Method Not Allowed', async () => {
      mockedAxios.head.mockResolvedValueOnce({ status: 405 } as any);
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { destroy: jest.fn() },
      } as any);

      const result = await validateJobUrl('https://example.com/job-405');
      expect(result).toBe(true);
      expect(mockedAxios.head).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalledWith('https://example.com/job-405', expect.objectContaining({
        timeout: 4000,
        maxRedirects: 5,
        validateStatus: expect.any(Function),
        responseType: 'stream',
      }));
    });

    it('should return false when GET after 405 also fails', async () => {
      mockedAxios.head.mockResolvedValueOnce({ status: 405 } as any);
      mockedAxios.get.mockResolvedValueOnce({ status: 404 } as any);

      const result = await validateJobUrl('https://example.com/job-fail');
      expect(result).toBe(false);
    });

    it('should return true for 200 on GET when HEAD times out', async () => {
      mockedAxios.head.mockRejectedValueOnce(new Error('timeout'));
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { destroy: jest.fn() },
      } as any);

      const result = await validateJobUrl('https://example.com/job-recover');
      expect(result).toBe(true);
    });

    it('should return false when both HEAD and GET fail', async () => {
      mockedAxios.head.mockRejectedValueOnce(new Error('HEAD timeout'));
      mockedAxios.get.mockRejectedValueOnce(new Error('GET timeout'));

      const result = await validateJobUrl('https://example.com/job-timeout');
      expect(result).toBe(false);
    });

    it('should destroy stream immediately on GET to avoid keeping connection open', async () => {
      const destroyMock = jest.fn();
      mockedAxios.head.mockResolvedValueOnce({ status: 405 } as any);
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { destroy: destroyMock },
      } as any);

      await validateJobUrl('https://example.com/stream-test');
      expect(destroyMock).toHaveBeenCalled();
    });
  });

  describe('validateMatchedJobs', () => {
    const mockJobs = [
      {
        title: 'Senior Engineer',
        company: 'TechCorp',
        job_url: 'https://example.com/jobs/1',
        search_url: 'https://example.com/search?q=engineer',
      },
      {
        title: 'Product Manager',
        company: 'FinTech',
        job_url: null,
        search_url: 'https://fintech.com/search?q=manager',
      },
      {
        title: 'Designer',
        company: 'StartUp',
        job_url: undefined,
        search_url: 'https://startup.com/search?q=designer',
      },
    ];

    it('should validate all jobs and replace invalid job_url with search_url', async () => {
      mockedAxios.head
        .mockResolvedValueOnce({ status: 200 } as any) // Job 0: valid
        .mockResolvedValueOnce({ status: 404 } as any); // Job 2: invalid

      const result = await validateMatchedJobs(mockJobs);

      expect(result).toHaveLength(3);
      expect(result[0].job_url).toBe('https://example.com/jobs/1'); // Valid, unchanged
      expect(result[1].job_url).toBe('https://fintech.com/search?q=manager'); // Was null, fallback
      expect(result[2].job_url).toBe('https://startup.com/search?q=designer'); // Was invalid (404), fallback
    });

    it('should handle overall timeout budget exceeded', async () => {
      // Create jobs that will timeout
      const slowJobs = [
        {
          title: 'Slow Job 1',
          company: 'SlowCorp 1',
          job_url: 'https://slow1.com/jobs/1',
          search_url: 'https://slow1.com/search?q=engineer',
        },
        {
          title: 'Slow Job 2',
          company: 'SlowCorp 2',
          job_url: 'https://slow2.com/jobs/2',
          search_url: 'https://slow2.com/search?q=engineer',
        },
      ];

      // Mock head to take a very long time (simulating slow network)
      mockedAxios.head.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ status: 200 } as any), 50000))
      );

      const startTime = Date.now();
      const result = await validateMatchedJobs(slowJobs, 100); // 100ms budget
      const elapsed = Date.now() - startTime;

      // Should timeout around 100ms, not wait 50s
      expect(elapsed).toBeLessThan(1000);
      expect(result).toHaveLength(2);
      // When budget is exceeded, all jobs should fall back to search_url
      result.forEach(job => {
        expect(job.job_url).toBe(job.search_url);
      });
    }, 15000);

    it('should preserve valid jobs even if some validation fails', async () => {
      const testJobs = [
        {
          title: 'Valid Job',
          company: 'TechCorp',
          job_url: 'https://example.com/jobs/1',
          search_url: 'https://example.com/search?q=engineer',
        },
        {
          title: 'Invalid Job',
          company: 'FailCorp',
          job_url: 'https://fail.com/jobs/999',
          search_url: 'https://fail.com/search?q=engineer',
        },
      ];

      mockedAxios.head
        .mockResolvedValueOnce({ status: 200 } as any) // Job 0: valid
        .mockRejectedValueOnce(new Error('timeout')); // Job 1: validation error

      // Use sufficient budget to allow validation to complete
      const result = await validateMatchedJobs(testJobs, 5000);

      expect(result[0].job_url).toBe('https://example.com/jobs/1'); // Valid, unchanged
      expect(result[1].job_url).toBe('https://fail.com/search?q=engineer'); // Invalid, fallback
    }, 15000);

    it('should handle empty job list', async () => {
      const result = await validateMatchedJobs([]);
      expect(result).toEqual([]);
    });

    it('should handle jobs with missing search_url by keeping job_url as is', async () => {
      const jobsWithoutSearchUrl = [
        {
          title: 'Engineer',
          company: 'TechCorp',
          job_url: 'https://example.com/jobs/1',
          search_url: null as any,
        },
      ];

      mockedAxios.head.mockResolvedValueOnce({ status: 200 } as any);

      const result = await validateMatchedJobs(jobsWithoutSearchUrl);
      expect(result[0].job_url).toBe('https://example.com/jobs/1');
    });

    it('should use default 15s budget if not specified', async () => {
      mockedAxios.head.mockResolvedValueOnce({ status: 200 } as any);

      const startTime = Date.now();
      await validateMatchedJobs([mockJobs[0]]);
      const elapsed = Date.now() - startTime;

      // Should complete quickly, not wait 15s
      expect(elapsed).toBeLessThan(5000);
    });

    it('should handle mixed validation results', async () => {
      mockedAxios.head
        .mockResolvedValueOnce({ status: 200 } as any) // Valid
        .mockResolvedValueOnce({ status: 404 } as any) // Invalid: not found
        .mockResolvedValueOnce({ status: 405 } as any); // Invalid: method not allowed

      mockedAxios.get
        .mockResolvedValueOnce({ status: 200, data: { destroy: jest.fn() } } as any); // GET for 405

      const result = await validateMatchedJobs(mockJobs);

      expect(result[0].job_url).toBe('https://example.com/jobs/1'); // Valid, unchanged
      expect(result[1].job_url).toBe('https://fintech.com/search?q=manager'); // Fallback
      expect(result[2].job_url).toBe('https://startup.com/search?q=designer'); // Fallback
    });

    it('should handle single valid job without issues', async () => {
      const singleJob = [{
        title: 'Engineer',
        company: 'TechCorp',
        job_url: 'https://example.com/jobs/1',
        search_url: 'https://example.com/search?q=engineer',
      }];

      mockedAxios.head.mockResolvedValueOnce({ status: 200 } as any);

      const result = await validateMatchedJobs(singleJob);
      expect(result).toHaveLength(1);
      expect(result[0].job_url).toBe('https://example.com/jobs/1');
    });

    it('should handle large batch of jobs concurrently', async () => {
      const largeBatch = Array.from({ length: 50 }, (_, i) => ({
        title: `Job ${i}`,
        company: `Company ${i}`,
        job_url: `https://example.com/jobs/${i}`,
        search_url: `https://example.com/search?q=job${i}`,
      }));

      mockedAxios.head.mockResolvedValue({ status: 200 } as any);

      const startTime = Date.now();
      const result = await validateMatchedJobs(largeBatch, 30000);
      const elapsed = Date.now() - startTime;

      // Should handle concurrently, not take 50 * 4000ms
      expect(elapsed).toBeLessThan(10000);
      expect(result).toHaveLength(50);
    });
  });
});

