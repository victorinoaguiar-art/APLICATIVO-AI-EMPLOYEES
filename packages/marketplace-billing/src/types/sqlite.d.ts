declare module 'node:sqlite' {
  export class DatabaseSync {
    constructor(location: string, options?: any);
    exec(sql: string): void;
    prepare(sql: string): any;
    close(): void;
  }
}
