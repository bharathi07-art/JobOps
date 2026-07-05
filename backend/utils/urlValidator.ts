
import axios from 'axios';

const VALIDATE_TIMEOUT_MS = 4000;

/**
 * Validates a single job URL by attempting HEAD request, falling back to GET.
 * Returns true only if the URL is live (2xx–3xx status).
 * Returns false if the URL is missing, invalid, or unreachable.
 */
export async function validateJobUrl(url: string | null | undefined): Promise<boolean> {
  if (!url) return false;

  try {
    // Try HEAD request first (faster, doesn't download body)
    const headRes = await axios.head(url, {
      timeout: VALIDATE_TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: () => true, // don't throw on any status code
    });

    if (headRes.status >= 200 && headRes.status < 400) {
      return true;
    }

    // 405 Method Not Allowed — server may not support HEAD, try GET
    if (headRes.status === 405) {
      throw new Error('HEAD not allowed, trying GET');
    }

    // Other error status codes (4xx, 5xx) — URL is invalid/unreachable
    return false;
  } catch {
    // Network error or timeout on HEAD → try GET before giving up
  }

  try {
    const getRes = await axios.get(url, {
      timeout: VALIDATE_TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: () => true,
      responseType: 'stream', // avoid downloading full body
    });

    // Destroy stream immediately to avoid keeping connection open
    getRes.data?.destroy?.();

    return getRes.status >= 200 && getRes.status < 400;
  } catch {
    // GET also failed — URL is unreachable
    return false;
  }
}

/**
 * Validates job_url for every job concurrently, with an overall time budget.
 * Falls back to search_url if job_url is missing or fails validation.
 */
export async function validateMatchedJobs<T extends { job_url?: string | null; search_url: string }>(
  jobs: T[],
  overallBudgetMs = 15000,
): Promise<T[]> {
  const validationPromise = Promise.allSettled(
    jobs.map(async (job) => {
      const isValid = await validateJobUrl(job.job_url);
      return { job, isValid };
    }),
  );

  // If validation is taking too long overall (e.g. many slow hosts),
  // don't block the whole API response indefinitely.
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), overallBudgetMs));

  const result = await Promise.race([validationPromise, timeoutPromise]);

  if (result === null) {
    // Budget exceeded — safest fallback: use search_url for everything
    // rather than risk showing unverified links.
    return jobs.map((job) => ({
      ...job,
      job_url: job.search_url || job.job_url, // Keep job_url if search_url is missing
    }));
  }

  return (result as PromiseSettledResult<{ job: T; isValid: boolean }>[]).map((settled, i) => {
    const job = jobs[i];
    if (settled.status === 'fulfilled' && settled.value.isValid) {
      return job; // Keep original job_url if validation passed
    }
    // Validation failed — use search_url if available, otherwise keep job_url
    return {
      ...job,
      job_url: job.search_url || job.job_url,
    };
  });
}