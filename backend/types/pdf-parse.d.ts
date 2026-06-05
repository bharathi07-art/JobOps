declare module "pdf-parse" {
  interface PDFData {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
  }
  function pdfParse(dataBuffer: Buffer | Uint8Array, options?: object): Promise<PDFData>;
  export = pdfParse;
}
