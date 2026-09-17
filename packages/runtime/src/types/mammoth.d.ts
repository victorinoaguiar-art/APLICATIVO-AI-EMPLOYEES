declare module 'mammoth' {
  export interface RawTextResult {
    value: string;
    messages: Array<{ type: string; message: string; }>;
  }
  export function extractRawText(options: { buffer: Buffer }): Promise<RawTextResult>;
  export function convertToHtml(options: { buffer: Buffer }): Promise<{ value: string; messages: any[] }>;
}
