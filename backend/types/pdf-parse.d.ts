declare module "pdf-parse" {
  export class PDFParse {
    constructor(options: { data: Buffer | Uint8Array });
    getText(params?: object): Promise<{ text: string; pages: any[] }>;
  }
}
