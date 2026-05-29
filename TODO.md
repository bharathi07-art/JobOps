  # TODO (Subscription gating + free limits)

- [ ] Implement AnalyticsPage lock (only premium can view). Non-premium sees lock UI + upgrade prompt textbox when trying to access.
- [ ] Enforce free limit for AI job results display: show only first 10 matched jobs for non-premium; remaining jobs show locked UI and upgrade prompt when interacted with.
- [ ] Enforce free limit for tracked applications: non-premium can track max 3 applications. When user tries to add 4th, show upgrade prompt textbox and prevent adding.
- [ ] Verify ResumePage upload -> job match flow aligns with “4 AI searches/month” using existing SubscriptionContext limits (maxAISearches / aiSearchesUsed). If mismatch, adjust frontend gating points.
- [ ] Run frontend typecheck/build (if available) and sanity-test gated flows:
  - non-premium analytics blocked
  - non-premium job list limited to 10
  - non-premium cannot track more than 3 applications
