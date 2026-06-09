import { isProActive } from '../../controller/emailAutomationController';

describe('isProActive', () => {
  it('allows legacy ProMonthly plans', () => {
    expect(isProActive('active', 'ProMonthly')).toBe(true);
  });

  it('allows lowercase monthly plans', () => {
    expect(isProActive('inactive', 'monthly')).toBe(true);
  });

  it('rejects free plans', () => {
    expect(isProActive('active', 'Free')).toBe(false);
  });
});
