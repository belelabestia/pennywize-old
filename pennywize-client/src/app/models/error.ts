export class Error {
  message: string;
  data: any;

  constructor(partial?: Partial<Error>) {
    Object.assign(this, partial);
  }
}
