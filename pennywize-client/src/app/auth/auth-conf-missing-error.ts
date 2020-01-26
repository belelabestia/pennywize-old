export class AuthConfMissingError {
  toString() {
    return 'Configuration object missing; must call AuthService.configure() method before the AuthService.auth() method.';
  }
}
