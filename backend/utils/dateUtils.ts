/**
 * Calculate the recovery deadline date
 * @param fromDate - The date to calculate from (default: now)
 * @param days - Number of days for recovery period (default: 7)
 */
export const calculateRecoveryDeadline = (fromDate: Date = new Date(), days: number = 7): Date => {
  const deadline = new Date(fromDate);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
};

/**
 * Format date for display
 */
export const formatRecoveryDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculate days remaining until deadline
 */
export const daysRemainingUntilDeadline = (deadline: Date): number => {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if recovery period has expired
 */
export const hasRecoveryPeriodExpired = (deadline: Date): boolean => {
  return new Date() > new Date(deadline);
};
