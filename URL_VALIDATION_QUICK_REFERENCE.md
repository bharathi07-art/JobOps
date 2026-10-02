# URL Validation - Quick Reference

## What Changed?

### Problem Solved
❌ **Before:** Gemini hallucinated job URLs → Users saw 404 pages when clicking "Apply"  
✅ **After:** Real-time web grounding + server-side validation + frontend fallbacks

---

## Key Files Modified/Created

| File | Change | Purpose |
|------|--------|---------|
| `backend/utils/urlValidator.ts` | **NEW** | Validates URLs before storing, fallback logic |
| `backend/utils/urlValidator.test.ts` | **NEW** | 15+ unit tests covering all scenarios |
| `backend/controller/aiController.ts` | **UPDATED** | Import validator, call it, enhanced prompt |
| `frontend/src/pages/dashboard/SavedJobsPage.tsx` | **UPDATED** | Use fallback: `job_url \|\| search_url \|\| career_url` |

---

## How It Works (ELI5)

1. **User uploads resume** → Gemini AI searches the web for real job postings
2. **AI generates job list** → Backend validates each URL (HEAD request)
3. **Invalid URLs detected** → Automatically replaced with pre-filled search links
4. **Results stored in DB** → Frontend always shows working links
5. **User clicks "Apply"** → Goes to real job or searchable careers page

---

## For Developers

### Running Tests
```bash
cd backend
npm test -- urlValidator.test.ts
```

### Adding Logging
In `aiController.ts`, logs show validation details:
```
Validating 50 job URLs...
URL validation complete: 50 jobs with valid fallbacks.
```

### Monitoring Jobs
Check MongoDB for validated job_url values:
```javascript
db.airesults.findOne({ userId: "xxx" }).matched_jobs[0]
// {
//   job_url: "https://careers.example.com/jobs/123" or search_url if invalid,
//   search_url: "https://careers.example.com/jobs?q=engineer",
//   career_url: "https://careers.example.com",
//   ...
// }
```

---

## Configuration

### Change Timeout
**Edit `backend/utils/urlValidator.ts`:**
```typescript
const VALIDATE_TIMEOUT_MS = 4000; // Per URL timeout
```

**In `aiController.ts` (call site):**
```typescript
const validatedJobs = await validateMatchedJobs(parsed.matched_jobs, 15000); // 15s overall
```

### Handle Gemini API Incompatibility
If you get a 400 error from Gemini:

1. **In `aiController.ts`**, remove this:
   ```typescript
   generationConfig: { responseMimeType: "application/json" },
   ```

2. **Add JSON parsing with fence stripping:**
   ```typescript
   let rawJson = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
   const parsed = parseAiResponse(rawJson);
   ```

---

## Testing Scenarios

### Test Case 1: Valid URL
```
Input: job_url = "https://careers.google.com/jobs/123"
HEAD request returns: 200 OK
Output: Kept as-is ✅
```

### Test Case 2: Hallucinated URL (404)
```
Input: job_url = "https://careers.example.com/jobs/999999"
HEAD request returns: 404 Not Found
Output: Replaced with search_url ✅
```

### Test Case 3: No Direct URL
```
Input: job_url = null
Output: Uses search_url ✅
```

### Test Case 4: Timeout (15s budget exceeded)
```
Input: 50 slow/unreachable URLs
Timeout after: ~15 seconds
Output: All use search_url, API response sent ✅
```

---

## Debugging Issues

### "URLs still showing 404"
1. Check if validation is running:
   - Look for logs: `Validating X job URLs...`
   - Check `matched_jobs` in MongoDB for `job_url` values
2. Verify frontend is using fallback:
   - Open DevTools → Network → Click "Apply"
   - Check URL matches `job_url \|\| search_url \|\| career_url`

### "Validation is too slow"
1. Increase timeout budget:
   ```typescript
   await validateMatchedJobs(jobs, 30000); // 30s instead of 15s
   ```
2. Check network conditions (slow hosting providers)

### "Stream errors in logs"
1. Ensure stream is destroyed:
   ```typescript
   getRes.data?.destroy?.();
   ```
2. Check node version supports stream.destroy()

---

## Expected Metrics

| Metric | Expected | Notes |
|--------|----------|-------|
| Validation Time (50 jobs) | 500ms-2s | Depends on network |
| API Response Increase | +15% | Gemini (120s) + Validation (<15s) |
| Direct Link Success Rate | 85-90% | Rest use search_url |
| 404 Rate (User Impact) | <2% | Links may become invalid after check |

---

## Rollback Plan

If issues arise:

1. **Disable validation (quick):**
   ```typescript
   // In aiController.ts, remove validation call:
   // const validatedJobs = await validateMatchedJobs(parsed.matched_jobs);
   // Use raw parsed results instead:
   matched_jobs: parsed.matched_jobs,
   ```

2. **Disable web grounding (safer AI):**
   ```typescript
   // Remove tools array from Gemini API call
   // tools: [{ google_search: {} }],
   ```

3. **Full rollback:**
   - Revert `aiController.ts` to previous version
   - Revert `SavedJobsPage.tsx` to previous version
   - Keep `urlValidator.ts` (unused but harmless)

---

## Support

For issues or questions:
1. Check logs: `npm start` (backend) and browser console
2. Run tests: `npm test -- urlValidator.test.ts`
3. Review `URL_VALIDATION_IMPLEMENTATION.md` for detailed docs
