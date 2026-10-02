import { validatePasswordChangePayload } from '../../controller/authController';

describe('validatePasswordChangePayload', () => {
  it('rejects mismatched passwords', () => {
    expect(validatePasswordChangePayload('oldpass', 'newpass123', 'different')).toEqual({
      ok: false,
      message: 'New password and confirmation do not match',
    });
  });

  it('rejects short passwords', () => {
    expect(validatePasswordChangePayload('oldpass', '123', '123')).toEqual({
      ok: false,
      message: 'New password must be at least 6 characters',
    });
  });

  it('accepts valid payloads', () => {
    expect(validatePasswordChangePayload('oldpass', 'newpass123', 'newpass123')).toEqual({ ok: true });
  });
});
