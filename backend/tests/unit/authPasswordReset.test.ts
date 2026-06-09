import { validatePasswordResetPayload } from '../../controller/authController';

describe('validatePasswordResetPayload', () => {
  it('rejects mismatched passwords', () => {
    expect(validatePasswordResetPayload('user@example.com', '123456', 'newpass123', 'different')).toEqual({
      ok: false,
      message: 'New password and confirmation do not match',
    });
  });

  it('rejects short passwords', () => {
    expect(validatePasswordResetPayload('user@example.com', '123456', '123', '123')).toEqual({
      ok: false,
      message: 'New password must be at least 6 characters',
    });
  });

  it('accepts valid payloads', () => {
    expect(validatePasswordResetPayload('user@example.com', '123456', 'newpass123', 'newpass123')).toEqual({ ok: true });
  });
});
