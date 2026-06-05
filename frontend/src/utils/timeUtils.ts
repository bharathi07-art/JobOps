// Utility functions for formatting timestamps

/**
 * Returns a human‑readable relative time string like "5 minutes ago" or "2 days ago".
 * Very simple implementation based on difference from now.
 */
export function formatRelative(isoString: string): string {
  if (!isoString) return ''
  const past = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - past.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSec / 60)
  const diffHour = Math.round(diffMin / 60)
  const diffDay = Math.round(diffHour / 24)

  if (diffDay > 0) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
  if (diffHour > 0) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  return 'just now'
}

/**
 * Returns an absolute formatted datetime string using the user's locale.
 */
export function formatAbsolute(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })
}
