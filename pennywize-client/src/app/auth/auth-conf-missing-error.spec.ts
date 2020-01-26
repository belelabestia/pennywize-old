import { AuthConfMissingError } from './auth-conf-missing-error';

describe('AuthConfigMissingException', () => {
  it('should create an instance', () => {
    expect(new AuthConfMissingError()).toBeTruthy();
  });
});
