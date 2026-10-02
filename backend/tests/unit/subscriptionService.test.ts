import { normalizeDbPlanToPlanKey } from '../../services/subscriptionService';

describe('normalizeDbPlanToPlanKey', () => {
  it('treats legacy ProMonthly values as Monthly', () => {
    expect(normalizeDbPlanToPlanKey('ProMonthly')).toBe('Monthly');
  });

  it('treats legacy ProYearly values as Yearly', () => {
    expect(normalizeDbPlanToPlanKey('ProYearly')).toBe('Yearly');
  });

  it('keeps canonical Free values as Free', () => {
    expect(normalizeDbPlanToPlanKey('Free')).toBe('Free');
  });
});
